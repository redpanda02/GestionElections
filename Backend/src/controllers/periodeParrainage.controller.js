const BaseController = require('./base.controller');
const { PeriodeParrainage, Parrainage } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class PeriodeParrainageController extends BaseController {
  constructor() {
    super(PeriodeParrainage, 'PeriodeParrainage');
    
    // Lier les méthodes héritées
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    
    // Lier les méthodes spécifiques
    this.getPeriodeActuelle = this.getPeriodeActuelle.bind(this);
    this.ouvrirPeriode = this.ouvrirPeriode.bind(this);
    this.fermerPeriode = this.fermerPeriode.bind(this);
  }

  async createPeriode(req, res, next) {
    try {
      // Vérifier s'il existe déjà une période active
      const periodeActive = await PeriodeParrainage.findOne({
        where: {
          etat: 'OUVERT',
          dateFin: { [Op.gt]: new Date() }
        }
      });

      if (periodeActive) {
        return next(new AppError('Une période de parrainage est déjà active', 400));
      }

      // Vérifier que la date de fin est postérieure à la date de début
      if (new Date(req.body.dateFin) <= new Date(req.body.dateDebut)) {
        return next(new AppError('La date de fin doit être postérieure à la date de début', 400));
      }

      const periode = await PeriodeParrainage.create({
        dateDebut: req.body.dateDebut,
        dateFin: req.body.dateFin,
        etat: 'FERME' // Par défaut, la période est créée fermée
      });

      res.status(201).json({
        status: 'success',
        data: periode
      });
    } catch (error) {
      logger.error('Erreur lors de la création de la période:', error);
      next(error);
    }
  }

  async getPeriodeActuelle(req, res, next) {
    try {
      const periode = await PeriodeParrainage.findOne({
        where: {
          dateDebut: {
            [Op.lte]: new Date()
          },
          dateFin: {
            [Op.gte]: new Date()
          }
        }
      });

      res.status(200).json({
        status: 'success',
        data: periode
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de la période actuelle:', error);
      next(error);
    }
  }

  async ouvrirPeriode(req, res, next) {
    try {
      const periode = await PeriodeParrainage.findByPk(req.params.id);
      
      if (!periode) {
        return next(new AppError('Période non trouvée', 404));
      }

      if (periode.estOuverte) {
        return next(new AppError('La période est déjà ouverte', 400));
      }

      await periode.update({ estOuverte: true });

      res.status(200).json({
        status: 'success',
        message: 'Période ouverte avec succès',
        data: periode
      });
    } catch (error) {
      logger.error('Erreur lors de l\'ouverture de la période:', error);
      next(error);
    }
  }

  async fermerPeriode(req, res, next) {
    try {
      const periode = await PeriodeParrainage.findByPk(req.params.id);
      
      if (!periode) {
        return next(new AppError('Période non trouvée', 404));
      }

      if (!periode.estOuverte) {
        return next(new AppError('La période est déjà fermée', 400));
      }

      await periode.update({ estOuverte: false });

      res.status(200).json({
        status: 'success',
        message: 'Période fermée avec succès',
        data: periode
      });
    } catch (error) {
      logger.error('Erreur lors de la fermeture de la période:', error);
      next(error);
    }
  }

  async getEtatPeriodeActuelle(req, res, next) {
    try {
      const periodeActuelle = await PeriodeParrainage.findOne({
        where: {
          dateDebut: { [Op.lte]: new Date() },
          dateFin: { [Op.gte]: new Date() }
        }
      });

      const etat = periodeActuelle ? {
        active: periodeActuelle.etat === 'OUVERT',
        dateDebut: periodeActuelle.dateDebut,
        dateFin: periodeActuelle.dateFin,
        etat: periodeActuelle.etat
      } : {
        active: false,
        message: 'Aucune période de parrainage en cours'
      };

      res.status(200).json({
        status: 'success',
        data: etat
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'état de la période:', error);
      next(error);
    }
  }

  async getStatistiques(req, res, next) {
    try {
      const periodeId = req.params.id;
      const periode = await PeriodeParrainage.findByPk(periodeId);

      if (!periode) {
        return next(new AppError('Période non trouvée', 404));
      }

      const stats = await Parrainage.findAll({
        where: { periodeId },
        attributes: [
          'statut',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['statut']
      });

      const totalParrainages = stats.reduce((acc, curr) => acc + parseInt(curr.total), 0);

      res.status(200).json({
        status: 'success',
        data: {
          periode,
          statistiques: {
            total: totalParrainages,
            parStatut: stats
          }
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      next(error);
    }
  }
}

module.exports = new PeriodeParrainageController(); 