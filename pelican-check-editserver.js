import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Viewing EditServer.php lines 640 to 690...');

  conn.exec(`sed -n '640,690p' /var/www/pelican/app/Filament/Admin/Resources/Servers/Pages/EditServer.php`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
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
