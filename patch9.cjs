const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// 1. Add HTML content type check
const contentTypeCheck = `    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error("Błąd: Serwer zwrócił HTML zamiast strumienia danych. Oznacza to, że uruchomiłeś zbudowaną aplikację (build) bez serwera API. Aby czat przez proxy działał, musisz używać 'npm run dev' (który włącza proxy z vite.config.js) lub posiadać osobny serwer backendowy.");
    }
    
    const reader = response.body.getReader();`;

code = code.replace(
  'const reader = response.body.getReader();',
  contentTypeCheck
);

// 2. Add raw JSON error check and throw parsed errors
const errorCheck = `      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
        try {
          const rawParsed = JSON.parse(trimmedLine);
          if (rawParsed.error) {
            throw new Error(rawParsed.error.message || JSON.stringify(rawParsed.error));
          }
        } catch(e) {
          if (e.message && e.message.includes('API Error') === false && !e.message.includes('Unexpected token')) {
             throw e; // Throw actual API errors
          }
        }
      }
      
      if (!trimmedLine.startsWith('data:')) continue;`;

code = code.replace(
  /const trimmedLine = line\.trim\(\);\s*if \(!trimmedLine\.startsWith\('data:'\)\) continue;/,
  errorCheck
);

// 3. Throw if stream error inside parsed data
const streamErrorCheck = `try {
        const parsed = JSON.parse(dataStr);
        if (parsed.error) {
          throw new Error(parsed.error.message || JSON.stringify(parsed.error));
        }`;

code = code.replace(
  'try {\n        const parsed = JSON.parse(dataStr);',
  streamErrorCheck
);
// Also cover case where formatting might be different
code = code.replace(
  'try { const parsed = JSON.parse(dataStr);',
  streamErrorCheck
);

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx updated with better error handling for empty streams');
