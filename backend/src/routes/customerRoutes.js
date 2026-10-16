const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateJWT, requireStaffOrAdmin } = require('../middleware/auth');

// Toàn bộ các API quản lý khách hàng đều yêu cầu quyền quản trị
router.use(authenticateJWT, requireStaffOrAdmin);

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);

module.exports = router;
