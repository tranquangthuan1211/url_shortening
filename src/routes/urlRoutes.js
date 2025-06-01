const express = require('express');
const rateLimit = require('express-rate-limit');
const { createUrl, redirectUrl, deleteUrl } = require('../controllers/urlController');
const { validateCreateUrl, validateShortKey } = require('../middleware/validation');
const config = require('../config');

const router = express.Router();

// Rate limiting for URL creation (more restrictive)
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    error: 'Too many URL creation requests',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for redirects (less restrictive)
const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many redirect requests',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create short URL
router.post('/shorten', createLimiter, validateCreateUrl, createUrl);

// Deactivate URL
router.delete('/:shortKey', validateShortKey, deleteUrl);

// Redirect endpoint (mounted on root router for clean URLs)
router.get('/:shortKey', redirectLimiter, validateShortKey, redirectUrl);

module.exports = router;