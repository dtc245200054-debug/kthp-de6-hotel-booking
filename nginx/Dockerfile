# ==============================================================================
# NGINX REVERSE PROXY DOCKERFILE
# Hệ thống Đặt phòng Khách sạn - Aurora Grand Resort & Spa
# ==============================================================================

FROM nginx:1.27-alpine

# Cài đặt curl, tzdata và openssl để tạo chứng chỉ HTTPS tự ký
RUN apk add --no-cache curl tzdata openssl
ENV TZ=Asia/Ho_Chi_Minh

# Tự động sinh chứng chỉ SSL tự ký cho môi trường demo chuẩn bảo mật
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/server.key \
    -out /etc/nginx/certs/server.crt \
    -subj "/CN=localhost/O=AuroraGrandResort/C=VN"

# Xóa cấu hình mặc định, hủy symlink stdout để Promtail thu thập file log thực tế
RUN rm -f /etc/nginx/conf.d/default.conf && \
    rm -f /var/log/nginx/access.log /var/log/nginx/error.log && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown -R nginx:nginx /var/log/nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Cổng HTTP (80), HTTPS (443) và cổng stub status (8080)
EXPOSE 80 443 8080

# Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/stub_status || exit 1

CMD ["nginx", "-g", "daemon off;"]
