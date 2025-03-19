// models/fichierElectoral.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FichierElectoral extends Model {
    static associate(models) {
      FichierElectoral.belongsTo(models.Utilisateur, {
        foreignKey: 'utilisateurId',
        as: 'importePar'
      });
      FichierElectoral.hasMany(models.TentativeUpload, {
        foreignKey: 'fichierId',
        as: 'tentatives'
      });
    }

    async validerChecksum() {
      // Logique de validation à implémenter
    }

    async importerDonnees() {
      // Logique d'importation à implémenter
    }
  }

  FichierElectoral.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nomFichier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    checksum: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateTimeImport: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    etatFichier: {
      type: DataTypes.ENUM('VALIDE', 'REJETE'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FichierElectoral',
    tableName: 'fichiers_electoraux',
    timestamps: true,
    underscored: true
  });

  return FichierElectoral;
};