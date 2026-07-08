const fs = require('fs');
let css = fs.readFileSync('src/pages/Project.css', 'utf8');

// Tone down User Bubble to standard chat app look
css = css.replace(/background: linear-gradient\(135deg, #FF8C42, #FF5C00\);/, 'background: #383A40;');
css = css.replace(/box-shadow: 0 4px 15px rgba\(255,107,0,0\.2\);/, 'box-shadow: 0 4px 15px rgba(0,0,0,0.15);');

// Make the send button a more subdued blue or gray instead of vibrant orange, or just keep it orange but less glowy
css = css.replace(/\.chat-send-btn\{[\s\S]*?(?=\.chat-send-btn:hover)/, 
`.chat-send-btn{
  width:36px; height:36px; border-radius:18px;
  background: #5865F2; color:#fff;
  display:flex; align-items:center; justify-content:center;
  border:none; cursor:pointer; flex-shrink:0;
  transition:all 0.2s;
}
`);
css = css.replace(/background:var\(--accent-dark\);box-shadow:0 4px 18px rgba\(255,107,0,0\.45\)/g, 'background:#4752C4;box-shadow:0 4px 18px rgba(88,101,242,0.3)');

fs.writeFileSync('src/pages/Project.css', css);

// Also remove some AI wording in Project.jsx
let jsx = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// Replace "AI generuje..." with "Pisze..."
jsx = jsx.replace(/"AI is generating\.\.\." : "AI generuje\.\.\."/g, '"Typing..." : "Pisze..."');

// Remove Sparkles from the main chat if possible, but maybe leave it since they removed it.

fs.writeFileSync('src/pages/Project.jsx', jsx);
