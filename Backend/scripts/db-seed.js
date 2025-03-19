const { sequelize } = require('../src/models');
const bcrypt = require('bcrypt');
const logger = require('../src/config/logger');

async function seed() {
  try {
    // Création de l'administrateur par défaut
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    await sequelize.models.Utilisateur.create({
      email: 'admin@parrainage-electoral.com',
      password: adminPassword,
      role: 'ADMIN',
      nom: 'Admin',
      prenom: 'System'
    });

    // Création d'une période de parrainage
    const now = new Date();
    await sequelize.models.PeriodeParrainage.create({
      dateDebut: now,
      dateFin: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      etat: 'FERME',
      description: 'Période de test'
    });

    logger.info('Base de données initialisée avec succès');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

seed(); 