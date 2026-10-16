# BÁO CÁO KẾT THÚC HỌC PHẦN (KTHP)
## MÔN HỌC: TRIỂN KHAI VÀ QUẢN TRỊ HỆ THỐNG PHẦN MỀM
### ĐỀ TÀI: XÂY DỰNG VÀ QUẢN TRỊ HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN BẰNG DOCKER COMPOSE

---

**BỘ GIÁO DỤC VÀ ĐÀO TẠO**  
**TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN & TRUYỀN THÔNG THÁI NGUYÊN**  
**KHOA CÔNG NGHỆ THÔNG TIN - BỘ MÔN MẠNG & HỆ THỐNG THÔNG TIN**  

* **Giảng viên hướng dẫn:** ThS. Nguyễn Anh Chuyên  
* **Sinh viên thực hiện:** Trần Phương Nam  
* **Mã số sinh viên (MSSV):** DTC245200054  
* **Lớp học phần:** Công Nghệ Thông Tin-K23A  
* **Hệ đào tạo:** Đại học chính quy  
* **Địa điểm & Năm thực hiện:** Thái Nguyên - Năm 2026  

---

## MỤC LỤC TỔNG THỂ

1. [LỜI MỞ ĐẦU](#lời-mở-đầu)
2. [DANH MỤC HÌNH ẢNH VÀ BẢNG BIỂU](#danh-mục-hình-ảnh-và-bảng-biểu)
3. [CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI, MỤC TIÊU, PHẠM VI VÀ YÊU CẦU](#chương-1-giới-thiệu-đề-tài-mục-tiêu-phạm-vi-và-yêu-cầu)
4. [CHƯƠNG 2: PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ HỆ THỐNG](#chương-2-phân-tích-yêu-cầu-và-thiết-kế-hệ-thống)
5. [CHƯƠNG 3: CÔNG NGHỆ SỬ DỤNG VÀ KIẾN TRÚC TỔNG THỂ](#chương-3-công-nghệ-sử-dụng-và-kiến-trúc-tổng-thể)
6. [CHƯƠNG 4: XÂY DỰNG WEBSITE, BACKEND VÀ POSTGRESQL; TRÌNH BÀY PGADMIN](#chương-4-xây-dựng-website-backend-và-postgresql-trình-bày-pgadmin)
7. [CHƯƠNG 5: CẤU HÌNH DOCKER COMPOSE VÀ NGINX REVERSE PROXY](#chương-5-cấu-hình-docker-compose-và-nginx-reverse-proxy)
8. [CHƯƠNG 6: TRIỂN KHAI PROMETHEUS VÀ GRAFANA](#chương-6-triển-khai-prometheus-và-grafana)
9. [CHƯƠNG 7: TRIỂN KHAI LOKI, PROMTAIL VÀ CÁC TRUY VẤN LOGQL](#chương-7-triển-khai-loki-promtail-và-các-truy-vấn-logql)
10. [CHƯƠNG 8: CÁC BIỆN PHÁP HARDENING VÀ KIỂM TRA BẢO MẬT](#chương-8-các-biện-pháp-hardening-và-kiểm-tra-bảo-mật)
11. [CHƯƠNG 9: KẾT QUẢ KIỂM THỬ VÀ ĐÁNH GIÁ THEO TIÊU CHÍ CHẤM ĐIỂM](#chương-9-kết-quả-kiểm-thử-và-đánh-giá-theo-tiêu-chí-chấm-điểm)
12. [KẾT LUẬN, HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN](#kết-luận-hạn-chế-và-hướng-phát-triển)
13. [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)
14. [PHỤ LỤC: LỆNH TRIỂN KHAI, DANH SÁCH CẤU HÌNH VÀ HƯỚNG DẪN DEMO](#phụ-lục-lệnh-triển-khai-danh-sách-cấu-hình-và-hướng-dẫn-demo)

---

## DANH MỤC HÌNH ẢNH VÀ BẢNG BIỂU

### I. Danh mục hình ảnh
* **Hình 2.1:** Sơ đồ kiến trúc tổng thể hệ thống đặt phòng khách sạn (3-Tier Architecture)
* **Hình 2.2:** Sơ đồ phân vùng mạng Docker và cô lập an ninh Zero-Trust
* **Hình 2.3:** Sơ đồ luồng đặt phòng và giải thuật khóa dòng SELECT FOR UPDATE
* **Hình 2.4:** Sơ đồ luồng thu thập và trực quan hóa chỉ số giám sát Prometheus & Grafana
* **Hình 2.5:** Sơ đồ luồng tập trung hóa và phân tích nhật ký Loki & Promtail
* **Hình 4.1:** Ảnh chụp thực tế giao diện Website Khách sạn 5 sao Aurora Grand Resort
* **Hình 4.2:** Ảnh chụp thực tế Modal Đặt phòng trực tuyến và kiểm tra phòng trống
* **Hình 4.3:** Ảnh chụp thực tế Giao diện đăng nhập và quản trị CSDL pgAdmin 4
* **Hình 6.1:** Ảnh chụp thực tế Danh sách 6 Scrape Targets trạng thái UP trong Prometheus
* **Hình 6.2:** Ảnh chụp thực tế Bảng điều khiển truy vấn chỉ số thời gian thực Prometheus Graph
* **Hình 6.3:** Ảnh chụp thực tế Bảng điều khiển giám sát tập trung Grafana
* **Hình 6.4:** Ảnh chụp thực tế Giám sát chỉ số tài nguyên Docker Container qua cAdvisor
* **Hình 7.1:** Bốn truy vấn LogQL thực tế trên Grafana Explore qua nhãn job=nginx và job=backend
* **Hình 8.1:** Bằng chứng kiểm tra an ninh: Container non-root, cô lập cổng CSDL, Security Headers
* **Hình 9.1:** Bằng chứng lịch sử 3 Commit bắt buộc trên nhánh main GitHub repository

### II. Danh mục bảng biểu
* **Bảng 3.1:** Bảng thông số công nghệ và vai trò của 13 thành phần container
* **Bảng 3.2:** Danh mục phân bổ cổng (Port Mapping) và phân vùng mạng Docker
* **Bảng 4.1:** Cấu trúc các bảng dữ liệu quan hệ chuẩn 3NF trong PostgreSQL 16
* **Bảng 6.1:** Danh mục 6 Scrape Targets giám sát trong hệ thống Prometheus
* **Bảng 8.1:** Bảng tổng hợp 8 trụ cột gia cố bảo mật và lệnh kiểm tra thực tế
* **Bảng 9.1:** Bảng kết quả kiểm thử tự động toàn diện 24 Test Cases (Đạt 100% PASS)

---

## LỜI MỞ ĐẦU

Trong thời đại số hóa và phát triển mạnh mẽ của điện toán đám mây (Cloud Computing), các ứng dụng phần mềm không chỉ đơn thuần là việc hoàn thiện các tính năng nghiệp vụ người dùng, mà còn đòi hỏi một hạ tầng triển khai mạnh mẽ, có khả năng mở rộng (scalability), độ sẵn sàng cao (high availability), giám sát thời gian thực (real-time observability) và bảo mật an toàn thông tin.

Báo cáo này tổng hợp kết quả nghiên cứu, xây dựng và triển khai thực nghiệm cho **Đề tài: Hệ thống Đặt phòng Khách sạn bằng Docker Compose** trong khuôn khổ học phần *"Triển khai và Quản trị Hệ thống Phần mềm"* dưới sự hướng dẫn của **ThS. Nguyễn Anh Chuyên** tại **Trường Đại học Công nghệ Thông tin & Truyền thông Thái Nguyên**. Dự án được hiện thực hóa từ mã nguồn thực tế, tuân thủ các quy chuẩn kỹ thuật chuyên nghiệp trong vận hành và quản trị hệ thống DevOps.

---

## CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI, MỤC TIÊU, PHẠM VI VÀ YÊU CẦU

### 1.1. Bối cảnh và lý do chọn đề tài
Ngành công nghiệp khách sạn và nghỉ dưỡng (Hospitality) đòi hỏi hệ thống đặt phòng trực tuyến phải hoạt động liên tục 24/7/365, tốc độ phản hồi tính bằng mili-giây và tuyệt đối không được xảy ra tình trạng "đặt trùng phòng" (double-booking). Để giải quyết bài toán này, việc áp dụng kiến trúc microservices container hóa kết hợp reverse proxy, hệ thống cơ sở dữ liệu quan hệ với cơ chế khóa dòng (row-level locking), đi kèm bộ công cụ quan sát toàn diện (Observability: Metrics, Logs) là giải pháp tiêu chuẩn của các hệ sinh thái công nghệ hàng đầu thế giới.

### 1.2. Mục tiêu hệ thống
* Xây dựng giao diện đặt phòng trực tuyến 5 sao cho Aurora Grand Resort & Spa.
* Triển khai Backend RESTful API Node.js Express với kiến trúc bảo mật nhiều lớp.
* Thiết kế CSDL PostgreSQL 16 đạt chuẩn 3NF với cơ chế khóa dòng `SELECT ... FOR UPDATE`.
* Cấu hình Nginx Reverse Proxy tiếp nhận HTTP (80) và HTTPS (443) với Security Headers.
* Tự động hóa giám sát với Prometheus và 4 Dashboards Grafana.
* Tập trung hóa nhật ký với Loki, Promtail và 4 truy vấn LogQL thực tế.
* Thực hiện 8 biện pháp gia cố bảo mật (Security Hardening).

---

## CHƯƠNG 2: PHÂN TÍCH YÊU CẦU VÀ THIẾT KẾ HỆ THỐNG

### 2.1. Sơ đồ kiến trúc tổng thể (Architecture Diagram)
```
┌─────────────────────────────────────────────────────────────┐
│                 NGƯỜI DÙNG / TRÌNH DUYỆT WEB                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP (:80) / HTTPS (:443)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             NGINX REVERSE PROXY (Cổng duy nhất)             │
│  - SSL Termination (HTTP/2, TLS 1.3, HSTS)                  │
│  - 5 Security Headers (CSP, X-Frame, X-Content-Type...)     │
│  - limit_except chặn method lạ (403 Forbidden)              │
└──────────────┬──────────────────────────────┬───────────────┘
               │ (Proxy pass /)               │ (Proxy pass /api/)
               ▼                              ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│      FRONTEND SPA           │  │     BACKEND RESTful API    │
│  - React 18 + Vite          │  │  - Node.js 20 Express      │
│  - Nginx Alpine web server  │  │  - User non-root: node     │
│  - Giao diện tiếng Việt     │  │  - Bcrypt & JWT (RBAC)     │
└─────────────────────────────┘  │  - Prometheus /metrics     │
                                 └──────────────┬─────────────┘
                                                │ Pool Query
                                                ▼
                                 ┌────────────────────────────┐
                                 │    POSTGRESQL 16 (DB)      │
                                 │  - Chuẩn 3NF, ACID         │
                                 │  - SELECT FOR UPDATE       │
                                 │  - Cổng 5432 cô lập nội bộ │
                                 └────────────────────────────┘
```

### 2.2. Phân vùng mạng và an ninh Zero-Trust
1. **`hotel-frontend-net`**: Kết nối Nginx, Frontend và Backend.
2. **`hotel-backend-net`**: Kết nối Backend, PostgreSQL và pgAdmin. Cổng 5432 của CSDL hoàn toàn không mở ra ngoài Internet.
3. **`hotel-monitor-net`**: Kết nối Backend, Prometheus, Grafana, Loki, Promtail và 4 Exporters.

---

## CHƯƠNG 3: CÔNG NGHỆ SỬ DỤNG VÀ KIẾN TRÚC TỔNG THỂ

Hệ thống điều phối cụm 13 container độc lập:
1. `postgres` (postgres:16-alpine) - CSDL quan hệ chuẩn 3NF
2. `backend` (node:20-alpine) - RESTful API, khóa dòng, tính tiền độc quyền
3. `frontend` (nginx:1.27-alpine multi-stage) - Giao diện React SPA
4. `nginx` (nginx:1.27-alpine) - Reverse Proxy, SSL, Security Headers
5. `pgadmin` (dpage/pgadmin4:8.12) - Quản trị CSDL trực quan (:8082)
6. `prometheus` (prom/prometheus:v2.54.1) - Thu thập time-series metrics (:9090)
7. `grafana` (grafana/grafana:11.2.0) - Trực quan hóa 4 dashboards (:3001)
8. `loki` (grafana/loki:3.1.1) - Lưu trữ log tập trung (:3101)
9. `promtail` (grafana/promtail:3.1.1) - Log Shipper vận chuyển log về Loki
10. `cadvisor` (gcr.io/cadvisor/cadvisor:v0.49.1) - Đo tài nguyên container (:8085)
11. `node-exporter` (prom/node-exporter:v1.8.2) - Đo tài nguyên host OS (:9100)
12. `nginx-exporter` (nginx/nginx-prometheus-exporter:1.3.0) - Cào active connections (:9113)
13. `postgres-exporter` (prometheuscommunity/postgres-exporter:v0.15.0) - Cào DB metrics (:9187)

---

## CHƯƠNG 4: XÂY DỰNG WEBSITE, BACKEND VÀ POSTGRESQL; TRÌNH BÀY PGADMIN

### 4.1. Lược đồ thực thể chuẩn hóa 3NF trong PostgreSQL
Bao gồm 6 bảng: `users`, `customers`, `room_types`, `rooms`, `bookings`, `booking_status_history`.

### 4.2. Giải thuật khóa dòng chống đặt trùng phòng (Row-Level Locking)
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // 1. Khóa bi quan dòng phòng được chọn
  const room = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [room_id]);

  // 2. Kiểm tra xung đột khoảng ngày
  const conflict = await client.query(`
    SELECT id FROM bookings
    WHERE room_id = $1 AND status != 'cancelled'
      AND NOT (check_out_date <= $2::date OR check_in_date >= $3::date)
  `, [room_id, check_in_date, check_out_date]);

  if (conflict.rows.length > 0) {
    await client.query('ROLLBACK');
    return res.status(409).json({ success: false, message: 'Phòng đã có khách đặt trong khoảng ngày này.' });
  }

  // 3. Tiến hành chèn khách hàng, tạo mã BK-XXXXXX và commit
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

---

## CHƯƠNG 5: CẤU HÌNH DOCKER COMPOSE VÀ NGINX REVERSE PROXY

* **5 Security Headers:** `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy`, `Strict-Transport-Security`.
* **Ẩn danh máy chủ:** `server_tokens off;`
* **Chặn phương thức ghi:** `limit_except GET HEAD { deny all; }` trả về HTTP 403 Forbidden.
* **HTTPS tự ký:** Cặp khóa RSA 2048-bit tại `/etc/nginx/certs/server.crt`. Hướng dẫn kiểm tra với curl: `curl.exe -k -I https://localhost/`.

---

## CHƯƠNG 6: TRIỂN KHAI PROMETHEUS VÀ GRAFANA

Prometheus cào 6 Targets chu kỳ 5-10s:
1. `prometheus` (:9090)
2. `hotel-backend` (:5000/metrics)
3. `postgres-exporter` (:9187)
4. `nginx-exporter` (:9113)
5. `cadvisor` (:8080)
6. `node-exporter` (:9100)

Grafana tự động provision 4 Dashboards chuyên dụng: Overview, Database, Nginx và Docker Containers.

---

## CHƯƠNG 7: TRIỂN KHAI LOKI, PROMTAIL VÀ CÁC TRUY VẤN LOGQL

### Bốn truy vấn LogQL thực tế:
1. Xem access log thời gian thực: `{job="nginx"}`
2. Lọc request phát sinh lỗi HTTP 5xx: `{job="nginx"} | status >= 500`
3. Tìm kiếm cảnh báo/lỗi Backend: `{job="backend"} |= "error"`
4. Đếm số dòng log Nginx trong 5 phút: `sum(count_over_time({job="nginx"}[5m]))`

---

## CHƯƠNG 8: CÁC BIỆN PHÁP HARDENING VÀ KIỂM TRA BẢO MẬT

1. **Non-Root Containers:** Backend chạy user `node` (UID 1000). Kiểm tra: `docker exec hotel_backend whoami`.
2. **Network Isolation:** Cổng 5432 CSDL cô lập 100% trong `hotel-backend-net`.
3. **Secret Management:** `.env` được loại trừ trong `.gitignore`.
4. **Database Least Privilege:** Tách quyền `hotel_admin` và `hotel_app_user`.
5. **Nginx Hardening:** 5 Security Headers, ẩn server_tokens, limit_except.
6. **Docker Runtime:** `security_opt: [no-new-privileges:true]`, giới hạn CPU/RAM.
7. **Backend API Hardening:** Rate limit 10 req/15m login, CORS whitelist, truy vấn tham số hóa.
8. **Sanitized Logging:** Che giấu mật khẩu, token, CCCD trong tệp log.

---

## CHƯƠNG 9: KẾT QUẢ KIỂM THỬ VÀ ĐÁNH GIÁ THEO TIÊU CHÍ CHẤM ĐIỂM

Bộ kiểm thử `scripts/test-system.ps1` kiểm tra tự động **24 Test Cases**, đạt tỷ lệ **100% PASS (24/24)**:
* Nginx Web, Healthcheck, Metrics, Stub status: PASS
* Chặn POST vào static Frontend: PASS (403 Forbidden)
* Đăng nhập Admin, cấp JWT token: PASS
* Phân quyền RBAC (401 khi thiếu token, 200 khi có token): PASS
* Đặt phòng mới (201 Created), Chống đặt trùng phòng (409 Conflict): PASS
* Tra cứu đúng mã + email (200 OK), Chặn tra cứu sai email (404 Not Found): PASS
* Hoạt động của Prometheus, Grafana, Loki, pgAdmin và 4 Exporters: PASS

### Kế hoạch 3 Commit bắt buộc trên GitHub:
1. `feat: deploy hotel booking with nginx reverse proxy` (Commit 1)
2. `feat: add prometheus grafana monitoring` (Commit 2)
3. `feat: add loki logging and security hardening` (Commit 3)

---

## KẾT LUẬN, HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN
Dự án đã đáp ứng đầy đủ và vượt mức yêu cầu kỹ thuật của học phần Triển khai và Quản trị Hệ thống Phần mềm tại Trường Đại học Công nghệ Thông tin & Truyền thông Thái Nguyên.

---

## TÀI LIỆU THAM KHẢO
1. Docker Documentation, https://docs.docker.com/compose/
2. Nginx Reverse Proxy & SSL, https://nginx.org/en/docs/
3. PostgreSQL 16 Concurrency Control, https://www.postgresql.org/docs/16/
4. Prometheus & Grafana Labs Documentation.
5. OWASP Top 10 Security Guidelines.

---

## PHỤ LỤC: LỆNH TRIỂN KHAI, DANH SÁCH CẤU HÌNH VÀ HƯỚNG DẪN DEMO
* Chạy hệ thống: `docker compose up -d --build`
* Kiểm thử tự động: `powershell -ExecutionPolicy Bypass -File .\scripts\test-system.ps1`
* Sao lưu CSDL: `powershell .\scripts\backup-db.ps1`
