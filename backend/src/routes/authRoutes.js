const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Đăng nhập hệ thống quản trị
router.post('/login', authController.login);

// Xác thực phiên làm việc
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;
