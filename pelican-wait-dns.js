import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Czekam na pełną propagację DNS w home.pl i uruchamiam Certbot...\n');

  const script = `
for i in {1..30}; do
  IP1=$(dig +short panel.bytehost.online @ns1.emailverification.info | tail -1)
  IP8=$(dig +short panel.bytehost.online @8.8.8.8 | tail -1)
  echo "[$i/30] NS1: $IP1 | Google 8.8.8.8: $IP8"
  
  if [ "$IP1" = "54.37.138.23" ] && [ "$IP8" = "54.37.138.23" ]; then
    echo "✅ DNS w pełni spropagowany do 54.37.138.23!"
    echo "Generowanie SSL..."
    certbot --nginx -d panel.bytehost.online --non-interactive --agree-tos -m admin@bytehost.online --redirect
    nginx -t && systemctl reload nginx
    echo "🎉 SSL WYSTAWIONY POMYŚLNIE!"
    exit 0
  fi
  sleep 10
done

echo "DNS jeszcze w trakcie propagacji. Spróbuj ponownie za chwilę."
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`[SSH] Proces zakończony (kod: ${code})`);
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
