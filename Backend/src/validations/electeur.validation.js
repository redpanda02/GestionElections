const Joi = require('joi');
const { options } = require('./base.validation');

const electeurValidation = {
  createElecteur: Joi.object({
    utilisateurId: Joi.number()
      .integer()
      .positive()
      .required(),
    numCarteIdentite: Joi.string()
      .pattern(/^[A-Z0-9]{13}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le numéro de carte d\'identité doit contenir 13 caractères alphanumériques'
      }),
    numCarteElecteur: Joi.string()
      .pattern(/^[A-Z0-9]{12}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le numéro de carte électeur doit contenir 12 caractères alphanumériques'
      }),
    dateNaissance: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': 'La date de naissance ne peut pas être dans le futur'
      }),
    lieuNaissance: Joi.string()
      .min(2)
      .max(100)
      .required(),
    sexe: Joi.string()
      .valid('M', 'F')
      .required(),
    bureauVote: Joi.string()
      .min(2)
      .max(100)
      .required()
  }).options(options),

  updateElecteur: Joi.object({
    lieuNaissance: Joi.string()
      .min(2)
      .max(100),
    bureauVote: Joi.string()
      .min(2)
      .max(100)
  }).options(options),

  verifierEligibilite: Joi.object({
    numCarteElecteur: Joi.string()
      .pattern(/^[A-Z0-9]{12}$/)
      .required(),
    numCarteIdentite: Joi.string()
      .pattern(/^[A-Z0-9]{13}$/)
      .required()
  }).options(options)
};

module.exports = electeurValidation; 