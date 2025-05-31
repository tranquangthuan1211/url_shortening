require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config');
const { initDatabase } = require('./src/config/database');
const CleanupService = require('./src/services/cleanupService');
const logger = require('./src/utils/logger');

const PORT = config.port;

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    
    // Start cleanup service
    CleanupService.start();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 URL Shortener Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`💾 Database: ${config.database.host}`);
      logger.info(`⚡ Redis: ${config.redis.host}:${config.redis.port}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();