import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { exec, execFile, execSync, spawn } from 'child_process'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()
dotenv.config({ path: '.env.local' })

function chatPlugin() {
  return {
    name: 'chat-plugin',
    configureServer(server) {
      // Sprawdź które curl jest dostępne (preferuj curl-impersonate-chrome)
      let curlBin = 'curl';
      try {
        execSync('which curl-impersonate-chrome', { stdio: 'ignore' });
        curlBin = 'curl-impersonate-chrome';
        console.log('[chat] using curl-impersonate-chrome for TLS bypass');
      } catch {
        console.log('[chat] using system curl');
      }

      // Stream POST przez curl (omija Cloudflare JA3 - curl ma OpenSSL, nie Node TLS)
      function curlStream(targetUrl, headers, body, res, onError) {
        const args = ['-s', '-N', '-X', 'POST', targetUrl];
        for (const [k, v] of Object.entries(headers)) {
          args.push('-H', `${k}: ${v}`);
        }
        args.push('-d', body);

        const proc = spawn(curlBin, args);
        let stderr = '';
        proc.stderr.on('data', d => { stderr += d.toString(); });

        proc.on('error', err => {
          onError(`curl spawn failed: ${err.message}`);
        });
        proc.on('close', code => {
          if (code !== 0 && stderr) {
            onError(`curl exit ${code}: ${stderr.slice(0, 500)}`);
          }
        });

        return proc;
      }

      server.middlewares.use('/api/verify-turnstile', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method not allowed');
        }
        let body = '';
        req.on('data', chunk => { body += chunk.toString() });
        req.on('end', async () => {
          try {
            const { token } = JSON.parse(body);
            const secret = process.env.TURNSTILE_SECRET_KEY;
            if (!secret || !token) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Brak tokenu lub sekretu' }));
            }
            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ response: token, secret }),
            });
            const data = await verifyRes.json();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
      });

      server.middlewares.use('/api/send-mail', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method not allowed');
        }
        const authHeader = req.headers['authorization'] || '';
        const jwt = authHeader.replace('Bearer ', '').trim();
        if (!jwt) {
          res.statusCode = 401;
          return res.end('Unauthorized');
        }
        const verifyRes = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/user`, {
          headers: { 'Authorization': `Bearer ${jwt}`, 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
        });
        if (!verifyRes.ok) {
          res.statusCode = 401;
          return res.end('Invalid session');
        }
        let body = '';
        req.on('data', chunk => { body += chunk.toString() });
        req.on('end', async () => {
          try {
            const mailServerUrl = process.env.MAIL_SERVER_URL || 'http://127.0.0.1:3001';
            const mailResp = await fetch(`${mailServerUrl}/send-order-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.MAIL_API_KEY || ''
              },
              body
            });
            const text = await mailResp.text();
            res.statusCode = mailResp.status;
            res.end(text);
          } catch (e) {
            res.statusCode = 500;
            res.end(e.message);
          }
        });
      });

      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', async () => {
            try {
              const authHeader = req.headers['authorization'] || '';
              const supabaseJwt = authHeader.replace('Bearer ', '').trim();
              if (!supabaseJwt) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Unauthorized' }));
              }
              const verifyRes = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/user`, {
                headers: { 'Authorization': `Bearer ${supabaseJwt}`, 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
              });
              if (!verifyRes.ok) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Invalid session' }));
              }
              const verifiedUser = await verifyRes.json();
              if (!verifiedUser?.id) {
                res.statusCode = 401;
                return res.end(JSON.stringify({ error: 'Invalid user' }));
              }

              const SUPA_SERVICE = process.env.SUPABASE_SERVICE_KEY;
              if (SUPA_SERVICE) {
                const { systemPrompt: sp, userPrompt: up, model: m } = JSON.parse(body);
                const isPaidModel = ['claude-opus-4-8','claude-opus-4-7','claude-sonnet-4-6','claude-haiku-4-5-20251001','claude-sonnet-5'].includes(m);
                let estimatedCost = 0.01;
                if (m?.includes('opus')) estimatedCost = 0.05;
                else if (m?.includes('sonnet-5')) estimatedCost = 0.02;
                else if (m?.includes('haiku')) estimatedCost = 0.005;
                else if (m?.includes('glm')) estimatedCost = 0.002;

                const rpcRes = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/deduct_balance`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPA_SERVICE,
                    'Authorization': `Bearer ${SUPA_SERVICE}`
                  },
                  body: JSON.stringify({ user_email: verifiedUser.email, amount: estimatedCost })
                });
                const rpcResult = await rpcRes.json();
                if (!rpcRes.ok || rpcResult?.success === false) {
                  res.statusCode = 402;
                  return res.end(JSON.stringify({ error: rpcResult?.error || 'Insufficient balance' }));
                }
              }

              const { systemPrompt, userPrompt, model, history } = JSON.parse(body);
              
              const isClaudeAlias = ['opus-4.8', 'sonnet-4.8', 'haiku-4.8'].includes(model);
              const isTrueClaude = ['claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-sonnet-5'].includes(model);
              const isZenmux = model === 'z-ai/glm-5.2' || isClaudeAlias || isTrueClaude;

              if (isZenmux) {
                let apiKey = process.env.ZENMUX_API_KEY;
                let backendModel = 'z-ai/glm-5.2';
                // Worker proxy (omija Cloudflare bot-detection JA3)
                const WORKER_URL = process.env.CF_WORKER_URL || '';
                let url = 'https://zenmux.ai/api/v1/chat/completions';
                if (WORKER_URL) url = WORKER_URL + '/zenmux/api/v1/chat/completions';

                if (isTrueClaude) {
                  url = WORKER_URL ? WORKER_URL + '/aiapiflow/v1/chat/completions' : 'https://aiapiflow.com/v1/chat/completions';
                  if (model === 'claude-opus-4-8') { backendModel = 'claude-opus-4-8'; apiKey = process.env.AIAPIFLOW_KEY_OPUS_4_8; }
                  if (model === 'claude-opus-4-7') { backendModel = 'claude-opus-4-7'; apiKey = process.env.AIAPIFLOW_KEY_OPUS_4_7; }
                  if (model === 'claude-sonnet-4-6') { backendModel = 'claude-sonnet-4-6'; apiKey = process.env.AIAPIFLOW_KEY_SONNET_4_6; }
                  if (model === 'claude-haiku-4-5-20251001') { backendModel = 'claude-haiku-4-5-20251001'; apiKey = process.env.AIAPIFLOW_KEY_HAIKU_4_5; }
                  if (model === 'claude-sonnet-5') { backendModel = 'claude-sonnet-5'; apiKey = process.env.AIAPIFLOW_KEY_SONNET_5; }
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
                  'Authorization': `Bearer ${apiKey}`,
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/event-stream, application/json',
                  'Accept-Language': 'en-US,en;q=0.9',
                };
                if (isTrueClaude) reqHeaders['anthropic-beta'] = 'prompt-caching-2024-07-31';

                const requestBody = JSON.stringify({
                  model: backendModel,
                  messages: messages,
                  stream: true,
                  max_tokens: 8192
                });

                const proc = curlStream(url, reqHeaders, requestBody, res, (errMsg) => {
                  if (!res.headersSent) {
                    res.statusCode = 500;
                    res.end(`Błąd curl: ${errMsg}`);
                  }
                });

                // Najpierw musimy wiedzieć czy HTTP status OK — curl -i daje headers,
                // ale dla uproszczenia czytamy pierwsze bajty: jeśli zaczyna się od "<" to HTML (CF block)
                let firstChunk = true;
                let buf = '';

                proc.stdout.on('data', (chunk) => {
                  if (firstChunk) {
                    firstChunk = false;
                    buf = chunk.toString('utf8');
                    // Wykryj HTML (Cloudflare block) — zaczyna się od "<!DOCTYPE" lub "<html"
                    if (buf.trimStart().startsWith('<!DOCTYPE') || buf.trimStart().startsWith('<html')) {
                      if (!res.headersSent) {
                        res.statusCode = 403;
                        res.end('Cloudflare zablokował request (HTML response). Spróbuj zainstalować curl-impersonate-chrome.');
                      }
                      proc.kill();
                      return;
                    }
                    // OK — wyślij nagłówki i pierwszą porcję
                    if (!res.headersSent) {
                      res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                      });
                    }
                    res.write(chunk);
                  } else {
                    res.write(chunk);
                  }
                });

                proc.stdout.on('end', () => {
                  if (!res.writableEnded) res.end();
                });
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
      server.middlewares.use('/api/compile', async (req, res) => {
        if (req.method === 'POST') {
          const authHeader = req.headers['authorization'] || '';
          const supabaseJwt = authHeader.replace('Bearer ', '').trim();
          if (!supabaseJwt) {
            res.statusCode = 401;
            return res.end('Unauthorized');
          }
          const verifyRes = await fetch(`${process.env.VITE_SUPABASE_URL}/auth/v1/user`, {
            headers: { 'Authorization': `Bearer ${supabaseJwt}`, 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
          });
          if (!verifyRes.ok) {
            res.statusCode = 401;
            return res.end('Invalid session');
          }
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', () => {
            try {
              const files = JSON.parse(body);

              const DANGEROUS_PLUGINS = ['exec-maven-plugin', 'maven-antrun-plugin', 'groovy-maven-plugin', 'maven-invoker-plugin'];
              const pomFile = files.find(f => f.path.endsWith('pom.xml'));
              if (pomFile) {
                for (const danger of DANGEROUS_PLUGINS) {
                  if (pomFile.content.includes(danger)) {
                    res.statusCode = 400;
                    return res.end(`Niebezpieczny plugin Maven: ${danger}`);
                  }
                }
                pomFile.content = pomFile.content.replace(/<pluginRepositories[\s\S]*?<\/pluginRepositories>/gi, '');
              }

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

              const settingsXml = `<settings>
  <mirrors>
    <mirror>
      <id>central-only</id>
      <mirrorOf>*</mirrorOf>
      <url>https://repo.maven.apache.org/maven2</url>
    </mirror>
  </mirrors>
  <profiles>
    <profile>
      <id>no-external-repos</id>
      <activation><activeByDefault>true</activeByDefault></activation>
      <repositories>
        <repository>
          <id>central</id>
          <url>https://repo.maven.apache.org/maven2</url>
          <releases><enabled>true</enabled></releases>
          <snapshots><enabled>false</enabled></snapshots>
        </repository>
      </repositories>
    </profile>
  </profiles>
</settings>`;
              const settingsPath = path.join(buildDir, 'mvn-settings.xml');
              fs.writeFileSync(settingsPath, settingsXml);

              exec(`mvn clean package -s ${settingsPath}`, { cwd: buildDir }, (error, stdout, stderr) => {
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
  server: {
    allowedHosts: true
  }
})
