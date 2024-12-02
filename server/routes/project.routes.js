const express = require('express')
const router = express.Router()
const projectController = require('../controllers/project.controller')
const authMiddleware = require('../middleware/auth')

// 所有專案路由都需要認證
router.use(authMiddleware)

// 專案 CRUD 路由
router.get('/users', projectController.getUsers)
router.get('/', projectController.getProjects)
router.post('/', projectController.createProject)

module.exports = router 