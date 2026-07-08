const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("sed -i '/CF_WORKER_URL/d' /var/www/zenexcode/.env && pm2 restart VibeCraft-Strona --update-env", (err, stream) => {
    stream.on('close', () => conn.end());
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect({host: '54.37.138.23', port: 22, username: 'root', password: 'Blazej0112'});
