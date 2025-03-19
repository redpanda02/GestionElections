// models/electeur.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Electeur extends Model {
    static associate(models) {
      Electeur.belongsTo(models.Utilisateur, {
        foreignKey: 'utilisateurId',
        as: 'utilisateur'
      });
      Electeur.hasMany(models.Parrainage, {
        foreignKey: 'electeurId',
        as: 'parrainages'
      });
    }

    async verifierEligibilite() {
      // Logique de vérification à implémenter
    }
  }

  Electeur.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    numCarteIdentite: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    numCarteElecteur: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    dateNaissance: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lieuNaissance: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sexe: {
      type: DataTypes.ENUM('M', 'F'),
      allowNull: false
    },
    bureauVote: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Electeur',
    tableName: 'electeurs',
    timestamps: true,
    underscored: true
  });

  return Electeur;
};