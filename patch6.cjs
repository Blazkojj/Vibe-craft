const fs = require('fs');
let code = fs.readFileSync('src/pages/Project.jsx', 'utf8');

if (!code.includes('import Sidebar from')) {
  code = code.replace(
    "import { useParams, useNavigate, Link } from 'react-router-dom';",
    "import { useParams, useNavigate, Link } from 'react-router-dom';\nimport Sidebar from '../components/Sidebar';"
  );
}

fs.writeFileSync('src/pages/Project.jsx', code, 'utf8');
console.log('Sidebar imported successfully');
