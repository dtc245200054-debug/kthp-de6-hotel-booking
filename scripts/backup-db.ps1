# ==============================================================================
# SAO LƯU CƠ SỞ DỮ LIỆU POSTGRESQL (BACKUP SCRIPT)
# Học phần: Triển khai và Quản trị Hệ thống Phần mềm
# ==============================================================================

$BackupDir = Join-Path $PSScriptRoot "..\backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$BackupFile = Join-Path $BackupDir "hotel_db_backup_$Timestamp.sql"

Write-Host "Đang sao lưu CSDL khách sạn từ container hotel_postgres..." -ForegroundColor Cyan

docker exec -t hotel_postgres pg_dump -U hotel_admin -d hotel_booking_db --clean --if-exists > $BackupFile

if ($LASTEXITCODE -eq 0 -and (Test-Path $BackupFile)) {
    $Size = (Get-Item $BackupFile).Length / 1KB
    Write-Host "Sao lưu thành công! File lưu tại: $BackupFile ($([math]::Round($Size, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "Lỗi sao lưu cơ sở dữ liệu! Vui lòng kiểm tra container hotel_postgres." -ForegroundColor Red
}
