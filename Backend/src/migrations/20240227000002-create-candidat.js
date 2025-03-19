'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('candidats', {
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
      num_carte_electeur: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      nom_parti: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slogan: {
        type: Sequelize.STRING
      },
      photo: {
        type: Sequelize.STRING
      },
      couleurs: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      infos: {
        type: Sequelize.TEXT
      },
      code_authentification: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
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

    await queryInterface.addIndex('candidats', ['num_carte_electeur'], {
      unique: true,
      name: 'idx_candidats_carte_electeur'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('candidats');
  }
}; 