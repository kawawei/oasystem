const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const auth = require('../middleware/auth');

router.use(auth);

// 獲取所有團隊
router.get('/', teamController.getAllTeams);

// 創建團隊
router.post('/', teamController.createTeam);

// 獲取特定團隊
router.get('/:id', teamController.getTeam);

// 更新團隊
router.put('/:id', teamController.updateTeam);

// 刪除團隊
router.delete('/:id', teamController.deleteTeam);

// 添加團隊成員
router.post('/:id/members', teamController.addMember);

// 移除團隊成員
router.delete('/:id/members/:userId', teamController.removeMember);

module.exports = router; 