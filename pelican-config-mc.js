import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const script = `
cd /var/www/pelican
php artisan p:egg:update-index 2>&1
php artisan db:seed --class=EggSeeder 2>&1 || php artisan db:seed 2>&1
mysql -u root pelican -e "SELECT id, name, author FROM eggs;"
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
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
