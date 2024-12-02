const express = require('express')
const router = express.Router()
const taskController = require('../controllers/task.controller')
const authMiddleware = require('../middleware/auth')

// 所有任務路由都需要認證
router.use(authMiddleware)

// 任務 CRUD 路由
router.get('/', taskController.getTasks)
router.post('/', taskController.createTask)
router.put('/:id', taskController.updateTask)
router.delete('/:id', taskController.deleteTask)

module.exports = router 