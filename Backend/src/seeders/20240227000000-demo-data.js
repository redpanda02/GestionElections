'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Création d'un utilisateur admin
    const adminUser = await queryInterface.bulkInsert('utilisateurs', [{
      nom: 'Admin',
      prenom: 'System',
      email: 'admin@example.com',
      mot_de_passe: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date()
    }], { returning: true });

    // Création d'une période de parrainage
    await queryInterface.bulkInsert('periodes_parrainage', [{
      date_debut: new Date(),
      date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      etat: 'FERME',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('periodes_parrainage', null, {});
    await queryInterface.bulkDelete('utilisateurs', null, {});
  }
}; 