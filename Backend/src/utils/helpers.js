/**
 * Fonctions utilitaires communes
 */

const crypto = require('crypto');

/**
 * Génère un code aléatoire de la longueur spécifiée
 * @param {number} length Longueur du code à générer
 * @returns {string} Code généré
 */
const generateRandomCode = (length = 6) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
};

/**
 * Formate une date en chaîne ISO sans millisecondes
 * @param {Date} date Date à formater
 * @returns {string} Date formatée
 */
const formatDate = (date) => {
  return date.toISOString().split('.')[0] + 'Z';
};

/**
 * Vérifie si une chaîne est un UUID valide
 * @param {string} str Chaîne à vérifier
 * @returns {boolean} true si la chaîne est un UUID valide
 */
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Filtre un objet pour ne garder que certaines propriétés
 * @param {Object} obj Objet à filtrer
 * @param {string[]} allowedFields Champs autorisés
 * @returns {Object} Nouvel objet ne contenant que les champs autorisés
 */
const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

/**
 * Vérifie si une valeur est définie et non nulle
 * @param {any} value Valeur à vérifier
 * @returns {boolean} true si la valeur est définie et non nulle
 */
const isDefined = (value) => {
  return value !== undefined && value !== null;
};

module.exports = {
  generateRandomCode,
  formatDate,
  isUUID,
  filterObj,
  isDefined
}; 