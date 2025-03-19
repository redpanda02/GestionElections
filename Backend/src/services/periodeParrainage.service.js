const BaseService = require('./base.service');
const { PeriodeParrainage, Parrainage, sequelize } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class PeriodeParrainageService extends BaseService {
  constructor() {
    super(PeriodeParrainage, 'PeriodeParrainage');
  }

  async creerPeriode(periodeData) {
    const transaction = await sequelize.transaction();
    try {
      // Vérifier qu'il n'y a pas de chevauchement avec d'autres périodes
      const periodeExistante = await PeriodeParrainage.findOne({
        where: {
          [Op.or]: [
            {
              dateDebut: {
                [Op.between]: [periodeData.dateDebut, periodeData.dateFin]
              }
            },
            {
              dateFin: {
                [Op.between]: [periodeData.dateDebut, periodeData.dateFin]
              }
            }
          ]
        }
      });

      if (periodeExistante) {
        throw new AppError('La période chevauche une période existante', 400);
      }

      // Créer la nouvelle période
      const periode = await PeriodeParrainage.create({
        ...periodeData,
        etat: 'FERME' // Par défaut, la période est créée fermée
      }, { transaction });

      await transaction.commit();
      return periode;
    } catch (error) {
      await transaction.rollback();
      logger.error('Erreur lors de la création de la période:', error);
      throw error;
    }
  }

  async ouvrirPeriode(periodeId) {
    const transaction = await sequelize.transaction();
    try {
      const periode = await this.findById(periodeId);

      // Vérifier qu'il n'y a pas d'autre période active
      const periodeActive = await PeriodeParrainage.findOne({
        where: {
          id: { [Op.ne]: periodeId },
          etat: 'OUVERT',
          dateFin: { [Op.gt]: new Date() }
        }
      });

      if (periodeActive) {
        throw new AppError('Une autre période de parrainage est déjà active', 400);
      }

      // Vérifier que la période n'est pas déjà terminée
      if (new Date(periode.dateFin) < new Date()) {
        throw new AppError('Cette période est déjà terminée', 400);
      }

      await periode.update({ etat: 'OUVERT' }, { transaction });

      // Enregistrer l'événement dans les logs
      logger.info(`Période de parrainage ${periodeId} ouverte`);

      await transaction.commit();
      return periode;
    } catch (error) {
      await transaction.rollback();
      logger.error('Erreur lors de l\'ouverture de la période:', error);
      throw error;
    }
  }

  async fermerPeriode(periodeId) {
    const transaction = await sequelize.transaction();
    try {
      const periode = await this.findById(periodeId);

      if (periode.etat === 'FERME') {
        throw new AppError('Cette période est déjà fermée', 400);
      }

      await periode.update({ etat: 'FERME' }, { transaction });

      // Mettre à jour tous les parrainages en attente
      await Parrainage.update(
        { statut: 'REJETE' },
        {
          where: {
            periodeId,
            statut: 'EN_ATTENTE'
          },
          transaction
        }
      );

      // Enregistrer l'événement dans les logs
      logger.info(`Période de parrainage ${periodeId} fermée`);

      await transaction.commit();
      return periode;
    } catch (error) {
      await transaction.rollback();
      logger.error('Erreur lors de la fermeture de la période:', error);
      throw error;
    }
  }

  async getPeriodeActuelle() {
    try {
      return await PeriodeParrainage.findOne({
        where: {
          dateDebut: { [Op.lte]: new Date() },
          dateFin: { [Op.gte]: new Date() }
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de la période actuelle:', error);
      throw error;
    }
  }

  async getStatistiques(periodeId) {
    try {
      const periode = await this.findById(periodeId);

      const stats = await Parrainage.findAll({
        where: { periodeId },
        attributes: [
          'statut',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['statut']
      });

      const totalParrainages = stats.reduce((acc, curr) => 
        acc + parseInt(curr.get('total')), 0);

      const parCandidats = await Parrainage.findAll({
        where: { periodeId },
        attributes: [
          'candidatId',
          'statut',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total']
        ],
        group: ['candidatId', 'statut'],
        include: [{
          model: sequelize.models.Candidat,
          attributes: ['nomParti']
        }]
      });

      return {
        periode,
        statistiques: {
          total: totalParrainages,
          parStatut: stats,
          parCandidats
        }
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  async verifierPeriodeActive() {
    try {
      const periodeActive = await PeriodeParrainage.findOne({
        where: {
          etat: 'OUVERT',
          dateDebut: { [Op.lte]: new Date() },
          dateFin: { [Op.gte]: new Date() }
        }
      });

      return {
        active: !!periodeActive,
        periode: periodeActive
      };
    } catch (error) {
      logger.error('Erreur lors de la vérification de la période active:', error);
      throw error;
    }
  }
}

module.exports = new PeriodeParrainageService(); 