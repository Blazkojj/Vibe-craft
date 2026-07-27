import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Testowanie wariantu autoryzacji w Wings...\n');

  const phpScript = `<?php
$uuid = 'c3183a04-7ea7-49df-a75e-5416712c3757';
$token_id = 'G5vx8253KC7axvIk';
$token = '1rgdPheiFrmObJeUTdEUkcUtYnqyVXrxstOABt23wcrULYsIBfY2xfRAsT2OGqIx';

$tests = [
    "Bearer {$token}",
    "Bearer {$token_id}.{$token}",
    "Bearer {$token_id}:{$token}",
];

foreach ($tests as $t) {
    $ch = curl_init("http://127.0.0.1:8080/api/servers/{$uuid}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: {$t}", "Accept: application/json"]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "Test [{$t}]: HTTP Code {$code} -> {$resp}\n";
}
`;

  conn.exec(`cat << 'PHPEOF' > /tmp/test_tokens.php\n${phpScript}\nPHPEOF\nphp /tmp/test_tokens.php`, (err, stream) => {
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
