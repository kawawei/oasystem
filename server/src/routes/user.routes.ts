import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 用戶認證相關路由
router.post('/login', (req, res) => {
  // TODO: 實現登入邏輯
});

router.post('/register', (req, res) => {
  // TODO: 實現註冊邏輯
});

// 需要認證的路由
router.get('/profile', authMiddleware, (req, res) => {
  // TODO: 實現獲取用戶資料邏輯
});

router.put('/profile', authMiddleware, (req, res) => {
  // TODO: 實現更新用戶資料邏輯
});

export default router; 