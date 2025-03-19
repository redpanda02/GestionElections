const BaseController = require('./base.controller');
const { Electeur, Parrainage, Utilisateur } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const ElecteurService = require('../services/electeur.service');
const { validateElecteurProfile } = require('../validations/electeur.validation');

class ElecteurController extends BaseController {
  constructor() {
    super(Electeur, 'Electeur');
    
    // Lier les méthodes héritées
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    
    // Lier les méthodes spécifiques
    this.verifierEligibilite = this.verifierEligibilite.bind(this);
    this.getMonProfil = this.getMonProfil.bind(this);
    this.getMonParrainage = this.getMonParrainage.bind(this);
    this.creerProfil = this.creerProfil.bind(this);
    this.regenererCode = this.regenererCode.bind(this);
  }

  async verifierEligibilite(req, res, next) {
    try {
      const { numCarteElecteur, numCarteIdentite } = req.query;
      const resultat = await ElecteurService.verifierEligibilite(
        numCarteElecteur,
        numCarteIdentite
      );

      res.json(resultat);
    } catch (error) {
      next(error);
    }
  }

  async getMonProfil(req, res, next) {
    try {
      const electeur = await Electeur.findOne({
        where: { utilisateurId: req.user.id },
        include: [{
          model: Utilisateur,
          as: 'utilisateur',
          attributes: ['nom', 'prenom', 'email']
        }]
      });

      if (!electeur) {
        return next(new AppError('Électeur non trouvé', 404));
      }

      res.status(200).json({
        status: 'success',
        data: electeur
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du profil:', error);
      next(error);
    }
  }

  async getMonParrainage(req, res, next) {
    try {
      const parrainage = await Parrainage.findOne({
        where: { electeurId: req.user.electeur.id },
        include: [{
          model: Candidat,
          as: 'candidat',
          attributes: ['nomParti', 'slogan']
        }]
      });

      res.status(200).json({
        status: 'success',
        data: parrainage
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du parrainage:', error);
      next(error);
    }
  }

  async creerProfil(req, res, next) {
    try {
      const {
        numCarteElecteur,
        numCarteIdentite,
        nom,
        bureauVote,
        telephone,
        email
      } = req.body;

      // Validation des données
      await validateElecteurProfile(req.body);

      const profil = await ElecteurService.creerProfil({
        numCarteElecteur,
        numCarteIdentite,
        nom,
        bureauVote,
        telephone,
        email
      });

      res.status(201).json({
        success: true,
        message: 'Profil créé avec succès',
        data: profil
      });
    } catch (error) {
      next(error);
    }
  }

  async regenererCode(req, res, next) {
    try {
      const { numCarteElecteur } = req.body;
      await ElecteurService.regenererCode(numCarteElecteur);

      res.json({
        success: true,
        message: 'Nouveau code envoyé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ElecteurController(); 