const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // 用戶註冊
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      console.log('Register attempt:', { username, email });

      // 輸入驗證
      if (!username || !email || !password) {
        return res.status(400).json({ message: '所有字段都是必需的' });
      }

      // 密碼長度驗證
      if (password.length < 6) {
        return res.status(400).json({ message: '密碼長度至少需要6個字符' });
      }

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

      // 密碼加密
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 創建新用戶
      const user = await User.create({
        name: username,
        username,
        email,
        password: hashedPassword
      });

      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',  // 添加默認值防止未定義
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
        error: error.message || '服務器內部錯誤'
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