const BaseService = require('./base.service');
const { FichierElectoral, TentativeUpload, Electeur, sequelize } = require('../models');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../config/logger');
const fs = require('fs').promises;
const csv = require('csv-parser');
const { Readable } = require('stream');
const crypto = require('crypto');
const { Sequelize, Transaction } = require('sequelize');
const { HistoriqueUpload, ElecteurTemp } = require('../models');

class FichierElectoralService extends BaseService {
  constructor() {
    super(FichierElectoral, 'FichierElectoral');
  }

  async traiterFichier(fichierPath, checksum, userId, ipAddress) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Vérifier le checksum
      const calculatedChecksum = await this.calculateChecksum(fichierPath);
      if (calculatedChecksum !== checksum) {
        await this.logUploadAttempt(userId, ipAddress, checksum, 'ERROR', 'Checksum invalide', transaction);
        throw new Error('INVALID_CHECKSUM');
      }

      // 2. Vérifier l'encodage UTF-8
      await this.verifierEncodage(fichierPath);

      // 3. Lire et valider le contenu
      const electeurs = await this.lireFichierCSV(fichierPath);
      const erreurs = await this.controlerElecteurs(electeurs, transaction);

      if (erreurs.length > 0) {
        await this.logUploadAttempt(userId, ipAddress, checksum, 'ERROR', 'Erreurs de validation', transaction);
        throw new Error('VALIDATION_ERRORS');
      }

      // 4. Sauvegarder dans la table temporaire
      await this.sauvegarderElecteursTemp(electeurs, transaction);

      // 5. Log du succès
      await this.logUploadAttempt(userId, ipAddress, checksum, 'SUCCESS', 'Fichier validé', transaction);

      await transaction.commit();
      return { success: true, message: 'Fichier validé avec succès' };

    } catch (error) {
      await transaction.rollback();
      logger.error('Erreur traitement fichier:', error);
      throw error;
    }
  }

  async calculateChecksum(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  async verifierEncodage(filePath) {
    const buffer = await fs.readFile(filePath);
    const isUtf8 = buffer.toString().indexOf('') === -1;
    if (!isUtf8) {
      throw new Error('INVALID_ENCODING');
    }
  }

  async controlerElecteurs(electeurs, transaction) {
    const erreurs = [];

    for (const electeur of electeurs) {
      // Validation du format de la carte d'identité
      if (!this.validateCIN(electeur.numCarteIdentite)) {
        erreurs.push({
          type: 'FORMAT_CIN',
          electeur: electeur.numCarteIdentite,
          message: 'Format de CIN invalide'
        });
      }

      // Validation du numéro d'électeur
      if (!this.validateNumElecteur(electeur.numCarteElecteur)) {
        erreurs.push({
          type: 'FORMAT_NUM_ELECTEUR',
          electeur: electeur.numCarteElecteur,
          message: 'Format de numéro d\'électeur invalide'
        });
      }

      // Vérification de l'unicité
      const exists = await this.checkElecteurExists(
        electeur.numCarteIdentite,
        electeur.numCarteElecteur,
        transaction
      );
      if (exists) {
        erreurs.push({
          type: 'DUPLICATE',
          electeur: electeur.numCarteElecteur,
          message: 'Électeur déjà enregistré'
        });
      }

      // Validation des caractères spéciaux
      if (this.containsSpecialChars(electeur.nom) || this.containsSpecialChars(electeur.prenom)) {
        erreurs.push({
          type: 'SPECIAL_CHARS',
          electeur: electeur.numCarteElecteur,
          message: 'Caractères spéciaux non autorisés'
        });
      }
    }

    return erreurs;
  }

  async validerImportation(userId) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Vérifier qu'il n'y a pas d'importation en cours
      if (await this.isImportationEnCours()) {
        throw new Error('IMPORTATION_EN_COURS');
      }

      // 2. Transférer les données de la table temporaire
      const electeursTemp = await ElecteurTemp.findAll({ transaction });
      await Electeur.bulkCreate(
        electeursTemp.map(e => e.toJSON()),
        { transaction }
      );

      // 3. Vider la table temporaire
      await ElecteurTemp.destroy({ truncate: true, transaction });

      // 4. Mettre à jour l'état global
      await this.setEtatUploadElecteurs(false, transaction);

      await transaction.commit();
      return { success: true, message: 'Importation validée avec succès' };

    } catch (error) {
      await transaction.rollback();
      logger.error('Erreur validation importation:', error);
      throw error;
    }
  }

  // Méthodes utilitaires
  validateCIN(cin) {
    return /^\d{13}$/.test(cin);
  }

  validateNumElecteur(num) {
    return /^[A-Z]{2}\d{8}$/.test(num);
  }

  containsSpecialChars(str) {
    return /[^a-zA-Z\s-]/.test(str);
  }

  async checkElecteurExists(cin, numElecteur, transaction) {
    const count = await Electeur.count({
      where: {
        [Sequelize.Op.or]: [
          { numCarteIdentite: cin },
          { numCarteElecteur: numElecteur }
        ]
      },
      transaction
    });
    return count > 0;
  }

  async logUploadAttempt(userId, ipAddress, checksum, status, message, transaction) {
    await HistoriqueUpload.create({
      userId,
      ipAddress,
      checksum,
      statut: status,
      message,
      dateUpload: new Date()
    }, { transaction });
  }

  async lireFichierCSV(filePath) {
    return new Promise(async (resolve, reject) => {
      const results = [];
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        Readable.from(fileContent)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async insererElecteurs(electeurs, transaction) {
    for (const electeur of electeurs) {
      await Electeur.create(electeur, { transaction });
    }
  }

  async getTentativesUpload(userId) {
    try {
      return await TentativeUpload.findAll({
        where: { utilisateurId: userId },
        include: [{
          model: FichierElectoral,
          as: 'fichier'
        }],
        order: [['dateTentative', 'DESC']]
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des tentatives:', error);
      throw error;
    }
  }
}

module.exports = new FichierElectoralService(); 