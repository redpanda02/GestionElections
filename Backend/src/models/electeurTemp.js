/*module.exports = (sequelize, DataTypes) => {
    const ElecteurTemp = sequelize.define('ElecteurTemp', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          numeroElecteur: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false
          },
          cin: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false
          },
          nom: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          prenom: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          dateNaissance: {
            type: DataTypes.DATEONLY,
            allowNull: false
          },
          lieuNaissance: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          sexe: {
            type: DataTypes.ENUM('M', 'F'),
            allowNull: false
          },
          bureauVote: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          telephone: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: true
          },
          email: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: true
          }
    }, {
      tableName: 'electeurs_temp',
      timestamps: true
    });
  
    return ElecteurTemp;
  };*/