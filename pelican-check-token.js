import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Pobieram dokładnie tokeny Wings z bazy danych...\n');

  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Node;

$node = Node::first();
echo "UUID: {$node->uuid}\n";
echo "Token ID: {$node->daemon_token_id}\n";
echo "Token: {$node->daemon_token}\n";
echo "Decrypted token: " . (method_exists($node, 'getDecryptedDaemonToken') ? $node->getDecryptedDaemonToken() : $node->daemon_token) . "\n";
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/get_node.php\n${phpScript}\nPHPEOF\nphp /tmp/get_node.php`, (err, stream) => {
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
