const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { Utilisateur } = require('../models');
const AppError = require('../errors/AppError');
const logger = require('../config/logger');

exports.protect = async (req, res, next) => {
  try {
    // 1) Vérifier si le token existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter.', 401)
      );
    }

    // 2) Vérifier la validité du token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Vérifier si l'utilisateur existe toujours
    const utilisateur = await Utilisateur.findByPk(decoded.id);
    if (!utilisateur) {
      return next(
        new AppError('L\'utilisateur de ce token n\'existe plus.', 401)
      );
    }

    // 4) Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
    if (utilisateur.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('Mot de passe récemment modifié. Veuillez vous reconnecter.', 401)
      );
    }

    // Accorder l'accès à la route protégée
    req.user = utilisateur;
    next();
  } catch (error) {
    logger.error('Erreur d\'authentification:', error);
    next(new AppError('Erreur d\'authentification', 401));
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Vous n\'avez pas la permission d\'effectuer cette action', 403)
      );
    }
    next();
  };
}; 