const cron = require('node-cron');
const NotificationService = require('../services/notification.service');
const ParrainageService = require('../services/parrainage.service');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');
const cache = require('../config/redis');

class CronManager {
  constructor() {
    // Génération quotidienne des rapports de statistiques
    cron.schedule('0 0 * * *', this.generateDailyReports);

    // Vérification des périodes de parrainage
    cron.schedule('0 * * * *', this.checkPeriodeStatus);

    // Nettoyage des fichiers temporaires
    cron.schedule('0 0 * * 0', this.cleanupTempFiles);
  }

  async generateDailyReports() {
    try {
      logger.info('Début de la génération des rapports quotidiens');
      
      const periodeActive = await ParrainageService.getPeriodeActive();
      if (periodeActive) {
        const filename = await NotificationService.generateStatisticsReport(periodeActive.id);
        
        // Envoi du rapport aux administrateurs
        const admins = await cache.get('utilisateurs:admins');
        for (const admin of admins) {
          await NotificationService.sendEmail(
            admin.email,
            'Rapport quotidien des parrainages',
            'rapport-quotidien',
            { filename }
          );
        }
      }
      
      logger.info('Génération des rapports quotidiens terminée');
    } catch (error) {
      logger.error('Erreur lors de la génération des rapports quotidiens', error);
    }
  }

  async checkPeriodeStatus() {
    try {
      logger.info('Vérification du statut des périodes de parrainage');
      
      const periodes = await ParrainageService.checkPeriodesStatus();
      for (const periode of periodes) {
        if (periode.statusChanged) {
          await NotificationService.notifyPeriodeStatus(periode);
        }
      }
      
      logger.info('Vérification des périodes terminée');
    } catch (error) {
      logger.error('Erreur lors de la vérification des périodes', error);
    }
  }

  async cleanupTempFiles() {
    try {
      logger.info('Début du nettoyage des fichiers temporaires');
      
      // Nettoyage des rapports PDF plus vieux que 7 jours
      const oldFiles = await fs.readdir(path.join(__dirname, '../uploads'));
      const now = Date.now();
      
      for (const file of oldFiles) {
        const filePath = path.join(__dirname, '../uploads', file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
          await fs.unlink(filePath);
          logger.info('Fichier supprimé', { file });
        }
      }
      
      logger.info('Nettoyage des fichiers temporaires terminé');
    } catch (error) {
      logger.error('Erreur lors du nettoyage des fichiers temporaires', error);
    }
  }
}

module.exports = new CronManager(); 