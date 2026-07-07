import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Connection established.');
  
  const script = `
    set -e
    echo "=== Rozpoczynam aktualizacje na VPS ==="
    cd /var/www/zenexcode
    
    echo "[*] Pobieranie najnowszego kodu z Git..."
    git pull
    
    echo "[*] Instalacja zaleznosci frontend..."
    npm install
    
    echo "[*] Instalacja zaleznosci zenex-bot..."
    cd zenex-bot && npm install && cd ..
    
    echo "[*] Instalacja zaleznosci mail-server..."
    cd mail-server && npm install && cd ..
    
    echo "[*] Buildowanie frontendu..."
    npm run build
    
    echo "[*] Restartowanie uslug w PM2..."
    pm2 restart VibeCraft-Strona || true
    pm2 restart ZenexGuard || true
    pm2 restart MailServer || true
    
    echo "=== Aktualizacja zakonczona sukcesem! ==="
  `;
  
  conn.exec(script, (err, stream) => {
    if (err) throw err;
    
    stream.on('close', (code, signal) => {
      console.log(`[SSH] Proces zakonczony z kodem ${code}`);
      conn.end();
      process.exit(code);
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
