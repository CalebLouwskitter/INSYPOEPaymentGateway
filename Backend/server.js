const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const https = require('node:https');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
require('dotenv').config();

const app = express();

// Import security middleware
const { securityMiddlewares } = require('./Middleware/securityMiddleware.js');
// Import logger middleware
const { loggerMiddleware } = require('./Middleware/loggerMiddleware.js');

// Import routes
const authRoutes = require('./Routes/Authrouting.js');
const paymentRoutes = require('./Routes/paymentRouting.js');
const testRoutes = require('./Routes/testRoutes.js');
const employeeRoutes = require('./Routes/employeeRoutes.js');

// Apply security middlewares
securityMiddlewares(app);
app.use(cookieParser());
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
});
app.use(csrfProtection);

// Enforce HTTPS when behind a proxy (e.g., Nginx) only in production
// or when explicitly enabled via FORCE_HTTPS=true
const FORCE_HTTPS = process.env.FORCE_HTTPS === 'true' || process.env.NODE_ENV === 'production';
app.use((req, res, next) => {
  if (!FORCE_HTTPS) return next();
  const xfProto = req.headers['x-forwarded-proto'];
  if (req.secure || xfProto === 'https') return next();
  if (req.method === 'GET' || req.method === 'HEAD') {
    return res.status(426).json({
      error: 'HTTPS required',
      message: 'Please repeat the request over HTTPS.',
    });
  }
  return res.status(400).json({ error: 'Please use HTTPS' });
});

// Additional Middleware (limits are set in security middleware)

// Body Logging, SET TO FALSE IN PRODUCTION
const LOG_BODIES = process.env.LOG_REQUEST_BODY === 'false' ? false : true;
app.use(loggerMiddleware({ logBodies: LOG_BODIES }));

// Add a morgan token for request id & concise combined log line
morgan.token('id', (req) => req.id || '-');
const morganFormat = ':id :method :url :status :response-time ms - :res[content-length]';
app.use(morgan(morganFormat));

// MongoDB Connection using top-level await
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
// Avoid implicit DB connection during tests; tests manage connection lifecycle themselves
if (process.env.NODE_ENV !== 'test') {
  connectMongoDB();
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
app.get('/api/v1/csrf-token', (req, res) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  });
  res.status(200).json({ csrfToken: token });
});

app.get('/api/v1', (req, res) => {
  res.json({ message: 'Backend API is running', version: '1.0.0' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/employee', employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  // Structured error log including correlation id
  console.error(`[ERR] id=${req.id || '-'} message="${err.message}" stack="${err.stack}"`);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Something went wrong', requestId: req.id });
});

const PORT = process.env.PORT || 5000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// SSL Certificate paths
const certPath = path.join(__dirname, '..', 'certs', 'localhost+2.pem');
const keyPath = path.join(__dirname, '..', 'certs', 'localhost+2-key.pem');

// Create server based on HTTPS configuration
let server;

if (USE_HTTPS && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const httpsOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };
  
  server = https.createServer(httpsOptions, app);
  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
      console.log(`🔒 Backend HTTPS server running on https://localhost:${PORT}`);
      console.log(`📡 API Base URL: https://localhost:${PORT}/api/v1`);
    });
  }
} else {
  server = http.createServer(app);
  if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
      console.log(`Backend HTTP server running on http://localhost:${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
    });
  }
}
module.exports = app;
