# ðŸ¨ Há»† THá»NG Äáº¶T PHÃ’NG KHÃCH Sáº N 5 SAO - AURORA GRAND RESORT & SPA
## Há»ŒC PHáº¦N: TRIá»‚N KHAI VÃ€ QUáº¢N TRá»Š Há»† THá»NG PHáº¦N Má»€M (Äá»€ TÃ€I 6)
### TRÆ¯á»œNG Äáº I Há»ŒC CÃ”NG NGHá»† THÃ”NG TIN & TRUYá»€N THÃ”NG THÃI NGUYÃŠN (ICTU)

* **Giáº£ng viÃªn hÆ°á»›ng dáº«n:** ThS. Nguyá»…n Anh ChuyÃªn
* **Sinh viÃªn thá»±c hiá»‡n:** Tráº§n PhÆ°Æ¡ng Nam
* **MÃ£ sá»‘ sinh viÃªn (MSSV):** DTC245200054
* **Lá»›p:** CÃ´ng Nghá»‡ ThÃ´ng Tin-K23A
* **Äá»‹a Ä‘iá»ƒm & NÄƒm thá»±c hiá»‡n:** ThÃ¡i NguyÃªn - NÄƒm 2026

---

## ðŸ“Œ GIá»šI THIá»†U Tá»”NG QUAN

Há»‡ thá»‘ng Äáº·t phÃ²ng KhÃ¡ch sáº¡n (Aurora Grand Resort & Spa) lÃ  má»™t giáº£i phÃ¡p hoÃ n chá»‰nh tá»« táº§ng á»©ng dá»¥ng Client-Server Ä‘áº¿n táº§ng háº¡ táº§ng container hÃ³a Microservices, Ä‘Ã¡p á»©ng tiÃªu chuáº©n kháº¯t khe vá» **Triá»ƒn khai (Deployment)**, **Quáº£n trá»‹ (Administration)**, **GiÃ¡m sÃ¡t hiá»‡u nÄƒng (Prometheus & Grafana Monitoring)**, **Quáº£n lÃ½ nháº­t kÃ½ táº­p trung (Loki & Promtail Logging)** vÃ  **Gia cá»‘ an ninh Ä‘a táº§ng (Security Hardening)**.

> [!WARNING]
> **THÃ”NG BÃO Vá»€ THÃ”NG TIN ÄÄ‚NG NHáº¬P VÃ€ Máº¬T KHáº¨U DEMO:**
> CÃ¡c tÃ i khoáº£n vÃ  máº­t kháº©u cung cáº¥p trong tÃ i liá»‡u nÃ y Ä‘Æ°á»£c cáº¥u hÃ¬nh riÃªng cho **má»¥c Ä‘Ã­ch kiá»ƒm thá»­ trong mÃ´i trÆ°á»ng há»c táº­p, cháº¥m Ä‘iá»ƒm vÃ  báº£o vá»‡ Ä‘á»“ Ã¡n táº¡i trÆ°á»ng**. TrÆ°á»›c khi triá»ƒn khai lÃªn mÃ´i trÆ°á»ng sáº£n xuáº¥t thá»±c táº¿ (Production), quáº£n trá»‹ viÃªn báº¯t buá»™c pháº£i thay Ä‘á»•i toÃ n bá»™ máº­t kháº©u, khÃ³a bÃ­ máº­t JWT vÃ  cáº¥p phÃ¡t chá»©ng chá»‰ sá»‘ SSL cÃ³ tháº©m quyá»n tá»« Let's Encrypt / DigiCert.

---

## ðŸŒ DANH Má»¤C Dá»ŠCH Vá»¤, Cá»”NG VÃ€ Äá»ŠA CHá»ˆ TRUY Cáº¬P

Há»‡ thá»‘ng Ä‘iá»u phá»‘i chÃ­nh xÃ¡c 13 container, cÃ¡c cá»•ng cÃ´ng khai Ä‘Æ°á»£c phÃ¢n bá»• khÃ´ng xung Ä‘á»™t vá»›i cÃ¡c á»©ng dá»¥ng mÃ¡y chá»§ khÃ¡c:

