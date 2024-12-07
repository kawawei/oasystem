const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NoteContent = sequelize.define('NoteContent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Notes',
        key: 'id'
      }
    },
    pageNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    tableName: 'NoteContents',
    timestamps: true
  });

  return NoteContent;
}; 