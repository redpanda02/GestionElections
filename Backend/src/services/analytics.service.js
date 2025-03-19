const { sequelize } = require('../models');
const cache = require('./cache.service');
const logger = require('../config/logger.advanced');
const { QueryTypes } = require('sequelize');

class AnalyticsService {
  async getGlobalStatistics() {
    const cacheKey = 'stats:global';
    
    return await cache.get(cacheKey, async () => {
      const stats = await sequelize.transaction(async (transaction) => {
        // Statistiques globales
        const totalParrainages = await this.getTotalParrainages(transaction);
        const parRegion = await this.getParrainagesByRegion(transaction);
        const parCandidat = await this.getParrainagesByCandidat(transaction);
        const tendances = await this.getTendances(transaction);
        
        return {
          total: totalParrainages,
          parRegion,
          parCandidat,
          tendances,
          lastUpdate: new Date()
        };
      });

      return stats;
    }, { ttl: 1800 }); // Cache pour 30 minutes
  }

  async getParrainagesByRegion(transaction) {
    const query = `
      SELECT 
        e.region,
        COUNT(*) as total,
        SUM(CASE WHEN p.statut = 'VALIDE' THEN 1 ELSE 0 END) as valides,
        SUM(CASE WHEN p.statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN p.statut = 'REJETE' THEN 1 ELSE 0 END) as rejetes
      FROM Parrainages p
      JOIN Electeurs e ON p.electeurId = e.id
      GROUP BY e.region
      ORDER BY total DESC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      transaction
    });
  }

  async getParrainagesByCandidat(transaction) {
    const query = `
      SELECT 
        c.nom,
        c.prenom,
        COUNT(*) as total,
        COUNT(DISTINCT e.region) as regions_couvertes,
        SUM(CASE WHEN p.statut = 'VALIDE' THEN 1 ELSE 0 END) as valides,
        SUM(CASE WHEN p.statut = 'EN_ATTENTE' THEN 1 ELSE 0 END) as en_attente
      FROM Parrainages p
      JOIN Candidats c ON p.candidatId = c.id
      JOIN Electeurs e ON p.electeurId = e.id
      GROUP BY c.id
      ORDER BY valides DESC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      transaction
    });
  }

  async getTendances(transaction) {
    const query = `
      SELECT 
        DATE(p.createdAt) as date,
        COUNT(*) as total,
        SUM(CASE WHEN p.statut = 'VALIDE' THEN 1 ELSE 0 END) as valides
      FROM Parrainages p
      WHERE p.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(p.createdAt)
      ORDER BY date ASC
    `;

    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      transaction
    });
  }

  async getAnalyseDetailleeCandidat(candidatId) {
    const cacheKey = `stats:candidat:${candidatId}`;

    return await cache.get(cacheKey, async () => {
      const stats = await sequelize.transaction(async (transaction) => {
        // Statistiques détaillées par candidat
        const parRegion = await this.getParrainagesRegionCandidat(candidatId, transaction);
        const evolution = await this.getEvolutionParrainagesCandidat(candidatId, transaction);
        const demographiques = await this.getStatsDemographiques(candidatId, transaction);
        
        return {
          parRegion,
          evolution,
          demographiques,
          lastUpdate: new Date()
        };
      });

      return stats;
    }, { ttl: 3600 }); // Cache pour 1 heure
  }

  async getParrainagesRegionCandidat(candidatId, transaction) {
    const query = `
      SELECT 
        e.region,
        COUNT(*) as total,
        COUNT(DISTINCT e.commune) as communes_couvertes,
        SUM(CASE WHEN p.statut = 'VALIDE' THEN 1 ELSE 0 END) as valides
      FROM Parrainages p
      JOIN Electeurs e ON p.electeurId = e.id
      WHERE p.candidatId = :candidatId
      GROUP BY e.region
      ORDER BY valides DESC
    `;

    return await sequelize.query(query, {
      replacements: { candidatId },
      type: QueryTypes.SELECT,
      transaction
    });
  }

  async getEvolutionParrainagesCandidat(candidatId, transaction) {
    const query = `
      SELECT 
        DATE(p.createdAt) as date,
        COUNT(*) as total,
        SUM(CASE WHEN p.statut = 'VALIDE' THEN 1 ELSE 0 END) as valides,
        COUNT(DISTINCT e.region) as regions_touchees
      FROM Parrainages p
      JOIN Electeurs e ON p.electeurId = e.id
      WHERE p.candidatId = :candidatId
      GROUP BY DATE(p.createdAt)
      ORDER BY date ASC
    `;

    return await sequelize.query(query, {
      replacements: { candidatId },
      type: QueryTypes.SELECT,
      transaction
    });
  }

  async getStatsDemographiques(candidatId, transaction) {
    const query = `
      SELECT 
        e.tranche_age,
        e.sexe,
        COUNT(*) as total,
        SUM(CASE WHEN p.statut = 'VALIDE' THEN 1 ELSE 0 END) as valides
      FROM Parrainages p
      JOIN Electeurs e ON p.electeurId = e.id
      WHERE p.candidatId = :candidatId
      GROUP BY e.tranche_age, e.sexe
      ORDER BY total DESC
    `;

    return await sequelize.query(query, {
      replacements: { candidatId },
      type: QueryTypes.SELECT,
      transaction
    });
  }

  async generateRapportPeriodique() {
    try {
      const stats = await this.getGlobalStatistics();
      const rapport = {
        date: new Date(),
        statistiques: stats,
        analyses: {
          progression: this.analyserProgression(stats),
          couvertureRegionale: this.analyserCouvertureRegionale(stats),
          tendances: this.analyserTendances(stats)
        },
        recommendations: this.genererRecommendations(stats)
      };

      // Sauvegarde du rapport
      await sequelize.models.Rapport.create({
        type: 'PERIODIQUE',
        contenu: rapport,
        dateGeneration: new Date()
      });

      return rapport;
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport périodique', { error });
      throw error;
    }
  }

  analyserProgression(stats) {
    // Analyse de la progression des parrainages
    const progression = {
      global: {
        total: stats.total,
        tauxCompletion: (stats.total / process.env.OBJECTIF_PARRAINAGES) * 100
      },
      parCandidat: stats.parCandidat.map(candidat => ({
        nom: `${candidat.nom} ${candidat.prenom}`,
        progression: (candidat.valides / process.env.SEUIL_PARRAINAGES) * 100,
        restant: Math.max(0, process.env.SEUIL_PARRAINAGES - candidat.valides)
      }))
    };

    return progression;
  }

  analyserCouvertureRegionale(stats) {
    // Analyse de la couverture régionale
    return stats.parRegion.map(region => ({
      region: region.region,
      couverture: (region.valides / process.env.OBJECTIF_REGION) * 100,
      diversite: region.communes_couvertes
    }));
  }

  analyserTendances(stats) {
    // Analyse des tendances
    const tendances = stats.tendances.map((jour, index, array) => {
      const variation = index > 0 
        ? ((jour.valides - array[index-1].valides) / array[index-1].valides) * 100 
        : 0;

      return {
        date: jour.date,
        total: jour.total,
        variation,
        tendance: variation > 0 ? 'hausse' : 'baisse'
      };
    });

    return tendances;
  }

  genererRecommendations(stats) {
    const recommendations = [];

    // Analyse des régions sous-représentées
    const regionsDeficitaires = stats.parRegion
      .filter(r => (r.valides / process.env.OBJECTIF_REGION) < 0.5)
      .map(r => r.region);

    if (regionsDeficitaires.length > 0) {
      recommendations.push({
        type: 'COUVERTURE_REGIONALE',
        priorite: 'HAUTE',
        description: `Renforcer la collecte dans les régions: ${regionsDeficitaires.join(', ')}`
      });
    }

    // Analyse des tendances récentes
    const derniersTendances = stats.tendances.slice(-7);
    const moyenneVariation = derniersTendances.reduce((acc, curr) => acc + curr.variation, 0) / 7;

    if (moyenneVariation < 0) {
      recommendations.push({
        type: 'TENDANCE',
        priorite: 'MOYENNE',
        description: 'Baisse de la dynamique de collecte, intensifier les actions de terrain'
      });
    }

    return recommendations;
  }
}

module.exports = new AnalyticsService(); 