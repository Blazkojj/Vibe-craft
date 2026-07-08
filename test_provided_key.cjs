const https = require('https');

const apiKey = 'sk-cfd29d1c3726ab71d4721d7d7da92d365686db3928116cc9b3c009ff835ef2d7';

function testEndpoint(hostname, path, model) {
  return new Promise((resolve) => {
    const requestBody = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Say OK' }],
      stream: false,
      max_tokens: 10
    });

    const options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ hostname, model, status: res.statusCode, response: data });
      });
    });

    req.on('error', (e) => {
      resolve({ hostname, model, error: e.message });
    });

    req.write(requestBody);
    req.end();
  });
}

async function run() {
  console.log('Testing AIAPIFlow Claude 4.6...');
  const res1 = await testEndpoint('aiapiflow.com', '/v1/chat/completions', 'claude-sonnet-4-6');
  console.log('Claude 4.6:', res1);

  console.log('\nTesting AIAPIFlow Claude 5...');
  const res2 = await testEndpoint('aiapiflow.com', '/v1/chat/completions', 'claude-sonnet-5');
  console.log('Claude 5:', res2);

  console.log('\nTesting AIAPIFlow Claude Haiku 4.5...');
  const res3 = await testEndpoint('aiapiflow.com', '/v1/chat/completions', 'claude-haiku-4-5-20251001');
  console.log('Claude Haiku 4.5:', res3);

  console.log('\nTesting AIAPIFlow Claude Opus 4.8...');
  const res4 = await testEndpoint('aiapiflow.com', '/v1/chat/completions', 'claude-opus-4-8');
  console.log('Claude Opus 4.8:', res4);
}

run();
