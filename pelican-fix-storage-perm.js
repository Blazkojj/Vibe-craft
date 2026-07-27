import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Naprawa uprawnień www-data w /var/www/pelican/storage...\n');

  const script = `
chown -R www-data:www-data /var/www/pelican/storage /var/www/pelican/bootstrap/cache
chmod -R 775 /var/www/pelican/storage /var/www/pelican/bootstrap/cache

# Wyczyść stary cache stwórz z uprawnieniami www-data
su -s /bin/bash www-data -c "php /var/www/pelican/artisan config:clear" || php /var/www/pelican/artisan config:clear
chown -R www-data:www-data /var/www/pelican/storage /var/www/pelican/bootstrap/cache

systemctl restart php8.3-fpm
systemctl reload nginx

echo "Uprawnienia poprawione!"
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Zakończono z kodem: ${code}`);
      conn.end();
    })
    .on('data', d => process.stdout.write(d))
    .stderr.on('data', d => process.stdout.write(d));
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112',
  readyTimeout: 20000
});
