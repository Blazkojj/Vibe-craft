import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Sparkles, 
  Command, 
  Trash2, 
  FolderOpen, 
  Plus, 
  Settings, 
  Check, 
  Zap, 
  Send, 
  Layers, 
  FileCode, 
  Users, 
  Copy, 
  LogOut,
  ArrowRight,
  Wallet,
  X
} from 'lucide-react';
import { supabase } from '../supabase';
import './Dashboard.css';

const MC_VERSIONS = [
  '1.21.4', '1.21.1', '1.21',
  '1.20.6', '1.20.4', '1.20.1',
  '1.19.4', '1.19.2', '1.18.2',
  '1.16.5', '1.12.2', '1.8.9'
];

const ENGINES = [
  'Paper', 'Spigot', 'Purpur', 'Velocity', 'BungeeCord'
];

const MODELS = [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8', badge: 'Najlepszy' },
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5.0', badge: 'Nowość' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', badge: 'Popularny' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', badge: 'Szybki' },
  { id: 'z-ai/glm-5.2', label: 'GLM 5.2', badge: 'Darmowy' }
];

const PLANS = [
  {
    name: 'Basic', price: '30', credits: '$200', color: '#3B82F6',
    features: ['Reset 1. dnia miesiąca', 'Dostęp do API', 'Podstawowe modele', 'Standardowe wsparcie'],
  },
  {
    name: 'Pro', price: '50', credits: '$320', popular: true, color: '#FF6432',
    features: ['Reset 1. dnia miesiąca', 'Dostęp do API', 'Priorytetowe wsparcie', 'Zwiększony limit RPM', 'Claude Sonnet + Opus'],
  },
  {
    name: 'Elite', price: '100', credits: '$600', color: '#F59E0B',
    features: ['Reset 1. dnia miesiąca', 'Dostęp do API', 'Dostęp do modeli Alpha', 'Wsparcie Discord', 'Wszystkie modele'],
  },
  {
    name: 'Ultimate', price: '150', credits: '$900', color: '#22C55E',
    features: ['Reset 1. dnia miesiąca', 'Dostęp do API', 'Dedykowany serwer', 'Brak limitu RPM', 'Wszystkie modele'],
  },
  {
    name: 'Unlimited+', price: '250', credits: '∞ tokenów', color: '#EF4444',
    features: ['Reset 1. dnia miesiąca', 'Dostęp do API', 'Fair Use Unlimited', 'Najwyższy priorytet SLA', 'Wszystkie modele'],
  }
];

const ClaudeIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.16 4.5c-1.02 0-1.96.57-2.44 1.48L4.44 33.38c-.45.85-.43 1.87.05 2.7.48.83 1.37 1.34 2.33 1.34h4.96c1.02 0 1.96-.57 2.44-1.48l3.94-7.5h6.68l3.94 7.5c.48.91 1.42 1.48 2.44 1.48h4.96c.96 0 1.85-.51 2.33-1.34.48-.83.5-1.85.05-2.7L24.08 5.98A2.77 2.77 0 0021.64 4.5h-.48zm-.64 11.3l4.04 7.7h-8.08l4.04-7.7z" fill="currentColor"/>
  </svg>
);

const GLMIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="9" height="9" rx="2"/>
    <rect x="13" y="2" width="9" height="9" rx="2" opacity="0.7"/>
    <rect x="2" y="13" width="9" height="9" rx="2" opacity="0.7"/>
    <rect x="13" y="13" width="9" height="9" rx="2"/>
  </svg>
);

