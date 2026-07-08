const fs = require('fs');

let css = fs.readFileSync('src/pages/Project.css', 'utf8');

// Replace standard msg background
css = css.replace(/\.chat-msg:hover\{background:rgba\(255,255,255,0\.012\)\}\r?\n\.chat-msg\.user\{\r?\n\s*background:linear-gradient\(90deg,rgba\(255,107,0,0\.025\),transparent 70%\);\r?\n\s*border-left:2px solid var\(--accent-border\);\r?\n\s*padding-left:calc\(1\.75rem - 2px\);\r?\n\}/g,
`.chat-msg.user{
  flex-direction: row-reverse;
}`);

// Replace msg content
css = css.replace(/\/\* ─── MESSAGE CONTENT ─── \*\/\r?\n\.chat-msg-content\{flex:1;min-width:0;max-width:calc\(100% - 42px\)\}\r?\n\.chat-msg-meta\{\r?\n\s*display:flex;align-items:baseline;gap:0\.5rem;\r?\n\s*margin-bottom:0\.5rem;\r?\n\}\r?\n\.chat-msg-name\{\r?\n\s*font-size:0\.8rem;font-weight:700;color:var\(--text\);\r?\n\}\r?\n\.chat-msg-time\{\r?\n\s*font-size:0\.65rem;color:var\(--text-dim\);font-family:var\(--mono\);\r?\n\}\r?\n\.chat-msg-body\{\r?\n\s*color:var\(--text-muted\);\r?\n\s*font-size:0\.8875rem;line-height:1\.78;\r?\n\}\r?\n\.chat-msg\.user \.chat-msg-body\{color:var\(--text\)\}/g,
`/* ─── MESSAGE CONTENT ─── */
.chat-msg-content{
  display: flex; flex-direction: column; max-width: 80%;
}
.chat-msg.user .chat-msg-content{
  align-items: flex-end;
}
.chat-msg-meta{
  display:flex;align-items:baseline;gap:0.5rem;
  margin-bottom:0.25rem;
}
.chat-msg.user .chat-msg-meta{
  flex-direction: row-reverse;
}
.chat-msg-name{
  font-size:0.8rem;font-weight:700;color:var(--text);
}
.chat-msg-time{
  font-size:0.65rem;color:var(--text-dim);font-family:var(--mono);
}
.chat-msg-body{
  color:var(--text-muted);
  font-size:0.8875rem;line-height:1.78;
  background: rgba(255,255,255,0.03);
  padding: 0.8rem 1.25rem;
  border-radius: 18px 18px 18px 4px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.chat-msg.user .chat-msg-body{
  color:#000;
  background: var(--accent);
  border-color: var(--accent-border);
  border-radius: 18px 18px 4px 18px;
}`);

fs.writeFileSync('src/pages/Project.css', css);
