const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const initializeRedis = () => {
  try {
    if (process.env.DISABLE_REDIS === 'true') {
      logger.info('Redis est désactivé par configuration');
      return null;
    }

    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Impossible de se connecter à Redis, fonctionnement en mode dégradé');
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger.warn('Erreur Redis:', err);
      if (!process.env.DISABLE_REDIS) {
        logger.info('Passage en mode sans Redis');
        process.env.DISABLE_REDIS = 'true';
      }
    });

    redisClient.on('connect', () => {
      logger.info('Connecté à Redis avec succès');
    });

    return redisClient;
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de Redis:', error);
    process.env.DISABLE_REDIS = 'true';
    return null;
  }
};

const getRedisClient = () => {
  if (process.env.DISABLE_REDIS === 'true') {
    return null;
  }
  return redisClient || initializeRedis();
};

const cache = {
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis Get Error', error);
      return null;
    }
  },

  async set(key, value, expireTime = 3600) {
    try {
      await redisClient.set(
        key,
        JSON.stringify(value),
        'EX',
        expireTime
      );
      return true;
    } catch (error) {
      logger.error('Redis Set Error', error);
      return false;
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis Delete Error', error);
      return false;
    }
  }
};

module.exports = {
  initializeRedis,
  getRedisClient,
  cache
}; 