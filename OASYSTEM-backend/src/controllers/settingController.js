const { User } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const settingController = {
  // 更新用戶信息
  async updateProfile(req, res) {
    try {
      console.log('Updating profile for user:', req.user.id);
      console.log('Update data:', req.body);
      
      const { id } = req.user;
      const { username, email, systemName } = req.body;
      
      const user = await User.findByPk(id);
      if (!user) {
        console.log('User not found:', id);
        return res.status(404).json({ message: '用戶不存在' });
      }

      // 更新用戶信息
      console.log('Updating user with data:', { username, email, systemName });
      await user.update({
        username,
        email,
        systemName
      });

      console.log('Update successful');
      res.json({
        message: '更新成功',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          systemName: user.systemName,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: '更新失敗' });
    }
  },

  // 更新密碼
  async updatePassword(req, res) {
    try {
      const { id } = req.user;
      const { currentPassword, newPassword } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      // 驗證當前密碼
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: '當前密碼錯誤' });
      }

      // 加密新密碼
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 更新密碼
      await user.update({ password: hashedPassword });

      res.json({ message: '密碼更新成功' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ message: '密碼更新失敗' });
    }
  },

  // 更新頭像
  async updateAvatar(req, res) {
    try {
      console.log('File received:', req.file);
      const { id } = req.user;
      const avatarUrl = req.fileUrl;
      
      console.log('Avatar URL:', avatarUrl);
      
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }

      await user.update({ avatar: avatarUrl });

      console.log('Updated user:', user.toJSON());
      
      res.json({
        message: '頭像更新成功',
        avatar: avatarUrl
      });
    } catch (error) {
      console.error('Update avatar error:', error);
      res.status(500).json({ message: '頭像更新失敗' });
    }
  },

  // 刪除頭像
  async deleteAvatar(req, res) {
    try {
      console.log('Deleting avatar for user:', req.user.id);
      const { id } = req.user;
      const user = await User.findByPk(id);
      
      if (!user) {
        return res.status(404).json({ message: '用戶不存在' });
      }
      
      // 如果用戶有頭像，刪除文件
      if (user.avatar) {
        const avatarPath = path.join(__dirname, '../../uploads', user.avatar);
        console.log('Avatar path:', avatarPath);
        
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
          console.log('Avatar file deleted');
        }
        
        // 清除數據庫中的頭像路徑
        await user.update({ avatar: null });
        console.log('Avatar record cleared from database');
      }
      
      res.json({ message: '頭像已刪除' });
    } catch (error) {
      console.error('Delete avatar error:', error);
      res.status(500).json({ message: '刪除頭像失敗' });
    }
  }
};

module.exports = settingController; 