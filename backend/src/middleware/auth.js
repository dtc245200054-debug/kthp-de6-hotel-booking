const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hotel_jwt_key_2026';

// Middleware xác thực JWT Token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Yêu cầu đăng nhập. Không tìm thấy token xác thực hợp lệ.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role, full_name }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
    });
  }
};

// Middleware kiểm tra quyền Quản trị viên (Admin)
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Từ chối truy cập. Chức năng này chỉ dành cho Quản trị viên cấp cao (Admin).',
    });
  }
  next();
};

// Middleware kiểm tra quyền Nhân viên hoặc Quản trị viên
const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'staff', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Từ chối truy cập. Bạn không có quyền quản lý hệ thống.',
    });
  }
  next();
};

module.exports = {
  authenticateJWT,
  requireAdmin,
  requireStaffOrAdmin,
};
