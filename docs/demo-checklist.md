# KỊCH BẢN TRÌNH DIỄN VÀ BẰNG CHỨNG BẢO VỆ ĐỒ ÁN (DEMO CHECKLIST)
## ĐỀ TÀI: XÂY DỰNG VÀ QUẢN TRỊ HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN BẰNG DOCKER COMPOSE
### Học phần: Triển khai và Quản trị Hệ thống Phần mềm
* **Sinh viên thực hiện:** Trần Phương Nam
* **Mã số sinh viên (MSSV):** DTC245200054
* **Lớp:** Công Nghệ Thông Tin-K23A
* **Giảng viên hướng dẫn:** ThS. Nguyễn Anh Chuyên
* **Trường Đại học Công nghệ Thông tin & Truyền thông Thái Nguyên (ICTU)**

---

## I. DANH SÁCH CÔNG TÁC CHUẨN BỊ TRƯỚC BUỔI BẢO VỆ (PRE-DEMO CHECKLIST)

| STT | Hạng mục chuẩn bị | Lệnh kiểm tra / Thao tác | Trạng thái kỳ vọng |
| :---: | :--- | :--- | :---: |
| 1 | Docker Desktop đang chạy | `docker info` | Docker daemon active, WSL2 sẵn sàng |
| 2 | Cụm 13 container hoạt động | `docker compose ps` | Tất cả 13 service đều `Up (healthy)` |
| 3 | Mạng nội bộ và CSDL sẵn sàng | `docker compose logs --tail=20 postgres` | `database system is ready to accept connections` |
| 4 | Kịch bản test tự động 24/24 | `powershell -ExecutionPolicy Bypass -File .\scripts\test-system.ps1` | **24 PASS, 0 FAIL** |
| 5 | Các tab trình duyệt đã mở sẵn | Mở sẵn 6 tab trên trình duyệt Chrome/Edge | Không bị độ trễ mở trang |
| 6 | Bản sao lưu CSDL dự phòng | `powershell .\scripts\backup-db.ps1` | Tệp dump `.sql.gz` có sẵn trong `backups/` |

---

## II. THỨ TỰ TRÌNH DIỄN 6 BƯỚC CHI TIẾT (LIVE DEMO WORKFLOW)

