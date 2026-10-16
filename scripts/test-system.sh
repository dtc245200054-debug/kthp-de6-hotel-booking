#!/bin/bash
# ==============================================================================
# HOTEL BOOKING SYSTEM - END-TO-END AUTOMATED TEST SUITE (BASH)
# Học phần: Triển khai và Quản trị Hệ thống Phần mềm (Đề 6)
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN}  BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN${NC}"
echo -e "${CYAN}==================================================================${NC}"

TOTAL=0
PASSED=0
FAILED=0

assert_endpoint() {
    local name="$1"
    local url="$2"
    local expected="$3"
    local method="${4:-GET}"
    local body="${5:-}"
    local header="${6:-}"
    
    TOTAL=$((TOTAL+1))
    echo -n "[TEST $TOTAL] $name ($url)... "
    
    if [ "$method" = "POST" ]; then
        if [ -n "$header" ]; then
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -H "$header" -d "$body" "$url" || echo "000")
        else
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$body" "$url" || echo "000")
        fi
    else
        if [ -n "$header" ]; then
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "$header" "$url" || echo "000")
        else
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        fi
    fi

    if [ "$STATUS" -eq "$expected" ]; then
        echo -e "${GREEN}PASS ($STATUS)${NC}"
        PASSED=$((PASSED+1))
    else
        echo -e "${RED}FAIL (Nhận $STATUS, Kỳ vọng $expected)${NC}"
        FAILED=$((FAILED+1))
    fi
}

echo -e "\n${YELLOW}--- GIAI ĐOẠN 1: KIỂM TRA DỊCH VỤ WEB & PROXY ---${NC}"
assert_endpoint "Nginx Reverse Proxy & Frontend Web" "http://localhost:80/" 200
assert_endpoint "Backend API Health Endpoint" "http://localhost:80/health" 200
assert_endpoint "Backend Prometheus Metrics" "http://localhost:80/metrics" 200
assert_endpoint "Nginx Stub Status Metrics" "http://localhost:8089/stub_status" 200
assert_endpoint "Chặn phương thức POST trái phép vào Frontend (Kỳ vọng 405)" "http://localhost:80/" 405 "POST" "{}"

echo -e "\n${YELLOW}--- GIAI ĐOẠN 2: XÁC THỰC VÀ PHÂN QUYỀN (AUTH & RBAC) ---${NC}"
LOGIN_RES=$(curl -s -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' "http://localhost:80/api/auth/login")
assert_endpoint "Đăng Nhập Quản Trị" "http://localhost:80/api/auth/login" 200 "POST" '{"username":"admin","password":"admin123"}'

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
assert_endpoint "Chặn truy cập trái phép API quản trị (Kỳ vọng 401)" "http://localhost:80/api/admin/customers" 401

if [ -n "$TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $TOKEN"
    assert_endpoint "Truy cập API Khách hàng với Token Admin" "http://localhost:80/api/admin/customers" 200 "GET" "" "$AUTH_HEADER"
    assert_endpoint "Truy cập API Thống kê Dashboard với Token Admin" "http://localhost:80/api/dashboard/stats" 200 "GET" "" "$AUTH_HEADER"
fi

echo -e "\n${YELLOW}--- GIAI ĐOẠN 3: NGHIỆP VỤ & CHỐNG ĐẶT TRÙNG PHÒNG ---${NC}"
assert_endpoint "API Lấy Danh Sách Phòng" "http://localhost:80/api/rooms" 200
assert_endpoint "API Lấy Hạng Phòng" "http://localhost:80/api/rooms/types" 200

FUTURE_IN=$(date -d "+45 days" +%Y-%m-%d 2>/dev/null || date -v+45d +%Y-%m-%d)
FUTURE_OUT=$(date -d "+48 days" +%Y-%m-%d 2>/dev/null || date -v+48d +%Y-%m-%d)
PAYLOAD="{\"room_id\":3,\"customer_name\":\"Test Linux Security\",\"customer_email\":\"linux.test@hotel.com\",\"customer_phone\":\"0933221100\",\"check_in_date\":\"$FUTURE_IN\",\"check_out_date\":\"$FUTURE_OUT\",\"num_guests\":2}"

BOOK_RES=$(curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "http://localhost:80/api/bookings")
assert_endpoint "Tạo Đơn Đặt Phòng Mới" "http://localhost:80/api/bookings" 201 "POST" "$PAYLOAD"
assert_endpoint "Ngăn Đặt Trùng Phòng (Double-Booking 409)" "http://localhost:80/api/bookings" 409 "POST" "$PAYLOAD"

BK_CODE=$(echo "$BOOK_RES" | grep -o '"booking_code":"[^"]*' | cut -d'"' -f4)
if [ -n "$BK_CODE" ]; then
    assert_endpoint "Tra cứu đúng Mã VÀ Email" "http://localhost:80/api/bookings/lookup?code=$BK_CODE&email=linux.test@hotel.com" 200
    assert_endpoint "Chặn tra cứu sai Email (Kỳ vọng 404)" "http://localhost:80/api/bookings/lookup?code=$BK_CODE&email=fake@hotel.com" 404
fi

echo -e "\n${YELLOW}--- GIAI ĐOẠN 4: HỆ THỐNG GIÁM SÁT & EXPORTERS ---${NC}"
assert_endpoint "Prometheus UI" "http://localhost:9090" 200
assert_endpoint "Grafana Dashboard" "http://localhost:3001" 200
assert_endpoint "Loki Ready" "http://localhost:3101/ready" 200
assert_endpoint "pgAdmin" "http://localhost:8082" 200
assert_endpoint "Node Exporter" "http://localhost:9100/metrics" 200
assert_endpoint "Postgres Exporter" "http://localhost:9187/metrics" 200
assert_endpoint "Nginx Exporter" "http://localhost:9113/metrics" 200
assert_endpoint "cAdvisor" "http://localhost:8085/metrics" 200

echo -e "\n${CYAN}==================================================================${NC}"
echo -e "Tổng số tests: $TOTAL | ${GREEN}PASS: $PASSED${NC} | ${RED}FAIL: $FAILED${NC}"
echo -e "${CYAN}==================================================================${NC}"
