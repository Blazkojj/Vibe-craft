import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Checking /var/www/zenexcode directory on VPS...');

  const cmd = `
if [ -d "/var/www/zenexcode" ]; then
   cd /var/www/zenexcode && git status || ls -la
else
   echo "Directory /var/www/zenexcode does not exist"
fi
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
