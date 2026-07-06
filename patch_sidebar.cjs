const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

if (!code.includes('import Sidebar from')) {
  code = code.replace(
    "import { Link, useParams } from 'react-router-dom';",
    "import { Link, useParams } from 'react-router-dom';\nimport Sidebar from '../components/Sidebar';"
  );
}

// Remove the old sidebar block
code = code.replace(
  /\{\/\* Left Sidebar \(Chats History\) \*\/\}[\s\S]*?<\/[Aa]side>\n\s*\}/,
  '{/* Global Sidebar */}\n        <Sidebar />'
);

// We need to pass isSidebarOpen or something? The Dashboard uses Sidebar without props.
// Let's just remove the toggle sidebar logic from the header if the Sidebar has its own toggle.
// In Sidebar.jsx, it has its own `isCollapsed` state and toggle button!
// Wait, the header in Project.jsx has `<button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>`!
// I should remove that button so we don't have two hamburger menus!
code = code.replace(
  /<button className="sidebar-toggle-btn" onClick=\{\(\) => setIsSidebarOpen\(!isSidebarOpen\)\}>\s*<Menu size=\{20\} \/>\s*<\/button>/,
  ''
);

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Project.jsx updated with Sidebar component');
