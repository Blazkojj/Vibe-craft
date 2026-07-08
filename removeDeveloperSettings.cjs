const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

// Remove nav item
code = code.replace(/<button className=\{\`settings-nav-item\$\{activeTab==='developer'\?' active':''\}\`} onClick=\{[^}]+\}>\s*<Zap size=\{14\}\/> <span>\{isEN \? 'API Keys' : 'Klucze API'\}<\/span>\s*<\/button>/g, '');

// Remove the developer block
// We'll use a regex to match {activeTab === 'developer' && ( ... )} safely or string split
const developerBlockRegex = /\{activeTab === 'developer' && \([\s\S]*?\}\)\}/;
code = code.replace(developerBlockRegex, '');

fs.writeFileSync('src/pages/Settings.jsx', code);
