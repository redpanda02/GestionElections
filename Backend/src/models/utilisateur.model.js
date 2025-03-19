const { Model, DataTypes } = require('sequelize');

class Utilisateur extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
      nom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'ELECTEUR', 'CANDIDAT'),
        defaultValue: 'ELECTEUR'
      },
      cni: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      nce: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    }, {
      sequelize,
      modelName: 'Utilisateur',
      tableName: 'utilisateurs'
    });
  }
}

module.exports = Utilisateur;