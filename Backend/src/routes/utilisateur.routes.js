const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const utilisateurController = require('../controllers/utilisateur.controller');
const utilisateurValidation = require('../validations/utilisateur.validation');

// Routes publiques
router.post('/register', validate(utilisateurValidation.register), utilisateurController.register);
router.post('/login', validate(utilisateurValidation.login), utilisateurController.login);
router.post('/forgot-password', validate(utilisateurValidation.forgotPassword), utilisateurController.forgotPassword);
router.patch('/reset-password/:token', validate(utilisateurValidation.resetPassword), utilisateurController.resetPassword);

// Routes protégées
router.use(protect);

router.get('/me', utilisateurController.getMe);
router.patch('/update-me', validate(utilisateurValidation.updateMe), utilisateurController.updateMe);
router.patch('/update-password', validate(utilisateurValidation.updatePassword), utilisateurController.updatePassword);

// Routes admin
router.use(restrictTo('ADMIN'));

router.route('/')
  .get(utilisateurController.getAll)
  .post(validate(utilisateurValidation.register), utilisateurController.register);

router.route('/:id')
  .get(utilisateurController.getOne)
  .patch(validate(utilisateurValidation.updateMe), utilisateurController.update)
  .delete(utilisateurController.delete);

module.exports = router; 