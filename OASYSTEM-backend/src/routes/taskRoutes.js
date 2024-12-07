const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Task } = require('../models');

// 獲取任務列表
router.get('/', auth, async (req, res) => {
  try {
    console.log('Getting tasks for user:', req.user.id);
    
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    console.log('Found tasks:', tasks.length);
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: '獲取任務失敗',
      error: error.message
    });
  }
});

// 創建任務
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    console.log('Creating task:', {
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user.id
    });

    const task = await Task.create({
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
      userId: req.user.id
    });
    
    console.log('Task created:', task.id);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: '創建任務失敗',
      error: error.message
    });
  }
});

// 更新任務
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '找不到任務'
      });
    }

    await task.update(req.body);

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 刪除任務
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: '找不到任務'
      });
    }

    await task.destroy();

    res.json({
      success: true,
      message: '刪除成功'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 