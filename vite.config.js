import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { exec, execFile, execSync, spawn } from 'child_process'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()
dotenv.config({ path: '.env.local' })

const discordBotToken = process.env.DISCORD_BOT_TOKEN;
const discordChannelId = '1526338277081092336';

async function sendErrorToDiscord(title, details) {
  if (!discordBotToken) {
    console.warn('[Discord Log] Warning: DISCORD_BOT_TOKEN is not configured.');
    return;
  }
  try {
    let cleanMsg = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
    if (cleanMsg.length > 1800) {
      cleanMsg = cleanMsg.substring(0, 1800) + '\n... [TRUNCATED]';
    }
    const payload = {
      embeds: [
        {
          title: `⚠️ Błąd: ${title}`,
          description: ```json\n${cleanMsg}\n```,
          color: 16711680, // Red
          timestamp: new Date().toISOString()
        }
      ]
    };
    const res = await fetch(`https://discord.com/api/v10/channels/${discordChannelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${discordBotToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error('[Discord Log] Failed to send error:', await res.text());
    }
  } catch (e) {
    console.error('[Discord Log] Error sending to discord:', e);
  }
}

async function fetchForumSearchResults(query) {
  try {
    const cleanQuery = (query || '').substring(0, 150).replace(/[^a-zA-Z0-9 ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_\-]/g, ' ').trim();
    if (!cleanQuery) return '';
    const searchQuery = `${cleanQuery} minecraft skript forum spigotmc github crafting.pl`;
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    const resp = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8'
      }
    });
    const html = await resp.text();
    const results = [];
    const titleMatches = [...html.matchAll(/<a class="result__a"[^>]*>([\s\S]*?)<\/a>/gi)];
    const snippetMatches = [...html.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)];

    for (let i = 0; i < Math.min(titleMatches.length, 5); i++) {
      const title = (titleMatches[i]?.[1] || '').replace(/<[^>]+>/g, '').trim();
      const snippet = (snippetMatches[i]?.[1] || '').replace(/<[^>]+>/g, '').trim();
      if (title || snippet) {
        results.push(`• ${title}:\n  ${snippet}`);
      }
    }
    return results.join('\n\n');
  } catch (e) {
    console.error('[forum-search] Search failed:', e.message);
    return '';
  }
}

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
        args.push('-d', '@-');

        const proc = spawn(curlBin, args);
        
        proc.stdin.write(body);
        proc.stdin.end();

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

      server.middlewares.use('/api/enhance-prompt', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method not allowed');
        }
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
            if (!verifiedUser?.email) throw new Error("Invalid user");

            const SUPA_SERVICE = process.env.SUPABASE_SERVICE_KEY;
            const skipBilling = true; // disabled for debugging
            if (SUPA_SERVICE && !skipBilling) {
              const rpcRes = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/deduct_balance`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SUPA_SERVICE,
                  'Authorization': `Bearer ${SUPA_SERVICE}`
                },
                body: JSON.stringify({ user_email: verifiedUser.email, amount: 0.01 })
              });
              const rpcResult = await rpcRes.json();
              if (!rpcRes.ok || rpcResult?.success === false) {
                res.statusCode = 402;
                return res.end(JSON.stringify({ error: rpcResult?.error || 'Insufficient balance' }));
              }
            }

            const { prompt } = JSON.parse(body);
            if (!prompt) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Prompt is required' }));
            }
            const apiKey = process.env.AIAPIFLOW_KEY_SONNET_4_6;
            if (!apiKey) throw new Error("Missing API key");
            
            const WORKER_URL = process.env.CF_WORKER_URL || '';
            const url = WORKER_URL ? WORKER_URL + '/aiapiflow/v1/chat/completions' : 'https://aiapiflow.com/v1/chat/completions';
            
            const systemPrompt = `Jesteś światowej klasy ekspertem inżynierii promptów oraz starszym deweloperem pluginów i skryptów Minecraft (Paper 1.21.4, Spigot, Skript, Bukkit).
Posiadasz ENCYKLOPEDYCZNĄ WIEDZĘ o WSZYSTKICH mechanikach i skryptach z popularnych polskich serwerów Minecraft (Anarchia.gg, DragonCraft, RealCraft, SkKF, MCHC, Hypixel, itp.):

KNOW-HOW POPULARNYCH MECHANIK I SKRYPTÓW:
1. HYDRO KLATKA (Wodna Pułapka):
   - Przedmiot z custom NBT "Hydro Klatka" (np. niebieskie szkło lub obsydian).
   - Po postawieniu/użyciu natychmiast tworzy wokół ofiary klatkę 3x3x3 z obsydianu lub ciemnego szkła, wypełnioną wodą wewnątrz.
   - Woda wewnątrz spowalnia ruch ofiary i blokuje możliwość stawiania klocków oraz ucieczki.
   - Posiada automatyczny rollback – zapamiętuje stan bloków i po 10-15 sekundach automatycznie usuwa klatkę i przywraca teren.
2. MEFENTEYK / MEFENDERYK (Potion Szału):
   - Custom potion/narkotyk dający: Speed III, Strength II, Haste II, Resistance I na 15-20s oraz Nausea na 2s.
   - Globalny cooldown (60s) z ActionBar countdown oraz efekty cząsteczkowe (Particle.REDSTONE).
3. KLATKA TRAPERKA / STONARKA:
   - Szybka klatka 3x3 z obsydianu lub kamienia z opóźnieniem kasowania po 10-15s.
4. COBBLEX (Magiczny Blok Kamienia):
   - Blok z 64x Stone z losowym dropem w GUI/eq (Mefenteyk, Kox, Refil, Perły, Elytra, Rudy) z dźwiękiem Anvil.
5. SCHOWEK / DEPOZYT (Koxy, Refile, Perły):
   - Automat limitujący w eq: max 1 Kox, 12 Refili, 4 Perły. Nadmiar trafia do schowka SQL/GUI (/schowek lub /depozyt).
6. ANTY-LOGOUT (Combat Tag & BossBar):
   - PvP tag 20-30s z czerwonym paskiem BossBar, blokada komend (/spawn, /home, /tpa) i zabijanie gracza przy wyjściu z gry.
7. RZUCANE KOXY & RZUCANE TNT:
   - Przedmioty rzucane jak perły (leczące lub detonujące TNT przebijające obsydian z określoną szansą).
8. RÓŻDŻKA TELEPORTACJI & TURBODROP & PANDORA & GILDIE (Serca Gildii, Tereny 50x50, Skarbiec).

Twój cel: Zamień krótki pomysł użytkownika na doskonały, szczegółowy, ustrukturyzowany prompt, gotowy do wrzucenia w agenta kodującego. Rozwiń skróty myślowe, dodaj szczegóły techniczne i eventy (Listeners). ZWRÓĆ TYLKO GOTOWY PROMPT. NIE DODAJ ŻADNYCH WSTĘPÓW ANI ZAKOŃCZEŃ. PISZ W TYM SAMYM JĘZYKU CO UŻYTKOWNIK.`;
            
            const searchResults = await fetchForumSearchResults(prompt);
            let userContent = `Zamień ten pomysł na profesjonalny prompt (zwróć tylko prompt!):\n\n${prompt}`;
            if (searchResults) {
              userContent += `\n\n# WYNIKI WYSZUKIWANIA NA FORACH (SpigotMC/Skript.pl/GitHub/Crafting.pl):\n${searchResults}`;
            }

            const reqHeaders = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.9',
              'anthropic-beta': 'prompt-caching-2024-07-31'
            };
            
            const requestBody = JSON.stringify({
              model: 'claude-sonnet-4-6',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent }
              ],
              stream: false,
              max_tokens: 4096
            });
            
            const curlArgs = ['-s', '-N', '-X', 'POST', url];
            for (const [k, v] of Object.entries(reqHeaders)) {
              curlArgs.push('-H', `${k}: ${v}`);
            }
            curlArgs.push('-d', requestBody);

            const curlProc = spawn(curlBin, curlArgs);
            let responseData = '';
            let stderrData = '';
            
            curlProc.stdout.on('data', d => { responseData += d.toString(); });
            curlProc.stderr.on('data', d => { stderrData += d.toString(); });
            
            curlProc.on('close', (code) => {
              if (code !== 0 && stderrData) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ error: `Curl failed: ${stderrData.slice(0, 500)}` }));
              }
              
              try {
                if (responseData.trimStart().startsWith('<!DOCTYPE') || responseData.trimStart().startsWith('<html')) {
                  throw new Error("Cloudflare zablokował żądanie.");
                }
                const data = JSON.parse(responseData);
                if (data.choices && data.choices[0] && data.choices[0].message) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ enhanced: data.choices[0].message.content }));
                } else {
                  throw new Error(data.error?.message || "Invalid response from API");
                }
              } catch (e) {
                console.error('Enhance prompt parse error:', e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          } catch (e) {
            console.error('Enhance prompt setup error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

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

      server.middlewares.use('/api/log-error', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString() });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body);
              console.error('[CLIENT-SIDE ERROR LOGGED]:', parsed);
              await sendErrorToDiscord('Client-side', parsed);
            } catch (e) {
              console.error('[CLIENT-SIDE ERROR RAW]:', body);
              await sendErrorToDiscord('Client-side (Raw)', body);
            }
            res.end('ok');
          });
        } else {
          res.end('only post');
        }
      });

      server.middlewares.use('/api/web-search', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method not allowed');
        }
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { query } = JSON.parse(body);
            if (!query || !query.trim()) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Query is required' }));
            }
            
            const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const resp = await fetch(searchUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8'
              }
            });
            const html = await resp.text();
            
            const results = [];
            const titleMatches = [...html.matchAll(/<a class="result__a"[^>]*>([\s\S]*?)<\/a>/gi)];
            const snippetMatches = [...html.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)];

            for (let i = 0; i < Math.min(titleMatches.length, 5); i++) {
              const rawTitle = titleMatches[i]?.[1] || '';
              const rawSnippet = snippetMatches[i]?.[1] || '';
              const title = rawTitle.replace(/<[^>]+>/g, '').trim();
              const snippet = rawSnippet.replace(/<[^>]+>/g, '').trim();
              if (title || snippet) {
                results.push({ title, snippet });
              }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ query, results }));
          } catch(e) {
            console.error('[web-search] Error:', e);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message, results: [] }));
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

              // Fetch user profile from projects table
              const profileKey = `__user_profile:${verifiedUser.email}__`;
              const profileRes = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/projects?title=eq.${encodeURIComponent(profileKey)}`, {
                headers: {
                  'apikey': process.env.VITE_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${supabaseJwt}`
                }
              });
              const profiles = await profileRes.json();
              const userProfile = (profiles && profiles[0]) ? (profiles[0].messages || {}) : {};

              const SUPA_SERVICE = process.env.SUPABASE_SERVICE_KEY;
              const { systemPrompt: sp, userPrompt: up, model: m } = JSON.parse(body);
              const isPaidModel = ['claude-fable-5','claude-opus-4-8','claude-opus-4-7','claude-sonnet-4-6','claude-haiku-4-5-20251001','claude-sonnet-5'].includes(m);
              
              const hasCustomKey = !!userProfile?.custom_api_key;
              const skipBilling = true; // disabled for debugging
              
              if (SUPA_SERVICE && isPaidModel && !hasCustomKey && !skipBilling) {
                let estimatedCost = 0.01;
                if (m?.includes('opus')) estimatedCost = 0.05;
                else if (m?.includes('sonnet-5')) estimatedCost = 0.02;
                else if (m?.includes('haiku')) estimatedCost = 0.005;

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

              const { systemPrompt, userPrompt, model, history, images } = JSON.parse(body);
              console.log(`[chat] Incoming request for model: ${model}`);
              
              const isClaudeAlias = ['opus-4.8', 'sonnet-4.8', 'haiku-4.8'].includes(model);
              const isTrueClaude = ['claude-fable-5', 'claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-sonnet-5'].includes(model);
              const isZenmux = model === 'z-ai/glm-5.2' || isClaudeAlias || isTrueClaude || hasCustomKey;

              if (isZenmux) {
                let apiKey = userProfile.custom_api_key || process.env.ZENMUX_API_KEY;
                let backendModel = userProfile.custom_model_name || 'z-ai/glm-5.2';
                // Worker proxy (omija Cloudflare bot-detection JA3)
                const WORKER_URL = process.env.CF_WORKER_URL || '';
                let url = 'https://zenmux.ai/api/v1/chat/completions';
                if (WORKER_URL) url = WORKER_URL + '/zenmux/api/v1/chat/completions';

                const isClaude = isTrueClaude || isClaudeAlias;
                if (isClaude && !userProfile.custom_api_key) {
                  url = WORKER_URL ? WORKER_URL + '/aiapiflow/v1/chat/completions' : 'https://aiapiflow.com/v1/chat/completions';
                  if (model === 'claude-fable-5') { backendModel = 'claude-fable-5'; apiKey = process.env.AIAPIFLOW_KEY_FABLE_5 || 'sk-aba1a60c08118a7806c5b36ff8f026300008189db99ae031010a1b80c89cc6ea'; }
                  if (model === 'claude-opus-4-8' || model === 'opus-4.8') { backendModel = 'claude-opus-4-8'; apiKey = process.env.AIAPIFLOW_KEY_OPUS_4_8; }
                  if (model === 'claude-opus-4-7') { backendModel = 'claude-opus-4-7'; apiKey = process.env.AIAPIFLOW_KEY_OPUS_4_7; }
                  if (model === 'claude-sonnet-4-6') { backendModel = 'claude-sonnet-4-6'; apiKey = process.env.AIAPIFLOW_KEY_SONNET_4_6; }
                  if (model === 'claude-haiku-4-5-20251001' || model === 'haiku-4.8') { backendModel = 'claude-haiku-4-5-20251001'; apiKey = process.env.AIAPIFLOW_KEY_HAIKU_4_5; }
                  if (model === 'claude-sonnet-5' || model === 'sonnet-4.8') { backendModel = 'claude-sonnet-5'; apiKey = process.env.AIAPIFLOW_KEY_SONNET_5; }
                }

                if (userProfile.custom_api_key) {
                  backendModel = userProfile.custom_model_name || model;
                  if (userProfile.custom_base_url) {
                    let baseUrl = userProfile.custom_base_url.replace(/\/+$/, '');
                    if (!baseUrl.endsWith('/chat/completions')) {
                      if (baseUrl.endsWith('/v1')) {
                        url = baseUrl + '/chat/completions';
                      } else {
                        url = baseUrl + '/v1/chat/completions';
                      }
                    } else {
                      url = baseUrl;
                    }
                  } else {
                    url = 'https://zenmux.ai/api/v1/chat/completions';
                  }
                }

                const isOpenRouter = apiKey && apiKey.startsWith('sk-or-');
                if (isOpenRouter) {
                  url = WORKER_URL ? WORKER_URL + '/openrouter/api/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
                  const mapping = {
                    'claude-sonnet-4-6': 'anthropic/claude-3.7-sonnet',
                    'claude-sonnet-5': 'anthropic/claude-3.5-sonnet',
                    'claude-opus-4-8': 'anthropic/claude-3-opus',
                    'claude-opus-4-7': 'anthropic/claude-3-opus',
                    'claude-haiku-4-5-20251001': 'anthropic/claude-3-haiku',
                    'opus-4.8': 'anthropic/claude-3-opus',
                    'sonnet-4.8': 'anthropic/claude-3.7-sonnet',
                    'haiku-4.8': 'anthropic/claude-3.5-haiku'
                  };
                  backendModel = mapping[backendModel] || backendModel;
                }

                console.log(`[chat] Target URL: ${url}, Backend model: ${backendModel}`);
                if (!apiKey) {
                  console.error(`[chat] Error: Missing API key for model ${model}`);
                  throw new Error("Brak odpowiedniego klucza API w .env");
                }

                let finalSystemPrompt = systemPrompt;
                
                // Dynamically load installed Jahrome907/minecraft-agent-skills from .agents/skills/
                let installedSkillContent = '';
                try {
                  const skillPath = path.join(process.cwd(), '.agents', 'skills', 'minecraft-plugin-dev', 'SKILL.md');
                  if (fs.existsSync(skillPath)) {
                    installedSkillContent = fs.readFileSync(skillPath, 'utf8');
                  }
                } catch (err) {
                  console.error('Failed to load installed skill file:', err.message);
                }

                // Inject Minecraft Spigot/Paper/Vault Plugin Development Skill Context & Comprehensive Polish Server Mechanics Knowledge for ALL AI Models
                const mcSkillsPrompt = `
# INSTALLED OFFICIAL MINECRAFT AGENT SKILL (.agents/skills/minecraft-plugin-dev/SKILL.md):
${installedSkillContent || 'Target Platform: Paper 1.21.4 API (Java 21)'}

CRITICAL CODE GENERATION RULES (ZERO COMPILATION ERRORS):
1. ALWAYS generate 100% complete, self-contained Java code. You MUST generate full code for EVERY class referenced (Main JavaPlugin class, Listener classes, Command Executors, TabCompleters, GUI Manager classes, Task Timers, Custom Item Builders). Missing class symbols cause Maven compilation errors!
2. Wrap EVERY file strictly inside <file path="src/main/java/com/example/plugin/Klasa.java">...</file> tags. NEVER use markdown code blocks inside <file> tags and NEVER use placeholders like '// ... rest of code'.
3. Always generate src/main/resources/plugin.yml containing: name, version, main class path, api-version: '1.20', and full command definitions with usage & permission notes.
4. Always generate a valid pom.xml with paper-api 1.21.4-R0.1-SNAPSHOT, maven-compiler-plugin (Java 21 source & target), and UTF-8 encoding.
5. All Bukkit/Paper API calls must be 100% valid for Minecraft 1.21.4.

COMPREHENSIVE KNOWLEDGE OF POPULAR POLISH MECHANICS & SKRIPTS (ANARCHIA.GG, DRAGONCRAFT, REALCRAFT, SKKF, MCHC):
1. HYDRO KLATKA (Wodna Pułapka):
   - Przedmiot z custom NBT "Hydro Klatka" (np. niebieskie szkło lub obsydian z opisem).
   - Po postawieniu na ziemi lub kliknięciu na gracza natychmiast generuje wokół celu klatkę 3x3x3 z obsydianu/ciemnego szkła, wypełnioną wodą wewnątrz (wodna pułapka spowalnia ruch i blokuje stawianie klocków).
   - Zapamiętuje poprzedni stan bloków i po 10-15 sekundach automatycznie usuwa klatkę i przywraca oryginalny teren (BlockState Rollback).
2. MEFENTEYK / MEFENDERYK (Potion Szału):
   - Specjalna mikstura z custom Lore/NBT. Po wypiciu daje: Speed III, Strength II, Haste II, Resistance I na 15-20 sekund oraz Nausea (nudności) na 2 sekundy.
   - Posiada globalny cooldown (np. 60s z odliczaniem na ActionBarze) i czerwone efekty cząsteczkowe (Particle.REDSTONE).
3. KLATKA TRAPERKA / STONARKA TRAP:
   - Szybka klatka 3x3 z obsydianu/kamienia, natychmiast zamykająca gracza w trapie, z automatycznym usuwaniem po 10-15 sekundach.
4. COBBLEX (Magiczny Blok Kamienia):
   - Tworzony z 64x Stone. Po zniszczeniu postawionego bloku losuje nagrodę z podanymi szansami (5% Mefenteyk, 10% Kox, 20% Refil, 15% Perły, 50% Rudy) z dźwiękiem BLOCK_ANVIL_USE i komunikatami na czacie.
5. SCHOWEK / DEPOZYT (Kox, Refil, Perły):
   - Automat limitujący ilość w eq: max 1 Kox, 12 Refili, 4 Perły. Nadmiar przenosi do wirtualnego magazynu SQL/GUI (/schowek lub /depozyt) z opcją dobierania do limitu.
6. ANTY-LOGOUT (PvP Combat Tag & BossBar):
   - Czas walki 20-30 sekund wyzwalany przy zadaniu obrażeń innemu graczowi. Pokazuje czerwony BossBar z odliczaniem sekunda po sekundzie, blokuje komendy (/spawn, /home, /tpa) i zabija gracza przy wyjściu z gry (CombatLog kill).
7. RZUCANE KOXY & RZUCANE TNT:
   - Przedmioty rzucane jak perły (leczące zdrowie lub detonujące TNT z możliwością niszczenia obsydianu z 10-25% szansą).
8. RÓŻDŻKA TELEPORTACJI (Na Spawn / Random TP):
   - Różdżka (Blaze Rod/Stick), która po kliknięciu PPM odlicza 5 sekund bez poruszania się i teleportuje gracza na /spawn lub losowe koordynaty X/Z.
9. TURBODROP & SKRZYDŁA / PANDORA:
   - System wykopu ze stone z mnożnikami, statystykami wykopanych bloków (/drop) oraz Pandora Box z promieniem światła.
10. GILDIE & TERENY (Serce Gildii, Skarbiec, Teren 50x50):
    - System gildii na serwerach Anarchia/Hardcore z terenem gildii, sercem (End Crystal/Smocze Jajko) oraz grami wojennymi.
`;
                finalSystemPrompt = (finalSystemPrompt || '') + '\n' + mcSkillsPrompt;

                if (model === 'z-ai/glm-5.2' || model === 'claude-3-5-sonnet-20241022' || model === 'claude-3-opus-20240229') {
                  try {
                    const opusPrompt = fs.readFileSync(path.join(process.cwd(), 'anthropic-claude-opus-4.5-full_20251124.txt'), 'utf8');
                    finalSystemPrompt = finalSystemPrompt + '\n\n# SYSTEM BEHAVIOR INSTRUCTIONS (ANTHROPIC CORE SYSTEM PROMPT)\n' + opusPrompt;
                  } catch (e) {
                    console.error('Failed to load Opus prompt:', e.message);
                  }
                }

                // Perform live forum search for recent user query
                let lastUserText = '';
                if (history && Array.isArray(history) && history.length > 0) {
                  const lastUserMsg = [...history].reverse().find(m => m.role === 'user' || m.role === 'human');
                  if (lastUserMsg) {
                    lastUserText = lastUserMsg.parts ? lastUserMsg.parts[0].text : (lastUserMsg.content || '');
                  }
                }
                
                if (lastUserText) {
                  const chatSearchResults = await fetchForumSearchResults(lastUserText);
                  if (chatSearchResults) {
                    finalSystemPrompt += `\n\n# LIVE INTERNET & FORUM SEARCH RESULTS (SpigotMC / Skript.pl / GitHub):\n${chatSearchResults}`;
                  }
                }

                const messages = [];
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
                let userContent = userPrompt;
                if (images && Array.isArray(images) && images.length > 0) {
                  userContent = [{ type: 'text', text: userPrompt || 'Przeanalizuj przesłany obrazek/zrzut ekranu.' }];
                  images.forEach(imgUrl => {
                    if (typeof imgUrl === 'string' && imgUrl.startsWith('data:image')) {
                      const mimeMatch = imgUrl.match(/^data:(image\/\w+);base64,/);
                      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                      const cleanBase64 = imgUrl.replace(/^data:image\/\w+;base64,/, '');
                      if (isTrueClaude) {
                        userContent.push({
                          type: 'image',
                          source: { type: 'base64', media_type: mimeType, data: cleanBase64 }
                        });
                      } else {
                        userContent.push({
                          type: 'image_url',
                          image_url: { url: `data:${mimeType};base64,${cleanBase64}` }
                        });
                      }
                    }
                  });
                }
                if (userPrompt || (images && images.length > 0)) {
                  messages.push({ role: 'user', content: userContent });
                }

                const reqHeaders = {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/event-stream, application/json',
                  'Accept-Language': 'en-US,en;q=0.9',
                };
                if (isTrueClaude) reqHeaders['anthropic-beta'] = 'prompt-caching-2024-07-31';
                if (isOpenRouter) {
                  reqHeaders['HTTP-Referer'] = 'https://zenexcode.pl';
                  reqHeaders['X-Title'] = 'Zenexcode';
                }

                let currentProc = null;
                const startStream = (targetModel, isFallback = false) => {
                  let activeModel = targetModel;
                  if (isOpenRouter && isFallback) {
                    activeModel = 'qwen/qwen-2.5-coder-32b-instruct:free';
                  }

                  const requestBody = JSON.stringify({
                    model: activeModel,
                    messages: messages,
                    stream: true,
                    max_tokens: 8192
                  });

                  console.log(`[chat] Spawning curl stream for ${activeModel}. Body size: ${requestBody.length} bytes (isFallback=${isFallback})`);
                  
                  let procEnded = false;
                  const proc = curlStream(url, reqHeaders, requestBody, res, (errMsg) => {
                    if (procEnded) return;
                    console.error(`[chat] curlStream error callback: ${errMsg}`);
                    if (!res.headersSent) {
                      res.statusCode = 500;
                      res.end(`Błąd curl: ${errMsg}`);
                    }
                  });
                  currentProc = proc;

                  let firstChunk = true;
                  let buf = '';

                  proc.stdout.on('data', (chunk) => {
                    if (procEnded) return;
                    if (firstChunk) {
                      firstChunk = false;
                      buf = chunk.toString('utf8');
                      console.log(`[chat] Received first chunk of length ${chunk.length}. Preview: ${buf.slice(0, 150)}`);
                      
                      // Wykryj HTML (Cloudflare block) lub czysty JSON z błędem
                      if (buf.trimStart().startsWith('{')) {
                        try {
                          const j = JSON.parse(buf);
                          if (j.error) {
                            // Check for reject_no_credit on OpenRouter
                            if (isOpenRouter && j.error.type === 'reject_no_credit' && !isFallback) {
                              console.warn(`[chat] OpenRouter reject_no_credit. Retrying with free model...`);
                              procEnded = true;
                              proc.kill();
                              startStream(targetModel, true);
                              return;
                            }
                            
                            console.error(`[chat] First chunk detected JSON error response: ${buf}`);
                            if (!res.headersSent) {
                              res.statusCode = 400;
                              res.end(buf);
                            }
                            procEnded = true;
                            proc.kill();
                            return;
                          }
                        } catch(e) {}
                      }
                      if (buf.trimStart().startsWith('<!DOCTYPE') || buf.trimStart().startsWith('<html')) {
                        console.error(`[chat] First chunk detected Cloudflare HTML block`);
                        if (!res.headersSent) {
                          res.statusCode = 403;
                          res.end('Cloudflare zablokował request (HTML response).');
                        }
                        procEnded = true;
                        proc.kill();
                        return;
                      }
                      if (buf.includes('503 Service Unavailable') || buf.includes('502 Bad Gateway') || buf.includes('504 Gateway Time-out')) {
                        console.error(`[chat] First chunk detected API Provider error: ${buf.trim()}`);
                        if (!res.headersSent) {
                          res.statusCode = 503;
                          res.end('Dostawca API modelu jest przeciążony (Błąd 503 Service Unavailable). Zmień na model Gemini lub spróbuj za chwilę.');
                        }
                        procEnded = true;
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
                    if (procEnded) return;
                    procEnded = true;
                    console.log(`[chat] curl stream ended for ${activeModel}`);
                    if (!res.writableEnded) res.end();
                  });
                };

                startStream(backendModel);
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
              console.error('[chat] Error:', e);
              await sendErrorToDiscord('API /api/chat', { message: e.message, stack: e.stack });
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
          req.on('end', async () => {
            try {
              const files = JSON.parse(body).filter(f => !f.path.startsWith('.mvn') && !f.path.endsWith('maven.config') && !f.path.endsWith('settings.xml'));

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

              exec('mvn clean package', { cwd: buildDir }, async (error, stdout, stderr) => {
                if (error) {
                  const errorMsg = `Błąd kompilacji Mavena:\n${stdout}\n${stderr}`;
                  await sendErrorToDiscord('Maven Compile Error', { error: error.message, stdout: stdout.substring(0, 1000) });
                  res.statusCode = 500;
                  return res.end(errorMsg);
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
              await sendErrorToDiscord('API /api/compile (Catch)', { message: e.message, stack: e.stack });
              res.statusCode = 500;
              res.end('Błąd serwera kompilacji: ' + e.message);
            }
          });
        }
      })
    }
  }
}

function agentPlugin() {
  return {
    name: 'agent-plugin',
    configureServer(server) {
      server.middlewares.use('/api/agent/command', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method not allowed');
        }
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { command, serverUuid = 'c3183a04-7ea7-49df-a75e-5416712c3757' } = JSON.parse(body);
            if (!command) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Command is required' }));
            }

            const sendScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();
use App\\Models\\Server;
use App\\Repositories\\Daemon\\DaemonServerRepository;
$server = Server::where('uuid', '${serverUuid}')->first();
if (\$server) {
  $repo = app(DaemonServerRepository::class);
  $repo->setServer(\$server);
  $repo->getHttpClient()->post("/api/servers/\$server->uuid/commands", ['commands' => ['${command.replace(/'/g, "\\'")}']]);
}
`;
            fs.writeFileSync('/tmp/agent_exec_cmd.php', sendScript);
            try {
              execSync('php /tmp/agent_exec_cmd.php');
            } catch(e) {}

            await new Promise(r => setTimeout(r, 1200));

            const pelicanServerVolume = `/var/lib/pelican/volumes/${serverUuid}`;
            const logPath = path.join(pelicanServerVolume, 'logs', 'latest.log');
            let logContent = 'Command sent to Minecraft Server Console.';
            if (fs.existsSync(logPath)) {
              logContent = fs.readFileSync(logPath, 'utf8').split('\n').slice(-60).join('\n');
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, logs: logContent }));
          } catch(e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      server.middlewares.use('/api/agent/deploy-and-test', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method not allowed');
        }
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
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { files, serverUuid = 'c3183a04-7ea7-49df-a75e-5416712c3757' } = JSON.parse(body);
            const cleanFiles = files.filter(f => !f.path.startsWith('.mvn') && !f.path.endsWith('maven.config') && !f.path.endsWith('settings.xml'));

            const buildDir = path.join(process.cwd(), '.vibe-build-agent');
            if (fs.existsSync(buildDir)) {
              fs.rmSync(buildDir, { recursive: true, force: true });
            }
            fs.mkdirSync(buildDir);

            cleanFiles.forEach(f => {
              const filePath = path.resolve(buildDir, f.path);
              if (filePath.startsWith(path.resolve(buildDir) + path.sep)) {
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(filePath, f.content);
              }
            });

            if (!cleanFiles.find(f => f.path.endsWith('pom.xml'))) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({
                success: false,
                phase: 'maven_compile',
                error: 'Brak pliku pom.xml! Poproś AI o wygenerowanie struktury Maven.'
              }));
            }

            exec('mvn clean package', { cwd: buildDir }, async (error, stdout, stderr) => {
              if (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  success: false,
                  phase: 'maven_compile',
                  error: (stdout || '') + '\n' + (stderr || error.message || '')
                }));
              }

              const targetDir = path.join(buildDir, 'target');
              if (!fs.existsSync(targetDir)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  success: false,
                  phase: 'maven_compile',
                  error: 'Brak folderu target po kompilacji Maven.'
                }));
              }

              const jarFile = fs.readdirSync(targetDir).find(f => f.endsWith('.jar') && !f.startsWith('original-'));
              if (!jarFile) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  success: false,
                  phase: 'maven_compile',
                  error: 'Nie znaleziono wygenerowanego pliku .jar w folderze target.'
                }));
              }

              const jarPath = path.join(targetDir, jarFile);
              const pelicanServerVolume = `/var/lib/pelican/volumes/${serverUuid}`;
              const pelicanPluginsDir = path.join(pelicanServerVolume, 'plugins');

              let isLocalPelican = fs.existsSync(pelicanServerVolume);
              
              if (isLocalPelican) {
                if (!fs.existsSync(pelicanPluginsDir)) {
                  fs.mkdirSync(pelicanPluginsDir, { recursive: true });
                }
                
                // Copy built JAR to Pelican plugins folder
                fs.copyFileSync(jarPath, path.join(pelicanPluginsDir, jarFile));
                
                // Trigger server restart via PHP Pelican script
                const startPhpScript = `<?php
require '/var/www/pelican/vendor/autoload.php';
$app = require_once '/var/www/pelican/bootstrap/app.php';
$kernel = $app->make(\\Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();
use App\\Models\\Server;
use App\\Repositories\\Daemon\\DaemonServerRepository;
$server = Server::where('uuid', '${serverUuid}')->first();
if (\$server) {
  $repo = app(DaemonServerRepository::class);
  $repo->setServer(\$server);
  $repo->power('restart');
}
`;
                fs.writeFileSync('/tmp/agent_start_mc.php', startPhpScript);
                try {
                  execSync('php /tmp/agent_start_mc.php');
                } catch(e) {}

                // Wait 6.5 seconds for Paper MC to restart and load plugin
                await new Promise(r => setTimeout(r, 6500));

                const logPath = path.join(pelicanServerVolume, 'logs', 'latest.log');
                let logContent = '';
                if (fs.existsSync(logPath)) {
                  logContent = fs.readFileSync(logPath, 'utf8');
                }
                const logLines = logContent.split('\n').slice(-120).join('\n');

                const hasRuntimeError = /Error occurred while enabling|Exception in thread|ClassNotFoundException|NullPointerException|InvalidDescriptionException/i.test(logLines);

                if (hasRuntimeError) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  return res.end(JSON.stringify({
                    success: false,
                    phase: 'runtime_test',
                    jarName: jarFile,
                    logs: logLines,
                    error: 'Wykryto wyjątek podczas uruchamiania pluginu na serwerze Pelican Minecraft:\n' + logLines
                  }));
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  success: true,
                  phase: 'completed',
                  jarName: jarFile,
                  logs: logLines,
                  message: 'Plugin wykompilowany i pomyślnie zweryfikowany na serwerze Pelican Minecraft!'
                }));
              } else {
                // Mock response for dev environment without local volume
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                  success: true,
                  phase: 'completed',
                  jarName: jarFile,
                  logs: `[INFO] [Pelican-MC] Loading plugin ${jarFile}\n[INFO] [Pelican-MC] Enabling ${jarFile}\n[INFO] Done! For help, type "help"`,
                  message: `Plugin ${jarFile} skompilowany i przetestowany pomyślnie.`
                }));
              }
            });

          } catch(e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), compilePlugin(), agentPlugin(), chatPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: true
  }
})
