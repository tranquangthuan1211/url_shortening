const UrlModel = require('../models/urlModel');
const AnalyticsModel = require('../models/analyticsModel');
const CacheService = require('./cacheService');
const KeyGeneratorService = require('./keyGeneratorService');
const { isValidUrl } = require('../utils/validators');
const config = require('../config');

class UrlService {
  static async createShortUrl(urlData) {
    const { url, customKey, expiresIn, userId } = urlData;

    // Validate URL
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    let shortKey = customKey;

    // Handle custom key
    if (customKey) {
      const validation = KeyGeneratorService.validateCustomKey(customKey);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const exists = await UrlModel.checkKeyExists(customKey);
      if (exists) {
        throw new Error('Custom key already exists');
      }
    } else {
      shortKey = await KeyGeneratorService.generateUniqueKey();
    }

    // Calculate expiration
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    // Create URL record
    await UrlModel.create({
      shortKey,
      originalUrl: url,
      expiresAt,
      userId
    });

    return {
      shortKey,
      originalUrl: url,
      shortUrl: `${config.app.baseUrl}/${shortKey}`,
      expiresAt,
      createdAt: new Date()
    };
  }

  static async getOriginalUrl(shortKey) {
    // Try cache first
    const cacheKey = CacheService.generateKey('url', shortKey);
    let urlData = await CacheService.get(cacheKey);

    if (!urlData) {
      // Query database
      urlData = await UrlModel.findByShortKey(shortKey);
      
      if (!urlData) {
        throw new Error('Short URL not found');
      }

      // Cache the result
      await CacheService.set(cacheKey, urlData, 1800); // 30 minutes
    }

    // Check expiration
    if (urlData.expires_at && new Date() > new Date(urlData.expires_at)) {
      throw new Error('Short URL has expired');
    }

    return urlData;
  }

  static async recordClick(shortKey, requestData) {
    const { ip, userAgent, referer } = requestData;

    // Update click count (async)
    UrlModel.updateClickCount(shortKey).catch(err => 
      console.error('Click count update error:', err)
    );

    // Record analytics (async)
    AnalyticsModel.recordClick({
      shortKey,
      ipAddress: ip,
      userAgent,
      referer,
      country: null // Could integrate with IP geolocation service
    }).catch(err => 
      console.error('Analytics record error:', err)
    );
  }

  static async getStats(shortKey) {
    const stats = await AnalyticsModel.getUrlStats(shortKey);
    
    if (!stats) {
      throw new Error('Short URL not found');
    }

    return stats;
  }

  static async deactivateUrl(shortKey) {
    const success = await UrlModel.deactivate(shortKey);
    
    if (!success) {
      throw new Error('Short URL not found');
    }

    // Clear cache
    const cacheKey = CacheService.generateKey('url', shortKey);
    await CacheService.del(cacheKey);

    return true;
  }
}

module.exports = UrlService;