const BaseService = require('./base.service');
const { Electeur, Parrainage, PeriodeParrainage } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class ElecteurService extends BaseService {
  constructor() {
    super(Electeur, 'Electeur');
  }

  async verifierEligibilite(numCarteElecteur, numCarteIdentite) {
    try {
      // Vérifier si l'électeur existe
      const electeur = await Electeur.findOne({
        where: {
          numCarteElecteur,
          numCarteIdentite
        }
      });

      if (!electeur) {
        throw new AppError('Électeur non trouvé ou informations invalides', 404);
      }

      // Vérifier s'il existe une période active
      const periodeActive = await PeriodeParrainage.findOne({
        where: {
          etat: 'OUVERT',
          dateDebut: { [Op.lte]: new Date() },
          dateFin: { [Op.gte]: new Date() }
        }
      });

      if (!periodeActive) {
        throw new AppError('Aucune période de parrainage n\'est actuellement active', 400);
      }

      // Vérifier si l'électeur a déjà parrainé
      const parrainageExistant = await Parrainage.findOne({
        where: {
          electeurId: electeur.id,
          periodeId: periodeActive.id
        }
      });

      return {
        eligible: !parrainageExistant,
        electeur,
        periodeActive,
        message: parrainageExistant ? 
          'Vous avez déjà effectué un parrainage pour cette période' : 
          'Vous êtes éligible pour parrainer'
      };
    } catch (error) {
      logger.error('Erreur lors de la vérification d\'éligibilité:', error);
      throw error;
    }
  }

  async getParrainage(electeurId) {
    try {
      return await Parrainage.findOne({
        where: { electeurId },
        include: ['candidat', 'periode'],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération du parrainage:', error);
      throw error;
    }
  }

  async verifierExistence(numCarteElecteur) {
    try {
      const electeur = await Electeur.findOne({
        where: { numCarteElecteur }
      });
      return !!electeur;
    } catch (error) {
      logger.error('Erreur lors de la vérification de l\'existence:', error);
      throw error;
    }
  }
}

module.exports = new ElecteurService(); 