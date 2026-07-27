import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Connected to VPS. Checking Laravel logs & repairing database...');

  const fixScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Egg;
use App\\Models\\Node;
use App\\Models\\Server;

echo "--- CHECKING EGGS ---\n";
foreach (Egg::all() as $egg) {
    echo "Egg ID: {$egg->id}, Name: {$egg->name}\n";
    echo "docker_images type: " . gettype($egg->docker_images) . "\n";
    
    // Check if docker_images is a string containing json or double-encoded
    if (is_string($egg->docker_images)) {
        echo "  [FIXING] docker_images was string: {$egg->docker_images}\n";
        $decoded = json_decode($egg->docker_images, true);
        if (is_string($decoded)) {
            $decoded = json_decode($decoded, true);
        }
        $egg->docker_images = is_array($decoded) ? $decoded : [];
    }
    
    if (is_string($egg->startup_commands)) {
        echo "  [FIXING] startup_commands was string: {$egg->startup_commands}\n";
        $decoded = json_decode($egg->startup_commands, true);
        if (is_string($decoded)) {
            $decoded = json_decode($decoded, true);
        }
        $egg->startup_commands = is_array($decoded) ? $decoded : [];
    }
    
    $egg->save();
}

echo "\n--- CHECKING NODES ---\n";
foreach (Node::all() as $node) {
    echo "Node ID: {$node->id}, Name: {$node->name}\n";
}

echo "\n--- CLEARING PELICAN CACHE ---\n";
\\Illuminate\\Support\\Facades\\Artisan::call('cache:clear');
\\Illuminate\\Support\\Facades\\Artisan::call('config:clear');
\\Illuminate\\Support\\Facades\\Artisan::call('view:clear');
echo "Cache cleared successfully!\n";
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/fix_pelican_db.php\n${fixScript}\nPHPEOF\nphp /tmp/fix_pelican_db.php && tail -n 50 /var/www/pelican/storage/logs/laravel-$(date +%Y-%m-%d).log`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\n[SSH] Task completed with code: ${code}`);
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
