// models/candidat.js
const { Model, DataTypes } = require('sequelize');

class Candidat extends Model {
  static init(sequelize) {
    super.init({
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
      numCarteElecteur: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      nomParti: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slogan: {
        type: DataTypes.STRING,
        allowNull: true
      },
      photo: {
        type: DataTypes.STRING
      },
      couleurs: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      infos: {
        type: DataTypes.TEXT
      },
      codeAuthentification: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }, {
      sequelize,
      modelName: 'Candidat',
      tableName: 'candidats',
      timestamps: true,
      underscored: true
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Utilisateur, {
      foreignKey: 'utilisateurId',
      as: 'utilisateur'
    });
    
    this.hasMany(models.Parrainage, {
      foreignKey: 'candidatId',
      as: 'parrainages'
    });
    
    this.hasMany(models.HistoriqueParrainage, {
      foreignKey: 'candidatId',
      as: 'historiqueParrainages'
    });
  }

  async suivreParrainage() {
    // Logique de suivi à implémenter
  }

  async genererCodeAuthentification() {
    // Logique de génération de code à implémenter
  }
}

module.exports = Candidat;