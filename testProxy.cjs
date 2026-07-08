const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("curl-impersonate-chrome -v -s -X POST https://api.zenexcode.pl/aiapiflow/v1/chat/completions -d '{}'", (err, stream) => {
    stream.on('close', () => conn.end());
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect({host: '54.37.138.23', port: 22, username: 'root', password: 'Blazej0112'});
