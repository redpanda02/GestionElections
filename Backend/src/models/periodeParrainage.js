// models/periodeParrainage.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PeriodeParrainage extends Model {
    static associate(models) {
      PeriodeParrainage.hasMany(models.Parrainage, {
        foreignKey: 'periodeId',
        as: 'parrainages'
      });
    }

    async ouvrirPeriode() {
      // Logique d'ouverture à implémenter
    }

    async fermerPeriode() {
      // Logique de fermeture à implémenter
    }

    async verifierEtat() {
      // Logique de vérification à implémenter
    }
  }

  PeriodeParrainage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      type: DataTypes.ENUM('OUVERT', 'FERME'),
      allowNull: false,
      defaultValue: 'FERME'
    }
  }, {
    sequelize,
    modelName: 'PeriodeParrainage',
    tableName: 'periodes_parrainage',
    timestamps: true,
    underscored: true,
    validate: {
      dateFinApresDateDebut() {
        if (this.dateFin <= this.dateDebut) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
      }
    }
  });

  return PeriodeParrainage;
};