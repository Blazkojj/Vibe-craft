import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Code2, 
  Cpu, 
  Bot, 
  CheckCircle2, 
  Server, 
  ShieldCheck, 
  Box, 
  Terminal, 
  FileText, 
  Layers, 
  HelpCircle, 
  ChevronDown, 
  Workflow, 
  Check, 
  X,
  Gauge,
  Lock,
  Database
} from 'lucide-react';
import Pricing from './Pricing';
import { useLang } from '../LangContext';
import './Landing.css';

function CookieBanner() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!localStorage.getItem('cookiesAccepted')) setVisible(true); }, []);
  if (!visible) return null;
  return (
    <div className="claude-cookie-banner">
      <span>{t.landing.cookieText}
        <Link to="/polityka-prywatnosci" style={{ color: '#ff6b00', marginLeft: 6 }}>{t.landing.cookieMore}</Link>
      </span>
      <button className="claude-cookie-btn" onClick={() => { localStorage.setItem('cookiesAccepted', 'true'); setVisible(false); }}>
        {t.landing.cookieOk}
      </button>
    </div>
  );
}

const SUPPORTED_ENGINES = [
  { name: 'PaperMC', version: '1.8 - 1.21.4', tag: 'Zalecany' },
  { name: 'Spigot', version: '1.8 - 1.21.4', tag: 'Standard' },
  { name: 'Purpur', version: '1.16 - 1.21.4', tag: 'High-Perf' },
  { name: 'Folia', version: '1.20 - 1.21.4', tag: 'Multi-Thread' },
  { name: 'Velocity', version: '3.0+', tag: 'Proxy' },
  { name: 'BungeeCord', version: 'Latest', tag: 'Proxy' }
];

const METRICS = [
  { label: 'Obsługiwane Silniki', value: 'Paper / Spigot / Folia' },
  { label: 'Czas Kompilacji JAR', value: '< 5 sekund' },
  { label: 'Zgodność z API', value: '1.8 - 1.21.4' },
  { label: 'Bazy Danych', value: 'MySQL / SQLite / Mongo' }
];

const USE_CASES = [
  {
    icon: Database,
    title: 'Autorska Ekonomia i Sklepy GUI',
    desc: 'Twórz systemy monetarne z obsługą Vault, bazami danych MySQL oraz interaktywnymi menu Inventory GUI.'
  },
  {
    icon: ShieldCheck,
    title: 'Gildie, Tereny i Ochrona',
    desc: 'Systemy drajwów, claimowania działek, zapisu danych gracza w PDC (PersistentDataContainer) oraz tablic wyników Scoreboard.'
  },
  {
    icon: Zap,
    title: 'Minigry i Areny PvP',
    desc: 'Instancjonowane minigry, automatyczne resetowanie map, systemy kitów, odliczanie czasowe oraz asynchroniczne eventy.'
  },
  {
    icon: Layers,
    title: 'Customowe Komendy i Permisje',
    desc: 'Automatyczne generowanie struktury `plugin.yml`, zaawansowany TabCompleter oraz integracja z LuckPerms.'
  }
];

const FAQ_ITEMS = [
  {
    q: 'Czy muszę instalować Javę lub Mavena na swoim komputerze?',
    a: 'Nie! Cały proces budowania i kompilowania pliku .jar odbywa się na naszych wydajnych serwerach w chmurze. Pobierasz gotowy plik gotowy do wrzucenia na Twój serwer Minecraft.'
  },
  {
    q: 'Jakie silniki i wersje Minecrafta są wspierane?',
    a: 'Zenexcode generuje kod zgodny z PaperMC, Spigot, Purpur, Folia oraz silnikami proxy takimi jak Velocity i BungeeCord. Wspieramy wersje od 1.8 do najnowszej 1.21.4.'
  },
  {
    q: 'Czy posiadam pełne prawa do wygenerowanego kodu source?',
    a: 'Tak! Otrzymujesz kompletny kod źródłowy w języku Java (pliki .java i plugin.yml). Możesz go edytować, modyfikować oraz udostępniać na Marketplace.'
  },
  {
    q: 'Co jeśli w kodzie pojawi się błąd podczas testowania na serwerze?',
    a: 'Nasz system posiada wbudowany czat z funkcją Auto-Fix. Po prostu wklej błąd ze swojej konsoli serwera do czatu – AI przeanalizuje stacktrace, natychmiast poprawi kod i przebuduje plik .jar.'
  }
];

