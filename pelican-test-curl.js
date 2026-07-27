import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Server;

$server = Server::where('uuid', 'c3183a04-7ea7-49df-a75e-5416712c3757')->first();
$node = $server->node;

$url = "http://{$node->fqdn}:{$node->daemon_listen}/api/servers/{$server->uuid}";
echo "Testing curl to: {$url}\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $node->daemon_token_id . '.' . $node->daemon_token,
    'Accept: application/json',
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$resp = curl_exec($ch);
$err = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: {$code}\n";
echo "Curl Error: {$err}\n";
echo "Response: {$resp}\n";
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/test_curl.php\n${phpScript}\nPHPEOF\nphp /tmp/test_curl.php`, (err, stream) => {
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
