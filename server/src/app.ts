import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/error';
import { ApiResponse } from './types';

// 載入環境變量
config();

const app = express();
const port = process.env.PORT || 5000;

// 中間件
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基本路由
app.get('/api/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  };
  res.json(response);
});

// 404 處理
app.use(notFoundHandler);

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; 