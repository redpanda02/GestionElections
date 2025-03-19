const BaseController = require('./base.controller');
const { FichierElectoral, TentativeUpload } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const fs = require('fs').promises;
const csv = require('csv-parser');
const { Readable } = require('stream');
const FichierElectoralService = require('../services/fichierElectoral.service');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `electeurs-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      cb(new Error('Format de fichier non supporté'), false);
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

class FichierElectoralController extends BaseController {
  constructor() {
    super(FichierElectoral, 'FichierElectoral');
    
    // Lier les méthodes héritées
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    
    // Lier les méthodes spécifiques
    this.uploadFichier = this.uploadFichier.bind(this);
    this.validerImportation = this.validerImportation.bind(this);
    this.getHistoriqueUploads = this.getHistoriqueUploads.bind(this);
    this.getTentativesUpload = this.getTentativesUpload.bind(this);
    this.getFichier = this.getFichier.bind(this);
    this.deleteFichier = this.deleteFichier.bind(this);
  }

  async uploadFichier(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      const { checksum } = req.body;
      if (!checksum) {
        throw new AppError('Checksum requis', 400);
      }

      const result = await FichierElectoralService.traiterFichier(
        req.file.path,
        checksum,
        req.user.id,
        req.ip
      );

      res.status(201).json({
        status: 'success',
        message: 'Fichier uploadé avec succès',
        data: result
      });
    } catch (error) {
      logger.error('Erreur lors de l\'upload du fichier:', error);
      next(error);
    }
  }

  async validerImportation(req, res, next) {
    try {
      const result = await FichierElectoralService.validerImportation(req.user.id);
      
      res.status(200).json({
        status: 'success',
        message: 'Importation validée avec succès',
        data: result
      });
    } catch (error) {
      logger.error('Erreur lors de la validation de l\'importation:', error);
      next(error);
    }
  }

  async getHistoriqueUploads(req, res, next) {
    try {
      const historique = await FichierElectoralService.getHistoriqueUploads(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: historique
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'historique:', error);
      next(error);
    }
  }

  async getTentativesUpload(req, res, next) {
    try {
      const tentatives = await TentativeUpload.findAll({
        include: [{
          model: FichierElectoral,
          as: 'fichier',
          attributes: ['nom', 'taille', 'dateUpload', 'statut']
        }],
        order: [['dateTentative', 'DESC']]
      });

      res.status(200).json({
        status: 'success',
        data: tentatives
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des tentatives:', error);
      next(error);
    }
  }

  async getFichier(req, res, next) {
    try {
      const fichier = await FichierElectoral.findByPk(req.params.id);
      
      if (!fichier) {
        return next(new AppError('Fichier non trouvé', 404));
      }

      res.status(200).json({
        status: 'success',
        data: fichier
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du fichier:', error);
      next(error);
    }
  }

  async deleteFichier(req, res, next) {
    try {
      const fichier = await FichierElectoral.findByPk(req.params.id);
      
      if (!fichier) {
        return next(new AppError('Fichier non trouvé', 404));
      }

      // Supprimer le fichier physique
      if (fichier.chemin) {
        try {
          await fs.unlink(fichier.chemin);
        } catch (error) {
          logger.warn('Erreur lors de la suppression du fichier physique:', error);
        }
      }

      // Supprimer l'enregistrement
      await fichier.destroy();

      res.status(200).json({
        status: 'success',
        message: 'Fichier supprimé avec succès'
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression du fichier:', error);
      next(error);
    }
  }
}

module.exports = new FichierElectoralController(); 