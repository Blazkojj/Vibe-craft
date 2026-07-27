import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Ustawiam dostęp do Pelican Panel bezpośrednio przez IP...\n');

  const script = `
# Popraw Nginx vhost Pelicana tak aby reagował też na sam IP
cat > /etc/nginx/sites-available/pelican.conf << 'NGINXEOF'
server {
    listen 80;
    server_name panel.bytehost.online 54.37.138.23 pelican.zenexcode.pl _;

    root /var/www/pelican/public;
    index index.php;

    access_log /var/log/nginx/pelican_access.log;
    error_log  /var/log/nginx/pelican_error.log error;

    client_max_body_size 100M;
    client_body_timeout 300s;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }
}
NGINXEOF

# Wyłącz domyślny / catch-all nginx który przechwytywał port 80
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
ln -sf /etc/nginx/sites-available/pelican.conf /etc/nginx/sites-enabled/pelican.conf

# Zrestartuj Nginx
nginx -t && systemctl reload nginx

echo ""
echo "=== Sprawdzam odpowiedź na IP ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\\n" http://54.37.138.23/
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`[SSH] Zakończono z kodem: ${code}`);
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
