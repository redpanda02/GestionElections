const express = require('express');
const router = express.Router();
const { validateBody } = require('../middlewares/validation.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const periodeParrainageController = require('../controllers/periodeParrainage.controller');
const periodeParrainageValidation = require('../validations/periodeParrainage.validation');

// Routes publiques
router.get('/actuelle', periodeParrainageController.getPeriodeActuelle);

// Routes protégées pour l'administration
router.use(protect);
router.use(restrictTo('ADMIN'));

router.route('/')
  .get(periodeParrainageController.getAll)
  .post(validateBody(periodeParrainageValidation.createPeriode), periodeParrainageController.create);

router.route('/:id')
  .get(periodeParrainageController.getOne)
  .patch(validateBody(periodeParrainageValidation.updatePeriode), periodeParrainageController.update)
  .delete(periodeParrainageController.delete);

router.patch('/:id/ouvrir', periodeParrainageController.ouvrirPeriode);
router.patch('/:id/fermer', periodeParrainageController.fermerPeriode);

module.exports = router; 