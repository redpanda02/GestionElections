const Joi = require('joi');
const { options } = require('./base.validation');

const periodeParrainageValidation = {
  createPeriode: Joi.object({
    dateDebut: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'La date de début doit être dans le futur'
      }),
    dateFin: Joi.date()
      .min(Joi.ref('dateDebut'))
      .required()
      .messages({
        'date.min': 'La date de fin doit être postérieure à la date de début'
      })
  }).options(options),

  updatePeriode: Joi.object({
    dateDebut: Joi.date()
      .min('now'),
    dateFin: Joi.date()
      .min(Joi.ref('dateDebut'))
  }).options(options),

  filtrerPeriodes: Joi.object({
    etat: Joi.string()
      .valid('OUVERT', 'FERME'),
    dateDebut: Joi.date(),
    dateFin: Joi.date()
      .min(Joi.ref('dateDebut'))
      .messages({
        'date.min': 'La date de fin doit être postérieure à la date de début'
      }),
    page: Joi.number()
      .integer()
      .min(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
  }).options(options)
};

module.exports = periodeParrainageValidation; 