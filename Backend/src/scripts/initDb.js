const { sequelize } = require('../models');
const logger = require('../config/logger');

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Connection à la base de données établie avec succès.');

    // Synchronisation des modèles avec la base de données
    // Force: true va supprimer et recréer les tables (à utiliser avec précaution)
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    logger.info('Base de données synchronisée avec succès.');

    // Création des contraintes et index
    await createConstraints();
    logger.info('Contraintes et index créés avec succès.');

  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

async function createConstraints() {
  const queryInterface = sequelize.getQueryInterface();

  // Ajout des contraintes de clés étrangères
  await queryInterface.addConstraint('candidats', {
    fields: ['utilisateur_id'],
    type: 'foreign key',
    name: 'fk_candidat_utilisateur',
    references: {
      table: 'utilisateurs',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  await queryInterface.addConstraint('electeurs', {
    fields: ['utilisateur_id'],
    type: 'foreign key',
    name: 'fk_electeur_utilisateur',
    references: {
      table: 'utilisateurs',
      field: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Ajout des index
  await queryInterface.addIndex('utilisateurs', {
    fields: ['email'],
    unique: true,
    name: 'idx_utilisateurs_email'
  });

  await queryInterface.addIndex('electeurs', {
    fields: ['num_carte_electeur'],
    unique: true,
    name: 'idx_electeurs_carte'
  });

  await queryInterface.addIndex('parrainages', {
    fields: ['candidat_id', 'electeur_id', 'periode_id'],
    unique: true,
    name: 'idx_parrainage_unique'
  });
}

// Exécution du script
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      logger.info('Initialisation terminée');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Erreur lors de l\'initialisation:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;