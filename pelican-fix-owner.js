import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Naprawa właściciela plików serwera (chown pelican:pelican)...\n');

  const script = `
# 1. Zmień właściciela katalogu wolumenu na pelican:pelican (uid: 999, gid: 981)
chown -R pelican:pelican /var/lib/pelican/volumes/
chmod -R 775 /var/lib/pelican/volumes/

# 2. Wyślij komendę start
php /tmp/test_power.php

sleep 3
echo "=== Stan kontenera w Dockerze ==="
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
