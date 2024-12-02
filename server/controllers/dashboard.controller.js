const { Task, User } = require('../models')
const { Op, Sequelize } = require('sequelize')

const dashboardController = {
  async getDashboardData(req, res) {
    try {
      // 獲取任務統計
      const stats = await Task.findAll({
        where: {
          [Op.or]: [
            { assignedTo: req.user.id },
            { createdBy: req.user.id }
          ]
        },
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
        ],
        group: ['status'],
        raw: true
      })

      console.log('Task stats:', stats)

      // 獲取最近任務
      const recentTasks = await Task.findAll({
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
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      })

      // 格式化統計數據
      const taskStats = {
        pendingTasks: parseInt(stats.find(s => s.status === 'pending')?.count || 0),
        inProgressTasks: parseInt(stats.find(s => s.status === 'in_progress')?.count || 0),
        completedTasks: parseInt(stats.find(s => s.status === 'completed')?.count || 0)
      }

      console.log('Formatted stats:', taskStats)

      res.json({
        stats: taskStats,
        recentTasks
      })
    } catch (error) {
      console.error('Dashboard error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  }
}

module.exports = dashboardController 