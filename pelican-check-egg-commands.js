import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Inspecting Egg startup_commands in DB...');

  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Egg;
use App\\Models\\Server;

foreach (Egg::all() as $egg) {
    echo "Egg ID: {$egg->id}\n";
    echo "  startup_commands type: " . gettype($egg->startup_commands) . "\n";
    echo "  startup_commands val: " . var_export($egg->startup_commands, true) . "\n";
    echo "  docker_images type: " . gettype($egg->docker_images) . "\n";
    echo "  docker_images val: " . var_export($egg->docker_images, true) . "\n";
}

foreach (Server::all() as $server) {
    echo "Server ID: {$server->id}, Egg ID: {$server->egg_id}, Startup: {$server->startup}\n";
    if ($server->egg) {
       echo "  Egg startup_commands type: " . gettype($server->egg->startup_commands) . "\n";
    }
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/check_egg.php\n${phpScript}\nPHPEOF\nphp /tmp/check_egg.php`, (err, stream) => {
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
