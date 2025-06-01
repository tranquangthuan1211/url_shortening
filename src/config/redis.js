const redis = require('redis');
const config = require('./index');
const logger = require('../utils/logger'); 

let client = null;

async function initRedis() {
  try {
    client = redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => {
          if (retries >= 3) return new Error('Retry attempts exhausted');
          return 100; // retry delay in ms
        }
      },
      password: config.redis.password,
    });

    client.on('error', (err) => {
      logger.error('❌ Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info('✅ Connected to Redis');
    });

    await client.connect(); // Redis v4 bắt buộc cần `connect()`
    return client;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    return null;
  }
}

initRedis().then(redisClient => {
  client = redisClient;
});

function getRedisClient() {
  return client;
}

module.exports = { initRedis, getRedisClient };
