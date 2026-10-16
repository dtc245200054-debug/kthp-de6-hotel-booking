const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hotel_jwt_key_2026';

// 1. ĐĂNG NHẬP QUẢN TRỊ VIÊN / NHÂN VIÊN
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ tên đăng nhập và mật khẩu.',
      });
    }

    // Truy vấn tham số hóa (Parameterized Query) chống SQL Injection
    const queryText = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(queryText, [username.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
      });
    }

    const user = result.rows[0];

    // Xác thực mật khẩu đã băm bằng Bcrypt (KHÔNG lưu mật khẩu dạng plaintext)
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.',
      });
    }

    // Tạo JWT Token có thời hạn 24 giờ
    const tokenPayload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: tokenPayload,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. LẤY THÔNG TIN TÀI KHOẢN HIỆN TẠI (GET /api/auth/me)
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
