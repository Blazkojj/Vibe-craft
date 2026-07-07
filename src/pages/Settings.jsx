import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowLeft, User, Lock, Trash2, CreditCard, Zap, RefreshCw, Check, Loader2 } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('konto');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [balance, setBalance] = useState('10.00');
  const [usedCredits, setUsedCredits] = useState('0.00');
  const [usedTokens, setUsedTokens] = useState('0');
  const [planName, setPlanName] = useState('Free');
  const [discordConnecting, setDiscordConnecting] = useState(false);
  const [discordProfile, setDiscordProfile] = useState(null);
  const [discordLoading, setDiscordLoading] = useState(false);
  const handledRedirect = useRef(false);

  const flash = (text, type = 'info') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => { setMsg(''); setMsgType('info'); }, 4000);
  };

  // ─── Discord OAuth redirect handler ───
  const handleDiscordRedirect = async () => {
    if (handledRedirect.current) return;
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;

    handledRedirect.current = true;
    setDiscordLoading(true);

    try {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (!accessToken) throw new Error('No access_token found');

      const res = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('discord fetch failed');
      const d = await res.json();
      const avatar = d.avatar
        ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png?size=128`
        : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(d.id) >> 22) % 6}.png`;
      const profile = {
        id: d.id,
        username: d.username,
        global_name: d.global_name || d.username,
        avatar,
      };
      
      await supabase.auth.updateUser({ data: { discord_profile: profile } });
      setDiscordProfile(profile);
      setUser(prev => prev ? ({ ...prev, user_metadata: { ...prev.user_metadata, discord_profile: profile } }) : prev);
      flash('Konto Discord zostało połączone pomyślnie!', 'success');
    } catch (e) {
      console.error('Discord profile fetch failed:', e);
      flash('Błąd podczas pobierania profilu Discord.', 'error');
    } finally {
      setDiscordLoading(false);
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        setBalance(u.user_metadata?.balance || '10.00');
        setUsedCredits(u.user_metadata?.used_credits || '0.00');
        setUsedTokens(u.user_metadata?.used_tokens_uncached || u.user_metadata?.used_tokens || '0');
        setPlanName(u.user_metadata?.plan || 'Free');
        setDiscordProfile(u.user_metadata?.discord_profile || null);
      }
    });
    handleDiscordRedirect();
  }, []);

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      flash('Hasło musi mieć min. 6 znaków.', 'error'); return;
    }
    setSaving(true); setSavingField('password');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false); setSavingField('');
    if (error) flash(`Błąd: ${error.message}`, 'error');
    else { flash('Hasło zmienione!', 'success'); setNewPassword(''); }
  };

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) { flash('Nick nie może być pusty.', 'error'); return; }
    setSaving(true); setSavingField('username');
    const { error } = await supabase.auth.updateUser({ data: { username: newUsername.trim() } });
    setSaving(false); setSavingField('');
    if (error) flash(`Błąd: ${error.message}`, 'error');
    else {
      flash('Nick zaktualizowany!', 'success');
      setUser(prev => ({ ...prev, user_metadata: { ...prev?.user_metadata, username: newUsername } }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Usunąć konto bezpowrotnie? Tracisz wszystkie projekty i środki.')) return;
    flash('Kontakt z supportem: support@zenexcode.pl — ręcznie usuwamy konta.', 'info');
  };

  const discordConnected = !!(user?.identities?.some(id => id.provider === 'discord') || discordProfile);

  const connectDiscord = async () => {
    setDiscordConnecting(true);
    const clientId = '1522979675784216679';
    const redirectUri = encodeURIComponent(window.location.origin + '/ustawienia');
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=identify`;
    window.location.href = url;
  };

  const unlinkDiscord = async () => {
    if (!window.confirm('Odłączyć konto Discord?')) return;
    try {
      const { data: identitiesData } = await supabase.auth.getUserIdentities();
      const discordIdentity = identitiesData?.identities?.find(id => id.provider === 'discord');
      
      if (discordIdentity) {
        await supabase.auth.unlinkIdentity(discordIdentity);
      }
      
      await supabase.auth.updateUser({ data: { discord_profile: null } });
      setDiscordProfile(null);
      setUser(prev => ({ 
        ...prev, 
        identities: prev.identities?.filter(id => id.provider !== 'discord'),
        user_metadata: { ...prev.user_metadata, discord_profile: null }
      }));
      flash('Konto Discord zostało odłączone.', 'success');
    } catch (e) {
      flash('Błąd odłączania: ' + e.message, 'error');
    }
  };

  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <button className="settings-back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={13}/> <span>Dashboard</span>
        </button>
        <nav className="settings-nav">
          <button className={`settings-nav-item${activeTab==='konto'?' active':''}`} onClick={() => setActiveTab('konto')}>
            <User size={14}/> <span>Konto</span>
          </button>
          <button className={`settings-nav-item${activeTab==='billing'?' active':''}`} onClick={() => setActiveTab('billing')}>
            <CreditCard size={14}/> <span>Rozliczenia</span>
          </button>
        </nav>
      </aside>

      <main className="settings-main">
        <header className="settings-header">
          <h1>{activeTab === 'konto' ? 'Ustawienia konta' : 'Rozliczenia i środki'}</h1>
          <p className="settings-email">{user?.email || '...'}</p>
        </header>

        {msg && (
          <div className={`settings-msg ${msgType}`}>{msg}</div>
        )}

        {activeTab === 'konto' && (
          <div className="settings-section-list">
            <section className="settings-card">
              <div className="settings-card-title"><User size={14}/> Zmień nick</div>
              <div className="settings-row">
                <input
                  className="settings-input"
                  type="text"
                  placeholder={user?.user_metadata?.username || 'Nowy nick...'}
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                />
                <button className="settings-btn" onClick={handleUsernameChange} disabled={saving}>
                  {savingField === 'username' ? <Loader2 size={13} className="spin"/> : 'Zapisz'}
                </button>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-title"><Lock size={14}/> Zmień hasło</div>
              <div className="settings-row">
                <input
                  className="settings-input"
                  type="password"
                  placeholder="Nowe hasło (min. 6 znaków)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button className="settings-btn" onClick={handlePasswordChange} disabled={saving}>
                  {savingField === 'password' ? <Loader2 size={13} className="spin"/> : 'Aktualizuj'}
                </button>
              </div>
            </section>

            <section className="settings-card">
              <div className="settings-card-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.369A19.79 19.79 0 0016.558 3.1a.07.07 0 00-.074.035c-.211.375-.444.864-.608 1.249a18.27 18.27 0 00-5.487 0 12.6 12.6 0 00-.617-1.25.07.07 0 00-.073-.034A19.74 19.74 0 003.677 4.369a.06.06 0 00-.03.025C.533 9.045-.32 13.58.099 18.057a.08.08 0 00.031.054 19.9 19.9 0 005.993 3.03.07.07 0 00.076-.027 14.2 14.2 0 001.226-1.994.07.07 0 00-.038-.098 13.1 13.1 0 01-1.872-.892.07.07 0 01-.007-.118c.126-.094.252-.192.372-.291a.07.07 0 01.071-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 01.072.009c.12.099.246.198.373.292a.07.07 0 01-.006.118c-.598.349-1.22.645-1.873.891a.07.07 0 00-.038.099 16 16 0 001.226 1.993.07.07 0 00.076.028 19.84 19.84 0 006.002-3.03.08.08 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 00-.03-.026zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                Integracja z Discord
              </div>
              <p className="settings-card-desc">
                Połącz konto z Discordem, aby odblokować możliwość zakupów planów oraz zyskać dostęp do ról premium na naszym serwerze!
              </p>

              {discordConnected ? (
                <div className="discord-connected">
                  <div className="discord-profile">
                    {discordLoading ? (
                      <div className="discord-avatar discord-avatar--placeholder">
                        <Loader2 size={20} className="spin"/>
                      </div>
                    ) : (
                      <img
                        src={discordProfile?.avatar}
                        alt={discordProfile?.username || 'Discord'}
                        className="discord-avatar"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="discord-profile-info">
                      <div className="discord-profile-name">
                        {discordProfile?.global_name || discordProfile?.username || 'Konto Discord'}
                      </div>
                      {discordProfile?.username && discordProfile?.global_name && discordProfile.username !== discordProfile.global_name && (
                        <div className="discord-profile-handle">@{discordProfile.username}</div>
                      )}
                      <div className="discord-profile-status">
                        <span className="discord-status-dot"/><Check size={12}/> Połączono
                      </div>
                    </div>
                  </div>
                  <button className="settings-btn-ghost" onClick={unlinkDiscord}>
                    Odłącz
                  </button>
                </div>
              ) : (
                <button
                  className="discord-connect-btn"
                  onClick={connectDiscord}
                  disabled={discordConnecting || discordLoading}
                >
                  {discordConnecting || discordLoading ? <Loader2 size={14} className="spin"/> : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.369A19.79 19.79 0 0016.558 3.1a.07.07 0 00-.074.035c-.211.375-.444.864-.608 1.249a18.27 18.27 0 00-5.487 0 12.6 12.6 0 00-.617-1.25.07.07 0 00-.073-.034A19.74 19.74 0 003.677 4.369a.06.06 0 00-.03.025C.533 9.045-.32 13.58.099 18.057a.08.08 0 00.031.054 19.9 19.9 0 005.993 3.03.07.07 0 00.076-.027 14.2 14.2 0 001.226-1.994.07.07 0 00-.038-.098 13.1 13.1 0 01-1.872-.892.07.07 0 01-.007-.118c.126-.094.252-.192.372-.291a.07.07 0 01.071-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 01.072.009c.12.099.246.198.373.292a.07.07 0 01-.006.118c-.598.349-1.22.645-1.873.891a.07.07 0 00-.038.099 16 16 0 001.226 1.993.07.07 0 00.076.028 19.84 19.84 0 006.002-3.03.08.08 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 00-.03-.026zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  )}
                  <span>Połącz z Discordem</span>
                </button>
              )}
            </section>

            <section className="settings-card danger">
              <div className="settings-card-title danger-title"><Trash2 size={14}/> Strefa niebezpieczna</div>
              <p className="settings-card-desc">Usunięcie konta jest nieodwracalne. Tracisz wszystkie projekty i środki.</p>
              <button className="settings-btn-danger" onClick={handleDeleteAccount}>
                Usuń konto
              </button>
            </section>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="settings-section-list">
            <div className="settings-billing-cards">
              <div className="billing-stat-card">
                <div className="billing-stat-label">Dostępne środki</div>
                <div className="billing-stat-value">${parseFloat(balance).toFixed(2)}</div>
                <div className="billing-stat-sub">Plan: {planName}</div>
              </div>
              <div className="billing-stat-card">
                <div className="billing-stat-label">Użyto w tym miesiącu</div>
                <div className="billing-stat-value">${parseFloat(usedCredits).toFixed(2)}</div>
                <div className="billing-stat-sub">{usedTokens} tokenów</div>
              </div>
            </div>

            <section className="settings-card">
              <div className="settings-card-title"><Zap size={14}/> Kup plan</div>
              <p className="settings-card-desc">Wybierz pakiet kredytów by generować pluginy z lepszymi modelami.</p>
              <a href="https://suppi.pl/zenexcode" target="_blank" rel="noopener noreferrer" className="settings-btn-accent">
                Kup na suppi.pl →
              </a>
            </section>

            <section className="settings-card">
              <div className="settings-card-title"><RefreshCw size={14}/> Jak działają kredyty?</div>
              <div className="billing-rules">
                <div className="billing-rule"><span className="billing-rule-dot"/>Reset 1. dnia każdego miesiąca o 02:00</div>
                <div className="billing-rule"><span className="billing-rule-dot"/>Płacisz za faktyczne zużycie tokenów</div>
                <div className="billing-rule"><span className="billing-rule-dot"/>Doładowania (top-up) nie wygasają nigdy</div>
                <div className="billing-rule"><span className="billing-rule-dot"/>Jeden portfel działa ze wszystkimi modelami</div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
