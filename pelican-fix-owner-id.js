import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const script = `
id pelican || true
chown -R 999:981 /var/lib/pelican/volumes/
ls -ld /var/lib/pelican/volumes/c3183a04-7ea7-49df-a75e-5416712c3757
php /tmp/test_power.php
sleep 5
docker ps
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Zakończono z kodem: ${code}`);
      conn.end();
    })
    .on('data', d => process.stdout.write(d))
    .stderr.on('data', d => process.stdout.write(d));
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112',
  readyTimeout: 20000
});
