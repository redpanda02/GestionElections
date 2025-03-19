'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tentatives_upload', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fichier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fichiers_electoraux',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      adresse_ip: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date_tentative: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      statut: {
        type: Sequelize.ENUM('SUCCES', 'ECHEC'),
        allowNull: false
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
    await queryInterface.dropTable('tentatives_upload');
  }
}; 