const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');

// 使用認證中間件保護所有用戶路由
router.use(authMiddleware);

// 獲取用戶信息
router.get('/profile', async (req, res) => {
  try {
    // TODO: 從 JWT 中獲取用戶 ID
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '未授權' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email'] // 只返回安全的用戶信息
    });

    if (!user) {
      return res.status(404).json({ message: '用戶不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('獲取用戶信息錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
});

// 更新用戶信息
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { email } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '未授權' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用戶不存在' });
    }

    // 更新用戶信息
    await user.update({ email });

    res.json({ message: '更新成功', user: {
      id: user.id,
      username: user.username,
      email: user.email
    }});
  } catch (error) {
    console.error('更新用戶信息錯誤:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
});

module.exports = router; 