import express, { Router } from 'express'
import taskController from '../controllers/task.controller'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

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

// 獲取單個任務
router.get('/:id', taskController.getTask)

// 更新任務階段狀態
router.put('/:taskId/stages/:stageId/status', taskController.updateStageStatus)

// 更新任務階段依賴關係
router.put('/:taskId/stages/:stageId/dependencies', taskController.updateStageDependencies)

// 從模板創建任務
router.post('/from-template/:templateId', taskController.createFromTemplate)

// 獲取任務評論
router.get('/:taskId/comments', taskController.getComments)

// 添加任務評論
router.post('/:taskId/comments', taskController.addComment)

export default router
