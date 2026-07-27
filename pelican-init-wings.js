import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Inicjalizacja serwera w Wings via DaemonServerRepository->create()...\n');

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

echo "1. Creating server on Wings...\n";
try {
    $repo->create(false);
    echo "Server create triggered successfully!\n";
} catch (\\Exception \$e) {
    echo "Create Exception: " . \$e->getMessage() . "\n";
}

echo "2. Testing getDetails()...\n";
try {
    $details = $repo->getDetails();
    print_r($details);
} catch (\\Exception \$e) {
    echo "getDetails Exception: " . \$e->getMessage() . "\n";
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/init_wings_server.php\n${phpScript}\nPHPEOF\nphp /tmp/init_wings_server.php`, (err, stream) => {
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