### BƯỚC 1: TRÌNH DIỄN WEBSITE SPA VÀ NGHIỆP VỤ ĐẶT PHÒNG KHÁCH SẠN
* **URL truy cập:** [http://localhost/](http://localhost/)
* **Các thao tác trình bày:**
  1. Trình diễn giao diện sang trọng chuẩn 5 sao của Aurora Grand Resort & Spa (banner, tiện ích 5 sao, danh mục phòng).
  2. Bấm vào nút **Đặt phòng ngay** trên một căn phòng còn trống (ví dụ: Phòng 102 - Deluxe King Suite).
  3. Điền thông tin khách hàng mẫu:
     * Họ tên: `Trần Phương Nam`
     * Email: `nam.tp@ictu.edu.vn`
     * Số điện thoại: `0988112233`
     * Số CCCD: `019200054321`
     * Chọn ngày nhận phòng và ngày trả phòng (ví dụ: từ ngày 20 đến 25 tháng sau).
  4. Bấm **Xác nhận đặt phòng**: Hệ thống tính toán tổng tiền độc quyền tại Backend, tạo giao dịch thành công và sinh mã đặt phòng duy nhất dạng `BK-XXXXXX`.
  5. **Bằng chứng chống đặt trùng phòng (Double-Booking Prevention):**
     * Mở tab ẩn danh mới hoặc trình duyệt thứ hai, thực hiện đặt lại đúng căn phòng 102 trong cùng khoảng ngày vừa đặt.
     * Bấm đặt phòng: Hệ thống lập tức hiển thị thông báo lỗi `409 Conflict: Phòng đã có khách đặt trong khoảng ngày này`.
     * **Giải thích chuyên môn:** Giải thuật kết hợp PostgreSQL Transaction với khóa dòng bi quan `SELECT ... FOR UPDATE` đảm bảo an toàn tuyệt đối ngay cả khi có hàng trăm request đồng thời.

---

### BƯỚC 2: TRA CỨU ĐƠN HÀNG VÀ TRANG QUẢN TRỊ ADMIN (RBAC)
* **URL tra cứu khách hàng:** [http://localhost/#lookup](http://localhost/#lookup)
  1. Nhập đúng **Mã đặt phòng** VÀ đúng **Email**: Hệ thống hiển thị chi tiết thông tin đơn, ngày nhận/trả phòng, tổng tiền.
  2. Thử nhập đúng Mã đặt phòng nhưng **sai Email**: Hệ thống từ chối hiển thị và trả về `404 Not Found`.
  * **Giải thích chuyên môn:** Bảo vệ quyền riêng tư cá nhân theo chuẩn an toàn thông tin, chống tấn công quét ID (ID Enumeration).
* **URL Quản trị Admin:** [http://localhost/#admin](http://localhost/#admin)
  1. Đăng nhập bằng tài khoản Quản trị viên:
     * Tên đăng nhập: `admin`
     * Mật khẩu demo: `admin123` *(Mật khẩu băm bằng Bcrypt Salt=10, cấp JWT Token 24h)*
  2. Trình diễn chức năng quản lý:
     * Quản lý phòng: Thêm phòng mới, sửa giá, đổi trạng thái (`available`, `occupied`, `maintenance`).
     * Xem hồ sơ khách lưu trú (`customers`) chuẩn hóa 3NF không trùng lặp.
     * Cập nhật trạng thái đơn đặt phòng (`Confirmed` $\rightarrow$ `Checked-in` $\rightarrow$ `Checked-out`).
     * Tab **Hệ thống LIVE**: Hiển thị độ trễ CSDL thời gian thực, Uptime, RAM.

---

### BƯỚC 3: QUẢN TRỊ CƠ SỞ DỮ LIỆU POSTGRESQL QUA PGADMIN 4
* **URL truy cập:** [http://localhost:8082](http://localhost:8082)
* **Tài khoản đăng nhập demo:** `admin@hotel.com` / `AdminSecure2026!`
* **Các thao tác trình bày:**
  1. Vào cây thư mục: `Servers` $\rightarrow$ `Hotel Booking Cluster` $\rightarrow$ `Databases` $\rightarrow$ `hotel_booking_db` $\rightarrow$ `Schemas` $\rightarrow$ `public` $\rightarrow$ `Tables`.
  2. Trình bày 6 bảng dữ liệu quan hệ chuẩn 3NF: `users`, `customers`, `room_types`, `rooms`, `bookings`, `booking_status_history`.
  3. Mở Query Tool chạy lệnh kiểm tra đơn vừa đặt:
     ```sql
     SELECT b.booking_code, c.full_name, r.room_number, b.total_amount, b.status 
     FROM bookings b
     JOIN customers c ON b.customer_id = c.id
     JOIN rooms r ON b.room_id = r.id
     ORDER BY b.id DESC LIMIT 5;
     ```
  4. Trình bày bảng `booking_status_history` ghi nhận toàn bộ lịch sử thay đổi trạng thái (Audit Trail).

---

### BƯỚC 4: NGINX REVERSE PROXY, HTTPS 443 VÀ 5 SECURITY HEADERS
* **Thực hiện trên Terminal PowerShell:**
  1. Kiểm tra tính hợp lệ của cấu hình Nginx trong container:
     ```powershell
     docker exec hotel_nginx nginx -t
     ```
     *(Kết quả: `syntax is ok, test is successful`)*
  2. Kiểm tra truy cập an toàn HTTPS cổng 443 và 5 tiêu đề bảo mật:
     ```powershell
     curl.exe -k -I https://localhost/
     ```
     * **Bằng chứng hiển thị:**
       - `HTTP/2 200`
       - `server: nginx` *(Hoàn toàn ẩn số hiệu phiên bản theo chỉ thị `server_tokens off;`)*
       - `x-frame-options: SAMEORIGIN` *(Chống Clickjacking)*
       - `x-content-type-options: nosniff` *(Chống MIME Sniffing)*
       - `referrer-policy: strict-origin-when-cross-origin`
       - `content-security-policy: default-src 'self' ...` *(Whitelist tài nguyên an toàn)*
       - `strict-transport-security: max-age=31536000` *(Ép buộc HTTPS trong 1 năm)*
  3. Kiểm tra chặn phương thức HTTP trái phép vào trang tĩnh (Chỉ thị `limit_except`):
     ```powershell
     curl.exe -s -X POST http://localhost/
     ```
     *(Kết quả: Trả về HTTP 403 Forbidden - bảo vệ trang tĩnh tuyệt đối)*

---

### BƯỚC 5: HỆ THỐNG GIÁM SÁT PROMETHEUS & 4 DASHBOARDS GRAFANA
* **URL Prometheus Targets:** [http://localhost:9090/targets](http://localhost:9090/targets)
  1. Trình diễn **cả 6 Scrape Targets** đều ở trạng thái **`UP (1/1)`** màu xanh lá cây:
     - `prometheus`: Tự giám sát tiến trình.
     - `hotel-backend`: Thu thập số liệu nghiệp vụ từ thư viện `prom-client` (doanh thu, đơn đặt, độ trễ API).
     - `postgres-exporter`: Active connections, Cache hit ratio, Commit/Rollback.
     - `nginx-exporter`: Active connections, Request handling rate.
     - `cadvisor`: Đo đạc CPU, RAM, Network I/O chi tiết từng container.
     - `node-exporter`: Đo đạc tài nguyên phần cứng hệ điều hành host.
* **URL Grafana Dashboards:** [http://localhost:3001](http://localhost:3001) *(Đăng nhập: `admin` / `admin`)*
  1. Mở **Dashboard 1: Hotel System Overview**:
     - Xem Panel trạng thái tổng thể 6 targets.
     - Xem Panel doanh thu tích lũy bằng VNĐ và số phòng còn trống.
     - Xem biểu đồ biến thiên Request Rate (req/s) và p95 Latency.
  2. Mở **Dashboard 2: PostgreSQL Performance**:
     - Xem tỷ lệ Cache Hit Ratio (> 98%), Active connections và số lượng Transaction Commit/s.
  3. Mở **Dashboard 3: Nginx Metrics**:
     - Xem Active connections, Writing/Reading và tỷ lệ các mã HTTP phản hồi.
  4. Mở **Dashboard 4: cAdvisor Containers**:
     - Xem mức tiêu thụ CPU và RAM của từng container trong thời gian thực.

---

### BƯỚC 6: THU THẬP LOG TẬP TRUNG LOKI VÀ TRUY VẤN BỐN CÂU LOGQL
* **URL Grafana Explore:** [http://localhost:3001/explore](http://localhost:3001/explore) *(Chọn Datasource: **Loki**)*
* **Tạo lưu lượng thử nghiệm (Traffic Generation):**
  ```powershell
  # Tạo 10 request thành công và 1 request lỗi method
  1..10 | ForEach-Object { curl.exe -s -o $null http://localhost/api/rooms }
  curl.exe -s -X POST http://localhost/
  ```
* **Chạy lần lượt 4 truy vấn LogQL thực tế:**
  1. Xem Access log thời gian thực của Nginx:
     ```logql
     {job="nginx"}
     ```
  2. Lọc các yêu cầu phát sinh mã lỗi máy chủ HTTP 5xx:
     ```logql
     {job="nginx"} | status >= 500
     ```
  3. Lọc các dòng log cảnh báo hoặc lỗi của Backend Node.js:
     ```logql
     {job="backend"} |= "error"
     ```
  4. Đếm số dòng log Nginx ghi nhận trong 5 phút gần nhất:
     ```logql
     sum(count_over_time({job="nginx"}[5m]))
     ```

---

## III. BẰNG CHỨNG GIA CỐ BẢO MẬT (HARDENING VERIFICATION MATRIX)

Chạy trực tiếp các lệnh kiểm chứng sau trên Terminal để đối chiếu với tiêu chí an ninh:

```powershell
# 1. Kiểm tra Non-Root Container:
docker exec hotel_backend whoami
# -> Kết quả: node (UID 1000, không chạy root)

# 2. Kiểm tra Cô lập Cổng CSDL (Network Isolation):
docker port hotel_postgres
# -> Kết quả: Cổng 5432 không mở ra ngoài Internet

# 3. Kiểm tra Quản lý Secret (.gitignore):
git status --ignored
# -> Kết quả: .env được git loại trừ an toàn

# 4. Kiểm tra Chống leo thang đặc quyền:
docker inspect hotel_backend --format "{{.HostConfig.SecurityOpt}}"
# -> Kết quả: [no-new-privileges:true]

# 5. Kiểm tra Giới hạn tài nguyên (Resource Limits):
docker inspect hotel_backend --format "CPU: {{.HostConfig.NanoCpus}} - RAM: {{.HostConfig.Memory}}"
# -> Kết quả: Giới hạn 0.8 CPU và 384MB RAM rõ ràng

# 6. Kiểm tra Sanitized Logging (Không lộ thông tin nhạy cảm):
docker exec hotel_backend head -n 20 /var/log/backend/app.log
# -> Kết quả: Mật khẩu, token, số CCCD được lọc sạch (redacted)
```

---

## IV. BẢNG PHƯƠNG ÁN DỰ PHÒNG XỬ LÝ SỰ CỐ TẠI CHỖ (TROUBLESHOOTING)

| Tình huống phát sinh | Nguyên nhân khả dĩ | Lệnh xử lý nhanh tại chỗ |
| :--- | :--- | :--- |
| Trình duyệt không mở được trang | Container chưa bật hoặc bị treo | `docker compose up -d` và `docker compose ps` |
| Một container báo Unhealthy | CSDL chưa khởi động xong | `docker restart hotel_backend hotel_nginx` |
| Grafana chưa có dữ liệu biểu đồ | Chưa có traffic gọi vào hệ thống | Chạy script: `.\scripts\test-system.ps1` để tự động tạo traffic mẫu |
| Port bị xung đột với dịch vụ khác | Ứng dụng khác đang chiếm cổng | Kiểm tra: `netstat -ano \| findstr :80` và đổi port tương ứng trong file `.env` |
| CSDL bị xóa nhầm dữ liệu trong demo | Thao tác nhầm trong lúc demo | Phục hồi tức thì: `powershell .\scripts\restore-db.ps1` |
