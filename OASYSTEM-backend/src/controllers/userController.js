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
  },
  // 獲取用戶個人資料
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'email', 'avatar', 'systemName']
      });

      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: '獲取用戶資料失敗' });
    }
  }
};

module.exports = userController; 