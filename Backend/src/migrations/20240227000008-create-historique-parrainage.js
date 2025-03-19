'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historique_parrainages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      candidat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'candidats',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre_parrainages: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      date_enregistrement: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true
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
    await queryInterface.dropTable('historique_parrainages');
  }
}; 