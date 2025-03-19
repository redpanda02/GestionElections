'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('electeurs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      utilisateur_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'utilisateurs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      num_carte_identite: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      num_carte_electeur: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      date_naissance: {
        type: Sequelize.DATE,
        allowNull: false
      },
      lieu_naissance: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sexe: {
        type: Sequelize.ENUM('M', 'F'),
        allowNull: false
      },
      bureau_vote: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex('electeurs', ['num_carte_electeur'], {
      unique: true,
      name: 'idx_electeurs_carte_electeur'
    });

    await queryInterface.addIndex('electeurs', ['num_carte_identite'], {
      unique: true,
      name: 'idx_electeurs_carte_identite'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('electeurs');
  }
}; 