import { Client } from 'ssh2';

const conn = new Client();

conn.on('ready', () => {
  const script = `
apt-get install -y -qq jq
cd /var/lib/pelican/volumes/c3183a04-7ea7-49df-a75e-5416712c3757

# Pobierz najnowszy build Paper 1.21.4
BUILD=$(curl -s https://api.papermc.io/v2/projects/paper/versions/1.21.4 | jq -r '.builds[-1]')
echo "Paper 1.21.4 Build Number: $BUILD"

curl -o server.jar -sSL "https://api.papermc.io/v2/projects/paper/versions/1.21.4/builds/\${BUILD}/downloads/paper-1.21.4-\${BUILD}.jar"
echo "eula=true" > eula.txt

ls -lh server.jar
`;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', d => process.stdout.write(d))
      .stderr.on('data', d => process.stderr.write(d));
  });
}).connect({
  host: '54.37.138.23',
  port: 22,
  username: 'root',
  password: 'Blazej0112',
  readyTimeout: 20000
});
