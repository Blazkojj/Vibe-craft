const fs = require('fs');
let jsx = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

jsx = jsx.replace('Share2\r\n} from \'lucide-react\';', 'Share2,\r\n  Terminal\r\n} from \'lucide-react\';');
jsx = jsx.replace('Share2\n} from \'lucide-react\';', 'Share2,\n  Terminal\n} from \'lucide-react\';');

fs.writeFileSync('src/pages/Dashboard.jsx', jsx);
