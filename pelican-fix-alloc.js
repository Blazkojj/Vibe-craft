import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Przypisywanie allocation_id do serwera i naprawa połączenia z Wings...\n');

  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Server;
use App\\Models\\Allocation;
use App\\Repositories\\Daemon\\DaemonServerRepository;

$server = Server::where('uuid', 'c3183a04-7ea7-49df-a75e-5416712c3757')->first();
$alloc = Allocation::where('node_id', $server->node_id)->where('port', 25565)->first();

if ($alloc) {
    $alloc->server_id = $server->id;
    $alloc->save();
    echo "Allocation #{$alloc->id} mapped to server #{$server->id}!\n";
}

// Sprawdźmy nowy output getAllocationMappings
$server->refresh();
echo "New Allocation Mappings:\n";
print_r($server->getAllocationMappings());

// Przetestujmy stworzenie i synchronizację serwera na Wings
$repo = app(DaemonServerRepository::class);
$repo->setServer($server);

echo "Creating server on Wings...\n";
try {
    $repo->create(false);
    echo "Server successfully created on Wings!\n";
} catch (\\Exception \$e) {
    echo "Exception during Wings server create: " . \$e->getMessage() . "\n";
}

echo "Testing getDetails() from Wings...\n";
try {
    $details = $repo->getDetails();
    echo "Wings Details Output:\n";
    print_r($details);
} catch (\\Exception \$e) {
    echo "Exception during getDetails(): " . \$e->getMessage() . "\n";
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/fix_alloc_wings.php\n${phpScript}\nPHPEOF\nphp /tmp/fix_alloc_wings.php`, (err, stream) => {
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
