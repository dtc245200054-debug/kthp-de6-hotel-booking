const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./config/db');
const { register, metricsMiddleware } = require('./config/metrics');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// 1. Bảo mật và cấu hình cơ bản
app.use(helmet({
  crossOriginResourcePolicy: false, // Cho phép load ảnh và tài nguyên tĩnh
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Middleware thu thập Prometheus Metrics & Structured Logs cho Loki (Đã sanitize dữ liệu nhạy cảm)
app.use(metricsMiddleware);
app.use(requestLogger);

// 3. Healthcheck Endpoint (Dành cho Docker Healthcheck & Quản trị hệ thống)
app.get('/health', async (req, res) => {
  const startDb = Date.now();
  try {
    const dbCheck = await db.query('SELECT 1 AS healthy, NOW() AS db_time');
    const dbLatencyMs = Date.now() - startDb;
    const isDbHealthy = dbCheck.rows[0].healthy === 1;

    res.status(200).json({
      status: 'UP',
      service: 'hotel-booking-backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      database: {
        status: isDbHealthy ? 'CONNECTED' : 'DISCONNECTED',
        latency_ms: dbLatencyMs,
        server_time: dbCheck.rows[0].db_time,
      },
      system: {
        memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        node_version: process.version,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      service: 'hotel-booking-backend',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'UNREACHABLE',
      },
    });
  }
});

// 4. Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// 5. Định tuyến API nghiệp vụ
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin/customers', customerRoutes);

// Route mặc định cho root API
app.get('/api', (req, res) => {
  res.json({
    message: 'Chào mừng đến với API Hệ thống Đặt phòng Khách sạn (KTHP Đề 6)',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth/login',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      booking_lookup: '/api/bookings/lookup?code=BK-XXXXXX&email=...',
      customers: '/api/admin/customers',
      dashboard: '/api/dashboard/stats',
      health: '/health',
      metrics: '/metrics',
    },
  });
});

// 6. Xử lý Route không tồn tại (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn API [${req.method} ${req.originalUrl}] không tồn tại trong hệ thống`,
  });
});

// 7. Xử lý lỗi tập trung
app.use(errorHandler);

// 8. Khởi động máy chủ
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🏨 HOTEL BOOKING BACKEND SERVER IS RUNNING`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
  console.log(`📊 Prometheus Metrics: http://localhost:${PORT}/metrics`);
  console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nNhận tín hiệu ${signal}. Đang tiến hành đóng máy chủ an toàn...`);
  server.close(async () => {
    console.log('HTTP Server đã đóng tiếp nhận request mới.');
    try {
      await db.pool.end();
      console.log('PostgreSQL Connection Pool đã ngắt kết nối an toàn.');
      process.exit(0);
    } catch (err) {
      console.error('Lỗi khi đóng kết nối database:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Không thể hoàn tất graceful shutdown kịp thời, buộc thoát!');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
