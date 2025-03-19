// models/tentativeUpload.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TentativeUpload extends Model {
    static associate(models) {
      TentativeUpload.belongsTo(models.Utilisateur, {
        foreignKey: 'utilisateurId',
        as: 'utilisateur'
      });
      TentativeUpload.belongsTo(models.FichierElectoral, {
        foreignKey: 'fichierId',
        as: 'fichier'
      });
    }

    async enregistrerTentative() {
      // Logique d'enregistrement à implémenter
    }
  }

  TentativeUpload.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    utilisateurId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fichierId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    adresseIP: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateTentative: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    statut: {
      type: DataTypes.ENUM('SUCCES', 'ECHEC'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'TentativeUpload',
    tableName: 'tentatives_upload',
    timestamps: true,
    underscored: true
  });

  return TentativeUpload;
};