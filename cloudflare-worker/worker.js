// Zenexcode AI Proxy — Cloudflare Worker
// Omija Cloudflare bot-detection (JA3) bo requesty idą z sieci CF.
// Deploy: wrangler deploy  (lub przez dash.cloudflare.com → Workers)

const AI_APIFLOW = 'https://aiapiflow.com';
const ZENMUX = 'https://zenmux.ai';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname + url.search;

    // Routing: /aiapiflow/* -> aiapiflow.com, /zenmux/* -> zenmux.ai, /v1/* -> aiapiflow (default)
    let targetBase = AI_APIFLOW;
    if (path.startsWith('/zenmux')) {
      targetBase = ZENMUX;
    }
    const targetPath = path.replace(/^\/(aiapiflow|zenmux)/, '');

    const targetUrl = targetBase + targetPath;

    // Przekaż wszystkie nagłówki + body
    const reqHeaders = new Headers(request.headers);
    reqHeaders.delete('host');
    reqHeaders.delete('cf-connecting-ip');
    reqHeaders.delete('cf-ray');
    reqHeaders.delete('cf-visitor');
    reqHeaders.delete('cf-worker');

    const init = {
      method: request.method,
      headers: reqHeaders,
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
    }

    try {
      const resp = await fetch(targetUrl, init);
      const respHeaders = new Headers(resp.headers);
      respHeaders.set('Access-Control-Allow-Origin', '*');
      respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      respHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: respHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Worker fetch failed', details: err.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
