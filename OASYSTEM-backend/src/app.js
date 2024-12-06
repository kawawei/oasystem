const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);

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
    
    // 強制重新創建表，並設置正確的刪除順序
    await sequelize.sync({ 
      force: true,
      // 設置刪除順序
      alter: {
        drop: true
      }
    });
    console.log('Database synchronized');

    // 創建默認管理員用戶
    const { User } = require('./models');
    await User.create({
      username: 'admin',
      password: '$2b$10$zPiXoqwQGk.jqIAz5BI.A.8I.TPvOXzh7XoQwHVnN1kA1jZqYq1Uy', // 密碼: admin123
      name: '系統管理員',
      email: 'admin@example.com',
      role: 'admin'
    });
    console.log('Default admin user created');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    console.error('Detailed error:', error.original || error);
  }
}

startServer();

module.exports = app;