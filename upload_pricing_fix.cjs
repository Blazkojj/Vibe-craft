const fs = require('fs');
const { Client } = require('ssh2');

const filesToUpload = [
  { local: 'src/pages/Pricing.css', remote: '/var/www/zenexcode/src/pages/Pricing.css' },
  { local: 'src/pages/Pricing.jsx', remote: '/var/www/zenexcode/src/pages/Pricing.jsx' }
];

const conn = new Client();
conn.on('ready', () => {
  console.log('[SSH] Connected to VPS.');

  let completed = 0;
  
  function uploadNext() {
    if (completed === filesToUpload.length) {
      console.log('[SSH] All files uploaded successfully.');
      
      console.log('[SSH] Building frontend on VPS...');
      conn.exec('cd /var/www/zenexcode && npm run build && pm2 restart VibeCraft-Strona', (err, stream) => {
        if (err) throw err;
        stream.on('data', d => process.stdout.write(d));
        stream.on('close', () => {
          console.log('\n[SSH] Build and restart complete.');
          conn.end();
        });
      });
      return;
    }
    
    const task = filesToUpload[completed];
    console.log(`[SSH] Uploading ${task.local}...`);
    const content = fs.readFileSync(task.local, 'utf8');
    
    conn.exec(`cat << 'EOF' > ${task.remote}\n${content}\nEOF`, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        console.log(`[SSH] Uploaded ${task.local} successfully.`);
        completed++;
        uploadNext();
      }).on('data', d => process.stdout.write(d));
    });
  }

  uploadNext();
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112'
});
