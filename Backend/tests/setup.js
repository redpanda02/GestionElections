// Configurer le timeout global pour les tests
jest.setTimeout(30000);

// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.PORT = 4000;

const { sequelize } = require('../src/models');
const logger = require('../src/config/logger');

// Désactiver les logs pendant les tests
logger.transports.forEach((t) => (t.silent = true));

beforeAll(async () => {
  // Connexion à la base de données de test
  try {
    await sequelize.authenticate();
    // Synchroniser les modèles avec la base de données de test
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Erreur de connexion à la base de données de test:', error);
  }
});

afterAll(async () => {
  // Fermer la connexion après les tests
  await sequelize.close();
});