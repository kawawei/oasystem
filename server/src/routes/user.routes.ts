import { Router } from 'express';
import { User } from '../entities/User.entity';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 獲取用戶列表
router.get('/', authMiddleware, async (_req, res) => {
  try {
    const users = await User.find({
      select: ['id', 'username', 'email', 'role', 'status']
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: '獲取用戶列表失敗' });
  }
});

export default router; 