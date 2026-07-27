import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Aktualizacja pliku /etc/pelican/config.yml i uruchomienie Wings...\n');

  const script = `
cat > /etc/pelican/config.yml << 'EOF'
debug: false
uuid: 7e9caa07-f107-4341-b055-d46e8dc48fff
token_id: G5vx8253KC7axvIk
token: 1rgdPheiFrmObJeUTdEUkcUtYnqyVXrxstOABt23wcrULYsIBfY2xfRAsT2OGqIx
api:
  host: 0.0.0.0
  port: 8080
  ssl:
    enabled: false
  upload_limit: 100
system:
  data: /var/lib/pelican/volumes
  sftp:
    bind_port: 2022
remote: http://127.0.0.1
EOF

systemctl restart wings
sleep 2
systemctl status wings --no-pager
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
