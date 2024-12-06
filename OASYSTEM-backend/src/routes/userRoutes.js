const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 獲取用戶個人資料
router.get('/profile', auth, userController.getProfile);

module.exports = router; 