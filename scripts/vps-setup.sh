#!/usr/bin/env bash
# Düzce Aspava — tek komutla VPS kurulumu (Ubuntu 22.04/24.04).
# Docker + otomatik HTTPS (Caddy) + kalıcı SQLite. Turso gerekmez; her şey bu sunucuda.
#
# Kullanım (sunucuda root olarak):
#   curl -fsSL https://raw.githubusercontent.com/arslanibrahim95/duzce-aspava/main/scripts/vps-setup.sh -o vps-setup.sh
#   sudo bash vps-setup.sh
set -euo pipefail

REPO="https://github.com/arslanibrahim95/duzce-aspava.git"
APP_DIR="/opt/aspava"

echo "==> Düzce Aspava kurulumu başlıyor"
if [ "$(id -u)" -ne 0 ]; then echo "Lütfen 'sudo' ile çalıştır."; exit 1; fi

# 1) Sistem güncel + otomatik güvenlik güncellemeleri (az bakım)
echo "==> Sistem güncelleniyor + otomatik güvenlik güncellemeleri açılıyor"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades || true

# 2) Docker (resmi kurulum scripti) + compose plugin
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker kuruluyor"
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

# 3) Repo
if [ -d "$APP_DIR/.git" ]; then
  echo "==> Repo güncelleniyor"
  git -C "$APP_DIR" pull --ff-only
else
  echo "==> Repo indiriliyor → $APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# 4) Ayarlar (.env) — yoksa sor ve oluştur
if [ ! -f .env ]; then
  echo ""
  echo "==> İlk kurulum ayarları:"
  read -rp "  Alan adınız (örn. duzceaspava.com — DNS A kaydı bu sunucunun IP'sine bakmalı): " DOMAIN
  read -rp "  Panel giriş e-postası: " ADMIN_EMAIL
  read -rsp "  Panel şifresi: " ADMIN_PASSWORD; echo ""
  JWT_SECRET="$(openssl rand -base64 32 | tr -d '/+=' | head -c 43)"
  cat > .env <<EOF
SITE_ADDRESS=${DOMAIN}
JWT_SECRET=${JWT_SECRET}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF
  echo "==> .env oluşturuldu (şifreler burada saklanır, kimseyle paylaşma)."
else
  echo "==> Mevcut .env kullanılıyor (değiştirmek için: nano $APP_DIR/.env)"
fi

# 5) Başlat
echo "==> Uygulama derlenip başlatılıyor (ilk sefer birkaç dakika sürebilir)"
docker compose up -d --build

# 6) Gece yedeği (her gün 03:30 → /opt/aspava/backups, son 14 kopya)
echo "==> Otomatik gece yedeği kuruluyor (03:30)"
cat > /etc/cron.d/aspava-backup <<EOF
30 3 * * * root bash $APP_DIR/scripts/backup.sh >> /var/log/aspava-backup.log 2>&1
EOF
chmod 644 /etc/cron.d/aspava-backup

SITE="$(grep -E '^SITE_ADDRESS=' .env | cut -d= -f2-)"
echo ""
echo "============================================================"
echo " KURULUM TAMAM"
echo " Site:   https://${SITE}"
echo " Panel:  Sitenin en altındaki 'Yönetim' butonu → e-posta + şifre ile giriş"
echo " Menü ilk açılışta otomatik yüklenir (46 ürün + görseller)."
echo " Güncelleme için ileride: cd $APP_DIR && git pull && docker compose up -d --build"
echo "============================================================"
