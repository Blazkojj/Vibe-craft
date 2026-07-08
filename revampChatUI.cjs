const fs = require('fs');

// 1. Update Project.css
let css = fs.readFileSync('src/pages/Project.css', 'utf8');

// Replace project layout to be a centered floating interface
css = css.replace(/\.project-layout\{display:flex;height:100vh;overflow:hidden\}/g, 
`.project-layout{display:flex;height:100vh;overflow:hidden;background:#050505;padding:1rem;gap:1rem;}`);

css = css.replace(/\.project-sidebar\{width:260px;flex-shrink:0;background:var\(--bg-surface\);border-right:1px solid var\(--border-strong\);[\s\S]*?\}/g, 
`.project-sidebar{width:260px;flex-shrink:0;background:rgba(20,20,20,0.6);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;border-radius:24px;overflow:hidden;}`);

css = css.replace(/\.project-main\{flex:1;min-width:0;display:flex;flex-direction:column;background:var\(--bg-card\)\}/g, 
`.project-main{flex:1;min-width:0;display:flex;flex-direction:column;background:transparent;}`);

css = css.replace(/\.chat-panel\{flex:1;display:flex;flex-direction:column;height:100%;position:relative\}/g, 
`.chat-panel{flex:1;display:flex;flex-direction:column;height:100%;position:relative;background:rgba(15,15,15,0.5);backdrop-filter:blur(20px);border-radius:24px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;}`);

// Redesign Chat Header
css = css.replace(/\.chat-header\{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:1rem 1\.75rem;border-bottom:1px solid var\(--border\);background:var\(--bg-card\);position:relative;z-index:10\}/g, 
`.chat-header{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.05);background:transparent;position:relative;z-index:10}`);

// Redesign Chat Input Area to be a floating pill
css = css.replace(/\.chat-input-area\{[\s\S]*?\}\.chat-input-row\{display:flex;align-items:flex-end;gap:0\.625rem\}/g, 
`.chat-input-area{
  flex-shrink:0;
  padding: 1rem 2rem 2rem;
  background: transparent;
  display: flex;
  justify-content: center;
}
.chat-input-row{
  display:flex;align-items:flex-end;gap:0.625rem;
  background: rgba(30,30,30,0.6);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 0.5rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}`);

css = css.replace(/\.chat-textarea\{[\s\S]*?\}/g, 
`.chat-textarea{
  flex:1;background:transparent;border:none;outline:none;
  color:var(--text);font-size:0.95rem;resize:none;
  line-height:1.5;min-height:24px;max-height:200px;
  padding: 0.5rem 0.75rem;
  font-family:var(--font);
}`);

css = css.replace(/\.chat-send-btn\{[\s\S]*?\}/g, 
`.chat-send-btn{
  width:40px;height:40px;border-radius:20px;
  background:var(--accent);color:#000;
  display:flex;align-items:center;justify-content:center;
  border:none;cursor:pointer;flex-shrink:0;
  transition:all 0.2s;
}
.chat-send-btn:hover{transform:scale(1.05);background:var(--accent-dark);}
.chat-send-btn:disabled{opacity:0.5;transform:none;cursor:not-allowed;background:rgba(255,255,255,0.1);color:var(--text-dim);}`);

fs.writeFileSync('src/pages/Project.css', css);

// 2. Update Project.jsx to fix UI
let jsx = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// Change the "Send" button icon to use an arrow up (like iOS) or something cleaner
jsx = jsx.replace(/<Send size=\{15\}\/>/g, '<ArrowRight size={18}/>');

fs.writeFileSync('src/pages/Project.jsx', jsx);
