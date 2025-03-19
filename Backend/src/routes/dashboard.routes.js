const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authorize } = require('../middlewares/auth.middleware');

router.get('/',
  authorize(['ADMIN']),
  DashboardController.getTableauBord
);

router.get('/candidat/:candidatId',
  authorize(['ADMIN', 'CANDIDAT']),
  DashboardController.getStatsCandidatDetail
);

module.exports = router; 