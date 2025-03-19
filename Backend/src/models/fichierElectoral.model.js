const { Model, DataTypes } = require('sequelize');

class FichierElectoral extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      chemin: {
        type: DataTypes.STRING,
        allowNull: false
      },
      statut: {
        type: DataTypes.ENUM('EN_ATTENTE', 'TRAITE', 'ERREUR'),
        defaultValue: 'EN_ATTENTE'
      },
      checksum: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dateTraitement: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'FichierElectoral',
      tableName: 'fichiers_electoraux'
    });
  }

  static associate(models) {
    this.belongsTo(models.Utilisateur, {
      foreignKey: 'utilisateurId',
      as: 'utilisateur'
    });
  }
}

module.exports = FichierElectoral; 