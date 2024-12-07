const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./models');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const settingRoutes = require('./routes/settingRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { setupBackupSchedule } = require('./utils/scheduler');
const path = require('path');

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 路由調試中間件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notes', noteRoutes);

// 靜態文件服務
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 添加調試中間件
app.use('/uploads', (req, res, next) => {
  console.log('Static file request:', req.url);
  next();
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: '服務器錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 初始化數據庫
initDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  setupBackupSchedule();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;