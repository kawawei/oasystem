const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  console.log('Auth middleware accessed');
  console.log('Headers:', req.headers);
  try {
    // 從請求頭獲取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '未提供認證令牌' });
    }

    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 檢查用戶是否存在
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '用戶不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('認證錯誤:', error);
    res.status(401).json({ message: '認證失敗' });
  }
};

module.exports = authMiddleware; 