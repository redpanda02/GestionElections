const AppError = require('../AppError');

class ValidationError extends AppError {
  constructor(message, errors) {
    super('VALIDATION_ERROR', message, 400, errors);
    this.name = 'ValidationError';
  }
}

module.exports = ValidationError; 