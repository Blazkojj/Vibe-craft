import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  console.log('[SSH] Uruchamiam certbot...\n');
  conn.exec(
    'certbot --nginx -d panel.bytehost.online --non-interactive --agree-tos -m admin@bytehost.online --redirect 2>&1 && echo "=== SSL OK ===" || echo "=== SSL FAILED ==="',
    (err, stream) => {
      if (err) throw err;
      stream.on('close', (code) => {
        console.log(`Zakończono: ${code}`);
        conn.end();
      })
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
    }
  );
}).connect({ host: '54.37.138.23', port: 22, username: 'root', password: 'Blazej0112', readyTimeout: 20000 });
