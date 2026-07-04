import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Terminal, Lock, Mail, User } from 'lucide-react';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Błąd: Wszystkie pola są wymagane.');
      return;
    }

    if (password.length < 6) {
      setError('Błąd: Hasło musi mieć co najmniej 6 znaków.');
      return;
    }

    try {
      if (isRegistering) {
        if (!username.trim()) {
          setError('Błąd: Nick jest wymagany do rejestracji.');
          return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
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
      
      localStorage.setItem('vibecraft_logged_in', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError(`Błąd API: ${err.message}`);
    }
  };

  return (
    <div className="login-layout">
      <div className="noise-bg"></div>
      <div className="login-box">
        <div className="login-header">
          <div className="brand-badge">
            <Terminal size={14} className="text-brick" />
            <span>vibecraft_auth v1.0.0</span>
          </div>
          <span className="brick-dot"></span>
        </div>

        <div className="login-body">
          <h2 className="login-title">
            {isRegistering ? 'UTWÓRZ KONTO //' : 'ZALOGUJ SIĘ //'}
          </h2>
          <p className="login-subtitle">
            Dostęp do środowiska kompilacji wymaga autoryzacji.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error-box">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="form-group">
                <label>NICK:</label>
                <div className="input-wrapper">
                  <User size={14} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Twój nick (np. Blazkoj)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>EMAIL:</label>
              <div className="input-wrapper">
                <Mail size={14} className="input-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>HASŁO:</label>
              <div className="input-wrapper">
                <Lock size={14} className="input-icon" />
                <input
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                />
              </div>
            </div>

            <button type="submit" className="login-btn-submit">
              {isRegistering ? 'ZAREJESTRUJ ↗' : 'ZALOGUJ ↗'}
            </button>
          </form>

          <div className="login-footer-toggle">
            {isRegistering ? (
              <span>Masz już konto? <button onClick={() => setIsRegistering(false)} className="toggle-mode-btn">Zaloguj się</button></span>
            ) : (
              <span>Nie masz konta? <button onClick={() => setIsRegistering(true)} className="toggle-mode-btn">Zarejestruj się</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
