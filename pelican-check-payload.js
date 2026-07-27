import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Pobieram odpowiedź /api/remote/servers/c3183a04-7ea7-49df-a75e-5416712c3757...\n');

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

// Wywołajmy wewnętrzną metodę budowania konfiguracji
$ref = new \\ReflectionClass(\$repo);
if (\$ref->hasMethod('buildConfiguration')) {
    $method = \$ref->getMethod('buildConfiguration');
    $method->setAccessible(true);
    $config = $method->invoke(\$repo);
    echo "Server Configuration Payload for Wings:\n";
    echo json_encode($config, JSON_PRETTY_PRINT);
} else {
    echo "Method buildConfiguration not found on DaemonServerRepository\n";
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/check_server_payload.php\n${phpScript}\nPHPEOF\nphp /tmp/check_server_payload.php`, (err, stream) => {
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
