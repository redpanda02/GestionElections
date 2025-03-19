const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const candidatController = require('../controllers/candidat.controller');
const candidatValidation = require('../validations/candidat.validation');
const { upload } = require('../middlewares/upload.middleware');

// Routes publiques
router.get('/', candidatController.getAll);
router.get('/:id', candidatController.getOne);

// Routes protégées
router.use(protect);

// Routes pour les candidats
router.get('/me/parrainages', restrictTo('CANDIDAT'), candidatController.getMesParrainages);
router.get('/me/statistiques', restrictTo('CANDIDAT'), candidatController.getMesStatistiques);
router.post('/me/regenerer-code', restrictTo('CANDIDAT'), candidatController.regenererCode);

// Routes pour l'administration
router.use(restrictTo('ADMIN'));

// Gestion des candidats
router.route('/')
  .post(
    upload.single('photo'),
    validateBody(candidatValidation.createCandidat),
    candidatController.createCandidat
  );

router.route('/:id')
  .patch(
    upload.single('photo'),
    validateBody(candidatValidation.updateCandidat),
    candidatController.update
  )
  .delete(candidatController.delete);

// Validation des candidatures
router.post('/:id/valider', candidatController.validerCandidature);

module.exports = router; 