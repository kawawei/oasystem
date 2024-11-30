import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { User } from '../entities/User.entity'

const router = Router()

// 註冊
router.post('/register', authController.register)

// 登入
router.post('/login', authController.login)

// 獲取當前用戶信息
router.get('/me', authController.getCurrentUser)

// 臨時路由：獲取所有用戶（僅用於開發測試）
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find({
      select: ['id', 'username', 'email', 'role', 'status', 'createdAt', 'updatedAt']
    })
    console.log('Found users:', users)
    res.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ success: false, error: '獲取用戶列表失敗' })
  }
})

export default router 