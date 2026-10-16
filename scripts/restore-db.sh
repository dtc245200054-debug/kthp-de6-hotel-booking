#!/bin/bash
# ==============================================================================
# PHỤC HỒI CƠ SỞ DỮ LIỆU POSTGRESQL (RESTORE SCRIPT - BASH)
# ==============================================================================

FILE="$1"
BACKUP_DIR="$(dirname "$0")/../backups"

if [ -z "$FILE" ]; then
    FILE=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -n 1)
    if [ -z "$FILE" ]; then
        echo "Không tìm thấy file backup nào trong $BACKUP_DIR!"
        exit 1
    fi
fi

echo "Đang phục hồi CSDL từ file: $FILE ..."
cat "$FILE" | docker exec -i hotel_postgres psql -U hotel_admin -d hotel_booking_db

echo "Phục hồi cơ sở dữ liệu thành công!"
