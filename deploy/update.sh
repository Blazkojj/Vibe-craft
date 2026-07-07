#!/bin/bash
# ============================================================
#  Zenexcode — aktualizacja po git push
#  Uruchom jako root: bash /opt/zenexcode/deploy/update.sh
# ============================================================
set -e

APP_DIR="/opt/zenexcode"
WEB_DIR="/var/www/zenexcode"

echo "[$(date +%H:%M:%S)] Pull + rebuild + redeploy..."

cd "$APP_DIR"
git pull

echo "[*] Instalacja deps frontend..."
npm install

echo "[*] Build frontend..."
npm run build

echo "[*] Deploy plików statycznych..."
rm -rf "$WEB_DIR"/*
cp -r "$APP_DIR/dist/"* "$WEB_DIR"/
chown -R www-data:www-data "$WEB_DIR"

echo "[*] Restart mail-server (jeśli zmiana)..."
cd "$APP_DIR/mail-server"
npm install --omit=dev 2>/dev/null || npm install
pm2 restart zenex-mail || pm2 start "$APP_DIR/mail-server/index.js" --name zenex-mail

echo "[*] Restart Discord bot (zenex-bot)..."
cd "$APP_DIR/zenex-bot"
npm install --omit=dev 2>/dev/null || npm install
pm2 delete zenex-bot 2>/dev/null || true
pm2 start "$APP_DIR/zenex-bot/index.js" --name zenex-bot

pm2 save

echo "[*] Reload Nginx..."
nginx -t && systemctl reload nginx

echo "[$(date +%H:%M:%S)] Done. https://zenexcode.pl"
