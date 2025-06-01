const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error response
  let status = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  } else if (err.message === 'Invalid URL provided') {
    status = 400;
    message = 'Invalid URL provided';
  } else if (err.message === 'Custom key already exists') {
    status = 409;
    message = 'Custom key already exists';
  } else if (err.message === 'Short URL not found') {
    status = 404;
    message = 'Short URL not found';
  } else if (err.message === 'Short URL has expired') {
    status = 410;
    message = 'Short URL has expired';
  }

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};