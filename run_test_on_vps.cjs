const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('[SSH] Connected to VPS. Creating temporary test script...');
  
  const testScriptContent = `
const fs = require('fs');
const https = require('https');

function parseEnv(content) {
  const config = {};
  content.split('\\n').forEach(line => {
    if (!line.trim() || line.startsWith('#')) return;
    const parts = line.split('=');
    if (parts.length >= 2) {
      config[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  });
  return config;
}

const envPath = '/var/www/zenexcode/.env';
const envLocalPath = '/var/www/zenexcode/.env.local';

let config = {};
if (fs.existsSync(envPath)) config = {...config, ...parseEnv(fs.readFileSync(envPath, 'utf8'))};
if (fs.existsSync(envLocalPath)) config = {...config, ...parseEnv(fs.readFileSync(envLocalPath, 'utf8'))};

const apiKey = config.ZENMUX_API_KEY;
console.log('Using API key: ' + apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 8));

const requestBody = JSON.stringify({
  model: 'z-ai/glm-5.2',
  messages: [{ role: 'user', content: 'Say hello in 3 words' }],
  stream: false,
  max_tokens: 20
});

const options = {
  hostname: 'zenmux.ai',
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey,
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => { console.error('Error:', e); });
req.write(requestBody);
req.end();
  `;

  // Write content to a file on VPS and execute it
  conn.exec(`cat << 'EOF' > /tmp/test_zenmux_on_vps.js\n${testScriptContent}\nEOF\nnode /tmp/test_zenmux_on_vps.js\nrm /tmp/test_zenmux_on_vps.js`, (err, stream) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    stream.on('close', (code) => {
      conn.end();
      process.exit(code);
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112'
});
