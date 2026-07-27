import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
  conn.exec('curl -s ifconfig.me && echo "" && hostname -I', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({ host: '54.37.138.23', port: 22, username: 'root', password: 'Blazej0112', readyTimeout: 20000 });
