const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NoteContent = sequelize.define('NoteContent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Notes',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pageNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    tableName: 'NoteContents',
    timestamps: true
  });

  return NoteContent;
}; 