// models/parrainage.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Parrainage extends Model {
    static associate(models) {
      Parrainage.belongsTo(models.Candidat, {
        foreignKey: 'candidatId',
        as: 'candidat'
      });
      Parrainage.belongsTo(models.Electeur, {
        foreignKey: 'electeurId',
        as: 'electeur'
      });
      Parrainage.belongsTo(models.PeriodeParrainage, {
        foreignKey: 'periodeId',
        as: 'periode'
      });
    }

    async creerParrainage() {
      // Logique de création à implémenter
    }

    async verifierParrainage() {
      // Logique de vérification à implémenter
    }
  }

  Parrainage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    candidatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    electeurId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    periodeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dateParrainage: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    codeVerification: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    statut: {
      type: DataTypes.ENUM('EN_ATTENTE', 'VALIDE', 'REJETE'),
      allowNull: false,
      defaultValue: 'EN_ATTENTE'
    }
  }, {
    sequelize,
    modelName: 'Parrainage',
    tableName: 'parrainages',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['electeur_id', 'periode_id']
      }
    ]
  });

  return Parrainage;
};