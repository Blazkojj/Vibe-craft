import { Client } from 'ssh2';

const conn = new Client();
conn.on('ready', () => {
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

try {
    $res = $repo->getHttpClient()->post("/api/servers/{$server->uuid}/commands", ['commands' => ['plugins']]);
    echo "Command sent to MC console! Response status: " . $res->status() . "\n";
} catch (\\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/send_cmd.php\n${phpScript}\nPHPEOF\nphp /tmp/send_cmd.php`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`Finished with code ${code}`);
      conn.end();
    })
    .on('data', d => process.stdout.write(d))
    .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112'
});
