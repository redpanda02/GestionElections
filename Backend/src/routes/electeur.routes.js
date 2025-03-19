const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const electeurController = require('../controllers/electeur.controller');
const electeurValidation = require('../validations/electeur.validation');

// Routes publiques
router.post('/verifier-eligibilite', validateBody(electeurValidation.verifierEligibilite), electeurController.verifierEligibilite);

// Routes protégées
router.use(protect);

// Routes électeur
router.get('/me', restrictTo('ELECTEUR'), electeurController.getMonProfil);
router.get('/me/parrainage', restrictTo('ELECTEUR'), electeurController.getMonParrainage);

// Routes admin
router.use(restrictTo('ADMIN'));

router.route('/')
  .get(electeurController.getAll)
  .post(validateBody(electeurValidation.createElecteur), electeurController.create);

router.route('/:id')
  .get(electeurController.getOne)
  .patch(validateBody(electeurValidation.updateElecteur), electeurController.update)
  .delete(electeurController.delete);

module.exports = router; 