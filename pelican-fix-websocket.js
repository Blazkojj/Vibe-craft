import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Ustawianie FQDN Node na 54.37.138.23 dla WebSocketa...\n');

  const script = `
# 1. Ustaw FQDN w bazie danych na IP publiczne VPS (54.37.138.23)
mysql -u root pelican -e "UPDATE nodes SET fqdn = '54.37.138.23', scheme = 'http' WHERE id = 1;"

# 2. Upewnij się że port 8080 (Wings WebSocket) jest dostępny z zewnątrz w ufw/iptables
ufw allow 8080/tcp 2>/dev/null || true

# 3. Zrestartuj Wings i Nginx
systemctl restart wings
systemctl restart php8.3-fpm
systemctl reload nginx

echo ""
echo "=== Node FQDN w bazie ==="
mysql -u root pelican -e "SELECT id, name, fqdn, scheme, daemon_listen FROM nodes;"
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
