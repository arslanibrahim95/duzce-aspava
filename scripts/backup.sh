#!/usr/bin/env bash
# Gece yedeği: SQLite veritabanının TUTARLI bir kopyasını /opt/aspava/backups altına alır.
# Tutarlılık için dosyayı doğrudan kopyalamak yerine SQLite'ın "VACUUM INTO" komutu kullanılır
# (yazma sırasında alınan kopya bozuk olabilir; VACUUM INTO atomik bir anlık görüntü üretir).
# Son 14 yedek tutulur, eskiler silinir. vps-setup.sh bunu 03:30'a cron olarak kurar.
#
# Elle çalıştırma:  bash /opt/aspava/scripts/backup.sh
# Geri yükleme:     VPS-KURULUM.md → "Yedekleme & geri yükleme" bölümü
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/aspava}"
BACKUP_DIR="$APP_DIR/backups"
KEEP=14
STAMP="$(date +%Y%m%d-%H%M)"

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

docker compose exec -T app rm -f /data/backup-tmp.db
docker compose exec -T app node -e "
const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:/data/app.db' });
db.execute(\"VACUUM INTO '/data/backup-tmp.db'\")
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
"
docker compose cp app:/data/backup-tmp.db "$BACKUP_DIR/app-$STAMP.db"
docker compose exec -T app rm -f /data/backup-tmp.db

# Rotasyon: en yeni $KEEP yedek kalsın
ls -1t "$BACKUP_DIR"/app-*.db 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm --

echo "[$(date '+%F %T')] Yedek alındı: $BACKUP_DIR/app-$STAMP.db ($(du -h "$BACKUP_DIR/app-$STAMP.db" | cut -f1))"
