const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/auth')

// 公開路由
router.post('/login', authController.login)
router.post('/register', authController.register)

// 需要認證的路由
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  })
})

module.exports = router 