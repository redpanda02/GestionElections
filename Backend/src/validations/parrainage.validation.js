const Joi = require('joi');
const { options } = require('./base.validation');

const parrainageValidation = {
  creerParrainage: Joi.object({
    candidatId: Joi.number()
      .integer()
      .positive()
      .required(),
    codeAuthentification: Joi.string()
      .length(8)
      .required()
      .messages({
        'string.length': 'Le code d\'authentification doit contenir exactement 8 caractères'
      })
  }).options(options),

  verifierCode: Joi.object({
    code: Joi.string()
      .length(6)
      .required()
      .messages({
        'string.length': 'Le code de vérification doit contenir exactement 6 caractères'
      })
  }).options(options),

  updateParrainage: Joi.object({
    statut: Joi.string()
      .valid('EN_ATTENTE', 'VALIDE', 'REJETE')
      .required()
  }).options(options),

  filtrerParrainages: Joi.object({
    dateDebut: Joi.date(),
    dateFin: Joi.date()
      .min(Joi.ref('dateDebut'))
      .messages({
        'date.min': 'La date de fin doit être postérieure à la date de début'
      }),
    statut: Joi.string()
      .valid('EN_ATTENTE', 'VALIDE', 'REJETE'),
    candidatId: Joi.number()
      .integer()
      .positive(),
    page: Joi.number()
      .integer()
      .min(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
  }).options(options)
};

module.exports = parrainageValidation; 