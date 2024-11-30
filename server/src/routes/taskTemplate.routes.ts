import { Router } from 'express'
import taskTemplateController from '../controllers/taskTemplate.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// 所有路由都需要認證
router.use(authMiddleware)

// 基本 CRUD
router.get('/', taskTemplateController.getTemplates)
router.post('/', taskTemplateController.createTemplate)
router.put('/:id', taskTemplateController.updateTemplate)
router.delete('/:id', taskTemplateController.deleteTemplate)

export default router 