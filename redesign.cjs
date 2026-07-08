const fs = require('fs');

function redesignCSS(file) {
  let css = fs.readFileSync(file, 'utf8');

  // 1. Remove stripes
  css = css.replace(/\.dashboard-grid-bg::after\s*\{[^}]*\}/g, '');
  css = css.replace(/radial-gradient[^;]+;/g, 'transparent;');

  // 2. Pure Black Backgrounds
  css = css.replace(/background-color:\s*var\(--bg-canvas\);/g, 'background-color: #000;');
  css = css.replace(/background:\s*var\(--bg-canvas\);/g, 'background: #000;');

  // 3. Topbar to floating
  if (file.includes('Dashboard')) {
    css = css.replace(/\.dash-topbar\s*\{[\s\S]*?(?=\n\n|\.dash-topbar-brand)/g, 
`.dash-topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background: rgba(12, 12, 12, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  z-index: 10;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  max-width: 1200px;
  margin: 1.5rem auto 0;
  width: calc(100% - 3rem);
}
`);
  }

  // 4. Content cards to Bento
  css = css.replace(/background:\s*rgba\([^)]+\);\s*backdrop-filter:\s*blur\([^)]+\);\s*(?:-webkit-backdrop-filter:\s*blur\([^)]+\);\s*)?border:\s*1px\s+solid\s+rgba\([^)]+\);\s*border-radius:\s*var\(--r-(?:xl|lg|md)\);/g, 
  'background: rgba(18, 18, 18, 0.5); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px;');

  // Project.css specific rules
  if (file.includes('Project')) {
    // Sidebar
    css = css.replace(/\.project-sidebar\s*\{[\s\S]*?(?=\n\n|\.ps-top)/g,
`.project-sidebar{
  width:260px;flex-shrink:0;
  background:#050505;
  border-right:1px solid rgba(255,255,255,0.05);
  display:flex;flex-direction:column;
  overflow:hidden;
}`);
    
    // Chat Header
    css = css.replace(/\.chat-header\s*\{[\s\S]*?(?=\n\n|\.chat-header-title)/g,
`.chat-header{
  height:64px;flex-shrink:0;
  display:flex;align-items:center;
  padding:0 1.5rem;gap:1rem;
  background:rgba(10,10,10,0.8);
  backdrop-filter:blur(24px);
  border-bottom:1px solid rgba(255,255,255,0.05);
  position:relative;z-index:5;
}`);

    // Chat input
    css = css.replace(/\.chat-input-area\s*\{[\s\S]*?(?=\n\n|\.chat-input-row)/g,
`.chat-input-area{
  flex-shrink:0;
  padding:1.5rem 2rem 2rem;
  background:linear-gradient(to top, #000 70%, transparent);
  border-top:none;
}`);
    
    // Chat input box
    css = css.replace(/\.chat-input-box\s*\{[\s\S]*?(?=\n\n|\.chat-input-box:focus-within)/g,
`.chat-input-box{
  flex:1;
  background:rgba(20,20,20,0.8);
  backdrop-filter: blur(20px);
  border:1px solid rgba(255,255,255,0.06);
  border-radius:24px;
  padding:0.85rem 1.25rem;
  min-height:56px;max-height:200px;
  display:flex;align-items:center;
  transition:all 0.2s;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}`);
  }

  fs.writeFileSync(file, css);
}

redesignCSS('src/pages/Dashboard.css');
redesignCSS('src/pages/Project.css');
console.log('Redesign script complete');
