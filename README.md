# 🏨 HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN 5 SAO - AURORA GRAND RESORT & SPA
## HỌC PHẦN: TRIỂN KHAI VÀ QUẢN TRỊ HỆ THỐNG PHẦN MỀM (ĐỀ TÀI 6)
### TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN & TRUYỀN THÔNG THÁI NGUYÊN (ICTU)

* **Giảng viên hướng dẫn:** ThS. Nguyễn Anh Chuyên
* **Sinh viên thực hiện:** Trần Phương Nam
* **Mã số sinh viên (MSSV):** DTC245200054
* **Lớp:** Công Nghệ Thông Tin-K23A
* **Địa điểm & Năm thực hiện:** Thái Nguyên - Năm 2026

---

## 📌 GIỚI THIỆU TỔNG QUAN

Hệ thống Đặt phòng Khách sạn (Aurora Grand Resort & Spa) là một giải pháp hoàn chỉnh từ tầng ứng dụng Client-Server đến tầng hạ tầng container hóa Microservices, đáp ứng tiêu chuẩn khắt khe về **Triển khai (Deployment)**, **Quản trị (Administration)**, **Giám sát hiệu năng (Prometheus & Grafana Monitoring)**, **Quản lý nhật ký tập trung (Loki & Promtail Logging)** và **Gia cố an ninh đa tầng (Security Hardening)**.

> [!WARNING]
> **THÔNG BÁO VỀ THÔNG TIN ĐĂNG NHẬP VÀ MẬT KHẨU DEMO:**
> Các tài khoản và mật khẩu cung cấp trong tài liệu này được cấu hình riêng cho **mục đích kiểm thử trong môi trường học tập, chấm điểm và bảo vệ đồ án tại trường**. Trước khi triển khai lên môi trường sản xuất thực tế (Production), quản trị viên bắt buộc phải thay đổi toàn bộ mật khẩu, khóa bí mật JWT và cấp phát chứng chỉ số SSL có thẩm quyền từ Let's Encrypt / DigiCert.

---

## 🌐 DANH MỤC DỊCH VỤ, CỔNG VÀ ĐỊA CHỈ TRUY CẬP

Hệ thống điều phối chính xác 13 container, các cổng công khai được phân bổ không xung đột với các ứng dụng máy chủ khác:

