import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Globe } from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../LangContext';
import { languageNames } from '../i18n';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, switchLang, t } = useLang();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleFreeStart = async () => {
    if (!session) { navigate('/login'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const hasDiscord = user?.identities?.some(id => id.provider === 'discord') || !!user?.user_metadata?.discord_profile;
    if (!hasDiscord) {
      alert(lang === 'pl' ? 'Aby korzystać z darmowego planu, musisz podpiąć Discorda!' : 'To use the free plan you need to connect your Discord account!');
      navigate('/ustawienia');
      return;
    }
    window.location.href = 'https://free.zenexcode.pl/dashboard';
  };

  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/project')) return null;

  const isLoggedIn = !!session;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/zenexcode.png" alt="Zenexcode" style={{ height: '32px', objectFit: 'contain' }} />
        </Link>

        <div className="navbar-links">
          <a href="/#funkcje">{t.nav.features}</a>
          <a href="/#cennik">{t.nav.pricing}</a>
          <a href="/#modele">{t.nav.models}</a>
          <Link to="/dokumentacja">{t.nav.docs}</Link>
          {isLoggedIn && (
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>{t.nav.dashboard}</Link>
          )}
        </div>

        <div className="navbar-actions">
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen(o => !o)}
              style={{ background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
            >
              <Globe size={13} />
              {lang.toUpperCase()}
            </button>
            {langOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', minWidth: '120px', zIndex: 999, overflow: 'hidden' }}>
                {Object.entries(languageNames).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => { switchLang(code); setLangOpen(false); }}
                    style={{ display: 'block', width: '100%', padding: '0.6rem 1rem', background: lang === code ? 'var(--bg-hover)' : 'transparent', border: 'none', color: lang === code ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn-logout">
              {t.nav.logout} <LogOut size={13} />
            </button>
          ) : (
            <Link to="/login" className="btn-start" style={{ background: '#1c1c1c', border: '1px solid #333' }}>{t.nav.login}</Link>
          )}
          <button onClick={handleFreeStart} className="btn-start">{t.nav.startFree}</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
