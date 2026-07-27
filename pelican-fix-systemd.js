import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Aktualizacja systemd wings.service (usunięcie NoNewPrivileges)...\n');

  const script = `
cat > /etc/systemd/system/wings.service << 'EOF'
[Unit]
Description=Pelican Wings Daemon
After=docker.service
Requires=docker.service
PartOf=docker.service

[Service]
User=root
WorkingDirectory=/etc/pelican
LimitNOFILE=1048576
LimitNPROC=512000
LimitCORE=infinity
ExecStart=/usr/local/bin/wings
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

chown -R pelican:981 /var/lib/pelican
chown -R 999:981 /var/lib/pelican

systemctl daemon-reload
systemctl restart wings

sleep 2
php /tmp/test_power.php

sleep 5
echo "=== Stan kontenera Docker ==="
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
