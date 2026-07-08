import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Code2, Cpu, Bot, CheckCircle2, Terminal } from 'lucide-react';
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
        <Link to="/polityka-prywatnosci" style={{ color: 'var(--accent)', marginLeft: 6 }}>{t.landing.cookieMore}</Link>
      </span>
      <button className="claude-cookie-btn" onClick={() => { localStorage.setItem('cookiesAccepted', 'true'); setVisible(false); }}>
        {t.landing.cookieOk}
      </button>
    </div>
  );
}

const TYPED_LINES = [
  { p: '$ ', c: 'vibe-craft generate ', b: '"EconomyPlugin z shopem i aukcjami"' },
  { p: '', c: '[VC] ', m: 'Analizuję prompt...', dim: true },
  { p: '', c: '', m: 'Generuję architekturę Paper 1.21.4...', dim: true },
  { p: '+ ', c: 'EconomyManager.java', g: true },
  { p: '+ ', c: 'ShopCommand.java', g: true },
  { p: '+ ', c: 'plugin.yml', g: true },
  { p: '', c: '[Build] ', m: 'Kompiluję JAR...', dim: true },
  { p: '✓ ', c: 'EconomyPlugin.jar', g: true, dim2: '(41 KB)' },
];

function TerminalSim({ lines }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= lines.length) {
      const reset = setTimeout(() => { setLineIdx(0); setCharIdx(0); }, 4000);
      return () => clearTimeout(reset);
    }
    const line = lines[lineIdx];
    const fullText = [line.p, line.c, line.b || line.m || '', line.dim2 || ''].join('');
    if (charIdx >= fullText.length) {
      const next = setTimeout(() => { setLineIdx(i => i + 1); setCharIdx(0); }, 280);
      return () => clearTimeout(next);
    }
    const tick = setTimeout(() => setCharIdx(c => c + 1), 28);
    return () => clearTimeout(tick);
  }, [lineIdx, charIdx, lines]);

  return (
    <div className="mockup-terminal">
      {lines.slice(0, lineIdx).map((line, i) => (
        <div key={i} style={{ opacity: lineIdx > i + 2 ? 0.55 : 1, lineHeight: 1.6 }}>
          {line.p && <span style={{ color: '#FF6B00' }}>{line.p}</span>}
          {line.c && <span style={{ color: line.m ? '#FF6B00' : '#fff' }}>{line.c}</span>}
          {line.b && <span style={{ color: '#F59E0B' }}>{line.b}</span>}
          {line.m && <span style={{ color: line.dim ? '#64748B' : '#94A3B8' }}>{line.m}</span>}
          {line.dim2 && <span style={{ color: '#64748B' }}> {line.dim2}</span>}
        </div>
      ))}
      {lineIdx < lines.length && (
        <div style={{ lineHeight: 1.6 }}>
          {(() => {
            const line = lines[lineIdx];
            const full = [line.p, line.c, line.b || line.m || '', line.dim2 || ''].join('');
            const shown = full.slice(0, charIdx);
            let consumed = 0;
            const parts = [];
            const seg = (text, extraStyle) => {
              if (!text) return;
              const remain = shown.slice(consumed, consumed + text.length);
              consumed += text.length;
              if (remain) parts.push(<span key={parts.length} style={extraStyle}>{remain}</span>);
            };
            seg(line.p, { color: '#FF6B00' });
            seg(line.c, { color: line.m ? '#FF6B00' : '#fff' });
            seg(line.b, { color: '#F59E0B' });
            seg(line.m, { color: line.dim ? '#64748B' : '#94A3B8' });
            seg(line.dim2, { color: '#64748B' });
            return parts;
          })()}
          <span style={{ color: '#FF6B00', animation: 'blink 1s step-end infinite', marginLeft: 2 }}>▋</span>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const { lang, t } = useLang();
  const L = t.landing;
  const navigate = useNavigate();
  const [promptValue, setPromptValue] = useState("");

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if(promptValue.trim()) {
      localStorage.setItem('vibecraft_initial_prompt', promptValue);
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="dev-landing">
      {/* Background Orbs & Grid */}
      <div className="landing-bg" />
      <div className="landing-grid" />
      <div className="glow-orb top-left" />
      <div className="glow-orb bottom-right" />

      <div className="dev-container">

        {/* ─── HERO ─── */}
        <section className="hero-centered">
          <div className="hero-pill">
            <Sparkles size={14} /> NOWY STANDARD GENEROWANIA PLUGINÓW
          </div>
          
          <h1 className="hero-title-mega">
            Twój osobisty <br />
            <span className="text-gradient-accent">Agent Minecrafta</span>
          </h1>
          
          <p className="hero-sub-centered">
            {L.heroSub} Zapomnij o ręcznym pisaniu bojlerplate'u.
            VibeCraft wygeneruje dla Ciebie gotowy plik .jar na silniki Spigot i Paper.
          </p>

          <form className="hero-prompt-bar" onSubmit={handlePromptSubmit}>
            <div className="prompt-icon"><Terminal size={20} /></div>
            <input 
              type="text" 
              className="prompt-text" 
              placeholder={lang === 'en' ? "e.g. Build an economy plugin with MySQL support..." : "np. Zbuduj plugin na ekonomię z obsługą MySQL..."}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
            />
            <button type="submit" className="prompt-btn">
              {L.openEnv} <ArrowRight size={16} />
            </button>
          </form>

          <div className="brands-row">
            <span className="brand-name">PAPERMC</span>
            <span className="brand-name">SPIGOT</span>
            <span className="brand-name">PURPUR</span>
            <span className="brand-name">FOLIA</span>
            <span className="brand-name">BUNGEECORD</span>
            <span className="brand-name">WATERFALL</span>
          </div>
        </section>

        {/* ─── BENTO GRID FEATURES ─── */}
        <section id="funkcje">
          <div className="bento-grid">
            
            {/* Bento 1: Large (Code Generation) */}
            <div className="bento-card bento-large">
              <div className="bento-icon"><Code2 size={24} /></div>
              <h3 className="bento-title">Od zera do gotowego kodu</h3>
              <p className="bento-desc">
                Zintegrowany proces myślowy z wykorzystaniem LLM gwarantuje jakość kodu. Nie tworzymy skrawków — otrzymujesz kompletne pakiety, gotowe do implementacji na produkcji z uwzględnieniem baz danych.
              </p>
              <div className="bento-visual">
                <TerminalSim lines={TYPED_LINES} />
              </div>
            </div>

            {/* Bento 2: Square (Performance) */}
            <div className="bento-card bento-square">
              <div className="bento-icon"><Zap size={24} /></div>
              <h3 className="bento-title">Optymalizacja</h3>
              <p className="bento-desc">
                Generowany kod wykorzystuje najnowsze API (Adventure, PDC, asynchroniczność), unikając przestarzałych metod powodujących lagi serwera.
              </p>
            </div>

            {/* Bento 3: Square (AI Models) */}
            <div className="bento-card bento-square">
              <div className="bento-icon"><Bot size={24} /></div>
              <h3 className="bento-title">Wielomodelowość</h3>
              <p className="bento-desc">
                Korzystaj z potęgi najnowszych modeli takich jak Claude 3.5 Sonnet, Gemini 1.5 Pro oraz Llama 3. Idealne dopasowanie pod złożone zadania.
              </p>
            </div>

            {/* Bento 4: Wide (Live Compiler) */}
            <div className="bento-card bento-wide">
              <div className="bento-icon"><Cpu size={24} /></div>
              <h3 className="bento-title">Cloud Compiler .jar</h3>
              <p className="bento-desc">
                Nasze autorskie środowisko pozwoli Ci na kompilację projektu z Maven'em bez konieczności instalowania Javy na Twoim komputerze.
                Wynikowy plik <code>.jar</code> pobierasz od razu po generacji.
              </p>
              <div className="bento-visual" style={{ background: 'transparent', border: 'none', justifyContent: 'flex-start', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <CheckCircle2 size={20} color="#FF6B00" /> <span style={{ color: '#fff', fontWeight: 500 }}>Maven/Gradle</span>
                <CheckCircle2 size={20} color="#FF6B00" /> <span style={{ color: '#fff', fontWeight: 500 }}>Brak błędów dependencies</span>
                <CheckCircle2 size={20} color="#FF6B00" /> <span style={{ color: '#fff', fontWeight: 500 }}>Gotowy JAR w 5 sekund</span>
              </div>
            </div>

          </div>
        </section>

        {/* ─── PRICING ─── */}
        <section id="cennik" className="claude-pricing-section">
          <Pricing inLanding={true} />
        </section>

        {/* ─── NEW CTA BANNER ─── */}
        <section className="new-cta-banner">
          <h2 className="new-cta-title">Zbuduj swój wymarzony plugin dzisiaj</h2>
          <p className="new-cta-desc">Dołącz do deweloperów korzystających z AI przy tworzeniu sieci Minecraftowych. Załóż darmowe konto w 5 sekund.</p>
          <Link to="/dashboard" className="prompt-btn" style={{ display: 'inline-flex', width: 'auto', padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Rozpocznij tworzenie <ArrowRight size={18} />
          </Link>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="claude-footer" style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 0 0', marginTop: '4rem' }}>
          <div className="claude-footer-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
            <span>© 2026 VibeCraft. Wszelkie prawa zastrzeżone. Projekt autorstwa Zenex.</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/polityka-prywatnosci" className="footer-link">Polityka Prywatności</Link>
              <Link to="/regulamin" className="footer-link">Regulamin</Link>
            </div>
          </div>
        </footer>

      </div>
      <CookieBanner />
    </div>
  );
}
