const { Model, DataTypes } = require('sequelize');
const { Op } = require('sequelize');

class Candidat extends Model {
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
      parti: {
        type: DataTypes.STRING,
        allowNull: true
      },
      slogan: {
        type: DataTypes.STRING,
        allowNull: true
      },
      photo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      couleurParti1: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-Fa-f]{6}$/
        }
      },
      couleurParti2: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-Fa-f]{6}$/
        }
      },
      couleurParti3: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^#[0-9A-Fa-f]{6}$/
        }
      },
      urlPagePersonnelle: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^(\+221|00221)?[76|77|78|70|75]\d{7}$/
        }
      },
      codeAuthentification: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dateExpirationCode: {
        type: DataTypes.DATE,
        allowNull: true
      },
      candidatureValidee: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      dateEnregistrement: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      modelName: 'Candidat',
      tableName: 'candidats',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    });
  }

  static associate(models) {
    this.hasMany(models.Parrainage, {
      foreignKey: 'candidatId',
      as: 'parrainages'
    });
  }

  // Méthode pour vérifier si le candidat peut être modifié
  static async peutEtreModifie(candidatId) {
    const periode = await models.PeriodeParrainage.findOne({
      where: {
        dateDebut: {
          [Op.gt]: new Date()
        }
      }
    });
    return !!periode;
  }
}

module.exports = Candidat; 