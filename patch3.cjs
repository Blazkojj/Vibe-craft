const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

if (!code.includes('import Sidebar from')) {
  code = code.replace(
    "import { Link, useParams } from 'react-router-dom';",
    "import { Link, useParams } from 'react-router-dom';\nimport Sidebar from '../components/Sidebar';"
  );
}

// Strip out the entire sidebar chunk
const startIndex = code.indexOf('{/* Left Sidebar (Chats History) */}');
if (startIndex !== -1) {
  const endIndex = code.indexOf('{/* Main Workspace */}');
  if (endIndex !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);
    code = before + '{/* Global Sidebar */}\n        <Sidebar />\n\n        ' + after;
  }
}

// Remove the sidebar toggle button from the header
code = code.replace(
  /<button className="sidebar-toggle-btn" onClick=\{\(\) => setIsSidebarOpen\(!isSidebarOpen\)\}>[\s\S]*?<\/button>/,
  ''
);

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx updated');
