const fs = require('fs');
const path = require('path');

// Middleware ghi log request có cấu trúc (Structured JSON Log) cho Loki & Promtail
// Tuyệt đối không ghi mật khẩu, token hoặc thông tin nhạy cảm vào log
const logDir = process.env.LOG_DIR || '/var/log/backend';
let logStream = null;

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });
} catch (err) {
  // Tự động ghi qua stdout nếu không ghi được tệp
}

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    // Không spam log cho metrics và healthcheck
    if (req.path === '/metrics' || req.path === '/health') {
      return;
    }

    const duration = Date.now() - start;

    // Loại bỏ query params nhạy cảm nếu có (Sanitize / Redact)
    const sanitizedUrl = req.originalUrl.replace(/([?&](password|token|secret)=)[^&]*/gi, '$1[REDACTED]');

    const logData = {
      timestamp: new Date().toISOString(),
      service: 'hotel-backend',
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      method: req.method,
      path: sanitizedUrl,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'] || 'unknown',
    };

    const line = JSON.stringify(logData);
    console.log(line);

    if (logStream) {
      try {
        logStream.write(line + '\n');
      } catch (e) {
        // Fallback an toàn
      }
    }
  });

  next();
};

module.exports = requestLogger;
