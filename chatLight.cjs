const fs = require('fs');
let css = fs.readFileSync('src/pages/Project.css', 'utf8');

// 1. Inject light mode variables into chat-panel and fix background
css = css.replace(/\.chat-panel\{[\s\S]*?(?=\/\* ─── HEADER ─── \*\/)/, 
`.chat-panel {
  --bg-card: #ffffff;
  --bg-surface: #f9fafb;
  --bg-elevated: #f3f4f6;
  --text: #111827;
  --text-muted: #374151;
  --text-dim: #6b7280;
  --border: #e5e7eb;
  --border-strong: #d1d5db;
  
  flex: 1; display: flex; flex-direction: column; height: 100%; position: relative;
  background: var(--bg-surface);
  border-radius: 20px; border: 1px solid var(--border);
  overflow: hidden; box-shadow: 0 10px 50px rgba(0,0,0,0.1);
}
`);

// 2. Fix header backgrounds
css = css.replace(/\.chat-header\{[\s\S]*?(?=\.chat-header-title\{)/, 
`.chat-header {
  flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 2rem; background: rgba(255,255,255,0.8);
  border-bottom: 1px solid var(--border); position: relative; z-index: 10;
  backdrop-filter: blur(10px);
}
`);

// 3. Fix bubbles backgrounds
css = css.replace(/\.chat-msg-body\{[\s\S]*?(?=\.chat-msg\.user \.chat-msg-body)/, 
`.chat-msg-body{
  color: var(--text); font-size: 0.95rem; line-height: 1.6;
  background: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 4px 20px 20px 20px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
`);

css = css.replace(/\.chat-msg\.user \.chat-msg-body\{[\s\S]*?(?=\/\* ─── TYPING INDICATOR ─── \*\/|\n\/\*)/, 
`.chat-msg.user .chat-msg-body{
  color: #fff; font-weight: 500;
  background: linear-gradient(135deg, #FF8C42, #FF5C00);
  border: none;
  border-radius: 20px 4px 20px 20px;
  box-shadow: 0 4px 15px rgba(255,107,0,0.2);
}
`);

// 4. Fix input area structure and layout (which was totally broken)
css = css.replace(/\.chat-input-area\{[\s\S]*?(?=\/\* ─── BUILD BAR ─── \*\/)/, 
`.chat-input-area{
  flex-shrink:0; padding: 1.5rem 2rem 1rem; background: transparent;
  display: flex; flex-direction: column; align-items: center; position: relative;
}
.chat-input-area::before {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 150px;
  background: linear-gradient(to top, var(--bg-surface) 30%, transparent); pointer-events: none; z-index: 0;
}
.chat-input-row{
  display:flex; align-items:flex-end; gap: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-strong);
  border-radius: 24px; padding: 0.75rem 0.75rem 0.75rem 1rem; width: 100%; max-width: 850px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05); z-index: 1;
}
.chat-textarea{
  flex:1; background:transparent; border:none; outline:none;
  color:var(--text); font-size:0.95rem; resize:none;
  line-height:1.5; min-height:24px; max-height:200px;
  padding: 0.25rem 0;
  font-family:var(--font);
}
.chat-textarea::placeholder{color:var(--text-dim)}
.chat-send-btn{
  width:36px; height:36px; border-radius:18px;
  background:var(--accent); color:#fff;
  display:flex; align-items:center; justify-content:center;
  border:none; cursor:pointer; flex-shrink:0;
  transition:all 0.2s;
}
.chat-send-btn:hover{transform:scale(1.05); background:var(--accent-dark);}
.chat-send-btn:disabled{opacity:0.5; transform:none; cursor:not-allowed; background:var(--bg-elevated); color:var(--text-dim);}
.chat-input-hint{
  margin-top: 0.75rem; font-family: var(--mono); font-size: 0.65rem;
  color: var(--text-dim); z-index: 1;
}
`);

fs.writeFileSync('src/pages/Project.css', css);
