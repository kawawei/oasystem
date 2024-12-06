const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// 所有路由都需要驗證
router.use(auth);

// 獲取所有任務
router.get('/', taskController.getAllTasks);

// 創建任務
router.post('/', taskController.createTask);

// 更新任務
router.put('/:id', taskController.updateTask);

// 刪除任務
router.delete('/:id', taskController.deleteTask);

module.exports = router; 