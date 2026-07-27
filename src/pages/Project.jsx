import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ChevronDown, Send, FileCode, Sparkles, ArrowLeft, Trash2, Settings as SettingsIcon, Wallet, Copy, Check, ChevronRight, Lightbulb, Wrench, Lock, Download, FileText, Code2, Terminal, RefreshCw, User, Bot, Image as ImageIcon, Paperclip, X, Play, Square, CheckCircle2, AlertTriangle, Cpu, Layers, Loader2, ShieldAlert, Server, Box, CheckCircle, Globe } from 'lucide-react';
import { supabase } from '../supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveAs } from 'file-saver';
import { useLang } from '../LangContext';
import './Project.css';

const ClaudeIcon = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.16 4.5c-1.02 0-1.96.57-2.44 1.48L4.44 33.38c-.45.85-.43 1.87.05 2.7.48.83 1.37 1.34 2.33 1.34h4.96c1.02 0 1.96-.57 2.44-1.48l3.94-7.5h6.68l3.94 7.5c.48.91 1.42 1.48 2.44 1.48h4.96c.96 0 1.85-.51 2.33-1.34.48-.83.5-1.85.05-2.7L24.08 5.98A2.77 2.77 0 0021.64 4.5h-.48zm-.64 11.3l4.04 7.7h-8.08l4.04-7.7z" fill="currentColor"/>
  </svg>
);

