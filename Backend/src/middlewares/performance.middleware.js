const compression = require('compression');
const { promisify } = require('util');
const cache = require('../services/cache.service');
const logger = require('../config/logger.advanced');

class PerformanceMiddleware {
  static compression() {
    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6
    });
  }

  static async cacheRoute(req, res, next) {
    const key = `route:${req.originalUrl}`;
    
    try {
      const cachedResponse = await cache.get(key);
      if (cachedResponse) {
        res.json(cachedResponse);
        return;
      }

      // Intercepte la réponse pour la mettre en cache
      const originalJson = res.json;
      res.json = function(body) {
        cache.set(key, body);
        originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache route error:', error);
      next();
    }
  }

  static async conditionalGet(req, res, next) {
    const etag = req.headers['if-none-match'];
    const lastModified = req.headers['if-modified-since'];

    if (etag || lastModified) {
      const key = `etag:${req.originalUrl}`;
      const cached = await cache.get(key);

      if (cached) {
        if (etag && etag === cached.etag) {
          res.status(304).end();
          return;
        }
        if (lastModified && new Date(lastModified) >= new Date(cached.lastModified)) {
          res.status(304).end();
          return;
        }
      }
    }

    next();
  }

  static queryOptimizer(req, res, next) {
    // Optimisation des requêtes avec des paramètres
    if (Object.keys(req.query).length > 0) {
      // Tri des paramètres pour la cohérence du cache
      const sortedQuery = {};
      Object.keys(req.query).sort().forEach(key => {
        sortedQuery[key] = req.query[key];
      });
      req.query = sortedQuery;
    }

    next();
  }

  static responseOptimizer(req, res, next) {
    // Optimisation de la taille des réponses
    const originalJson = res.json;
    res.json = function(obj) {
      // Suppression des champs null ou undefined
      const cleanObj = JSON.parse(JSON.stringify(obj, (key, value) => {
        if (value === null || value === undefined) {
          return undefined;
        }
        return value;
      }));

      return originalJson.call(this, cleanObj);
    };

    next();
  }

  static async batchRequests(req, res, next) {
    if (req.path === '/batch' && req.method === 'POST') {
      const requests = req.body.requests;
      if (!Array.isArray(requests)) {
        return res.status(400).json({ error: 'Invalid batch request format' });
      }

      try {
        const results = await Promise.all(
          requests.map(async request => {
            const response = await fetch(`${req.protocol}://${req.get('host')}${request.path}`, {
              method: request.method || 'GET',
              headers: {
                ...request.headers,
                'Authorization': req.headers.authorization
              },
              body: request.body ? JSON.stringify(request.body) : undefined
            });

            return {
              status: response.status,
              data: await response.json()
            };
          })
        );

        res.json({ results });
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  }
}

module.exports = PerformanceMiddleware; 