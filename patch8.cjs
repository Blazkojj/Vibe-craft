const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

if (!code.includes('import BlueprintVisualizer from')) {
  code = code.replace(
    "import Sidebar from '../components/Sidebar';",
    "import Sidebar from '../components/Sidebar';\nimport BlueprintVisualizer from '../components/BlueprintVisualizer';"
  );
}

const blueprintTabBtn = `<button 
                className={\`panel-tab \${activeTab === 'blueprint' ? 'active' : ''}\`}
                onClick={() => setActiveTab('blueprint')}
              >
                Blueprint
              </button>`;

if (!code.includes("setActiveTab('blueprint')")) {
  code = code.replace(
    /<button \s*className=\{`panel-tab \$\{activeTab === 'tools' \? 'active' : ''\}`\}\s*onClick=\{\(\) => setActiveTab\('tools'\)\}\s*>\s*Narzędzia\s*<\/button>/,
    `<button 
                className={\`panel-tab \${activeTab === 'tools' ? 'active' : ''}\`}
                onClick={() => setActiveTab('tools')}
              >
                Narzędzia
              </button>\n              ${blueprintTabBtn}`
  );
  
  // also handle "Narztdzia" which is the broken encoding
  code = code.replace(
    /<button \s*className=\{`panel-tab \$\{activeTab === 'tools' \? 'active' : ''\}`\}\s*onClick=\{\(\) => setActiveTab\('tools'\)\}\s*>\s*Narztdzia\s*<\/button>/,
    `<button 
                className={\`panel-tab \${activeTab === 'tools' ? 'active' : ''}\`}
                onClick={() => setActiveTab('tools')}
              >
                Narzędzia
              </button>\n              ${blueprintTabBtn}`
  );
}

const blueprintRender = `) : activeTab === 'blueprint' ? (
              <div className="blueprint-pane fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <BlueprintVisualizer projectData={projectData} messages={messages} />
              </div>
            ) : (`;

if (!code.includes("activeTab === 'blueprint' ?")) {
  code = code.replace(
    /\) : \(/, // This matches the else branch at the end of the ternary for tabs, but let's be safer
    blueprintRender
  );
}

// Ensure the replace actually worked, otherwise fallback string replace
if (!code.includes("activeTab === 'blueprint' ?")) {
  code = code.replace(
    ") : null}",
    `) : activeTab === 'blueprint' ? (
              <div className="blueprint-pane fade-in" style={{ height: '100%', overflow: 'hidden' }}>
                <BlueprintVisualizer projectData={projectData} messages={messages} />
              </div>
            ) : null}`
  );
}

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx updated with Blueprint');
