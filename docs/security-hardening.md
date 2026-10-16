# TÀI LIỆU GIA CỐ BẢO MẬT HỆ THỐNG (SECURITY HARDENING SPECIFICATION)
## HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN 5 SAO - AURORA GRAND RESORT & SPA
### Học phần: Triển khai và Quản trị Hệ thống Phần mềm (Đề tài 6)

---

## MỤC LỤC
1. [Tổng Quan Kiến Trúc An Ninh Đa Tầng (Defense-in-Depth)](#1-tổng-quan-kiến-trúc-an-ninh-đa-tầng)
2. [Chi Tiết 8 Trụ Cột Hardening Đã Áp Dụng](#2-chi-tiết-8-trụ-cột-hardening-đã-áp-dụng)
   - [2.1. Non-Root Container & Principle of Least Privilege](#21-non-root-container--quyền-hạn-tối-thiểu)
   - [2.2. Cô Lập Mạng Đa Vùng (Network Segmentation)](#22-cô-lập-mạng-đa-vùng-network-segmentation)
   - [2.3. Quản Lý Secret & Cấu Hình An Toàn](#23-quản-lý-secret--cấu-hình-an-toàn)
   - [2.4. Phân Quyền Cơ Sở Dữ Liệu Tối Thiểu (Database Least Privilege)](#24-phân-quyền-cơ-sở-dữ-liệu-tối-thiểu)
   - [2.5. Gia Cố Nginx Reverse Proxy & HTTPS](#25-gia-cố-nginx-reverse-proxy--https)
   - [2.6. Gia Cố Docker Host & Container Runtime](#26-gia-cố-docker-host--container-runtime)
   - [2.7. Gia Cố Tầng Ứng Dụng Backend API](#27-gia-cố-tầng-ứng-dụng-backend-api)
   - [2.8. An Toàn Thông Tin Trong Hệ Thống Log](#28-an-toàn-thông-tin-trong-hệ-thống-log)
3. [Bảng Ma Trận Kiểm Tra & Bằng Chứng Xác Minh (Verification Matrix)](#3-bảng-ma-trận-kiểm-tra--bằng-chứng-xác-minh)

---

## 1. TỔNG QUAN KIẾN TRÚC AN NINH ĐA TẦNG

Hệ thống đặt phòng khách sạn xử lý trực tiếp thông tin cá nhân khách hàng, lịch trình cư trú và dữ liệu giao dịch tài chính. Do đó, hệ thống không chỉ áp dụng bảo mật ở một lớp đơn lẻ mà triển khai mô hình **Defense-in-Depth (Phòng thủ đa tầng)** bao phủ từ cấp độ nhân Linux (Kernel), vùng chứa (Container), mạng ảo (Software-Defined Network), Web Proxy, ứng dụng Backend tới tầng lưu trữ CSDL quan hệ.

---

## 2. CHI TIẾT 8 TRỤ CỘT HARDENING ĐÃ ÁP DỤNG

### 2.1. Non-Root Container & Quyền Hạn Tối Thiểu
* **Mô tả biện pháp:**
  * Toàn bộ tiến trình Backend Node.js thực thi dưới quyền tài khoản tiêu chuẩn `node` (UID 1000). Tuyệt đối không chạy dưới quyền `root`.
  * Nginx khởi động Master Process để liên kết cổng, nhưng toàn bộ Worker Processes phục vụ request của người dùng đều chuyển quyền sang user `nginx`.
  * **Đánh giá quyền Exporter / Logging:** Các dịch vụ `cadvisor` và `node-exporter` chỉ được gắn cờ đọc (`:ro`) đối với các file thông số máy chủ, không cấp cờ can thiệp hay thay đổi hệ thống.
  * Tuyệt đối không sử dụng cờ `privileged: true` cho bất kỳ container nào trong cụm dịch vụ.
* **Lý do bảo mật:** Ngăn chặn nguy cơ **Container Escape**; nếu ứng dụng bị chiếm quyền qua lỗ hổng RCE, kẻ tấn công chỉ có quyền hạn của user bị cô lập, không thể kiểm soát máy chủ Docker Host.
* **File cấu hình liên quan:**
  * [backend/Dockerfile](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/backend/Dockerfile#L30-L33) (chỉ thị `USER node`).
  * [nginx/nginx.conf](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/nginx/nginx.conf#L6) (chỉ thị `user nginx;`).
* **Lệnh kiểm tra:**
  ```bash
  docker exec hotel_backend whoami
  # Kết quả mong đợi: node
  ```

---

### 2.2. Cô Lập Mạng Đa Vùng (Network Segmentation)
* **Mô tả biện pháp:**
  * Phân chia hệ thống thành 3 mạng bridge Docker riêng biệt:
    1. `hotel-frontend-net`: Nginx Reverse Proxy, Frontend SPA, Backend API.
    2. `hotel-backend-net`: Backend API, PostgreSQL 16, pgAdmin 4.
    3. `hotel-monitor-net`: Backend, Nginx, Prometheus, Grafana, Loki, Promtail, cAdvisor, Node Exporter.
  * Cổng `5432` của PostgreSQL chỉ lắng nghe nội bộ trong mạng `hotel-backend-net`. Người dùng từ Internet hoặc từ container Frontend không thể gửi gói tin trực tiếp tới CSDL.
* **Lý do bảo mật:** Áp dụng nguyên lý Zero-Trust; ngăn chặn kẻ tấn công thực hiện di chuyển ngang (Lateral Movement) nếu một thành phần công cộng (như Web Frontend) bị xâm nhập.
* **File cấu hình liên quan:**
  * [docker-compose.yml](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docker-compose.yml#L320-L336).
* **Lệnh kiểm tra:**
  ```bash
  # Thử ping từ Frontend sang Database (Kỳ vọng thất bại do khác network)
  docker exec hotel_frontend ping -c 2 postgres
  # Kết quả: bad address 'postgres' hoặc không thể kết nối
  ```

---

### 2.3. Quản Lý Secret & Cấu Hình An Toàn
* **Mô tả biện pháp:**
  * Toàn bộ mật khẩu CSDL, khóa bí mật JWT, tài khoản quản trị được tách biệt vào file môi trường `.env`.
  * Khai báo `.env` trong [.gitignore](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/.gitignore).
  * Cung cấp file mẫu [.env.example](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/.env.example) với các giá trị placeholder, hướng dẫn quản trị viên thay đổi mật khẩu mạnh.
  * **Đánh giá kiến trúc:** File `.env` là giải pháp quản lý cấu hình phù hợp, tiện dụng cho môi trường học tập và đồ án Lab. Trong môi trường doanh nghiệp quy mô lớn (Production), các hệ thống quản lý secret chuyên dụng như HashiCorp Vault, AWS Secrets Manager hoặc Docker Secrets sẽ được sử dụng.
* **Lý do bảo mật:** Ngăn chặn việc lộ lọt secret key, mật khẩu production lên các kho lưu trữ công cộng (GitHub Leaks).
* **File cấu hình liên quan:**
  * [.gitignore](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/.gitignore#L9-L12).
  * [.env.example](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/.env.example).
* **Lệnh kiểm tra:**
  ```bash
  git status --ignored
  # Kết quả: .env hiển thị trong danh sách Ignored Files
  ```

---

### 2.4. Phân Quyền Cơ Sở Dữ Liệu Tối Thiểu (Database Least Privilege)
* **Mô tả biện pháp:**
  * Tách biệt 2 vai trò tài khoản trong PostgreSQL:
    * `hotel_admin`: Tài khoản quản trị cấp cao dùng riêng cho việc tạo bảng, migration và cấu hình extension ban đầu.
    * `hotel_app_user`: Tài khoản ứng dụng được tạo tự động với quyền tối thiểu. Chỉ được cấp quyền thao tác dữ liệu (`SELECT, INSERT, UPDATE`) trên các bảng nghiệp vụ, **tuyệt đối không được cấp quyền `DROP TABLE`, `ALTER TABLE` hay Superuser**.
  * Hạn chế quyền truy cập pgAdmin thông qua tài khoản quản trị riêng biệt và mạng nội bộ.
* **Lý do bảo mật:** Nếu mã nguồn ứng dụng tồn tại lỗi logic, kẻ tấn công cũng không thể xóa sổ cấu trúc CSDL (`DROP TABLE`), giảm thiểu thiệt hại tối đa.
* **File cấu hình liên quan:**
  * [database/init.sql](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/database/init.sql#L271-L293).
* **Lệnh kiểm tra:**
  ```bash
  # Kiểm tra tài khoản hotel_app_user không thể DROP TABLE
  docker exec -i hotel_postgres psql -U hotel_app_user -d hotel_booking_db -c "DROP TABLE bookings;"
  # Kết quả mong đợi: ERROR: must be owner of table bookings
  ```

---

### 2.5. Gia Cố Nginx Reverse Proxy & HTTPS
* **Mô tả biện pháp:**
  * **Che giấu phiên bản:** `server_tokens off;` (Header chỉ trả về `Server: nginx`, không tiết lộ số phiên bản).
  * **Security Headers toàn diện:**
    * `X-Frame-Options: SAMEORIGIN` (Chống Clickjacking).
    * `X-Content-Type-Options: nosniff` (Chống MIME-type sniffing).
    * `Referrer-Policy: strict-origin-when-cross-origin`.
    * `Content-Security-Policy`: Cân chỉnh chặt chẽ cho phép tài nguyên nội bộ, Google Fonts và ảnh Unsplash.
    * `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS trên cổng HTTPS 443).
  * **Hạn chế phương thức HTTP (Method Limiting):** Sử dụng `limit_except` chặn toàn bộ phương thức lạ (chỉ cho phép `GET, POST, PUT, DELETE, OPTIONS` cho API và `GET, HEAD, OPTIONS` cho Frontend).
  * **Giới hạn kích thước gói tin:** `client_max_body_size 10M;` và `client_body_buffer_size 128k;`.
  * **HTTPS với chứng chỉ tự ký:** Cấu hình trên cổng 443 hỗ trợ HTTP/2, TLSv1.2, TLSv1.3.
* **Lý do bảo mật:** Bảo vệ người dùng khỏi các cuộc tấn công trung gian (MitM), làm giả gói tin (tampering), tấn công DoS tải tệp lớn và tấn công trình duyệt (XSS/Clickjacking).
* **File cấu hình liên quan:**
  * [nginx/nginx.conf](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/nginx/nginx.conf#L45-L160).
  * [nginx/Dockerfile](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/nginx/Dockerfile#L11-L16).
* **Lệnh kiểm tra:**
  ```bash
  # Kiểm tra Headers qua cờ -k
  curl -k -I https://localhost/

  # Kiểm tra chặn phương thức POST vào Frontend
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost/
  # Kết quả mong đợi: 405 (Method Not Allowed)
  ```

---

### 2.6. Gia Cố Docker Host & Container Runtime
* **Mô tả biện pháp:**
  * **Chống nâng quyền:** Thiết lập `security_opt: [no-new-privileges:true]` cho các container trọng yếu (`backend`, `frontend`, `nginx`, `postgres`).
  * **Không mount Docker Socket vào ứng dụng:** File socket `/var/run/docker.sock` tuyệt đối không được gắn vào Frontend, Backend hay CSDL. Socket chỉ được cấp quyền đọc cho `cadvisor` và `promtail`.
  * **Image Pinning:** Toàn bộ image đều sử dụng tag phiên bản cố định (`postgres:16-alpine`, `node:20-alpine`, `nginx:1.27-alpine`, `prometheus:v2.54.1`, `grafana:11.2.0`, `loki:3.1.1`), loại trừ rủi ro từ tag `:latest`.
  * **Giới hạn tài nguyên:** Đặt ngưỡng CPU và RAM (`deploy.resources.limits`) ngăn chặn tình trạng một container lỗi làm sập toàn bộ máy chủ host.
* **Lý do bảo mật:** Ngăn chặn phần mềm độc hại khai thác lỗ hổng setuid leo thang đặc quyền từ bên trong container lên máy chủ vật lý.
* **File cấu hình liên quan:**
  * [docker-compose.yml](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docker-compose.yml).
* **Lệnh kiểm tra:**
  ```bash
  docker inspect hotel_backend --format '{{.HostConfig.SecurityOpt}}'
  # Kết quả mong đợi: [no-new-privileges:true]
  ```

---

### 2.7. Gia Cố Tầng Ứng Dụng Backend API
* **Mô tả biện pháp:**
  * **Truy vấn tham số hóa 100% (Parameterized Queries):** Tuyệt đối không nối chuỗi SQL (`$1, $2, ...`), ngăn chặn hoàn toàn SQL Injection.
  * **Khóa dòng dữ liệu chống Race Condition:** Sử dụng `BEGIN ... SELECT * FROM rooms WHERE id = $1 FOR UPDATE` để ngăn chặn đặt trùng phòng đồng thời (Double-booking).
  * **Giới hạn tần suất truy cập (Rate Limiting):**
    * Toàn bộ API chung: Tối đa 300 requests / 15 phút.
    * Endpoint Đăng nhập quản trị (`/api/auth/login`): Tối đa 10 lần thử / 15 phút chống brute-force mật khẩu.
  * **CORS giới hạn:** Chỉ cho phép các domain được ủy quyền trong `ALLOWED_ORIGINS` (`http://localhost`, `https://localhost`).
  * **Bảo vệ thông tin lỗi:** Môi trường production không bao giờ trả về stack trace cho client (`if (process.env.NODE_ENV !== 'production') errorResponse.stack = err.stack;`).
  * **Xác thực & Phân quyền quản trị:** Mật khẩu băm bằng **Bcrypt** (Salt rounds = 10), cấp Bearer Token JWT, middleware kiểm tra quyền Admin/Staff nghiêm ngặt.
* **Lý do bảo mật:** Đảm bảo toàn vẹn dữ liệu giao dịch, bảo vệ tài khoản quản trị khỏi các cuộc tấn công từ điển / vét cạn và không để lộ cấu trúc code nội bộ.
* **File cấu hình liên quan:**
  * [backend/src/index.js](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/backend/src/index.js#L20-L55).
  * [backend/src/controllers/bookingController.js](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/backend/src/controllers/bookingController.js#L70-L125).
  * [backend/src/middleware/errorHandler.js](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/backend/src/middleware/errorHandler.js#L12-L15).
* **Lệnh kiểm tra:**
  ```bash
  # Chạy 7 unit tests kiểm tra bảo mật backend
  npm test --prefix backend
  # Kết quả: 7/7 tests pass
  ```

---

### 2.8. An Toàn Thông Tin Trong Hệ Thống Log
* **Mô tả biện pháp:**
  * **Sanitization:** Middleware [backend/src/middleware/logger.js](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/backend/src/middleware/logger.js) tự động khử bỏ các trường nhạy cảm (`password`, `token`, `secret`, `authorization`) thành `[REDACTED]`.
  * **Hạn chế quyền đọc tệp:** Thư mục `/var/log/backend` và volume logs chỉ cấp quyền đọc cho tiến trình Promtail (`ro`).
  * **Kiểm soát nhãn (Anti High-Cardinality):** Chỉ sử dụng các nhãn có tập giá trị hữu hạn (`job`, `service`, `level`, `status`, `method`), không đưa email khách hàng hay UUID vào label của Loki.
* **Lý do bảo mật:** Ngăn ngừa nguy cơ rò rỉ dữ liệu nhạy cảm của khách hàng và thông tin xác thực qua hệ thống lưu trữ log tập trung.
* **File cấu hình liên quan:**
  * [backend/src/middleware/logger.js](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/backend/src/middleware/logger.js#L15-L25).
  * [logging/promtail/promtail-config.yaml](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/logging/promtail/promtail-config.yaml).
* **Lệnh kiểm tra:**
  ```logql
  # Mở Grafana Explore > Loki và chạy truy vấn kiểm tra không có password plaintext
  {service="hotel-backend"} |= "password"
  # Kết quả: Chuỗi password hiển thị dạng [REDACTED]
  ```

---

## 3. BẢNG MA TRẬN KIỂM TRA & BẰNG CHỨNG XÁC MINH

| STT | Hạng mục Hardening | Tiêu chí đánh giá | Trạng thái | Lệnh kiểm chứng |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Non-root User | Backend chạy với UID 1000 (`node`) | **HOÀN THÀNH** | `docker exec hotel_backend whoami` |
| **2** | Network Segmentation | 3 mạng bridge cô lập, CSDL không mở cổng public | **HOÀN THÀNH** | `docker network ls \| grep hotel` |
| **3** | Secret Management | `.env` nằm ngoài Git, cung cấp `.env.example` | **HOÀN THÀNH** | `git status --ignored` |
| **4** | Database Least Privilege | Tài khoản `hotel_app_user` không có quyền DROP/ALTER | **HOÀN THÀNH** | Kiểm tra quyền trong `database/init.sql` |
| **5** | Security Headers & HSTS | Đủ 5 headers bảo mật, bật HSTS trên HTTPS 443 | **HOÀN THÀNH** | `curl -k -I https://localhost/` |
| **6** | Ẩn phiên bản Nginx | `server_tokens off;` không lộ số hiệu Nginx | **HOÀN THÀNH** | `curl -I http://localhost/ \| grep Server` |
| **7** | HTTP Method Limiting | Chặn phương thức lạ bằng `limit_except` (Trả về 405) | **HOÀN THÀNH** | `curl -X POST http://localhost/` |
| **8** | Chống nâng quyền Linux | `no-new-privileges:true` trên toàn bộ container chính | **HOÀN THÀNH** | `docker inspect hotel_backend` |
| **9** | Rate Limiting | Giới hạn 300 reqs/15m chung và 10 reqs/15m cho login | **HOÀN THÀNH** | `curl -X POST http://localhost/api/auth/login` x11 |
| **10** | Chống Double-Booking | Giao dịch `SELECT ... FOR UPDATE` trả về 409 Conflict | **HOÀN THÀNH** | `powershell .\scripts\test-system.ps1` |
| **11** | Sanitized Logging | Mật khẩu, token tự động chuyển thành `[REDACTED]` | **HOÀN THÀNH** | LogQL: `{service="hotel-backend"}` |
| **12** | Giới hạn tài nguyên | Đặt limits CPU/RAM cho toàn bộ 13 containers | **HOÀN THÀNH** | `docker stats --no-stream` |
