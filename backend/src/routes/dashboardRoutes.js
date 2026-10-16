const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateJWT, requireStaffOrAdmin } = require('../middleware/auth');

// Bảo vệ API thống kê doanh thu và báo cáo quản trị
router.get('/stats', authenticateJWT, requireStaffOrAdmin, dashboardController.getDashboardStats);

module.exports = router;
