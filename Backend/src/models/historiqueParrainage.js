// models/historiqueParrainage.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HistoriqueParrainage extends Model {
    static associate(models) {
      HistoriqueParrainage.belongsTo(models.Candidat, {
        foreignKey: 'candidatId',
        as: 'candidat'
      });
    }

    async mettreAJour() {
      // Logique de mise à jour à implémenter
    }

    async genererRapport() {
      // Logique de génération de rapport à implémenter
    }
  }

  HistoriqueParrainage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    candidatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombreParrainages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dateEnregistrement: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'HistoriqueParrainage',
    tableName: 'historique_parrainages',
    timestamps: true,
    underscored: true
  });

  return HistoriqueParrainage;
};