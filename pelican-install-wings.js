import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Instalacja Docker & Wings oraz przygotowanie serwera Minecraft...\n');

  const script = `
set -e

# ─── 1. INSTALACJA DOCKER ───
if ! command -v docker &> /dev/null; then
  echo "[1/4] Instalacja Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  echo "   Docker zainstalowany."
else
  echo "[1/4] Docker jest już zainstalowany."
fi

# ─── 2. INSTALACJA WINGS ───
if ! command -v wings &> /dev/null; then
  echo "[2/4] Instalacja Pelican Wings..."
  mkdir -p /etc/pelican /var/log/pelican
  curl -L -o /usr/local/bin/wings https://github.com/pelican-dev/wings/releases/latest/download/wings_linux_amd64
  chmod +x /usr/local/bin/wings
  echo "   Wings pobrany."
else
  echo "[2/4] Wings jest już zainstalowany."
fi

# ─── 3. SYSTEMD WORKER DLA WINGS ───
cat > /etc/systemd/system/wings.service << 'SERVICEEOF'
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
CapabilityBoundingSet=CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_RESOURCE
AmbientCapabilities=CAP_SYS_ADMIN CAP_NET_ADMIN CAP_SYS_RESOURCE
NoNewPrivileges=true
ExecStart=/usr/local/bin/wings
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable wings

echo "   Docker & Wings gotowe."
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Krok 1/2 zakończony z kodem: ${code}`);
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
