import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Tworzę admina bezpośrednio przez SQL...\n');

  const script = `
set -e
cd /var/www/pelican

# Wygeneruj hash hasła przez PHP
HASH=$(php -r "echo password_hash('ByteHostAdmin2027!', PASSWORD_BCRYPT, ['cost'=>10]);")
UUID=$(cat /proc/sys/kernel/random/uuid)
echo "Hash wygenerowany."

# Wstaw admina do bazy danych
mysql -u root pelican -e "
INSERT IGNORE INTO users (uuid, name_first, name_last, email, username, password, root_admin, use_totp, language, created_at, updated_at)
VALUES ('$UUID', 'Admin', 'ByteHost', 'admin@bytehost.online', 'admin', '$HASH', 1, 0, 'en', NOW(), NOW());
"

echo ""
echo "=== Sprawdzam admina w bazie ==="
mysql -u root pelican -e "SELECT id, email, username, root_admin FROM users WHERE email='admin@bytehost.online';"
echo ""
echo "✅ Admin stworzony!"
echo "Email:    admin@bytehost.online"
echo "Hasło:    ByteHostAdmin2027!"
echo "URL:      http://panel.bytehost.online (SSL po propagacji DNS)"
`;

  conn.exec(script, (err, stream) => {
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
