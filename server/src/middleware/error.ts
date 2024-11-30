import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

// 錯誤處理中間件
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  // 記錄錯誤
  console.error(`[Error] ${req.method} ${req.path}:`, {
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // 返回錯誤響應
  res.status(statusCode).json({
    success: false,
    error: err.message,
    code: err.code,
    // 只在開發環境返回堆棧信息
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// 404 錯誤處理
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '找不到請求的資源',
    path: req.originalUrl
  });
}; 