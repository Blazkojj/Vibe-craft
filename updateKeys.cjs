const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  // Read existing .env
  conn.exec('cat /var/www/zenexcode/.env', (err, stream) => {
    if (err) throw err;
    let envContent = '';
    stream.on('data', d => { envContent += d.toString(); });
    stream.on('close', () => {
      
      // Update keys
      envContent = envContent.replace(/AIAPIFLOW_KEY_SONNET_4_6=.*/g, 'AIAPIFLOW_KEY_SONNET_4_6=sk-fdd379c52685e84359a76380c1512707a0c7e3ee9c69d65b1a031b5a3814e79b');
      envContent = envContent.replace(/AIAPIFLOW_KEY_HAIKU_4_5=.*/g, 'AIAPIFLOW_KEY_HAIKU_4_5=sk-98b017735d702535bc9c3a15f481cfd581c1fec630edff6b52120fdc2ce0c0cf');
      envContent = envContent.replace(/AIAPIFLOW_KEY_SONNET_5=.*/g, 'AIAPIFLOW_KEY_SONNET_5=sk-d50fbe6f318d7d302f053d650d5cb25f425f9125f9df5466dd64484dcb0cb228');
      envContent = envContent.replace(/AIAPIFLOW_KEY_OPUS_4_7=.*/g, 'AIAPIFLOW_KEY_OPUS_4_7=sk-a0f84134c115efb020ffcef5deae07328b726cc93b2d085dfc71479f0418bb91');
      envContent = envContent.replace(/AIAPIFLOW_KEY_OPUS_4_8=.*/g, 'AIAPIFLOW_KEY_OPUS_4_8=sk-f0d2a44153c70c1b33c972e2912b961e93db62db43cbb709f30ea2f633c440b9');

      // Write back
      const cmd = `cat << 'EOF' > /var/www/zenexcode/.env\n${envContent}\nEOF\npm2 restart VibeCraft-Strona --update-env`;
      
      conn.exec(cmd, (err2, stream2) => {
        if (err2) throw err2;
        stream2.on('data', d => process.stdout.write(d));
        stream2.on('close', () => conn.end());
      });
    });
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112'
});
