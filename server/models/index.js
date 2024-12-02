const { Sequelize } = require('sequelize')
const UserModel = require('./user.model')
const TaskModel = require('./task.model')
const ProjectModel = require('./project.model')
const PhaseModel = require('./phase.model')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production'
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

const User = UserModel(sequelize)
const Task = TaskModel(sequelize)
const Project = ProjectModel(sequelize)
const Phase = PhaseModel(sequelize)

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

Project.hasMany(Phase, {
  foreignKey: 'projectId',
  as: 'phases'
})

Phase.belongsTo(Project, {
  foreignKey: 'projectId'
})

User.hasMany(Project, {
  foreignKey: 'createdBy',
  as: 'createdProjects'
})

Project.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
})

Phase.hasMany(Task, {
  foreignKey: 'phaseId',
  as: 'tasks'
})

Task.belongsTo(Phase, {
  foreignKey: 'phaseId',
  as: 'phase'
})

User.hasMany(Phase, {
  foreignKey: 'assignedTo',
  as: 'assignedPhases'
})

Phase.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee'
})

module.exports = {
  sequelize,
  User,
  Task,
  Project,
  Phase
} 