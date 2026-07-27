import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Tworzę konto admina w Pelican Panel...\n');

  const script = `
set -e
cd /var/www/pelican

echo "=== Tworzenie konta admina ==="
php artisan p:user:make --admin --email=admin@bytehost.online --username=admin --password=ByteHostAdmin2027! 2>&1 || php artisan p:user:make 2>&1

echo ""
echo "=== Status panel.bytehost.online ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\\n" http://panel.bytehost.online/ || echo "Panel dostępny po propagacji DNS"

echo ""
echo "=== DNS check ==="
dig +short panel.bytehost.online @8.8.8.8
dig +short panel.bytehost.online @1.1.1.1
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
