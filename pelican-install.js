import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Połączono z VPS. Rozpoczynam instalację Pelican Panel...\n');

  const script = `
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   PELICAN PANEL INSTALLER — ByteHost     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

export DEBIAN_FRONTEND=noninteractive

# ─── 1. SYSTEM UPDATE ───
echo "[1/9] Aktualizacja systemu..."
# Usuń stary broken PPA ondrej jeśli istnieje
rm -f /etc/apt/sources.list.d/*ondrej* /etc/apt/sources.list.d/*php* 2>/dev/null || true
apt-get update -qq

# ─── 2. PHP 8.3 ───
echo "[2/9] Instalacja PHP 8.3..."
apt-get install -y -qq software-properties-common apt-transport-https ca-certificates curl lsb-release gnupg2

# PHP 8.3 via packages.sury.org (Ubuntu 26.04 Resolute compatible)
if ! php8.3 -v 2>/dev/null | grep -q "8.3"; then
  curl -sSL https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /etc/apt/trusted.gpg.d/sury-php.gpg
  echo "deb [signed-by=/etc/apt/trusted.gpg.d/sury-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/sury-php.list
  apt-get update -qq
fi
apt-get install -y -qq php8.3 php8.3-{common,cli,gd,mysql,mbstring,bcmath,xml,fpm,curl,zip,intl,sqlite3,tokenizer,fileinfo,phar}
echo "   PHP version: $(php8.3 -r 'echo PHP_VERSION;')"

# ─── 3. NGINX ───
echo "[3/9] Instalacja / weryfikacja Nginx..."
apt-get install -y -qq nginx
systemctl enable nginx

# ─── 4. MARIADB ───
echo "[4/9] Instalacja MariaDB..."
apt-get install -y -qq mariadb-server
systemctl enable mariadb
systemctl start mariadb

# Stwórz bazę danych i użytkownika dla Pelicana
mysql -u root -e "
CREATE DATABASE IF NOT EXISTS pelican DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'pelican'@'127.0.0.1' IDENTIFIED BY 'ByteHost2027!Pelican';
GRANT ALL PRIVILEGES ON pelican.* TO 'pelican'@'127.0.0.1';
FLUSH PRIVILEGES;
" || true
echo "   Baza danych pelican gotowa."

# ─── 5. REDIS ───
echo "[5/9] Instalacja Redis..."
apt-get install -y -qq redis-server
systemctl enable redis-server
systemctl start redis-server

# ─── 6. COMPOSER ───
echo "[6/9] Instalacja Composer..."
if ! command -v composer &>/dev/null; then
  curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi
echo "   Composer: $(composer --version --no-ansi 2>/dev/null | head -1)"

# ─── 7. CERTBOT ───
echo "[7/9] Instalacja Certbot..."
apt-get install -y -qq certbot python3-certbot-nginx

# ─── 8. PELICAN PANEL ───
echo "[8/9] Instalacja Pelican Panel..."
mkdir -p /var/www/pelican
cd /var/www/pelican

# Pobierz najnowszą wersję
LATEST=$(curl -s https://api.github.com/repos/pelican-dev/panel/releases/latest | grep '"tag_name"' | cut -d'"' -f4)
echo "   Wersja Pelican: $LATEST"
curl -Lo panel.tar.gz "https://github.com/pelican-dev/panel/releases/download/\${LATEST}/panel.tar.gz" --progress-bar
tar -xzf panel.tar.gz
rm panel.tar.gz
chmod -R 755 storage/* bootstrap/cache/

# .env
cp .env.example .env
sed -i "s|APP_URL=http://localhost|APP_URL=https://panel.bytehost.online|g" .env
sed -i "s|APP_ENV=local|APP_ENV=production|g" .env
sed -i "s|APP_DEBUG=true|APP_DEBUG=false|g" .env
sed -i "s|DB_HOST=127.0.0.1|DB_HOST=127.0.0.1|g" .env
sed -i "s|DB_DATABASE=pelican|DB_DATABASE=pelican|g" .env
sed -i "s|DB_USERNAME=pelican|DB_USERNAME=pelican|g" .env
sed -i "s|DB_PASSWORD=|DB_PASSWORD=ByteHost2027!Pelican|g" .env
sed -i "s|CACHE_DRIVER=file|CACHE_DRIVER=redis|g" .env
sed -i "s|SESSION_DRIVER=file|SESSION_DRIVER=redis|g" .env
sed -i "s|QUEUE_CONNECTION=sync|QUEUE_CONNECTION=redis|g" .env

# Composer install
echo "   Instalacja zależności PHP (może chwilę potrwać)..."
composer install --no-dev --optimize-autoloader --no-interaction --quiet

# Generuj klucz aplikacji
php artisan key:generate --force

# Migracja bazy
echo "   Migracja bazy danych..."
php artisan migrate --seed --force

# Uprawnienia
chown -R www-data:www-data /var/www/pelican/
chmod -R 755 /var/www/pelican/storage /var/www/pelican/bootstrap/cache

# ─── 9. NGINX VHOST ───
echo "[9/9] Konfiguracja Nginx vhost..."

cat > /etc/nginx/sites-available/pelican.conf << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name panel.bytehost.online;

    root /var/www/pelican/public;
    index index.php;

    access_log /var/log/nginx/pelican_access.log;
    error_log  /var/log/nginx/pelican_error.log;

    client_max_body_size 100m;
    client_body_timeout 120s;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_read_timeout 300;
    }

    location ~ /\\.ht {
        deny all;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/pelican.conf /etc/nginx/sites-enabled/pelican.conf
nginx -t && systemctl reload nginx
echo "   Nginx vhost aktywny."

# ─── SSL CERTBOT ───
echo ""
echo "[SSL] Generowanie certyfikatu SSL dla panel.bytehost.online..."
certbot --nginx -d panel.bytehost.online --non-interactive --agree-tos -m admin@bytehost.online --redirect || echo "[!] SSL: sprawdź propagację DNS i uruchom certbot ręcznie za 5 min."

# ─── QUEUE WORKER SYSTEMD ───
echo "[*] Konfiguracja Queue Worker..."
cat > /etc/systemd/system/pelican-queue.service << 'SVCEOF'
[Unit]
Description=Pelican Queue Worker
After=network.target redis-server.service mariadb.service

[Service]
User=www-data
Group=www-data
Restart=always
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s
ExecStart=/usr/bin/php /var/www/pelican/artisan queue:work --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable --now pelican-queue

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ PELICAN PANEL ZAINSTALOWANY POMYŚLNIE!           ║"
echo "║                                                      ║"
echo "║  URL:      https://panel.bytehost.online             ║"
echo "║  DB:       pelican / ByteHost2027!Pelican            ║"
echo "║                                                      ║"
echo "║  Stwórz admina:                                      ║"
echo "║  php artisan p:user:make --admin                     ║"
echo "║  (uruchom w: /var/www/pelican)                       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;

    stream.on('close', (code) => {
      console.log(`\n[SSH] Instalacja zakończona z kodem: ${code}`);
      conn.end();
      process.exit(code);
    })
    .on('data', (data) => { process.stdout.write(data); })
    .stderr.on('data', (data) => { process.stderr.write(data); });
  });

}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112',
  readyTimeout: 20000
});
