const bcrypt = require('bcryptjs')
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
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
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user'
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    systemName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'OA System'
    }
  }, {
    tableName: 'Users',
    timestamps: true
  });

  return User;
}; 