import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Testowanie DaemonServerRepository...\n');

  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Server;

$server = Server::where('uuid', 'c3183a04-7ea7-49df-a75e-5416712c3757')->first();
if ($server) {
    $repo = app(App\\Repositories\\Daemon\\DaemonServerRepository::class);
    $details = $repo->setServer($server)->getDetails();
    echo "Daemon Details Array:\n";
    echo json_encode($details, JSON_PRETTY_PRINT);
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/check_daemon.php\n${phpScript}\nPHPEOF\nphp /tmp/check_daemon.php`, (err, stream) => {
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
