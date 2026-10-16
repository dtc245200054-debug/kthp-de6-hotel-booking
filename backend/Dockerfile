# ==============================================================================
# BACKEND DOCKERFILE - NODE.JS 20 ALPINE
# Multi-stage / Hardened Non-Root Container
# ==============================================================================

FROM node:20-alpine AS production

# Cài đặt curl phục vụ container healthcheck
RUN apk add --no-cache curl tzdata

# Thiết lập múi giờ Việt Nam
ENV TZ=Asia/Ho_Chi_Minh
RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

# Thiết lập biến môi trường production
ENV NODE_ENV=production
ENV PORT=5000

# Copy file định nghĩa phụ thuộc
COPY package*.json ./

# Cài đặt production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy toàn bộ mã nguồn
COPY src/ ./src/

# Tạo thư mục lưu log và phân quyền cho non-root user 'node'
RUN mkdir -p /var/log/backend && chown -R node:node /var/log/backend

# Chuyển sang non-root user 'node' để đảm bảo an ninh hệ thống
USER node

# Mở cổng dịch vụ
EXPOSE 5000

# Khai báo Healthcheck bên trong container
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Khởi chạy ứng dụng
CMD ["node", "src/index.js"]
