const fs = require('fs');
let viteConfig = fs.readFileSync('vite.config.js', 'utf8');

// Catch 502/503 errors in the first chunk
viteConfig = viteConfig.replace(
  /if \(buf\.trimStart\(\)\.startsWith\('<!DOCTYPE'\) \|\| buf\.trimStart\(\)\.startsWith\('<html'\)\) \{/,
  `if (buf.trimStart().startsWith('<!DOCTYPE') || buf.trimStart().startsWith('<html') || buf.includes('503 Service Unavailable') || buf.includes('502 Bad Gateway') || buf.includes('504 Gateway Time-out') || buf.includes('403 Forbidden')) {`
);

fs.writeFileSync('vite.config.js', viteConfig);
