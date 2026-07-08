const fs = require('fs');
let jsx = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// Revert the URL back to local Vite middleware
jsx = jsx.replace(/const url = 'https:\/\/api\.zenexcode\.pl\/api\/chat';/, "const url = '/api/chat';");

fs.writeFileSync('src/pages/Project.jsx', jsx);
