const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

const regex = /if \(\!import\.meta\.env\.VITE_GEMINI_API_KEY\) \{[\s\S]*?\}/;
code = code.replace(regex, '// API check removed');

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
