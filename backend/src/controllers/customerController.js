const db = require('../config/db');

// 1. LẤY DANH SÁCH KHÁCH HÀNG (Admin & Staff)
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, limit = 50, page = 1 } = req.query;

    let queryText = `
      SELECT 
        c.id,
        c.full_name,
        c.email,
        c.phone,
        c.id_card,
        c.address,
        c.created_at,
        COUNT(b.id) AS total_bookings,
        COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_amount ELSE 0 END), 0) AS total_spent
      FROM customers c
      LEFT JOIN bookings b ON c.id = b.customer_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (c.full_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR c.id_card ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += `
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit, 10), (parseInt(page, 10) - 1) * parseInt(limit, 10));

    const result = await db.query(queryText, params);
    const countResult = await db.query('SELECT COUNT(*) FROM customers');

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count, 10),
      data: result.rows.map(c => ({
        ...c,
        total_bookings: parseInt(c.total_bookings, 10),
        total_spent: parseFloat(c.total_spent),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// 2. LẤY CHI TIẾT KHÁCH HÀNG VÀ LỊCH SỬ ĐẶT PHÒNG
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customerQuery = 'SELECT * FROM customers WHERE id = $1';
    const customerResult = await db.query(customerQuery, [id]);

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ khách hàng',
      });
    }

    const bookingsQuery = `
      SELECT b.*, r.room_number, r.title AS room_title, rt.name AS room_type_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
    `;
    const bookingsResult = await db.query(bookingsQuery, [id]);

    res.json({
      success: true,
      data: {
        ...customerResult.rows[0],
        bookings: bookingsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
};
