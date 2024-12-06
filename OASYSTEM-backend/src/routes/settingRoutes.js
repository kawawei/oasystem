const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// 添加路由調試日誌
router.use((req, res, next) => {
  console.log('Settings route accessed:', req.path);
  next();
});

router.put('/profile', auth, settingController.updateProfile);
router.put('/password', auth, settingController.updatePassword);
router.put('/avatar', auth, upload.single('avatar'), handleUploadError, settingController.updateAvatar);
router.delete('/avatar', auth, settingController.deleteAvatar);

module.exports = router; 