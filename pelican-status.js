import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const script = `
echo "=== Sprawdzam czy Nginx serwuje Pelicana ==="
curl -s -o /dev/null -w "Odpowiedź na port 80: %{http_code}\\n" http://localhost/ -H "Host: panel.bytehost.online"

echo ""
echo "=== Sprawdzam konfigurację Nginx ==="
nginx -T 2>/dev/null | grep -A 5 "server_name"

echo ""
echo "=== Sprawdzam porty ==="
ss -tlnp | grep -E ":80|:443|:3000"

echo ""
echo "=== DNS z różnych serwerów ==="
dig +short panel.bytehost.online @8.8.8.8
dig +short panel.bytehost.online @1.1.1.1
dig +short panel.bytehost.online @208.67.222.222
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => { conn.end(); })
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
