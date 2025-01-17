const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');

// 加載環境變數
dotenv.config();

const app = express();

// CORS 配置
app.use(cors({
  origin: '*'
}));

// 中間件
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.BACKEND_PORT || 3000;

// 數據庫同步並啟動服務器
sequelize.sync({ force: process.env.NODE_ENV === 'development' })
  .then(() => {
    console.log('Database synced');
    if (process.env.NODE_ENV === 'development') {
      require('./utils/seedData')();
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  }); 