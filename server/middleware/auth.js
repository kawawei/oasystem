const jwt = require('jsonwebtoken')
const { User } = require('../models')

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: '未提供認證令牌' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)
    
    if (!user) {
      return res.status(401).json({ message: '用戶不存在' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '認證令牌已過期' })
    }
    res.status(401).json({ message: '無效的認證令牌' })
  }
}

module.exports = authMiddleware 