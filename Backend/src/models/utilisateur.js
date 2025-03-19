// models/utilisateur.js
const { Model, DataTypes } = require('sequelize');

class Utilisateur extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      motDePasse: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'CANDIDAT', 'ELECTEUR'),
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Utilisateur',
      tableName: 'utilisateurs',
      timestamps: true,
      underscored: true
    });

    return this;
  }

  static associate(models) {
    this.hasOne(models.Candidat, {
      foreignKey: 'utilisateurId',
      as: 'candidat'
    });
    
    this.hasOne(models.Electeur, {
      foreignKey: 'utilisateurId',
      as: 'electeur'
    });
    
    this.hasMany(models.FichierElectoral, {
      foreignKey: 'utilisateurId',
      as: 'fichiersImportes'
    });
    
    this.hasMany(models.TentativeUpload, {
      foreignKey: 'utilisateurId',
      as: 'tentativesUpload'
    });
  }

  async authentifier() {
    // Logique d'authentification à implémenter
  }
}

module.exports = Utilisateur;