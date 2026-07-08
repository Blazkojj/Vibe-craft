const fs = require('fs');

let css = fs.readFileSync('src/pages/Project.css', 'utf8');

// 1. Redesign layout to a split pane that is brighter
css = css.replace(/\.project-layout\{[\s\S]*?\}/, 
`.project-layout{
  display:flex; height:100vh; overflow:hidden;
  background: #000; padding: 1.5rem; gap: 1.5rem;
  font-family: var(--font);
}`);

css = css.replace(/\.project-sidebar\{[\s\S]*?\}/, 
`.project-sidebar{
  width:280px; flex-shrink:0; background: rgba(255,255,255,0.03);
  backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.08);
  display:flex; flex-direction:column; border-radius: 20px; overflow:hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}`);

css = css.replace(/\.chat-panel\{[\s\S]*?\}/, 
`.chat-panel{
  flex:1; display:flex; flex-direction:column; height:100%; position:relative;
  background: #111111; /* Brighter dark background */
  border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
  overflow:hidden; box-shadow: 0 10px 50px rgba(0,0,0,0.6);
}`);

// Redesign Chat Header
css = css.replace(/\.chat-header\{[\s\S]*?\}/, 
`.chat-header{
  flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
  padding: 1.25rem 2rem; background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.08); position:relative; z-index:10;
  backdrop-filter: blur(10px);
}`);

// Chat Messages Bubbles
css = css.replace(/\.chat-msg-body\{[\s\S]*?(?=\.chat-msg\.user \.chat-msg-body)/, 
`.chat-msg-body{
  color: #E2E8F0; font-size: 0.95rem; line-height: 1.6;
  background: #1E293B; /* Brighter message bubble for AI */
  padding: 1rem 1.5rem;
  border-radius: 4px 20px 20px 20px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
`);

css = css.replace(/\.chat-msg\.user \.chat-msg-body\{[\s\S]*?(?=\/\* ─── TYPING INDICATOR ─── \*\/|\n\/\*)/, 
`.chat-msg.user .chat-msg-body{
  color: #000; font-weight: 500;
  background: linear-gradient(135deg, #FF8C42, #FF5C00); /* Much brighter user bubble */
  border: none;
  border-radius: 20px 4px 20px 20px;
  box-shadow: 0 4px 20px rgba(255,107,0,0.3);
}
`);

// Redesign Chat Input Area to a modern bright floating box
css = css.replace(/\.chat-input-area\{[\s\S]*?(?=\.chat-textarea\{)/, 
`.chat-input-area{
  flex-shrink:0; padding: 1.5rem 2rem; background: transparent;
  display: flex; justify-content: center; position: relative;
}
.chat-input-area::before {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 150px;
  background: linear-gradient(to top, #111111 20%, transparent); pointer-events: none; z-index: 0;
}
.chat-input-row{
  display:flex; align-items:flex-end; gap: 0.75rem;
  background: #1E1E1E; /* Brighter input row */
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px; padding: 0.75rem; width: 100%; max-width: 850px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5); z-index: 1;
}
`);

fs.writeFileSync('src/pages/Project.css', css);
