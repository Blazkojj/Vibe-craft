const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// 1. Add abortControllerRef
code = code.replace(
  'const currentProjectIdRef = useRef(null);',
  'const currentProjectIdRef = useRef(null);\n  const abortControllerRef = useRef(null);'
);

// 2. Add stopGenerating function
code = code.replace(
  'const generateInitial = async () => {',
  `const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setStreamingMessageId(null);
  };

  const generateInitial = async () => {`
);

// 3. Add AbortController to generateWithBackend
code = code.replace(
  'const generateWithBackend = async (model, systemPrompt, userPrompt, history, updateMsgCb) => {',
  `const generateWithBackend = async (model, systemPrompt, userPrompt, history, updateMsgCb) => {
    abortControllerRef.current = new AbortController();`
);
code = code.replace(
  'body: JSON.stringify({',
  'signal: abortControllerRef.current.signal,\n      body: JSON.stringify({'
);

// 4. Update UI to show Stop button
const oldSendBtn = `<button 
                        className="chat-send-btn btn-action-primary" 
                        onClick={handleSend}
                        disabled={isGenerating || !chatInput.trim()}
                        style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: isGenerating ? 'rgba(255,255,255,0.05)' : 'rgba(218, 119, 86, 0.15)', color: isGenerating ? '#6B7280' : '#da7756', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s' }}
                      >
                        <Send size={16} />
                      </button>`;

const newSendBtn = `{isGenerating ? (
                        <button 
                          className="chat-send-btn btn-action-primary" 
                          onClick={stopGenerating}
                          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s' }}
                          title="Zatrzymaj generowanie"
                        >
                          <div style={{ width: 12, height: 12, backgroundColor: '#EF4444', borderRadius: 2 }}></div>
                        </button>
                      ) : (
                        <button 
                          className="chat-send-btn btn-action-primary" 
                          onClick={handleSend}
                          disabled={!chatInput.trim()}
                          style={{ width: '40px', height: '40px', padding: 0, borderRadius: '8px', background: 'rgba(218, 119, 86, 0.15)', color: '#da7756', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s' }}
                        >
                          <Send size={16} />
                        </button>
                      )}`;

// Wait, the send button might not be exactly that string. Let's use regex.
const btnRegex = /<button[\s\S]*?className="chat-send-btn btn-action-primary"[\s\S]*?onClick=\{handleSend\}[\s\S]*?<\/button>/;
if (btnRegex.test(code)) {
  code = code.replace(btnRegex, newSendBtn);
} else {
  // If it didn't match, let's just find the send button roughly
  const sendBtnFallback = /<button\s*className="chat-send-btn[\s\S]*?<\/button>/;
  code = code.replace(sendBtnFallback, newSendBtn);
}

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx updated with stop generating button');
