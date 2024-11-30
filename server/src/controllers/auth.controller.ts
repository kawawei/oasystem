import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../entities/User.entity'
import { AppError } from '../utils/AppError'

export const authController = {
  // 註冊
  register: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body
      
      // 檢查用戶是否已存在
      const existingUser = await User.findOne({ 
        where: [{ username }, { email }] 
      })
      
      if (existingUser) {
        throw new AppError('用戶名或郵箱已存在', 400)
      }

      // 創建新用戶
      const user = new User()
      Object.assign(user, { username, email, password })
      await user.save()

      res.status(201).json({
        success: true,
        message: '註冊成功'
      })
    } catch (error) {
      throw new AppError('註冊失敗', 500)
    }
  },

  // 登入
  login: async (req: Request, res: Response) => {
    try {
      console.log('Login request body:', req.body)  // 添加請求體日誌
      const { username, password } = req.body

      // 查找用戶
      const user = await User.findOne({ where: { username } })
      console.log('Found user:', user)  // 添加用戶查詢結果日誌

      if (!user) {
        throw new AppError('用戶名或密碼錯誤', 401);
      }

      const isValidPassword = await user.comparePassword(password);
      console.log('Password valid:', isValidPassword);  // 添加日誌

      if (!isValidPassword) {
        throw new AppError('用戶名或密碼錯誤', 401);
      }

      // 生成 token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error details:', error)
      res.status(500).json({ 
        success: false, 
        error: '登入失敗',
        details: (error as Error).message  // 添加類型斷言
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