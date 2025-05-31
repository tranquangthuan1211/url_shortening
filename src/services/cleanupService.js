const UrlModel = require('../models/urlModel');
const logger = require('../utils/logger');

class CleanupService {
  static async cleanExpiredUrls() {
    try {
      logger.info('🧹 Running cleanup service...');
      
      const affectedRows = await UrlModel.deactivateExpired();

      if (affectedRows > 0) {
        logger.info(`✅ Disabled ${affectedRows} expired URLs`);
      } else {
        logger.info('ℹ️ No expired URLs found');
      }
    } catch (error) {
      logger.error('❌ Cleanup service error:', error);
    }
  }

  static start() {
    // Run cleanup every hour
    const intervalId = setInterval(this.cleanExpiredUrls, 60 * 60 * 1000);
    
    // Run cleanup on startup
    this.cleanExpiredUrls();

    logger.info('🚀 Cleanup service started');
    
    return intervalId;
  }

  static stop(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
      logger.info('🛑 Cleanup service stopped');
    }
  }
}

module.exports = CleanupService;