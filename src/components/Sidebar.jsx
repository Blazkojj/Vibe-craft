import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Plus, Menu, Search, FileCode2, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '../supabase';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setProjects(data);
      }
    };
    fetchProjects();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="claude-sidebar" style={{ width: isCollapsed ? '64px' : '260px' }}>
      <div className="sidebar-header" style={{ padding: isCollapsed ? '16px 0' : '16px 20px', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
        {!isCollapsed && <Link to="/" className="sidebar-logo">Zenexcode</Link>}
        <div className="sidebar-header-icons">
          {!isCollapsed && (
            <button className="sidebar-icon-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search size={16} />
            </button>
          )}
          <button className="sidebar-icon-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            <Menu size={16} />
          </button>
        </div>
      </div>

      {!isCollapsed && isSearchOpen && (
        <div className="sidebar-search-box">
          <input 
            type="text" 
            placeholder="Szukaj projektu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className="sidebar-new-chat">
        <Link to="/dashboard" className="new-chat-btn">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
            <Plus size={16} /> {!isCollapsed && "Nowy projekt"}
          </span>
        </Link>
      </div>

      <div className="sidebar-nav">
        <Link to="/dashboard" className={`sidebar-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} title="Dashboard">
          <MessageSquare size={16} /> {!isCollapsed && "Dashboard"}
        </Link>
        <Link to="/ustawienia" className={`sidebar-nav-item ${location.pathname === '/ustawienia' ? 'active' : ''}`} title="Ustawienia & Portfel">
          <SettingsIcon size={16} /> {!isCollapsed && "Ustawienia & Portfel"}
        </Link>
      </div>

      <div className="sidebar-recents" style={{ display: isCollapsed ? 'none' : 'block' }}>
        <div className="recents-title">Ostatnie</div>
        <div className="recents-list">
          {projects
            .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(p => (
              <Link 
                key={p.id} 
                to={`/project/${p.id}`} 
                className={`recent-item ${location.pathname === `/project/${p.id}` ? 'active' : ''}`}
              >
                {p.title}
              </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="user-profile-btn" onClick={handleLogout} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }} title="Wyloguj">
          {user?.user_metadata?.discord_profile?.avatar ? (
            <img src={user.user_metadata.discord_profile.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div className="user-avatar">{user?.email ? user.email[0].toUpperCase() : 'B'}</div>
          )}
          {!isCollapsed && <span className="user-name">{user?.user_metadata?.discord_profile?.global_name || user?.user_metadata?.discord_profile?.username || user?.user_metadata?.username || 'Wyloguj (Konto)'}</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
