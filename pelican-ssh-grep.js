const { execSync } = require('child_process');

try {
  console.log('[SSH] Executing grep for in_array on Pelican Panel...');
  const out = execSync(`ssh -i C:\\Users\\Blazkoj\\.ssh\\id_rsa root@54.37.138.23 "grep -rn 'in_array' /var/www/pelican/app/ /var/www/pelican/resources/"`, { encoding: 'utf-8' });
  console.log('Matches:\n', out.substring(0, 4000));
} catch (e) {
  console.error('Stderr/Error:', e.stderr || e.message);
  if (e.stdout) console.log('Stdout:\n', e.stdout.substring(0, 4000));
}
