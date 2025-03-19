const { body } = require('express-validator');

exports.validateSignup = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Le nom complet est requis'),
  body('cni')
    .trim()
    .notEmpty()
    .withMessage('Le numéro CNI est requis'),
  body('nce')
    .trim()
    .notEmpty()
    .withMessage('Le numéro NCE est requis'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role')
    .isIn(['candidate', 'voter'])
    .withMessage('Le rôle doit être soit candidate soit voter')
];

exports.validateLogin = [
  body('cni')
    .trim()
    .notEmpty()
    .withMessage('Le numéro CNI est requis'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
  body('role')
    .isIn(['candidate', 'voter'])
    .withMessage('Le rôle doit être soit candidate soit voter')
];