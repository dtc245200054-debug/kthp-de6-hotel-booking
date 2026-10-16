# ==============================================================================
# HOTEL BOOKING SYSTEM - END-TO-END AUTOMATED TEST SUITE (POWERSHELL)
# Học phần: Triển khai và Quản trị Hệ thống Phần mềm (Đề 6)
# Sinh viên: Trần Phương Nam - MSSV: DTC245200054 - Lớp: CNTT-K23A
# ==============================================================================

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN HỆ THỐNG ĐẶT PHÒNG KHÁCH SẠN" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Assert-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [string]$Method = "GET",
        [string]$Body = $null,
        [hashtable]$Headers = @{}
    )

    $global:TotalTests++
    Write-Host -NoNewline "[TEST $global:TotalTests] $Name ($Url)... "

    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 10
            UseBasicParsing = $true
            Headers = $Headers
        }
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json; charset=utf-8"
        }

        $response = Invoke-WebRequest @params
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "PASS ($($response.StatusCode))" -ForegroundColor Green
            $global:PassedTests++
            return $response
        } else {
            Write-Host "FAIL (Nhận $($response.StatusCode), Mong đợi $ExpectedStatus)" -ForegroundColor Red
            $global:FailedTests++
            return $null
        }
    } catch {
        $resp = $_.Exception.Response
        $code = 0
        if ($resp) {
            $code = [int]$resp.StatusCode
        }
        if ($code -eq $ExpectedStatus) {
            Write-Host "PASS (Bắt đúng mã trạng thái kỳ vọng: $ExpectedStatus)" -ForegroundColor Green
            $global:PassedTests++
            return $resp
        } else {
            Write-Host "FAIL (Nhận $code, Mong đợi $ExpectedStatus - $($_.Exception.Message))" -ForegroundColor Red
            $global:FailedTests++
            return $null
        }
    }
}

Write-Host "`n--- GIAI ĐOẠN 1: KIỂM TRA TÍNH KHẢ DỤNG CÁC DỊCH VỤ WEB & REVERSE PROXY ---" -ForegroundColor Yellow
$null = Assert-Endpoint "Nginx Reverse Proxy & Frontend Web" "http://localhost:80/" 200
$null = Assert-Endpoint "Backend API Health Endpoint" "http://localhost:80/health" 200
$null = Assert-Endpoint "Backend Prometheus Metrics" "http://localhost:80/metrics" 200
$null = Assert-Endpoint "Nginx Stub Status Metrics" "http://localhost:8089/stub_status" 200
$null = Assert-Endpoint "Chặn POST vào trang tĩnh Frontend (Kỳ vọng 403 Forbidden)" "http://localhost:80/" 403 "POST" "{}"

Write-Host "`n--- GIAI ĐOẠN 2: KIỂM THỬ XÁC THỰC VÀ PHÂN QUYỀN BẢO MẬT (AUTH & RBAC) ---" -ForegroundColor Yellow
$loginPayload = '{"username":"admin","password":"admin123"}'
$loginResp = Assert-Endpoint "Đăng Nhập Quản Trị (Bcrypt + JWT)" "http://localhost:80/api/auth/login" 200 "POST" $loginPayload

$jwtToken = ""
if ($loginResp -and $loginResp.Content) {
    try {
        $jsonObj = $loginResp.Content | ConvertFrom-Json
        $jwtToken = $jsonObj.data.token
    } catch {}
}

# Kiểm tra phân quyền: Không có Token phải bị chặn (401)
$null = Assert-Endpoint "Chặn truy cập trái phép API quản trị (Kỳ vọng 401)" "http://localhost:80/api/admin/customers" 401

# Có Token: Truy cập thành công
if ($jwtToken) {
    $authHeaders = @{ "Authorization" = "Bearer $jwtToken" }
    $null = Assert-Endpoint "Truy cập API Khách hàng với Token Admin" "http://localhost:80/api/admin/customers" 200 "GET" $null $authHeaders
    $null = Assert-Endpoint "Truy cập API Thống kê Dashboard với Token Admin" "http://localhost:80/api/dashboard/stats" 200 "GET" $null $authHeaders
}

Write-Host "`n--- GIAI ĐOẠN 3: KIỂM THỬ TÍNH NĂNG NGHIỆP VỤ & CHỐNG ĐẶT TRÙNG PHÒNG ---" -ForegroundColor Yellow
$null = Assert-Endpoint "API Lấy Danh Sách Phòng" "http://localhost:80/api/rooms" 200
$null = Assert-Endpoint "API Lấy Hạng Phòng" "http://localhost:80/api/rooms/types" 200

