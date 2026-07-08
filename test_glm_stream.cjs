const https = require('https');

const apiKey = 'sk-1c0c453891294f21eba4cac191464b2a0041e1a2ac2f31f0ecebe944b4692a80';
const url = 'https://zenmux.ai/api/v1/chat/completions';

const requestBody = JSON.stringify({
  model: 'z-ai/glm-5.2',
  messages: [
    { role: 'user', content: 'Say hello in 3 words' }
  ],
  stream: true,
  max_tokens: 100
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/event-stream, application/json'
  }
};

const req = https.request(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  res.on('data', (chunk) => {
    process.stdout.write(chunk.toString());
  });
  res.on('end', () => {
    console.log('\nStream ended.');
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(requestBody);
req.end();
