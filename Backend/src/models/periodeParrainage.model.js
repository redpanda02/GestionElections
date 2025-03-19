const { Model, DataTypes } = require('sequelize');

class PeriodeParrainage extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      dateDebut: {
        type: DataTypes.DATE,
        allowNull: false
      },
      dateFin: {
        type: DataTypes.DATE,
        allowNull: false
      },
      etat: {
        type: DataTypes.ENUM('FERMEE', 'OUVERTE', 'TERMINEE'),
        defaultValue: 'FERMEE'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'PeriodeParrainage',
      tableName: 'periodes_parrainage'
    });
  }

  static associate(models) {
    this.hasMany(models.Parrainage, {
      foreignKey: 'periodeId',
      as: 'parrainages'
    });
  }
}

module.exports = PeriodeParrainage; 