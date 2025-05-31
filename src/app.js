const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'url_shortener',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    ttl: parseInt(process.env.REDIS_TTL) || 3600
  },
  
  app: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    keyLength: parseInt(process.env.KEY_LENGTH) || 7,
    maxUrlLength: parseInt(process.env.MAX_URL_LENGTH) || 2048,
    defaultExpiration: parseInt(process.env.DEFAULT_EXPIRATION) || 86400
  },
  
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
};
