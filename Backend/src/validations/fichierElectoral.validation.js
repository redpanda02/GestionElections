const Joi = require('joi');
const { options } = require('./base.validation');

const fichierElectoralValidation = {
  uploadFichier: Joi.object({
    checksum: Joi.string()
      .pattern(/^[a-fA-F0-9]{64}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le checksum doit être une chaîne hexadécimale de 64 caractères'
      })
  }).options(options),

  filtrerFichiers: Joi.object({
    dateDebut: Joi.date(),
    dateFin: Joi.date()
      .min(Joi.ref('dateDebut'))
      .messages({
        'date.min': 'La date de fin doit être postérieure à la date de début'
      }),
    etatFichier: Joi.string()
      .valid('VALIDE', 'REJETE'),
    page: Joi.number()
      .integer()
      .min(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
  }).options(options)
};

module.exports = fichierElectoralValidation; 