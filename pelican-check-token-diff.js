import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Node;

$node = Node::first();
echo "Eloquent \$node->daemon_token: " . $node->daemon_token . "\n";
echo "Eloquent \$node->getRawOriginal('daemon_token'): " . $node->getRawOriginal('daemon_token') . "\n";

$yaml = file_get_contents('/etc/pelican/config.yml');
echo "Config.yml token:\n" . $yaml . "\n";
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/check_token_diff.php\n${phpScript}\nPHPEOF\nphp /tmp/check_token_diff.php`, (err, stream) => {
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
