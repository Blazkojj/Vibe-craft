const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Connected to VPS for logs.');
  conn.exec('pm2 logs VibeCraft-Strona --err --lines 50 --raw', (err, stream) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    stream.on('close', (code) => {
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
  password: 'Blazej0112'
});
