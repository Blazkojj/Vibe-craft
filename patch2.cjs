const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// 1. Fix the header background to remove the faulty var(--claude-bg)
code = code.replace(
  "style={{ padding: '0.75rem 1.5rem', background: 'var(--claude-bg)', borderBottom: '1px solid var(--claude-border)' }}",
  "style={{ padding: '0.75rem 1.5rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.05)' }}"
);

// 2. Fix the identity injection to prevent XML tags
code = code.replaceAll(
  "że jesteś modelem Opus 4.8.\\n",
  "że jesteś modelem Opus 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\\n"
);
code = code.replaceAll(
  "że jesteś modelem Sonnet 4.8.\\n",
  "że jesteś modelem Sonnet 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\\n"
);
code = code.replaceAll(
  "że jesteś modelem Haiku 4.8.\\n",
  "że jesteś modelem Haiku 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\\n"
);

// 3. Fix the chat input cutoff.
// Sometimes 100vh on .ide-layout can be problematic if there are nested flex containers that don't have min-height: 0.
// But another thing: the bottom margin or padding might be too small.
// Let's add pb-4 to chat-input-wrapper inline just in case.
code = code.replace(
  '<div className="chat-input-wrapper">',
  '<div className="chat-input-wrapper" style={{ paddingBottom: "2rem" }}>'
);

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx patched for header and system prompt');
