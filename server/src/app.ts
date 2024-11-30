import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { initializeDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error';
import { ApiResponse } from './types';
import routes from './routes';

// 載入環境變量
config();

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
app.use(cors());
app.use(helmet());
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