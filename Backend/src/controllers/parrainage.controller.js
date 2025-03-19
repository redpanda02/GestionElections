const BaseController = require('./base.controller');
const { Parrainage, Candidat, Electeur, PeriodeParrainage, Utilisateur } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const { Op } = require('sequelize');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const ParrainageService = require('../services/parrainage.service');
const sequelize = require('sequelize');

class ParrainageController extends BaseController {
  constructor() {
    super(Parrainage, 'Parrainage');
    
    // Lier les méthodes héritées
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    
    // Lier les méthodes spécifiques
    this.parrainer = this.parrainer.bind(this);
    this.retirerParrainage = this.retirerParrainage.bind(this);
    this.getStatistiquesGlobales = this.getStatistiquesGlobales.bind(this);
    this.getStatistiquesParRegion = this.getStatistiquesParRegion.bind(this);
    this.getStatistiquesParCandidat = this.getStatistiquesParCandidat.bind(this);
    this.getParrainagesByCandidat = this.getParrainagesByCandidat.bind(this);
  }

  async parrainer(req, res, next) {
    try {
      const { candidatId } = req.body;
      const electeurId = req.user.electeur.id;

      // Vérifier si la période de parrainage est ouverte
      const periodeActive = await PeriodeParrainage.findOne({
        where: {
          estOuverte: true,
          dateDebut: {
            [Op.lte]: new Date()
          },
          dateFin: {
            [Op.gte]: new Date()
          }
        }
      });

      if (!periodeActive) {
        return next(new AppError('La période de parrainage n\'est pas ouverte', 403));
      }

      // Vérifier si l'électeur a déjà parrainé
      const parrainageExistant = await Parrainage.findOne({
        where: { electeurId }
      });

      if (parrainageExistant) {
        return next(new AppError('Vous avez déjà parrainé un candidat', 400));
      }

      // Créer le parrainage
      const parrainage = await Parrainage.create({
        electeurId,
        candidatId,
        periodeId: periodeActive.id,
        dateParrainage: new Date()
      });

      res.status(201).json({
        status: 'success',
        message: 'Parrainage enregistré avec succès',
        data: parrainage
      });
    } catch (error) {
      logger.error('Erreur lors du parrainage:', error);
      next(error);
    }
  }

  async retirerParrainage(req, res, next) {
    try {
      const electeurId = req.user.electeur.id;

      // Vérifier si la période de parrainage est ouverte
      const periodeActive = await PeriodeParrainage.findOne({
        where: {
          estOuverte: true,
          dateDebut: {
            [Op.lte]: new Date()
          },
          dateFin: {
            [Op.gte]: new Date()
          }
        }
      });

      if (!periodeActive) {
        return next(new AppError('La période de parrainage n\'est pas ouverte', 403));
      }

      // Vérifier si l'électeur a un parrainage actif
      const parrainage = await Parrainage.findOne({
        where: { electeurId }
      });

      if (!parrainage) {
        return next(new AppError('Vous n\'avez pas de parrainage actif', 404));
      }

      // Supprimer le parrainage
      await parrainage.destroy();

      res.status(200).json({
        status: 'success',
        message: 'Parrainage retiré avec succès'
      });
    } catch (error) {
      logger.error('Erreur lors du retrait du parrainage:', error);
      next(error);
    }
  }

  async getStatistiquesGlobales(req, res, next) {
    try {
      const stats = await Parrainage.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('candidatId')), 'totalParCandidats']
        ],
        group: ['candidatId'],
        include: [{
          model: Candidat,
          attributes: ['nomParti']
        }]
      });

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques globales:', error);
      next(error);
    }
  }

  async getStatistiquesParRegion(req, res, next) {
    try {
      const stats = await Parrainage.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        include: [{
          model: Electeur,
          attributes: ['region']
        }],
        group: ['Electeur.region']
      });

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques par région:', error);
      next(error);
    }
  }

  async getStatistiquesParCandidat(req, res, next) {
    try {
      const { candidatId } = req.params;

      const stats = await Parrainage.findAll({
        where: { candidatId },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        include: [{
          model: Electeur,
          attributes: ['region']
        }],
        group: ['Electeur.region']
      });

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques par candidat:', error);
      next(error);
    }
  }

  async getParrainagesByCandidat(req, res, next) {
    try {
      const { id: candidatId } = req.params;

      const parrainages = await Parrainage.findAll({
        where: { candidatId },
        include: [{
          model: Electeur,
          attributes: ['numCarteElecteur', 'region'],
          include: [{
            model: Utilisateur,
            attributes: ['nom', 'prenom']
          }]
        }],
        order: [['dateParrainage', 'DESC']]
      });

      res.status(200).json({
        status: 'success',
        results: parrainages.length,
        data: parrainages
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des parrainages du candidat:', error);
      next(error);
    }
  }
}

module.exports = new ParrainageController(); 