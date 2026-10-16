# ==============================================================================
# PHỤC HỒI CƠ SỞ DỮ LIỆU POSTGRESQL (RESTORE SCRIPT)
# Học phần: Triển khai và Quản trị Hệ thống Phần mềm
# ==============================================================================

param (
    [string]$File
)

if (-not $File) {
    $BackupDir = Join-Path $PSScriptRoot "..\backups"
    $Latest = Get-ChildItem -Path $BackupDir -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($Latest) {
        $File = $Latest.FullName
    } else {
        Write-Host "Không tìm thấy file backup nào trong thư mục backups!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Đang phục hồi CSDL từ file: $File ..." -ForegroundColor Cyan

Get-Content $File | docker exec -i hotel_postgres psql -U hotel_admin -d hotel_booking_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "Phục hồi cơ sở dữ liệu thành công!" -ForegroundColor Green
} else {
    Write-Host "Lỗi phục hồi cơ sở dữ liệu!" -ForegroundColor Red
}
