#!/bin/bash

# ==============================================================================
# SCRIPT SAO LƯU TỰ ĐỘNG CƠ SỞ DỮ LIỆU POSTGRESQL (DOCKER)
# ==============================================================================

# 1. Cấu hình các thông số
BACKUP_DIR="/var/www/agriai/backups"  # Thư mục lưu trữ backup trên VPS
DB_CONTAINER_NAME="agriai-db"         # Tên container PostgreSQL
DB_USER="postgres"                    # POSTGRES_USER từ file .env
DB_NAME="AgriAI_db"                   # POSTGRES_DB từ file .env
KEEP_DAYS=7                           # Số ngày giữ lại file backup (ví dụ: 7 ngày)

# 2. Khởi tạo các biến thời gian và file
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Tạo thư mục lưu backup nếu chưa tồn tại
mkdir -p "$BACKUP_DIR"

# 3. Bắt đầu quá trình backup
echo "=== BẮT ĐẦU SAO LƯU: $(date) ===" >> "$LOG_FILE"

# Thực thi pg_dump trong docker container và nén bằng gzip
if docker exec "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    echo "[SUCCESS] Tạo thành công file backup: $BACKUP_FILE" >> "$LOG_FILE"
    
    # Xóa các file backup cũ hơn số ngày quy định
    echo "Đang dọn dẹp các bản sao lưu cũ hơn ${KEEP_DAYS} ngày..." >> "$LOG_FILE"
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$KEEP_DAYS -exec rm -f {} \; >> "$LOG_FILE" 2>&1
    echo "[SUCCESS] Dọn dẹp hoàn tất." >> "$LOG_FILE"
else
    echo "[ERROR] Sao lưu THẤT BẠI lúc $(date)!" >> "$LOG_FILE"
fi

echo "=== KẾT THÚC QUÁ TRÌNH SAO LƯU ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
