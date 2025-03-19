const Redis = require('ioredis');
const logger = require('../config/logger.advanced');
const { promisify } = require('util');

class CacheService {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    this.subscriber = this.client.duplicate();
    this.setupEvents();
  }

  setupEvents() {
    this.client.on('error', (error) => {
      logger.error('Redis Error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });

    // Gestion de l'invalidation du cache distribuée
    this.subscriber.subscribe('cache-invalidation');
    this.subscriber.on('message', (channel, message) => {
      if (channel === 'cache-invalidation') {
        const { pattern } = JSON.parse(message);
        this.invalidatePattern(pattern);
      }
    });
  }

  async get(key, fetchFunction, options = {}) {
    const {
      ttl = 3600,
      forceRefresh = false,
      useStale = true
    } = options;

    try {
      if (!forceRefresh) {
        const cachedValue = await this.client.get(key);
        if (cachedValue) {
          return JSON.parse(cachedValue);
        }
      }

      // Si useStale est activé, on vérifie la valeur périmée pendant le rechargement
      let staleValue;
      if (useStale) {
        staleValue = await this.client.get(`stale:${key}`);
      }

      // Verrou distribué pour éviter les requêtes en cascade
      const lock = await this.acquireLock(`lock:${key}`);
      if (!lock && staleValue) {
        return JSON.parse(staleValue);
      }

      try {
        const value = await fetchFunction();
        await this.set(key, value, ttl);
        
        // Sauvegarde d'une copie pour utilisation en cas d'erreur
        await this.client.set(`stale:${key}`, JSON.stringify(value), 'EX', ttl * 2);
        
        return value;
      } finally {
        if (lock) {
          await this.releaseLock(`lock:${key}`);
        }
      }
    } catch (error) {
      logger.error('Cache error:', { error, key });
      if (staleValue) {
        return JSON.parse(staleValue);
      }
      throw error;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      logger.error('Cache set error:', { error, key });
    }
  }

  async invalidate(key) {
    try {
      await this.client.del(key);
      await this.client.publish('cache-invalidation', 
        JSON.stringify({ pattern: key })
      );
    } catch (error) {
      logger.error('Cache invalidation error:', { error, key });
    }
  }

  async invalidatePattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Pattern invalidation error:', { error, pattern });
    }
  }

  async acquireLock(lockKey, ttl = 5) {
    const token = Math.random().toString(36).substring(2);
    const acquired = await this.client.set(
      lockKey,
      token,
      'NX',
      'EX',
      ttl
    );
    return acquired ? token : false;
  }

  async releaseLock(lockKey, token) {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.client.eval(script, 1, lockKey, token);
  }

  async warmup(patterns) {
    try {
      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        for (const key of keys) {
          await this.get(key);
        }
      }
      logger.info('Cache warmup completed');
    } catch (error) {
      logger.error('Cache warmup error:', error);
    }
  }
}

module.exports = new CacheService(); 