| Thành phần Dịch vụ | URL Truy cập Thực tế | Tài khoản / Mật khẩu Lab | Vai trò và Trách nhiệm |
| :--- | :--- | :--- | :--- |
| **Website Khách Hàng (Nginx)** | [http://localhost:80](http://localhost:80) | Không yêu cầu | Xem phòng, đặt phòng trực tuyến, tra cứu đơn |
| **Website Bảo Mật (HTTPS)** | [https://localhost:443](https://localhost:443) | Không yêu cầu | Giao tiếp mã hóa TLS 1.2/1.3, HTTP/2, HSTS |
| **Trang Quản Trị (Admin Tab)** | [http://localhost:80#admin](http://localhost:80#admin) | `admin` / `admin123`<br>`staff` / `staff123` | Quản lý phòng, đơn đặt phòng, xem khách hàng |
| **Backend API Healthcheck** | [http://localhost:80/health](http://localhost:80/health) | Không yêu cầu | Báo cáo sức khỏe API, RAM, Uptime, DB latency |
| **Backend Metrics Endpoint** | [http://localhost:80/metrics](http://localhost:80/metrics) | Không yêu cầu | Chỉ số nghiệp vụ tương thích Prometheus |
| **Nginx Stub Status** | [http://localhost:8089/stub_status](http://localhost:8089/stub_status) | Không yêu cầu | Thống kê kết nối active/reading/writing Nginx |
| **pgAdmin 4 (Quản trị CSDL)** | [http://localhost:8082](http://localhost:8082) | `admin@hotel.com`<br>`AdminSecure2026!` | Giao diện đồ họa quản trị CSDL PostgreSQL 16 |
| **Prometheus Server UI** | [http://localhost:9090](http://localhost:9090) | Không yêu cầu | Cào dữ liệu time-series, kiểm tra 6 Targets |
| **Grafana Dashboards** | [http://localhost:3001](http://localhost:3001) | `admin` / `admin` | Trực quan hóa 4 dashboards chuyên sâu tự nạp |
| **Loki Log Server Ready** | [http://localhost:3101/ready](http://localhost:3101/ready) | Không yêu cầu | Kiểm tra trạng thái sẵn sàng của Logging Engine |
| **cAdvisor Container Metrics** | [http://localhost:8085](http://localhost:8085) | Không yêu cầu | Giám sát CPU, RAM, Network I/O containers |
| **Node Exporter Host Metrics** | [http://localhost:9100/metrics](http://localhost:9100/metrics) | Không yêu cầu | Chỉ số phần cứng máy chủ vật lý |
| **Nginx Prometheus Exporter** | [http://localhost:9113/metrics](http://localhost:9113/metrics) | Không yêu cầu | Metrics kết nối Nginx cho Prometheus cào |
| **PostgreSQL Exporter** | [http://localhost:9187/metrics](http://localhost:9187/metrics) | Không yêu cầu | Metrics giao dịch CSDL cho Prometheus cào |
| **CSDL PostgreSQL 16** | `localhost:5433` (nội bộ: 5432) | `hotel_admin`<br>`HotelSecurePassword2026!` | CSDL quan hệ chuẩn 3NF, khóa dòng an toàn |

---

## 🚀 HƯỚNG DẪN 18 BƯỚC KHỞI CHẠY VÀ VẬN HÀNH TỪ ĐẦU (WINDOWS + DOCKER DESKTOP)

### Bước 1: Cài đặt Docker Desktop và Git
1. Tải và cài đặt **Docker Desktop for Windows** phiên bản mới nhất (hỗ trợ WSL2 backend): [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
2. Tải và cài đặt **Git for Windows**: [https://git-scm.com/download/win](https://git-scm.com/download/win).
3. Khởi động Docker Desktop và đảm bảo biểu tượng Docker ở thanh taskbar hiển thị màu xanh lá cây (**Engine running**).

### Bước 2: Clone repository về máy tính
Mở terminal **Windows PowerShell** hoặc **Git Bash** và thực thi:
```powershell
git clone https://github.com/DTC245200054/kthp-de6-hotel-booking.git
cd kthp-de6-hotel-booking
```

### Bước 3: Tạo tệp cấu hình biến môi trường `.env` từ `.env.example`
```powershell
Copy-Item .env.example .env
```
*(Nếu trên Linux/Bash: `cp .env.example .env`)*

### Bước 4: Thiết lập các mật khẩu an toàn trong tệp `.env`
Mở tệp `.env` bằng Notepad hoặc VS Code để kiểm tra/chỉnh sửa các tham số an toàn:
```env
# Cấu hình CSDL PostgreSQL
POSTGRES_DB=hotel_booking_db
POSTGRES_USER=hotel_admin
POSTGRES_PASSWORD=HotelSecurePassword2026!
POSTGRES_PORT=5433

# Cấu hình Cổng Dịch vụ
HTTP_PORT=80
HTTPS_PORT=443
GRAFANA_PORT=3001
PGADMIN_PORT=8082
LOKI_PORT=3101

# Khóa bí mật JWT
JWT_SECRET=super_secret_hotel_jwt_key_2026_dtc245200054
```

### Bước 5: Khởi tạo và chạy hệ thống bằng Docker Compose
Biên dịch image và khởi chạy toàn bộ cụm 13 container trong nền:
```powershell
docker compose up -d --build
```

### Bước 6: Chờ cơ chế Healthcheck hoàn tất kiểm tra sức khỏe
Kiểm tra trạng thái container cho tới khi tất cả các dịch vụ đều chuyển sang trạng thái `healthy`:
```powershell
docker compose ps
```
*(Cơ chế `depends_on: { condition: service_healthy }` đảm bảo CSDL sẵn sàng trước khi Backend khởi động, và Backend sẵn sàng trước khi Nginx Reverse Proxy tiếp nhận traffic).*

### Bước 7: Truy cập Website chính
Mở trình duyệt truy cập: **[http://localhost/](http://localhost/)**
* Giao diện Website khách sạn 5 sao Aurora Grand Resort & Spa hiển thị sang trọng với thanh điều hướng, banner chào mừng và danh mục các hạng phòng.

### Bước 8: Thử tìm phòng và đặt phòng trực tuyến
1. Trên giao diện trang chủ, duyệt danh mục phòng hoặc sử dụng bộ lọc tìm kiếm.
2. Bấm vào nút **Đặt phòng ngay** tại phòng 102 (Deluxe King Room).
3. Nhập thông tin khách hàng:
   * Họ tên: `Trần Phương Nam`
   * Email: `nam.tp@ictu.edu.vn`
   * Số điện thoại: `0988112233`
   * Số CCCD: `019200054321`
   * Chọn ngày nhận phòng và ngày trả phòng trong tương lai.
4. Bấm **Xác nhận đặt phòng**: Hệ thống tính toán tổng tiền tại Backend, lưu thông tin vào CSDL PostgreSQL và sinh mã đặt phòng duy nhất dạng `BK-XXXXXX`.
5. **Kiểm tra chống đặt trùng phòng (Double-Booking Prevention):** Thực hiện đặt lại đúng căn phòng 102 trong cùng khoảng ngày. Hệ thống lập tức trả về thông báo lỗi `409 Conflict: Phòng đã có khách đặt`.

### Bước 9: Tra cứu đơn đặt phòng và đăng nhập trang Quản trị
* **Tra cứu khách hàng:** Vào mục [http://localhost/#lookup](http://localhost/#lookup), nhập Mã đặt phòng và Email. Hệ thống yêu cầu khớp cả hai thông tin mới hiển thị chi tiết (bảo vệ quyền riêng tư).
* **Đăng nhập Quản trị:** Bấm vào tab **Quản trị** trên thanh menu (hoặc [http://localhost/#admin](http://localhost/#admin)):
  * Tài khoản demo: `admin`
  * Mật khẩu demo: `admin123`
  * Kiểm tra chức năng: Quản lý danh mục phòng, xem hồ sơ khách lưu trú (`customers`), cập nhật trạng thái đơn đặt phòng.

### Bước 10: Mở pgAdmin 4 và kiểm tra cơ sở dữ liệu
1. Truy cập: **[http://localhost:8082](http://localhost:8082)**
2. Đăng nhập với:
   * Email: `admin@hotel.com`
   * Mật khẩu: `AdminSecure2026!`
3. CSDL đã được nạp sẵn qua `pgadmin/servers.json`. Nhấp vào `Hotel Booking Cluster` $\rightarrow$ `hotel_booking_db` $\rightarrow$ `Schemas` $\rightarrow$ `public` $\rightarrow$ `Tables`.
4. Xem dữ liệu trong các bảng: `rooms`, `customers`, `bookings`, `booking_status_history`.

### Bước 11: Mở Prometheus Server và kiểm tra 6 Targets
1. Truy cập: **[http://localhost:9090/targets](http://localhost:9090/targets)**
2. Đảm bảo tất cả 6 Scrape Targets (`prometheus`, `hotel-backend`, `postgres-exporter`, `nginx-exporter`, `cadvisor`, `node-exporter`) đều hiển thị trạng thái màu xanh lá cây **`UP (1/1)`**.
3. Vào tab **Graph** ([http://localhost:9090/graph](http://localhost:9090/graph)), nhập thử biểu thức PromQL:
   ```promql
   hotel_bookings_total
   ```
   Bấm Execute để xem tổng số lượt đặt phòng đã được ghi nhận.

### Bước 12: Mở Grafana, đăng nhập và xem 4 Dashboards
1. Truy cập: **[http://localhost:3001](http://localhost:3001)**
2. Đăng nhập với tài khoản: `admin` / `admin`
3. Điều hướng vào menu **Dashboards**, kiểm tra 4 Dashboards đã được nạp sẵn:
   * **Hotel System Overview:** Tổng quan 6 targets, doanh thu VNĐ, phòng trống, request rate.
   * **PostgreSQL Performance:** Hiệu năng DB, Cache hit ratio (> 98%), Active connections.
   * **Nginx Metrics:** Lưu lượng kết nối active, writing, reading qua Proxy.
   * **cAdvisor Containers:** Chiếm dụng CPU, RAM của từng container.

### Bước 13: Tạo một số request để phát sinh log
Mở PowerShell và chạy đoạn lệnh sau để tạo lưu lượng truy cập:
```powershell
# Tạo 20 request thành công (200 OK)
1..20 | ForEach-Object { curl.exe -s -o $null http://localhost/api/rooms }

# Tạo request gọi route không tồn tại (404 Not Found)
curl.exe -s http://localhost/api/khong-ton-tai

# Tạo request vi phạm phương thức Nginx (403 Forbidden)
curl.exe -s -X POST http://localhost/
```

### Bước 14: Mở Grafana Explore, chọn Loki và chạy 4 truy vấn LogQL
1. Truy cập: **[http://localhost:3001/explore](http://localhost:3001/explore)**
2. Tại mục Data source góc trên bên trái, chọn **Loki**.
3. Chạy lần lượt 4 câu truy vấn LogQL thực tế:
   * **Xem Access log Nginx:** `{job="nginx"}`
   * **Tìm lỗi máy chủ 5xx:** `{job="nginx"} | status >= 500`
   * **Tìm lỗi Backend Node.js:** `{job="backend"} |= "error"`
   * **Đếm tần suất log trong 5 phút:** `sum(count_over_time({job="nginx"}[5m]))`

### Bước 15: Kiểm tra HTTPS cổng 443 và Security Headers
Chạy lệnh kiểm tra kết nối mã hóa TLS và các tiêu đề bảo mật:
```powershell
curl.exe -k -I https://localhost/
```
* Bằng chứng hiển thị: Trả về `HTTP/2 200`, `Server: nginx` (ẩn phiên bản), đủ 5 Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`).

### Bước 16: Kiểm tra các biện pháp Hardening bảo mật
Chạy các lệnh kiểm tra an ninh hệ thống:
```powershell
# 1. Kiểm tra Non-Root user trong container:
docker exec hotel_backend whoami
# Kết quả: node (UID 1000)

# 2. Kiểm tra Cô lập cổng CSDL:
docker port hotel_postgres
# Kết quả: Cổng 5432 không bị ánh xạ trực tiếp ra ngoài Internet

# 3. Kiểm tra Chống nâng quyền:
docker inspect hotel_backend --format "{{.HostConfig.SecurityOpt}}"
# Kết quả: [no-new-privileges:true]
```

### Bước 17: Dừng hệ thống an toàn mà KHÔNG mất dữ liệu
Khi kết thúc phiên làm việc, chạy lệnh:
```powershell
docker compose down
```
> [!IMPORTANT]
> Lệnh `docker compose down` dừng và gỡ bỏ các container nhưng **BẢO LƯU NGUYÊN VẸN toàn bộ 7 Named Volumes** (`postgres_data`, `pgadmin_data`, `prometheus_data`, `grafana_data`, `loki_data`, `nginx_logs`, `backend_logs`). Toàn bộ dữ liệu đặt phòng và tài khoản không bị mất. Tuyệt đối không dùng cờ `-v` nếu không có nhu cầu xóa trắng hệ thống.

### Bước 18: Cách khắc phục các lỗi thường gặp (Troubleshooting Matrix)
| Hiện tượng lỗi | Nguyên nhân | Cách xử lý nhanh |
| :--- | :--- | :--- |
| **`Port 80/443 is already allocated`** | Dịch vụ IIS, Skype hoặc web server khác đang chiếm cổng | Kiểm tra `netstat -ano \| findstr :80`, tắt tiến trình chiếm cổng hoặc đổi `HTTP_PORT=8088` trong `.env`. |
| **Trình duyệt báo cảnh báo SSL đỏ** | Chứng chỉ số là dạng tự ký (Self-signed) cho môi trường lab | Nhấn **Nâng cao (Advanced)** $\rightarrow$ **Tiếp tục truy cập localhost** (hoặc gõ `thisisunsafe`). |
| **Backend báo lỗi kết nối CSDL** | CSDL PostgreSQL đang trong giai đoạn chạy script khởi tạo | Chờ 10-15 giây để container PostgreSQL chuyển sang trạng thái `healthy`, Backend sẽ tự động kết nối lại. |
| **Grafana chưa thấy log trong Explore** | Chưa phát sinh lưu lượng truy cập | Chạy script kiểm thử: `powershell -ExecutionPolicy Bypass -File .\scripts\test-system.ps1` để tự động tạo log. |

---

## 🧪 CHẠY BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN (24 TEST CASES)

Hệ thống tích hợp sẵn kịch bản kiểm thử tự động toàn diện kiểm tra mọi tiêu chí nghiệp vụ và an ninh:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-system.ps1
```
*(Kỳ vọng: **24 PASS, 0 FAIL** - Đạt 100% tỷ lệ thành công).*

---

## 📦 KẾ HOẠCH 3 COMMIT BẮT BUỘC TRÊN GITHUB

Nhánh `main` của dự án được tổ chức với đúng 3 commit chính thức:
* **Commit 1 (`a0326b1`):** `feat: deploy hotel booking with nginx reverse proxy`
* **Commit 2 (`7b4e150`):** `feat: add prometheus grafana monitoring`
* **Commit 3 (`57f9673`):** `feat: add loki logging and security hardening`

### Hướng dẫn đẩy lên GitHub cá nhân mang MSSV:
```powershell
git remote add origin https://github.com/DTC245200054/kthp-de6-hotel-booking.git
git branch -M main
git push -u origin main
```

---

## 📄 TÀI LIỆU VÀ BÁO CÁO ĐÍNH KÈM

1. **Báo cáo Word chính thức chuẩn Đại học ICTU ($\ge$ 23 trang):** [`BAO_CAO_KTHP_DE6_KHACH_SAN.docx`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/BAO_CAO_KTHP_DE6_KHACH_SAN.docx)
2. **Kịch bản Trình diễn & Bằng chứng Bảo vệ (Demo Checklist):** [`docs/demo-checklist.md`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docs/demo-checklist.md)
3. **Đặc tả Gia cố Bảo mật (Security Hardening):** [`docs/security-hardening.md`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docs/security-hardening.md)
4. **Bản Markdown của Báo cáo KTHP:** [`docs/bao-cao.md`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docs/bao-cao.md)
