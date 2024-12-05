const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 註冊路由
router.post('/register', authController.register);

// 登入路由
router.post('/login', authController.login);

module.exports = router; 