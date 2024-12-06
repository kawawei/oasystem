const { Task } = require('../models');

const taskController = {
  // 獲取所有任務
  getAllTasks: async (req, res) => {
    try {
      const tasks = await Task.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
      res.json(tasks);
    } catch (error) {
      console.error('獲取任務失敗:', error);
      res.status(500).json({ message: '獲取任務失敗', error: error.message });
    }
  },

  // 創建任務
  createTask: async (req, res) => {
    try {
      const { title, description, priority, dueDate } = req.body;
      const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        userId: req.user.id
      });
      res.status(201).json(task);
    } catch (error) {
      console.error('創建任務失敗:', error);
      res.status(500).json({ message: '創建任務失敗', error: error.message });
    }
  },

  // 更新任務
  updateTask: async (req, res) => {
    try {
      const task = await Task.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });
      
      if (!task) {
        return res.status(404).json({ message: '任務不存在' });
      }
      
      await task.update(req.body);
      res.json(task);
    } catch (error) {
      console.error('更新任務失敗:', error);
      res.status(500).json({ message: '更新任務失敗', error: error.message });
    }
  },

  // 刪除任務
  deleteTask: async (req, res) => {
    try {
      const result = await Task.destroy({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });
      
      if (!result) {
        return res.status(404).json({ message: '任務不存在' });
      }
      
      res.json({ message: '任務已刪除' });
    } catch (error) {
      console.error('刪除任務失敗:', error);
      res.status(500).json({ message: '刪除任務失敗', error: error.message });
    }
  }
};

module.exports = taskController; 