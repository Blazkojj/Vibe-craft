const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Connected to VPS for env check.');
  conn.exec('cat /var/www/zenexcode/.env /var/www/zenexcode/.env.local', (err, stream) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    let output = '';
    stream.on('close', (code) => {
      conn.end();
      // Mask secrets
      const lines = output.split('\n');
      const masked = lines.map(line => {
        if (!line.trim() || line.startsWith('#')) return line;
        const parts = line.split('=');
        if (parts.length < 2) return line;
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (val.length <= 8) return `${key}=***`;
        return `${key}=${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
      });
      console.log(masked.join('\n'));
      process.exit(code);
    }).on('data', (data) => {
      output += data.toString();
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
