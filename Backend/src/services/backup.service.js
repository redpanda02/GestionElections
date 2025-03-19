const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('../config/logger.advanced');
const { sequelize } = require('../models');
const s3 = require('../config/s3');

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.initializeBackupDirectory();
  }

  async initializeBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error('Erreur lors de la création du répertoire de backup', { error });
    }
  }

  async createFullBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-full-${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);

    try {
      // Création du dump MySQL
      const command = `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} > ${filePath}`;
      await execAsync(command);

      // Compression du fichier
      await execAsync(`gzip ${filePath}`);
      const compressedPath = `${filePath}.gz`;

      // Upload vers S3
      if (process.env.NODE_ENV === 'production') {
        await this.uploadToS3(compressedPath, `backups/${path.basename(compressedPath)}`);
      }

      logger.info('Backup complet créé avec succès', { filename });
      return compressedPath;
    } catch (error) {
      logger.error('Erreur lors de la création du backup complet', { error });
      throw error;
    }
  }

  async createIncrementalBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-incremental-${timestamp}.json`;
    const filePath = path.join(this.backupDir, filename);

    try {
      // Récupération des modifications récentes
      const recentChanges = await this.getRecentChanges();

      // Sauvegarde des données
      await fs.writeFile(filePath, JSON.stringify(recentChanges, null, 2));

      // Compression et upload
      await execAsync(`gzip ${filePath}`);
      const compressedPath = `${filePath}.gz`;

      if (process.env.NODE_ENV === 'production') {
        await this.uploadToS3(compressedPath, `backups/${path.basename(compressedPath)}`);
      }

      logger.info('Backup incrémental créé avec succès', { filename });
      return compressedPath;
    } catch (error) {
      logger.error('Erreur lors de la création du backup incrémental', { error });
      throw error;
    }
  }

  async restoreFromBackup(backupPath) {
    try {
      if (backupPath.endsWith('.gz')) {
        await execAsync(`gunzip -c ${backupPath} > ${backupPath.slice(0, -3)}`);
        backupPath = backupPath.slice(0, -3);
      }

      if (backupPath.endsWith('.sql')) {
        // Restauration d'un backup complet
        const command = `mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < ${backupPath}`;
        await execAsync(command);
      } else if (backupPath.endsWith('.json')) {
        // Restauration d'un backup incrémental
        const data = JSON.parse(await fs.readFile(backupPath, 'utf8'));
        await this.restoreIncrementalData(data);
      }

      logger.info('Restauration terminée avec succès', { backupPath });
    } catch (error) {
      logger.error('Erreur lors de la restauration', { error, backupPath });
      throw error;
    }
  }

  async uploadToS3(filePath, key) {
    try {
      const fileContent = await fs.readFile(filePath);
      await s3.upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: fileContent
      }).promise();

      logger.info('Fichier uploadé vers S3 avec succès', { key });
    } catch (error) {
      logger.error('Erreur lors de l\'upload vers S3', { error, key });
      throw error;
    }
  }

  async getRecentChanges() {
    const lastBackupDate = await this.getLastBackupDate();
    const changes = {};

    // Récupération des modifications pour chaque modèle
    for (const model of Object.values(sequelize.models)) {
      const recentRecords = await model.findAll({
        where: {
          updatedAt: {
            [Op.gt]: lastBackupDate
          }
        }
      });

      if (recentRecords.length > 0) {
        changes[model.name] = recentRecords.map(record => record.toJSON());
      }
    }

    return changes;
  }

  async restoreIncrementalData(data) {
    const transaction = await sequelize.transaction();

    try {
      for (const [modelName, records] of Object.entries(data)) {
        const model = sequelize.models[modelName];
        for (const record of records) {
          await model.upsert(record, { transaction });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async cleanupOldBackups(retentionDays = 30) {
    try {
      const files = await fs.readdir(this.backupDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        const age = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

        if (age > retentionDays) {
          await fs.unlink(filePath);
          logger.info('Ancien backup supprimé', { file });
        }
      }
    } catch (error) {
      logger.error('Erreur lors du nettoyage des anciens backups', { error });
    }
  }

  async verifyBackupIntegrity(backupPath) {
    try {
      if (backupPath.endsWith('.gz')) {
        // Vérification de l'intégrité du fichier gzip
        await execAsync(`gzip -t ${backupPath}`);
      }

      // Vérification du checksum
      const checksum = await this.calculateChecksum(backupPath);
      const storedChecksum = await this.getStoredChecksum(backupPath);

      if (checksum !== storedChecksum) {
        throw new Error('Checksum mismatch');
      }

      logger.info('Vérification de l\'intégrité réussie', { backupPath });
      return true;
    } catch (error) {
      logger.error('Erreur lors de la vérification de l\'intégrité', { error, backupPath });
      return false;
    }
  }

  async calculateChecksum(filePath) {
    const { stdout } = await execAsync(`sha256sum ${filePath}`);
    return stdout.split(' ')[0];
  }
}

module.exports = new BackupService(); 