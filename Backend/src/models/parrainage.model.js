const { Model, DataTypes } = require('sequelize');

class Parrainage extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      statut: {
        type: DataTypes.ENUM('EN_ATTENTE', 'VALIDE', 'REJETE'),
        defaultValue: 'EN_ATTENTE'
      },
      codeVerification: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      dateValidation: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Parrainage',
      tableName: 'parrainages'
    });
  }

  static associate(models) {
    this.belongsTo(models.Candidat, {
      foreignKey: 'candidatId',
      as: 'candidat'
    });
    this.belongsTo(models.Electeur, {
      foreignKey: 'electeurId',
      as: 'electeur'
    });
    this.belongsTo(models.PeriodeParrainage, {
      foreignKey: 'periodeId',
      as: 'periode'
    });
  }
}

module.exports = Parrainage; 