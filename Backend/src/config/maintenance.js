const cron = require('node-cron');
const backupService = require('../services/backup.service');
const dbMaintenance = require('../scripts/db-maintenance');
const logger = require('./logger.advanced');

class MaintenanceScheduler {
  constructor() {
    this.setupSchedules();
  }

  setupSchedules() {
    // Backup complet hebdomadaire
    cron.schedule('0 0 * * 0', async () => {
      try {
        await backupService.createFullBackup();
      } catch (error) {
        logger.error('Erreur lors du backup hebdomadaire', { error });
      }
    });

    // Backup incrémental quotidien
    cron.schedule('0 0 * * 1-6', async () => {
      try {
        await backupService.createIncrementalBackup();
      } catch (error) {
        logger.error('Erreur lors du backup incrémental', { error });
      }
    });

    // Maintenance hebdomadaire
    cron.schedule('0 1 * * 0', async () => {
      try {
        await dbMaintenance.optimizeTables();
        await dbMaintenance.analyzeTableStatistics();
        await dbMaintenance.checkAndRepairTables();
      } catch (error) {
        logger.error('Erreur lors de la maintenance hebdomadaire', { error });
      }
    });

    // Nettoyage mensuel
    cron.schedule('0 2 1 * *', async () => {
      try {
        await dbMaintenance.purgeOldData();
        await backupService.cleanupOldBackups();
      } catch (error) {
        logger.error('Erreur lors du nettoyage mensuel', { error });
      }
    });
  }
}

module.exports = new MaintenanceScheduler(); 