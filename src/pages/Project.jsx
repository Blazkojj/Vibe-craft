import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ChevronDown, Send, FileCode, Sparkles, ArrowLeft, Trash2, Settings as SettingsIcon, Wallet, Copy, Check, ChevronRight, Lightbulb, Wrench, Lock, Download, FileText, Code2, Terminal, RefreshCw } from 'lucide-react';
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
  accumulatedText = ''
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
        history: history
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
              updateMsgCb(fullText);
            }
            
            if (delta.content) {
              if (hasStartedReasoning && !hasEndedReasoning) {
                fullText += '\n</think>\n\n';
                hasEndedReasoning = true;
              }
              fullText += delta.content;
              updateMsgCb(fullText);
            }
          } else if (parsed.content) {
            fullText += parsed.content;
            updateMsgCb(fullText);
          } else if (parsed.error) {
            throw new Error(`API Error: ${parsed.error.message || JSON.stringify(parsed.error)}`);
          }
        } catch(e) {
          if (e.message && e.message.includes('API Error')) throw e;
          console.error("SSE JSON Parse Error for line:", dataStr, e);
        }
      }
    }
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

const MINECRAFT_SERVERS_KNOWLEDGE = `
ZNAJOMOŚĆ POLSKICH SERWERÓW MINECRAFT I ICH WTYCZEK:
Znasz architekturę, mechanikę i zachowanie popularnych wtyczek z polskich serwerów Minecraft, w tym w szczególności z serwera anarchia.gg (oraz innych serwerów typu Megadrop, Survival+Gildie jak craftmc.pl, realcraft.pl, mysg.pl, blocky.pl, boxcwel.pl itp.):
- System Sektorów: Rozdzielanie świata na oddzielne instancje serwerowe połączone bazą danych Redis/MySQL do płynnej synchronizacji ekwipunku, zdrowia i statystyk gracza w czasie rzeczywistym podczas przekraczania granic sektorów (teleportacja na krawędzi mapy).
- BoyFarmer: Blok (zazwyczaj Obsidian lub Gąbka), który po postawieniu automatycznie generuje pionowy słup obsydianu w dół aż do bedrocka (poziom Y=-64).
- SandFarmer: Blok (zazwyczaj Piasek), który po postawieniu automatycznie generuje pionowy słup piasku w dół aż do bedrocka (poziom Y=-64).
- KopaczFossy: Blok (zazwyczaj Blok Ruda), który po postawieniu automatycznie usuwa (kopie) pionowy pas bloków o wymiarach np. 1x1 lub 3x3 w dół aż do bedrocka, tworząc fosę.
- CobbleX: Blok tworzony z 9 staków cobblestone'u w craftingu. Po jego postawieniu i zniszczeniu (lub kliknięciu prawym przyciskiem myszy) gracz otrzymuje losowy drop premium (np. diamenty, netherite, złote jabłka, narzędzia z losowymi zaklęciami).
- Pandory (lub Skrzynki Pandora): Przedmiot (np. blok muzyczny) o specjalnej nazwie. Postawienie go generuje losowe przedmioty na ziemi lub w ekwipunku gracza, imitując puszkę pandory z dropem.
- Stoniarki (StoneGenerators / Generator Kamienia): Blok (np. tłok lub gąbka), nad którym po zniszczeniu kamienia automatycznie regeneruje się nowy kamień po krótkim opóźnieniu (zazwyczaj 1-2 sekundy).
- Różdżki Teleportacyjne (Wands): Przedmioty (np. złota motyka) z określoną liczbą użyć w opisie. Kliknięcie prawym przyciskiem myszy rozpoczyna odliczanie (np. 5 sekund) bez poruszania się, po czym następuje teleportacja na Spawn lub do wyznaczonej lokalizacji.
- Turbodrop: System modyfikujący dropy z kamienia. Zamiast standardowego dropu z rudy, gracze kopiąc kamień (stone) otrzymują bezpośrednio do ekwipunku surowce (diamenty, szmaragdy, żelazo) z określoną procentową szansą, uwzględniając mnożniki poziomu, uprawnienia VIP/SVIP oraz wydarzenia typu TurboDrop (np. podwójna szansa dla całego serwera). Zawiera rozbudowane GUI z włączaniem/wyłączaniem dropu poszczególnych surowców.
- Rzucane TNT: Specjalne dynamity, które po kliknięciu prawym przyciskiem myszy są rzucane w kierunku patrzenia gracza. Po uderzeniu w blok wybuchają natychmiastowo, ignorując zabezpieczenia wody/lawy.
- System Gildii i Sojuszy: Tworzenie gildii za przedmioty z configu, powiększanie terenu (cuboid), podbijanie innych gildii poprzez niszczenie tzw. serca gildii (np. smoczego jaja), naliczanie punktów rankingu gildii na podstawie KDR (zabójstw/zgonów) członków.
- Otchłań (Abyss): System cyklicznego czyszczenia przedmiotów leżących na ziemi na całym serwerze. Usunięte przedmioty trafiają do wirtualnego schowka (/otchlan), z którego gracze mogą je za darmo lub za opłatą wyciągnąć przez określony czas.
- Anty-Logut (Combat Log): Blokada wylogowania się podczas walki PvP. Gracz po uderzeniu innego gracza trafia do walki na np. 15 sekund. Użycie komend teleportacji jest zablokowane, a wyjście z serwera skutkuje natychmiastową śmiercią i wypadnięciem przedmiotów.

Gdy użytkownik poprosi o którykolwiek z tych systemów lub nawiąże do serwerów takich jak anarchia.gg lub craftmc.pl, doskonale wiesz, jak te mechaniki działają i tworzysz dedykowane klasy o identycznym zachowaniu (np. BoyFarmer generujący pionowy pas obsydianu za pomocą BukkitRunnable, Turbodrop z GUI opartym na Inventory i miniserializacją wiadomości Adventure, CobbleX z obsługą receptury rzemieślniczej itp.).

GENEROWANIE OBRAZKÓW DLA ITEMÓW (POLLINATIONS FLUX):
Gdy użytkownik poprosi o wygenerowanie grafiki, obrazka lub wyglądu przedmiotu/bloku (np. "stwórz grafikę dla boyfarmera" albo "wygeneruj obrazek miecza ognia"):
1. Stwórz szczegółowy, profesjonalny prompt po angielsku w stylu Minecraft (np. "Minecraft style flat vector icon of a magical burning fire sword, game item, dark gray solid background").
2. Zakoduj ten prompt do formatu URL (URL-encode).
3. Wstaw wygenerowany obrazek na samym początku swojej wypowiedzi tekstowej (po bloku <think>, ale KATEGORYCZNIE przed pierwszym tagiem <file>) za pomocą tagu markdown:
![Opis obrazka](https://image.pollinations.ai/prompt/{URL_ENCODED_PROMPT}?width=512&height=512&nologo=true&private=true&model=flux)
4. Automatycznie dodaj ten sam URL obrazka do wygenerowanego kodu konfiguracji pluginu (np. config.yml pod kluczem "texture-url" lub "image-url") lub jako stałą/pole w kodzie Javy tworzącym dany przedmiot.

ZAPOBIEGANIE POMIJANIU PLIKÓW I UTRACIE KODU:
1. Zawsze dokładnie analizuj strukturę plików w projekcie. Sprawdź, czy nie pominąłeś żadnej klasy zadeklarowanej w plugin.yml, config.yml lub w Twoim własnym planie architekta. Zaimplementuj wszystkie brakujące pliki!
2. Jeśli ze względu na limit tokenów wyjściowych (8192) nie jesteś w stanie wygenerować wszystkich klas w jednej odpowiedzi, wygeneruj najpierw najważniejsze pliki w całości (100% kompletny kod), a na końcu wypisz listę plików, które pozostały do zaimplementowania i poproś użytkownika o napisanie "kontynuuj". Kategorycznie zabrania się generowania klas ze skrótami "..." lub komentarzami oznaczających brak zmian!
3. Jeśli użytkownik napisał "kontynuuj", "dokończ" lub poprosił o brakujące pliki, natychmiast wygeneruj pozostałe klasy w całości w tagach <file>.
`;