const ModelIcon = ({ modelId, size = 12 }) => {
  if (modelId?.startsWith('claude')) {
    return <img src="/anthropic.png" alt="Claude" style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  if (modelId?.includes('glm')) {
    return <img src="/glm.webp" alt="GLM" style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  return <Sparkles size={size}/>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [activeView, setActiveView] = useState('generator');
  const [prompt, setPrompt] = useState('');
  const [deepThink, setDeepThink] = useState(false);
  const [model, setModel] = useState(MODELS[2].id); // Default to Sonnet 4.6 like in the mockup
  const [engine, setEngine] = useState(ENGINES[0]);
  const [mcVersion, setMcVersion] = useState(MC_VERSIONS[0]);
  const [totalSystemProjects, setTotalSystemProjects] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [usedCredits, setUsedCredits] = useState('0.00');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [balance, setBalance] = useState('10.00');
  const [planName, setPlanName] = useState('Free');
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [paying, setPaying] = useState(false);
  const [suppiNick, setSuppiNick] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);

  const MAIL_SERVER_URL = '/api/send-mail';

  const fetchAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .like('title', '__user_profile:%');
      
      if (!error && data) {
        const uniqueUsersMap = {};
        const orders = [];
        data.forEach(record => {
          const email = record.messages?.email;
          if (email) {
            if (!uniqueUsersMap[email]) {
              uniqueUsersMap[email] = {
                recordId: record.id,
                userId: record.user_id,
                ...record.messages
              };
            }
            const userOrders = record.messages?.pending_orders || [];
            userOrders.forEach(o => {
              if (o.status === 'pending') {
                orders.push({ ...o, email, profileRecordId: record.id });
              }
            });
          }
        });
        setAdminUsers(Object.values(uniqueUsersMap));
        setPendingOrders(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleConfirmOrder = async (order) => {
    if (!MAIL_SERVER_URL) {
      alert('Brak konfiguracji mail server.');
    }
    setConfirmingOrderId(order.orderId);
    try {
      const planName = order.planName;
      const creditsVal = order.creditsLabel;
      const numericCredits = parseFloat(String(creditsVal).replace(/[^0-9.]/g, '')) || 0;
      const isUnlimited = String(creditsVal).includes('∞') || planName === 'Unlimited+';

      const validUntilDate = new Date(order.validUntil);
      const validUntilPL = validUntilDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

      const profileKey = `__user_profile:${order.email}__`;
      const { data: profs } = await supabase
        .from('projects')
        .select('*')
        .eq('title', profileKey);
      if (!profs || profs.length === 0) throw new Error('Profil nie istnieje');
      const record = profs[0];
      const pData = record.messages || {};
      const currentBalance = parseFloat(pData.balance || '0.00');
      const newBalance = isUnlimited ? '9999.00' : (currentBalance + numericCredits).toFixed(2);
      const updatedOrders = (pData.pending_orders || []).map(o =>
        o.orderId === order.orderId ? { ...o, status: 'confirmed', confirmedAt: new Date().toISOString() } : o
      );
      const updatedProfile = {
        ...pData,
        balance: newBalance,
        plan: planName,
        subscription_end: order.validUntil,
        pending_orders: updatedOrders,
      };
      await supabase
        .from('projects')
        .update({ messages: updatedProfile })
        .eq('id', record.id);

      const { error: authErr } = await supabase.auth.updateUser({
        data: { balance: newBalance, plan: planName, subscription_end: order.validUntil }
      });
      if (authErr) console.warn('updateUser auth failed:', authErr.message);

      let mailOk = false;
      let mailErr = '';
      if (MAIL_SERVER_URL) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30000);
          const { data: { session: mailSession } } = await supabase.auth.getSession();
          const resp = await fetch(MAIL_SERVER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mailSession?.access_token || ''}`,
            },
            body: JSON.stringify({
              email: order.email,
              planName,
              price: order.price,
              creditsLabel: order.creditsLabel,
              validUntil: validUntilPL,
              nick: order.suppiNick,
              orderId: order.orderId,
              discordId: order.discordId || null,
              discordTag: order.discordTag || null,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (resp.ok) {
            mailOk = true;
          } else {
            let detail = '';
            try { detail = JSON.stringify(await resp.json()); } catch { try { detail = await resp.text(); } catch {} }
            mailErr = `HTTP ${resp.status}: ${detail.slice(0, 300)}`;
          }
        } catch (e) {
          mailErr = e.name === 'AbortError' ? 'Timeout (30s) — serwer nie odpowiada' : e.message;
        }
      }

      if (mailOk) {
        alert(`✅ Pakiet ${planName} aktywowany dla ${order.email}.\n📧 Email potwierdzający wysłany.`);
      } else if (MAIL_SERVER_URL && MAIL_API_KEY) {
        alert(`✅ Pakiet aktywowany, ale email się nie wysłał:\n${mailErr}`);
      } else {
        alert(`✅ Pakiet ${planName} aktywowany dla ${order.email} (bez maila — brak konfiguracji).`);
      }

      fetchAdminUsers();
    } catch (e) {
      console.error(e);
      alert(`Błąd: ${e.message}`);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!confirm(`Na pewno anulować zamówienie ${order.orderId}?\nKlient: ${order.email}\nPakiet: ${order.planName} (${order.price})`)) return;
    setConfirmingOrderId(order.orderId);
    try {
      const profileKey = `__user_profile:${order.email}__`;
      const { data: profs } = await supabase
        .from('projects')
        .select('*')
        .eq('title', profileKey);
      if (!profs || profs.length === 0) throw new Error('Profil nie istnieje');
      const record = profs[0];
      const pData = record.messages || {};
      const updatedOrders = (pData.pending_orders || []).map(o =>
        o.orderId === order.orderId
          ? { ...o, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : o
      );
      await supabase
        .from('projects')
        .update({ messages: { ...pData, pending_orders: updatedOrders } })
        .eq('id', record.id);
      alert(`❌ Zamówienie ${order.orderId} anulowane.`);
      fetchAdminUsers();
    } catch (e) {
      console.error(e);
      alert(`Błąd anulowania: ${e.message}`);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (activeView === 'admin') {
      fetchAdminUsers();
    }
  }, [activeView, refreshTick]);

  useEffect(() => {
    const sub = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        setRefreshTick(t => t + 1);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const handleUpdateUser = async (userRecordId, updatedFields) => {
    const userObj = adminUsers.find(u => u.recordId === userRecordId);
    if (!userObj) return;

    const newMessages = {
      ...userObj,
      ...updatedFields
    };
    delete newMessages.recordId;
    delete newMessages.userId;

    const profileKey = `__user_profile:${userObj.email}__`;
    const { error } = await supabase
      .from('projects')
      .update({ messages: newMessages })
      .eq('title', profileKey);

    if (error) {
      alert(`Błąd zapisu: ${error.message}`);
    } else {
      fetchAdminUsers();
      setEditingUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      setUser(currentUser);

      const profileKey = `__user_profile:${currentUser.email}__`;
      const { data: profs, error: profErr } = await supabase
        .from('projects')
        .select('*')
        .eq('title', profileKey);

      let profileData = null;
      if (!profErr && profs && profs.length > 0) {
        profileData = profs[0].messages;
      } else {
        const defaultProfile = {
          email: currentUser.email,
          balance: currentUser.user_metadata?.balance || '10.00',
          plan: currentUser.user_metadata?.plan || 'Free',
          used_credits: currentUser.user_metadata?.used_credits || '0.00',
          used_credits_uncached: currentUser.user_metadata?.used_credits_uncached || '0.00',
          used_tokens_cached: currentUser.user_metadata?.used_tokens_cached || '0',
          used_tokens_uncached: currentUser.user_metadata?.used_tokens_uncached || '0',
          credits_limit: currentUser.user_metadata?.credits_limit || '10.00'
        };
        await supabase.from('projects').insert([{
          user_id: currentUser.id,
          title: profileKey,
          messages: defaultProfile
        }]);
        profileData = defaultProfile;
      }

      if (profileData) {
        setBalance(profileData.balance || '10.00');
        const currentPlan = profileData.plan || 'Free';
        setPlanName(currentPlan);
        setUsedCredits(profileData.used_credits_uncached || profileData.used_credits || '0.00');

        if (currentPlan === 'Free' && !window.location.hostname.startsWith('free')) {
          window.location.href = 'https://free.zenexcode.pl/dashboard';
          return;
        }
        if (currentPlan !== 'Free' && window.location.hostname.startsWith('free')) {
          window.location.href = 'https://zenexcode.pl/dashboard';
          return;
        }

        const meta = currentUser.user_metadata || {};
        if (
          meta.balance !== profileData.balance ||
          meta.plan !== profileData.plan ||
          meta.used_credits !== profileData.used_credits ||
          meta.used_credits_uncached !== profileData.used_credits_uncached ||
          meta.used_tokens_cached !== profileData.used_tokens_cached ||
          meta.used_tokens_uncached !== profileData.used_tokens_uncached ||
          meta.credits_limit !== profileData.credits_limit
        ) {
          await supabase.auth.updateUser({
            data: {
              balance: profileData.balance,
              plan: profileData.plan,
              used_credits: profileData.used_credits,
              used_credits_uncached: profileData.used_credits_uncached || profileData.used_credits || '0.00',
              used_tokens_cached: profileData.used_tokens_cached,
              used_tokens_uncached: profileData.used_tokens_uncached,
              credits_limit: profileData.credits_limit
            }
          });
        }
      }
      
      const { data, error } = await supabase
        .from('projects').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      
      if (!error && data) {
        const userProjects = data.filter(p => !p.title?.startsWith('__user_profile:'));
        setProjects(userProjects);
      }

      const { data: allProj } = await supabase.from('projects').select('user_id, title');
      if (allProj) {
        const realProjects = allProj.filter(p => !p.title?.startsWith('__user_profile:'));
        setTotalSystemProjects(realProjects.length);
        setActiveUsersCount(new Set(realProjects.map(p => p.user_id)).size);
      } else if (data) {
        const realProjects = data.filter(p => !p.title?.startsWith('__user_profile:'));
        setTotalSystemProjects(realProjects.length);
        setActiveUsersCount(1);
      }
    };
    init();
  }, [refreshTick]);

  // odśwież usera (avatar/nick) gdy sesja się zmieni — np. po OAuth Discord
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const dp = session.user.user_metadata?.discord_profile;
        if (dp) {
          // discord_profile może zostać zapisane przez Settings po OAuth
          const { data: fresh } = await supabase.auth.getUser();
          if (fresh?.user) setUser(fresh.user);
        }
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (planName === 'Free' && model !== 'claude-sonnet-4-6') {
      setModel('claude-sonnet-4-6');
    }
  }, [planName, model]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleDropdown = (name, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleGenerate = async (explicitPrompt = null) => {
    let p = typeof explicitPrompt === 'string' ? explicitPrompt : prompt;
    if (!p?.trim()) return;
    
    if (deepThink) {
      p = `[WYMÓG GŁĘBOKIEGO PRZEMYŚLENIA: Dokonaj ekstremalnie dokładnej analizy problemu, zaplanuj architekturę i rozważ wszystkie ścieżki zanim napiszesz kod. Musisz myśleć bardzo głęboko i wieloetapowo.]\n\n` + p;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    if (window.location.hostname === 'free.zenexcode.pl') {
      if (projects.length >= 2) {
        alert('Osiągnąłeś limit 2 projektów na darmowej subdomenie! Usuń stary projekt, aby kontynuować.');
        return;
      }
    } else if (planName === 'Free' && projects.length >= 2) {
      alert('W darmowym planie możesz mieć maksymalnie 2 projekty. Usuń stary projekt lub przejdź na wyższy plan, aby utworzyć nowy.');
      return;
    }
    const { data, error } = await supabase.from('projects').insert([{
      user_id: user.id,
      title: (typeof explicitPrompt === 'string' ? explicitPrompt : prompt).split(' ').slice(0, 5).join(' ') + '...',
      prompt: p, version: mcVersion, engine, model, messages: [],
    }]).select();
    if (error) { alert(`Błąd: ${error.message}`); return; }
    setPrompt('');
    navigate(`/project/${data[0].id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Usunąć projekt bezpowrotnie?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) setProjects(projects.filter(p => p.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/ref/${user?.email?.split('@')[0] || 'invite'}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentModelLabel = MODELS.find(m => m.id === model)?.label || model;

  const formatDate = (iso) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m temu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h temu`;
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  };

  const handleCheckoutConfirm = async () => {
    if (!checkoutItem) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const hasDiscord = currentUser?.identities?.some(id => id.provider === 'discord') || !!currentUser?.user_metadata?.discord_profile;
    if (!hasDiscord) {
      alert('Aby dokonać zakupu, musisz połączyć swoje konto z Discordem w zakładce Ustawienia!');
      setCheckoutItem(null);
      navigate('/ustawienia');
      return;
    }

    const nick = suppiNick.trim();
    if (!nick) {
      alert('Podaj nick na Suppi, którego użyjesz przy wpłacie.');
      return;
    }

    setPaying(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const now = new Date();
      const validUntilDate = new Date(now);
      validUntilDate.setMonth(validUntilDate.getMonth() + 1);
      const validUntil = validUntilDate.toISOString().split('T')[0];
      const createdAt = now.toISOString();

      const newOrder = {
        orderId,
        planName: checkoutItem.planVal || checkoutItem.name,
        price: checkoutItem.price,
        creditsLabel: checkoutItem.credits || checkoutItem.creditsVal,
        suppiNick: nick,
        status: 'pending',
        createdAt,
        validUntil,
        discordId: currentUser?.user_metadata?.discord_profile?.id || currentUser?.identities?.find(id => id.provider === 'discord')?.id || null,
        discordTag: currentUser?.user_metadata?.discord_profile?.username || null
      };

      const profileKey = `__user_profile:${currentUser.email}__`;
      const { data: profs } = await supabase
        .from('projects')
        .select('*')
        .eq('title', profileKey);

      if (profs && profs.length > 0) {
        const record = profs[0];
        const pData = record.messages || {};
        const updatedProfile = {
          ...pData,
          pending_orders: [...(pData.pending_orders || []), newOrder],
        };
        await supabase
          .from('projects')
          .update({ messages: updatedProfile })
          .eq('id', record.id);
      } else {
        await supabase.from('projects').insert([{
          user_id: currentUser.id,
          title: profileKey,
          messages: { email: currentUser.email, pending_orders: [newOrder] },
        }]);
      }

      alert(`Zamówienie złożone! Nr: ${orderId}\n\nWpłać ${checkoutItem.price} zł na https://suppi.pl/zenexcode używając nicku: ${nick}\n\nZa chwilę otworzy się strona Suppi. System automatycznie wykryje Twoją wpłatę w czasie rzeczywistym i w ułamku sekundy aktywuje pakiet na koncie! Potwierdzenie otrzymasz mailem.`);
      setCheckoutItem(null);
      setSuppiNick('');
      window.open('https://suppi.pl/zenexcode', '_blank');
    } catch (e) {
      console.error(e);
      alert('Wystąpił nieoczekiwany błąd podczas składania zamówienia.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="dashboard-root">
      <div className="dashboard-grid-bg" />

      {/* ─── TOP BAR ─── */}
      <header className="dash-topbar">
        <div className="dash-topbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/zenexcode.png" alt="Zenexcode" style={{ height: '24px', objectFit: 'contain' }} />
        </div>
        
        <div className="dash-topbar-tabs">
          <button
            className={`dash-tab${activeView === 'generator' ? ' active' : ''}`}
            onClick={() => setActiveView('generator')}
          >
            Generator
          </button>
          <button
            className={`dash-tab${activeView === 'cennik' ? ' active' : ''}`}
            onClick={() => setActiveView('cennik')}
          >
            Cennik
          </button>
          {user?.email === 'froblaz@wp.pl' && (
            <button
              className={`dash-tab${activeView === 'admin' ? ' active' : ''}`}
              onClick={() => setActiveView('admin')}
            >
              Panel Admina
            </button>
          )}
        </div>

        <div className="dash-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="dash-wallet-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(255, 100, 50, 0.08)', border: '1px solid rgba(255, 100, 50, 0.2)', padding: '0.375rem 0.75rem', borderRadius: 'var(--r-md)', color: 'var(--accent)', fontSize: '0.8rem', fontFamily: 'var(--mono)', fontWeight: '600' }}>
            <Wallet size={12} />
            <span>${parseFloat(balance).toFixed(2)}</span>
          </div>

          <div className="dash-user-dropdown">
            <button 
              className="dash-user-btn"
              onClick={() => setIsUserMenuOpen(v => !v)}
            >
              <img
                className="dash-user-avatar"
                src={user?.user_metadata?.discord_profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.email || 'default'}`}
                alt="Avatar"
              />
              <div className="dash-user-info">
                <span className="dash-user-name">{user?.user_metadata?.discord_profile?.global_name || user?.user_metadata?.discord_profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Blazkoj'}</span>
                <span className="dash-user-role">{planName}</span>
              </div>
              <ChevronDown size={12} className="text-muted" />
            </button>

            {isUserMenuOpen && (
              <div className="minimal-dropdown" style={{ right: 0, left: 'auto', top: 'calc(100% + 8px)' }}>
                <button onClick={() => navigate('/ustawienia')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={14} /> Ustawienia
                </button>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)' }}>
                  <LogOut size={14} /> Wyloguj się
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── GENERATOR VIEW ─── */}
      {activeView === 'generator' && (
        <div className="dash-gen-view">
          <div className="dash-gen-container">
            
            {/* HERO */}
            <div className="dash-hero">
              <h1 className="dash-hero-title">Generuj pluginy Minecraft z AI</h1>
              <p className="dash-hero-subtitle">
                Opisz plugin, który chcesz stworzyć. AI wygeneruje kompletny kod gotowy do budowania.
              </p>
            </div>

            {/* STATS GRID */}
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Wygenerowane pluginy</span>
                  <FileCode size={14} className="dash-stat-icon" />
                </div>
                <span className="dash-stat-value">{totalSystemProjects}</span>
              </div>

              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Aktywni użytkownicy</span>
                  <Users size={14} className="dash-stat-icon" />
                </div>
                <span className="dash-stat-value">{activeUsersCount}</span>
              </div>

              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">Pozostałe pieniądze</span>
                  <Wallet size={14} className="dash-stat-icon" />
                </div>
                {(() => {
                  const spent = parseFloat(usedCredits || '0');
                  const total = parseFloat(balance || '0');
                  const remaining = Math.max(total - spent, 0);
                  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                  return (
                    <>
                      <span className="dash-stat-value" title={`Wydano $${spent.toFixed(2)} z $${total.toFixed(2)} kupionych`}>
                        ${spent.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ ${total.toFixed(2)}</span>
                      </span>
                      <div className="dash-stat-progress-bg">
                        <div className="dash-stat-progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dash-stat-sub" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>Pozostało ${remaining.toFixed(2)}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* INPUT CARD */}
            <div className="dash-input-card" ref={dropdownRef}>
              <textarea
                className="dash-textarea"
                placeholder="Stwórz plugin do zarządzania ekonomią serwera z walutą, sklepem i aukcjami..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              />
              <div className="dash-input-footer-row">
                <div className="dash-dropdowns-group">
                  
                  {/* Model Selector */}
                  <div className="dropdown-container">
                    <button className="dash-selector-btn" onClick={e => toggleDropdown('model', e)}>
                      <span className={`dash-icon-wrap ${model.startsWith('claude') ? 'claude' : 'glm'}`}>
                        <ModelIcon modelId={model} size={10} />
                      </span>
                      <span>{currentModelLabel}</span>
                      <ChevronDown size={10} />
                    </button>
                    {activeDropdown === 'model' && (
                      <div className="minimal-dropdown" style={{ minWidth: 200, bottom: 'calc(100% + 4px)', top: 'auto' }}>
                        <div className="dropdown-label">Model AI</div>
                        {MODELS.map(m => {
                          const isDisabled = planName === 'Free' && m.id !== 'claude-sonnet-4-6';
                          return (
                            <button 
                              key={m.id} 
                              onClick={() => { if(!isDisabled) { setModel(m.id); setActiveDropdown(null); } }}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                              disabled={isDisabled}
                            >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              <span className={`dash-icon-wrap ${m.id.startsWith('claude') ? 'claude' : 'glm'}`}>
                                <ModelIcon modelId={m.id} size={10} />
                              </span>
                              {m.label}
                            </span>
                            {m.badge && <span className="model-plan-badge">{m.badge}</span>}
                          </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Engine Selector */}
                  <div className="dropdown-container">
                    <button className="dash-selector-btn" onClick={e => toggleDropdown('engine', e)}>
                      <FolderOpen size={11} />
                      <span>{engine}</span>
                      <ChevronDown size={10} />
                    </button>
                    {activeDropdown === 'engine' && (
                      <div className="minimal-dropdown" style={{ minWidth: 150, bottom: 'calc(100% + 4px)', top: 'auto' }}>
                        <div className="dropdown-label">Silnik</div>
                        {ENGINES.map(eng => (
                          <button key={eng} onClick={() => { setEngine(eng); setActiveDropdown(null); }}>
                            {eng}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MC Version Selector */}
                  <div className="dropdown-container">
                    <button className="dash-selector-btn" onClick={e => toggleDropdown('version', e)}>
                      <Command size={11} />
                      <span>MC {mcVersion}</span>
                      <ChevronDown size={10} />
                    </button>
                    {activeDropdown === 'version' && (
                      <div className="minimal-dropdown large-grid" style={{ minWidth: 240, bottom: 'calc(100% + 4px)', top: 'auto' }}>
                        <div className="dropdown-label" style={{ gridColumn: '1/-1' }}>Wersja MC</div>
                        {MC_VERSIONS.map(v => (
                          <button key={v} onClick={() => { setMcVersion(v); setActiveDropdown(null); }}>
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Deep Think Button */}
                  <div className="dropdown-container">
                    <button 
                      className="dash-selector-btn" 
                      onClick={(e) => {
                        e.preventDefault();
                        const isPro = !['Free', 'Basic'].includes(planName);
                        if (!isPro) {
                           alert('Głębokie myślenie (Deep Think) jest dostępne od planu Pro!');
                           return;
                        }
                        setDeepThink(!deepThink);
                      }}
                      style={{ 
                        border: deepThink ? '1px solid var(--accent)' : undefined,
                        color: deepThink ? 'var(--accent)' : undefined,
                        background: deepThink ? 'rgba(255, 100, 50, 0.05)' : undefined
                      }}
                    >
                      <Sparkles size={11} />
                      <span>{deepThink ? 'Myślenie: ON' : 'Myślenie: OFF'}</span>
                    </button>
                  </div>

                </div>

                <button
                  className="dash-generate-btn"
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                >
                  <span>Generuj</span>
                  <Send size={12} />
                </button>
              </div>
            </div>

            {/* PROJECTS SECTION */}
            <div className="dash-projects-list-area">
              <div className="dash-projects-header">
                <h2 className="dash-projects-title">Twoje projekty</h2>
                <span className="dash-projects-count">
                  {projects.length} / 2 aktywnych
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="dash-empty" style={{ marginTop: '1rem', maxWidth: 'none' }}>
                  Brak projektów — wpisz opis pluginu powyżej i kliknij Generuj.
                </div>
              ) : (
                <div className="dash-projects-list-stack" style={{ marginTop: '1rem' }}>
                  {projects.map(proj => (
                    <div 
                      key={proj.id} 
                      className="dash-project-row-card" 
                      onClick={() => navigate(`/project/${proj.id}`)}
                    >
                      <div className="dash-proj-top-bar">
                        <div className="dash-proj-title-area">
                          <div className="dash-proj-icon-box">
                            <FileCode size={14} />
                          </div>
                          <div className="dash-proj-name-wrap">
                            <span className="dash-proj-name">{proj.title}</span>
                            <span className="dash-proj-version-badge">MC {proj.version}</span>
                          </div>
                        </div>
                        <div className="dash-proj-actions">
                          <button 
                            className="dash-proj-action-btn"
                            title="Przejdź do projektu"
                            onClick={() => navigate(`/project/${proj.id}`)}
                          >
                            <ArrowRight size={13} />
                          </button>
                          <button 
                            className="dash-proj-action-btn delete"
                            title="Usuń projekt"
                            onClick={e => handleDelete(proj.id, e)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="dash-proj-description">
                        {proj.prompt}
                      </div>

                      <div className="dash-proj-bottom-bar">
                        <div className="dash-proj-status-badge">
                          <span className="dash-status-dot" />
                          <span>Aktywny</span>
                        </div>
                        <span className="dash-proj-time">
                          {formatDate(proj.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── CENNIK VIEW ─── */}
      {activeView === 'cennik' && (
        <div className="claude-pricing-container" style={{ padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ marginBottom: '0.5rem', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>// plany i kredyty</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>Wybierz plan</h2>
            <p style={{ color: 'var(--text-muted)' }}>Kredyty resetują się 1. dnia każdego miesiąca. Doładowania nie wygasają.</p>
            <p style={{ color: 'var(--accent)', fontWeight: '600', marginTop: '0.5rem', fontSize: '0.9rem' }}>Uwaga: To NIE jest subskrypcja. Kupujesz jednorazowy pakiet ważny przez 1 miesiąc.</p>
          </div>
          <div className="claude-pricing-grid">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`claude-pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="claude-badge">Popularny</div>}
                <div className="claude-tier-name">{plan.name}</div>
                <div className="claude-tier-price">
                  {plan.price} <span className="currency">PLN</span><span className="period">/mies.</span>
                </div>
                <div className="claude-tier-credits">
                  <span className="claude-credits-val">{plan.credits}</span>
                  <span className="claude-credits-label">kredytów API</span>
                </div>
                <ul className="claude-feature-list">
                  {plan.features.map((f, i) => (
                    <li key={i} className="claude-feature-item">
                      <Check size={14} className="claude-feature-icon" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setCheckoutItem({
                    name: `Plan ${plan.name}`,
                    price: `${plan.price} PLN`,
                    credits: plan.credits,
                    creditsVal: parseFloat(plan.credits.replace('$', '')),
                    planVal: plan.name
                  })}
                  className="claude-pricing-btn"
                >
                  Kup plan →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── PANEL ADMINA VIEW ─── */}
      {activeView === 'admin' && user?.email === 'froblaz@wp.pl' && (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', zIndex: 2, position: 'relative', overflowY: 'auto', flex: 1, width: '100%' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Panel Administratora Zenexcode</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Zarządzaj użytkownikami, saldem, pakietami oraz limitami kredytów i śledź statystyki oszczędności tokenów.</p>
          </div>

          {/* ─── ZAMÓWIENIA OCZEKUJĄCE ─── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)', margin: 0 }}>Zamówienia oczekujące</h3>
              {pendingOrders.length > 0 && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '999px', fontFamily: 'var(--mono)' }}>{pendingOrders.length}</span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Sprawdź wpłatę na <a href="https://suppi.pl/zenexcode" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Suppi</a> używając nicku wpisanego przez klienta, a następnie kliknij "Potwierdź i wyślij email".</p>

            {pendingOrders.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Brak oczekujących zamówień. Wszystko zrealizowane.
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-strong)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Nr zamówienia</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Email</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Nick Suppi</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Pakiet</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Kwota</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Złożono</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map((o) => {
                      const datePL = new Date(o.createdAt).toLocaleString('pl-PL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                      const isConfirming = confirmingOrderId === o.orderId;
                      return (
                        <tr key={o.orderId} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '1rem', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.orderId}</td>
                          <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text)' }}>{o.email}</td>
                          <td style={{ padding: '1rem' }}>
                            <a href={`https://suppi.pl/zenexcode`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none' }}>{o.suppiNick}</a>
                          </td>
                          <td style={{ padding: '1rem' }}><span style={{ background: 'rgba(255,102,64,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{o.planName}</span></td>
                          <td style={{ padding: '1rem', fontFamily: 'var(--mono)', fontWeight: '700', color: 'var(--text)' }}>{o.price} zł</td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{datePL}</td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleConfirmOrder(o)}
                                disabled={isConfirming}
                                style={{ background: isConfirming ? 'var(--border)' : 'var(--accent)', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: 'var(--r-md)', fontSize: '0.75rem', fontWeight: '600', cursor: isConfirming ? 'not-allowed' : 'pointer' }}
                              >
                                {isConfirming ? '...' : 'Potwierdź i wyślij email'}
                              </button>
                              <button
                                onClick={() => handleCancelOrder(o)}
                                disabled={isConfirming}
                                title="Anuluj zamówienie"
                                style={{ background: 'transparent', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)', padding: '0.4rem 0.7rem', borderRadius: 'var(--r-md)', fontSize: '0.75rem', fontWeight: '600', cursor: isConfirming ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <X size={13} /> Anuluj
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {adminLoading ? (
            <div style={{ color: 'var(--text-muted)' }}>Ładowanie użytkowników...</div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-strong)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Email</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Pakiet</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Saldo (PLN)</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Limit wydatków</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Tokeny (Normal / Optimized)</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>Zaoszczędzone</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => {
                    const uncached = parseInt(u.used_tokens_uncached || '0');
                    const cached = parseInt(u.used_tokens_cached || '0');
                    const saved = uncached > 0 ? Math.round(((uncached - cached) / uncached) * 100) : 0;
                    return (
                      <tr key={u.recordId} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text)' }}>{u.email}</td>
                        <td style={{ padding: '1rem' }}><span style={{ background: 'rgba(255,102,64,0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>{u.plan || 'Free'}</span></td>
                        <td style={{ padding: '1rem', fontFamily: 'var(--mono)' }}>${parseFloat(u.balance || '0.00').toFixed(2)}</td>
                        <td style={{ padding: '1rem', fontFamily: 'var(--mono)' }}>${parseFloat(u.credits_limit || '10.00').toFixed(2)}</td>
                        <td style={{ padding: '1rem', fontFamily: 'var(--mono)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{uncached.toLocaleString()}</span> / <span style={{ color: '#22C55E' }}>{cached.toLocaleString()}</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#22C55E', fontWeight: '700', fontFamily: 'var(--mono)' }}>{saved}%</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => setEditingUser(u)}
                            style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--r-md)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Zarządzaj
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Brak zarejestrowanych profili użytkowników w bazie.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Kody rabatowe (Promo Codes)</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Generuj i zarządzaj kodami zniżkowymi dla użytkowników.</p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Moduł kodów rabatowych jest w trakcie wdrażania (wymaga nowej tabeli promo_codes w bazie danych). 
              <br/><br/>
              <button style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: 'var(--r-md)', cursor: 'pointer', fontWeight: '600' }} onClick={() => alert('Wkrótce dostępne! Wymaga aktualizacji schematu bazy.')}>+ Wygeneruj kod rabatowy</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ZARZĄDZANIA UŻYTKOWNIKIEM (ADMIN) ─── */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: '440px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>Zarządzaj: {editingUser.email}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Modyfikuj saldo, pakiet i limit wydatków użytkownika.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Pakiet (Plan)</label>
                <select
                  value={editingUser.plan || 'Free'}
                  onChange={(e) => {
                     const selectedPlan = e.target.value;
                     let newBal = editingUser.balance || '0.00';
                     let newDate = editingUser.subscription_end || '';
                     
                     const d = new Date();
                     d.setMonth(d.getMonth() + 1);
                     newDate = d.toISOString().split('T')[0];
                     
                     if (selectedPlan === 'TESTER') newBal = '10.00';
                     if (selectedPlan === 'Basic') newBal = '200.00';
                     if (selectedPlan === 'Pro') newBal = '320.00';
                     if (selectedPlan === 'Elite') newBal = '600.00';
                     if (selectedPlan === 'Ultimate') newBal = '900.00';
                      if (selectedPlan === 'Unlimited' || selectedPlan === 'Unlimited+') newBal = '9999.00';

                     setEditingUser({ ...editingUser, plan: selectedPlan, balance: newBal, subscription_end: newDate });
                  }}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.625rem', color: 'var(--text)', outline: 'none' }}
                >
                  <option value="Free">Free</option>
                  <option value="TESTER">TESTER ($10)</option>
                  <option value="Basic">Basic ($200)</option>
                  <option value="Pro">Pro ($320)</option>
                  <option value="Elite">Elite ($600)</option>
                  <option value="Ultimate">Ultimate ($900)</option>
                  <option value="Unlimited+">Unlimited+</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingUser.fair_use || false} onChange={e => setEditingUser({...editingUser, fair_use: e.target.checked})} />
                  Fair Use (wymuś GLM 5.2 w tle)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingUser.hybrid_mode || false} onChange={e => setEditingUser({...editingUser, hybrid_mode: e.target.checked})} />
                  Hybryda (Claude myśli, GLM koduje)
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Saldo (kredyty w $)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={editingUser.balance || '0.00'}
                    onChange={(e) => setEditingUser({ ...editingUser, balance: e.target.value })}
                    style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.625rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--mono)' }}
                  />
                  <button
                    onClick={() => {
                      const cur = parseFloat(editingUser.balance || '0');
                      setEditingUser({ ...editingUser, balance: (cur + 10.00).toFixed(2) });
                    }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.625rem 0.8rem', borderRadius: 'var(--r-md)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    +10$
                  </button>
                  <button
                    onClick={() => {
                      const cur = parseFloat(editingUser.balance || '0');
                      setEditingUser({ ...editingUser, balance: (cur + 50.00).toFixed(2) });
                    }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.625rem 0.8rem', borderRadius: 'var(--r-md)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    +50$
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Limit wydatków ($)</label>
                <input
                  type="number"
                  step="1"
                  value={editingUser.credits_limit || '10.00'}
                  onChange={(e) => setEditingUser({ ...editingUser, credits_limit: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.625rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Koniec subskrypcji</label>
                <input
                  type="date"
                  value={editingUser.subscription_end || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, subscription_end: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.625rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.625rem 1.25rem', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Anuluj
              </button>
              <button
                onClick={() => handleUpdateUser(editingUser.recordId, {
                  plan: editingUser.plan,
                  balance: parseFloat(editingUser.balance || 0).toFixed(2),
                  credits_limit: parseFloat(editingUser.credits_limit || 0).toFixed(2),
                  subscription_end: editingUser.subscription_end || null,
                  fair_use: editingUser.fair_use || false,
                  hybrid_mode: editingUser.hybrid_mode || false
                })}
                style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '0.625rem 1.5rem', borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
              >
                Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="dash-footer">
        <span>Zenexcode © 2026</span>
        <span>·</span>
        <a href="#regulamin" className="dash-footer-link">Regulamin</a>
      </footer>

      {checkoutItem && (
        <div className="claude-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="claude-modal-content" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2.5rem', width: '100%', maxWidth: '440px', position: 'relative', textAlign: 'left' }}>
            <button className="claude-modal-close" onClick={() => setCheckoutItem(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <X size={20} />
            </button>
            
            <h2 className="claude-modal-title" style={{ fontSize: '1.375rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text)', letterSpacing: '-0.025em' }}>
              Doładuj konto
            </h2>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Wybrany produkt</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text)' }}>{checkoutItem.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cena:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent)' }}>{checkoutItem.price}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--mono)' }}>E-MAIL DO DOŁADOWANIA</label>
              <input 
                type="email" 
                readOnly
                value={user?.email || ''} 
                className="claude-modal-input" 
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.8rem 1rem', borderRadius: 'var(--r-md)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--mono)' }}>NICK DO WERYFIKACJI</label>
              <input 
                type="text" 
                placeholder="Twój nick na suppi"
                value={suppiNick} 
                onChange={(e) => setSuppiNick(e.target.value)}
                className="claude-modal-input" 
                style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.8rem 1rem', borderRadius: 'var(--r-md)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button 
              className="claude-checkout-btn" 
              onClick={handleCheckoutConfirm}
              disabled={paying || !suppiNick.trim()}
              style={{ width: '100%', background: paying ? 'var(--border)' : 'var(--accent)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: 'var(--r-md)', fontSize: '0.9375rem', fontWeight: '600', cursor: paying || !suppiNick.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {paying ? 'Przetwarzanie...' : `Zapłać (${checkoutItem.price})`}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
