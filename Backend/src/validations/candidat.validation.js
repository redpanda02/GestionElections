const Joi = require('joi');
const { options } = require('./base.validation');

const candidatValidation = {
  createCandidat: Joi.object({
    numCarteElecteur: Joi.string()
      .pattern(/^[A-Z]{2}\d{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le numéro de carte électeur doit contenir 2 lettres suivies de 8 chiffres'
      }),
    nom: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne doit pas dépasser 100 caractères'
      }),
    prenom: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Le prénom doit contenir au moins 2 caractères',
        'string.max': 'Le prénom ne doit pas dépasser 100 caractères'
      }),
    dateNaissance: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': 'La date de naissance ne peut pas être dans le futur'
      }),
    parti: Joi.string()
      .min(2)
      .max(100)
      .allow('', null)
      .messages({
        'string.min': 'Le nom du parti doit contenir au moins 2 caractères',
        'string.max': 'Le nom du parti ne doit pas dépasser 100 caractères'
      }),
    slogan: Joi.string()
      .max(200)
      .allow('', null)
      .messages({
        'string.max': 'Le slogan ne doit pas dépasser 200 caractères'
      }),
    photo: Joi.string()
      .uri()
      .allow('', null)
      .messages({
        'string.uri': 'L\'URL de la photo doit être valide'
      }),
    couleurParti1: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'La couleur doit être au format hexadécimal (ex: #FF0000)'
      }),
    couleurParti2: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'La couleur doit être au format hexadécimal (ex: #FF0000)'
      }),
    couleurParti3: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'La couleur doit être au format hexadécimal (ex: #FF0000)'
      }),
    urlPagePersonnelle: Joi.string()
      .uri()
      .allow('', null)
      .messages({
        'string.uri': 'L\'URL de la page personnelle doit être valide'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'L\'adresse email doit être valide'
      }),
    telephone: Joi.string()
      .pattern(/^(\+221|00221)?[76|77|78|70|75]\d{7}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le numéro de téléphone doit être un numéro sénégalais valide'
      })
  }).options(options),

  updateCandidat: Joi.object({
    parti: Joi.string()
      .min(2)
      .max(100)
      .allow('', null)
      .messages({
        'string.min': 'Le nom du parti doit contenir au moins 2 caractères',
        'string.max': 'Le nom du parti ne doit pas dépasser 100 caractères'
      }),
    slogan: Joi.string()
      .max(200)
      .allow('', null)
      .messages({
        'string.max': 'Le slogan ne doit pas dépasser 200 caractères'
      }),
    photo: Joi.string()
      .uri()
      .allow('', null)
      .messages({
        'string.uri': 'L\'URL de la photo doit être valide'
      }),
    couleurParti1: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'La couleur doit être au format hexadécimal (ex: #FF0000)'
      }),
    couleurParti2: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'La couleur doit être au format hexadécimal (ex: #FF0000)'
      }),
    couleurParti3: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'La couleur doit être au format hexadécimal (ex: #FF0000)'
      }),
    urlPagePersonnelle: Joi.string()
      .uri()
      .allow('', null)
      .messages({
        'string.uri': 'L\'URL de la page personnelle doit être valide'
      }),
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'L\'adresse email doit être valide'
      }),
    telephone: Joi.string()
      .pattern(/^(\+221|00221)?[76|77|78|70|75]\d{7}$/)
      .messages({
        'string.pattern.base': 'Le numéro de téléphone doit être un numéro sénégalais valide'
      })
  }).options(options)
};

module.exports = candidatValidation; 