import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Testing HTTP requests to Pelican Admin Panel...');

  const cmd = `
curl -s -i http://127.0.0.1/admin/login | head -n 25
echo "---"
curl -s -i http://127.0.0.1/admin/servers | head -n 25
`;

  conn.exec(cmd, (err, stream) => {
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
