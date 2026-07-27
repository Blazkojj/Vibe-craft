import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Tworzenie Egg Paper 1.21.4 w Pelicanie...\n');

  const phpContent = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

use App\\Models\\Node;
use App\\Models\\Allocation;
use App\\Models\\Egg;
use App\\Models\\Server;
use App\\Models\\User;
use App\\Models\\EggVariable;
use Illuminate\\Support\\Str;

$node = Node::first();
$alloc = Allocation::first();
$user = User::where('email', 'admin@bytehost.online')->first();

// 1. Stwórz Egg Paper dla Minecraft 1.21.4
$egg = Egg::where('name', 'Paper (1.21.4)')->first();
if (!$egg) {
    echo "Creating Paper 1.21.4 Egg...\n";
    $egg = new Egg();
    $egg->uuid = (string) Str::uuid();
    $egg->author = 'support@bytehost.online';
    $egg->name = 'Paper (1.21.4)';
    $egg->description = 'High performance Minecraft server software (Paper 1.21.4)';
    $egg->docker_images = json_encode([
        'ghcr.io/pterodactyl/yolks:java_21' => 'Java 21 (Paper 1.21.4)',
    ]);
    $egg->startup_commands = json_encode(['java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}} --nogui']);
    $egg->config_stop = 'stop';
    $egg->config_startup = json_encode(['done' => 'Done']);
    $egg->config_logs = json_encode([]);
    $egg->config_files = json_encode([]);
    $egg->script_container = 'ghcr.io/pterodactyl/yolks:java_21';
    $egg->script_entry = 'bash';
    $egg->script_is_privileged = 1;
    $egg->script_install = <<<'BASH'
#!/bin/bash
# Download Paper 1.21.4
PROJECT="paper"
MINECRAFT_VERSION="1.21.4"

LATEST_BUILD=$(curl -s https://api.papermc.io/v2/projects/\${PROJECT}/versions/\${MINECRAFT_VERSION}/builds | jq -r '.builds[-1].build')
if [ "\$LATEST_BUILD" = "null" ] || [ -z "\$LATEST_BUILD" ]; then
  LATEST_BUILD="latest"
fi

JAR_NAME="\${PROJECT}-\${MINECRAFT_VERSION}-\${LATEST_BUILD}.jar"
DOWNLOAD_URL="https://api.papermc.io/v2/projects/\${PROJECT}/versions/\${MINECRAFT_VERSION}/builds/\${LATEST_BUILD}/downloads/\${JAR_NAME}"

echo "Downloading Paper 1.21.4 Build \${LATEST_BUILD}..."
curl -o server.jar -sSL "\${DOWNLOAD_URL}"

if [ ! -f "eula.txt" ]; then
  echo "eula=true" > eula.txt
fi

echo "Installation complete!"
BASH;
    $egg->save();
}

echo "Egg ID: {$egg->id}, Name: {$egg->name}\n";

// 2. Stwórz Variable SERVER_JARFILE
$var = EggVariable::where('egg_id', $egg->id)->where('env_variable', 'SERVER_JARFILE')->first();
if (!$var) {
    $var = new EggVariable();
    $var->egg_id = $egg->id;
    $var->name = 'Server Jar File';
    $var->description = 'Nazwa pliku jar';
    $var->env_variable = 'SERVER_JARFILE';
    $var->default_value = 'server.jar';
    $var->user_viewable = 1;
    $var->user_editable = 1;
    $var->rules = 'required|string';
    $var->sort = 1;
    $var->save();
}

// 3. Stwórz serwer Minecraft
$server = Server::where('name', 'LIKE', '%Minecraft%')->first();
if (!$server) {
    echo "Creating Minecraft 1.21.4 Paper Server...\n";
    $server = new Server();
    $server->uuid = (string) Str::uuid();
    $server->uuid_short = substr(str_replace('-', '', $server->uuid), 0, 8);
    $server->node_id = $node->id;
    $server->name = 'Minecraft 1.21.4 (Paper)';
    $server->description = 'Serwer Minecraft 1.21.4 Paper';
    $server->owner_id = $user->id;
    $server->egg_id = $egg->id;
    $server->allocation_id = $alloc->id;
    $server->memory = 2048;
    $server->swap = 0;
    $server->disk = 10000;
    $server->io = 500;
    $server->cpu = 200;
    $server->oom_killer = 0;
    $server->startup = 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}} --nogui';
    $server->image = 'ghcr.io/pterodactyl/yolks:java_21';
    $server->installed_at = now();
    $server->save();
    echo "🎉 SERVER CREATED SUCCESSFULLY! ID: {$server->id}, UUID: {$server->uuid}\n";
} else {
    echo "Server already exists! Name: {$server->name}\n";
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/setup_paper.php\n${phpContent}\nPHPEOF\nphp /tmp/setup_paper.php && systemctl restart wings`, (err, stream) => {
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
