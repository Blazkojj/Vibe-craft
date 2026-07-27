import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const script = `
netstat -tulpn | grep 8080 || ss -tulpn | grep 8080
ufw status
iptables -L -n -v | grep 8080 || true
curl -v http://127.0.0.1:8080/api/system
curl -v http://54.37.138.23:8080/api/system || true
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
