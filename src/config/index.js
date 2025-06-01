require('dotenv').config();
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
    defaultExpiration: parseInt(process.env.DEFAULT_EXPIRATION) || 86400 // 24h
  },
  
  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100
  }
};