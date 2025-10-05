const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Proxy endpoint to backend
app.use('/api', async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${BACKEND_URL}${req.url}`,
      data: req.body,
      headers: {
        ...req.headers,
        host: new URL(BACKEND_URL).host,
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'Middleware proxy error',
      message: error.message,
    });
  }
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Middleware server running on port ${PORT}`);
});

module.exports = app;
