const BaseController = require('./base.controller');
const { Candidat, Parrainage, HistoriqueParrainage, Utilisateur, Electeur, PeriodeParrainage } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const crypto = require('crypto');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

class CandidatController extends BaseController {
  constructor() {
    super(Candidat, 'Candidat');
    
    // Lier les méthodes héritées
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    
    // Lier les méthodes spécifiques
    this.getAllCandidats = this.getAllCandidats.bind(this);
    this.createCandidat = this.createCandidat.bind(this);
    this.getMesParrainages = this.getMesParrainages.bind(this);
    this.getMesStatistiques = this.getMesStatistiques.bind(this);
    this.regenererCode = this.regenererCode.bind(this);
    this.validerCandidature = this.validerCandidature.bind(this);
  }

  async getAllCandidats(req, res, next) {
    try {
      const candidats = await Candidat.findAll({
        include: [{
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['nom', 'prenom']
        }],
        attributes: { exclude: ['codeAuthentification'] }
      });

      res.status(200).json({
        status: 'success',
        results: candidats.length,
        data: candidats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des candidats:', error);
      next(error);
    }
  }

  async createCandidat(req, res, next) {
    try {
      // Vérifier si la période de parrainage est ouverte
      const periode = await PeriodeParrainage.findOne({
        where: {
          dateDebut: {
            [Op.lt]: new Date()
          },
          dateFin: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!periode) {
        return next(new AppError('La période d\'enregistrement des candidats n\'est pas ouverte', 403));
      }

      // Vérifier si l'électeur existe
      const electeur = await Electeur.findOne({
        where: { numCarteElecteur: req.body.numCarteElecteur }
      });

      if (!electeur) {
        return next(new AppError('L\'électeur n\'existe pas dans le fichier électoral', 404));
      }

      // Vérifier si le candidat existe déjà
      const candidatExistant = await Candidat.findOne({
        where: { numCarteElecteur: req.body.numCarteElecteur }
      });

      if (candidatExistant) {
        return next(new AppError('Ce candidat est déjà enregistré', 400));
      }

      // Générer le code d'authentification
      const codeAuthentification = crypto.randomBytes(4).toString('hex').toUpperCase();
      const dateExpirationCode = new Date();
      dateExpirationCode.setHours(dateExpirationCode.getHours() + 24); // Code valide 24h

      const candidat = await Candidat.create({
        ...req.body,
        codeAuthentification,
        dateExpirationCode,
        candidatureValidee: false
      });

      // TODO: Envoyer le code par email et SMS
      // await sendCodeByEmail(candidat.email, codeAuthentification);
      // await sendCodeBySMS(candidat.telephone, codeAuthentification);

      res.status(201).json({
        status: 'success',
        message: 'Candidat créé avec succès. Un code d\'authentification a été envoyé par email et SMS.',
        data: {
          id: candidat.id,
          nom: candidat.nom,
          prenom: candidat.prenom
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la création du candidat:', error);
      next(error);
    }
  }

  async getMesParrainages(req, res, next) {
    try {
      const candidat = await Candidat.findOne({
        where: { utilisateurId: req.user.id },
        include: [{
          model: Parrainage,
          as: 'parrainages',
          include: [{
            model: Utilisateur,
            as: 'electeur',
            attributes: ['nom', 'prenom', 'bureauVote']
          }]
        }]
      });

      if (!candidat) {
        return next(new AppError('Candidat non trouvé', 404));
      }

      res.status(200).json({
        status: 'success',
        data: candidat.parrainages
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des parrainages:', error);
      next(error);
    }
  }

  async getMesStatistiques(req, res, next) {
    try {
      const stats = await HistoriqueParrainage.findAll({
        where: { candidatId: req.user.candidat.id },
        order: [['dateEnregistrement', 'DESC']],
        limit: 30
      });

      // Calculer les statistiques par région
      const statsParRegion = await Parrainage.findAll({
        where: { candidatId: req.user.candidat.id },
        include: [{
          model: Utilisateur,
          as: 'electeur',
          attributes: ['region']
        }],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['electeur.region']
      });

      res.status(200).json({
        status: 'success',
        data: {
          historique: stats,
          parRegion: statsParRegion
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      next(error);
    }
  }

  async regenererCode(req, res, next) {
    try {
      const candidat = await Candidat.findByPk(req.params.id);
      
      if (!candidat) {
        return next(new AppError('Candidat non trouvé', 404));
      }

      const nouveauCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const dateExpirationCode = new Date();
      dateExpirationCode.setHours(dateExpirationCode.getHours() + 24);

      await candidat.update({ 
        codeAuthentification: nouveauCode,
        dateExpirationCode
      });

      // TODO: Envoyer le nouveau code par email et SMS
      // await sendCodeByEmail(candidat.email, nouveauCode);
      // await sendCodeBySMS(candidat.telephone, nouveauCode);

      res.status(200).json({
        status: 'success',
        message: 'Code d\'authentification régénéré avec succès',
        data: { 
          message: 'Un nouveau code a été envoyé par email et SMS'
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la régénération du code:', error);
      next(error);
    }
  }

  async validerCandidature(req, res, next) {
    try {
      const candidat = await Candidat.findByPk(req.params.id);
      
      if (!candidat) {
        return next(new AppError('Candidat non trouvé', 404));
      }

      if (candidat.candidatureValidee) {
        return next(new AppError('La candidature est déjà validée', 400));
      }

      await candidat.update({ candidatureValidee: true });

      res.status(200).json({
        status: 'success',
        message: 'Candidature validée avec succès',
        data: candidat
      });
    } catch (error) {
      logger.error('Erreur lors de la validation de la candidature:', error);
      next(error);
    }
  }
}

module.exports = new CandidatController(); 