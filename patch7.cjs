const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// 1. Fix abortControllerRef
code = code.replace(
  'const generateWithBackend = async (model, systemPrompt, userPrompt, history, updateMsgCb) => {',
  'const generateWithBackend = async (model, systemPrompt, userPrompt, history, updateMsgCb, abortControllerRef) => {'
);

code = code.replace(
  /let fullText = await generateWithBackend\(\s*apiModel \|\| 'gemini-2\.0-flash',\s*systemPrompt,\s*userPrompt,\s*\[\],\s*\(text\) => updateMessage\(msgId, text, true\)\s*\);/,
  `let fullText = await generateWithBackend(
          apiModel || 'gemini-2.0-flash',
          systemPrompt,
          userPrompt,
          [],
          (text) => updateMessage(msgId, text, true),
          abortControllerRef
        );`
);

code = code.replace(
  /let fullText = await generateWithBackend\(\s*apiModel \|\| 'gemini-2\.0-flash',\s*systemPrompt,\s*userPrompt,\s*formattedHistory,\s*\(text\) => updateMessage\(msgId, text, true\)\s*\);/,
  `let fullText = await generateWithBackend(
        apiModel || 'gemini-2.0-flash',
        systemPrompt,
        userPrompt,
        formattedHistory,
        (text) => updateMessage(msgId, text, true),
        abortControllerRef
      );`
);

// 2. Fix layout
code = code.replace(
  '<div className="ide-layout">',
  '<div style={{ display: \'flex\', height: \'100vh\', background: \'var(--claude-bg)\', color: \'var(--claude-text)\', overflow: \'hidden\' }}>'
);
code = code.replace(
  '<div className="ide-main">',
  '<div style={{ flex: 1, overflowY: \'auto\', display: \'flex\', flexDirection: \'column\' }}>'
);

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx fully fixed layout and abortController');
