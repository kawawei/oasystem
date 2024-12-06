const { User } = require('../models');

const userController = {
  // 獲取所有用戶
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email']  // 只返回必要的字段
      });
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ 
        message: '獲取用戶列表失敗',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = userController; 