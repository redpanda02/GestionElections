'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fichiers_electoraux', {
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
      nom_fichier: {
        type: Sequelize.STRING,
        allowNull: false
      },
      checksum: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date_time_import: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      etat_fichier: {
        type: Sequelize.ENUM('VALIDE', 'REJETE'),
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
    await queryInterface.dropTable('fichiers_electoraux');
  }
}; 