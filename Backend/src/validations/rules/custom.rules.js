const Joi = require('joi');

const customRules = {
  numCarteElecteur: Joi.string()
    .pattern(/^[A-Z]{2}\d{8}$/)
    .message('Le numéro de carte électeur doit être au format XX99999999'),

  numCarteIdentite: Joi.string()
    .pattern(/^[0-9]{13}$/)
    .message('Le numéro de carte d\'identité doit contenir 13 chiffres'),

  telephone: Joi.string()
    .pattern(/^(\+221|00221)?[76|77|78|70|75]\d{7}$/)
    .message('Le numéro de téléphone doit être un numéro sénégalais valide'),

  codeAuthentification: Joi.string()
    .pattern(/^[A-Z0-9]{6}$/)
    .message('Le code d\'authentification doit contenir 6 caractères alphanumériques'),

  codeVerification: Joi.string()
    .pattern(/^[A-Z0-9]{8}$/)
    .message('Le code de vérification doit contenir 8 caractères alphanumériques'),

  region: Joi.string()
    .valid(
      'DAKAR', 'DIOURBEL', 'FATICK', 'KAFFRINE', 'KAOLACK',
      'KEDOUGOU', 'KOLDA', 'LOUGA', 'MATAM', 'SAINT-LOUIS',
      'SEDHIOU', 'TAMBACOUNDA', 'THIES', 'ZIGUINCHOR'
    )
    .message('La région spécifiée n\'est pas valide')
};

module.exports = customRules; 