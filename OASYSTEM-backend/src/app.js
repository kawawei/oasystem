const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const User = require('./models/user');

const authRoutes = require('./routes/authRoutes');

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: '服務器錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

// 測試數據庫連接並同步模型
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // 使用 alter 而不是 force，這樣不會刪除現有的表
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    // 檢查是否已存在測試用戶
    let testUser = await User.findOne({ where: { username: 'admin' } });
    
    if (!testUser) {
      // 創建測試用戶
      testUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('Test user created:', testUser.username);
    } else {
      console.log('Test user already exists:', testUser.username);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    // 不要立即退出，讓錯誤處理更溫和
    console.error('Detailed error:', error.original || error);
  }
}

startServer();