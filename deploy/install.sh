#!/bin/bash
# ============================================================
#  Zenexcode — instalator VPS (Ubuntu/Debian)
#  Uruchom jako root w konsoli VPS:
#    bash install.sh
# ============================================================
set -e

DOMAIN="zenexcode.pl"
WWW_DOMAIN="www.zenexcode.pl"
REPO="https://github.com/Blazkojj/Vibe-craft.git"
APP_DIR="/opt/zenexcode"
MAIL_DIR="/opt/zenexcode/mail-server"
WEB_DIR="/var/www/zenexcode"

echo "═══════════════════════════════════════════════════════"
echo "  Zenexcode VPS installer — $DOMAIN"
echo "═══════════════════════════════════════════════════════"

# ─── 1. Aktualizacja + pakiety ───
echo "[1/9] Aktualizacja systemu i instalacja pakietów..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx ufw ca-certificates gnupg

# ─── 2. Node.js 20 ───
echo "[2/9] Instalacja Node.js 20..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v

# ─── 3. pm2 (proces manager) ───
echo "[3/9] Instalacja pm2..."
npm install -g pm2

# ─── 4. Certbot (Let's Encrypt) ───
echo "[4/9] Instalacja Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ─── 5. Clone repo ───
echo "[5/9] Pobieranie kodu z GitHub..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull
else
  rm -rf "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
fi

# ─── 6. Build frontend ───
echo "[6/9] Build frontend (vite)..."
cd "$APP_DIR"
npm install
npm run build

# ─── 7. Deploy plików statycznych ───
echo "[7/9] Deploy plików statycznych do $WEB_DIR..."
mkdir -p "$WEB_DIR"
rm -rf "$WEB_DIR"/*
cp -r "$APP_DIR/dist/"* "$WEB_DIR/"
chown -R www-data:www-data "$WEB_DIR"

# ─── 8. Mail-server ───
echo "[8/9] Konfiguracja mail-server..."
cd "$MAIL_DIR"
npm install

# .env dla mail-server (jeśli nie istnieje)
if [ ! -f "$MAIL_DIR/.env" ]; then
  cat > "$MAIL_DIR/.env" <<'EOF'
SMTP_HOST=poczta2666244.home.pl
SMTP_PORT=465
SMTP_USER=support@zenexcode.pl
SMTP_PASS=__TUTAJ_WPISZ_HASLO_DO_SKRZYNKI__
MAIL_API_KEY=PcTw8FrGzUNnLapqA63fg54Io2dWy9BV
PORT=3001
EOF
  echo "  ┌────────────────────────────────────────────────┐"
  echo "  │  UWAGA: Edytuj $MAIL_DIR/.env    │"
  echo "  │  i wpisz hasło do support@zenexcode.pl         │"
  echo "  └────────────────────────────────────────────────┘"
fi

# Start mail-server przez pm2
pm2 delete zenex-mail 2>/dev/null || true
pm2 start "$MAIL_DIR/index.js" --name zenex-mail
pm2 save
pm2 startup systemd -y --hp /root

# ─── 9. Nginx konfiguracja ───
echo "[9/9] Konfiguracja Nginx..."
cat > /etc/nginx/sites-available/zenexcode <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name zenexcode.pl www.zenexcode.pl;

    # Frontend (statyczne pliki)
    root /var/www/zenexcode;
    index index.html;

    # SPA fallback — każdy route do index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API → proxy do mail-server (pm2)
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Cache statyki
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}

EOF

ln -sf /etc/nginx/sites-available/zenexcode /etc/nginx/sites-enabled/zenexcode
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
systemctl enable nginx

# ─── Firewall ───
echo "Konfiguracja firewall..."
ufw allow OpenSSH 2>/dev/null || true
ufw allow 'Nginx Full' 2>/dev/null || true
ufw --force enable 2>/dev/null || true

# ─── SSL (Let's Encrypt) ───
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Instalacja zakończona (bez SSL — patrz niżej)"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "CO DALEJ:"
echo ""
echo "1. Ustaw DNS w panelu home.pl:"
echo "   - rekord A: zenexcode.pl  → $(curl -s ifconfig.me)"
echo "   - rekord A: www.zenexcode.pl → $(curl -s ifconfig.me)"
echo "   (poczekaj 5-30 min aż DNS się propagate)"
echo ""
echo "2. Edytuj hasło SMTP:"
echo "   nano $MAIL_DIR/.env"
echo "   (wpisz hasło do support@zenexcode.pl)"
echo "   pm2 restart zenex-mail"
echo ""
echo "3. Test czy strona działa (HTTP):"
echo "   http://$DOMAIN  ← powinna pokazać landing page"
echo ""
echo "4. Test czy mail-server działa:"
echo "   curl http://$DOMAIN/api/health"
echo "   (powinno: {\"ok\":true,\"smtp\":\"connected\"})"
echo ""
echo "5. Zainstaluj SSL (po propagate DNS):"
echo "   certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --redirect --agree-tos -m support@$DOMAIN"
echo ""
echo "6. W .env.local na lokalnym komputerze (frontend) zmień:"
echo "   VITE_MAIL_SERVER_URL=https://$DOMAIN/api"
echo "   przebuduj i wrzuć na nowo (git push → bash update.sh na VPS)"
echo ""
echo "Gotowe. Zobacz też: bash $APP_DIR/deploy/update.sh"
