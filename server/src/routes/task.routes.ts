import { Router } from 'express'
import taskController from '../controllers/task.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 所有路由都需要認證
router.use(authMiddleware)

// 獲取任務列表
router.get('/', taskController.getTasks)

// 創建任務
router.post('/', taskController.createTask)

// 更新任務
router.put('/:id', taskController.updateTask)

// 刪除任務
router.delete('/:id', taskController.deleteTask)

export default router
