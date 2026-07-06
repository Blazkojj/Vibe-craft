const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

code = code.replace(/apiModel \|\| 'gemini-2\.0-flash'/g, 'projectData.model');
code = code.replace(/apiModel/g, 'projectData.model');

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Patched apiModel usage in Project.jsx');
