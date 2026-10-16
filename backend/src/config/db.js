const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_INTERNAL_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'hotel_booking_db',
  user: process.env.POSTGRES_USER || 'hotel_admin',
  password: process.env.POSTGRES_PASSWORD || 'HotelSecurePassword2026!',
  max: 20, // Tối đa 20 kết nối trong pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('[PostgreSQL] Đã thiết lập kết nối mới tới database pool');
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Lỗi bất ngờ trong database pool:', err.message);
});

// Hàm query helper hỗ trợ logging và xử lý lỗi
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' || duration > 1000) {
      console.log(`[SQL Query] (${duration}ms) ${text.substring(0, 80)}...`);
    }
    return res;
  } catch (error) {
    console.error(`[SQL Error] Lỗi thực thi truy vấn: ${text.substring(0, 80)}`, error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
};