| ThÃ nh pháº§n Dá»‹ch vá»¥ | URL Truy cáº­p Thá»±c táº¿ | TÃ i khoáº£n / Máº­t kháº©u Lab | Vai trÃ² vÃ  TrÃ¡ch nhiá»‡m |
| :--- | :--- | :--- | :--- |
| **Website KhÃ¡ch HÃ ng (Nginx)** | [http://localhost:80](http://localhost:80) | KhÃ´ng yÃªu cáº§u | Xem phÃ²ng, Ä‘áº·t phÃ²ng trá»±c tuyáº¿n, tra cá»©u Ä‘Æ¡n |
| **Website Báº£o Máº­t (HTTPS)** | [https://localhost:443](https://localhost:443) | KhÃ´ng yÃªu cáº§u | Giao tiáº¿p mÃ£ hÃ³a TLS 1.2/1.3, HTTP/2, HSTS |
| **Trang Quáº£n Trá»‹ (Admin Tab)** | [http://localhost:80#admin](http://localhost:80#admin) | `admin` / `admin123`<br>`staff` / `staff123` | Quáº£n lÃ½ phÃ²ng, Ä‘Æ¡n Ä‘áº·t phÃ²ng, xem khÃ¡ch hÃ ng |
| **Backend API Healthcheck** | [http://localhost:80/health](http://localhost:80/health) | KhÃ´ng yÃªu cáº§u | BÃ¡o cÃ¡o sá»©c khá»e API, RAM, Uptime, DB latency |
| **Backend Metrics Endpoint** | [http://localhost:80/metrics](http://localhost:80/metrics) | KhÃ´ng yÃªu cáº§u | Chá»‰ sá»‘ nghiá»‡p vá»¥ tÆ°Æ¡ng thÃ­ch Prometheus |
| **Nginx Stub Status** | [http://localhost:8089/stub_status](http://localhost:8089/stub_status) | KhÃ´ng yÃªu cáº§u | Thá»‘ng kÃª káº¿t ná»‘i active/reading/writing Nginx |
| **pgAdmin 4 (Quáº£n trá»‹ CSDL)** | [http://localhost:8082](http://localhost:8082) | `admin@hotel.com`<br>`AdminSecure2026!` | Giao diá»‡n Ä‘á»“ há»a quáº£n trá»‹ CSDL PostgreSQL 16 |
| **Prometheus Server UI** | [http://localhost:9090](http://localhost:9090) | KhÃ´ng yÃªu cáº§u | CÃ o dá»¯ liá»‡u time-series, kiá»ƒm tra 6 Targets |
| **Grafana Dashboards** | [http://localhost:3001](http://localhost:3001) | `admin` / `admin` | Trá»±c quan hÃ³a 4 dashboards chuyÃªn sÃ¢u tá»± náº¡p |
| **Loki Log Server Ready** | [http://localhost:3101/ready](http://localhost:3101/ready) | KhÃ´ng yÃªu cáº§u | Kiá»ƒm tra tráº¡ng thÃ¡i sáºµn sÃ ng cá»§a Logging Engine |
| **cAdvisor Container Metrics** | [http://localhost:8085](http://localhost:8085) | KhÃ´ng yÃªu cáº§u | GiÃ¡m sÃ¡t CPU, RAM, Network I/O containers |
| **Node Exporter Host Metrics** | [http://localhost:9100/metrics](http://localhost:9100/metrics) | KhÃ´ng yÃªu cáº§u | Chá»‰ sá»‘ pháº§n cá»©ng mÃ¡y chá»§ váº­t lÃ½ |
| **Nginx Prometheus Exporter** | [http://localhost:9113/metrics](http://localhost:9113/metrics) | KhÃ´ng yÃªu cáº§u | Metrics káº¿t ná»‘i Nginx cho Prometheus cÃ o |
| **PostgreSQL Exporter** | [http://localhost:9187/metrics](http://localhost:9187/metrics) | KhÃ´ng yÃªu cáº§u | Metrics giao dá»‹ch CSDL cho Prometheus cÃ o |
| **CSDL PostgreSQL 16** | `localhost:5433` (ná»™i bá»™: 5432) | `hotel_admin`<br>`HotelSecurePassword2026!` | CSDL quan há»‡ chuáº©n 3NF, khÃ³a dÃ²ng an toÃ n |

---

## ðŸš€ HÆ¯á»šNG DáºªN 18 BÆ¯á»šC KHá»žI CHáº Y VÃ€ Váº¬N HÃ€NH Tá»ª Äáº¦U (WINDOWS + DOCKER DESKTOP)

### BÆ°á»›c 1: CÃ i Ä‘áº·t Docker Desktop vÃ  Git
1. Táº£i vÃ  cÃ i Ä‘áº·t **Docker Desktop for Windows** phiÃªn báº£n má»›i nháº¥t (há»— trá»£ WSL2 backend): [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
2. Táº£i vÃ  cÃ i Ä‘áº·t **Git for Windows**: [https://git-scm.com/download/win](https://git-scm.com/download/win).
3. Khá»Ÿi Ä‘á»™ng Docker Desktop vÃ  Ä‘áº£m báº£o biá»ƒu tÆ°á»£ng Docker á»Ÿ thanh taskbar hiá»ƒn thá»‹ mÃ u xanh lÃ¡ cÃ¢y (**Engine running**).

### BÆ°á»›c 2: Clone repository vá» mÃ¡y tÃ­nh
Má»Ÿ terminal **Windows PowerShell** hoáº·c **Git Bash** vÃ  thá»±c thi:
```powershell
git clone https://github.com/dtc245200054-debug/kthp-de6-hotel-booking.git
cd kthp-de6-hotel-booking
```

### BÆ°á»›c 3: Táº¡o tá»‡p cáº¥u hÃ¬nh biáº¿n mÃ´i trÆ°á»ng `.env` tá»« `.env.example`
```powershell
Copy-Item .env.example .env
```
*(Náº¿u trÃªn Linux/Bash: `cp .env.example .env`)*

### BÆ°á»›c 4: Thiáº¿t láº­p cÃ¡c máº­t kháº©u an toÃ n trong tá»‡p `.env`
Má»Ÿ tá»‡p `.env` báº±ng Notepad hoáº·c VS Code Ä‘á»ƒ kiá»ƒm tra/chá»‰nh sá»­a cÃ¡c tham sá»‘ an toÃ n:
```env
# Cáº¥u hÃ¬nh CSDL PostgreSQL
POSTGRES_DB=hotel_booking_db
POSTGRES_USER=hotel_admin
POSTGRES_PASSWORD=HotelSecurePassword2026!
POSTGRES_PORT=5433

# Cáº¥u hÃ¬nh Cá»•ng Dá»‹ch vá»¥
HTTP_PORT=80
HTTPS_PORT=443
GRAFANA_PORT=3001
PGADMIN_PORT=8082
LOKI_PORT=3101

# KhÃ³a bÃ­ máº­t JWT
JWT_SECRET=super_secret_hotel_jwt_key_2026_dtc245200054
```

### BÆ°á»›c 5: Khá»Ÿi táº¡o vÃ  cháº¡y há»‡ thá»‘ng báº±ng Docker Compose
BiÃªn dá»‹ch image vÃ  khá»Ÿi cháº¡y toÃ n bá»™ cá»¥m 13 container trong ná»n:
```powershell
docker compose up -d --build
```

### BÆ°á»›c 6: Chá» cÆ¡ cháº¿ Healthcheck hoÃ n táº¥t kiá»ƒm tra sá»©c khá»e
Kiá»ƒm tra tráº¡ng thÃ¡i container cho tá»›i khi táº¥t cáº£ cÃ¡c dá»‹ch vá»¥ Ä‘á»u chuyá»ƒn sang tráº¡ng thÃ¡i `healthy`:
```powershell
docker compose ps
```
*(CÆ¡ cháº¿ `depends_on: { condition: service_healthy }` Ä‘áº£m báº£o CSDL sáºµn sÃ ng trÆ°á»›c khi Backend khá»Ÿi Ä‘á»™ng, vÃ  Backend sáºµn sÃ ng trÆ°á»›c khi Nginx Reverse Proxy tiáº¿p nháº­n traffic).*

### BÆ°á»›c 7: Truy cáº­p Website chÃ­nh
Má»Ÿ trÃ¬nh duyá»‡t truy cáº­p: **[http://localhost/](http://localhost/)**
* Giao diá»‡n Website khÃ¡ch sáº¡n 5 sao Aurora Grand Resort & Spa hiá»ƒn thá»‹ sang trá»ng vá»›i thanh Ä‘iá»u hÆ°á»›ng, banner chÃ o má»«ng vÃ  danh má»¥c cÃ¡c háº¡ng phÃ²ng.

### BÆ°á»›c 8: Thá»­ tÃ¬m phÃ²ng vÃ  Ä‘áº·t phÃ²ng trá»±c tuyáº¿n
1. TrÃªn giao diá»‡n trang chá»§, duyá»‡t danh má»¥c phÃ²ng hoáº·c sá»­ dá»¥ng bá»™ lá»c tÃ¬m kiáº¿m.
2. Báº¥m vÃ o nÃºt **Äáº·t phÃ²ng ngay** táº¡i phÃ²ng 102 (Deluxe King Room).
3. Nháº­p thÃ´ng tin khÃ¡ch hÃ ng:
   * Há» tÃªn: `Tráº§n PhÆ°Æ¡ng Nam`
   * Email: `nam.tp@ictu.edu.vn`
   * Sá»‘ Ä‘iá»‡n thoáº¡i: `0988112233`
   * Sá»‘ CCCD: `019200054321`
   * Chá»n ngÃ y nháº­n phÃ²ng vÃ  ngÃ y tráº£ phÃ²ng trong tÆ°Æ¡ng lai.
4. Báº¥m **XÃ¡c nháº­n Ä‘áº·t phÃ²ng**: Há»‡ thá»‘ng tÃ­nh toÃ¡n tá»•ng tiá»n táº¡i Backend, lÆ°u thÃ´ng tin vÃ o CSDL PostgreSQL vÃ  sinh mÃ£ Ä‘áº·t phÃ²ng duy nháº¥t dáº¡ng `BK-XXXXXX`.
5. **Kiá»ƒm tra chá»‘ng Ä‘áº·t trÃ¹ng phÃ²ng (Double-Booking Prevention):** Thá»±c hiá»‡n Ä‘áº·t láº¡i Ä‘Ãºng cÄƒn phÃ²ng 102 trong cÃ¹ng khoáº£ng ngÃ y. Há»‡ thá»‘ng láº­p tá»©c tráº£ vá» thÃ´ng bÃ¡o lá»—i `409 Conflict: PhÃ²ng Ä‘Ã£ cÃ³ khÃ¡ch Ä‘áº·t`.

### BÆ°á»›c 9: Tra cá»©u Ä‘Æ¡n Ä‘áº·t phÃ²ng vÃ  Ä‘Äƒng nháº­p trang Quáº£n trá»‹
* **Tra cá»©u khÃ¡ch hÃ ng:** VÃ o má»¥c [http://localhost/#lookup](http://localhost/#lookup), nháº­p MÃ£ Ä‘áº·t phÃ²ng vÃ  Email. Há»‡ thá»‘ng yÃªu cáº§u khá»›p cáº£ hai thÃ´ng tin má»›i hiá»ƒn thá»‹ chi tiáº¿t (báº£o vá»‡ quyá»n riÃªng tÆ°).
* **ÄÄƒng nháº­p Quáº£n trá»‹:** Báº¥m vÃ o tab **Quáº£n trá»‹** trÃªn thanh menu (hoáº·c [http://localhost/#admin](http://localhost/#admin)):
  * TÃ i khoáº£n demo: `admin`
  * Máº­t kháº©u demo: `admin123`
  * Kiá»ƒm tra chá»©c nÄƒng: Quáº£n lÃ½ danh má»¥c phÃ²ng, xem há»“ sÆ¡ khÃ¡ch lÆ°u trÃº (`customers`), cáº­p nháº­t tráº¡ng thÃ¡i Ä‘Æ¡n Ä‘áº·t phÃ²ng.

### BÆ°á»›c 10: Má»Ÿ pgAdmin 4 vÃ  kiá»ƒm tra cÆ¡ sá»Ÿ dá»¯ liá»‡u
1. Truy cáº­p: **[http://localhost:8082](http://localhost:8082)**
2. ÄÄƒng nháº­p vá»›i:
   * Email: `admin@hotel.com`
   * Máº­t kháº©u: `AdminSecure2026!`
3. CSDL Ä‘Ã£ Ä‘Æ°á»£c náº¡p sáºµn qua `pgadmin/servers.json`. Nháº¥p vÃ o `Hotel Booking Cluster` $\rightarrow$ `hotel_booking_db` $\rightarrow$ `Schemas` $\rightarrow$ `public` $\rightarrow$ `Tables`.
4. Xem dá»¯ liá»‡u trong cÃ¡c báº£ng: `rooms`, `customers`, `bookings`, `booking_status_history`.

### BÆ°á»›c 11: Má»Ÿ Prometheus Server vÃ  kiá»ƒm tra 6 Targets
1. Truy cáº­p: **[http://localhost:9090/targets](http://localhost:9090/targets)**
2. Äáº£m báº£o táº¥t cáº£ 6 Scrape Targets (`prometheus`, `hotel-backend`, `postgres-exporter`, `nginx-exporter`, `cadvisor`, `node-exporter`) Ä‘á»u hiá»ƒn thá»‹ tráº¡ng thÃ¡i mÃ u xanh lÃ¡ cÃ¢y **`UP (1/1)`**.
3. VÃ o tab **Graph** ([http://localhost:9090/graph](http://localhost:9090/graph)), nháº­p thá»­ biá»ƒu thá»©c PromQL:
   ```promql
   hotel_bookings_total
   ```
   Báº¥m Execute Ä‘á»ƒ xem tá»•ng sá»‘ lÆ°á»£t Ä‘áº·t phÃ²ng Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n.

### BÆ°á»›c 12: Má»Ÿ Grafana, Ä‘Äƒng nháº­p vÃ  xem 4 Dashboards
1. Truy cáº­p: **[http://localhost:3001](http://localhost:3001)**
2. ÄÄƒng nháº­p vá»›i tÃ i khoáº£n: `admin` / `admin`
3. Äiá»u hÆ°á»›ng vÃ o menu **Dashboards**, kiá»ƒm tra 4 Dashboards Ä‘Ã£ Ä‘Æ°á»£c náº¡p sáºµn:
   * **Hotel System Overview:** Tá»•ng quan 6 targets, doanh thu VNÄ, phÃ²ng trá»‘ng, request rate.
   * **PostgreSQL Performance:** Hiá»‡u nÄƒng DB, Cache hit ratio (> 98%), Active connections.
   * **Nginx Metrics:** LÆ°u lÆ°á»£ng káº¿t ná»‘i active, writing, reading qua Proxy.
   * **cAdvisor Containers:** Chiáº¿m dá»¥ng CPU, RAM cá»§a tá»«ng container.

### BÆ°á»›c 13: Táº¡o má»™t sá»‘ request Ä‘á»ƒ phÃ¡t sinh log
Má»Ÿ PowerShell vÃ  cháº¡y Ä‘oáº¡n lá»‡nh sau Ä‘á»ƒ táº¡o lÆ°u lÆ°á»£ng truy cáº­p:
```powershell
# Táº¡o 20 request thÃ nh cÃ´ng (200 OK)
1..20 | ForEach-Object { curl.exe -s -o $null http://localhost/api/rooms }

# Táº¡o request gá»i route khÃ´ng tá»“n táº¡i (404 Not Found)
curl.exe -s http://localhost/api/khong-ton-tai

# Táº¡o request vi pháº¡m phÆ°Æ¡ng thá»©c Nginx (403 Forbidden)
curl.exe -s -X POST http://localhost/
```

### BÆ°á»›c 14: Má»Ÿ Grafana Explore, chá»n Loki vÃ  cháº¡y 4 truy váº¥n LogQL
1. Truy cáº­p: **[http://localhost:3001/explore](http://localhost:3001/explore)**
2. Táº¡i má»¥c Data source gÃ³c trÃªn bÃªn trÃ¡i, chá»n **Loki**.
3. Cháº¡y láº§n lÆ°á»£t 4 cÃ¢u truy váº¥n LogQL thá»±c táº¿:
   * **Xem Access log Nginx:** `{job="nginx"}`
   * **TÃ¬m lá»—i mÃ¡y chá»§ 5xx:** `{job="nginx"} | status >= 500`
   * **TÃ¬m lá»—i Backend Node.js:** `{job="backend"} |= "error"`
   * **Äáº¿m táº§n suáº¥t log trong 5 phÃºt:** `sum(count_over_time({job="nginx"}[5m]))`

### BÆ°á»›c 15: Kiá»ƒm tra HTTPS cá»•ng 443 vÃ  Security Headers
Cháº¡y lá»‡nh kiá»ƒm tra káº¿t ná»‘i mÃ£ hÃ³a TLS vÃ  cÃ¡c tiÃªu Ä‘á» báº£o máº­t:
```powershell
curl.exe -k -I https://localhost/
```
* Báº±ng chá»©ng hiá»ƒn thá»‹: Tráº£ vá» `HTTP/2 200`, `Server: nginx` (áº©n phiÃªn báº£n), Ä‘á»§ 5 Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`).

### BÆ°á»›c 16: Kiá»ƒm tra cÃ¡c biá»‡n phÃ¡p Hardening báº£o máº­t
Cháº¡y cÃ¡c lá»‡nh kiá»ƒm tra an ninh há»‡ thá»‘ng:
```powershell
# 1. Kiá»ƒm tra Non-Root user trong container:
docker exec hotel_backend whoami
# Káº¿t quáº£: node (UID 1000)

# 2. Kiá»ƒm tra CÃ´ láº­p cá»•ng CSDL:
docker port hotel_postgres
# Káº¿t quáº£: Cá»•ng 5432 khÃ´ng bá»‹ Ã¡nh xáº¡ trá»±c tiáº¿p ra ngoÃ i Internet

# 3. Kiá»ƒm tra Chá»‘ng nÃ¢ng quyá»n:
docker inspect hotel_backend --format "{{.HostConfig.SecurityOpt}}"
# Káº¿t quáº£: [no-new-privileges:true]
```

### BÆ°á»›c 17: Dá»«ng há»‡ thá»‘ng an toÃ n mÃ  KHÃ”NG máº¥t dá»¯ liá»‡u
Khi káº¿t thÃºc phiÃªn lÃ m viá»‡c, cháº¡y lá»‡nh:
```powershell
docker compose down
```
> [!IMPORTANT]
> Lá»‡nh `docker compose down` dá»«ng vÃ  gá»¡ bá» cÃ¡c container nhÆ°ng **Báº¢O LÆ¯U NGUYÃŠN Váº¸N toÃ n bá»™ 7 Named Volumes** (`postgres_data`, `pgadmin_data`, `prometheus_data`, `grafana_data`, `loki_data`, `nginx_logs`, `backend_logs`). ToÃ n bá»™ dá»¯ liá»‡u Ä‘áº·t phÃ²ng vÃ  tÃ i khoáº£n khÃ´ng bá»‹ máº¥t. Tuyá»‡t Ä‘á»‘i khÃ´ng dÃ¹ng cá» `-v` náº¿u khÃ´ng cÃ³ nhu cáº§u xÃ³a tráº¯ng há»‡ thá»‘ng.

### BÆ°á»›c 18: CÃ¡ch kháº¯c phá»¥c cÃ¡c lá»—i thÆ°á»ng gáº·p (Troubleshooting Matrix)
| Hiá»‡n tÆ°á»£ng lá»—i | NguyÃªn nhÃ¢n | CÃ¡ch xá»­ lÃ½ nhanh |
| :--- | :--- | :--- |
| **`Port 80/443 is already allocated`** | Dá»‹ch vá»¥ IIS, Skype hoáº·c web server khÃ¡c Ä‘ang chiáº¿m cá»•ng | Kiá»ƒm tra `netstat -ano \| findstr :80`, táº¯t tiáº¿n trÃ¬nh chiáº¿m cá»•ng hoáº·c Ä‘á»•i `HTTP_PORT=8088` trong `.env`. |
| **TrÃ¬nh duyá»‡t bÃ¡o cáº£nh bÃ¡o SSL Ä‘á»** | Chá»©ng chá»‰ sá»‘ lÃ  dáº¡ng tá»± kÃ½ (Self-signed) cho mÃ´i trÆ°á»ng lab | Nháº¥n **NÃ¢ng cao (Advanced)** $\rightarrow$ **Tiáº¿p tá»¥c truy cáº­p localhost** (hoáº·c gÃµ `thisisunsafe`). |
| **Backend bÃ¡o lá»—i káº¿t ná»‘i CSDL** | CSDL PostgreSQL Ä‘ang trong giai Ä‘oáº¡n cháº¡y script khá»Ÿi táº¡o | Chá» 10-15 giÃ¢y Ä‘á»ƒ container PostgreSQL chuyá»ƒn sang tráº¡ng thÃ¡i `healthy`, Backend sáº½ tá»± Ä‘á»™ng káº¿t ná»‘i láº¡i. |
| **Grafana chÆ°a tháº¥y log trong Explore** | ChÆ°a phÃ¡t sinh lÆ°u lÆ°á»£ng truy cáº­p | Cháº¡y script kiá»ƒm thá»­: `powershell -ExecutionPolicy Bypass -File .\scripts\test-system.ps1` Ä‘á»ƒ tá»± Ä‘á»™ng táº¡o log. |

---

## ðŸ§ª CHáº Y Bá»˜ KIá»‚M THá»¬ Tá»° Äá»˜NG TOÃ€N DIá»†N (24 TEST CASES)

Há»‡ thá»‘ng tÃ­ch há»£p sáºµn ká»‹ch báº£n kiá»ƒm thá»­ tá»± Ä‘á»™ng toÃ n diá»‡n kiá»ƒm tra má»i tiÃªu chÃ­ nghiá»‡p vá»¥ vÃ  an ninh:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test-system.ps1
```
*(Ká»³ vá»ng: **24 PASS, 0 FAIL** - Äáº¡t 100% tá»· lá»‡ thÃ nh cÃ´ng).*

---

## ðŸ“¦ Káº¾ HOáº CH 3 COMMIT Báº®T BUá»˜C TRÃŠN GITHUB

NhÃ¡nh `main` cá»§a dá»± Ã¡n Ä‘Æ°á»£c tá»• chá»©c vá»›i Ä‘Ãºng 3 commit chÃ­nh thá»©c:
* **Commit 1 (`a0326b1`):** `feat: deploy hotel booking with nginx reverse proxy`
* **Commit 2 (`7b4e150`):** `feat: add prometheus grafana monitoring`
* **Commit 3 (`57f9673`):** `feat: add loki logging and security hardening`

### HÆ°á»›ng dáº«n Ä‘áº©y lÃªn GitHub cÃ¡ nhÃ¢n mang MSSV:
```powershell
git remote add origin https://github.com/dtc245200054-debug/kthp-de6-hotel-booking.git
git branch -M main
git push -u origin main
```

---

## ðŸ“„ TÃ€I LIá»†U VÃ€ BÃO CÃO ÄÃNH KÃˆM

1. **BÃ¡o cÃ¡o Word chÃ­nh thá»©c chuáº©n Äáº¡i há»c ICTU ($\ge$ 23 trang):** [`BAO_CAO_KTHP_DE6_KHACH_SAN.docx`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/BAO_CAO_KTHP_DE6_KHACH_SAN.docx)
2. **Ká»‹ch báº£n TrÃ¬nh diá»…n & Báº±ng chá»©ng Báº£o vá»‡ (Demo Checklist):** [`docs/demo-checklist.md`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docs/demo-checklist.md)
3. **Äáº·c táº£ Gia cá»‘ Báº£o máº­t (Security Hardening):** [`docs/security-hardening.md`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docs/security-hardening.md)
4. **Báº£n Markdown cá»§a BÃ¡o cÃ¡o KTHP:** [`docs/bao-cao.md`](file:///c:/Users/NAM/Documents/h%E1%BB%87%20th%E1%BB%91ng%20%C4%91%E1%BA%B7t%20ph%C3%B2ng%20kh%C3%A1ch%20s%E1%BA%A1n-kthp/docs/bao-cao.md)

