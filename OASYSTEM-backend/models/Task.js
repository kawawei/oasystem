const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('低', '中', '高'),
    defaultValue: '中'
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  assignee_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  creator_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true, // 自動添加 createdAt 和 updatedAt
  paranoid: true    // 軟刪除
});

// 關聯關係
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignee_id' });
Task.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });

module.exports = Task; 