'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('periodes_parrainage', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: false
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      etat: {
        type: Sequelize.ENUM('OUVERT', 'FERME'),
        allowNull: false,
        defaultValue: 'FERME'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('periodes_parrainage');
  }
}; 