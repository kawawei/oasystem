const { Sequelize } = require('sequelize')
const UserModel = require('./user.model')
const TaskModel = require('./task.model')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
)

const User = UserModel(sequelize)
const Task = TaskModel(sequelize)

User.hasMany(Task, {
  foreignKey: 'assignedTo',
  as: 'assignedTasks'
})

User.hasMany(Task, {
  foreignKey: 'createdBy',
  as: 'createdTasks'
})

Task.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee'
})

Task.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
})

module.exports = {
  sequelize,
  User,
  Task
} 