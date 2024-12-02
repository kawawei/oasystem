const { Task, User, Phase } = require('../models')
const { Op } = require('sequelize')

const taskController = {
  // 獲取任務列表
  async getTasks(req, res) {
    try {
      const tasks = await Task.findAll({
        where: {
          [Op.or]: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ]
        },
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'username']
          },
          {
            model: Phase,
            as: 'phase',
            attributes: ['id', 'title', 'projectId']
          }
        ],
        order: [['createdAt', 'DESC']]
      })
      res.json(tasks)
    } catch (error) {
      console.error('Get tasks error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  },

  // 創建任務
  async createTask(req, res) {
    try {
      const task = await Task.create({
        ...req.body,
        createdBy: req.user.id,
        assignedTo: req.user.id
      })
      res.status(201).json(task)
    } catch (error) {
      console.error('Create task error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  },

  // 更新任務
  async updateTask(req, res) {
    try {
      const [updated] = await Task.update(req.body, {
        where: { 
          id: req.params.id,
          [Op.or]: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ]
        }
      })
      if (!updated) {
        return res.status(404).json({ message: '任務不存在或無權限' })
      }
      const task = await Task.findByPk(req.params.id)
      res.json(task)
    } catch (error) {
      console.error('Update task error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  },

  // 刪除任務
  async deleteTask(req, res) {
    try {
      const deleted = await Task.destroy({
        where: {
          id: req.params.id,
          [Op.or]: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ]
        }
      })
      if (!deleted) {
        return res.status(404).json({ message: '任務不存在或無權限' })
      }
      res.status(204).end()
    } catch (error) {
      console.error('Delete task error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  }
}

module.exports = taskController 