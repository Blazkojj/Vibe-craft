const fs = require('fs');
let css = fs.readFileSync('src/pages/Project.css', 'utf8');

css = css.replace(/\.chat-textarea\{[\s\S]*?(?=\.chat-textarea::placeholder)/, 
`.chat-textarea{
  flex:1; width: 100%; background:transparent; border:none; outline:none;
  color:var(--text); font-size:0.95rem; resize:none;
  line-height:1.5; min-height:24px; max-height:200px;
  padding: 0.25rem 0;
  font-family:var(--font);
}
`);

fs.writeFileSync('src/pages/Project.css', css);
