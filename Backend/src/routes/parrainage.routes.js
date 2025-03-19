const express = require('express');
const router = express.Router();
const { validateBody, validateParams } = require('../middlewares/validation.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const parrainageController = require('../controllers/parrainage.controller');
const parrainageSchema = require('../validations/schemas/parrainage.schema');
const PerformanceMiddleware = require('../middlewares/performance.middleware');

// Routes protégées
router.use(protect);

// Routes pour les électeurs
router.post('/parrainer', 
  restrictTo('ELECTEUR'),
  validateBody(parrainageSchema.parrainer),
  parrainageController.parrainer
);

router.post('/retirer', 
  restrictTo('ELECTEUR'),
  validateBody(parrainageSchema.retirerParrainage),
  parrainageController.retirerParrainage
);

// Routes pour l'administration
router.use(restrictTo('ADMIN'));

router.route('/')
  .get(parrainageController.getAll)
  .post(validateBody(parrainageSchema.createParrainage), parrainageController.create);

router.route('/:id')
  .get(parrainageController.getOne)
  .patch(validateBody(parrainageSchema.updateParrainage), parrainageController.update)
  .delete(parrainageController.delete);

// Statistiques
router.get('/statistiques/globales', parrainageController.getStatistiquesGlobales);
router.get('/statistiques/par-region', parrainageController.getStatistiquesParRegion);
router.get('/statistiques/par-candidat/:candidatId', 
  validateParams(parrainageSchema.listByCandidatId),
  parrainageController.getStatistiquesParCandidat
);

// Routes avec cache
router.get('/statistiques',
  PerformanceMiddleware.conditionalGet,
  PerformanceMiddleware.cacheRoute,
  parrainageController.getStatistiquesGlobales
);

router.get('/candidat/:id/parrainages',
  validateParams(parrainageSchema.listByCandidatId),
  PerformanceMiddleware.queryOptimizer,
  PerformanceMiddleware.cacheRoute,
  parrainageController.getParrainagesByCandidat
);

// Route de traitement par lots
router.post('/batch',
  PerformanceMiddleware.batchRequests
);

module.exports = router; 