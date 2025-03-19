const Joi = require('joi');

// Messages d'erreur personnalisés en français
const messages = {
  'string.base': 'Le champ {#label} doit être une chaîne de caractères',
  'string.empty': 'Le champ {#label} ne peut pas être vide',
  'string.min': 'Le champ {#label} doit avoir au moins {#limit} caractères',
  'string.max': 'Le champ {#label} ne peut pas dépasser {#limit} caractères',
  'string.email': 'Le champ {#label} doit être une adresse email valide',
  'number.base': 'Le champ {#label} doit être un nombre',
  'number.min': 'Le champ {#label} doit être supérieur ou égal à {#limit}',
  'number.max': 'Le champ {#label} doit être inférieur ou égal à {#limit}',
  'date.base': 'Le champ {#label} doit être une date valide',
  'date.greater': 'Le champ {#label} doit être postérieur à {#limit}',
  'date.less': 'Le champ {#label} doit être antérieur à {#limit}',
  'any.required': 'Le champ {#label} est obligatoire',
  'any.only': 'Le champ {#label} doit être l\'une des valeurs suivantes : {#valids}',
  'object.base': 'Le champ {#label} doit être un objet',
  'array.base': 'Le champ {#label} doit être un tableau'
};

// Options de validation par défaut
const options = {
  abortEarly: false,
  messages,
  errors: {
    wrap: {
      label: '"'
    }
  }
};

module.exports = {
  options,
  messages
}; 