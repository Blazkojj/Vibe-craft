import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Testowe uruchomienie serwera Minecraft w Wings...\n');

  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Server;
use App\\Repositories\\Daemon\\DaemonServerRepository;

$server = Server::where('uuid', 'c3183a04-7ea7-49df-a75e-5416712c3757')->first();
$repo = app(DaemonServerRepository::class);
$repo->setServer($server);

echo "Sending power start action to Wings...\n";
try {
    $res = $repo->power('start');
    echo "Response status: " . $res->status() . "\n";
} catch (\\Exception \$e) {
    echo "Power start Exception: " . \$e->getMessage() . "\n";
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/start_mc.php\n${phpScript}\nPHPEOF\nphp /tmp/start_mc.php`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Zakończono z kodem: ${code}`);
      conn.end();
    })
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
