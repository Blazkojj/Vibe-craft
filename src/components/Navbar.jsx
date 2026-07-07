import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layers, LogOut } from 'lucide-react';
import { supabase } from '../supabase';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

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
    if (!session) {
      navigate('/login');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const hasDiscord = user?.identities?.some(id => id.provider === 'discord') || !!user?.user_metadata?.discord_profile;
    if (!hasDiscord) {
      alert('Aby korzystać z darmowego planu, musisz podpiąć Discorda!');
      navigate('/ustawienia');
      return;
    }
    window.location.href = 'https://free.zenexcode.pl/dashboard';
  };

  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/project')) {
    return null;
  }

  const isLoggedIn = !!session;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/zenexcode.png" alt="Zenexcode" style={{ height: '32px', objectFit: 'contain' }} />
        </Link>

        <div className="navbar-links">
          <a href="/#funkcje">Funkcje</a>
          <a href="/#cennik">Cennik</a>
          <a href="/#modele">Modele</a>
          <Link to="/dokumentacja">Dokumentacja</Link>
          {isLoggedIn && (
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
          )}
        </div>
        <div className="navbar-actions">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn-logout">
              Wyloguj <LogOut size={13} />
            </button>
          ) : (
            <Link to="/login" className="btn-start" style={{ background: '#1c1c1c', border: '1px solid #333' }}>Logowanie</Link>
          )}
          <button onClick={handleFreeStart} className="btn-start">Zacznij za darmo →</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
