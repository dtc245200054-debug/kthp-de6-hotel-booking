const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

// Public endpoints cho khách hàng
router.get('/types', roomController.getRoomTypes);
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);

// Admin-only endpoints (Yêu cầu xác thực JWT và quyền Quản trị viên)
router.post('/', authenticateJWT, requireAdmin, roomController.createRoom);
router.put('/:id', authenticateJWT, requireAdmin, roomController.updateRoom);
router.delete('/:id', authenticateJWT, requireAdmin, roomController.deleteRoom);

module.exports = router;
