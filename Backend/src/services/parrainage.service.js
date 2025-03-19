const BaseService = require('./base.service');
const { Parrainage, PeriodeParrainage, Candidat, Electeur, HistoriqueParrainage, sequelize } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { generateCode, sendSMS, sendEmail } = require('../utils/helpers');
const ApiError = require('../utils/ApiError');

class ParrainageService extends BaseService {
  constructor() {
    super(Parrainage, 'Parrainage');
  }

  async verifierEligibilite(numCarteElecteur, numCarteIdentite) {
    // Vérifier si l'électeur existe
    const electeur = await Electeur.findOne({
      where: { numCarteElecteur, numCarteIdentite }
    });

    if (!electeur) {
      throw new ApiError('ELECTEUR_NON_TROUVE', 'Électeur non trouvé');
    }

    // Vérifier si une période de parrainage est active
    const periodeActive = await PeriodeParrainage.findOne({
      where: { etat: 'OUVERTE' }
    });

    if (!periodeActive) {
      throw new ApiError('PERIODE_INACTIVE', 'Aucune période de parrainage active');
    }

    // Vérifier si l'électeur a déjà parrainé
    const parrainageExistant = await Parrainage.findOne({
      where: { 
        electeurId: electeur.id,
        periodeId: periodeActive.id
      }
    });

    if (parrainageExistant) {
      throw new ApiError('DEJA_PARRAINE', 'Vous avez déjà parrainé un candidat');
    }

    return {
      eligible: true,
      electeur: {
        nom: electeur.nom,
        prenom: electeur.prenom,
        dateNaissance: electeur.dateNaissance,
        bureauVote: electeur.bureauVote
      }
    };
  }

  async creerParrainage(electeurId, candidatId, codeAuthentification) {
    const transaction = await sequelize.transaction();

    try {
      // Vérifications
      const electeur = await Electeur.findByPk(electeurId);
      if (!electeur || electeur.codeAuthentification !== codeAuthentification) {
        throw new ApiError('CODE_INVALIDE', 'Code d\'authentification invalide');
      }

      const periodeActive = await PeriodeParrainage.findOne({
        where: { etat: 'OUVERTE' }
      });

      if (!periodeActive) {
        throw new ApiError('PERIODE_INACTIVE', 'Aucune période de parrainage active');
      }

      // Création du parrainage
      const codeVerification = generateCode(5);
      const parrainage = await Parrainage.create({
        electeurId,
        candidatId,
        periodeId: periodeActive.id,
        codeVerification,
        statut: 'EN_ATTENTE'
      }, { transaction });

      // Envoi des notifications
      await Promise.all([
        sendSMS(electeur.telephone, `Votre code de vérification est: ${codeVerification}`),
        sendEmail(electeur.email, 'Code de vérification parrainage', 
          `Votre code de vérification est: ${codeVerification}`)
      ]);

      await transaction.commit();

      return {
        success: true,
        message: 'Parrainage enregistré avec succès',
        codeVerification
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async verifierParrainage(codeVerification) {
    const parrainage = await Parrainage.findOne({
      where: { codeVerification },
      include: [
        { model: Electeur, as: 'electeur' },
        { model: Candidat, as: 'candidat' }
      ]
    });

    if (!parrainage) {
      throw new ApiError('PARRAINAGE_NON_TROUVE', 'Parrainage non trouvé');
    }

    return {
      statut: parrainage.statut,
      dateParrainage: parrainage.createdAt,
      candidat: {
        nom: parrainage.candidat.nom,
        prenom: parrainage.candidat.prenom,
        parti: parrainage.candidat.parti
      }
    };
  }

  async getStatistiquesParCandidat(candidatId) {
    const stats = await Parrainage.findAll({
      where: { candidatId },
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date']
      ],
      group: ['statut', 'date'],
      order: [['date', 'ASC']]
    });

    return stats;
  }

  async mettreAJourHistorique(candidatId, transaction) {
    const stats = await Parrainage.findAll({
      where: { candidatId },
      attributes: [
        'statut',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['statut']
    });

    await HistoriqueParrainage.create({
      candidatId,
      nombreParrainages: stats.reduce((acc, curr) => 
        curr.statut === 'VALIDE' ? acc + parseInt(curr.total) : acc, 0),
      details: {
        date: new Date(),
        statistiques: stats
      }
    }, { transaction });
  }

  async getStatistiquesGlobales() {
    try {
      const stats = await Parrainage.findAll({
        attributes: [
          'statut',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['statut']
      });

      const parRegion = await Parrainage.findAll({
        include: [{
          model: Electeur,
          attributes: ['bureauVote']
        }],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['Electeur.bureauVote']
      });

      return {
        global: stats,
        parRegion
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

module.exports = new ParrainageService(); 