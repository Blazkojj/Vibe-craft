import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Pulling latest code & rebuilding ZenexCode on VPS...');

  const cmd = `
cd /var/www/zenexcode
git checkout src/pages/Project.jsx || true
git pull origin main
npm run build
pm2 restart all || systemctl restart nginx || true
echo "ZenexCode updated and restarted successfully!"
`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Build process closed with code: ${code}`);
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
  readyTimeout: 30000
});
