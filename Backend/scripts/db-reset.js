const { sequelize } = require('../src/models');
const logger = require('../src/config/logger');

async function reset() {
  try {
    await sequelize.drop();
    await sequelize.sync({ force: true });
    logger.info('Base de données réinitialisée avec succès');
  } catch (error) {
    logger.error('Erreur lors de la réinitialisation de la base de données:', error);
    process.exit(1);
  }
}

reset(); 