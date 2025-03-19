'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parrainages', {
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
      electeur_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'electeurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      periode_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'periodes_parrainage',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date_parrainage: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      code_verification: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      statut: {
        type: Sequelize.ENUM('EN_ATTENTE', 'VALIDE', 'REJETE'),
        allowNull: false,
        defaultValue: 'EN_ATTENTE'
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

    await queryInterface.addIndex('parrainages', ['electeur_id', 'periode_id'], {
      unique: true,
      name: 'idx_parrainage_unique_par_periode'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('parrainages');
  }
}; 