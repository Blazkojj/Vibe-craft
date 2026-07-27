const { execSync } = require('child_process');

try {
  console.log('[SSH] Fetching recent Pelican logs...');
  const out = execSync(`ssh -i C:\\Users\\Blazkoj\\.ssh\\id_rsa -o StrictHostKeyChecking=no root@54.37.138.23 "tail -n 100 /var/www/pelican/storage/logs/laravel-*.log"`, { encoding: 'utf-8' });
  console.log('Log snippet:\n', out.substring(out.length - 4000));
} catch (e) {
  console.error('Stderr/Error:', e.stderr || e.message);
  if (e.stdout) console.log('Stdout:\n', e.stdout.substring(e.stdout.length - 4000));
}
