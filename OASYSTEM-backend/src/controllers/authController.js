const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const authController = {
  // 用戶註冊
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      console.log('Register attempt:', { username, email });

      // 檢查用戶名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: '用戶名已存在' });
      }

      // 檢查郵箱是否已存在
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: '郵箱已被註冊' });
      }

      // 創建新用戶
      const user = await User.create({
        username,
        email,
        password
      });

      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: '註冊成功',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Register error details:', error);
      res.status(500).json({ 
        message: '註冊失敗',
        error: error.message
      });
    }
  },

  // 用戶登入
  async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', { username });

      // 驗證請求數據
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用戶名和密碼都是必須的'
        });
      }

      // 查找用戶
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤'
        });
      }

      // 驗證密碼
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用戶名或密碼錯誤'
        });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
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
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: '登入過程中發生錯誤'
      });
    }
  }
};

module.exports = authController; 