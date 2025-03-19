const nodemailer = require('nodemailer');
const twilio = require('twilio');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const cache = require('../config/redis');

class NotificationService {
  constructor() {
    // Configuration email
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Configuration SMS
    this.smsClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendEmail(to, subject, template, data) {
    try {
      const htmlContent = await this.renderEmailTemplate(template, data);
      
      const result = await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html: htmlContent
      });

      logger.info('Email envoyé avec succès', { to, subject, messageId: result.messageId });
      return result;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email', { error, to, subject });
      throw error;
    }
  }

  async sendSMS(to, message) {
    try {
      const result = await this.smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      logger.info('SMS envoyé avec succès', { to, messageId: result.sid });
      return result;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi du SMS', { error, to });
      throw error;
    }
  }

  async generateParrainageReport(parrainageId) {
    try {
      const parrainage = await cache.get(`parrainage:${parrainageId}`);
      if (!parrainage) {
        throw new Error('Parrainage non trouvé');
      }

      const doc = new PDFDocument();
      const filename = `parrainage-${parrainageId}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads', filename);

      doc.pipe(fs.createWriteStream(filePath));

      // En-tête du document
      doc.fontSize(25).text('Attestation de Parrainage', { align: 'center' });
      doc.moveDown();

      // Informations du parrainage
      doc.fontSize(12);
      doc.text(`Code de vérification: ${parrainage.codeVerification}`);
      doc.text(`Date: ${new Date(parrainage.createdAt).toLocaleDateString()}`);
      doc.moveDown();

      // Informations du candidat
      doc.text(`Candidat: ${parrainage.candidat.nom} ${parrainage.candidat.prenom}`);
      doc.moveDown();

      // Informations de l'électeur
      doc.text(`Électeur: ${parrainage.electeur.nom} ${parrainage.electeur.prenom}`);
      doc.text(`Numéro carte électeur: ${parrainage.electeur.numCarteElecteur}`);
      doc.moveDown();

      // QR Code pour la vérification
      const qrCode = await this.generateQRCode(parrainage.codeVerification);
      doc.image(qrCode, { width: 100 });

      doc.end();

      logger.info('Rapport de parrainage généré', { parrainageId, filename });
      return filename;
    } catch (error) {
      logger.error('Erreur lors de la génération du rapport', { error, parrainageId });
      throw error;
    }
  }

  async generateStatisticsReport(periodeId) {
    try {
      const stats = await cache.get(`stats:periode:${periodeId}`);
      if (!stats) {
        throw new Error('Statistiques non trouvées');
      }

      const doc = new PDFDocument();
      const filename = `statistiques-${periodeId}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads', filename);

      doc.pipe(fs.createWriteStream(filePath));

      // Titre
      doc.fontSize(25).text('Rapport de Statistiques', { align: 'center' });
      doc.moveDown();

      // Période
      doc.fontSize(14);
      doc.text(`Période: ${stats.periode.dateDebut} - ${stats.periode.dateFin}`);
      doc.moveDown();

      // Statistiques globales
      doc.fontSize(16).text('Statistiques Globales');
      doc.fontSize(12);
      doc.text(`Total parrainages: ${stats.totalParrainages}`);
      doc.text(`Parrainages validés: ${stats.parrainagesValides}`);
      doc.text(`Parrainages en attente: ${stats.parrainagesEnAttente}`);
      doc.moveDown();

      // Statistiques par région
      doc.fontSize(16).text('Répartition par Région');
      doc.fontSize(12);
      Object.entries(stats.parRegion).forEach(([region, count]) => {
        doc.text(`${region}: ${count}`);
      });
      doc.moveDown();

      // Graphiques
      await this.addCharts(doc, stats);

      doc.end();

      logger.info('Rapport de statistiques généré', { periodeId, filename });
      return filename;
    } catch (error) {
      logger.error('Erreur lors de la génération des statistiques', { error, periodeId });
      throw error;
    }
  }

  async notifyParrainageCreation(parrainage) {
    try {
      // Envoi email à l'électeur
      await this.sendEmail(
        parrainage.electeur.email,
        'Confirmation de parrainage',
        'parrainage-confirmation',
        { parrainage }
      );

      // Envoi SMS à l'électeur
      await this.sendSMS(
        parrainage.electeur.telephone,
        `Votre parrainage pour ${parrainage.candidat.nom} a été enregistré. Code de vérification: ${parrainage.codeVerification}`
      );

      // Envoi email au candidat
      await this.sendEmail(
        parrainage.candidat.email,
        'Nouveau parrainage reçu',
        'parrainage-notification',
        { parrainage }
      );

      logger.info('Notifications de parrainage envoyées', { parrainageId: parrainage.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi des notifications', { error, parrainageId: parrainage.id });
      throw error;
    }
  }

  async notifyPeriodeStatus(periode) {
    try {
      const candidats = await cache.get('candidats:actifs');
      const admins = await cache.get('utilisateurs:admins');

      // Notification aux candidats
      for (const candidat of candidats) {
        await this.sendEmail(
          candidat.email,
          `Période de parrainage ${periode.etat}`,
          'periode-status',
          { periode, candidat }
        );
      }

      // Notification aux administrateurs
      for (const admin of admins) {
        await this.sendEmail(
          admin.email,
          `Période de parrainage ${periode.etat}`,
          'periode-status-admin',
          { periode }
        );
      }

      logger.info('Notifications de changement de période envoyées', { periodeId: periode.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi des notifications de période', { error, periodeId: periode.id });
      throw error;
    }
  }
}

module.exports = new NotificationService(); 