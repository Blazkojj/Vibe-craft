const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');
code = code.split("projectData.model || 'gemini-2.0-flash'").join("apiModel || 'gemini-2.0-flash'");
fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
