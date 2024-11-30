import { Router } from 'express';

const router = Router();

// 健康檢查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 暫時註釋掉其他路由，等創建完成後再啟用
/*
import userRoutes from './user.routes';
import taskRoutes from './task.routes';
import calendarRoutes from './calendar.routes';
import chatRoutes from './chat.routes';

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/calendar', calendarRoutes);
router.use('/chat', chatRoutes);
*/

export default router; 