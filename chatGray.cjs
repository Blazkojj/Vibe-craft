const fs = require('fs');
let css = fs.readFileSync('src/pages/Project.css', 'utf8');

// 1. Replace the CSS variables block in .chat-panel
css = css.replace(/\.chat-panel\s*\{\s*--bg-card: #ffffff;[\s\S]*?(?=flex: 1;)/, 
`.chat-panel {
  --bg-card: #2B2D31;
  --bg-surface: #313338;
  --bg-elevated: #232428;
  --text: #F2F3F5;
  --text-muted: #B5BAC1;
  --text-dim: #949BA4;
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.12);
  
  `);

// 2. Change the chat-header background
css = css.replace(/background: rgba\(255,255,255,0\.8\);/, 'background: rgba(43,45,49,0.85);');

// 3. Change AI bubble background
css = css.replace(/background: #ffffff;(?=\s*padding: 1rem 1\.5rem;)/, 'background: #2B2D31;');

// 4. Update the linear-gradient for the input area shadow
css = css.replace(/background: linear-gradient\(to top, var\(--bg-surface\) 30%, transparent\);/, 'background: linear-gradient(to top, var(--bg-surface) 30%, transparent);');

fs.writeFileSync('src/pages/Project.css', css);
