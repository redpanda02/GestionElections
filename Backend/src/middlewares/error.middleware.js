const logger = require('../config/logger');
const AppError = require('../errors/AppError');

class ErrorHandler {
  static normalizeError(err) {
    return {
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal Server Error',
      type: err.type || 'general.serverError'
    };
  }
}

const handleError = (err, req, res, next) => {
  // Définir des valeurs par défaut
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Erreur interne du serveur';

  // Construire la réponse d'erreur
  const response = {
    status: 'error',
    message: err.message
  };

  // Inclure la stack trace en mode développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(err.statusCode).json(response);
};

module.exports = { handleError, ErrorHandler };