const Joi = require('joi');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const ValidationError = require('../errors/types/ValidationError');

const validate = (schema, location = 'body') => {
  return async (req, res, next) => {
    try {
      const options = {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      };

      const value = await schema.validateAsync(req[location], options);
      req[location] = value;
      next();
    } catch (error) {
      if (error.isJoi) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));
        next(new ValidationError('Erreur de validation', errors));
      } else {
        next(error);
      }
    }
  };
};

module.exports = {
  validate,
  validateBody: (schema) => validate(schema, 'body'),
  validateQuery: (schema) => validate(schema, 'query'),
  validateParams: (schema) => validate(schema, 'params')
}; 