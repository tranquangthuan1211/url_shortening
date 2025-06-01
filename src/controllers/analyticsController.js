const UrlService = require('../services/urlService');
const logger = require('../utils/logger');

class AnalyticsController {
  static async getUrlStats(req, res, next) {
    try {
      const { shortKey } = req.params;

      const stats = await UrlService.getStats(shortKey);

      res.json({
        success: true,
        data: {
          shortKey,
          originalUrl: stats.original_url,
          createdAt: stats.created_at,
          expiresAt: stats.expires_at,
          totalClicks: stats.click_count,
          isActive: stats.is_active,
          analytics: {
            dailyStats: stats.dailyStats || [],
            recentClicks: stats.recentClicks || [],
            topReferrers: stats.topReferrers || []
          }
        }
      });
    } catch (error) {
      if (error.message === 'Short URL not found') {
        return res.status(404).json({
          success: false,
          error: 'Short URL not found',
          message: 'The requested short URL does not exist'
        });
      }

      logger.error('Get stats error:', error);
      next(error);
    }
  }
}

module.exports = AnalyticsController;
