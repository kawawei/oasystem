const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// 獲取當前用戶的所有任務
router.get('/', auth, taskController.getAllTasks);

// 獲取特定任務
router.get('/:id', auth, taskController.getTask);

// 創建新任務
router.post('/', auth, taskController.createTask);

// 更新任務
router.put('/:id', auth, taskController.updateTask);

// 刪除任務
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router; 