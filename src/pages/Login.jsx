import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Terminal, Lock, Mail, User } from 'lucide-react';
import { useLang } from '../LangContext';
import './Login.css';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
const TURNSTILE_ENABLED = !!TURNSTILE_SITE_KEY;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const L = t.login;

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.turnstile) return;
      if (turnstileRef.current && turnstileRef.current.childElementCount === 0) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
          theme: 'dark',
        });
      }
    };

    if (window.turnstile) render();
    else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
      script.async = true;
      script.defer = true;
      window.onTurnstileLoad = render;
      document.body.appendChild(script);
    }

    return () => { cancelled = true; };
  }, [isRegistering]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(lang === 'en' ? 'Error: All fields are required.' : 'Błąd: Wszystkie pola są wymagane.');
      return;
    }

    if (password.length < 6) {
      setError(lang === 'en' ? 'Error: Password must be at least 6 characters.' : 'Błąd: Hasło musi mieć co najmniej 6 znaków.');
      return;
    }

    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError(lang === 'en' ? 'Error: Please confirm you are not a robot.' : 'Błąd: Potwierdź, że nie jesteś robotem (Cloudflare Turnstile).');
      return;
    }

    try {
      if (isRegistering) {
        if (!username.trim()) {
          setError(lang === 'en' ? 'Error: Username is required for registration.' : 'Błąd: Nick jest wymagany do rejestracji.');
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              turnstile_token: turnstileToken,
            }
          }
        });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(`${lang === 'en' ? 'API Error' : 'Błąd API'}: ${err.message}`);
      if (TURNSTILE_ENABLED && window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
        setTurnstileToken('');
      }
    }
  };

  return (
    <div className="login-layout">
      <div className="noise-bg"></div>
      <div className="login-box">
        <div className="login-header">
          <div className="brand-badge">
            <Terminal size={14} className="text-brick" />
            <span>zenexcode_auth v1.0.0</span>
          </div>
          <span className="brick-dot"></span>
        </div>

        <div className="login-body">
          <h2 className="login-title">
            {isRegistering ? (lang === 'en' ? 'CREATE ACCOUNT //' : 'UTWÓRZ KONTO //') : (lang === 'en' ? 'LOG IN //' : 'ZALOGUJ SIĘ //')}
          </h2>
          <p className="login-subtitle">
            {lang === 'en' ? 'Access to the compilation environment requires authorisation.' : 'Dostęp do środowiska kompilacji wymaga autoryzacji.'}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error-box">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="form-group">
                <label>{lang === 'en' ? 'USERNAME:' : 'NICK:'}</label>
                <div className="input-wrapper">
                  <User size={14} className="input-icon" />
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'Your username (e.g. Blazkoj)' : 'Twój nick (np. Blazkoj)'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>{lang === 'en' ? 'EMAIL:' : 'EMAIL:'}</label>
              <div className="input-wrapper">
                <Mail size={14} className="input-icon" />
                <input
                  type="email"
                  placeholder={L.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{lang === 'en' ? 'PASSWORD:' : 'HASŁO:'}</label>
              <div className="input-wrapper">
                <Lock size={14} className="input-icon" />
                <input
                  type="password"
                  placeholder={L.passPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>

            {TURNSTILE_ENABLED && (
              <div className="form-group">
                <div ref={turnstileRef} className="turnstile-widget" style={{ minHeight: '65px' }}></div>
              </div>
            )}

            <button type="submit" className="login-btn-submit" disabled={TURNSTILE_ENABLED && !turnstileToken}>
              {isRegistering ? (lang === 'en' ? 'REGISTER ↗' : 'ZAREJESTRUJ ↗') : (lang === 'en' ? 'LOG IN ↗' : 'ZALOGUJ ↗')}
            </button>
          </form>

          <div className="login-footer-toggle">
            {isRegistering ? (
              <span>{lang === 'en' ? 'Already have an account?' : 'Masz już konto?'} <button onClick={() => setIsRegistering(false)} className="toggle-mode-btn">{lang === 'en' ? 'Log in' : 'Zaloguj się'}</button></span>
            ) : (
              <span>{lang === 'en' ? "Don't have an account?" : 'Nie masz konta?'} <button onClick={() => setIsRegistering(true)} className="toggle-mode-btn">{lang === 'en' ? 'Sign up' : 'Zarejestruj się'}</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
