const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateJWT, requireStaffOrAdmin } = require('../middleware/auth');

// 1. ENDPOINTS DÀNH CHO KHÁCH HÀNG (PUBLIC)
// Khách hàng: Tra cứu đơn đặt phòng (bắt buộc đúng mã VÀ email để chống truy cập trái phép)
router.get('/lookup', bookingController.lookupBooking);

// Khách hàng: Tạo đơn đặt phòng mới
router.post('/', bookingController.createBooking);

// Khách hàng hoặc Admin: Hủy đơn đặt phòng (yêu cầu email xác thực hoặc JWT admin)
router.post('/cancel/:code', bookingController.cancelBooking);

// 2. ENDPOINTS QUẢN TRỊ VIÊN & NHÂN VIÊN (PROTECTED)
// Xem toàn bộ danh sách đơn đặt phòng
router.get('/', authenticateJWT, requireStaffOrAdmin, bookingController.getAllBookings);

// Cập nhật trạng thái đơn đặt phòng (Check-in, Check-out, Xác nhận, Hủy)
router.put('/:id/status', authenticateJWT, requireStaffOrAdmin, bookingController.updateBookingStatus);

// Xem lịch sử thay đổi trạng thái (Audit trail)
router.get('/:id/history', authenticateJWT, requireStaffOrAdmin, bookingController.getBookingHistory);

module.exports = router;
