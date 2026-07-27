import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const script = `
cd /var/www/pelican

HASH=$(php -r "echo password_hash('ByteHostAdmin2027!', PASSWORD_BCRYPT, ['cost'=>10]);")
UUID=$(cat /proc/sys/kernel/random/uuid)

# Wstaw usera - dokładne kolumny z DESCRIBE
mysql -u root pelican -e "
  INSERT IGNORE INTO users (uuid, email, username, password, language, timezone, is_managed_externally, mfa_email_enabled, created_at, updated_at)
  VALUES ('$UUID', 'admin@bytehost.online', 'admin', '$HASH', 'en', 'UTC', 0, 0, NOW(), NOW());
"

USER_ID=$(mysql -u root pelican -sN -e "SELECT id FROM users WHERE email='admin@bytehost.online' LIMIT 1;")
echo "User ID: $USER_ID"

# Przypisz rolę Root Admin (id=1)
mysql -u root pelican -e "
  INSERT IGNORE INTO model_has_roles (role_id, model_type, model_id)
  VALUES (1, 'App\\\\Models\\\\User', $USER_ID);
"

echo ""
echo "=== Użytkownik w bazie ==="
mysql -u root pelican -e "SELECT id, email, username, language FROM users WHERE email='admin@bytehost.online';"
echo ""
echo "=== Rola użytkownika ==="
mysql -u root pelican -e "SELECT u.email, r.name as role FROM users u JOIN model_has_roles mhr ON mhr.model_id=u.id JOIN roles r ON r.id=mhr.role_id WHERE u.email='admin@bytehost.online';"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ PELICAN PANEL GOTOWY DO UŻYCIA!                  ║"
echo "║                                                      ║"
echo "║  URL:      http://panel.bytehost.online              ║"
echo "║  (HTTPS po propagacji DNS ~15-30 min)                ║"
echo "║                                                      ║"
echo "║  Konto admina:                                       ║"
echo "║  Login:    admin@bytehost.online                     ║"
echo "║  Hasło:    ByteHostAdmin2027!                        ║"
echo "║  Rola:     Root Admin                                ║"
echo "╚══════════════════════════════════════════════════════╝"
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`Zakończono: ${code}`);
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
