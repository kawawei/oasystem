import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { initializeDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error';
import { ApiResponse } from './types';
import routes from './routes';
import authRoutes from './routes/auth.routes';

// 載入環境變量
config();

// 添加這些日誌
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME
});

const app = express();
const port = process.env.PORT || 5000;

// 初始化數據庫連接
initializeDatabase()
  .then(() => {
    console.log('Database connection initialized');
  })
  .catch((err: Error) => {
    console.error('Error during Data Source initialization:', err.message);
  });

// 中間件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

// 配置 helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  contentSecurityPolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api', routes);

// 404 處理
app.use(notFoundHandler);

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; 