export default function Landing() {
  const { lang, t } = useLang();
  const L = t.landing;
  const navigate = useNavigate();
  const [promptValue, setPromptValue] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if(promptValue.trim()) {
      localStorage.setItem('zenexcode_initial_prompt', promptValue);
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="dev-landing">
      <div className="dev-container">

        {/* ─── HERO SECTION ─── */}
        <section className="hero-centered">
          <h1 className="hero-title-mega">
            Twórz gotowe pluginy <br />
            <span style={{ color: '#ff6b00' }}>w 15 sekund dla Minecrafta</span>
          </h1>
          
          <p className="hero-sub-centered">
            Opisz czego potrzebujesz. Zenexcode przygotuje strukturę kodu Java, skompiluje plik .jar w chmurze i dostarczy go bezpośrednio do pobrania.
          </p>

          <form className="hero-prompt-bar" onSubmit={handlePromptSubmit}>
            <input 
              type="text" 
              className="prompt-text" 
              placeholder={lang === 'en' ? "e.g. Build an economy plugin with MySQL support & GUI shop..." : "np. Zbuduj plugin na ekonomię z obsługą MySQL i sklepem GUI..."}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
            />
            <button type="submit" className="prompt-btn">
              Generuj Plugin <ArrowRight size={16} />
            </button>
          </form>

          {/* Supported Engine Badges */}
          <div className="engine-badges-container">
            <span className="engine-badges-label">Wspierane Silniki Minecraft:</span>
            <div className="engine-badges-grid">
              {SUPPORTED_ENGINES.map((engine, idx) => (
                <div key={idx} className="engine-badge-pill">
                  <Server size={14} style={{ color: '#ff6b00' }} />
                  <span className="engine-name">{engine.name}</span>
                  <span className="engine-tag">{engine.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── METRICS BAR ─── */}
        <section className="landing-metrics-bar">
          {METRICS.map((m, idx) => (
            <div key={idx} className="metric-box">
              <span className="metric-value">{m.value}</span>
              <span className="metric-label">{m.label}</span>
            </div>
          ))}
        </section>

        {/* ─── HOW IT WORKS (3 STEPS) ─── */}
        <section className="landing-steps-section">
          <div className="features-header-center">
            <h2 className="features-main-title">Jak działa Zenexcode w 3 krokach</h2>
            <p className="features-main-sub">Od pomysłu do działającego pliku .jar bez instalowania środowisk programistycznych.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-title">Opisujesz Wizję</h3>
              <p className="step-desc">Wpisujesz opis funkcji pluginu. Wybierasz wersję Minecrafta oraz silnik docelowy (np. Paper 1.21.4).</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-title">Generowanie Kodu</h3>
              <p className="step-desc">System tworzy strukturę klas Java, komend, eventów, konfiguracji yml oraz zależności Maven.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-title">Kompilacja i Pobranie .JAR</h3>
              <p className="step-desc">Chmura kompiluje Twój projekt w ułamku sekundy. Pobierasz plik .jar i wgrywasz na swój serwer Minecraft.</p>
            </div>
          </div>
        </section>

        {/* ─── FEATURE GRID ─── */}
        <section id="funkcje" className="landing-features-section">
          <div className="features-header-center">
            <h2 className="features-main-title">Możliwości Środowiska</h2>
            <p className="features-main-sub">Dedykowany zestaw narzędzi dostosowany do serwerów Minecraft.</p>
          </div>

          <div className="modern-features-grid">
            
            {/* Feature Card 1 */}
            <div className="modern-feature-card">
              <div className="feature-icon-box"><Code2 size={24} /></div>
              <h3 className="feature-card-title">Czysta Architektura Spigot / Paper</h3>
              <p className="feature-card-desc">
                Uporządkowany kod z podziałem na Komendy, Eventy, Managerów oraz konfigurację `plugin.yml`. Wykorzystuje Adventure API oraz PDC.
              </p>
              <ul className="feature-checklist">
                <li><CheckCircle2 size={16} color="#ff6b00" /> Auto-rejestracja komend i listenerów</li>
                <li><CheckCircle2 size={16} color="#ff6b00" /> Bazy danych MySQL, SQLite & Mongo</li>
                <li><CheckCircle2 size={16} color="#ff6b00" /> Wsparcie dla Paper 1.8 - 1.21.4</li>
              </ul>
            </div>

            {/* Feature Card 2 */}
            <div className="modern-feature-card">
              <div className="feature-icon-box"><Cpu size={24} /></div>
              <h3 className="feature-card-title">Kompilator Maven w Chmurze</h3>
              <p className="feature-card-desc">
                Nie musisz instalować Javy, JDK ani Mavena na swoim komputerze. Nasz serwer kompiluje projekt i dostarcza plik `.jar`.
              </p>
              <ul className="feature-checklist">
                <li><CheckCircle2 size={16} color="#ff6b00" /> Brak błędów zależności (No ClassDefFound)</li>
                <li><CheckCircle2 size={16} color="#ff6b00" /> Pobieranie gotowego `.jar` 1-kliknięciem</li>
                <li><CheckCircle2 size={16} color="#ff6b00" /> Automatyczna weryfikacja poprawności</li>
              </ul>
            </div>

            {/* Feature Card 3 */}
            <div className="modern-feature-card">
              <div className="feature-icon-box"><Bot size={24} /></div>
              <h3 className="feature-card-title">Czat z Funkcją Auto-Fix</h3>
              <p className="feature-card-desc">
                Jeśli podczas testów wykryjesz błąd, wklej go do czatu. System przeanalizuje stacktrace, poprawi kod w plikach i przebuduje `.jar`.
              </p>
              <ul className="feature-checklist">
                <li><CheckCircle2 size={16} color="#ff6b00" /> Modele Claude Sonnet 4.6, Opus 4.8, GLM</li>
                <li><CheckCircle2 size={16} color="#ff6b00" /> Pamięć kontekstowa całego projektu</li>
                <li><CheckCircle2 size={16} color="#ff6b00" /> Generowanie i edycja wieloplikowa</li>
              </ul>
            </div>

          </div>
        </section>

        {/* ─── USE CASES ─── */}
        <section className="landing-usecases-section">
          <div className="features-header-center">
            <h2 className="features-main-title">Co możesz stworzyć w Zenexcode?</h2>
            <p className="features-main-sub">Przykłady popularnych mechanik serwerowych budowanych przez użytkowników.</p>
          </div>

          <div className="usecases-grid">
            {USE_CASES.map((uc, idx) => {
              const IconComp = uc.icon;
              return (
                <div key={idx} className="usecase-card">
                  <div className="usecase-icon-box"><IconComp size={20} /></div>
                  <h3 className="usecase-title">{uc.title}</h3>
                  <p className="usecase-desc">{uc.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── COMPARISON TABLE ─── */}
        <section className="landing-comparison-section">
          <div className="features-header-center">
            <h2 className="features-main-title">Porównanie z Innymi Metodami</h2>
            <p className="features-main-sub">Zobacz czym Zenexcode różni się od tradycyjnego kodowania oraz zwykłego czatu AI.</p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Cecha / Funkcja</th>
                  <th className="highlight-col">Zenexcode</th>
                  <th>Tradycyjne Kodowanie</th>
                  <th>Zwykły ChatGPT / Claude</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Kompilacja do pliku .JAR</td>
                  <td className="highlight-col"><Check size={18} color="#ff6b00" /> Automatyczna w Chmurze</td>
                  <td><X size={18} color="#64748b" /> Wymaga JDK & Maven lokalnie</td>
                  <td><X size={18} color="#64748b" /> Brak kompilacji</td>
                </tr>
                <tr>
                  <td>Struktura wieloplikowa Java</td>
                  <td className="highlight-col"><Check size={18} color="#ff6b00" /> Pełny pakiet i plugin.yml</td>
                  <td><Check size={18} color="#94a3b8" /> Ręczne tworzenie</td>
                  <td><X size={18} color="#64748b" /> Pojedyncze skrawki kodu</td>
                </tr>
                <tr>
                  <td>Auto-Fix błędów z konsoli</td>
                  <td className="highlight-col"><Check size={18} color="#ff6b00" /> Dedykowany parser errorów</td>
                  <td><X size={18} color="#64748b" /> Ręczny debug</td>
                  <td><X size={18} color="#64748b" /> Brak kontekstu projektu</td>
                </tr>
                <tr>
                  <td>Znajomość Paper 1.21.4 API</td>
                  <td className="highlight-col"><Check size={18} color="#ff6b00" /> Zoptymalizowane wzorce</td>
                  <td><Check size={18} color="#94a3b8" /> Wymaga nauki dokumentacji</td>
                  <td><X size={18} color="#64748b" /> Przestarzałe metody Bukkit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section id="cennik" className="claude-pricing-section">
          <Pricing inLanding={true} />
        </section>

        {/* ─── FAQ SECTION ─── */}
        <section id="faq" className="landing-faq-section">
          <div className="features-header-center">
            <h2 className="features-main-title">Najczęściej Zadawane Pytania (FAQ)</h2>
            <p className="features-main-sub">Wszystko, co musisz wiedzieć o generowaniu pluginów z Zenexcode.</p>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className={`faq-card${openFaq === idx ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <div className="faq-question">
                  <span>{item.q}</span>
                  <ChevronDown size={18} className="faq-arrow" />
                </div>
                {openFaq === idx && (
                  <div className="faq-answer">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="new-cta-banner">
          <h2 className="new-cta-title">Stwórz swój pierwszy plugin już teraz</h2>
          <p className="new-cta-desc">Dołącz do deweloperów i właścicieli serwerów Minecraft budujących nowoczesne pluginy z Zenexcode.</p>
          <Link to="/dashboard" className="prompt-btn" style={{ display: 'inline-flex', width: 'auto', padding: '0.85rem 2.25rem', fontSize: '1rem' }}>
            Wypróbuj Za Darmo <ArrowRight size={18} />
          </Link>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="claude-footer" style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 0 0', marginTop: '4rem' }}>
          <div className="claude-footer-bottom" style={{ borderColor: 'rgba(255,255,255,0.08)', paddingBottom: '2rem', display: 'flex', justify: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>© 2026 Zenexcode. Wszelkie prawa zastrzeżone. Projekt autorstwa Zenex.</span>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <Link to="/polityka-prywatnosci" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Polityka Prywatności</Link>
              <Link to="/regulamin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>Regulamin</Link>
            </div>
          </div>
        </footer>

      </div>
      <CookieBanner />
    </div>
  );
}
