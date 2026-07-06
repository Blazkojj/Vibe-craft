import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Shield, Code2, Cpu, Package, Star } from 'lucide-react';
import Pricing from './Pricing';
import './Landing.css';

function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!localStorage.getItem('cookiesAccepted')) setVisible(true); }, []);
  if (!visible) return null;
  return (
    <div className="claude-cookie-banner">
      <span>Używamy ciasteczek do obsługi sesji logowania.
        <Link to="/polityka-prywatnosci" style={{color:'var(--accent)',marginLeft:6}}>Dowiedz się więcej</Link>
      </span>
      <button className="claude-cookie-btn" onClick={() => { localStorage.setItem('cookiesAccepted','true'); setVisible(false); }}>
        OK
      </button>
    </div>
  );
}

const TYPED_LINES = [
  { p: '$ ', c: 'zenexcode generate ', b: '"EconomyPlugin z shopem i aukcjami"' },
  { p: '', c: '[VC] ', m: 'Analizuję prompt...', dim: true },
  { p: '', c: '', m: 'Generuję architekturę Paper 1.21.4...', dim: true },
  { p: '+ ', c: 'EconomyManager.java', g: true },
  { p: '+ ', c: 'ShopCommand.java', g: true },
  { p: '+ ', c: 'AuctionHouse.java', g: true },
  { p: '+ ', c: 'plugin.yml', g: true },
  { p: '', c: '[Build] ', m: 'Kompiluję JAR...', dim: true },
  { p: '✓ ', c: 'EconomyPlugin.jar', g: true, dim2: '(41 KB)' },
];

