const Joi = require('joi');
const { options } = require('./base.validation');

const utilisateurValidation = {
  register: Joi.object({
    nom: Joi.string()
      .min(2)
      .max(50)
      .required(),
    prenom: Joi.string()
      .min(2)
      .max(50)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    motDePasse: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
      }),
    confirmMotDePasse: Joi.string()
      .valid(Joi.ref('motDePasse'))
      .required()
      .messages({
        'any.only': 'Les mots de passe ne correspondent pas'
      }),
    role: Joi.string()
      .valid('ADMIN', 'CANDIDAT', 'ELECTEUR')
      .required()
  }).options(options),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required(),
    motDePasse: Joi.string()
      .required()
  }).options(options),

  updateMe: Joi.object({
    nom: Joi.string()
      .min(2)
      .max(50),
    prenom: Joi.string()
      .min(2)
      .max(50),
    email: Joi.string()
      .email()
  }).options(options),

  updatePassword: Joi.object({
    motDePasseActuel: Joi.string()
      .required(),
    nouveauMotDePasse: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required(),
    confirmMotDePasse: Joi.string()
      .valid(Joi.ref('nouveauMotDePasse'))
      .required()
  }).options(options),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
  }).options(options),

  resetPassword: Joi.object({
    token: Joi.string()
      .required(),
    nouveauMotDePasse: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required(),
    confirmMotDePasse: Joi.string()
      .valid(Joi.ref('nouveauMotDePasse'))
      .required()
  }).options(options)
};

module.exports = utilisateurValidation; 