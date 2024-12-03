const { Task, User, Project, Phase } = require('../models')
const { Op } = require('sequelize')

const dashboardController = {
  async getDashboardData(req, res) {
    try {
      const { startDate, endDate } = req.query
      const dateFilter = {}
      
      if (startDate && endDate) {
        dateFilter.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      }

      // 獲取用戶的任務統計
      const taskStats = await Task.findAll({
        where: {
          [Op.or]: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ],
          ...dateFilter
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      })

      // 獲取用戶的專案統計
      const projectStats = await Project.findAll({
        where: { createdBy: req.user.id },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      })

      // 獲取最近的專案
      const recentProjects = await Project.findAll({
        where: { createdBy: req.user.id },
        include: [{
          model: Phase,
          as: 'phases',
          attributes: ['id', 'title', 'status']
        }],
        order: [['updatedAt', 'DESC']],
        limit: 5
      })

      // 獲取任務趨勢數據（最近7天）
      const taskTrends = await Task.findAll({
        where: {
          [Op.or]: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ],
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        attributes: [
          'status',
          'createdAt',
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date']
        ],
        group: ['date', 'status'],
        order: [['date', 'ASC']]
      })

      // 獲取任務優先級統計
      const taskPriorityStats = await Task.findAll({
        where: {
          [Op.or]: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ]
        },
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['priority']
      })

      // 獲取用戶活動數據（最近7天）
      const userActivities = await Promise.all([
        Task.findAll({
          where: {
            [Op.or]: [
              { assignedTo: req.user.id },
              { createdBy: req.user.id }
            ],
            updatedAt: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('updatedAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['date'],
          order: [['date', 'ASC']]
        }),
        Project.findAll({
          where: {
            createdBy: req.user.id,
            updatedAt: {
              [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          },
          attributes: [
            [sequelize.fn('DATE', sequelize.col('updatedAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['date'],
          order: [['date', 'ASC']]
        })
      ])

      res.json({
        taskStats,
        projectStats,
        recentProjects,
        taskTrends,
        taskPriorityStats,
        userActivities: {
          taskActivities: userActivities[0],
          projectActivities: userActivities[1]
        },
        userInfo: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email
        }
      })
    } catch (error) {
      console.error('Get dashboard data error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  }
}

module.exports = dashboardController 