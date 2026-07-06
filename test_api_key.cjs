const https = require('https');

const options = {
  hostname: 'zenmux.ai',
  path: '/api/v1/models',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sk-1c0c453891294f21eba4cac191464b2a0041e1a2ac2f31f0ecebe944b4692a80'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Models available:', parsed.data ? parsed.data.map(m => m.id).join(', ') : parsed);
    } catch(e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
