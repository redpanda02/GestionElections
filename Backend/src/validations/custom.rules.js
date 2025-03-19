const Joi = require('joi');

/**
 * Règle personnalisée pour valider un numéro de carte d'électeur
 */
const numCarteElecteur = Joi.string()
  .pattern(/^[A-Z0-9]{10}$/)
  .messages({
    'string.pattern.base': 'Le numéro de carte d\'électeur doit contenir 10 caractères alphanumériques'
  });

/**
 * Règle personnalisée pour valider un numéro de carte d'identité
 */
const numCarteIdentite = Joi.string()
  .pattern(/^[0-9]{13}$/)
  .messages({
    'string.pattern.base': 'Le numéro de carte d\'identité doit contenir 13 chiffres'
  });

/**
 * Règle personnalisée pour valider un numéro de téléphone
 */
const telephone = Joi.string()
  .pattern(/^(7[0-9]{8})$/)
  .messages({
    'string.pattern.base': 'Le numéro de téléphone doit être au format 7XXXXXXXX'
  });

/**
 * Règle personnalisée pour valider une région
 */
const region = Joi.string()
  .valid(
    'DAKAR',
    'DIOURBEL',
    'FATICK',
    'KAFFRINE',
    'KAOLACK',
    'KEDOUGOU',
    'KOLDA',
    'LOUGA',
    'MATAM',
    'SAINT-LOUIS',
    'SEDHIOU',
    'TAMBACOUNDA',
    'THIES',
    'ZIGUINCHOR'
  )
  .messages({
    'any.only': 'La région doit être une région valide du Sénégal'
  });

/**
 * Règle personnalisée pour valider un code d'authentification
 */
const codeAuthentification = Joi.string()
  .pattern(/^[A-Z0-9]{6}$/)
  .messages({
    'string.pattern.base': 'Le code d\'authentification doit contenir 6 caractères alphanumériques'
  });

module.exports = {
  numCarteElecteur,
  numCarteIdentite,
  telephone,
  region,
  codeAuthentification
}; 