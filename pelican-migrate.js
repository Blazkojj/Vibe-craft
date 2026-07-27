import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const script = `
echo "=== Pełny .env Pelicana ==="
cat /var/www/pelican/.env | grep -E "^(DB_|APP_)" | head -30

echo ""
echo "=== Ustawiamy MySQL w .env ==="
cd /var/www/pelican

# Usuń stare DB_ linie i dodaj nowe
sed -i '/^DB_/d' .env

cat >> .env << 'ENVEOF'
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pelican
DB_USERNAME=pelican
DB_PASSWORD=ByteHost2027!Pelican
ENVEOF

echo "DB_ w .env po poprawce:"
grep "^DB_" .env

echo ""
echo "=== Resetujemy migracje i uruchamiamy ==="
php artisan config:clear
php artisan migrate:fresh --seed --force 2>&1

echo ""
echo "=== Tabele po migracji ==="
mysql -u root pelican -e "SHOW TABLES;" | head -20

echo ""
echo "=== Tworzę admina ==="
HASH=$(php -r "echo password_hash('ByteHostAdmin2027!', PASSWORD_BCRYPT, ['cost'=>10]);")
UUID=$(cat /proc/sys/kernel/random/uuid)
mysql -u root pelican -e "INSERT IGNORE INTO users (uuid, name_first, name_last, email, username, password, root_admin, use_totp, language, created_at, updated_at) VALUES ('$UUID', 'Admin', 'ByteHost', 'admin@bytehost.online', 'admin', '$HASH', 1, 0, 'en', NOW(), NOW());"
mysql -u root pelican -e "SELECT id, email, username, root_admin FROM users;"
echo "✅ Panel gotowy!"
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`Zakończono: ${code}`);
      conn.end();
    })
    .on('data', d => process.stdout.write(d))
    .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112',
  readyTimeout: 20000
});
