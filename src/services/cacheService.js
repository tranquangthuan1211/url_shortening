const { getRedisClient } = require('../config/redis');
const config = require('../config');
const logger = require('../utils/logger');

class CacheService {
  static async get(key) {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, value, ttl = config.redis.ttl) {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  static async del(key) {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  static async exists(key) {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  static generateKey(prefix, identifier) {
    return `${prefix}:${identifier}`;
  }
}

module.exports = CacheService;