const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// Replace apiModel usage in fetch calls and remove apiModel definition
code = code.replace(/const apiModel = isClaudeModel\(projectData\.model\) \? 'z-ai\/glm-5\.2' : projectData\.model;/g, '');
code = code.replace(/model: apiModel/g, 'model: projectData.model');

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Successfully patched Project.jsx to send raw model');
