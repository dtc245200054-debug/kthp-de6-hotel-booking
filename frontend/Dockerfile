# ==============================================================================
# FRONTEND DOCKERFILE - MULTI-STAGE BUILD
# Stage 1: Build React SPA với Vite
# Stage 2: Phục vụ file tĩnh qua Nginx Alpine siêu nhẹ & an toàn
# ==============================================================================

# STAGE 1: BUILD VITE
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# STAGE 2: PRODUCTION RUNTIME
FROM nginx:1.27-alpine AS production

# Cài đặt tzdata thiết lập múi giờ
RUN apk add --no-cache tzdata wget
ENV TZ=Asia/Ho_Chi_Minh

# Copy file build từ builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cổng lắng nghe
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=20s --timeout=3s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
