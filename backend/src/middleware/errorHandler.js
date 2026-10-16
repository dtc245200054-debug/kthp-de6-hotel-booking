// Middleware xử lý lỗi tập trung (Centralized Error Handler)
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  const errorResponse = {
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Log lỗi hệ thống có cấu trúc
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'hotel-backend',
    level: 'error',
    error: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  }));

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
