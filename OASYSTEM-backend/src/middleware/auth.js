const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // 從請求頭獲取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '未提供認證令牌' });
    }

    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token 驗證錯誤:', error);
    res.status(401).json({ message: '無效的認證令牌' });
  }
};

module.exports = authMiddleware; 