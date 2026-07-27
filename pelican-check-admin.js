import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const phpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\User;
use App\\Models\\Role;

$user = User::where('email', 'admin@bytehost.online')->first();
if (!$user) {
    echo "User not found, creating...\n";
    $service = app(App\\Services\\Users\\UserCreationService::class);
    $user = $service->handle([
        'email' => 'admin@bytehost.online',
        'username' => 'admin',
        'password' => 'ByteHostAdmin2027!',
        'root_admin' => true,
    ]);
} else {
    echo "User found, assigning Root Admin role...\n";
    $role = Role::where('name', Role::ROOT_ADMIN)->first();
    if ($role) {
        $user->roles()->sync([$role->id]);
    }
}

echo "Is root admin: " . ($user->isRootAdmin() ? 'YES' : 'NO') . "\n";
echo "Roles count: " . $user->roles()->count() . "\n";
`;

  conn.exec(`cat > /tmp/make_admin.php << 'EOF'\n${phpScript}\nEOF\nphp /tmp/make_admin.php`, (err, stream) => {
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
