import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../entities/User.entity'
import { AppError } from '../utils/AppError'

export const authController = {
  // 註冊
  register: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body
      // 清理輸入值
      const cleanUsername = username.trim()
      const cleanEmail = email.trim()
      console.log('Register attempt:', { username: cleanUsername, email: cleanEmail })
      
      // 檢查用戶是否已存在
      const existingUser = await User.findOne({ 
        where: [{ username: cleanUsername }, { email: cleanEmail }] 
      })
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用戶名或郵箱已存在'
        })
      }

      // 創建新用戶
      const user = new User()
      Object.assign(user, { 
        username: cleanUsername, 
        email: cleanEmail, 
        password,
        role: 'user',
        status: 'active'
      })
      
      await user.save()
      console.log('User registered successfully:', { username: cleanUsername })

      res.status(201).json({
        success: true,
        message: '註冊成功'
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({
        success: false,
        message: '註冊失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  },

  // 登入
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body
      // 清理輸入值
      const cleanUsername = username.trim()
      console.log('Login attempt:', { username: cleanUsername })

      // 查找用戶
      const user = await User.findOne({ where: { username: cleanUsername } })
      console.log('User found:', user ? 'yes' : 'no')

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤'
        })
      }

      const isValidPassword = await user.comparePassword(password)
      console.log('Password validation:', isValidPassword ? 'success' : 'failed')

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤'
        })
      }

      // 生成 token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      )

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        message: '登入失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  },

  // 添加 getCurrentUser 方法
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ where: { id: req.user?.id } })
      if (!user) {
        throw new AppError('用戶不存在', 404)
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      })
    } catch (error) {
      throw new AppError('獲取用戶信息失敗', 500)
    }
  }
} 