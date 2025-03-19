const express = require('express');
const router = express.Router();

const utilisateurRoutes = require('./utilisateur.routes');
const candidatRoutes = require('./candidat.routes');
const electeurRoutes = require('./electeur.routes');
const parrainageRoutes = require('./parrainage.routes');
const fichierElectoralRoutes = require('./fichierElectoral.routes');
const periodeParrainageRoutes = require('./periodeParrainage.routes');

// Routes pour la santé de l'API
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Add auth routes prefix
router.use('/auth', utilisateurRoutes);  // Changed from '/utilisateurs' to '/auth'
router.use('/candidats', candidatRoutes);
router.use('/electeurs', electeurRoutes);
router.use('/parrainages', parrainageRoutes);
router.use('/fichiers', fichierElectoralRoutes);
router.use('/periodes', periodeParrainageRoutes);

module.exports = router;