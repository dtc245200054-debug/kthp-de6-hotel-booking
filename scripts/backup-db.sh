#!/bin/bash
# ==============================================================================
# SAO LƯU CƠ SỞ DỮ LIỆU POSTGRESQL (BACKUP SCRIPT - BASH)
# ==============================================================================

BACKUP_DIR="$(dirname "$0")/../backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/hotel_db_backup_$TIMESTAMP.sql"

echo "Đang sao lưu CSDL từ container hotel_postgres..."
docker exec -t hotel_postgres pg_dump -U hotel_admin -d hotel_booking_db --clean --if-exists > "$BACKUP_FILE"

if [ -s "$BACKUP_FILE" ]; then
    echo "Sao lưu thành công: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
else
    echo "Lỗi sao lưu cơ sở dữ liệu!"
    exit 1
fi
