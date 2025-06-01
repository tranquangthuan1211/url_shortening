const Joi = require('joi');
const { isValidShortKey } = require('../utils/validators');

// Validation schemas
const createUrlSchema = Joi.object({
  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .max(2048)
    .required()
    .messages({
      'string.uri': 'URL must be a valid HTTP or HTTPS URL',
      'string.max': 'URL must not exceed 2048 characters',
      'any.required': 'URL is required'
    }),
  
  customKey: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .optional()
    .messages({
      'string.min': 'Custom key must be at least 3 characters',
      'string.max': 'Custom key must not exceed 20 characters',
      'string.pattern.base': 'Custom key can only contain letters, numbers, hyphens, and underscores'
    }),
  
  expiresIn: Joi.number()
    .integer()
    .min(60) // Minimum 1 minute
    .max(31536000) // Maximum 1 year
    .optional()
    .messages({
      'number.min': 'Expiration must be at least 60 seconds',
      'number.max': 'Expiration must not exceed 1 year (31536000 seconds)'
    }),
  
  userId: Joi.string()
    .max(100)
    .optional()
});

const shortKeySchema = Joi.object({
  shortKey: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .messages({
      'string.min': 'Short key must be at least 3 characters',
      'string.max': 'Short key must not exceed 20 characters',
      'string.pattern.base': 'Invalid short key format',
      'any.required': 'Short key is required'
    })
});

// Middleware functions
function validateCreateUrl(req, res, next) {
  const { error, value } = createUrlSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    });
  }

  req.body = value;
  next();
}

function validateShortKey(req, res, next) {
  const { error, value } = shortKeySchema.validate(req.params, {
    abortEarly: false
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid short key format',
      message: error.details[0].message
    });
  }

  req.params = value;
  next();
}

module.exports = {
  validateCreateUrl,
  validateShortKey
};
