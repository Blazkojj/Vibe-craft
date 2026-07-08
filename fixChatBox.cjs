const fs = require('fs');
let css = fs.readFileSync('src/pages/Project.css', 'utf8');

if (!css.includes('.chat-input-box')) {
  css += '\n.chat-input-box { flex: 1; display: flex; align-items: stretch; height: 100%; }\n';
  fs.writeFileSync('src/pages/Project.css', css);
}
