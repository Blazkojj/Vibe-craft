import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Sprawdzam DNS i staram się wystawić certyfikat SSL...\n');

  const script = `
set -e
echo "=== Sprawdzam DNS propagację ==="
RESOLVED=$(dig +short panel.bytehost.online @8.8.8.8 | tail -1)
echo "panel.bytehost.online → $RESOLVED"
echo "VPS IP: 54.37.138.23"

if [ "$RESOLVED" = "54.37.138.23" ]; then
  echo "DNS poprawnie propaguje. Generuję certyfikat SSL..."
  certbot --nginx -d panel.bytehost.online --non-interactive --agree-tos -m admin@bytehost.online --redirect
  echo "=== SSL wystawiony pomyślnie! ==="
  nginx -t && systemctl reload nginx
else
  echo "DNS jeszcze nie propaguje ($RESOLVED). Spróbuj ponownie za kilka minut."
fi

echo ""
echo "=== Status usług ==="
systemctl is-active nginx && echo "Nginx: RUNNING" || echo "Nginx: STOPPED"
systemctl is-active mariadb && echo "MariaDB: RUNNING" || echo "MariaDB: STOPPED"
systemctl is-active redis-server && echo "Redis: RUNNING" || echo "Redis: STOPPED"
systemctl is-active pelican-queue && echo "Pelican Queue: RUNNING" || echo "Pelican Queue: STOPPED"
systemctl is-active php8.3-fpm && echo "PHP-FPM 8.3: RUNNING" || echo "PHP-FPM 8.3: STOPPED"

echo ""
echo "=== Tworzenie konta admina ==="
cd /var/www/pelican
php artisan p:user:make --admin --email=admin@bytehost.online --username=admin --name-first=Admin --name-last=ByteHost --password=ByteHostAdmin2027!
echo "=== Admin stworzony! ==="
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Zakończono z kodem: ${code}`);
      conn.end();
      process.exit(code);
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
