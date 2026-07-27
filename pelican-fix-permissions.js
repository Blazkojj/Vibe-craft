import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Setting www-data permissions and inspecting recent errors...');

  const cmd = `
chown -R www-data:www-data /var/www/pelican
chmod -R 775 /var/www/pelican/storage /var/www/pelican/bootstrap/cache
grep -rn "in_array" /var/www/pelican/storage/logs/ || true
`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Permissions updated, code: ${code}`);
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
