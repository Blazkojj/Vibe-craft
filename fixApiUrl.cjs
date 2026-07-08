const fs = require('fs');
let jsx = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// Replace local API route with Cloudflare Worker route
jsx = jsx.replace(/const url = '\/api\/chat';/, "const url = 'https://api.zenexcode.pl/api/chat';");

fs.writeFileSync('src/pages/Project.jsx', jsx);
