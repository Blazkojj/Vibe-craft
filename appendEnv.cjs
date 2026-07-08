const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('echo "\nCF_WORKER_URL=https://api.zenexcode.pl\n" >> /var/www/zenexcode/.env && pm2 restart VibeCraft-Strona', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', d => {
      process.stdout.write(d);
    });
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112'
});
