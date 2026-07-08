const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `curl-impersonate-chrome -v -s -X POST https://aiapiflow.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \\
  -H "Accept: text/event-stream, application/json" \\
  -H "Accept-Language: en-US,en;q=0.9" \\
  -d '{"model": "claude-sonnet-4-6", "messages": [{"role": "user", "content": "hi"}], "stream": false}'`;
  conn.exec(cmd, (err, stream) => {
    stream.on('close', () => conn.end());
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
  });
}).connect({host: '54.37.138.23', port: 22, username: 'root', password: 'Blazej0112'});
