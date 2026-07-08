const https = require('https');

const newKey = 'sk-cfd29d1c3726ab71a4721d7d7da92d365686db3928116cc9b3c009ff835ef2d7';

function testEndpoint(hostname, path, model) {
  return new Promise((resolve) => {
    const requestBody = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Say Hello' }],
      stream: false,
      max_tokens: 10
    });

    const options = {
      hostname: hostname,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newKey}`,
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.write(requestBody);
    req.end();
  });
}

testEndpoint('aiapiflow.com', '/v1/chat/completions', 'claude-sonnet-4-6').then(res => {
  console.log('Test result for new key:', res);
});
