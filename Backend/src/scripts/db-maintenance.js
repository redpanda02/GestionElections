const { sequelize } = require('../models');
const logger = require('../config/logger.advanced');

class DatabaseMaintenance {
  async optimizeTables() {
    try {
      const [results] = await sequelize.query('SHOW TABLES');
      const tables = results.map(result => Object.values(result)[0]);

      for (const table of tables) {
        await sequelize.query(`OPTIMIZE TABLE ${table}`);
        logger.info(`Table optimisée: ${table}`);
      }
    } catch (error) {
      logger.error('Erreur lors de l\'optimisation des tables', { error });
      throw error;
    }
  }

  async analyzeTableStatistics() {
    try {
      const [results] = await sequelize.query('SHOW TABLES');
      const tables = results.map(result => Object.values(result)[0]);

      for (const table of tables) {
        await sequelize.query(`ANALYZE TABLE ${table}`);
        logger.info(`Statistiques analysées: ${table}`);
      }
    } catch (error) {
      logger.error('Erreur lors de l\'analyse des statistiques', { error });
      throw error;
    }
  }

  async checkAndRepairTables() {
    try {
      const [results] = await sequelize.query('SHOW TABLES');
      const tables = results.map(result => Object.values(result)[0]);

      for (const table of tables) {
        const [checkResult] = await sequelize.query(`CHECK TABLE ${table}`);
        if (checkResult[0].Msg_text !== 'OK') {
          await sequelize.query(`REPAIR TABLE ${table}`);
          logger.info(`Table réparée: ${table}`);
        }
      }
    } catch (error) {
      logger.error('Erreur lors de la vérification/réparation des tables', { error });
      throw error;
    }
  }

  async purgeOldData(days = 90) {
    const transaction = await sequelize.transaction();

    try {
      const date = new Date();
      date.setDate(date.getDate() - days);

      // Suppression des vieux logs
      await sequelize.models.Log.destroy({
        where: {
          createdAt: {
            [Op.lt]: date
          }
        },
        transaction
      });

      // Suppression des anciennes tentatives de connexion
      await sequelize.models.LoginAttempt.destroy({
        where: {
          createdAt: {
            [Op.lt]: date
          }
        },
        transaction
      });

      await transaction.commit();
      logger.info('Nettoyage des anciennes données terminé');
    } catch (error) {
      await transaction.rollback();
      logger.error('Erreur lors du nettoyage des anciennes données', { error });
      throw error;
    }
  }

  async reindexDatabase() {
    try {
      const [results] = await sequelize.query('SHOW TABLES');
      const tables = results.map(result => Object.values(result)[0]);

      for (const table of tables) {
        await sequelize.query(`ALTER TABLE ${table} ENGINE=InnoDB`);
        logger.info(`Table réindexée: ${table}`);
      }
    } catch (error) {
      logger.error('Erreur lors de la réindexation', { error });
      throw error;
    }
  }
}

module.exports = new DatabaseMaintenance(); 