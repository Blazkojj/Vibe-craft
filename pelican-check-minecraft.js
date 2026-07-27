import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Sprawdzam Wings, Docker, Eggs i Nodes w Pelican...\n');

  const script = `
echo "=== 1. Sprawdzam czy Docker jest zainstalowany ==="
docker --version 2>&1 || echo "Brak Docker"

echo ""
echo "=== 2. Sprawdzam czy Wings jest zainstalowany ==="
wings --version 2>&1 || echo "Brak Wings"

echo ""
echo "=== 3. Sprawdzam istniejące Eggs w Pelicanie ==="
cd /var/www/pelican
php artisan tinker --execute="
use App\\Models\\Egg;
use App\\Models\\Node;
use App\\Models\\Allocation;
echo 'Eggs count: ' . Egg::count() . PHP_EOL;
Egg::all()->each(fn(\$e) => print(\$e->id . ': ' . \$e->name . PHP_EOL));
echo 'Nodes count: ' . Node::count() . PHP_EOL;
Node::all()->each(fn(\$n) => print(\$n->id . ': ' . \$n->name . ' (' . \$n->fqdn . ')' . PHP_EOL));
" 2>&1 || echo "Tinker error"
`;

  conn.exec(script, (err, stream) => {
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
