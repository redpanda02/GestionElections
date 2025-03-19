const BaseService = require('./base.service');
const { Candidat, Parrainage, HistoriqueParrainage, sequelize } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const crypto = require('crypto');

class CandidatService extends BaseService {
  constructor() {
    super(Candidat, 'Candidat');
  }

  async createCandidat(candidatData, photoPath = null) {
    const transaction = await sequelize.transaction();
    try {
      // Générer un code d'authentification unique
      const codeAuthentification = crypto.randomBytes(4).toString('hex').toUpperCase();

      const candidat = await Candidat.create({
        ...candidatData,
        photo: photoPath,
        codeAuthentification
      }, { transaction });

      // Créer une entrée initiale dans l'historique
      await HistoriqueParrainage.create({
        candidatId: candidat.id,
        nombreParrainages: 0,
        details: {
          dateCreation: new Date(),
          statut: 'INITIAL'
        }
      }, { transaction });

      await transaction.commit();
      return candidat;
    } catch (error) {
      await transaction.rollback();
      logger.error('Erreur lors de la création du candidat:', error);
      throw error;
    }
  }

  async getParrainages(candidatId, options = {}) {
    try {
      return await Parrainage.findAll({
        where: { candidatId },
        ...options
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des parrainages:', error);
      throw error;
    }
  }

  async getStatistiques(candidatId) {
    try {
      const stats = await Parrainage.findAll({
        where: { candidatId },
        attributes: [
          'statut',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['statut']
      });

      const historique = await HistoriqueParrainage.findAll({
        where: { candidatId },
        order: [['dateEnregistrement', 'DESC']],
        limit: 30
      });

      return {
        statistiquesGlobales: stats,
        historique
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  async regenererCodeAuthentification(candidatId) {
    try {
      const candidat = await this.findById(candidatId);
      const nouveauCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      await candidat.update({ codeAuthentification: nouveauCode });
      
      return nouveauCode;
    } catch (error) {
      logger.error('Erreur lors de la régénération du code:', error);
      throw error;
    }
  }

  async verifierCodeAuthentification(candidatId, code) {
    try {
      const candidat = await this.findById(candidatId);
      return candidat.codeAuthentification === code.toUpperCase();
    } catch (error) {
      logger.error('Erreur lors de la vérification du code:', error);
      throw error;
    }
  }

  async mettreAJourPhoto(candidatId, photoPath) {
    try {
      const candidat = await this.findById(candidatId);
      await candidat.update({ photo: photoPath });
      return candidat;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la photo:', error);
      throw error;
    }
  }
}

module.exports = new CandidatService(); 