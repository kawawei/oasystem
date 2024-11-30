import { User } from './index';

declare module 'express' {
  export interface Request {
    user?: Omit<User, 'password'>;  // 不包含密碼的用戶信息
    startTime?: number;  // 請求開始時間，用於計算響應時間
  }
} 