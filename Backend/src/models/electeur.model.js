const { Model, DataTypes } = require('sequelize');

class Electeur extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      numCarteElecteur: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[A-Z]{2}\d{8}$/
        }
      },
      numCarteIdentite: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^\d{13}$/
        }
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false
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
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false
      },
      departement: {
        type: DataTypes.STRING,
        allowNull: false
      },
      commune: {
        type: DataTypes.STRING,
        allowNull: false
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          is: /^(\+221|00221)?[76|77|78|70|75]\d{7}$/
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      codeAuthentification: {
        type: DataTypes.STRING,
        allowNull: true
      },
      dateExpirationCode: {
        type: DataTypes.DATE,
        allowNull: true
      },
      profilValide: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      sequelize,
      modelName: 'Electeur',
      tableName: 'electeurs'
    });
  }

  static associate(models) {
    this.hasMany(models.Parrainage, {
      foreignKey: 'electeurId',
      as: 'parrainages'
    });
  }
}

module.exports = Electeur; 