const isClaudeModel = (model) => {
  return ['opus-4.8', 'sonnet-4.8', 'haiku-4.8', 'claude-opus-4-7', 'claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-sonnet-5'].includes(model);
};

const getIdentityInjection = (model) => {
  if (model === "opus-4.8" || model === "claude-opus-4-8") {
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
        <code className={className} {...props}>{children}</code>
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
          <pre className="cf-item-code"><code>{fb.code}</code></pre>
        ) : (
          <div className="p-3 text-xs text-amber-500/80 bg-amber-950/20 border-t border-amber-900/30 flex items-center gap-2">
            <Lock size={12} />
            {isEN ? 'Code preview is available from Plan 1.' : 'Podgląd kodu dostępny tylko od planu pierwszego.'}
          </div>
        )
      )}
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
  const [projectsList, setProjectsList] = useState([]);
  const modelMenuRef = useRef(null);

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

  const handleSend = async (overrideMsg = null) => {
    if (isGeneratingRef.current) return;       // synchroniczny guard — blokuje podwójne wywołania
    if (isGenerating) return;
    const isEvent = overrideMsg && (overrideMsg.target || overrideMsg.preventDefault || typeof overrideMsg === 'object');
    const userMsg = (typeof overrideMsg === 'string' && !isEvent) ? overrideMsg : chatInput;
    
    if (!userMsg || typeof userMsg !== 'string' || !userMsg.trim() || userMsg === 'undefined') return;
    
    isGeneratingRef.current = true;            // zablokuj natychmiast, zanim state się zaktualizuje
    addMessage('You', userMsg);
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
      
      
      const systemPrompt = `${identityInjection}${MINECRAFT_SERVERS_KNOWLEDGE}Jesteś elitarnym inżynierem oprogramowania (Java/PaperMC). 
ZASADY KRYTYCZNE:
1. Brak kodu jeśli prompt to luźna rozmowa.
2. BŁĘDY [SYSTEM-AUTO-FIX]: Gdy dostaniesz błąd z konsoli (wiadomość zawierającą [SYSTEM-AUTO-FIX]), musisz bezwzględnie poprawić pliki wykazujące błędy. Zwróć każdy poprawiony plik jako kompletny plik w tagu <file path="dokładna_ścieżka_pliku">...</file> (np. pom.xml lub odpowiednia klasa Java). Nie pomijaj żadnych linii kodu ani nie stosuj skrótów. Ścieżki plików w tagu <file> muszą być identyczne ze ścieżkami z sekcji "AKTUALNY KOD W PROJEKCIE".
3. Paper 1.21+: używaj Adventure API (Component), nie ChatColor.
4. Jeśli modyfikujesz logikę - dbaj o config.yml, PDC, title i uprawnienia.
5. Format plików:
<file path="sciezka/do/pliku">
KOD (ZAWSZE PEŁNY, NIGDY NIE SKRACAJ Z "...")
</file>
6. Zawsze zacznij od <think>krótki proces myślowy</think>.
7. Zmieniaj tylko te pliki, które wymagają edycji. Każdy zmieniony plik musisz bezwzględnie wygenerować w całości (100% gotowy kod) w tagach <file>. Zabrania się opisywania zmian tylko tekstowo oraz stosowania skrótów typu "..." lub "// reszta kodu bez zmian".
8. KATEGORYCZNY ZAKAZ pytania użytkownika o zgodę na napisanie kodu (np. "Chcesz żebym wygenerował kod?"). Masz OD RAZU napisać i zwrócić wszystkie potrzebne pliki w tagach <file>!
9. KRYTYCZNE: ZAWSZE na samym początku swojej wiadomości (zaraz po bloku <think>, ale KATEGORYCZNIE PRZED jakimkolwiek tagiem <file>) napisz bardzo szczegółowe, bogate tekstowe wprowadzenie, opis i instrukcje po polsku. Opisz dokładnie co zostało zrobione, co i jak zostanie zaimplementowane, jak działa kod, wypisz wszystkie komendy, uprawnienia (permissions) oraz przykłady użycia i instrukcję konfiguracji. Dopiero PO TYM kompletnym opisie wygeneruj tagi <file> z kodem.
10. Nie powtarzaj kodu. Przechodź od razu do rzeczy.
11. OGRANICZENIE ROZMIARU ODPOWIEDZI: Ponieważ limit tokenów wyjściowych wynosi 8192, ZAWSZE w pierwszej kolejności wygeneruj kompletny pom.xml, plugin.yml i config.yml, a potem maksymalnie 1-2 kompletne klasy Java. Nie zaczynaj generować plików, których nie zdążysz ukończyć przed limitem tokenów! Pliki kodu muszą być kompletne od początku do końca, bez żadnych skrótów "..." ani komentarzy oznaczających brak zmian. Poinformuj użytkownika na końcu, aby napisał "kontynuuj" w celu wygenerowania pozostałych klas.`;
      
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
4. OGRANICZENIE ROZMIARU ODPOWIEDZI: Ponieważ limit tokenów wyjściowych wynosi 8192, ZAWSZE w pierwszej kolejności wygeneruj kompletny pom.xml, plugin.yml i config.yml, a potem maksymalnie 1-2 kompletne klasy Java. Nie zaczynaj generować plików, których nie zdążysz ukończyć przed limitem tokenów! Pliki kodu muszą być kompletne od początku do końca, bez żadnych skrótów "..." ani komentarzy oznaczających brak zmian.
5. Na samym końcu wiadomości (po zamknięciu ostatniego tagu </file>) wymień pliki, które pozostały do zaimplementowania (np. menedżery, GUI, listenery) i poproś użytkownika o napisanie słowa "kontynuuj", aby wygenerować kolejną część kodu.`;
         
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
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: 'handleSend', message: err.message, name: err.name, stack: err.stack })
      }).catch(() => {});
      if (msgId) {
        // zachowaj częściową treść zamiast kasować wiadomość
        setMessages(prev => prev.map(m => {
          if (m.id !== msgId) return m;
          const partial = m.text || '';
          const errNote = err.message?.includes('429')
            ? '\n\n---\n⚠️ **Przerwano — limit zapytań API (429).** Poczekaj ~1 min lub zmień model.'
            : `\n\n---\n⚠️ **Przerwano — błąd połączenia:** ${err.message || 'nieznany'}`;
          return { ...m, text: (partial || '') + errNote, isStreaming: false };
        }));
      }
      if (err.message && err.message.includes('429')) {
         addMessage('System', `⚠️ **Limit zapytań API przekroczony!**\nOsiągnięto limit dla obecnego modelu. Poczekaj około minutę lub **zmień model na "Gemini 1.5 Flash"** w menu na dole czatu, który ma znacznie większe limity w darmowym planie.`);
      } else {
         addMessage('System', `Błąd: ${err.message} (${err.name})\n\nStack:\n${err.stack}`);
      }
    } finally {
      isGeneratingRef.current = false;
      setStreamingMessageId(null);
      setIsGenerating(false);
    }
  };

  const handleAutoFix = () => {
    if (!buildError) return;
    setActiveTab('chat');
    
    // Pass the actual project parameters, telling AI this is an automated system fix
    const errorMsg = isEN 
      ? `[SYSTEM-AUTO-FIX] A compilation error occurred while building the Java plugin. 
Here is the error from the terminal:
\`\`\`
${buildError}
\`\`\`
Analyze the reason for the error and fix it. You MUST generate the 100% complete corrected code files (or files) from scratch. Never use comments like '// rest of code...' or abbreviation '...'. Remember to return the complete pom.xml if it needs to be updated or generated!`
      : `[SYSTEM-AUTO-FIX] Wystąpił błąd kompilacji podczas budowania pluginu Javy. 
Oto treść błędu z terminala:
\`\`\`
${buildError}
\`\`\`
Przeanalizuj powód błędu i napraw go. ZAWSZE generuj kompletne pliki od początku do końca, bez żadnych skrótów typu "..." czy "// reszta kodu bez zmian". Pamiętaj, aby plik pom.xml oraz pliki kodu źródłowego były w 100% pełne i poprawne składniowo. Zwróć także szczegółowy opis tego, co dokładnie zostało poprawione.`;
    
    setBuildError(null);
    handleSend(errorMsg);
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

  const handleBuild = async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildStatus(isEN ? 'Initializing Maven server...' : 'Inicjalizacja serwera Maven...');
    
    // Gather all files from messages (keeping only the newest version of each file)
    const filesMap = {};
    let aiEditsCount = 0;
    
    messages.forEach(msg => {
      const text = msg.text || '';
      const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g;
      let match;
      let hasFile = false;
      while ((match = regex.exec(text)) !== null) {
        let fileContent = match[2];
        // Clean markdown backticks in case AI wrapped code inside the file tag
        fileContent = fileContent.replace(/^\s*```[a-zA-Z]*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '');
        filesMap[match[1]] = fileContent.trim();
        hasFile = true;
      }
      if (hasFile && msg.sender !== 'You') aiEditsCount++;
    });
    
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
    {id:'claude-opus-4-8', label:'Claude Opus 4.8'},
    {id:'claude-opus-4-7', label:'Claude Opus 4.7'},
    {id:'claude-sonnet-5', label:'Claude Sonnet 5.0'},
    {id:'claude-sonnet-4-6', label:'Claude Sonnet 4.6'},
    {id:'claude-haiku-4-5-20251001', label:'Claude Haiku 4.5'},
    {id:'z-ai/glm-5.2', label:'GLM 5.2'},
  ];

  // Compute files map for live workspace inspector
  const allFilesMap = useMemo(() => {
    const files = {};
    messages.forEach(msg => {
      const text = msg.text || '';
      const regex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        let fileContent = match[2].replace(/^\s*```[a-zA-Z]*\r?\n?/i, '').replace(/\r?\n?```\s*$/i, '').trim();
        if (match[1] && match[1] !== '...' && match[1].length > 2) {
          files[match[1]] = fileContent;
        }
      }
    });
    return files;
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

              {messages.map((msg, idx) => {
                const isUser = msg.sender === 'You';
                return (
                  <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col max-w-[92%] sm:max-w-[88%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                      
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-bold text-[#94a3b8]">
                          {isUser ? (isEN ? 'You' : 'Ty') : getModelDisplayName(projectData.model)}
                        </span>
                        <span className="text-[10px] font-mono text-[#64748b]">{msg.time}</span>
                      </div>

                      <div className={`relative w-full overflow-x-auto text-xs sm:text-[13px] ${isUser ? 'bg-[#ff6b00] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-md' : 'bg-[#13151d] border border-white/10 text-[#f8fafc] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-md prose prose-invert max-w-none prose-p:leading-relaxed'}`}>
                        {renderMessageContent(msg.text, msg.isStreaming, idx)}
                      </div>

                    </div>
                  </div>
                );
              })}

              {isGenerating && messages.length > 0 && !messages[messages.length-1]?.isStreaming && (
                <div className="flex w-full justify-start">
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
            <div className="absolute bottom-0 inset-x-0 bg-[#0b0c10]/95 backdrop-blur-md border-t border-white/10 p-4 z-10">
              <div className="relative flex flex-col bg-[#13151d] border border-white/10 focus-within:border-[#ff6b00] rounded-xl transition-colors p-2">
                <textarea
                  className="w-full max-h-48 bg-transparent border-none text-[#f8fafc] placeholder:text-[#64748b] p-2 resize-none focus:outline-none focus:ring-0 leading-relaxed text-sm"
                  placeholder={isGenerating ? (isEN ? "Generating..." : "AI generuje kod...") : (isEN ? "Ask AI to generate mechanics..." : "Opisz co chcesz zbudować...")}
                  value={chatInput}
                  disabled={isGenerating}
                  onChange={e => {
                    setChatInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
                  }}
                  onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); if(!isGenerating) handleSend(); }}}
                  rows={1}
                  style={{ minHeight: '44px' }}
                />
                
                <div className="flex items-center justify-between pt-2 border-t border-white/10 px-2">
                  <div className="text-[11px] text-[#64748b] font-mono flex items-center gap-2">
                    <span>Enter ↵ wyślij</span>
                    <span>•</span>
                    <span>Shift+Enter nowa linia</span>
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
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${!chatInput.trim() ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#ff6b00] text-white hover:bg-[#e05d00]'}`}
                        onClick={handleSend} 
                        disabled={!chatInput.trim()} 
                      >
                        <span>Wyślij</span>
                        <Send size={13}/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE WORKSPACE FILE EXPLORER & BUILD TERMINAL */}
          <div className={`flex-col h-full bg-[#0b0c10] border-l border-white/10 transition-all duration-300 ${showCodePanel ? 'hidden lg:flex w-full lg:w-5/12' : 'hidden'}`}>
            
            {/* FILE TABS HEADER */}
            <div className="h-11 bg-[#13151d] border-b border-white/10 flex items-center justify-between px-3 gap-2 overflow-x-auto flex-shrink-0">
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
                </div>
              )}
            </div>

            {/* LIVE CODE VIEWER BODY */}
            <div className="flex-1 bg-[#07080b] text-[#f8fafc] overflow-auto p-4 font-mono text-xs leading-relaxed relative">
              {currentFileContent ? (
                <pre className="m-0 whitespace-pre">
                  <code>{currentFileContent}</code>
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

        </div>

      </main>
    </div>
  );
};
export default Project;
