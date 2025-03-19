const Joi = require('joi');
const { numCarteElecteur, codeAuthentification } = require('../custom.rules');

const parrainerSchema = Joi.object({
  candidatId: Joi.string().uuid().required(),
  codeAuthentification: codeAuthentification.required()
});

const retirerParrainageSchema = Joi.object({
  codeAuthentification: codeAuthentification.required()
});

const createParrainageSchema = Joi.object({
  electeurId: Joi.string().uuid().required(),
  candidatId: Joi.string().uuid().required(),
  periodeId: Joi.string().uuid().required()
});

const updateParrainageSchema = Joi.object({
  electeurId: Joi.string().uuid(),
  candidatId: Joi.string().uuid(),
  periodeId: Joi.string().uuid()
}).min(1);

const listByCandidatIdSchema = Joi.object({
  candidatId: Joi.string().uuid().required()
});

module.exports = {
  parrainer: parrainerSchema,
  retirerParrainage: retirerParrainageSchema,
  createParrainage: createParrainageSchema,
  updateParrainage: updateParrainageSchema,
  listByCandidatId: listByCandidatIdSchema
}; 