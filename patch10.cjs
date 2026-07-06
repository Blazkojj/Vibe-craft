const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

// Define identityInjection and apiModel inside generateInitial
const target = `  const generateInitial = async () => {
      setIsGenerating(true);
      let msgId = null;
      
      try {
        // API check removed

        let selectedModel = "gemini-2.0-flash";`;

const replacement = `  const generateInitial = async () => {
      setIsGenerating(true);
      let msgId = null;
      
      try {
        // API check removed
        
        let identityInjection = "";
        if (projectData.model === "opus-4.8") {
          identityInjection = "Nazywasz się Claude Opus 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Opus 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\\n";
        } else if (projectData.model === "sonnet-4.8") {
          identityInjection = "Nazywasz się Claude Sonnet 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Sonnet 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\\n";
        } else if (projectData.model === "haiku-4.8") {
          identityInjection = "Nazywasz się Claude Haiku 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Haiku 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\\n";
        }

        const apiModel = ['opus-4.8', 'sonnet-4.8', 'haiku-4.8'].includes(projectData.model) ? 'z-ai/glm-5.2' : projectData.model;

        let selectedModel = "gemini-2.0-flash";`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
  console.log('Project.jsx successfully patched generateInitial');
} else {
  console.error('Target code not found in Project.jsx');
}
