const AppError = require('../AppError');

class AuthenticationError extends AppError {
  constructor(message = 'Non authentifié') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError; 