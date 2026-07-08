const fs = require('fs');
let dash = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// 1. Update MC_VERSIONS
dash = dash.replace(
  /const MC_VERSIONS = \[[\s\S]*?\];/,
  `const MC_VERSIONS = [
  '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21',
  '1.20.6', '1.20.4', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19',
  '1.18.2', '1.18.1', '1.18',
  '1.17.1', '1.17',
  '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16',
  '1.15.2', '1.15.1', '1.15',
  '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14',
  '1.13.2', '1.13.1', '1.13',
  '1.12.2', '1.12.1', '1.12',
  '1.11.2', '1.11',
  '1.10.2', '1.10',
  '1.9.4', '1.9',
  '1.8.9', '1.8.8', '1.8'
];`
);

// 2. Update ENGINES
dash = dash.replace(
  /const ENGINES = \[[\s\S]*?\];/,
  `const ENGINES = [
  'Paper', 'Spigot', 'Purpur', 'Folia', 'Velocity', 'BungeeCord', 'Waterfall', 'Sponge', 'Fabric', 'Forge', 'Bukkit', 'Pufferfish', 'Magma', 'Mohist'
];`
);

// 3. Remove Deep Think button
dash = dash.replace(
  /\{\/\* Deep Think Button \*\/\}[\s\S]*?<\/div>/,
  ''
);

fs.writeFileSync('src/pages/Dashboard.jsx', dash);
