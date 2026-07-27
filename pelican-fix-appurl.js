import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Ustawianie APP_URL=http://54.37.138.23 w .env...\n');

  const script = `
# 1. Zaktualizuj APP_URL w .env
sed -i 's|APP_URL=.*|APP_URL=http://54.37.138.23|g' /var/www/pelican/.env

# 2. Wyczyść cache Laravela
cd /var/www/pelican
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 3. Zrestartuj usługi
systemctl restart wings
systemctl restart php8.3-fpm
systemctl reload nginx

echo ""
echo "=== Sprawdzenie APP_URL ==="
grep -i "APP_URL" /var/www/pelican/.env
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Zakończono z kodem: ${code}`);
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
