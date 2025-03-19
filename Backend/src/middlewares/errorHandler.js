const logger = require('../config/logger');

/**
 * Middleware de gestion globale des erreurs
 */
const errorHandler = (err, req, res, next) => {
  // Log de l'erreur
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Déterminer le statut HTTP
  const statusCode = err.statusCode || 500;
  
  // Format de réponse d'erreur
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Erreur serveur interne',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  // Si c'est une erreur de validation, ajouter les détails
  if (err.name === 'ValidationError' && err.details) {
    errorResponse.error.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Wrapper pour gérer les erreurs asynchrones dans les contrôleurs
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };