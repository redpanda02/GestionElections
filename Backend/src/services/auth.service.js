const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Utilisateur } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');

class AuthService {
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  async comparePasswords(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  async signup(userData) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await Utilisateur.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new AppError('Cet email est déjà utilisé', 400);
      }

      // Hasher le mot de passe
      userData.motDePasse = await this.hashPassword(userData.motDePasse);

      // Créer l'utilisateur
      const newUser = await Utilisateur.create(userData);

      // Générer le token
      const token = this.generateToken(newUser.id);

      return {
        user: newUser,
        token
      };
    } catch (error) {
      logger.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Vérifier si l'utilisateur existe
      const user = await Utilisateur.findOne({
        where: { email },
        attributes: { include: ['motDePasse'] }
      });

      if (!user || !(await this.comparePasswords(password, user.motDePasse))) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Générer le token
      const token = this.generateToken(user.id);

      // Ne pas renvoyer le mot de passe
      user.motDePasse = undefined;

      return {
        user,
        token
      };
    } catch (error) {
      logger.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  async resetPasswordRequest(email) {
    try {
      const user = await Utilisateur.findOne({ where: { email } });

      if (!user) {
        throw new AppError('Aucun utilisateur trouvé avec cet email', 404);
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 heure

      await user.update({
        resetToken: crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex'),
        resetTokenExpires
      });

      return resetToken;
    } catch (error) {
      logger.error('Erreur lors de la demande de réinitialisation:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await Utilisateur.findOne({
        where: {
          resetToken: hashedToken,
          resetTokenExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) {
        throw new AppError('Token invalide ou expiré', 400);
      }

      // Mettre à jour le mot de passe
      user.motDePasse = await this.hashPassword(newPassword);
      user.resetToken = null;
      user.resetTokenExpires = null;
      await user.save();

      return true;
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  }
}

module.exports = new AuthService(); 