const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// 登入路由
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;

    // 查找用戶
    const user = await User.findOne({ where: { username } });
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 驗證密碼
    const isValid = await user.validatePassword(password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 檢查用戶狀態
    console.log('User status:', user.status);
    if (user.status !== 'active') {
      console.log('Account inactive');
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful');
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 