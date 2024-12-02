const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body
      console.log('Login attempt:', { username })
      
      const user = await User.findOne({ where: { username } })
      console.log('Found user:', user ? 'yes' : 'no')
      
      if (!user) {
        return res.status(401).json({ message: '用戶名或密碼錯誤' })
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      console.log('Password valid:', isValidPassword)
      
      if (!isValidPassword) {
        return res.status(401).json({ message: '用戶名或密碼錯誤' })
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ message: '伺服器錯誤' })
    }
  },

  async register(req, res) {
    try {
      const { username, email, password } = req.body
      console.log('Register attempt:', { username, email })
      
      // 檢查用戶名是否已存在
      const existingUser = await User.findOne({ where: { username } })
      if (existingUser) {
        return res.status(400).json({ message: '用戶名已存在' })
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 10)

      // 創建新用戶
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: 'user'
      })

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      })
    } catch (error) {
      console.error('Register error details:', error)
      res.status(500).json({ 
        message: '伺服器錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

// 臨時添加，測試後可以移除
async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('Hashed password:', hashedPassword)
  return hashedPassword
}

// 在控制器中調用一次
hashPassword('123456')

module.exports = authController 