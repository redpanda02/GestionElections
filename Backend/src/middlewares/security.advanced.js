const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const crypto = require('crypto');
const cache = require('../config/redis');
const logger = require('../config/logger');

class SecurityMiddleware {
  static requestSignatureCheck(req, res, next) {
    try {
      const signature = req.headers['x-signature'];
      const timestamp = req.headers['x-timestamp'];
      const payload = JSON.stringify(req.body);
      
      if (!signature || !timestamp) {
        throw new Error('Signature ou timestamp manquant');
      }

      // Vérification de l'âge de la requête
      const requestAge = Date.now() - parseInt(timestamp);
      if (requestAge > 300000) { // 5 minutes
        throw new Error('Requête expirée');
      }

      // Vérification de la signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.API_SECRET)
        .update(`${timestamp}${payload}`)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Signature invalide');
      }

      next();
    } catch (error) {
      logger.warn('Échec de validation de signature', { error: error.message });
      res.status(401).json({ error: 'Requête non autorisée' });
    }
  }

  static async bruteForceProtection(req, res, next) {
    const key = `bruteforce:${req.ip}:${req.path}`;
    const attempts = await cache.get(key) || 0;

    if (attempts >= 5) {
      logger.warn('Tentative de force brute détectée', { ip: req.ip, path: req.path });
      return res.status(429).json({ error: 'Trop de tentatives, réessayez plus tard' });
    }

    await cache.set(key, attempts + 1, 3600); // expire après 1 heure
    next();
  }

  static inputSanitization(req, res, next) {
    const sanitizeValue = (value) => {
      if (typeof value === 'string') {
        // Suppression des caractères dangereux
        return value
          .replace(/<[^>]*>/g, '') // Supprime les balises HTML
          .replace(/[\\$'"]/g, '') // Supprime les caractères dangereux
          .trim();
      }
      return value;
    };

    const sanitizeObject = (obj) => {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = sanitizeValue(value);
        }
      }
      return sanitized;
    };

    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
  }

  static readonly(req, res, next) {
    if (process.env.MAINTENANCE_MODE === 'true' && req.method !== 'GET') {
      return res.status(503).json({
        error: 'Système en maintenance, seules les lectures sont autorisées'
      });
    }
    next();
  }

  // Rate limiting avancé avec différentes limites selon le type d'utilisateur
  static getRateLimiter(type) {
    const limits = {
      public: { windowMs: 15 * 60 * 1000, max: 100 },
      authenticated: { windowMs: 15 * 60 * 1000, max: 300 },
      admin: { windowMs: 15 * 60 * 1000, max: 1000 }
    };

    return rateLimit({
      windowMs: limits[type].windowMs,
      max: limits[type].max,
      message: 'Trop de requêtes, veuillez réessayer plus tard',
      handler: (req, res) => {
        logger.warn('Rate limit dépassé', {
          ip: req.ip,
          path: req.path,
          type
        });
        res.status(429).json({
          error: 'Trop de requêtes, veuillez réessayer plus tard'
        });
      }
    });
  }

  // Ralentissement progressif des requêtes
  static getSpeedLimiter() {
    return slowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: 100,
      delayMs: (hits) => hits * 100, // 100ms * nombre de requêtes
      maxDelayMs: 10000 // Maximum 10 secondes de délai
    });
  }

  // Validation des données structurées
  static validateStructuredData(schema) {
    return (req, res, next) => {
      try {
        const { error, value } = schema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));
          throw ApiError.badRequest('validation.failed', errors);
        }

        req.validatedData = value;
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}

module.exports = SecurityMiddleware; 