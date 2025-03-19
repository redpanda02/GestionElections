const BaseController = require('./base.controller');
const { Utilisateur } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UtilisateurController extends BaseController {
  constructor() {
    super(Utilisateur, 'Utilisateur');
    
    // Lier explicitement les méthodes héritées
    this.getAll = this.getAll.bind(this);
    this.getOne = this.getOne.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    
    // Lier les méthodes spécifiques
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async register(req, res, next) {
    try {
      const { motDePasse, nom, prenom, role, cni, nce } = req.body;
      const email = `${cni}@parrainage.sn`;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await Utilisateur.findOne({ 
        where: { 
          [Op.or]: [
            { email },
            { cni },
            { nce }
          ]
        } 
      });

      if (existingUser) {
        return next(new AppError('Cet utilisateur existe déjà', 400));
      }

      // Créer le nouvel utilisateur
      const hashedPassword = await bcrypt.hash(motDePasse, 12);
      const newUser = await Utilisateur.create({
        email,
        motDePasse: hashedPassword,
        nom,
        prenom,
        role,
        cni,
        nce
      });

      // Générer le token
      const token = jwt.sign(
        { id: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Supprimer le mot de passe de la réponse
      newUser.motDePasse = undefined;

      res.status(201).json({
        status: 'success',
        token,
        data: newUser
      });
    } catch (error) {
      logger.error('Erreur lors de l\'inscription:', error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, motDePasse } = req.body;

      // Vérifier si l'email et le mot de passe existent
      if (!email || !motDePasse) {
        return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
      }

      // Trouver l'utilisateur et vérifier le mot de passe
      const user = await Utilisateur.findOne({ 
        where: { email },
        attributes: { include: ['motDePasse'] }
      });

      if (!user || !(await bcrypt.compare(motDePasse, user.motDePasse))) {
        return next(new AppError('Email ou mot de passe incorrect', 401));
      }

      // Générer le token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Supprimer le mot de passe de la réponse
      user.motDePasse = undefined;

      res.status(200).json({
        status: 'success',
        token,
        data: user
      });
    } catch (error) {
      logger.error('Erreur lors de la connexion:', error);
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await Utilisateur.findByPk(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du profil:', error);
      next(error);
    }
  }

  async updateMe(req, res, next) {
    try {
      // Empêcher la mise à jour du mot de passe ici
      if (req.body.motDePasse || req.body.passwordConfirm) {
        return next(new AppError('Cette route n\'est pas pour la mise à jour du mot de passe', 400));
      }

      // Filtrer les champs non autorisés
      const filteredBody = this.filterObj(req.body, 'nom', 'prenom', 'email');
      
      const updatedUser = await Utilisateur.findByPk(req.user.id);
      await updatedUser.update(filteredBody);

      res.status(200).json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du profil:', error);
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const user = await Utilisateur.findByPk(req.user.id, {
        attributes: { include: ['motDePasse'] }
      });

      // Vérifier le mot de passe actuel
      if (!(await bcrypt.compare(req.body.motDePasseActuel, user.motDePasse))) {
        return next(new AppError('Votre mot de passe actuel est incorrect', 401));
      }

      // Mettre à jour le mot de passe
      user.motDePasse = await bcrypt.hash(req.body.nouveauMotDePasse, 12);
      await user.save();

      // Générer un nouveau token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        status: 'success',
        token
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du mot de passe:', error);
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const user = await Utilisateur.findOne({ where: { email: req.body.email } });
      if (!user) {
        return next(new AppError('Il n\'y a pas d\'utilisateur avec cet email', 404));
      }

      // Générer un token de réinitialisation
      const resetToken = jwt.sign(
        { id: user.id },
        process.env.JWT_RESET_SECRET,
        { expiresIn: '1h' }
      );

      // Envoyer l'email avec le token (à implémenter)

      res.status(200).json({
        status: 'success',
        message: 'Token envoyé par email',
        resetToken // À supprimer en production
      });
    } catch (error) {
      logger.error('Erreur lors de la demande de réinitialisation du mot de passe:', error);
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      // Vérifier le token
      const decoded = jwt.verify(req.params.token, process.env.JWT_RESET_SECRET);
      const user = await Utilisateur.findByPk(decoded.id);

      if (!user) {
        return next(new AppError('Le token est invalide ou a expiré', 400));
      }

      // Mettre à jour le mot de passe
      user.motDePasse = await bcrypt.hash(req.body.nouveauMotDePasse, 12);
      await user.save();

      // Générer un nouveau token de connexion
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        status: 'success',
        token
      });
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
      next(error);
    }
  }

  // Méthode utilitaire pour filtrer les objets
  filterObj(obj, ...allowedFields) {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  }
}

const utilisateurController = new UtilisateurController();
module.exports = utilisateurController;