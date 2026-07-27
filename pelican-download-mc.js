import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Pobieranie silnika Minecraft 1.21.4 (Paper) i przygotowanie serwera...\n');

  const script = `
mkdir -p /var/lib/pelican/volumes/c3183a04-7ea7-49df-a75e-5416712c3757
cd /var/lib/pelican/volumes/c3183a04-7ea7-49df-a75e-5416712c3757

echo "[1/3] Pobieram silnik Minecraft Paper 1.21.4..."
curl -o server.jar -sSL "https://api.purpurmc.org/v2/purpur/1.21.4/latest/download"

echo "[2/3] Akceptuję EULA..."
echo "eula=true" > eula.txt

echo "[3/3] Ustawiam uprawnienia wolumenu..."
chmod -R 777 /var/lib/pelican/volumes/c3183a04-7ea7-49df-a75e-5416712c3757

ls -lh /var/lib/pelican/volumes/c3183a04-7ea7-49df-a75e-5416712c3757

systemctl restart wings
echo "Status Wings:"
systemctl is-active wings && echo "Wings: RUNNING" || echo "Wings: FAILED"
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
