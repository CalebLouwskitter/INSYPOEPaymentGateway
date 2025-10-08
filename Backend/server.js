const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Backend API is running', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
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
  server.listen(PORT, () => {
    console.log(`🔒 Backend HTTPS server running on https://localhost:${PORT}`);
  });
} else {
  server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Backend HTTP server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
