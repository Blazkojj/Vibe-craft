import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Pobieram OSTATNIE wyjątki z storage/logs/laravel*.log...\n');

  const script = `
tail -n 50 /var/www/pelican/storage/logs/laravel-$(date +%Y-%m-%d).log 2>/dev/null || tail -n 50 /var/www/pelican/storage/logs/laravel.log 2>/dev/null || true
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
