const https = require('https');

const apiKey = 'sk-1c0c453891294f21eba4cac191464b2a0041e1a2ac2f31f0ecebe944b4692a80';
const url = 'https://zenmux.ai/api/v1/chat/completions';

const modelsToTest = [
  'z-ai/glm-5.2',
  'z-ai/glm-5',
  'anthropic/claude-sonnet-5-free',
  'google/gemini-3.5-flash',
  'deepseek/deepseek-chat'
];

async function testModel(model) {
  return new Promise((resolve) => {
    const requestBody = JSON.stringify({
      model: model,
      messages: [
        { role: 'user', content: 'Hi' }
      ],
      stream: false,
      max_tokens: 10
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c.toString(); });
      res.on('end', () => {
        resolve({ model, status: res.statusCode, response: data });
      });
    });

    req.on('error', (e) => {
      resolve({ model, error: e.message });
    });

    req.write(requestBody);
    req.end();
  });
}

async function run() {
  for (const model of modelsToTest) {
    const res = await testModel(model);
    console.log(`Model: ${res.model}`);
    if (res.error) {
      console.log(`  Error: ${res.error}`);
    } else {
      console.log(`  Status: ${res.status}`);
      console.log(`  Response: ${res.response}`);
    }
  }
}

run();
