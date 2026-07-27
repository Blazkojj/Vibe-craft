import { NodeSSH } from 'node-ssh';

async function searchPelican() {
  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: '54.37.138.23',
      username: 'root',
      privateKeyPath: 'C:\\Users\\Blazkoj\\.ssh\\id_rsa'
    });

    console.log('[SSH] Searching in_array in /var/www/pelican...');
    const res = await ssh.execCommand('grep -rn "in_array" /var/www/pelican/app/ /var/www/pelican/resources/');
    console.log('Result length:', res.stdout.length);
    console.log('Grep stdout:\n', res.stdout.substring(0, 3000));
    console.log('Grep stderr:\n', res.stderr);

    ssh.dispose();
  } catch (err) {
    console.error('Error:', err);
  }
}

searchPelican();
