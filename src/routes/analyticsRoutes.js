const express = require('express');
const rateLimit = require('express-rate-limit');
const { getUrlStats } = require('../controllers/analyticsController');
const { validateShortKey } = require('../middleware/validation');

const router = express.Router();

// Rate limiting for analytics
const analyticsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per window
  message: {
    error: 'Too many analytics requests',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Get URL statistics
router.get('/:shortKey', analyticsLimiter, validateShortKey, getUrlStats);

module.exports = router;
