import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, LogOut } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('vibecraft_logged_in') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('vibecraft_logged_in');
    localStorage.removeItem('vibecraft_user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-wrapper" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <img src="/logo.png" alt="VibeCraft Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <span className="brand-text">VibeCraft<span className="text-accent">AI</span></span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Platforma</Link>
          {isLoggedIn && (
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
          )}
        </div>
        <div className="navbar-actions">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn-logout">
              Wyloguj <LogOut size={13} style={{ marginLeft: '4px' }} />
            </button>
          ) : (
            <Link to="/login" className="btn-start">Rozpocznij ↗</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
