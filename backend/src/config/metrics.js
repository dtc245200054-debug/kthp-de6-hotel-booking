const client = require('prom-client');

// Khởi tạo Registry để gom toàn bộ metrics
const register = new client.Registry();

// Bật thu thập metrics mặc định của Node.js (CPU, RAM, Event Loop, Garbage Collection, v.v.)
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
});

// 1. Counter: Tổng số lượt HTTP Requests
const httpRequestsTotal = new client.Counter({
  name: 'hotel_http_requests_total',
  help: 'Tổng số lượt HTTP request đến backend hệ thống khách sạn',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

// 2. Histogram: Thời gian xử lý request (Latency)
const httpRequestDurationSeconds = new client.Histogram({
  name: 'hotel_http_request_duration_seconds',
  help: 'Thời gian xử lý HTTP request tính bằng giây',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDurationSeconds);

// 3. Counter: Tổng số lượt đặt phòng theo trạng thái
const hotelBookingsTotal = new client.Counter({
  name: 'hotel_bookings_total',
  help: 'Tổng số lượt đặt phòng được tạo trong hệ thống',
  labelNames: ['status'],
});
register.registerMetric(hotelBookingsTotal);

// 4. Counter: Tổng doanh thu đặt phòng
const hotelRevenueTotal = new client.Counter({
  name: 'hotel_revenue_total_vnd',
  help: 'Tổng doanh thu đặt phòng tích lũy (VNĐ)',
  labelNames: ['room_type'],
});
register.registerMetric(hotelRevenueTotal);

// 5. Gauge: Số lượng phòng hiện có theo trạng thái
const hotelRoomsGauge = new client.Gauge({
  name: 'hotel_rooms_count',
  help: 'Số lượng phòng hiện tại theo trạng thái (available, occupied, maintenance)',
  labelNames: ['status'],
});
register.registerMetric(hotelRoomsGauge);

// Middleware đo đạc thời gian và đếm request
const metricsMiddleware = (req, res, next) => {
  // Bỏ qua endpoint /metrics và /health khỏi thống kê business để tránh nhiễu dữ liệu
  if (req.path === '/metrics' || req.path === '/health') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = req.baseUrl + (req.route ? req.route.path : req.path);
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: statusCode,
    });

    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        route: route,
        status_code: statusCode,
      },
      durationInSeconds
    );
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware,
  hotelBookingsTotal,
  hotelRevenueTotal,
  hotelRoomsGauge,
};
