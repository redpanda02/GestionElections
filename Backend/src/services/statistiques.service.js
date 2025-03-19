const { Parrainage, Candidat, Electeur } = require('../models');
const { sequelize } = require('../models');
const cache = require('../config/redis');

class StatistiquesService {
  async getTableauBord() {
    const cacheKey = 'tableau_bord';
    try {
      // Vérifier le cache
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const stats = {
        global: await this.getStatsGlobales(),
        parCandidat: await this.getStatsParCandidat(),
        parRegion: await this.getStatsParRegion(),
        evolution: await this.getEvolutionParrainages()
      };

      // Mettre en cache pour 5 minutes
      await cache.set(cacheKey, stats, 300);
      return stats;
    } catch (error) {
      logger.error('Erreur récupération statistiques:', error);
      throw error;
    }
  }

  async getStatsGlobales() {
    const stats = await Parrainage.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN statut = 'VALIDE' THEN 1 END")), 'valides'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN statut = 'EN_ATTENTE' THEN 1 END")), 'enAttente'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN statut = 'REJETE' THEN 1 END")), 'rejetes']
      ]
    });

    return stats[0];
  }

  async getStatsParCandidat() {
    return await Parrainage.findAll({
      attributes: [
        'candidatId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN statut = 'VALIDE' THEN 1 END")), 'valides']
      ],
      include: [{
        model: Candidat,
        attributes: ['nom', 'prenom', 'parti']
      }],
      group: ['candidatId', 'Candidat.id']
    });
  }

  async getStatsParRegion() {
    return await Parrainage.findAll({
      attributes: [
        [sequelize.col('Electeur.region'), 'region'],
        [sequelize.fn('COUNT', sequelize.col('Parrainage.id')), 'total']
      ],
      include: [{
        model: Electeur,
        attributes: []
      }],
      group: ['Electeur.region']
    });
  }

  async getEvolutionParrainages() {
    return await Parrainage.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });
  }
}

module.exports = new StatistiquesService(); 