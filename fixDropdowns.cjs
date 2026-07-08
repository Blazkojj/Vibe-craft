const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace(/\.minimal-dropdown\s*\{[\s\S]*?\}/, (match) => {
  return match.replace(/\}$/, '  max-height: 250px;\n  overflow-y: auto;\n  scrollbar-width: thin;\n}');
});

// Also make sure .large-grid is displayed nicely
css += `
.minimal-dropdown::-webkit-scrollbar {
  width: 6px;
}
.minimal-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.minimal-dropdown::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 4px;
}
`;

fs.writeFileSync('src/index.css', css);
