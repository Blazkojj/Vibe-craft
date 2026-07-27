const { execSync } = require('child_process');

try {
  console.log('[SSH] Fetching recent Pelican logs with id_ed25519...');
  const out = execSync(`ssh -i C:\\Users\\Blazkoj\\.ssh\\id_ed25519 -o StrictHostKeyChecking=no -o BatchMode=yes root@54.37.138.23 "tail -n 120 /var/www/pelican/storage/logs/laravel-\$(date +%Y-%m-%d).log"`, { encoding: 'utf-8' });
  console.log('Log snippet:\n', out);
} catch (e) {
  console.error('Stderr/Error:', e.stderr || e.message);
  if (e.stdout) console.log('Stdout:\n', e.stdout);
}
