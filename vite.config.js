import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()
dotenv.config({ path: '.env.local' })

function chatPlugin() {
  return {
    name: 'chat-plugin',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', async () => {
            try {
              const { systemPrompt, userPrompt, model, history } = JSON.parse(body);
              
              if (model === 'z-ai/glm-5.2') {
                const apiKey = process.env.ZENMUX_API_KEY;
                if (!apiKey) throw new Error("Brak ZENMUX_API_KEY w zmiennych środowiskowych.");
                const url = 'https://zenmux.ai/api/v1/chat/completions';
                
                const messages = [];
                if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
                if (history && Array.isArray(history)) {
                   messages.push(...history);
                }
                if (userPrompt) messages.push({ role: 'user', content: userPrompt });

                const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                  },
                  body: JSON.stringify({
                    model: model,
                    messages: messages,
                    stream: true
                  })
                });
                
                if (!response.ok) {
                  const errText = await response.text();
                  res.statusCode = response.status;
                  return res.end(errText);
                }
                
                res.writeHead(200, {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  'Connection': 'keep-alive'
                });
                
                for await (const chunk of response.body) {
                  res.write(chunk);
                }
                res.end();
              } else {
                // Gemini API
                const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Missing Gemini API Key in .env");
                
                const genAI = new GoogleGenerativeAI(apiKey);
                const geminiModel = genAI.getGenerativeModel({ 
                  model: model,
                  systemInstruction: systemPrompt 
                });
                
                const chatSession = geminiModel.startChat({
                  history: history || []
                });
                
                const resultStream = await chatSession.sendMessageStream(userPrompt);
                res.writeHead(200, {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  'Connection': 'keep-alive'
                });
                
                for await (const chunk of resultStream.stream) {
                  const chunkText = chunk.text();
                  res.write('data: ' + JSON.stringify({ content: chunkText }) + '\n\n');
                }
                res.end();
              }
            } catch(e) {
              res.statusCode = 500;
              res.end('Błąd serwera czatu: ' + e.message);
            }
          });
        }
      });
    }
  }
}


function compilePlugin() {
  return {
    name: 'compile-plugin',
    configureServer(server) {
      server.middlewares.use('/api/compile', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', () => {
            try {
              const files = JSON.parse(body);
              const buildDir = path.join(process.cwd(), '.vibe-build');
              
              if (fs.existsSync(buildDir)) {
                fs.rmSync(buildDir, { recursive: true, force: true });
              }
              fs.mkdirSync(buildDir);

              files.forEach(f => {
                const filePath = path.resolve(buildDir, f.path);
                if (!filePath.startsWith(path.resolve(buildDir) + path.sep)) {
                  throw new Error(`Niedozwolona ścieżka pliku: ${f.path}`);
                }
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(filePath, f.content);
              });

              if (!files.find(f => f.path.endsWith('pom.xml'))) {
                res.statusCode = 400;
                return res.end('Brak pliku pom.xml! Poproś AI o wygenerowanie struktury Maven.');
              }

              exec('mvn clean package', { cwd: buildDir }, (error, stdout, stderr) => {
                if (error) {
                  res.statusCode = 500;
                  return res.end(`Błąd kompilacji Mavena:\n${stdout}\n${stderr}`);
                }
                
                const targetDir = path.join(buildDir, 'target');
                if (fs.existsSync(targetDir)) {
                  const jarFile = fs.readdirSync(targetDir).find(f => f.endsWith('.jar') && !f.startsWith('original-'));
                  if (jarFile) {
                    const jarPath = path.join(targetDir, jarFile);
                    const stat = fs.statSync(jarPath);
                    res.writeHead(200, {
                      'Content-Type': 'application/java-archive',
                      'Content-Length': stat.size,
                      'Content-Disposition': `attachment; filename="${jarFile}"`
                    });
                    const readStream = fs.createReadStream(jarPath);
                    readStream.pipe(res);
                  } else {
                    res.statusCode = 500;
                    res.end('Nie znaleziono gotowego pliku .jar w folderze target po kompilacji.');
                  }
                } else {
                  res.statusCode = 500;
                  res.end('Kompilacja przebiegła, ale folder target nie został utworzony.');
                }
              });

            } catch(e) {
              res.statusCode = 500;
              res.end('Błąd serwera kompilacji: ' + e.message);
            }
          });
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), compilePlugin(), chatPlugin()],
})
