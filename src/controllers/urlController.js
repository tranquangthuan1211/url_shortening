const UrlService = require('../services/urlService');
const logger = require('../utils/logger');

class UrlController {
  static async createUrl(req, res, next) {
    try {
      const { url, customKey, expiresIn, userId } = req.body;

      const result = await UrlService.createShortUrl({
        url,
        customKey,
        expiresIn,
        userId
      });

      logger.info(`Short URL created: ${result.shortKey} -> ${result.originalUrl}`);

      res.status(201).json({
        success: true,
        data: {
          shortKey: result.shortKey,
          shortUrl: result.shortUrl,
          originalUrl: result.originalUrl,
          expiresAt: result.expiresAt,
          createdAt: result.createdAt
        }
      });
    } catch (error) {
      logger.error('Create URL error:', error);
      next(error);
    }
  }

  static async redirectUrl(req, res, next) {
    try {
      const { shortKey } = req.params;

      const urlData = await UrlService.getOriginalUrl(shortKey);

      // Record click analytics (async)
      UrlService.recordClick(shortKey, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer')
      }).catch(err => logger.error('Click recording error:', err));

      // Redirect to original URL
      res.redirect(301, urlData.original_url);
    } catch (error) {
      if (error.message === 'Short URL not found') {
        return res.status(404).json({
          success: false,
          error: 'Short URL not found',
          message: 'The requested short URL does not exist or has been removed'
        });
      }

      if (error.message === 'Short URL has expired') {
        return res.status(410).json({
          success: false,
          error: 'Short URL expired',
          message: 'This short URL has expired and is no longer valid'
        });
      }

      logger.error('Redirect error:', error);
      next(error);
    }
  }

  static async deleteUrl(req, res, next) {
    try {
      const { shortKey } = req.params;

      await UrlService.deactivateUrl(shortKey);

      logger.info(`Short URL deactivated: ${shortKey}`);

      res.json({
        success: true,
        message: 'Short URL has been deactivated'
      });
    } catch (error) {
      if (error.message === 'Short URL not found') {
        return res.status(404).json({
          success: false,
          error: 'Short URL not found',
          message: 'The requested short URL does not exist'
        });
      }

      logger.error('Delete URL error:', error);
      next(error);
    }
  }
}

module.exports = UrlController;