$rnd = Get-Random -Minimum 1000 -Maximum 99999
$futureCheckIn = (Get-Date).AddDays(100 + ($rnd % 500)).ToString("yyyy-MM-dd")
$futureCheckOut = (Get-Date).AddDays(100 + ($rnd % 500) + 3).ToString("yyyy-MM-dd")
$testEmail = "security.$rnd@hotel.com"

$testBookingPayload = @"
{
    "room_id": 2,
    "customer_name": "Kiểm Thử An Toàn",
    "customer_email": "$testEmail",
    "customer_phone": "0988$rnd",
    "id_card": "048099001122",
    "check_in_date": "$futureCheckIn",
    "check_out_date": "$futureCheckOut",
    "num_guests": 2,
    "special_requests": "Kiểm tra tính an toàn giao dịch"
}
"@

$bookingResp = Assert-Endpoint "Tạo Đơn Đặt Phòng Mới (POST /api/bookings)" "http://localhost:80/api/bookings" 201 "POST" $testBookingPayload

# Kiểm tra ngăn chặn đặt trùng phòng (Double-Booking Prevention)
$null = Assert-Endpoint "Ngăn Đặt Trùng Phòng Cùng Thời Điểm (Kỳ vọng 409 Conflict)" "http://localhost:80/api/bookings" 409 "POST" $testBookingPayload

# Kiểm tra logic tra cứu an toàn: Phải có cả Mã BK VÀ Email
$createdCode = ""
if ($bookingResp -and $bookingResp.Content) {
    try {
        $bObj = $bookingResp.Content | ConvertFrom-Json
        $createdCode = $bObj.data.booking_code
    } catch {}
}

if ($createdCode) {
    $null = Assert-Endpoint "Tra cứu đúng Mã VÀ đúng Email" "http://localhost:80/api/bookings/lookup?code=$createdCode&email=$testEmail" 200
    $null = Assert-Endpoint "Chặn tra cứu khi sai Email (Kỳ vọng 404)" "http://localhost:80/api/bookings/lookup?code=$createdCode&email=wrong@email.com" 404
}

Write-Host "`n--- GIAI ĐOẠN 4: KIỂM TRA HỆ THỐNG GIÁM SÁT & EXPORTERS ---" -ForegroundColor Yellow
$null = Assert-Endpoint "Prometheus Server UI" "http://localhost:9090" 200
$null = Assert-Endpoint "Prometheus Targets API" "http://localhost:9090/api/v1/targets" 200
$null = Assert-Endpoint "Grafana Trực Quan Hóa" "http://localhost:3001" 200
$null = Assert-Endpoint "Loki Log Server Status" "http://localhost:3101/ready" 200
$null = Assert-Endpoint "pgAdmin Quản Trị CSDL" "http://localhost:8082" 200
$null = Assert-Endpoint "Node Exporter Host Metrics" "http://localhost:9100/metrics" 200
$null = Assert-Endpoint "Postgres Exporter DB Metrics" "http://localhost:9187/metrics" 200
$null = Assert-Endpoint "Nginx Prometheus Exporter" "http://localhost:9113/metrics" 200
$null = Assert-Endpoint "cAdvisor Container Metrics" "http://localhost:8085/metrics" 200

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "                     KẾT QUẢ KIỂM THỬ TỰ ĐỘNG" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Tổng số bài kiểm tra: $TotalTests" -ForegroundColor White
Write-Host "Thành công (PASS)   : $PassedTests" -ForegroundColor Green
$statusColor = if ($FailedTests -eq 0) { "Green" } else { "Red" }
Write-Host "Thất bại   (FAIL)   : $FailedTests" -ForegroundColor $statusColor

if ($FailedTests -eq 0) {
    Write-Host "`n>>> TẤT CẢ CÁC TIÊU CHÍ BẢO MẬT VÀ NGHIỆP VỤ HOẠT ĐỘNG HOÀN HẢO! <<<" -ForegroundColor Green
} else {
    Write-Host "`n>>> VUI LÒNG KIỂM TRA LẠI CÁC MỤC BÁO LỖI Ở TRÊN! <<<" -ForegroundColor Red
}
