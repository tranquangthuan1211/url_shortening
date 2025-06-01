const express = require('express');
const urlRoutes = require('./urlRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'URL Shortener'
  });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    service: 'URL Shortener API',
    version: '1.0.0',
    endpoints: {
      'POST /api/shorten': 'Create short URL',
      'GET /:shortKey': 'Redirect to original URL',
      'GET /api/stats/:shortKey': 'Get URL statistics',
      'DELETE /api/:shortKey': 'Deactivate URL',
      'GET /health': 'Health check'
    }
  });
});

// Mount routes
router.use('/api', urlRoutes);
router.use('/api/stats', analyticsRoutes);

module.exports = router;