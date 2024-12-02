const { Project, Phase, User } = require('../models')
const { Op } = require('sequelize')

const projectController = {
  // 獲取專案列表
  async getProjects(req, res) {
    try {
      const projects = await Project.findAll({
        where: {
          [Op.or]: [
            { createdBy: req.user.id }
          ]
        },
        include: [
          {
            model: Phase,
            as: 'phases',
            include: [
              {
                model: User,
                as: 'assignee',
                attributes: ['id', 'username']
              }
            ]
          }
        ],
        order: [
          ['createdAt', 'DESC']
        ]
      })
      res.json(projects)
    } catch (error) {
      console.error('Get projects error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  },

  // 創建專案
  async createProject(req, res) {
    try {
      console.log('Creating project with data:', req.body)
      
      // 驗證必要欄位
      if (!req.body.title) {
        return res.status(400).json({ message: '專案標題是必須的' })
      }

      // 格式化日期
      const projectData = {
        ...req.body,
        startDate: req.body.startDate || null,
        endDate: req.body.endDate || null,
        createdBy: req.user.id,
        progress: 0
      }

      console.log('Formatted project data:', projectData)

      const project = await Project.create({
        ...projectData
      })

      // 創建階段
      if (req.body.phases && req.body.phases.length > 0) {
        try {
          const phases = req.body.phases.map((phase, index) => ({
            title: phase.title || `階段 ${index + 1}`,
            description: phase.description || '',
            assignedTo: phase.assignedTo || null,
            dueDate: phase.dueDate || null,
            projectId: project.id,
            order: index,
            status: 'pending',
            progress: 0
          }))

          console.log('Creating phases:', phases)
          await Phase.bulkCreate(phases)
        } catch (phaseError) {
          console.error('Phase creation error:', {
            message: phaseError.message,
            stack: phaseError.stack,
            sql: phaseError.sql,
            sqlMessage: phaseError.sqlMessage
          })
          // 如果創建階段失敗，也刪除專案
          await project.destroy()
          throw phaseError
        }
      }

      const newProject = await Project.findByPk(project.id, {
        include: [
          {
            model: Phase,
            as: 'phases',
            include: [
              {
                model: User,
                as: 'assignee',
                attributes: ['id', 'username']
              }
            ]
          }
        ]
      })

      res.status(201).json(newProject)
    } catch (error) {
      console.error('Create project error:', {
        message: error.message,
        stack: error.stack,
        data: req.body,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        name: error.name,
        code: error.code
      })
      res.status(500).json({ 
        message: '伺服器錯誤',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          sql: error.sql,
          sqlMessage: error.sqlMessage
        } : undefined
      })
    }
  },

  // 獲取用戶列表
  async getUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username']
      })
      res.json(users)
    } catch (error) {
      console.error('Get users error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  }
}

module.exports = projectController 