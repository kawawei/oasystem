const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coverStyle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    template: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    paperColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#FFFFFF'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'Notes',
    timestamps: true
  });

  return Note;
}; 