function TypedTerminal() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= TYPED_LINES.length) {
      const reset = setTimeout(() => { setLineIdx(0); setCharIdx(0); }, 4000);
      return () => clearTimeout(reset);
    }
    const line = TYPED_LINES[lineIdx];
    const fullText = [line.p, line.c, line.b || line.m || '', line.dim2 || ''].join('');
    if (charIdx >= fullText.length) {
      const next = setTimeout(() => { setLineIdx(i => i + 1); setCharIdx(0); }, 280);
      return () => clearTimeout(next);
    }
    const tick = setTimeout(() => setCharIdx(c => c + 1), 28);
    return () => clearTimeout(tick);
  }, [lineIdx, charIdx]);

  const renderLine = (line, shown) => {
    const full = [line.p, line.c, line.b || line.m || '', line.dim2 || ''].join('');
    const text = shown ? full : full.slice(0, charIdx);
    return (
      <div>
        {line.p && <span className="mg">{line.p}</span>}
        {line.c && <span className={line.m ? 'mc' : 'ms'}>{line.c}</span>}
        {line.b && <span className="mb">{line.b}</span>}
        {line.m && <span style={{ color: line.dim ? 'var(--text-dim)' : 'var(--text-muted)' }}>{line.m}</span>}
        {text.slice(line.p.length + line.c.length + (line.b || line.m || '').length)}
        {line.dim2 && <span style={{ color: 'var(--text-dim)' }}> {line.dim2}</span>}
      </div>
    );
  };

  return (
    <div className="mockup-body">
      {TYPED_LINES.slice(0, lineIdx).map((line, i) => (
        <div key={i} style={{ opacity: lineIdx > i + 2 ? 0.55 : 1 }}>
          {line.p && <span className="mg">{line.p}</span>}
          {line.c && <span className={line.m ? 'mc' : 'ms'}>{line.c}</span>}
          {line.b && <span className="mb">{line.b}</span>}
          {line.m && <span style={{ color: line.dim ? 'var(--text-dim)' : 'var(--text-muted)' }}>{line.m}</span>}
          {line.dim2 && <span style={{ color: 'var(--text-dim)' }}> {line.dim2}</span>}
        </div>
      ))}
      {lineIdx < TYPED_LINES.length && (
        <div>
          {(() => {
            const line = TYPED_LINES[lineIdx];
            const full = [line.p, line.c, line.b || line.m || '', line.dim2 || ''].join('');
            const shown = full.slice(0, charIdx);
            let consumed = 0;
            const parts = [];
            const seg = (text, cls, extraStyle) => {
              if (!text) return;
              const remain = shown.slice(consumed, consumed + text.length);
              consumed += text.length;
              if (remain) parts.push(<span key={parts.length} className={cls} style={extraStyle}>{remain}</span>);
            };
            seg(line.p, 'mg');
            seg(line.c, line.m ? 'mc' : 'ms');
            seg(line.b, 'mb');
            seg(line.m, '', { color: line.dim ? 'var(--text-dim)' : 'var(--text-muted)' });
            seg(line.dim2, '', { color: 'var(--text-dim)' });
            return parts;
          })()}
          <span className="typed-cursor">▋</span>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="dev-landing">
      <div className="landing-glow landing-glow--1" />
      <div className="landing-glow landing-glow--2" />

      <div className="dev-container">

        {/* ─── HERO ─── */}
        <section className="hero-section">
          <div className="hero-split">
            <div className="hero-left">
              <div className="hero-badge">
                <span className="hero-badge-dot"/>
                <span className="hero-badge-text">NEW · Claude Sonnet 5 + GLM 5.2</span>
              </div>
              <h1 className="claude-hero-title">
                Pisz pluginy<br/>
                do Minecrafta<br/>
                <span className="hero-accent">bez kodu.</span>
              </h1>
              <p className="claude-hero-subtitle">
                Opisujesz pomysł — Zenexcode generuje kod Java i kompiluje gotowy{' '}
                <code style={{fontFamily:'var(--mono)',color:'var(--accent)',fontSize:'0.9em'}}>.jar</code>.
                Bez Maven, bez JDK, bez znajomości Javy.
              </p>
              <div className="claude-btn-group">
                <Link to="/dashboard" className="claude-btn-primary">
                  Otwórz środowisko <ArrowRight size={14}/>
                </Link>
                <a href="#cennik" className="claude-btn-secondary">Zobacz cennik</a>
              </div>

              <div className="hero-mini-stats">
                <div className="hero-mini-stat">
                  <span className="hero-mini-val">12K+</span>
                  <span className="hero-mini-lbl">pluginów</span>
                </div>
                <div className="hero-mini-sep"/>
                <div className="hero-mini-stat">
                  <span className="hero-mini-val">8s</span>
                  <span className="hero-mini-lbl">średni build</span>
                </div>
                <div className="hero-mini-sep"/>
                <div className="hero-mini-stat">
                  <span className="hero-mini-val">6</span>
                  <span className="hero-mini-lbl">silników</span>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-mockup">
                <div className="mockup-bar">
                  <div className="mockup-dot" style={{background:'#FF5F57'}}/>
                  <div className="mockup-dot" style={{background:'#FFBD2E'}}/>
                  <div className="mockup-dot" style={{background:'#28C840'}}/>
                  <span className="mockup-title">zenexcode — terminal</span>
                </div>
                <TypedTerminal />
              </div>
            </div>
          </div>
        </section>

        {/* ─── LOGO MARQUEE / TRUST ─── */}
        <section className="trust-section">
          <div className="trust-label">Wspierane silniki</div>
          <div className="trust-row">
            {['Paper','Spigot','Purpur','Folia','Fabric','Forge','Velocity','BungeeCord'].map(s => (
              <span key={s} className="trust-chip">{s}</span>
            ))}
          </div>
        </section>

        {/* ─── FEATURES (cards grid) ─── */}
        <section id="funkcje">
          <div className="section-head">
            <div className="section-label">Możliwości</div>
            <h2 className="claude-section-title">Wszystko czego potrzebujesz</h2>
          </div>
          <div className="features-grid">
            {[
              {icon:<Cpu size={18}/>, title:'Kompilator w chmurze', text:'Klikasz jeden przycisk. Serwer buduje JAR w kilka sekund — bez narzędzi lokalnie.'},
              {icon:<Zap size={18}/>, title:'Auto-naprawa błędów', text:'Wklej błąd z konsoli serwera — AI diagnozuje i naprawia kod automatycznie.'},
              {icon:<Code2 size={18}/>, title:'Wielosilnikowość', text:'Paper, Purpur, Spigot, Folia, Fabric, Forge — wszystkie popularne silniki.'},
              {icon:<Sparkles size={18}/>, title:'Najlepsze modele AI', text:'Claude Sonnet 5, Opus 4, GLM 5.2 — jeden portfel, dostęp do wszystkich.'},
              {icon:<Shield size={18}/>, title:'Bezpieczny kod', text:'Generowane pluginy są skanowane pod kątem podatności i złych praktyk.'},
              {icon:<Package size={18}/>, title:'Eksport do ZIP', text:'Pobierz cały projekt jako ZIP z kodem, plugin.yml i skompilowanym JAR.'},
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i*60}ms` }}>
                <div className="feature-card-icon">{f.icon}</div>
                <div className="claude-feature-title">{f.title}</div>
                <div className="claude-feature-text">{f.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="how-section" id="jak-dziala">
          <div className="section-head">
            <div className="section-label">Jak to działa</div>
            <h2 className="claude-section-title">Trzy kroki do gotowego pluginu</h2>
            <p className="claude-section-subtitle">Bez konfiguracji środowiska, bez znajomości Javy.</p>
          </div>
          <div className="how-steps-grid">
            {[
              {n:'01', title:'Opisz pomysł', text:'Napisz w kilku zdaniach co ma robić plugin. Wybierz silnik i wersję Minecrafta.'},
              {n:'02', title:'AI generuje kod', text:'Model analizuje zapytanie, projektuje architekturę klas i pisze czysty kod Java.'},
              {n:'03', title:'Pobierz JAR', text:'Serwer kompiluje .jar — pobierasz plik gotowy do wgrania na serwer.'},
            ].map((s, i) => (
              <div key={s.n} className="how-step-card" style={{ animationDelay: `${i*100}ms` }}>
                <div className="how-step-num">{s.n}</div>
                <div className="how-step-title">{s.title}</div>
                <p className="how-step-text">{s.text}</p>
                {i < 2 && <ArrowRight size={16} className="how-step-arrow" />}
              </div>
            ))}
          </div>
        </section>

        {/* ─── MODELS ─── */}
        <section className="claude-info-section" id="modele">
          <div className="section-head">
            <div className="section-label">Modele AI</div>
            <h2 className="claude-section-title">Dostępne modele</h2>
            <p className="claude-section-subtitle">Jeden portfel kredytów, dostęp do najlepszych modeli.</p>
          </div>
          <div className="models-grid">
            {[
              {name:'Claude Sonnet 5', tag:'Nowość', speed:'Bardzo wysoka', logic:'Najwyższa', color:'#FF6B00'},
              {name:'Claude Opus 4.8', tag:'Najlepszy', speed:'Średnia', logic:'Najwyższa', color:'#F59E0B'},
              {name:'GLM 5.2', tag:'Darmowy', speed:'Wysoka', logic:'Wysoka', color:'#22C55E'},
            ].map(m => (
              <div key={m.name} className="model-card">
                <div className="model-card-head">
                  <span className="model-dot" style={{background:m.color}}/>
                  <strong>{m.name}</strong>
                  <span className="model-tag" style={{color:m.color, borderColor:m.color}}>{m.tag}</span>
                </div>
                <div className="model-card-rows">
                  <div className="model-row"><span>Szybkość</span><span>{m.speed}</span></div>
                  <div className="model-row"><span>Logika</span><span>{m.logic}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section className="cta-banner">
          <div className="cta-content">
            <h2 className="cta-title">Gotowy, żeby stworzyć<br/>swój pierwszy plugin?</h2>
            <p className="cta-sub">Dołącz do tysięcy twórców. Zacznij za darmo — $10 kredytów na start.</p>
            <Link to="/dashboard" className="cta-btn">
              Zaczynaj <ArrowRight size={16}/>
            </Link>
          </div>
          <div className="cta-glow"/>
        </section>

        {/* ─── PRICING ─── */}
        <section className="claude-pricing-section" id="cennik">
          <div className="section-head" style={{marginBottom:'2rem'}}>
            <div className="section-label">Cennik</div>
            <h2 className="claude-section-title">Proste ceny</h2>
            <p className="claude-section-subtitle">Bez subskrypcji. Kupujesz jednorazowy pakiet ważny miesiąc.</p>
          </div>
          <Pricing />
        </section>

      </div>

      {/* ─── FOOTER ─── */}
      <footer className="claude-footer">
        <div className="claude-footer-grid">
          <div>
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/zenexcode.png" alt="Zenexcode" style={{ height: '20px', objectFit: 'contain' }} />
            </div>
            <p className="footer-desc">Twórz pluginy Minecraft bez pisania kodu. Inteligentny kompilator AI.</p>
            <div className="footer-socials">
              <a href="https://discord.gg/JQbqybWQph" target="_blank" rel="noopener noreferrer" className="social-icon" title="Discord">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="footer-title">Produkt</h4>
            <a href="#funkcje" className="footer-link">Możliwości</a>
            <a href="#cennik" className="footer-link">Cennik</a>
            <a href="#modele" className="footer-link">Modele</a>
            <a href="#jak-dziala" className="footer-link">Jak działa</a>
          </div>
          <div>
            <h4 className="footer-title">Prawne</h4>
            <Link to="/regulamin" className="footer-link">Regulamin</Link>
            <Link to="/polityka-prywatnosci" className="footer-link">Polityka prywatności</Link>
            <Link to="/warunki" className="footer-link">Warunki korzystania</Link>
          </div>
        </div>
        <div className="claude-footer-bottom">
          <span>© 2026 Zenexcode</span>
          <span>Zaprojektowane w Zenexcode</span>
        </div>
      </footer>

      <CookieBanner/>
    </div>
  );
}
