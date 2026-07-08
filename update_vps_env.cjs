const { Client } = require('ssh2');

const conn = new Client();
const newKey = 'sk-cfd29d1c3726ab71d4721d7d7da92d365686db3928116cc9b3c009ff835ef2d7';

conn.on('ready', () => {
  console.log('[SSH] Connected to VPS to update .env');
  
  const script = `
    set -e
    ENV_FILE="/var/www/zenexcode/.env"
    if [ -f "$ENV_FILE" ]; then
      echo "[*] Modifying .env keys on VPS..."
      sed -i 's/AIAPIFLOW_KEY_OPUS_4_8=.*/AIAPIFLOW_KEY_OPUS_4_8=${newKey}/' "$ENV_FILE"
      sed -i 's/AIAPIFLOW_KEY_OPUS_4_7=.*/AIAPIFLOW_KEY_OPUS_4_7=${newKey}/' "$ENV_FILE"
      sed -i 's/AIAPIFLOW_KEY_SONNET_4_6=.*/AIAPIFLOW_KEY_SONNET_4_6=${newKey}/' "$ENV_FILE"
      sed -i 's/AIAPIFLOW_KEY_HAIKU_4_5=.*/AIAPIFLOW_KEY_HAIKU_4_5=${newKey}/' "$ENV_FILE"
      sed -i 's/AIAPIFLOW_KEY_SONNET_5=.*/AIAPIFLOW_KEY_SONNET_5=${newKey}/' "$ENV_FILE"
      echo "[*] Remote .env updated."
      cat "$ENV_FILE" | grep AIAPIFLOW
    else
      echo "[!] .env file not found on VPS!"
    fi
  `;
  
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`[SSH] Closed with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112',
  readyTimeout: 20000
});
