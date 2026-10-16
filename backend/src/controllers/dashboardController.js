const db = require('../config/db');

// Lấy toàn bộ số liệu thống kê tổng quan (Analytics & Metrics)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Thống kê phòng
    const roomStatsQuery = `
      SELECT 
        COUNT(*) AS total_rooms,
        COUNT(CASE WHEN status = 'available' THEN 1 END) AS available_rooms,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) AS occupied_rooms,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) AS maintenance_rooms
      FROM rooms
    `;

    // 2. Thống kê đặt phòng và doanh thu
    const bookingStatsQuery = `
      SELECT 
        COUNT(*) AS total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmed_bookings,
        COUNT(CASE WHEN status = 'checked_in' THEN 1 END) AS checked_in_bookings,
        COUNT(CASE WHEN status = 'checked_out' THEN 1 END) AS checked_out_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_bookings,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) AS paid_revenue
      FROM bookings
    `;

    // 3. Doanh thu theo loại phòng
    const revenueByTypeQuery = `
      SELECT 
        rt.name AS room_type_name,
        rt.code AS room_type_code,
        COUNT(b.id) AS booking_count,
        COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_amount ELSE 0 END), 0) AS revenue
      FROM room_types rt
      LEFT JOIN rooms r ON rt.id = r.room_type_id
      LEFT JOIN bookings b ON r.id = b.room_id
      GROUP BY rt.id, rt.name, rt.code
      ORDER BY revenue DESC
    `;

    // 4. Các đơn đặt phòng gần đây nhất
    const recentBookingsQuery = `
      SELECT 
        b.id,
        b.booking_code,
        COALESCE(c.full_name, 'Khách vãng lai') AS customer_name,
        COALESCE(c.phone, '') AS customer_phone,
        b.check_in_date,
        b.check_out_date,
        b.total_amount,
        b.status,
        b.created_at,
        r.room_number,
        r.title AS room_title
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      LEFT JOIN customers c ON b.customer_id = c.id
      ORDER BY b.created_at DESC
      LIMIT 6
    `;

    // Thực thi đồng thời các truy vấn để tối ưu hiệu năng
    const [roomStats, bookingStats, revenueByType, recentBookings] = await Promise.all([
      db.query(roomStatsQuery),
      db.query(bookingStatsQuery),
      db.query(revenueByTypeQuery),
      db.query(recentBookingsQuery),
    ]);

    res.json({
      success: true,
      data: {
        rooms: {
          total: parseInt(roomStats.rows[0].total_rooms, 10),
          available: parseInt(roomStats.rows[0].available_rooms, 10),
          occupied: parseInt(roomStats.rows[0].occupied_rooms, 10),
          maintenance: parseInt(roomStats.rows[0].maintenance_rooms, 10),
        },
        bookings: {
          total: parseInt(bookingStats.rows[0].total_bookings, 10),
          confirmed: parseInt(bookingStats.rows[0].confirmed_bookings, 10),
          checked_in: parseInt(bookingStats.rows[0].checked_in_bookings, 10),
          checked_out: parseInt(bookingStats.rows[0].checked_out_bookings, 10),
          cancelled: parseInt(bookingStats.rows[0].cancelled_bookings, 10),
          total_revenue: parseFloat(bookingStats.rows[0].total_revenue),
          paid_revenue: parseFloat(bookingStats.rows[0].paid_revenue),
        },
        revenue_by_type: revenueByType.rows.map(item => ({
          ...item,
          booking_count: parseInt(item.booking_count, 10),
          revenue: parseFloat(item.revenue),
        })),
        recent_bookings: recentBookings.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