const GLMIcon = ({size=14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="9" height="9" rx="2"/>
    <rect x="13" y="2" width="9" height="9" rx="2" opacity="0.7"/>
    <rect x="2" y="13" width="9" height="9" rx="2" opacity="0.7"/>
    <rect x="13" y="13" width="9" height="9" rx="2"/>
  </svg>
);

const ModelIcon = ({modelId, size=13}) => {
  if (modelId?.startsWith('claude')) {
    return <img src="/anthropic.png" alt="Claude" style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  if (modelId?.includes('glm')) {
    return <img src="/glm.webp" alt="GLM" style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  return <Sparkles size={size}/>;
};

const MINECRAFT_SERVERS_KNOWLEDGE = `
# BAZA WIEDZY O SKRYPTACH I MECHANIKACH POPULARNYCH SERWERÓW MINECRAFT

1. ANARCHIA.GG / ANARCHIA / SURVIVAL+FRAKCJE:
- Mefedron / Mefentyk (&d&lMefentyk Anarchia): Customowy przedmiot (np. Sugar / Pink Dye / Amethyst Shard) z lore "&7Spożycie daje ekstremalną moc!". Po zjedzeniu (PlayerInteractEvent z Potion/Food lub Right Click): daje PotionEffectType.INCREASE_DAMAGE II (30s), SPEED III (30s), CONFUSION I (10s), oraz spawner cząsteczek Particle.PORTAL wokół gracza przez 5s.
- CobbleX (&8&lCobbleX): Wykonany z 9x64 Cobblestone w CraftingTable lub GUI Rzemieślnika. Po postawieniu/użyciu daje losowe przedmioty: Kox (Enchanted Golden Apple), Refil, Elytra, Różdżka Teleportacyjna, Siekiera 6/3/3, Złote Jabłko.
- Pandora (&c&lPandora): Customowa skrzynia (End Portal Frame lub Chest). Po postawieniu odtwarza Sound.ENTITY_ILLUSIONER_PREPARE_MIRROR i przyzywa wybuch cząsteczek (FireworkMeta / Particle.EXPLOSION_EMITTER), a następnie wyrzuca wartościowy drop (64x Diamond, Koxy, Totem Nieśmiertelności, Różdżki).
- Różdżka na Spawn / Schron (&a&lRóżdżka na Spawn): Przedmiot dający teleportację na Spawn lub do Schronu po 5 sekundach oczekiwania bez poruszania się (z odliczaniem na ActionBar / Title oraz zrujnowaniem przy poruszeniu).
- GUI Dropu & AutoSmelt & AutoSell (/drop, /turbodrop): Interfejs GUI pozwalający włączać/wyłączać dropy surowców z kamienia (Diamenty, Szmaragdy, Złoto, Żelazo, Węgiel, Redstone, Perły, Jabłka), włączać automatyczne przetapianie (AutoSmelt - kamień od razu daje Iron/Gold Ingot) oraz włączać wirtualną sprzedaż (AutoSell). Mnożnik TurboDrop (np. 2x, 3x) włączany komendą admina.

2. HYPIXEL / BEDWARS / SKYWARS:
- Generatory Surowców (Resource Generators): Zadanie BukkitRunnable działające w tle sprawnie generujące przedmioty (Iron Ingot, Gold Ingot, Diamond, Emerald) w określonych koordynatach z uaktualnianym Hologramem (ArmorStand z CustomName) pokazującym czas do następnego zrzutu.
- Sklep w GUI (Item Shop): Menu GUI umożliwiające wymianę surowców (np. 4x Gold -> Miecz Żelazny, 12x Iron -> 16x Wool, 4x Diamond -> Ulepszenie Ostrze I).
- Trapy Drużynowe (Team Traps): Wykrywanie zbliżania się wrogich graczy do bazy drużyny i natychmiastowe nakładanie na intruza Blindness II + Slowness II na 5 sekund z odtworzeniem Sound.ENTITY_ENDER_DRAGON_GROWL dla członków drużyny.

3. MEDIUMHARDHC / MSHC / DRAGONCRAFT:
- Schowek na Koxy/Refile/Perły (/schowek, /depozyt): System automatycznie ograniczający ilość specjalnych przedmiotów w ekwipunku gracza (np. max 2x Kox, 8x Refil, 12x Perła Endu). Nadmiar jest natychmiastowo zabierany i zapisywany w wirtualnym schowku pod komendą /schowek lub /depozyt, skąd gracz może je wypłacić przyciskiem w GUI.
- BoyFarmer, SandFarmer, KopaczFosylidów: Specjalne bloki (np. Obsidian / Sand / Sponge). Po postawieniu na ziemi tworzą pionową kolumnę obsydianu lub piasku aż do poziomu Bedrocka, bądź drążą pionowy szyb usuwając kamień.
- Stoniarki (Generator Kamienia): Blok (np. End Stone / Piston) tworzący blok Kamienia (Stone) powyżej siebie natychmiast po wykopaniu.

4. CRAFTBUKKIT / BOXPVP:
- Odnawialne Surowce (Renewable Ore Regions): Event BlockBreakEvent zamieniający wykopany blok rzadkiego surowca (np. Diamond Block / Netherite Block) w Bedrock na Czas N sekund, po czym automatycznie odnawiający blok z efektami Particle.HAPPY_VILLAGER.
- System Prestiżu (/prestige): Menu GUI pozwalające graczowi zresetować poziom surowców w zamian za rządek Prestiżu (np. Prestiż I -> odblokowuje Strefę AFK VIP oraz darmowy Multiplier monet +20%).
- Sklep za Monety / Perły: System wymieniania waluty BoxPvP na ulepszone Miecze (np. Miecz z Sharpness VI i Knockback I).
`;

const syntaxCache = new Map();
const MAX_SYNTAX_CACHE_SIZE = 400;

const highlightVSCodeSyntax = (codeStr, filenameOrLang = '') => {
  if (!codeStr) return '';
  const str = String(codeStr);
  const cacheKey = str.length + '_' + filenameOrLang + '_' + str.slice(0, 80) + '_' + str.slice(-80);
  if (syntaxCache.has(cacheKey)) {
    return syntaxCache.get(cacheKey);
  }
  
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  let safeStr = str.replace(/[&<>"']/g, m => escapeMap[m]);

  const tokens = [];
  const addToken = (html) => {
    const key = `___TOKEN_${tokens.length}___`;
    tokens.push(html);
    return key;
  };

  let tokenized = safeStr;

  // Single line & multi-line comments
  tokenized = tokenized.replace(/(\/\/[^\n]*|#[^\n]*)/g, (m) => addToken(`<span style="color:#6a9955;font-style:italic;">${m}</span>`));
  tokenized = tokenized.replace(/(\/\*[\s\S]*?\*\/|&lt;!--[\s\S]*?--&gt;)/g, (m) => addToken(`<span style="color:#6a9955;font-style:italic;">${m}</span>`));

  // Strings ("..." or '...')
  tokenized = tokenized.replace(/(&quot;[^\n&]*?&quot;|&#039;[^\n&]*?&#039;)/g, (m) => addToken(`<span style="color:#ce9178;">${m}</span>`));

  // Annotations
  tokenized = tokenized.replace(/(@[a-zA-Z0-9_]+)/g, (m) => addToken(`<span style="color:#dcdcaa;">${m}</span>`));

  // Keywords
  const keywordsRegex = /\b(public|private|protected|class|interface|enum|void|return|package|import|extends|implements|new|if|else|for|while|do|try|catch|finally|throw|throws|final|static|boolean|int|long|double|float|byte|short|char|true|false|null|this|super|instanceof|var|default|case|switch|break|continue|abstract)\b/g;
  tokenized = tokenized.replace(keywordsRegex, (m) => addToken(`<span style="color:#569cd6;font-weight:600;">${m}</span>`));

  // XML / HTML Tags
  tokenized = tokenized.replace(/(&lt;\/?[a-zA-Z0-9_-]+)/g, (m) => addToken(`<span style="color:#569cd6;">${m}</span>`));
  tokenized = tokenized.replace(/(\s+[a-zA-Z0-9_-]+)(=)/g, (m, p1, p2) => addToken(`<span style="color:#9cdcfe;">${p1}</span>${p2}`));

  // YAML keys
  tokenized = tokenized.replace(/^(\s*)([a-zA-Z0-9_-]+)(:)/gm, (m, p1, p2, p3) => `${p1}` + addToken(`<span style="color:#9cdcfe;font-weight:600;">${p2}</span>`) + `${p3}`);

  // Class names
  tokenized = tokenized.replace(/\b([A-Z][a-zA-Z0-9_]+)\b/g, (m) => addToken(`<span style="color:#4ec9b0;">${m}</span>`));

  // Numbers
  tokenized = tokenized.replace(/\b(\d+(\.\d+)?)\b/g, (m) => addToken(`<span style="color:#b5cea8;">${m}</span>`));

  for (let i = tokens.length - 1; i >= 0; i--) {
    tokenized = tokenized.replace(`___TOKEN_${i}___`, tokens[i]);
  }

  if (syntaxCache.size >= MAX_SYNTAX_CACHE_SIZE) {
    const firstKey = syntaxCache.keys().next().value;
    syntaxCache.delete(firstKey);
  }
  syntaxCache.set(cacheKey, tokenized);

  return tokenized;
};

const AvatarBadge = ({ isUser, user, modelId }) => {
  if (isUser) {
    const avatarUrl = user?.user_metadata?.discord_profile?.avatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt="User" 
          className="w-7 h-7 rounded-full border border-white/20 object-cover shadow-sm flex-shrink-0 mt-0.5" 
        />
      );
    }
    const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
    return (
      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff6b00] to-[#ff9900] text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0 border border-white/20 mt-0.5">
        {initial}
      </div>
    );
  }

  const modelLower = (modelId || '').toLowerCase();
  if (modelLower.includes('claude') || modelLower.includes('sonnet') || modelLower.includes('opus') || modelLower.includes('haiku')) {
    return (
      <div className="w-7 h-7 rounded-full bg-[#cc6b2c]/20 border border-[#ff8c3b]/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 mt-0.5">
        <img src="/anthropic.png" alt="Claude" className="w-4 h-4 object-contain" />
      </div>
    );
  }
  
  return (
    <div className="w-7 h-7 rounded-full bg-[#1e293b] border border-sky-500/40 flex items-center justify-center p-1 shadow-sm flex-shrink-0 mt-0.5">
      <img src="/glm.webp" alt="GLM" className="w-4 h-4 object-contain" />
    </div>
  );
};

const fetchWithRetry = async (url, options, maxRetries = 3, delayMs = 1500) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(url, options);
      if ([502, 503, 504, 429].includes(res.status) && attempt < maxRetries - 1 && !options.signal?.aborted) {
        console.warn(`[chat] HTTP ${res.status} received. Retrying attempt ${attempt + 1}/${maxRetries}...`);
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
        attempt++;
        continue;
      }
      return res;
    } catch (err) {
      if (options.signal?.aborted) throw err;
      if (attempt < maxRetries - 1) {
        console.warn(`[chat] Fetch error: ${err.message}. Retrying attempt ${attempt + 1}/${maxRetries}...`);
        await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
        attempt++;
      } else {
        throw err;
      }
    }
  }
};

const generateWithBackend = async (
  model, 
  systemPrompt, 
  userPrompt, 
  history, 
  updateMsgCb, 
  abortControllerRef,
  autoContinueCount = 0,
  accumulatedText = '',
  images = []
) => {
  if (!abortControllerRef.current || autoContinueCount === 0) {
    abortControllerRef.current = new AbortController();
  }
  const signal = abortControllerRef.current.signal;
  const url = '/api/chat';
  
  const { data: { session } } = await (await import('../supabase')).supabase.auth.getSession();
  const jwt = session?.access_token || '';

  let fullText = accumulatedText;
  let buffer = '';
  let hasStartedReasoning = fullText.includes('<think>');
  let hasEndedReasoning = fullText.includes('</think>');

  let lastStreamUpdateTime = 0;
  let streamRafId = null;
  const throttledUpdateCb = (text) => {
    const now = Date.now();
    if (now - lastStreamUpdateTime > 35) {
      lastStreamUpdateTime = now;
      if (streamRafId) cancelAnimationFrame(streamRafId);
      updateMsgCb(text);
    } else {
      if (!streamRafId) {
        streamRafId = requestAnimationFrame(() => {
          streamRafId = null;
          lastStreamUpdateTime = Date.now();
          updateMsgCb(text);
        });
      }
    }
  };

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      signal,
      body: JSON.stringify({
        model: model,
        systemPrompt: systemPrompt,
        userPrompt: userPrompt,
        history: history,
        images: images
      })
    }, 3, 1500);
    
    if (!response.ok) {
      const errText = await response.text();
      const shortErr = errText.length > 200 ? errText.substring(0, 200) + '...' : errText;
      throw new Error(`API Error ${response.status}: ${shortErr}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error("Błąd: Serwer zwrócił HTML zamiast strumienia danych.");
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    while (true) {
      if (signal.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
          try {
            const rawParsed = JSON.parse(trimmedLine);
            if (rawParsed.error) {
              throw new Error(rawParsed.error.message || JSON.stringify(rawParsed.error));
            }
          } catch(e) {
            if (e.message && e.message.includes('API Error') === false && !e.message.includes('Unexpected token')) {
               throw e;
            }
          }
        }
        
        if (!trimmedLine.startsWith('data:')) continue;
        
        const dataStr = trimmedLine.replace(/^data:\s*/, '').trim();
        if (dataStr === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.choices && parsed.choices[0].delta) {
            const delta = parsed.choices[0].delta;
            
            const reasoning = delta.reasoning_content || delta.reasoning;
            if (reasoning) {
              if (!hasStartedReasoning) {
                fullText += '<think>\n';
                hasStartedReasoning = true;
              }
              fullText += reasoning;
              throttledUpdateCb(fullText);
            }
            
            if (delta.content) {
              if (hasStartedReasoning && !hasEndedReasoning) {
                fullText += '\n</think>\n\n';
                hasEndedReasoning = true;
              }
              fullText += delta.content;
              throttledUpdateCb(fullText);
            }
          } else if (parsed.content) {
            fullText += parsed.content;
            throttledUpdateCb(fullText);
          } else if (parsed.error) {
            throw new Error(`API Error: ${parsed.error.message || JSON.stringify(parsed.error)}`);
          }
        } catch(e) {
          if (e.message && e.message.includes('API Error')) throw e;
          console.error("SSE JSON Parse Error for line:", dataStr, e);
        }
      }
    }
    updateMsgCb(fullText);
  } catch (err) {
    if (signal.aborted) throw err;

    // Auto-continue if we were cut off mid-generation
    if (fullText.trim().length > 50 && autoContinueCount < 3) {
      console.warn(`[chat] Stream dropped mid-generation (${err.message}). Auto-continuing (attempt ${autoContinueCount + 1})...`);
      
      const lastContext = fullText.slice(-400);
      const continuationPrompt = `[AUTOMATYCZNY SERWEROWY MECHANIZM KONTYNUACJI PO PRZERWANIU POŁĄCZENIA/API]
Twoja poprzednia odpowiedź została przerwana w poniższym miejscu ze względu na chwilowy błąd połączenia z serwerem API.

--- OSTATNI WYGENEROWANY FRAGMENT TWOJEJ WYPOWIEDZI ---
${lastContext}
--- KONIEC FRAGMENTU ---

ZASADA KONTYNUACJI: Następne słowo, które wygenerujesz, musi być BEZPOŚREDNIĄ kontynuacją od pierwszego znaku po powyższym fragmencie. KATEGORYCZNIE NIE POWTARZAJ ANI JEDNEGO SŁOWA z tego co napisano powyżej! Dokończ kodowanie pliku, zamknij otwarte tagi <file> oraz wszelkie otwarte klasy i struktury.`;

      return await generateWithBackend(
        model, 
        systemPrompt, 
        continuationPrompt, 
        history, 
        updateMsgCb, 
        abortControllerRef, 
        autoContinueCount + 1, 
        fullText
      );
    }
    throw err;
  }

  if (hasStartedReasoning && !hasEndedReasoning) {
    fullText += '\n</think>\n\n';
    hasEndedReasoning = true;
    updateMsgCb(fullText);
  }

  // Check for unclosed <file> tag (truncated response by token limit)
  const openFileCount = (fullText.match(/<file\s+path=/g) || []).length;
  const closeFileCount = (fullText.match(/<\/file>/g) || []).length;

  if (openFileCount > closeFileCount && autoContinueCount < 3 && !signal.aborted) {
    console.warn(`[chat] Detected unclosed <file> tag (${openFileCount} open, ${closeFileCount} closed). Auto-continuing file generation...`);
    const lastContext = fullText.slice(-500);
    const fileContinuationPrompt = `[AUTOMATYCZNA KONTYNUACJA UTRACONEGO/OBCIĘTEGO KODU PLIKU]
Twoja odpowiedź osiągnęła limit tokenów i plik nie został zamknięty tagiem </file>.

--- OSTATNI FRAGMENT KODU ---
${lastContext}
--- KONIEC FRAGMENTU ---

Kontynuuj kodowanie dokładnie od tego miejsca w kodzie, dokończ obecną klasę/plik i zamknij go tagiem </file>. Następnie dokończ pozostałe pliki jeśli są wymagane. NIE POWTARZAJ niczego co wygenerowałeś wcześniej.`;

    return await generateWithBackend(
      model, 
      systemPrompt, 
      fileContinuationPrompt, 
      history, 
      updateMsgCb, 
      abortControllerRef, 
      autoContinueCount + 1, 
      fullText
    );
  }

  return fullText;
};

const isClaudeModel = (model) => {
  return ['claude-fable-5', 'opus-4.8', 'sonnet-4.8', 'haiku-4.8', 'claude-opus-4-7', 'claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-sonnet-5'].includes(model);
};

const getIdentityInjection = (model) => {
  if (model === "claude-fable-5") {
    return "Nazywasz się Claude Fable 5. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Claude Fable 5. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  } else if (model === "opus-4.8" || model === "claude-opus-4-8") {
    return "Nazywasz się Claude Opus 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Opus 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  } else if (model === "claude-opus-4-7") {
    return "Nazywasz się Claude Opus 4.7. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Opus 4.7. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  } else if (model === "sonnet-4.8") {
    return "Nazywasz się Claude Sonnet 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Sonnet 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  } else if (model === "claude-sonnet-4-6") {
    return "Nazywasz się Claude Sonnet 4.6. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Sonnet 4.6. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  } else if (model === "claude-sonnet-5") {
    return "Nazywasz się Claude Sonnet 5.0. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Sonnet 5.0. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  } else if (model === "haiku-4.8") {
    return "Nazywasz się Claude Haiku 4.8. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Haiku 4.8. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  } else if (model === "claude-haiku-4-5-20251001") {
    return "Nazywasz się Claude Haiku 4.5. Jeśli użytkownik zapyta kim jesteś lub jak się nazywasz, musisz kategorycznie odpowiedzieć, że jesteś modelem Haiku 4.5. Odpowiedz czystym tekstem, bez tagów HTML/XML.\n";
  }
  return "";
};

const getModelDisplayName = (model) => {
  if (!model) return 'GLM 5.2 (z-ai)';
  const mapping = {
    'claude-fable-5': 'Claude Fable 5',
    'gemini-1.5-pro': 'Gemini 2.5 Pro',
    'z-ai/glm-5.2': 'GLM 5.2 (z-ai)',
    'opus-4.8': 'Opus 4.8',
    'sonnet-4.8': 'Sonnet 4.8',
    'haiku-4.8': 'Haiku 4.8',
    'claude-opus-4-7': 'Claude Opus 4.7',
    'claude-opus-4-8': 'Claude Opus 4.8',
    'claude-sonnet-4-6': 'Claude Sonnet 4.6',
    'claude-sonnet-5': 'Claude Sonnet 5.0',
    'claude-haiku-4-5-20251001': 'Claude Haiku 4.5'
  };
  return mapping[model] || model || 'GLM 5.2 (z-ai)';
};

const CodeBlock = ({ lang, className, children, canViewCode, isEN, ...props }) => {
  const [copied, setCopied] = useState(false);
  const code = String(children);
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="msg-code-block">
      <div className="msg-code-header">
        <span className="msg-code-lang">{lang}</span>
      </div>
      {canViewCode ? (
        <code className={className} dangerouslySetInnerHTML={{ __html: highlightVSCodeSyntax(code, lang) }} {...props} />
      ) : (
        <div style={{
          padding: '1rem',
          fontSize: '0.8rem',
          color: '#F59E0B',
          background: 'rgba(120, 53, 4, 0.1)',
          border: '1px solid rgba(120, 53, 4, 0.2)',
          borderRadius: '6px',
          margin: '0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Lock size={12} />
          <span>
            {isEN 
              ? 'Code preview is locked. Upgrade your plan to view code.' 
              : 'Podgląd kodu zablokowany. Ulepsz plan, aby zobaczyć kod.'}
          </span>
        </div>
      )}
    </div>
  );
};

const FileBlock = ({ fb, userProfile }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { lang } = useLang();
  const isEN = lang === 'en';
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(fb.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const ext = fb.path.split('.').pop();
  
  const canViewCode = userProfile?.plan && 
                      userProfile.plan.toLowerCase() !== 'free' && 
                      userProfile.plan.toLowerCase() !== 'darmowy';
  
  return (
    <div className={`cf-item ${fb.isEdit ? 'edited' : 'created'} ${open ? 'open' : ''}`}>
      <button className="cf-item-toggle" onClick={() => setOpen(v => !v)}>
        <ChevronRight size={11} className={`cf-chevron${open ? ' open' : ''}`}/>
        <span className="cf-item-action">{fb.isEdit ? (isEN ? 'Edited' : 'Edytuje') : (isEN ? 'Created' : 'Utworzono')}</span>
        <span className="cf-item-path" title={fb.path}>{fb.path}</span>
        <span className="cf-item-ext">.{ext}</span>
      </button>
      {open && (
        canViewCode ? (
          <pre className="cf-item-code"><code dangerouslySetInnerHTML={{ __html: highlightVSCodeSyntax(fb.code, fb.path) }} /></pre>
        ) : (
          <div className="p-3 text-xs text-[#F59E0B] bg-[#78350f]/10 border-t border-[#78350f]/20 flex items-center gap-2">
            <Lock size={12} />
            {isEN ? 'Code preview is available from Plan 1.' : 'Podgląd kodu dostępny tylko od planu pierwszego.'}
          </div>
        )
      )}
    </div>
  );
};

const ChatMessageItem = React.memo(({ msg, idx, isEN, currentUser, modelId, renderMessageContent }) => {
  const isUser = msg.sender === 'You';
  return (
    <div className={`flex w-full gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <AvatarBadge isUser={false} user={currentUser} modelId={modelId} />
      )}
      <div className={`flex flex-col max-w-[92%] sm:max-w-[88%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-bold text-[#94a3b8]">
            {isUser ? (isEN ? 'You' : 'Ty') : getModelDisplayName(modelId)}
          </span>
          <span className="text-[10px] font-mono text-[#64748b]">{msg.time}</span>
        </div>
        <div className={`relative w-full overflow-x-auto text-xs sm:text-[13px] ${isUser ? 'bg-[#ff6b00] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-md' : 'bg-[#13151d] border border-white/10 text-[#f8fafc] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-md prose prose-invert max-w-none prose-p:leading-relaxed'}`}>
          {msg.images && msg.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {msg.images.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt={`Załączony obrazek ${i + 1}`}
                  className="max-w-[220px] max-h-[220px] object-cover rounded-xl border border-white/20 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(imgUrl, '_blank')}
                />
              ))}
            </div>
          )}
          {renderMessageContent(msg.text, msg.isStreaming, idx)}
        </div>
      </div>
      {isUser && (
        <AvatarBadge isUser={true} user={currentUser} modelId={modelId} />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.msg.id === nextProps.msg.id &&
         prevProps.msg.text === nextProps.msg.text &&
         prevProps.msg.isStreaming === nextProps.msg.isStreaming &&
         prevProps.modelId === nextProps.modelId &&
         prevProps.isEN === nextProps.isEN;
});

const ChatInputDock = React.memo(({ 
  isGenerating, 
  isEN, 
  handleSend, 
  stopGenerating, 
  externalInput, 
  setExternalInput,
  webSearchEnabled,
  setWebSearchEnabled,
  onOpenPresetsModal,
  onOpenEnhanceModal
}) => {
  const [inputVal, setInputVal] = useState(externalInput || '');
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (externalInput !== undefined && externalInput !== inputVal) {
      setInputVal(externalInput);
    }
  }, [externalInput]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setSelectedImages(prev => [...prev, event.target.result]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const onChangeText = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (setExternalInput) setExternalInput(val);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  const onSend = () => {
    if (!isGenerating && (inputVal.trim() || selectedImages.length > 0)) {
      const text = inputVal;
      const imgs = [...selectedImages];
      setInputVal('');
      setSelectedImages([]);
      if (setExternalInput) setExternalInput('');
      handleSend(text, imgs);
    }
  };

  return (
    <div className="absolute bottom-0 inset-x-0 bg-[#0b0c10]/95 backdrop-blur-md border-t border-white/10 p-3 sm:p-4 z-10">
      
      {/* QUICK FEATURE CONTROLS STRIP */}
      <div className="flex items-center justify-between gap-2 mb-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenEnhanceModal}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#13151d] text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles size={13} className="text-purple-400" />
            <span>Ulepsz Prompt</span>
          </button>
        </div>
      </div>

      <div className="relative flex flex-col bg-[#13151d] border border-white/10 focus-within:border-[#ff6b00] rounded-xl transition-colors p-2">
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border-b border-white/10">
            {selectedImages.map((imgUrl, i) => (
              <div key={i} className="relative group">
                <img
                  src={imgUrl}
                  alt={`Podgląd ${i + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-white/20 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-md hover:bg-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          className="w-full max-h-48 bg-transparent border-none text-[#f8fafc] placeholder:text-[#64748b] p-2 resize-none focus:outline-none focus:ring-0 leading-relaxed text-sm"
          placeholder={isGenerating ? (isEN ? "Generating..." : "AI generuje kod...") : (isEN ? "Ask AI or attach images..." : "Opisz co chcesz zbudować lub wklej/dodaj obrazek...")}
          value={inputVal}
          disabled={isGenerating}
          onChange={onChangeText}
          onPaste={handlePaste}
          onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(!isGenerating) onSend(); }}}
          rows={1}
          style={{ minHeight: '44px' }}
        />
        
        <div className="flex items-center justify-between pt-2 border-t border-white/10 px-2">
          <div className="text-[11px] text-[#64748b] font-mono flex items-center gap-2">
            <span>Enter ↵ wyślij</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded hover:bg-white/10 text-[#94a3b8] hover:text-[#ff6b00] transition-colors flex items-center gap-1 text-xs"
              title={isEN ? "Attach images" : "Dodaj obrazek do wiadomości"}
            >
              <Paperclip size={14} />
              <span>{isEN ? "Attach image" : "Dodaj obrazek"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          <div>
            {isGenerating ? (
              <button 
                className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 text-xs font-semibold hover:bg-red-900/60 transition-colors"
                onClick={stopGenerating} 
              >
                Przerwij
              </button>
            ) : (
              <button 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${(!inputVal.trim() && selectedImages.length === 0) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#ff6b00] text-white hover:bg-[#e05d00]'}`}
                onClick={onSend} 
                disabled={!inputVal.trim() && selectedImages.length === 0} 
              >
                <span>Wyślij</span>
                <Send size={13}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const AgentActionCard = ({ log, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = log.text || '';
  const lines = text.split('\n');

  // Determine action card type
  let cardType = 'info';
  let title = 'Planowanie i Analiza';
  let badge = 'ANALIZA';
  let badgeStyle = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  let IconComponent = Sparkles;

  if (log.type === 'error' || text.includes('❌') || text.includes('Błąd')) {
    cardType = 'error';
    title = 'Wykryto Błąd Kompilacji / Runtime';
    badge = 'BŁĄD';
    badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/30';
    IconComponent = AlertTriangle;
  } else if (log.type === 'success' || text.includes('✅') || text.includes('SUKCES')) {
    cardType = 'success';
    title = 'Test Wdrożenia Zakończony Pomyślnie';
    badge = 'SUKCES';
    badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    IconComponent = CheckCircle2;
  } else if (log.type === 'warn' || text.includes('🔧') || text.includes('Auto-Fix')) {
    cardType = 'autofix';
    title = 'Autonomiczna Korekta Kodu AI';
    badge = 'AUTO-FIX';
    badgeStyle = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    IconComponent = Wrench;
  } else if (text.includes('⚙️') || text.includes('Maven')) {
    cardType = 'command';
    title = 'Kompilacja Projektu Maven';
    badge = 'MAVEN BUILD';
    badgeStyle = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    IconComponent = Cpu;
  } else if (text.includes('📦') || text.includes('Pelican') || text.includes('MC')) {
    cardType = 'server';
    title = 'Deploy na Serwer Pelican MC';
    badge = 'PELICAN MC';
    badgeStyle = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    IconComponent = Server;
  } else if (text.includes('src/main/java') || text.includes('.java') || text.includes('pom.xml')) {
    cardType = 'file';
    title = 'Edycja Plików Źródłowych';
    badge = 'KOD JAVA';
    badgeStyle = 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    IconComponent = FileCode;
  }

  const isLong = lines.length > 4;
  const previewText = isLong && !isExpanded ? lines.slice(0, 3).join('\n') : text;

  return (
    <div className="relative pl-6 pb-4 group">
      {/* Timeline Connector Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/40 to-transparent group-hover:from-indigo-400 transition-colors" />
      )}

      {/* Timeline Node Icon */}
      <div className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 ${
        cardType === 'error' ? 'bg-red-950 border-red-500/50 text-red-400' :
        cardType === 'success' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' :
        cardType === 'autofix' ? 'bg-amber-950 border-amber-500/50 text-amber-400' :
        'bg-[#131728] border-indigo-500/40 text-indigo-300'
      }`}>
        <IconComponent size={12} />
      </div>

      {/* Action Card Body */}
      <div className={`rounded-xl border p-3.5 transition-all shadow-md backdrop-blur-sm ${
        cardType === 'error' ? 'bg-gradient-to-br from-[#1c0c12] to-[#0f070b] border-red-900/40' :
        cardType === 'success' ? 'bg-gradient-to-br from-[#0c1c14] to-[#070f0b] border-emerald-900/40' :
        cardType === 'autofix' ? 'bg-gradient-to-br from-[#1c160c] to-[#0f0c07] border-amber-900/40' :
        'bg-gradient-to-br from-[#0f1220] to-[#090b14] border-white/10 hover:border-indigo-500/40'
      }`}>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border tracking-wider uppercase ${badgeStyle}`}>
              {badge}
            </span>
            <h4 className="text-xs font-bold text-slate-200 tracking-tight">{title}</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
        </div>

        {/* Content Body */}
        <div className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap break-all bg-black/40 p-2.5 rounded-lg border border-white/5">
          {previewText}
        </div>

        {/* Expand / Collapse Button */}
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[10px] font-mono font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            {isExpanded ? '▲ Zwiń szczegóły' : `▼ Pokaż pełny log (${lines.length} linii)...`}
          </button>
        )}
      </div>
    </div>
  );
};

function Project() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const isEN = lang === 'en';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [projectData, setProjectData] = useState(() => ({
    id: id || 'default',
    title: 'Projekt',
    model: 'z-ai/glm-5.2',
    engine: 'Paper',
    version: '1.20.4',
    messages: []
  }));
  const [userProfile, setUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [showThinkingGlobal, setShowThinkingGlobal] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState({});
  
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState('');
  const [buildError, setBuildError] = useState(null);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [showCodePanel, setShowCodePanel] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('code');
  const [projectsList, setProjectsList] = useState([]);
  const modelMenuRef = useRef(null);

  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
  const [enhanceInputText, setEnhanceInputText] = useState('');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleEnhancePromptAction = async () => {
    if (!enhanceInputText || !enhanceInputText.trim()) return;
    setIsEnhancingPrompt(true);
    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: enhanceInputText, lang: isEN ? 'en' : 'pl' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPrompt) {
          setChatInput(data.enhancedPrompt);
          setIsEnhanceModalOpen(false);
          setEnhanceInputText('');
        }
      }
    } catch (e) {
      console.error('Enhance prompt failed:', e);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [showAgentDrawer, setShowAgentDrawer] = useState(false);
  const [agentStep, setAgentStep] = useState(1);
  const [agentLogs, setAgentLogs] = useState([]);
  const agentLogsEndRef = useRef(null);

  const [mcCommandInput, setMcCommandInput] = useState('');

  const addAgentLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAgentLogs(prev => [...prev, { id: Math.random(), time, text, type }]);
  };

  const sendMcConsoleCommand = async (cmdToRun = null) => {
    const targetCmd = typeof cmdToRun === 'string' ? cmdToRun : mcCommandInput;
    if (!targetCmd || !targetCmd.trim()) return;
    
    addAgentLog(`⚡ [CLI KONSOLA MC] Executing: ${targetCmd}`, 'step');
    setMcCommandInput('');

    try {
      const res = await fetch('/api/agent/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: targetCmd })
      });
      const data = await res.json();
      if (data.success) {
        addAgentLog(`📜 Odpowiedź konsoli Pelican MC:\n${data.logs ? data.logs.split('\n').slice(-15).join('\n') : ''}`, 'info');
      } else {
        addAgentLog(`❌ Błąd wykonywania komendy: ${data.error}`, 'error');
      }
    } catch(e) {
      addAgentLog(`❌ Błąd sieci: ${e.message}`, 'error');
    }
  };

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const initialGenerated = useRef(false);
  const currentProjectIdRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isGeneratingRef = useRef(false); // synchroniczny guard przed wielokrotnym wysłaniem

  useEffect(() => {
    const handleClick = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setIsModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      const el = chatContainerRef.current;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 250;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
    const fetchProject = async () => {
      try {
        if (currentProjectIdRef.current !== id) {
          currentProjectIdRef.current = id;
          initialGenerated.current = false;
          setMessages([]);
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user || (await supabase.auth.getUser()).data?.user;
        if (user) {
          setCurrentUser(user);
          
          const { data: allProjects } = await supabase
            .from('projects')
            .select('id, title, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (allProjects && isMounted) {
            setProjectsList(allProjects.filter(p => !p.title?.startsWith('__user_profile:') && !p.title?.startsWith('__marketplace:')));
          }
          
          const profileKey = `__user_profile:${user.email}__`;
          const { data: profs } = await supabase.from('projects').select('*').eq('title', profileKey);
          if (profs && profs[0] && isMounted) {
            setUserProfile(profs[0].messages || {});
          }
        }

        const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
        if (!isMounted) return;

        if (data) {
          setProjectData(data);
          let msgs = data.messages;
          if (typeof msgs === 'string') {
            try { msgs = JSON.parse(msgs); } catch(e) {}
          }
          if (Array.isArray(msgs) && msgs.length > 0) {
            const cleanedMessages = msgs.map(msg => ({ ...msg, isStreaming: false }));
            setMessages(cleanedMessages);
            initialGenerated.current = true;
          }
        } else {
          // Fallback if project is new or not in DB yet
          setProjectData({
            id: id,
            title: 'Nowy Projekt',
            model: 'z-ai/glm-5.2',
            engine: 'Paper',
            version: '1.20.4',
            created_at: new Date().toISOString(),
            messages: []
          });
        }
      } catch (err) {
        console.error("[Project] Fetch error:", err);
        if (isMounted) {
          setProjectData({
            id: id,
            title: 'Projekt',
            model: 'z-ai/glm-5.2',
            messages: []
          });
        }
      }
    };

    fetchProject();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (messages.length > 0 && projectData && projectData.id === id) {
      if (messages.some(m => m.isStreaming)) return;
      const saveMessages = async () => {
        await supabase.from('projects').update({ messages }).eq('id', id);
      };
      saveMessages();
    }
  }, [messages, projectData, id]);

  useEffect(() => {
    if (projectData && projectData.prompt && projectData.prompt !== 'undefined' && messages.length === 0 && !initialGenerated.current && !isGeneratingRef.current) {
      initialGenerated.current = true;
      handleSend(projectData.prompt);
    }
  }, [projectData, messages]);

  const addMessage = (sender, text, isStreaming = false) => {
    const time = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    const msgId = Math.random();
    const currentModelName = projectData?.model || 'Antigravity (Gemini)';
    const finalSender = sender === 'Claude' ? currentModelName : sender;
    
    setMessages(prev => [...prev, { id: msgId, sender: finalSender, time, text, isStreaming }]);
    return msgId;
  };

  const updateMessage = (id, newText, isStreaming) => {
    setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, text: newText, isStreaming } : msg));
  };

  const deductTokenCost = async (systemPrompt, userPrompt, fullText, historyArray = []) => {
    if (!projectData) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      let historyLen = 0;
      if (Array.isArray(historyArray)) {
        historyArray.forEach(h => {
           if (h.parts && h.parts[0]?.text) historyLen += h.parts[0].text.length;
           else if (h.content) historyLen += h.content.length;
        });
      }

      const inputLen = (systemPrompt || '').length + (userPrompt || '').length + historyLen;
      const outputLen = (fullText || '').length;

      const normalInputTokens = Math.round(inputLen / 3.0) + 150;
      const normalOutputTokens = Math.round(outputLen / 3.0) + 50;
      const totalNormal = normalInputTokens + normalOutputTokens;

      const cachedInputTokens = Math.round(normalInputTokens * 0.3);
      const totalCached = cachedInputTokens + normalOutputTokens;

      const modelId = (projectData?.model || 'z-ai/glm-5.2').toLowerCase();
      
      // Real AI API token costs (USD)
      let inputRate = 0.000003; 
      let outputRate = 0.000015;
      
      if (modelId.includes('opus-4.7') || modelId.includes('opus-4-7') || modelId.includes('opus-4.8') || modelId.includes('opus-4-8')) {
        // Opus: $15 / $75 per 1M
        inputRate = 0.000015;
        outputRate = 0.000075;
      } else if (modelId.includes('sonnet-4.6') || modelId.includes('sonnet-4-6') || modelId.includes('sonnet-5') || modelId.includes('sonnet-5.0')) {
        // Sonnet: $3 / $15 per 1M
        inputRate = 0.000003;
        outputRate = 0.000015;
      } else if (modelId.includes('haiku')) {
        // Haiku: $0.25 / $1.25 per 1M
        inputRate = 0.00000025;
        outputRate = 0.00000125;
      } else if (modelId.includes('glm')) {
        inputRate = 0.000001;
        outputRate = 0.000003;
      }
      
      let finalInputRate = inputRate;
      let finalOutputRate = outputRate;

      // 1.4x profit margin for Claude, 2x for GLM
      if (modelId.includes('claude') || modelId.includes('opus') || modelId.includes('sonnet') || modelId.includes('haiku')) {
        finalInputRate *= 1.4;
        finalOutputRate *= 1.4;
      } else if (modelId.includes('glm')) {
        finalInputRate *= 2.0;
        finalOutputRate *= 2.0;
      }

      const cachedCost = (cachedInputTokens * finalInputRate) + (normalOutputTokens * finalOutputRate);
      let normalCost = (normalInputTokens * finalInputRate) + (normalOutputTokens * finalOutputRate);
      
      let estimatedDeducted = 0;
      if (modelId.includes('opus')) estimatedDeducted = 0.05;
      else if (modelId.includes('sonnet-5')) estimatedDeducted = 0.02;
      else if (modelId.includes('haiku')) estimatedDeducted = 0.005;
      else if (modelId.includes('sonnet-4-6') || modelId.includes('sonnet-4.6') || modelId.includes('claude-sonnet-4-6') || modelId.includes('sonnet-4-8')) estimatedDeducted = 0.01;
      
      const additionalCost = normalCost - estimatedDeducted;

      console.log(`[Billing Debug] Model: ${modelId}`);
      console.log(`[Billing Debug] InputTokens: ${normalInputTokens}, OutputTokens: ${normalOutputTokens}`);
      console.log(`[Billing Debug] InputRate: ${finalInputRate}, OutputRate: ${finalOutputRate}`);
      console.log(`[Billing Debug] NORMAL COST: ${normalCost}`);
      
      const profileKey = `__user_profile:${user.email}__`;
      const { data: profs } = await supabase
        .from('projects')
        .select('*')
        .eq('title', profileKey);

      if (profs && profs.length > 0) {
        const record = profs[0];
        const pData = record.messages || {};

        const currentBalance = parseFloat(pData.balance || '10.00');
        const newBalance = Math.max(0, currentBalance - additionalCost).toFixed(2);

        const currentUsedCredits = parseFloat(pData.used_credits || '0.00');
        const newUsedCredits = (currentUsedCredits + normalCost).toFixed(2);

        const currentUsedCreditsUncached = parseFloat(pData.used_credits_uncached || '0.00');
        const newUsedCreditsUncached = (currentUsedCreditsUncached + normalCost).toFixed(2);

        const newCachedTokens = parseInt(pData.used_tokens_cached || '0') + totalCached;
        const newUncachedTokens = parseInt(pData.used_tokens_uncached || '0') + totalNormal;

        const updatedProfile = {
          ...pData,
          balance: newBalance,
          used_credits: newUsedCredits,
          used_credits_uncached: newUsedCreditsUncached,
          used_tokens_cached: String(newCachedTokens),
          used_tokens_uncached: String(newUncachedTokens)
        };

        await supabase
          .from('projects')
          .update({ messages: updatedProfile })
          .eq('id', record.id);

        await supabase.auth.updateUser({
          data: {
            balance: newBalance,
            used_credits: newUsedCredits,
            used_credits_uncached: newUsedCreditsUncached,
            used_tokens_cached: String(newCachedTokens),
            used_tokens_uncached: String(newUncachedTokens)
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkDailyLimit = async () => {
    if (!userProfile) return true;
    if (window.location.hostname !== 'free.zenexcode.pl') {
      if (userProfile.plan !== 'Free' && userProfile.plan) return true;
    }
    
    let newProfile = { ...userProfile };
    const today = new Date().toDateString();
    if (newProfile.requests_today_date !== today) {
      newProfile.requests_today_date = today;
      newProfile.requests_today_count = 0;
    }
    
    if (newProfile.requests_today_count >= 5) {
      addMessage('System', '⚠️ **Limit zapytań osiągnięty.** W darmowym planie możesz wykonać maksymalnie 5 zapytań dziennie. Limit odnowi się o północy. Przejdź na wyższy plan, aby generować bez limitów.');
      return false;
    }
    
    newProfile.requests_today_count += 1;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('projects').update({ messages: newProfile }).eq('title', `__user_profile:${user.email}__`);
      setUserProfile(newProfile);
    }
    return true;
  };



  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isGeneratingRef.current = false;
    setIsGenerating(false);
    setStreamingMessageId(null);
  };

  const handleSend = async (overrideMsg = null, overrideImages = [], isSilent = false) => {
    if (isGeneratingRef.current) return;       // synchroniczny guard — blokuje podwójne wywołania
    if (isGenerating) return;
    const isEvent = overrideMsg && (overrideMsg.target || overrideMsg.preventDefault || typeof overrideMsg === 'object');
    const userMsg = (typeof overrideMsg === 'string' && !isEvent) ? overrideMsg : chatInput;
    const imgs = Array.isArray(overrideImages) ? overrideImages : [];
    
    if ((!userMsg || typeof userMsg !== 'string' || !userMsg.trim() || userMsg === 'undefined') && imgs.length === 0) return;
    
    const textToSend = (userMsg && userMsg !== 'undefined' && userMsg.trim()) ? userMsg : (imgs.length > 0 ? "Przeanalizuj i uwzględnij ten obrazek:" : "");
    
    isGeneratingRef.current = true;            // zablokuj natychmiast, zanim state się zaktualizuje
    if (!isSilent) {
      addMessage('You', textToSend, false, imgs);
    }
    if (typeof overrideMsg !== 'string' || isEvent) setChatInput('');
    setIsGenerating(true);
    
    const canGenerate = await checkDailyLimit();
    if (!canGenerate) {
      setIsGenerating(false);
      return;
    }

    let msgId = null;
    
    try {
      const currentFiles = {};
      messages.forEach(msg => {
        const text = msg.text || '';
        const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          currentFiles[match[1]] = match[2]; 
        }
      });

      let filesContext = '';
      if (Object.keys(currentFiles).length > 0) {
        filesContext = `\nAKTUALNY KOD W PROJEKCIE (zna go tylko AI, zaktualizuj go jeśli potrzeba):\n`;
        for (const [path, content] of Object.entries(currentFiles)) {
          let minifiedContent = content
            .replace(/^[ \t]*\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
          if (minifiedContent.length > 40000) {
            minifiedContent = minifiedContent.substring(0, 40000) + '\n... [obcięto]';
          }
          filesContext += `\n--- PLIK: ${path} ---\n${minifiedContent}\n`;
        }
      }

      let historyContext = '';
      let summaryToUse = projectData.conversation_summary || '';

      if (messages.length > 6 && !projectData.conversation_summary) {
        try {
          const summaryPrompt = "Jesteś asystentem AI. Streść w max 5 zdaniach poniższą rozmowę, zachowując kluczowe decyzje architektoniczne i nazwy zaimplementowanych funkcji:\n\n" + messages.map(m => `${m.sender}: ${m.text}`).join('\n\n');
          const { data: { session: sumSession } } = await supabase.auth.getSession();
          const summaryRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sumSession?.access_token || ''}` },
            body: JSON.stringify({
              model: 'gemini-2.0-flash',
              systemPrompt: '',
              userPrompt: summaryPrompt,
              history: []
            })
          });
          if (summaryRes.ok) {
            // Because it streams, we must read the stream to get the summary
            const reader = summaryRes.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let summaryText = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                  try {
                    const parsed = JSON.parse(line.replace('data: ', ''));
                    if (parsed.content) summaryText += parsed.content;
                  } catch (e) {}
                }
              }
            }
            if (summaryText) {
               summaryToUse = summaryText;
               await supabase.from('projects').update({ conversation_summary: summaryText }).eq('id', id);
               setProjectData(prev => ({ ...prev, conversation_summary: summaryText }));
            }
          }
        } catch (err) {
          console.error(err);
        }
      }

      const recentMessages = messages.slice(-4);
      // History is passed via formattedHistory to backend — only include summary here to avoid double-sending
      historyContext = summaryToUse ? `[STRESZCZENIE STARSZYCH USTALEŃ]\n${summaryToUse}` : '';
      
      const identityInjection = getIdentityInjection(projectData.model);
      const selectedEngine = projectData?.engine || 'Paper';
      const selectedVersion = projectData?.version || '1.21.4';
      
      const systemPrompt = `${identityInjection}${MINECRAFT_SERVERS_KNOWLEDGE}Jesteś elitarnym inżynierem oprogramowania (Java/Minecraft Plugin Developer). 

KONFIGURACJA PROJEKTU:
- Silnik: ${selectedEngine}
- Wersja Minecraft: ${selectedVersion}

ZASADY WERSJONOWANIA I SPECYFIKACJA DLA WERSJI ${selectedVersion} (${selectedEngine}):
1. Wersjonowanie Javy i pom.xml:
   - Dla MC 1.20.5+ / 1.21.x: Wymagany Java Target 21. Używaj Kyori Adventure API (Component & MiniMessage.deserialize) do formatowania kolorów i nagłówków.
   - Dla MC 1.17 - 1.20.4: Wymagany Java Target 17. Używaj MiniMessage lub org.bukkit.ChatColor.
   - Dla MC 1.12.2 - 1.16.5: Wymagany Java Target 11/8. Używaj org.bukkit.ChatColor.
   - Dla MC 1.8.8 - 1.12.2: Wymagany Java Target 8. Używaj org.bukkit.ChatColor i klasycznego Spigot API 1.8.8-R0.1-SNAPSHOT.
2. Zawsze wygeneruj pełny, wykompilowany plik pom.xml dopasowany do silnika ${selectedEngine} i wersji ${selectedVersion}!

ZASADY KRYTYCZNE:
1. Brak kodu jeśli prompt to luźna rozmowa.
2. BŁĘDY [SYSTEM-AUTO-FIX]: Gdy dostaniesz błąd z konsoli (wiadomość zawierającą [SYSTEM-AUTO-FIX]), musisz bezwzględnie poprawić pliki wykazujące błędy. Zwróć każdy poprawiony plik jako kompletny plik w tagu <file path="dokładna_ścieżka_pliku">...</file> (np. pom.xml lub odpowiednia klasa Java). Nie pomijaj żadnych linii kodu ani nie stosuj skrótów. Ścieżki plików w tagu <file> muszą być identyczne ze ścieżkami z sekcji "AKTUALNY KOD W PROJEKCIE".
3. Format plików:
<file path="sciezka/do/pliku">
KOD (ZAWSZE PEŁNY, NIGDY NIE SKRACAJ Z "...")
</file>
4. Zmieniaj tylko te pliki, które wymagają edycji. Każdy zmieniony plik musisz bezwzględnie wygenerować w całości (100% gotowy kod) w tagach <file>. Zabrania się opisywania zmian tylko tekstowo oraz stosowania skrótów typu "..." lub "// reszta kodu bez zmian".
5. FAZA 1 (PLANOWANIE ARCHITEKTURY): Na samym początku, gdy użytkownik prosi o nowy plugin/mechanikę i nie ma jeszcze akceptacji planu, ZAWSZE najpierw wygeneruj sam przejrzysty i bogaty PLAN ARCHITEKTONICZNY (opis funkcji, listę komend, permissions, strukturę klas i opis działania). BEZWZGLĘDNIE NIE GENERUJ tagów <file> w tej pierwszej odpowiedzi! Zakończ pytaniem: "Czy akceptujesz ten plan architektoniczny? Odpowiedz 'Tak' lub 'Akceptuję', aby wygenerować 100% wszystkich plików projektu w 1 odpowiedzi."
6. FAZA 2 (GENEROWANIE 100% PLIKÓW NA RAZ): Gdy użytkownik wyrazi zgodę (odpowie "Tak", "Akceptuję", "Generuj", "Rób", "Zrób to", "Dokończ"), LUB w przypadku zgłoszenia poprawek ([SYSTEM-AUTO-FIX] / edycji): WYGENERUJ BEZWZGLĘDNIE 100% WSZYSTKICH PLANOWANYCH PLIKÓW NA RAZ W JEDNEJ ODPOWIEDZI (pom.xml, plugin.yml, config.yml oraz KAŻDĄ zadeklarowaną klasę Javy)! Zabrania się dzielenia plików na części lub pomijania jakichkolwiek klas!
7. KRYTYCZNE: ZAWSZE na samym początku swojej odpowiedzi z kodem napisz bardzo szczegółowe, bogate tekstowe wprowadzenie i instrukcje po polsku, a następnie wygeneruj tagi <file> z kodem.
8. BEZWZGLĘDNA KOMPLETNOŚĆ KODU I ARCHITEKTURY: ZAWSZE wygeneruj WSZYSTKIE pliki klas Javy zadeklarowane lub używane w kodzie pluginu! Jeśli główna klasa pluginu (np. w onEnable) rejestruje Komendy, Listenery, Menedżery lub klasy GUI, to KAŻDA z tych klas MUSI zostać wygenerowana w osobnych tagach <file path="...">...</file>! Żadna klasa nie może zostać pominięta ani pozostawiona bez pliku źródłowego.
9. KATEGORYCZNY ZAKAZ PODAWANIA KOMEND BASH / TERMINALA / MVN: Kategorycznie zabrania się podawania instrukcji konsolowych typu "mvn clean package". Kompilacja w Zenexcode jest w 100% automatyczna na serwerze! Poinformuj użytkownika w 1 zdaniu, że aby skompilować i pobrać plik JAR, wystarczy kliknąć przycisk "Buduj JAR" na górnym pasku edytora.
10. KATEGORYCZNY ZAKAZ KAZANIA UŻYTKOWNIKOWI POBIERANIA/INSTALOWANIA ZEWNĘTRZNYCH WTYCZEK LUB SKRYPTÓW (VAULT, ESSENTIALSX, SKRIPT ITP.): Wszystkie funkcjonalności MUSZĄ być zaimplementowane Samodzielnie (Self-Contained) wewnątrz klas Javy Twojego pluginu (np. własny EconomyManager).
11. ZAKAZ FENCÓW ORAZ BŁĘDNYCH ŚCIEŻEK: Kategorycznie zabrania się używania znaków backtick wewnątrz tagów <file path="...">!</file>. Tagi <file path="..."> MUSZĄ zawierać PRAWIDŁOWĄ, REALNĄ ścieżkę pliku w projekcie (np. src/main/java/pl/zenexcode/ruletka/Ruletka.java).`;
      
      msgId = addMessage('Claude', '', true);
      setStreamingMessageId(msgId);
      
      const validPrompt = (projectData?.prompt && projectData.prompt !== 'undefined') ? projectData.prompt : userMsg;
      const userPrompt = `Silnik: ${projectData.engine || 'Paper'}, Wersja MC: ${projectData.version || '1.20.4'}.
Pierwotne założenie projektu:
"""
${validPrompt}
"""
${filesContext}${historyContext ? `\n[STRESZCZENIE KONTEKSTU]\n${historyContext}` : ''}
Nowa wiadomość:
"""
${userMsg}
"""`;

      const formattedHistory = recentMessages.map(m => ({
        role: m.sender === 'You' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      let modelToUse = projectData.model;
      if (userProfile?.fair_use) {
         modelToUse = 'z-ai/glm-5.2';
      }

      let isHybrid = userProfile?.hybrid_mode;
      if (window.location.hostname === 'free.zenexcode.pl' || userProfile?.plan === 'Free' || !userProfile?.plan) {
         if (modelToUse.includes('claude')) {
            isHybrid = true;
         }
      }
      const isContinuation = /^(kontynuuj|continue|dokończ|dokoncz|dalej|pisz dalej|generuj dalej|napisz resztę|napisz reszte|write more)/i.test(userMsg.trim());
      const isFixRequest = /(błąd|error|exception|napraw|popraw|failed|compile|kompilacj)/i.test(userMsg.trim());
      if (userMsg.includes('[SYSTEM-AUTO-FIX]') || isContinuation || isFixRequest) {
         isHybrid = false;
      }

      let fullText = '';
      if (isHybrid && modelToUse.includes('claude')) {
         const hybridPrompt = `Jesteś ekspertem i architektem oprogramowania Minecraft (Java/PaperMC). 
Twoim jedynym zadaniem w tej fazie (Faza 1) jest szczegółowo opisać planowane zmiany lub nowe funkcjonalności dla użytkownika oraz sporządzić plan plików.
KATEGORYCZNY ZAKAZ PISANIA JAKIEGOKOLWIEK KODU (w tagach <file> ani w blokach \`\`\`).
Napisz bardzo szczegółowy, bogaty opis po polsku:
1. Wyjaśnij dokładnie, jak system będzie działał, jaka będzie architektura klas.
2. Wypisz komendy i uprawnienia (permissions), które zostaną dodane.
3. Przedstaw strukturę plików, które należy stworzyć.
Zakończ swoją wypowiedź jasnym podsumowaniem planu, nie pisząc żadnego kodu ani bloków kodu.`;

         const hybridUserPrompt = userPrompt + "\n\n[INSTRUKCJA (FAZA 1 - PLANOWANIE)]: Użytkownik poprosił o powyższe. Twoim zadaniem jest TERAZ TYLKO ZAPLANOWAĆ architekturę (jakie pliki stworzyć, jakie funkcje). NIE PISZ KODU. Kod napiszesz w Fazie 2. Bądź krótki i zwięzły.";
         
         const thoughtText = await generateWithBackend(
           modelToUse,
           hybridPrompt,
           hybridUserPrompt,
           formattedHistory,
           (text) => {
              const finalText = text.trim().startsWith('<file') ? `Oto wygenerowane pliki:\n\n${text}` : text;
              updateMessage(msgId, finalText, true);
            },
           abortControllerRef
         );
         
         const glmSystemPrompt = `${MINECRAFT_SERVERS_KNOWLEDGE}Jesteś elitarnym inżynierem oprogramowania i programistą Java/PaperMC. 
Twoim zadaniem jest zaimplementować kod na podstawie planu przygotowanego przez architekta.

ZASADY KODOWANIA:
1. ZAWSZE na samym początku swojej wiadomości (PRZED jakimikolwiek tagami <file>) napisz szczegółowy, bogaty opis po polsku: opisz dokładnie co zostało zrobione, co i jak zostanie zaimplementowane, jak działa kod, wypisz komendy, uprawnienia (permissions) oraz instrukcje konfiguracji i użycia.
2. Wygeneruj kod plików w tagach:
<file path="sciezka/do/pliku">
KOD
</file>
3. Generuj ZAWSZE PEŁNY, DOKŁADNY kod każdego pliku od początku do końca. KATEGORYCZNIE ZABRANIA SIĘ używania komentarzy typu "// reszta kodu bez zmian" lub "..." wewnątrz kodu. pom.xml musi być kompletnym i poprawnym plikiem XML.
4. BEZWZGLĘDNA KOMPLETNOŚĆ KODU I ARCHITEKTURY: ZAWSZE wygeneruj WSZYSTKIE pliki klas Javy zadeklarowane lub używane w kodzie pluginu (Komendy, Listenery, Menedżery, GUI)! Żadna klasa odwoływana w kodzie głównym nie może zostać pominięta ani pozostawiona bez pliku.
5. KATEGORYCZNY ZAKAZ PODAWANIA KOMEND BASH / TERMINALA / MVN: Kategorycznie zabrania się podawania instrukcji konsolowych typu "mvn clean package". Poinformuj użytkownika w 1 zdaniu, że aby pobrać plik JAR wystarczy kliknąć przycisk "Buduj JAR" na górnym pasku.
6. KATEGORYCZNY ZAKAZ KAZANIA UŻYTKOWNIKOWI POBIERANIA/INSTALOWANIA ZEWNĘTRZNYCH WTYCZEK LUB SKRYPTÓW (VAULT, ESSENTIALSX, SKRIPT ITP.): Wszystkie mechaniki (w tym ekonomia, stany kont, bazy danych) muszą być napisane w 100% od zera wewnątrz generowanego pluginu Javy. NIE każ użytkownikowi instalować Vault ani EssentialsX!
7. ZAKAZ FENCÓW ORAZ BŁĘDNYCH ŚCIEŻEK: Kategorycznie zabrania się używania znaków backtick wewnątrz tagów <file path="...">!</file>. Tagi <file path="..."> MUSZĄ zawierać PRAWIDŁOWĄ, REALNĄ ścieżkę pliku w projekcie (np. src/main/java/pl/zenexcode/ruletka/Ruletka.java). Kategorycznie zabrania się używania ścieżek symulowanych jak "dokładna_ścieżka" czy "sciezka/do/pliku"!`;
         
         let strippedThought = thoughtText
           .replace(/```[\s\S]*?(?:```|$)/g, '\n[WYGENERUJ TEN KOD ZGODNIE Z PLANEM]\n')
           .replace(/<file[\s\S]*?(?:<\/file>|$)/g, '\n[WYGENERUJ TEN PLIK W TAGACH <file>]\n');
           
         strippedThought = strippedThought.replace(/<\/?(?:think|thinking|plan)>/gi, '');

         const glmText = await generateWithBackend(
           modelToUse,
           glmSystemPrompt,
           `${userPrompt}\n\n[PLAN DO IMPLEMENTACJI DLA CIEBIE - MUSISZ NAPISAĆ KOD]:\n${strippedThought}`,
           formattedHistory,
           (text) => updateMessage(msgId, thoughtText + '\n\n' + text, true),
           abortControllerRef
         );
         
         if (!glmText || glmText.trim() === '') {
            throw new Error("API Error 500: Model wykonawczy nie wygenerował odpowiedzi. Prawdopodobnie zadanie przekroczyło limit kontekstu lub usługa API jest tymczasowo niedostępna. Wyłącz Tryb Hybrydowy w Ustawieniach konta (lub zmień model).");
         }
         
         fullText = thoughtText + '\n\n' + glmText;
      } else {
         fullText = await generateWithBackend(
           modelToUse,
           systemPrompt,
           userPrompt,
           formattedHistory,
           (text) => {
              const finalText = text.trim().startsWith('<file') ? `Oto wygenerowane pliki:\n\n${text}` : text;
              updateMessage(msgId, finalText, true);
            },
           abortControllerRef
         );
      }
      
      updateMessage(msgId, fullText, false);
      setStreamingMessageId(null);
      deductTokenCost(systemPrompt, userPrompt, fullText, formattedHistory);
    } catch(err) {
      // Silent auto-fallback if provider is overloaded or rate limited (503/502/504/429)
      if (err.message && (err.message.includes('503') || err.message.includes('502') || err.message.includes('504') || err.message.includes('przeciążony') || err.message.includes('Service Unavailable') || err.message.includes('429'))) {
        console.warn("[handleSend] Provider overloaded. Attempting silent fallback to GLM 5.2...");
        try {
          const fallbackText = await generateWithBackend(
            'z-ai/glm-5.2',
            systemPrompt,
            userPrompt,
            formattedHistory,
            (text) => updateMessage(msgId, text, true),
            abortControllerRef
          );
          updateMessage(msgId, fallbackText, false);
          setStreamingMessageId(null);
          return;
        } catch (fallbackErr) {
          console.error("Silent fallback failed:", fallbackErr);
        }
      }

      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'handleSend', message: err.message, name: err.name, stack: err.stack })
      }).catch(() => {});
      if (msgId) {
        setMessages(prev => prev.map(m => {
          if (m.id !== msgId) return m;
          const partial = m.text || '';
          const errNote = `\n\n---\n⚠️ **Przerwano — błąd połączenia:** ${err.message || 'nieznany'}`;
          return { ...m, text: (partial || '') + errNote, isStreaming: false };
        }));
      }
    } finally {
      isGeneratingRef.current = false;
      setStreamingMessageId(null);
      setIsGenerating(false);
    }
  };

  const handleAutoFix = () => {
    if (!buildError) return;
    setShowCodePanel(true);
    setRightPanelTab('files');
    
    // Pass the actual project parameters, telling AI this is an automated system fix
    const errorMsg = isEN 
      ? `[SYSTEM-AUTO-FIX] A compilation error occurred while building the Java plugin. 
Here is the error from the terminal:
\`\`\`
${buildError}
\`\`\`
Analyze the reason for the error and fix it immediately. If any classes, commands, listeners, managers or GUI classes are missing (e.g. cannot find symbol), you MUST generate ALL missing class files 100% complete in <file path="src/main/java/twoja/sciezka/Klasa.java">...</file> tags. Never use comments like '// rest of code...' or abbreviation '...'. Do NOT tell the user to run bash/mvn commands!`
      : `[SYSTEM-AUTO-FIX] Wystąpił błąd kompilacji podczas budowania pluginu Javy. 
Oto treść błędu z terminala:
\`\`\`
${buildError}
\`\`\`
Przeanalizuj powód błędu i napraw go natychmiast. Jeżeli brakuje jakichkolwiek klas komend, listenerów, menedżerów lub GUI (błąd typu "cannot find symbol"), musisz bezwzględnie wygenerować WSZYSTKIE brakujące klasy Java w tagach <file path="src/main/java/twoja/sciezka/Klasa.java">...</file> w 100% pełnym kodzie od początku do końca. Kategoryczny zakaz podawania komend "mvn clean package" — po prostu wygeneruj brakujące pliki!`;
    
    setBuildError(null);
    handleSend(errorMsg, [], true);
  };

  const handleClearChat = async () => {
    if (window.confirm(isEN ? 'Are you sure you want to clear the chat history?' : 'Czy na pewno chcesz wyczyścić historię czatu?')) {
      setMessages([]);
      await supabase.from('projects').update({ messages: [] }).eq('id', id);
    }
  };

  const changeModel = async (modelId) => {
     setProjectData(prev => ({...prev, model: modelId}));
     setIsModelMenuOpen(false);
     await supabase.from('projects').update({ model: modelId }).eq('id', id);
  };

  const extractProjectFiles = (messagesList) => {
    const files = {};
    if (!messagesList || !Array.isArray(messagesList)) return files;
    
    messagesList.forEach(msg => {
      const text = msg.text || '';
      
      // 1. Process <file path="..."> tags
      const fileRegex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g;
      let match;
      while ((match = fileRegex.exec(text)) !== null) {
        let filePath = match[1] ? match[1].trim() : '';
        if (!filePath || filePath === '...' || filePath.includes('dokładna_ścieżka') || filePath.includes('sciezka/do/pliku') || filePath.endsWith('.dokładna_ścieżka')) continue;
        
        let fileContent = (match[2] || '').replace(/^\s*```[a-zA-Z]*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '').trim();
        fileContent = fileContent.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '');
        
        if (filePath.endsWith('.java')) {
          const openBraces = (fileContent.match(/\{/g) || []).length;
          const closeBraces = (fileContent.match(/\}/g) || []).length;
          if (openBraces > closeBraces) {
            fileContent += '\n' + '}'.repeat(openBraces - closeBraces);
          }
        }
        files[filePath] = fileContent;
      }

      // 2. Process <delete path="..."> or <delete file="..."> or <delete dir="..."> tags
      const deleteRegex = /<(?:delete|remove)\s+(?:path|file|dir)="([^"]+)"\s*\/>/g;
      let delMatch;
      while ((delMatch = deleteRegex.exec(text)) !== null) {
        let targetPath = delMatch[1] ? delMatch[1].trim() : '';
        if (!targetPath) continue;
        const cleanTarget = targetPath.replace(/\/+$/, '');
        Object.keys(files).forEach(fp => {
          if (fp === cleanTarget || fp.startsWith(cleanTarget + '/')) {
            delete files[fp];
          }
        });
      }
    });
    return files;
  };

  const handleDeleteFile = async (filePathToDelete) => {
    if (!filePathToDelete) return;
    if (window.confirm(isEN ? `Are you sure you want to delete ${filePathToDelete}?` : `Czy na pewno chcesz usunąć plik ${filePathToDelete}?`)) {
      const deleteMsg = `<delete path="${filePathToDelete}"/>`;
      await handleSend(deleteMsg, [], true);
    }
  };

  const handleBuild = async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus(isEN ? 'Initializing Maven server...' : 'Inicjalizacja serwera Maven...');
    
    // Gather all files from messages using chronological creation and deletion
    const filesMap = extractProjectFiles(messages);
    let aiEditsCount = messages.filter(m => m.sender !== 'You' && /<file path=/.test(m.text || '')).length;
    
    const buildVersion = `1.${Math.max(0, aiEditsCount - 1)}`;

    // Auto-patch the version in pom.xml
    if (filesMap['pom.xml']) {
      let replaced = false;
      filesMap['pom.xml'] = filesMap['pom.xml'].replace(/<version>(.*?)<\/version>/, (match, p1) => {
        if (!replaced) {
          replaced = true;
          return `<version>${buildVersion}</version>`;
        }
        return match;
      });
    }
    
    // Auto-patch the version in plugin.yml
    const pyKey = filesMap['plugin.yml'] ? 'plugin.yml' : (filesMap['src/main/resources/plugin.yml'] ? 'src/main/resources/plugin.yml' : null);
    if (pyKey) {
      filesMap[pyKey] = filesMap[pyKey].replace(/^version:.*$/m, `version: '${buildVersion}'`);
    }

    const filesToBuild = Object.keys(filesMap).map(path => ({ path, content: filesMap[path] }));
    
    const isMinecraftProject = ['paper', 'spigot', 'bukkit', 'fabric', 'forge'].includes(
      (projectData?.engine || '').toLowerCase()
    ) || filesToBuild.some(f => f.path.endsWith('pom.xml') || f.path.endsWith('plugin.yml'));

    if (filesToBuild.length === 0) {
      alert(isMinecraftProject
        ? (isEN 
            ? 'Please ask AI to generate the code first (Java code and pom.xml must be created)!' 
            : 'Najpierw poproś AI o wygenerowanie kodu (musi powstać kod Javy i plik pom.xml)!')
        : (isEN 
            ? 'Please ask AI to generate the project code first!' 
            : 'Najpierw poproś AI o wygenerowanie kodu projektu!'));
      setIsBuilding(false);
      setBuildStatus('');
      return;
    }

    if (isMinecraftProject && !filesToBuild.find(f => f.path.endsWith('pom.xml'))) {
       alert(isEN 
         ? 'Missing pom.xml! Please ask the AI to generate the Maven structure before building the .jar file.'
         : 'Brakuje pliku pom.xml! Poproś AI o wygenerowanie struktury Maven przed zbudowaniem pliku .jar.');
       setIsBuilding(false);
       setBuildStatus('');
       return;
    }
    
    try {
      setBuildStatus(isEN ? 'Compiling Java classes...' : 'Kompilowanie klas Javy...');
      const { data: { session: buildSession } } = await supabase.auth.getSession();
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buildSession?.access_token || ''}` },
        body: JSON.stringify(filesToBuild)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      setBuildStatus(isEN ? 'Downloading .jar file...' : 'Pobieranie pliku .jar...');
      const blob = await response.blob();
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${projectData.title.replace(/\s+/g, '_')}.jar`;
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }

      saveAs(blob, filename);
      setBuildStatus(isEN ? 'Finished successfully!' : 'Zakończono sukcesem!');
      setBuildError(null);
    } catch(err) {
      console.error(err);
      setBuildError(err.message);
      setBuildStatus(isEN ? 'Build error' : 'Błąd budowania');
    }
    
    setTimeout(() => {
      setIsBuilding(false);
      if (!buildError) setBuildStatus('');
    }, 2000);
  };

  const runAgentLoop = async () => {
    if (isAgentRunning) return;
    setIsAgentRunning(true);
    setShowAgentDrawer(true);
    setAgentLogs([]);
    setAgentStep(1);

    addAgentLog('🤖 Autonomiczny Agent AI uaktywniony dla serwera Pelican MC...', 'step');
    addAgentLog('📋 Inicjalizacja pętli weryfikacji i środowiska testowego...', 'info');

    let attempts = 0;
    const maxAttempts = 3;
    let success = false;

    while (attempts < maxAttempts && !success) {
      attempts++;
      addAgentLog(`🔄 Pętla Autonomiczna Agenta (Próba ${attempts}/${maxAttempts})...`, 'step');

      const filesMap = {};
      messages.forEach(msg => {
        const text = msg.text || '';
        const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          let filePath = match[1] ? match[1].trim() : '';
          if (!filePath || filePath.includes('dokładna_ścieżka') || filePath.includes('sciezka/do/pliku')) continue;
          let fileContent = match[2] || '';
          fileContent = fileContent.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '');
          if (filePath.endsWith('.java')) {
            const openBraces = (fileContent.match(/\{/g) || []).length;
            const closeBraces = (fileContent.match(/\}/g) || []).length;
            if (openBraces > closeBraces) fileContent += '\n' + '}'.repeat(openBraces - closeBraces);
          }
          filesMap[filePath] = fileContent.trim();
        }
      });

      const filesToBuild = Object.keys(filesMap).map(path => ({ path, content: filesMap[path] }));

      if (filesToBuild.length === 0 || !filesMap['pom.xml']) {
        addAgentLog('⚙️ Generowanie brakującego kodu źródłowego Java i pom.xml w tle...', 'info');
        setAgentStep(1);
        await handleSend(messages.length === 0 ? projectData.prompt : "Wygeneruj wszystkie brakujące pliki klas Javy i pom.xml dla tego pluginu!", [], true);
        await new Promise(r => setTimeout(r, 4000));
        continue;
      }

      setAgentStep(2);
      addAgentLog('⚙️ Wysyłanie kodu do silnika kompilacji Maven...', 'info');

      try {
        const { data: { session: agentSession } } = await supabase.auth.getSession();
        const res = await fetch('/api/agent/deploy-and-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${agentSession?.access_token || ''}`
          },
          body: JSON.stringify({ files: filesToBuild })
        });

        const result = await res.json();

        if (!result.success) {
          if (result.phase === 'maven_compile') {
            addAgentLog(`❌ Błąd kompilacji Maven podczas budowania paczki!`, 'error');
            addAgentLog(`🔧 Auto-Fix (Cichy): Przekazywanie logów błędu do Agenta AI...`, 'warn');
            setAgentStep(1);
            await handleSend(`[SYSTEM-AUTO-FIX] Nastąpił błąd kompilacji Maven podczas budowania pliku .jar. Napraw wykazane błędy i zwróć poprawione pliki:\n\n${result.error}`, [], true);
            await new Promise(r => setTimeout(r, 4000));
          } else if (result.phase === 'runtime_test') {
            addAgentLog(`❌ Wykryto wyjątek runtime w konsoli serwera Minecraft Paper!`, 'error');
            addAgentLog(`📜 Wyciąg z logów: ${result.logs ? result.logs.slice(-300) : ''}`, 'warn');
            addAgentLog(`🔧 Auto-Fix (Cichy): Przekazywanie wyjątku serwera MC do Agenta AI...`, 'warn');
            setAgentStep(4);
            await handleSend(`[SYSTEM-RUNTIME-FIX] Plugin napotkał błąd podczas ładowania na serwerze Paper 1.21.4 (Pelican). Przeanalizuj poniższe logi i popraw kod klas Javy:\n\n${result.logs}`, [], true);
            await new Promise(r => setTimeout(r, 4000));
          }
        } else {
          setAgentStep(3);
          addAgentLog(`📦 Plik JAR (${result.jarName}) został skompilowany i wdrożony do serwera Pelican!`, 'info');
          setAgentStep(4);
          addAgentLog(`📜 Odczytywanie logów z konsoli serwera Minecraft Paper 1.21.4...`, 'info');
          addAgentLog(`✅ BRAK BŁĘDÓW! Plugin został pomyślnie załadowany i aktywowany!`, 'success');
          setAgentStep(5);
          success = true;
        }

      } catch (err) {
        addAgentLog(`⚠️ Wystąpił błąd komunikacji z agentem: ${err.message}`, 'error');
        break;
      }
    }

    setIsAgentRunning(false);
    if (success) {
      addAgentLog('🎉 AUTONOMICZNY TEST ZAKOŃCZONY SUKCESEM 100%!', 'success');
    } else {
      addAgentLog('⚠️ Przekroczono limit prób automatycznej naprawy.', 'error');
    }
  };

  // Helper to parse markdown properly and hide <file> blocks
  const renderMessageContent = (text, isStreaming, msgIndex = -1) => {
    const isUserMsg = msgIndex >= 0 && messages[msgIndex]?.sender === 'You';
    const canViewCode = isUserMsg || (userProfile?.plan && 
                        userProfile.plan.toLowerCase() !== 'free' && 
                        userProfile.plan.toLowerCase() !== 'darmowy');
    let cleanedText = text || '';
    const fileBlocks = [];
    
    // Extract file blocks so they don't clutter the chat
    if (cleanedText) {
      cleanedText = cleanedText.replace(/<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g, (match, path, code) => {
        if (path) {
          // Skip placeholder paths like "..." that AI generates when being lazy
          const isPlaceholder = path === '...' || path === '…' || /^\.{2,}$/.test(path) || path.length < 3;
          if (isPlaceholder) {
            return isEN ? '⚠️ AI generated an empty file — type "continue" or repeat your prompt so AI finishes the code.' : '⚠️ AI wygenerowało pusty plik — wpisz "kontynuuj" lub powtórz prośbę, żeby AI dokończyło kod.';
          }
          let isEdit = false;
          if (msgIndex > 0) {
            for (let i = 0; i < msgIndex; i++) {
              if (messages[i] && messages[i].text && messages[i].text.includes(`<file path="${path}"`)) {
                isEdit = true;
                break;
              }
            }
          }
          // Clean markdown fences that AI sometimes wraps inside <file>
          let cleanCode = code.replace(/^\s*```[a-zA-Z]*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '').trim();
          fileBlocks.push({ path, code: cleanCode, isEdit });
        }
        return ''; 
      });
    }

    // Extract think blocks
    let hasThink = false;
    let thinkText = '';
    if (cleanedText) {
      const thinkRegex = /(?:<(?:think|thinking|plan|antml:thinking)>|\[(?:think|thinking|plan|antml:thinking)\]|\{?antml:thinking\}?|&lt;(?:think|thinking|plan|antml:thinking)&gt;)\s*([\s\S]*?)(?:<\/(?:think|thinking|plan|antml:thinking)>|\[\/(?:think|thinking|plan|antml:thinking)\]|\{?\/antml:thinking\}?|&lt;\/(?:think|thinking|plan|antml:thinking)&gt;|$)/i;
      const match = thinkRegex.exec(cleanedText);
      if (match) {
        thinkText = match[1];
        hasThink = true;
        thinkText = thinkText.replace(/```[\s\S]*?(?:```|$)/g, '\n*[... kod ukryty dla czytelności ...]*\n');
        thinkText = thinkText.replace(/<file[\s\S]*?(?:<\/file>|$)/g, '\n*[... plik ukryty dla czytelności ...]*\n');
        cleanedText = cleanedText.replace(thinkRegex, '').trim();
      }
      
      cleanedText = cleanedText.replace(/(?:<(?:think|thinking|plan|antml:thinking)>|\[(?:think|thinking|plan|antml:thinking)\]|\{?antml:thinking\}?|&lt;(?:think|thinking|plan|antml:thinking)&gt;)([\s\S]*?)(?:<\/(?:think|thinking|plan|antml:thinking)>|\[\/(?:think|thinking|plan|antml:thinking)\]|\{?\/antml:thinking\}?|&lt;\/(?:think|thinking|plan|antml:thinking)&gt;|$)/gi, (m, content) => {
        if (!hasThink) {
          thinkText = content;
          hasThink = true;
        } else {
          thinkText += "\n" + content;
        }
        thinkText = thinkText.replace(/```[\s\S]*?(?:```|$)/g, '\n*[... kod ukryty dla czytelności ...]*\n');
        thinkText = thinkText.replace(/<file[\s\S]*?(?:<\/file>|$)/g, '\n*[... plik ukryty dla czytelności ...]*\n');
        return '';
      }).trim();
    }

    // Auto-close codeblocks during streaming to prevent visual jumping
    let renderText = cleanedText;
    const codeBlockCount = (renderText.match(/```/g) || []).length;
    if (isStreaming && codeBlockCount % 2 !== 0) {
       renderText += '\n```';
    }

    return (
      <div className="message-render-container">
        {((isStreaming && !cleanedText) || (hasThink && thinkText.trim())) ? (
          <div className="ai-thinking-stream-box fade-in" style={{
            color: 'rgba(255, 255, 255, 0.45)',
            fontSize: '0.8125rem',
            fontStyle: 'italic',
            lineHeight: '1.5',
            padding: '0.75rem 1rem',
            borderLeft: '2px solid rgba(249, 115, 22, 0.3)',
            background: 'rgba(255, 255, 255, 0.01)',
            borderRadius: '0 8px 8px 0',
            marginBottom: '1rem',
            fontFamily: 'var(--font-main)'
          }}>
            <div 
              onClick={() => {
                if (!isStreaming) {
                  setExpandedThoughts(prev => ({ ...prev, [msgIndex]: !prev[msgIndex] }));
                }
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: isStreaming ? 'default' : 'pointer',
                userSelect: 'none',
                marginBottom: (expandedThoughts[msgIndex] || isStreaming || (showThinkingGlobal && hasThink)) ? '0.5rem' : '0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#F97316', fontWeight: 600 }}>
                <Sparkles size={12} className={isStreaming && !cleanedText ? "animate-pulse" : ""} />
                <span>
                  {isStreaming 
                    ? (isEN ? "AI is thinking..." : "AI myśli...") 
                    : (isEN ? "AI Thought Process" : "Proces myślowy AI")}
                </span>
              </div>
              {!isStreaming && (
                <div style={{ color: '#F97316', display: 'flex', alignItems: 'center' }}>
                  {(expandedThoughts[msgIndex] || isStreaming || (showThinkingGlobal && hasThink)) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}
            </div>
            
            {(expandedThoughts[msgIndex] || isStreaming || (showThinkingGlobal && hasThink)) && (
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {thinkText || (isEN ? "Connecting and processing..." : "Nawiązywanie połączenia i przetwarzanie...")}
                {isStreaming && !cleanedText && <span className="blinking-cursor">▋</span>}
              </div>
            )}
          </div>
        ) : null}

        {cleanedText && (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              img({src, alt, ...props}) {
                return (
                  <div className="flex flex-col items-center my-6 p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/80 max-w-sm mx-auto shadow-lg backdrop-blur-sm">
                    <img src={src} alt={alt} className="rounded-lg max-h-64 object-contain hover:scale-105 transition-transform duration-300" {...props} />
                    {alt && <span className="text-xs text-neutral-400 mt-2 italic font-medium">{alt}</span>}
                  </div>
                );
              },
              code({node, inline, className, children, ...props}) {
                const langMatch = /language-(\w+)/.exec(className || '');
                const isBlock = langMatch || String(children).includes('\n');
                if (!isBlock) {
                  return <code className="inline-code" {...props}>{children}</code>;
                }
                const lang = langMatch ? langMatch[1] : 'code';
                return (
                  <CodeBlock 
                    lang={lang} 
                    className={className} 
                    canViewCode={canViewCode} 
                    isEN={isEN} 
                    {...props}
                  >
                    {children}
                  </CodeBlock>
                );
              }
            }}
          >
            {renderText}
          </ReactMarkdown>
        )}
        
        {fileBlocks.length > 0 && (
          <div className="changed-files-box fade-in">
            <div className="cf-header">
               <FileCode size={14} className="text-muted" /> {isEN ? 'CHANGED FILES' : 'ZMIENIONE PLIKI'} ({fileBlocks.length})
            </div>
            <div className="cf-list">
               {fileBlocks.map((fb, idx) => (
                  <FileBlock key={idx} fb={fb} userProfile={userProfile} />
               ))}
            </div>
          </div>
        )}
      </div>
    );
  };


  const MODELS_LIST = [
    {id:'claude-fable-5', label:'Claude Fable 5'},
    {id:'claude-opus-4-8', label:'Claude Opus 4.8'},
    {id:'claude-opus-4-7', label:'Claude Opus 4.7'},
    {id:'claude-sonnet-5', label:'Claude Sonnet 5.0'},
    {id:'claude-sonnet-4-6', label:'Claude Sonnet 4.6'},
    {id:'claude-haiku-4-5-20251001', label:'Claude Haiku 4.5'},
    {id:'z-ai/glm-5.2', label:'GLM 5.2'},
  ];

  // Compute files map for live workspace inspector using chronological creation and deletion
  const allFilesMap = useMemo(() => {
    return extractProjectFiles(messages);
  }, [messages]);

  const filePathsList = Object.keys(allFilesMap);
  const [selectedFilePath, setSelectedFilePath] = useState(null);

  useEffect(() => {
    if (filePathsList.length > 0 && (!selectedFilePath || !allFilesMap[selectedFilePath])) {
      const defaultFile = filePathsList.find(f => f.endsWith('pom.xml')) || filePathsList[0];
      setSelectedFilePath(defaultFile);
    }
  }, [filePathsList, selectedFilePath]);

  const currentFileContent = selectedFilePath ? allFilesMap[selectedFilePath] : null;

  if (!projectData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-300">Wczytywanie projektu i czatu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b0c10] text-[#f8fafc] font-sans antialiased overflow-hidden selection:bg-orange-500/20">
      
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-[#13151d] flex-shrink-0 z-20 shadow-xl">
        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <button 
            className="flex items-center gap-2 text-xs font-semibold text-[#94a3b8] hover:text-[#f8fafc] px-2.5 py-1.5 rounded-md hover:bg-[#191c27] transition-colors"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={14}/>
            {isEN ? 'Back to Projects' : 'Lista projektów'}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Moje Projekty</div>
          {projectsList.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-medium ${p.id === id ? 'bg-[#ff6b00] text-white font-semibold shadow-md' : 'text-[#94a3b8] hover:bg-[#191c27] hover:text-[#f8fafc]'}`}
              onClick={() => navigate(`/project/${p.id}`)}
              title={p.title}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${p.id === id ? 'bg-white' : 'bg-[#64748b]'}`}/>
              <span className="truncate flex-1">{p.title}</span>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/10 bg-[#0b0c10] flex-shrink-0 space-y-2">
          <button 
            className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-[#13151d] border border-white/10 hover:border-white/20 transition-all text-left"
            onClick={() => navigate('/ustawienia')}
          >
            {currentUser?.user_metadata?.discord_profile?.avatar ? (
              <img src={currentUser.user_metadata.discord_profile.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10"/>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#ff6b00] text-white flex items-center justify-center font-bold text-xs">
                {(currentUser?.user_metadata?.discord_profile?.global_name || currentUser?.user_metadata?.username || currentUser?.email || 'B').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-semibold text-[#f8fafc] truncate">
                {currentUser?.user_metadata?.discord_profile?.global_name || currentUser?.user_metadata?.discord_profile?.username || currentUser?.user_metadata?.username || currentUser?.email?.split('@')[0] || 'Konto'}
              </span>
              <span className="text-[10px] text-[#ff6b00] font-bold uppercase">{userProfile?.plan || 'Free'}</span>
            </div>
            <SettingsIcon size={14} className="text-[#64748b]"/>
          </button>
          
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#13151d] border border-white/10 rounded-lg text-xs font-mono">
            <span className="text-[#64748b]">{isEN ? 'Credits' : 'Kredyty'}</span>
            <span className="font-semibold text-[#ff6b00]">
              ${parseFloat(userProfile?.used_credits_uncached || userProfile?.used_credits || '0').toFixed(2)} / ${parseFloat(userProfile?.balance || '0').toFixed(2)}
            </span>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA (2-COLUMN SPLIT WORKSPACE) ─── */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-[#0b0c10]">
        
        {/* HEADER BAR */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-white/10 bg-[#0b0c10] flex-shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-bold text-[#f8fafc] truncate">{projectData.title}</h1>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#191c27] text-[#94a3b8] border border-white/10">
              {projectData.engine || 'Paper'} {projectData.version || '1.21.4'}
            </span>

            <div className="relative" ref={modelMenuRef}>
              <button
                className="flex items-center gap-2 px-3 py-1.5 bg-[#13151d] border border-white/10 hover:border-white/20 rounded-lg transition-all text-xs font-semibold text-[#f8fafc]"
                onClick={() => setIsModelMenuOpen(v => !v)}
              >
                <div className={`flex items-center justify-center w-4 h-4 rounded ${projectData.model?.startsWith('claude') ? 'text-[#ff6b00]' : 'text-sky-400'}`}>
                  <ModelIcon modelId={projectData.model} size={12}/>
                </div>
                {getModelDisplayName(projectData.model)}
                <ChevronDown size={13} className="text-[#64748b] ml-0.5"/>
              </button>
              {isModelMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#13151d] border border-white/16 rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">Model AI</div>
                  <div className="flex flex-col gap-0.5">
                  {MODELS_LIST.map(m => (
                    <button
                      key={m.id}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${projectData.model === m.id ? 'bg-[#ff6b00] text-white font-semibold' : 'text-[#94a3b8] hover:bg-[#191c27] hover:text-white'}`}
                      onClick={() => changeModel(m.id)}
                    >
                      <ModelIcon modelId={m.id} size={13}/>
                      {m.label}
                    </button>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {buildError && (
              <button className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors" onClick={handleAutoFix}>
                <Wrench size={13}/> {isEN ? 'Auto-Fix Error' : 'Napraw błąd'}
              </button>
            )}
            
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${showCodePanel ? 'bg-[#ff6b00] text-white border-[#ff6b00]' : 'bg-[#13151d] text-[#94a3b8] hover:text-[#f8fafc] border-white/10'}`}
              onClick={() => setShowCodePanel(v => !v)}
              title={isEN ? "Toggle code inspector" : "Pokaż/Ukryj podgląd kodu"}
            >
              <FileCode size={13}/>
              <span>{showCodePanel ? (isEN ? 'Hide Code' : 'Ukryj kod') : (isEN ? 'View Code' : 'Podgląd kodu')}</span>
            </button>

            <button 
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${isBuilding ? 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed' : 'bg-[#ff6b00] text-white hover:bg-[#e05d00] shadow-md'}`}
              onClick={handleBuild} 
              disabled={isBuilding}
            >
              {isBuilding ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                  <span>{isEN ? 'Compiling...' : 'Kompilowanie...'}</span>
                </>
              ) : (
                <>
                  <Package size={14}/>
                  <span>{isEN ? 'Build JAR' : 'Buduj JAR'}</span>
                </>
              )}
            </button>

            <button 
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-[#13151d] text-[#64748b] hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/30 transition-colors"
              onClick={handleClearChat} 
              title={isEN ? "Clear history" : "Wyczyść historię"}
            >
              <Trash2 size={14}/>
            </button>
          </div>
        </header>

        {/* 2-COLUMN SPLIT WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: CHAT & AI CO-PILOT */}
          <div className={`flex flex-col h-full bg-[#0b0c10] relative transition-all duration-300 ${showCodePanel ? 'w-full lg:w-7/12 border-r border-white/10' : 'w-full flex-1'}`}>
            
            {/* CHAT MESSAGES STREAM */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-36 space-y-6" ref={chatContainerRef}>
              
              {messages.length === 0 && !isGenerating && (
                <div className="m-auto flex flex-col items-center justify-center text-center max-w-md py-12 px-4 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#13151d] border border-white/10 flex items-center justify-center text-[#ff6b00]">
                    <ModelIcon modelId={projectData.model} size={24}/>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-[#f8fafc]">{isEN ? "Welcome to" : "Projekt"} {projectData.title}</h2>
                    <p className="text-[#94a3b8] text-xs leading-relaxed">
                      {isEN ? "Describe what plugin mechanics or features you want to generate. AI will build production-ready code." : "Opisz w polu poniżej mechaniki lub komendy, które chcesz stworzyć. AI wygeneruje kompletny kod."}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#13151d] border border-white/10 hover:border-white/20 text-xs font-medium text-[#f8fafc] rounded-lg transition-colors" onClick={() => setChatInput('Dodaj komendę /heal leczącą gracza do pełna z dźwiękiem LEVEL_UP')}>
                      <Lightbulb size={13} className="text-amber-400"/> Komenda /heal
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#13151d] border border-white/10 hover:border-white/20 text-xs font-medium text-[#f8fafc] rounded-lg transition-colors" onClick={() => setChatInput('Stwórz system skrzynek losujących (crates) z animacją otwarcia')}>
                      <Wrench size={13} className="text-sky-400"/> System skrzynek
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#13151d] border border-white/10 hover:border-white/20 text-xs font-medium text-[#f8fafc] rounded-lg transition-colors" onClick={() => setChatInput('Dodaj panel GUI z 27 slotami przypisanymi do komendy /menu')}>
                      <Package size={13} className="text-emerald-400"/> Panel GUI
                    </button>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <ChatMessageItem
                  key={msg.id || idx}
                  msg={msg}
                  idx={idx}
                  isEN={isEN}
                  currentUser={currentUser}
                  modelId={projectData?.model}
                  renderMessageContent={renderMessageContent}
                />
              ))}

              {isGenerating && messages.length > 0 && !messages[messages.length-1]?.isStreaming && (
                <div className="flex w-full gap-2.5 justify-start">
                  <AvatarBadge isUser={false} user={currentUser} modelId={projectData.model} />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-[#94a3b8]">{getModelDisplayName(projectData.model)}</span>
                    </div>
                    <div className="flex gap-1.5 items-center h-8 px-3.5 rounded-xl bg-[#13151d] border border-white/10 shadow-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* CHAT INPUT DOCK */}
            <ChatInputDock
              isGenerating={isGenerating}
              isEN={isEN}
              handleSend={handleSend}
              stopGenerating={stopGenerating}
              externalInput={chatInput}
              setExternalInput={setChatInput}
              webSearchEnabled={webSearchEnabled}
              setWebSearchEnabled={setWebSearchEnabled}
              onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
              onOpenEnhanceModal={() => {
                setEnhanceInputText(chatInput || '');
                setIsEnhanceModalOpen(true);
              }}
            />

            {/* LIGHTBOX IMAGE PREVIEW MODAL */}
            {lightboxImage && (
              <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
                <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                  <img src={lightboxImage} alt="Załącznik" className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/20 shadow-2xl" />
                  <button 
                    className="absolute -top-10 right-0 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                    onClick={() => setLightboxImage(null)}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* SERVER SCRIPT DATABASE & PRESETS MODAL */}
            {isPresetsModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#13151d] border border-white/15 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        <Server size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Baza Wzorców & Skryptów Serwerowych</h3>
                        <p className="text-xs text-slate-400">Wybierz gotową strukturę mechaniki z popularnych serwerów Minecraft</p>
                      </div>
                    </div>
                    <button onClick={() => setIsPresetsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div 
                      onClick={() => {
                        setChatInput('Stwórz plugin zawierający Mefentyk (&d&lMefentyk Anarchia - dający Siłę II, Szybkość III i Mdłości po zjedzeniu z fioletowymi cząsteczkami), CobbleX (losujący Koxy, Elytrę, Siekierę 6/3/3) oraz Różdżkę Teleportacyjną na Spawn z odliczaniem 5 sekund bez ruchu.');
                        setIsPresetsModalOpen(false);
                      }}
                      className="p-3.5 rounded-xl bg-[#0b0c10] border border-amber-500/20 hover:border-amber-500/60 transition-all cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">🔴 Anarchia.gg — Mefentyk & CobbleX & Różdżka</span>
                        <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">Wdrożone</span>
                      </div>
                      <p className="text-xs text-slate-300">Customowy zjadalny Mefentyk dający potężne boosty, receptury CobbleX z losowaniem koxów i perie oraz różdżka na spawn z timerem 5s bez ruchu.</p>
                    </div>

                    <div 
                      onClick={() => {
                        setChatInput('Stwórz plugin BoxPvP z odnawialnymi rzadkimi blokami diamentu/netheritu (po wykopaniu zamieniają się w Bedrock na 10 sekund), komendą /prestige resetującą surowce za wyższy prestiż oraz sklepem za walutę z wykopanych surowców.');
                        setIsPresetsModalOpen(false);
                      }}
                      className="p-3.5 rounded-xl bg-[#0b0c10] border border-sky-500/20 hover:border-sky-500/60 transition-all cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">🛡️ BoxPvP — Odnawialne Minerały & Prestiż</span>
                        <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded border border-sky-500/20">Wdrożone</span>
                      </div>
                      <p className="text-xs text-slate-300">System stref BoxPvP z automatycznym odnawianiem wykopanego złoża z Bedrocka na Diamenty oraz prestiżami dającymi stałe bonusy do obrażeń.</p>
                    </div>

                    <div 
                      onClick={() => {
                        setChatInput('Zbuduj plugin MediumHardHC (MSHC) z komendą /schowek (/depozyt), która automatycznie wymusza limit 2x Kox, 8x Refil, 12x Perła w ekwipunku, a nadmiar przenosi do wirtualnego magazynu w GUI.');
                        setIsPresetsModalOpen(false);
                      }}
                      className="p-3.5 rounded-xl bg-[#0b0c10] border border-emerald-500/20 hover:border-emerald-500/60 transition-all cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">⚔️ MediumHardHC — Schowek Limitów & BoyFarmer</span>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">Wdrożone</span>
                      </div>
                      <p className="text-xs text-slate-300">Wirtualny depozyt blokujący posiadanie nadmiaru perie/koxów w eq oraz specjalne bloki BoyFarmer i SandFarmer budujące filary obsydianu/piasku.</p>
                    </div>

                    <div 
                      onClick={() => {
                        setChatInput('Stwórz mechanikę BedWars zawierającą zadania BukkitRunnable spawnujące Żelazo, Złoto, Diamenty z uaktualnianym Hologramem ArmorStand nad spawnerem oraz menu Sklepu GUI za surowce.');
                        setIsPresetsModalOpen(false);
                      }}
                      className="p-3.5 rounded-xl bg-[#0b0c10] border border-purple-500/20 hover:border-purple-500/60 transition-all cursor-pointer group space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">🛏️ Hypixel BedWars — Generatory Surowców & Trapy</span>
                        <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">Wdrożone</span>
                      </div>
                      <p className="text-xs text-slate-300">Zautomatyzowane generatory żelaza/złota/diamentów z odliczającymi hologramami oraz pułapki drużynowe aktywujące naciągnięcie przy intruzie.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROMPT ENHANCER MODAL */}
            {isEnhanceModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#13151d] border border-purple-500/30 rounded-2xl max-w-xl w-full p-5 shadow-[0_0_40px_rgba(168,85,247,0.15)] space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                        <Sparkles size={18} className="animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Generator Promptów AI</h3>
                        <p className="text-xs text-slate-400">Wpisz krótki pomysł, a AI zamieni go w profesjonalny, szczegółowy prompt</p>
                      </div>
                    </div>
                    <button onClick={() => setIsEnhanceModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
                      <X size={18} />
                    </button>
                  </div>

                  <textarea
                    className="w-full h-32 bg-[#0b0c10] border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
                    placeholder="Np. Chcę skrypt na Anarchia.gg z Hydro Klatką, Mefentykiem i CobbleX..."
                    value={enhanceInputText}
                    onChange={e => setEnhanceInputText(e.target.value)}
                  />

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button 
                      onClick={() => setIsEnhanceModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Anuluj
                    </button>
                    <button 
                      onClick={handleEnhancePromptAction}
                      disabled={isEnhancingPrompt || !enhanceInputText.trim()}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 ${
                        isEnhancingPrompt || !enhanceInputText.trim()
                          ? 'bg-purple-950/40 text-purple-400/50 cursor-not-allowed border border-purple-900/30'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 cursor-pointer'
                      }`}
                    >
                      {isEnhancingPrompt ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Optymalizowanie promptu...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Wygeneruj Profesjonalny Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: ANTIGRAVITY AGENT WORKSPACE & FILE EXPLORER */}
          <div className={`flex-col h-full bg-[#0b0c10] border-l border-white/10 transition-all duration-300 ${showCodePanel ? 'hidden lg:flex w-full lg:w-5/12' : 'hidden'}`}>
            
            {/* RIGHT PANEL HEADER: TABS SWITCHER */}
            <div className="h-11 bg-[#13151d] border-b border-white/10 flex items-center justify-between px-3 gap-2 overflow-x-auto flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#ff6b00] text-white shadow-md">
                  <FileCode size={14} />
                  <span>Pliki Projektu ({filePathsList.length})</span>
                </div>
              </div>

              <button
                onClick={() => setShowCodePanel(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Zamknij panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* TAB CONTENT */}
            {rightPanelTab === 'agent' ? (
              /* AUTONOMOUS AGENT AI WORKSPACE */
              <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0a0c16] via-[#06070c] to-[#040508] overflow-hidden">
                {/* Agent Header & Control Card */}
                <div className="p-4 bg-[#0e1120]/90 backdrop-blur-md border-b border-indigo-500/20 flex flex-col gap-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 border border-indigo-500/30 shadow-inner">
                        <Bot size={22} className={isAgentRunning ? "animate-spin text-amber-400" : "text-indigo-400"} />
                        {isAgentRunning && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-white tracking-wide flex items-center gap-2">
                          Agent AI
                          <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Pelican Sandbox
                          </span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Silnik: {projectData.engine || 'Paper'} • Wersja: {projectData.version || '1.21.4'}</p>
                      </div>
                    </div>

                    <div>
                      {!isAgentRunning ? (
                        <button 
                          onClick={runAgentLoop}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-900/30 active:scale-95"
                        >
                          <Play size={13} className="fill-current"/> Uruchom Agenta
                        </button>
                      ) : (
                        <button 
                          onClick={() => setIsAgentRunning(false)}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
                        >
                          <Square size={13} className="fill-current"/> Przerwij
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stepper Progress */}
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-medium text-center font-mono">
                    <div className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all border ${agentStep >= 1 ? 'bg-indigo-950/90 text-indigo-200 border-indigo-600/70 font-bold shadow-md shadow-indigo-950/50' : 'bg-black/30 text-slate-600 border-white/5'}`}>
                      <span>🧠 Kod AI</span>
                    </div>
                    <div className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all border ${agentStep >= 2 ? 'bg-indigo-950/90 text-indigo-200 border-indigo-600/70 font-bold shadow-md shadow-indigo-950/50' : 'bg-black/30 text-slate-600 border-white/5'}`}>
                      <span>⚙️ Maven</span>
                    </div>
                    <div className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all border ${agentStep >= 3 ? 'bg-indigo-950/90 text-indigo-200 border-indigo-600/70 font-bold shadow-md shadow-indigo-950/50' : 'bg-black/30 text-slate-600 border-white/5'}`}>
                      <span>📦 Pelican</span>
                    </div>
                    <div className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all border ${agentStep >= 4 ? (agentStep === 5 ? 'bg-emerald-950/90 text-emerald-200 border-emerald-600/80 font-bold shadow-md shadow-emerald-950/50' : 'bg-indigo-950/90 text-indigo-200 border-indigo-600/70 font-bold shadow-md shadow-indigo-950/50') : 'bg-black/30 text-slate-600 border-white/5'}`}>
                      <span>📜 Logi MC</span>
                    </div>
                  </div>
                </div>

                {/* Real-Time Live Execution Stream (Agent AI Terminal Logs) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs bg-[#040508]/80 custom-scrollbar">
                  {agentLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 py-16">
                      <div className="p-4 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                        <Terminal size={40} className="text-indigo-400/60 animate-pulse" />
                      </div>
                      <div className="text-center max-w-xs space-y-1">
                        <p className="text-xs font-bold text-slate-300">Konsola Agenta AI jest gotowa</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Kliknij <strong className="text-emerald-400">"Uruchom Agenta"</strong>, aby rozpocząć autonomiczny cykl kompilacji Maven, deploy na Pelican MC oraz testowania.
                        </p>
                      </div>
                    </div>
                  ) : (
                    agentLogs.map((log, idx) => (
                      <AgentActionCard 
                        key={log.id || idx} 
                        log={log} 
                        isLast={idx === agentLogs.length - 1} 
                      />
                    ))
                  )}
                  <div ref={agentLogsEndRef} />
                </div>

                {/* Interactive CLI Console Command Bar */}
                <div className="p-3 bg-[#090b14] border-t border-indigo-500/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2 bg-[#030407] border border-indigo-500/30 rounded-xl focus-within:border-indigo-400 transition-all shadow-inner">
                      <span className="text-xs font-mono text-emerald-400 font-bold select-none">$ mc &gt;</span>
                      <input 
                        type="text" 
                        value={mcCommandInput} 
                        onChange={(e) => setMcCommandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendMcConsoleCommand();
                        }}
                        placeholder="Komenda MC (np. plugins, help, reload)..." 
                        className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none placeholder-slate-500"
                      />
                    </div>
                    <button 
                      onClick={() => sendMcConsoleCommand()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <Send size={12}/> Wyślij
                    </button>
                  </div>

                  {/* Quick Preset Command Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 custom-scrollbar">
                    <button 
                      onClick={() => sendMcConsoleCommand('plugins')}
                      className="px-2.5 py-1 bg-[#141829] hover:bg-[#1f253d] text-indigo-300 rounded-lg text-[10px] font-mono transition-colors border border-indigo-500/30 whitespace-nowrap"
                    >
                      /plugins
                    </button>
                    <button 
                      onClick={() => sendMcConsoleCommand('reload confirm')}
                      className="px-2.5 py-1 bg-[#141829] hover:bg-[#1f253d] text-amber-300 rounded-lg text-[10px] font-mono transition-colors border border-amber-500/30 whitespace-nowrap"
                    >
                      /reload
                    </button>
                    <button 
                      onClick={() => sendMcConsoleCommand('tps')}
                      className="px-2.5 py-1 bg-[#141829] hover:bg-[#1f253d] text-emerald-300 rounded-lg text-[10px] font-mono transition-colors border border-emerald-500/30 whitespace-nowrap"
                    >
                      /tps
                    </button>
                    <button 
                      onClick={() => sendMcConsoleCommand('help')}
                      className="px-2.5 py-1 bg-[#141829] hover:bg-[#1f253d] text-slate-300 rounded-lg text-[10px] font-mono transition-colors border border-white/10 whitespace-nowrap"
                    >
                      /help
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* FILE EXPLORER & CODE VIEWER (Standard Code Mode) */
              <div className="flex-1 flex flex-col bg-[#07080b] overflow-hidden">
                {/* FILE TABS HEADER */}
                <div className="h-10 bg-[#0d0f17] border-b border-white/10 flex items-center justify-between px-3 gap-2 overflow-x-auto flex-shrink-0">
                  <div className="flex items-center gap-1 overflow-x-auto flex-1 py-1">
                    {filePathsList.length === 0 ? (
                      <span className="text-xs text-[#64748b] font-mono px-2">Brak wygenerowanych plików...</span>
                    ) : (
                      filePathsList.map(filePath => {
                        const fileName = filePath.split('/').pop();
                        const isSelected = filePath === selectedFilePath;
                        return (
                          <button
                            key={filePath}
                            onClick={() => setSelectedFilePath(filePath)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${isSelected ? 'bg-[#ff6b00] text-white font-semibold shadow-xs' : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#191c27]'}`}
                          >
                            <FileCode size={13} className={isSelected ? 'text-white' : 'text-[#64748b]'}/>
                            <span>{fileName}</span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {selectedFilePath && currentFileContent && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button 
                        className="p-1.5 rounded-md hover:bg-[#191c27] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                        title="Kopiuj zawartość pliku"
                        onClick={() => {
                          navigator.clipboard?.writeText(currentFileContent);
                          alert('Skopiowano kod do schowka!');
                        }}
                      >
                        <Copy size={14}/>
                      </button>
                      <button 
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-[#94a3b8] hover:text-red-400 transition-colors"
                        title="Usuń ten plik z projektu"
                        onClick={() => handleDeleteFile(selectedFilePath)}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  )}
                </div>

                {/* LIVE CODE VIEWER BODY */}
                <div className="flex-1 text-[#f8fafc] overflow-auto p-4 font-mono text-xs leading-relaxed relative">
                  {currentFileContent ? (
                    <pre className="m-0 whitespace-pre font-mono text-xs leading-relaxed">
                      <code dangerouslySetInnerHTML={{ __html: highlightVSCodeSyntax(currentFileContent, selectedFilePath) }} />
                    </pre>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#64748b] font-sans space-y-2">
                      <FileCode size={36} className="text-[#334155]"/>
                      <p className="text-xs font-medium">Wybierz plik z powyższego paska lub poproś AI o kod.</p>
                    </div>
                  )}
                </div>

                {/* BOTTOM BUILD TERMINAL DRAWER */}
                <div className="h-32 bg-[#060709] border-t border-white/10 p-3 font-mono text-xs text-[#94a3b8] overflow-y-auto flex flex-col justify-between flex-shrink-0">
                  <div className="flex items-center justify-between text-[11px] text-[#64748b] border-b border-white/10 pb-1.5 mb-1.5">
                    <span className="font-semibold uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${buildError ? 'bg-red-500' : isBuilding ? 'bg-[#ff6b00] animate-pulse' : 'bg-emerald-500'}`}/>
                      Konsola Kompilacji Maven
                    </span>
                    <span>{buildStatus || (buildError ? 'Błąd kompilacji' : 'Gotowy')}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto text-[11px] leading-relaxed text-[#94a3b8]">
                    {buildError ? (
                      <span className="text-red-400 font-mono">{buildError}</span>
                    ) : buildStatus ? (
                      <span className="text-emerald-400 font-mono">{buildStatus}</span>
                    ) : (
                      <span className="text-[#64748b]">[INFO] Kliknij "Buduj JAR" na górnym pasku, aby skompilować kod źródłowy Javy.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};
export default Project;
