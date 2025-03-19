const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { APIError } = require('../utils/errorHandler');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new APIError('Accès non autorisé - Token manquant', 401);
    }

    // Verify token
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Add user info to request
      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new APIError('Session expirée - Veuillez vous reconnecter', 401);
      }
      throw new APIError('Token invalide', 401);
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is a candidate
const isCandidate = (req, res, next) => {
  if (req.user.role !== 'candidate') {
    return next(new APIError('Accès réservé aux candidats', 403));
  }
  next();
};

// Middleware to check if user is a voter
const isVoter = (req, res, next) => {
  if (req.user.role !== 'voter') {
    return next(new APIError('Accès réservé aux électeurs', 403));
  }
  next();
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new APIError('Accès réservé aux administrateurs', 403));
  }
  next();
};

module.exports = {
  auth,
  isCandidate,
  isVoter,
  isAdmin
};
