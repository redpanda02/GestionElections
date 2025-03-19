const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { upload, validateChecksum } = require('../middlewares/upload.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const fichierElectoralController = require('../controllers/fichierElectoral.controller');
const fichierValidation = require('../validations/fichierElectoral.validation');

// Routes protégées et restreintes à l'admin
router.use(protect);
router.use(restrictTo('ADMIN'));

router.post(
  '/upload',
  upload.single('file'),
  validateBody(fichierValidation.uploadFichier),
  validateChecksum,
  fichierElectoralController.uploadFichier
);

router.post('/valider',
  fichierElectoralController.validerImportation
);

router.get('/historique',
  fichierElectoralController.getHistoriqueUploads
);

router.get('/tentatives', 
  fichierElectoralController.getTentativesUpload
);

router.route('/:id')
  .get(fichierElectoralController.getFichier)
  .delete(fichierElectoralController.deleteFichier);

module.exports = router; 