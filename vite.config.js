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
              
              const isClaudeAlias = ['opus-4.8', 'sonnet-4.8', 'haiku-4.8'].includes(model);
              const isTrueClaude = ['claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-sonnet-5'].includes(model);
              const isZenmux = model === 'z-ai/glm-5.2' || isClaudeAlias || isTrueClaude;

              if (isZenmux) {
                let apiKey = process.env.ZENMUX_API_KEY;
                let backendModel = 'z-ai/glm-5.2';
                let url = 'https://zenmux.ai/api/v1/chat/completions';

                if (isTrueClaude) {
                  url = 'https://aiapiflow.com/v1/chat/completions';
                  if (model === 'claude-opus-4-8') { backendModel = 'claude-opus-4-8'; apiKey = 'sk-f0d2a44153c70c1b33c972e2912b961e93db62db43cbb709f30ea2f633c440b9'; }
                  if (model === 'claude-opus-4-7') { backendModel = 'claude-opus-4-7'; apiKey = 'sk-a0f84134c115efb020ffcef5deae07328b726cc93b2d085dfc71479f0418bb91'; }
                  if (model === 'claude-sonnet-4-6') { backendModel = 'claude-sonnet-4-6'; apiKey = 'sk-fdd379c52685e84359a76380c1512707a0c7e3ee9c69d65b1a031b5a3814e79b'; }
                  if (model === 'claude-haiku-4-5-20251001') { backendModel = 'claude-haiku-4-5-20251001'; apiKey = 'sk-98b017735d702535bc9c3a15f481cfd581c1fec630edff6b52120fdc2ce0c0cf'; }
                  if (model === 'claude-sonnet-5') { backendModel = 'claude-sonnet-5'; apiKey = 'sk-d50fbe6f318d7d302f053d650d5cb25f425f9125f9df5466dd64484dcb0cb228'; }
                }

                if (!apiKey) throw new Error("Brak odpowiedniego klucza API w .env");

                let finalSystemPrompt = systemPrompt;
                if (model === 'z-ai/glm-5.2') {
                  try {
                    const opusPrompt = fs.readFileSync(path.join(process.cwd(), 'anthropic-claude-opus-4.5-full_20251124.txt'), 'utf8');
                    finalSystemPrompt = finalSystemPrompt + '\n\n# SYSTEM BEHAVIOR INSTRUCTIONS (OPUS 4.5 SIMULATION)\n' + opusPrompt;
                  } catch (e) {
                    console.error('Failed to load Opus prompt:', e.message);
                  }
                }

                const messages = [];
                // Claude prompt caching: mark system prompt as cacheable (saves ~90% on repeated calls)
                if (finalSystemPrompt) {
                  messages.push({
                    role: 'system',
                    content: isTrueClaude
                      ? [{ type: 'text', text: finalSystemPrompt, cache_control: { type: 'ephemeral' } }]
                      : finalSystemPrompt
                  });
                }
                if (history && Array.isArray(history)) {
                   const convertedHistory = history.map((h, i) => {
                     const text = h.parts ? h.parts[0].text : h.content;
                     const role = h.role === 'model' ? 'assistant' : 'user';
                     // Cache breakpoint on last assistant message for multi-turn caching
                     const isLastAssistant = isTrueClaude && role === 'assistant' && i === history.map((x, j) => x.role === 'model' ? j : -1).filter(j => j >= 0).slice(-1)[0];
                     return {
                       role,
                       content: isLastAssistant
                         ? [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]
                         : text
                     };
                   });
                   messages.push(...convertedHistory);
                }
                if (userPrompt) messages.push({ role: 'user', content: userPrompt });

                const reqHeaders = {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
                };
                if (isTrueClaude) reqHeaders['anthropic-beta'] = 'prompt-caching-2024-07-31';

                const response = await fetch(url, {
                  method: 'POST',
                  headers: reqHeaders,
                  body: JSON.stringify({
                    model: backendModel,
                    messages: messages,
                    stream: true,
                    max_tokens: 8192
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
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("Missing GEMINI_API_KEY in .env");
                
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
                    let finalFilename = jarFile;
                    try {
                      const pomPath = path.join(buildDir, 'pom.xml');
                      if (fs.existsSync(pomPath)) {
                        const pomContent = fs.readFileSync(pomPath, 'utf8');
                        const versionMatch = pomContent.match(/<version>([^<]+)<\/version>/);
                        const artifactMatch = pomContent.match(/<artifactId>([^<]+)<\/artifactId>/);
                        if (versionMatch && artifactMatch && !jarFile.includes(versionMatch[1])) {
                          finalFilename = `${artifactMatch[1]}-${versionMatch[1]}.jar`;
                        }
                      }
                    } catch(e) {}

                    const jarPath = path.join(targetDir, jarFile);
                    const stat = fs.statSync(jarPath);
                    res.writeHead(200, {
                      'Content-Type': 'application/java-archive',
                      'Content-Length': stat.size,
                      'Content-Disposition': `attachment; filename="${finalFilename}"`,
                      'Access-Control-Expose-Headers': 'Content-Disposition'
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
