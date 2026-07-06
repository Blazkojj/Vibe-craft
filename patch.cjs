const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// Replace 1: generateInitial
code = code.replace(
  'let selectedModel = "gemini-2.0-flash";\n        if (projectData.model === "gemini-1.5-pro") selectedModel = "gemini-2.5-pro";',
  `let selectedModel = "gemini-2.0-flash";
        if (projectData.model === "gemini-1.5-pro") selectedModel = "gemini-2.5-pro";
        
        let identityInjection = "";
        if (projectData.model === "opus-4.8") {
          identityInjection = "Nazywasz się Claude Opus 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Opus 4.8.\\n";
        } else if (projectData.model === "sonnet-4.8") {
          identityInjection = "Nazywasz się Claude Sonnet 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Sonnet 4.8.\\n";
        } else if (projectData.model === "haiku-4.8") {
          identityInjection = "Nazywasz się Claude Haiku 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Haiku 4.8.\\n";
        }

        const apiModel = ['opus-4.8', 'sonnet-4.8', 'haiku-4.8'].includes(projectData.model) ? 'z-ai/glm-5.2' : selectedModel;
`
);

// We need to replace the system prompt twice
code = code.replace(
  'const systemPrompt = `Jesteś elitarnym',
  'const systemPrompt = `${identityInjection}Jesteś elitarnym'
);
code = code.replace(
  'const systemPrompt = `Jesteś elitarnym',
  'const systemPrompt = `${identityInjection}Jesteś elitarnym'
);

code = code.replace(
  'await generateWithBackend(\n          selectedModel,\n          systemPrompt,\n          projectData.prompt,\n          [],\n          updateMessage\n        );',
  `await generateWithBackend(
          apiModel,
          systemPrompt,
          projectData.prompt,
          [],
          updateMessage
        );`
);

// Replace 2: handleSend systemPrompt
code = code.replace(
  'historyContext = summaryToUse ? `[STRESZCZENIE STARSZYCH USTALEŃ]\\n${summaryToUse}\\n\\n[OSTATNIE 4 WIADOMOŚCI]\\n${recentHistoryText}` : recentHistoryText;',
  `historyContext = summaryToUse ? \`[STRESZCZENIE STARSZYCH USTALEŃ]\\n\${summaryToUse}\\n\\n[OSTATNIE 4 WIADOMOŚCI]\\n\${recentHistoryText}\` : recentHistoryText;
      
      let identityInjection = "";
      if (projectData.model === "opus-4.8") {
        identityInjection = "Nazywasz się Claude Opus 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Opus 4.8.\\n";
      } else if (projectData.model === "sonnet-4.8") {
        identityInjection = "Nazywasz się Claude Sonnet 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Sonnet 4.8.\\n";
      } else if (projectData.model === "haiku-4.8") {
        identityInjection = "Nazywasz się Claude Haiku 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Haiku 4.8.\\n";
      }

      const apiModel = ['opus-4.8', 'sonnet-4.8', 'haiku-4.8'].includes(projectData.model) ? 'z-ai/glm-5.2' : projectData.model;`
);

// Replace 2a: handleSend generateWithBackend calls
code = code.replace(
  'let fullText = await generateWithBackend(\n        projectData.model || \'gemini-2.0-flash\',',
  'let fullText = await generateWithBackend(\n        apiModel || \'gemini-2.0-flash\','
);


// Replace 3: model dropdown text
code = code.replace(
  "{projectData.model === 'gemini-1.5-pro' ? 'Gemini 2.5 Pro' : projectData.model === 'z-ai/glm-5.2' ? 'GLM 5.2 (z-ai)' : 'Gemini 2.5 Flash'}",
  "{projectData.model === 'gemini-1.5-pro' ? 'Gemini 2.5 Pro' : projectData.model === 'z-ai/glm-5.2' ? 'GLM 5.2 (z-ai)' : projectData.model === 'opus-4.8' ? 'Opus 4.8' : projectData.model === 'sonnet-4.8' ? 'Sonnet 4.8' : projectData.model === 'haiku-4.8' ? 'Haiku 4.8' : 'Gemini 2.5 Flash'}"
);

// Replace 4: dropdown options
const newDropdowns = `
                          <div 
                            className={\`model-option \${projectData.model === 'opus-4.8' ? 'active' : ''}\`}
                            onClick={() => changeModel('opus-4.8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Opus 4.8
                            </div>
                            {projectData.model === 'opus-4.8' && <Check size={14} />}
                          </div>
                          
                          <div 
                            className={\`model-option \${projectData.model === 'sonnet-4.8' ? 'active' : ''}\`}
                            onClick={() => changeModel('sonnet-4.8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Sonnet 4.8
                            </div>
                            {projectData.model === 'sonnet-4.8' && <Check size={14} />}
                          </div>
                          
                          <div 
                            className={\`model-option \${projectData.model === 'haiku-4.8' ? 'active' : ''}\`}
                            onClick={() => changeModel('haiku-4.8')}
                          >
                            <div className="model-option-left">
                              <div className="model-icon muted" style={{color: '#d97757'}}><Sparkles size={10} /></div>
                              Haiku 4.8
                            </div>
                            {projectData.model === 'haiku-4.8' && <Check size={14} />}
                          </div>

                          <div 
                            className={\`model-option \${projectData.model !== 'gemini-1.5-pro' && projectData.model !== 'z-ai/glm-5.2' && !['opus-4.8','sonnet-4.8','haiku-4.8'].includes(projectData.model) ? 'active' : ''}\`}
`;

code = code.replace(
  /<div \s*className={`model-option \${projectData\.model !== 'gemini-1\.5-pro' && projectData\.model !== 'z-ai\/glm-5\.2' \? 'active' : ''}`}/,
  newDropdowns
);

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx updated successfully');
