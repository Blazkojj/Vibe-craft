import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Ustawianie allowed_origins w /etc/pelican/config.yml...\n');

  const phpScript = `<?php
$content = file_get_contents('/etc/pelican/config.yml');
$content = preg_replace('/allowed_origins:.*/', 'allowed_origins: ["*"]', $content);
file_put_contents('/etc/pelican/config.yml', $content);
echo "Updated config.yml successfully!\n";
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/fix_yml.php\n${phpScript}\nPHPEOF\nphp /tmp/fix_yml.php && systemctl restart wings`, (err, stream) => {
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
