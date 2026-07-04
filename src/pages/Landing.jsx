import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Pricing from './Pricing';
import './Landing.css';

function Landing() {
  const [tokens, setTokens] = useState(0);

  useEffect(() => {
    // Only one characteristic micro-interaction: counting numbers
    const interval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 50) + 10);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dev-landing">
      {/* BACKGROUND TEXTURE */}
      <div className="noise-bg"></div>

      <div className="dev-container">
        {/* HERO */}
        <section className="dev-hero">
          <div className="dev-hero-left">
            <h1 className="dev-title">
              PISZ PLUGINY.<br />
              <span className="text-brick">BEZ PISANIA.</span>
            </h1>
            <p className="dev-copy">
              Koniec z szukaniem na forach, jak obsłużyć pakiety w PaperMC. 
              Mówisz, co ma robić serwer, a maszyna wypluwa gotowy, skompilowany plik .jar. Bez bullshitu.
            </p>
            <div className="dev-hero-actions">
              <Link to="/dashboard" className="dev-btn dev-btn-primary">
                Otwórz terminal ↗
              </Link>
              <a href="#cennik" className="dev-btn dev-btn-ghost">
                Ile to kosztuje?
              </a>
            </div>
            
            <div className="dev-integrations">
              <span className="dev-label">Wspierane silniki //</span>
              <span className="dev-tag">Paper</span>
              <span className="dev-tag">Spigot</span>
              <span className="dev-tag">Purpur</span>
            </div>
          </div>
          
          <div className="dev-hero-right">
            <div className="raw-code-box">
              <div className="raw-code-header">
                <span>[system: live_activity]</span>
                <span className="brick-dot"></span>
              </div>
              <pre className="raw-code-content">
{`> Inicjalizacja...
> Wczytano kontekst (14ms)
> Generowanie klasy Main.java
> Znaleziono problem z API wersji.
> [AUTO-FIX] Nadpisywanie wersji na 1.21.4
> Kompilacja Maven...
> Zbudowano: plugin-1.1.jar
> 
> Zużycie tokenów sesji: ${tokens.toLocaleString()}`}
              </pre>
            </div>
          </div>
        </section>

        {/* PROOF / NUMBERS */}
        <section className="dev-proof">
          <div className="proof-text">
            <h2>Liczby nie kłamią.</h2>
            <p>Dlaczego ręczne pisanie boilerplate'u nie ma już sensu.</p>
          </div>
          <div className="proof-stats">
            <div className="stat-block">
              <div className="stat-num">98%</div>
              <div className="stat-desc">mniej czasu spędzonego na setupie pom.xml.</div>
            </div>
            <div className="stat-block">
              <div className="stat-num">0</div>
              <div className="stat-desc">błędów NullPointer dzięki wbudowanemu Auto-Fix.</div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="dev-steps">
          <h2 className="section-title">Jak to działa w praktyce?</h2>
          
          <div className="step-row">
            <div className="step-num">01</div>
            <div className="step-content">
              <h3>Definiujesz cel</h3>
              <p>Opisujesz mechanikę po ludzku. "Chcę komendę /vip która daje latanie na 5 minut".</p>
            </div>
          </div>
          
          <div className="step-row">
            <div className="step-num">02</div>
            <div className="step-content">
              <h3>Agent buduje architekturę</h3>
              <p>System dobiera klasy, dziedziczenie i event listenery zgodnie ze standardami Spigot API.</p>
            </div>
          </div>
          
          <div className="step-row">
            <div className="step-num">03</div>
            <div className="step-content">
              <h3>Pobierasz .jar</h3>
              <p>Jedno kliknięcie, nasz chmurowy Maven kompiluje wszystko. Jeśli jest błąd? Sam go naprawia w locie.</p>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="dev-comparison">
          <h2 className="section-title">My vs Klasyczne klepanie kodu</h2>
          <div className="comp-table-wrapper">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Cecha</th>
                  <th>Klasyczny dev</th>
                  <th className="highlight-col">VibeCraft AI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Setup projektu</td>
                  <td>30 min (Maven/Gradle)</td>
                  <td className="highlight-col">2 sekundy</td>
                </tr>
                <tr>
                  <td>Czytanie dokumentacji API</td>
                  <td>Boli głowa</td>
                  <td className="highlight-col">Zrobione za Ciebie</td>
                </tr>
                <tr>
                  <td>Błędy w konsoli serwera</td>
                  <td>StackOverflow i płacz</td>
                  <td className="highlight-col">Przycisk "Auto-Fix"</td>
                </tr>
                <tr>
                  <td>Szybkość iteracji</td>
                  <td>Godziny</td>
                  <td className="highlight-col">Minuty</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* PRICING */}
        <section className="dev-pricing" id="cennik">
          <Pricing />
        </section>

        {/* FOOTER */}
        <footer className="dev-footer">
          <div className="footer-left">
            <h3>VIBECRAFT.</h3>
            <p>Przestań pisać boilerplate. Zacznij tworzyć serwery.</p>
          </div>
          <div className="footer-right">
            <Link to="/dashboard" className="dev-btn dev-btn-primary">Otwórz środowisko</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Landing;
