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
  X,
  Wand2,
  ShoppingBag,
  Download,
  Search,
  Share2,
  Terminal
} from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../LangContext';
import './Dashboard.css';
import './Marketplace.css';

const MC_VERSIONS = [
  '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21',
  '1.20.6', '1.20.4', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19',
  '1.18.2', '1.18.1', '1.18',
  '1.17.1', '1.17',
  '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16',
  '1.15.2', '1.15.1', '1.15',
  '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14',
  '1.13.2', '1.13.1', '1.13',
  '1.12.2', '1.12.1', '1.12',
  '1.11.2', '1.11',
  '1.10.2', '1.10',
  '1.9.4', '1.9',
  '1.8.9', '1.8.8', '1.8'
];

const ENGINES = [
  'Paper', 'Spigot', 'Purpur', 'Folia', 'Velocity', 'BungeeCord', 'Waterfall', 'Sponge', 'Fabric', 'Forge', 'Bukkit', 'Pufferfish', 'Magma', 'Mohist'
];

const getModels = (isEN) => [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8', badge: isEN ? 'Best' : 'Najlepszy' },
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5.0', badge: isEN ? 'New' : 'Nowość' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', badge: isEN ? 'Popular' : 'Popularny' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', badge: isEN ? 'Fast' : 'Szybki' },
  { id: 'z-ai/glm-5.2', label: 'GLM 5.2', badge: isEN ? 'Free' : 'Darmowy' }
];

const getPLANS = (D, isEN) => [
  {
    name: 'Basic', price: '30', credits: '$200', color: '#3B82F6',
    features: [D.planFeatureReset || 'Resets on the 1st of every month', D.planFeatureApi || 'API access', D.planFeatureBaseModels || 'Basic models', D.planFeatureSupport || 'Standard support'],
  },
  {
    name: 'Pro', price: '50', credits: '$320', popular: true, color: '#FF6432',
    features: [D.planFeatureReset || 'Resets on the 1st of every month', D.planFeatureApi || 'API access', D.planFeaturePrioritySupport || 'Priority support', D.planFeatureRpm || 'Increased RPM limit', D.planFeatureSonnetOpus || 'Claude Sonnet + Opus'],
  },
  {
    name: 'Elite', price: '100', credits: '$600', color: '#F59E0B',
    features: [D.planFeatureReset || 'Resets on the 1st of every month', D.planFeatureApi || 'API access', D.planFeatureAlpha || 'Access to Alpha models', D.planFeatureDiscordSupport || 'Discord support', D.planFeatureAllModels || 'All models'],
  },
  {
    name: 'Ultimate', price: '150', credits: '$900', color: '#FF6B00',
    features: [D.planFeatureReset || 'Resets on the 1st of every month', D.planFeatureApi || 'API access', D.planFeatureDedicated || 'Dedicated server', D.planFeatureNoRpm || 'No RPM limit', D.planFeatureAllModels || 'All models'],
  },
  {
    name: 'Unlimited+', price: '250', credits: isEN ? '∞ tokens' : '∞ tokenów', color: '#EF4444',
    features: [D.planFeatureReset || 'Resets on the 1st of every month', D.planFeatureApi || 'API access', D.planFeatureFairUse || 'Fair Use Unlimited', D.planFeatureSla || 'Highest priority SLA', D.planFeatureAllModels || 'All models'],
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
  const { lang, t } = useLang();
  const isEN = lang === 'en';
  const D = t.dashboard || {};
  const MODELS = getModels(isEN);
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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
  const [enhanceInput, setEnhanceInput] = useState('');
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
  const [viewingChatsUser, setViewingChatsUser] = useState(null);
  const [userChats, setUserChats] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [searchMarketQuery, setSearchMarketQuery] = useState('');
  const [selectedMarketCategory, setSelectedMarketCategory] = useState('all');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [projectToPublish, setProjectToPublish] = useState(null);
  const [publishPrice, setPublishPrice] = useState('0.00');
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishCategory, setPublishCategory] = useState('Minecraft Plugin');
  const [publishing, setPublishing] = useState(false);
  const [buyingItemId, setBuyingItemId] = useState(null);

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

  const handleViewChats = async (u) => {
    setViewingChatsUser(u);
    setUserChats([]);
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', u.userId)
        .not('title', 'like', '__user_profile:%')
        .order('created_at', { ascending: false });
      if (data) setUserChats(data);
    } catch (e) {
      console.error(e);
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
        const userProjects = data.filter(p => !p.title?.startsWith('__user_profile:') && !p.title?.startsWith('__marketplace:'));
        setProjects(userProjects);
      }

      const { data: allProj } = await supabase.from('projects').select('user_id, title');
      if (allProj) {
        const realProjects = allProj.filter(p => !p.title?.startsWith('__user_profile:') && !p.title?.startsWith('__marketplace:'));
        setTotalSystemProjects(realProjects.length);
        setActiveUsersCount(new Set(realProjects.map(p => p.user_id)).size);
      } else if (data) {
        const realProjects = data.filter(p => !p.title?.startsWith('__user_profile:') && !p.title?.startsWith('__marketplace:'));
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
        alert(isEN ? 'You have reached the 2-project limit on the free subdomain! Delete an old project to continue.' : 'Osiągnąłeś limit 2 projektów na darmowej subdomenie! Usuń stary projekt, aby kontynuować.');
        return;
      }
    } else if (planName === 'Free' && projects.length >= 2) {
      alert(isEN ? 'On the free plan you can have up to 2 projects. Delete an old project or upgrade to create a new one.' : 'W darmowym planie możesz mieć maksymalnie 2 projekty. Usuń stary projekt lub przejdź na wyższy plan, aby utworzyć nowy.');
      return;
    }
    try {
      const { data, error } = await supabase.from('projects').insert([{
        user_id: user.id,
        title: (typeof explicitPrompt === 'string' ? explicitPrompt : prompt).split(' ').slice(0, 5).join(' ') + '...',
        prompt: p, version: mcVersion, engine, model, messages: [],
      }]).select();
      if (error) { alert(isEN ? `Error: ${error.message}` : `Błąd: ${error.message}`); return; }
      setPrompt('');
      navigate(`/project/${data[0].id}`);
    } catch (err) {
      alert(isEN ? `Database connection error: ${err.message || 'Failed to fetch'}` : `Błąd połączenia z bazą: ${err.message || 'Failed to fetch'}`);
    }
  };

  const handleOpenEnhanceModal = () => {
    if (planName === 'Free') {
      alert(isEN ? 'The AI prompt generator is only available from the Basic plan and above (or Tester accounts).' : 'Generator promptów AI jest dostępny tylko od planu Basic (oraz dla kont Tester).');
      return;
    }
    setIsEnhanceModalOpen(true);
  };

  const handleEnhancePrompt = async () => {
    if (!enhanceInput.trim()) {
      alert(isEN ? 'Enter at least a few words so I know what to enhance!' : 'Wpisz chociaż kilka słów pomysłu, abym wiedział co ulepszyć!');
      return;
    }
    setIsEnhancing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ prompt: enhanceInput })
      });
      const data = await res.json();
      if (data.enhanced) {
        setPrompt(data.enhanced);
        setIsEnhanceModalOpen(false);
        setEnhanceInput('');
      } else {
        alert((isEN ? 'Enhancement error: ' : 'Błąd ulepszania: ') + (data.error || (isEN ? 'Unknown error' : 'Nieznany błąd')));
      }
    } catch (e) {
      alert((isEN ? 'Connection error: ' : 'Błąd połączenia: ') + e.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(D.confirmDelete || 'Usunąć projekt bezpowrotnie?')) return;
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
    if (diff < 3600000) return `${Math.floor(diff / 60000)}${isEN ? 'm ago' : 'm temu'}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}${isEN ? 'h ago' : 'h temu'}`;
    return d.toLocaleDateString(isEN ? 'en-GB' : 'pl-PL', { day: 'numeric', month: 'short' });
  };

  const handleCheckoutConfirm = async () => {
    if (!checkoutItem) return;

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const hasDiscord = currentUser?.identities?.some(id => id.provider === 'discord') || !!currentUser?.user_metadata?.discord_profile;
    if (!hasDiscord) {
      alert(isEN ? 'To make a purchase, you must connect your Discord account in the Settings tab!' : 'Aby dokonać zakupu, musisz połączyć swoje konto z Discordem w zakładce Ustawienia!');
      setCheckoutItem(null);
      navigate('/ustawienia');
      return;
    }

    const nick = suppiNick.trim();
    if (!nick) {
      alert(isEN ? 'Please enter your Suppi nickname that you will use when paying.' : 'Podaj nick na Suppi, którego użyjesz przy wpłacie.');
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

      alert(isEN
        ? `Order placed! ID: ${orderId}\n\nPay ${checkoutItem.price} at https://suppi.pl/zenexcode using nick: ${nick}\n\nSuppi will open now. The system will detect your payment in real time and activate the plan instantly! You will receive a confirmation by email.`
        : `Zamówienie złożone! Nr: ${orderId}\n\nWpłać ${checkoutItem.price} zł na https://suppi.pl/zenexcode używając nicku: ${nick}\n\nZa chwilę otworzy się strona Suppi. System automatycznie wykryje Twoją wpłatę w czasie rzeczywistym i w ułamku sekundy aktywuje pakiet na koncie! Potwierdzenie otrzymasz mailem.`);
      setCheckoutItem(null);
      setSuppiNick('');
      window.open('https://suppi.pl/zenexcode', '_blank');
    } catch (e) {
      console.error(e);
      alert(isEN ? 'An unexpected error occurred while placing the order.' : 'Wystąpił nieoczekiwany błąd podczas składania zamówienia.');
    } finally {
      setPaying(false);
    }
  };

  const fetchMarketplaceItems = async () => {
    setMarketplaceLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .like('title', '__marketplace:%')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const items = data.map(record => {
          const meta = record.messages || {};
          return {
            id: record.id,
            user_id: record.user_id,
            title: record.title.replace('__marketplace:', ''),
            prompt: record.prompt,
            version: record.version,
            engine: record.engine,
            model: record.model,
            price: meta.price || '0.00',
            category: meta.category || 'Minecraft Plugin',
            author_email: meta.author_email || '',
            author_name: meta.author_name || 'Anonim',
            downloads: meta.downloads || 0,
            original_project_id: meta.original_project_id || '',
            original_messages: meta.original_messages || []
          };
        });
        setMarketplaceItems(items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const handleOpenPublishModal = (proj) => {
    setProjectToPublish(proj);
    setPublishTitle(proj.title);
    setPublishDesc(proj.prompt || '');
    setPublishPrice('0.00');
    setPublishCategory('Minecraft Plugin');
    setIsPublishModalOpen(true);
  };

  const handlePublishToMarketplace = async () => {
    if (!projectToPublish || !publishTitle.trim()) return;
    setPublishing(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data: fullProj, error: fetchErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectToPublish.id)
        .single();

      if (fetchErr || !fullProj) {
        alert('Nie udało się pobrać kodu projektu do udostępnienia.');
        return;
      }

      const marketRecordTitle = `__marketplace:${publishTitle.trim()}`;
      const payload = {
        type: 'marketplace_item',
        price: parseFloat(publishPrice || 0).toFixed(2),
        category: publishCategory,
        author_email: currentUser.email,
        author_name: currentUser.user_metadata?.discord_profile?.global_name || currentUser.user_metadata?.discord_profile?.username || currentUser.user_metadata?.username || currentUser.email.split('@')[0],
        downloads: 0,
        original_project_id: projectToPublish.id,
        original_messages: fullProj.messages || []
      };

      const { error } = await supabase.from('projects').insert([{
        user_id: currentUser.id,
        title: marketRecordTitle,
        prompt: publishDesc.trim(),
        version: projectToPublish.version,
        engine: projectToPublish.engine,
        model: projectToPublish.model || 'claude-sonnet-4-6',
        messages: payload
      }]);

      if (error) {
        alert(isEN ? `Publish error: ${error.message}` : `Błąd publikacji: ${error.message}`);
      } else {
        alert(isEN ? 'Project has been shared on the Marketplace!' : 'Projekt został udostępniony na Marketplace!');
        setIsPublishModalOpen(false);
        fetchMarketplaceItems();
      }
    } catch (err) {
      console.error(err);
      alert(isEN ? 'Error during publication.' : 'Błąd podczas publikacji.');
    } finally {
      setPublishing(false);
    }
  };

  const handleBuyItem = async (item) => {
    const isOwner = user?.id === item.user_id;
    if (isOwner) return;

    const priceVal = parseFloat(item.price || 0);
    const confirmMsg = priceVal > 0 
      ? (isEN 
          ? `Are you sure you want to buy and import project "${item.title}" for ${priceVal.toFixed(2)} PLN?`
          : `Czy na pewno chcesz kupić i zaimportować projekt "${item.title}" za ${priceVal.toFixed(2)} PLN?`)
      : (isEN 
          ? `Do you want to import the free project "${item.title}"?`
          : `Czy chcesz zaimportować darmowy projekt "${item.title}"?`);

    if (!window.confirm(confirmMsg)) return;

    setBuyingItemId(item.id);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const buyerProfileKey = `__user_profile:${currentUser.email}__`;
      const { data: buyerProfs } = await supabase.from('projects').select('*').eq('title', buyerProfileKey);
      if (!buyerProfs || !buyerProfs[0]) {
        alert(isEN ? 'User profile not found.' : 'Nie odnaleziono profilu użytkownika.');
        return;
      }

      const buyerRecord = buyerProfs[0];
      const buyerData = buyerRecord.messages || {};
      const buyerBalance = parseFloat(buyerData.balance || '0.00');

      if (priceVal > 0 && buyerBalance < priceVal) {
        alert(isEN 
          ? `Insufficient funds in your wallet! Cost: ${priceVal.toFixed(2)} PLN. Your balance: ${buyerBalance.toFixed(2)} PLN. Go to the Pricing or Settings tab to top up your account.`
          : `Niewystarczające środki w portfelu! Koszt: ${priceVal.toFixed(2)} PLN. Twoje saldo: ${buyerBalance.toFixed(2)} PLN. Przejdź do zakładki Cennik lub Ustawienia, aby doładować konto.`);
        return;
      }

      if (priceVal > 0) {
        const sellerProfileKey = `__user_profile:${item.author_email}__`;
        const { data: sellerProfs } = await supabase.from('projects').select('*').eq('title', sellerProfileKey);
        
        if (sellerProfs && sellerProfs[0]) {
          const sellerRecord = sellerProfs[0];
          const sellerData = sellerRecord.messages || {};
          const sellerBalance = parseFloat(sellerData.balance || '0.00');
          const newSellerBalance = (sellerBalance + priceVal).toFixed(2);
          
          await supabase
            .from('projects')
            .update({ messages: { ...sellerData, balance: newSellerBalance } })
            .eq('id', sellerRecord.id);
        }

        const newBuyerBalance = (buyerBalance - priceVal).toFixed(2);
        await supabase
          .from('projects')
          .update({ messages: { ...buyerData, balance: newBuyerBalance } })
          .eq('id', buyerRecord.id);

        setBalance(newBuyerBalance);
      }

      const { data: marketRecord, error: marketErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', item.id)
        .single();

      if (marketRecord) {
        const currentMeta = marketRecord.messages || {};
        const updatedMeta = {
          ...currentMeta,
          downloads: (currentMeta.downloads || 0) + 1
        };
        await supabase
          .from('projects')
          .update({ messages: updatedMeta })
          .eq('id', item.id);
      }

      const { data: newProj, error: insertErr } = await supabase.from('projects').insert([{
        user_id: currentUser.id,
        title: `${item.title} (Import)`,
        prompt: item.prompt,
        version: item.version,
        engine: item.engine,
        model: item.model || 'claude-sonnet-4-6',
        messages: item.original_messages || []
      }]).select();

      if (insertErr) {
        alert(isEN ? `Error creating project: ${insertErr.message}` : `Błąd tworzenia projektu: ${insertErr.message}`);
      } else {
        alert(isEN ? 'Project imported successfully!' : 'Projekt został pomyślnie zaimportowany!');
        navigate(`/project/${newProj[0].id}`);
      }
    } catch (err) {
      console.error(err);
      alert(isEN ? 'An error occurred during the transaction.' : 'Wystąpił błąd podczas transakcji.');
    } finally {
      setBuyingItemId(null);
    }
  };

  const handleDeleteMarketItem = async (itemId, e) => {
    e.stopPropagation();
    if (!window.confirm(isEN ? 'Are you sure you want to remove this listing from the Marketplace?' : 'Czy na pewno chcesz usunąć tę ofertę z Marketplace?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', itemId);
      if (error) {
        alert(isEN ? `Error: ${error.message}` : `Błąd: ${error.message}`);
      } else {
        alert(isEN ? 'Listing removed.' : 'Oferta usunięta.');
        fetchMarketplaceItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeView === 'marketplace') {
      fetchMarketplaceItems();
    }
  }, [activeView]);

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
            {D.tabGenerator}
          </button>
          <button
            className={`dash-tab${activeView === 'marketplace' ? ' active' : ''}`}
            onClick={() => setActiveView('marketplace')}
          >
            {D.tabMarketplace || 'Marketplace'}
          </button>
          <button
            className={`dash-tab${activeView === 'cennik' ? ' active' : ''}`}
            onClick={() => setActiveView('cennik')}
          >
            {D.tabPricing}
          </button>
          {user?.email === 'froblaz@wp.pl' && (
            <button
              className={`dash-tab${activeView === 'admin' ? ' active' : ''}`}
              onClick={() => setActiveView('admin')}
            >
              {D.tabAdmin}
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
                  <Settings size={14} /> {D.menuSettings}
                </button>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)' }}>
                  <LogOut size={14} /> {D.menuLogout}
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
            <div className="dash-hero-bento">
              <div className="dash-glow-orb"></div>
              <h1 className="dash-hero-title">{D.heroTitle}</h1>
              
              {/* MASSIVE PROMPT BAR */}
              <div className="dash-prompt-bar-bento" ref={dropdownRef}>
                <div className="dash-prompt-icon-left">
                  <Terminal size={22} />
                </div>
                <textarea
                  className="dash-textarea-bento"
                  placeholder={D.promptPlaceholder}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                />
                <button 
                  className="dash-submit-btn-bento"
                  disabled={!prompt.trim()}
                  onClick={handleGenerate}
                >
                  <Sparkles size={16} />
                  <span>Generuj</span>
                </button>
              </div>
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
                        <div className="dropdown-label">{D.modelLabel}</div>
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
                        <div className="dropdown-label">{D.engineLabel}</div>
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
                        <div className="dropdown-label" style={{ gridColumn: '1/-1' }}>{D.versionLabel}</div>
                        {MC_VERSIONS.map(v => (
                          <button key={v} onClick={() => { setMcVersion(v); setActiveDropdown(null); }}>
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  

                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="dash-selector-btn"
                    onClick={handleOpenEnhanceModal}
                    style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                    title="Generator Promptów AI (tylko dla płatnych planów i testerów)"
                  >
                    <Wand2 size={12} />
                    <span>{D.aiGenerator}</span>
                  </button>

                  <button
                    className="dash-generate-btn"
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isEnhancing}
                  >
                    <span>{D.generate}</span>
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>

            
            {/* STATS GRID */}
            <div className="dash-stats-grid">
              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">{D.statPlugins}</span>
                  <FileCode size={14} className="dash-stat-icon" />
                </div>
                <span className="dash-stat-value">{totalSystemProjects}</span>
              </div>

              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">{D.statUsers}</span>
                  <Users size={14} className="dash-stat-icon" />
                </div>
                <span className="dash-stat-value">{activeUsersCount}</span>
              </div>

              <div className="dash-stat-card">
                <div className="dash-stat-header">
                  <span className="dash-stat-label">{D.statCredits}</span>
                  <Wallet size={14} className="dash-stat-icon" />
                </div>
                {(() => {
                  const spent = parseFloat(usedCredits || '0');
                  const total = parseFloat(balance || '0');
                  const remaining = Math.max(total - spent, 0);
                  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                  return (
                    <>
                      <span className="dash-stat-value" title={`${D.statSpent} ${spent.toFixed(2)} / ${total.toFixed(2)}`}>
                        ${spent.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ ${total.toFixed(2)}</span>
                      </span>
                      <div className="dash-stat-progress-bg">
                        <div className="dash-stat-progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dash-stat-sub" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{D.statRemaining} ${remaining.toFixed(2)}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* PROJECTS SECTION */}
            <div className="dash-projects-list-area">
              <div className="dash-projects-header">
                <h2 className="dash-projects-title">{D.projectsTitle}</h2>
                <span className="dash-projects-count">
                  {projects.length} / 2 {D.projectsActive}
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="dash-empty" style={{ marginTop: '1rem', maxWidth: 'none' }}>
                  {D.projectEmpty}
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
                            title={D.openProject}
                            onClick={() => navigate(`/project/${proj.id}`)}
                          >
                            <ArrowRight size={13} />
                          </button>
                          <button 
                            className="dash-project-share-btn"
                            title={isEN ? 'Share on Marketplace' : 'Udostępnij w Marketplace'}
                            onClick={e => { e.stopPropagation(); handleOpenPublishModal(proj); }}
                          >
                            <Share2 size={13} />
                          </button>
                          <button 
                            className="dash-proj-action-btn delete"
                            title={D.deleteProject}
                            onClick={e => handleDeleteProject(proj.id, e)}
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
                          <span>{D.projectActive}</span>
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

      {activeView === 'marketplace' && (
        <div className="dash-gen-view">
          <div className="dash-gen-container">
            <div className="market-view">
              <div className="market-header-card">
                <div className="market-header-glow" />
                <h1 className="market-header-title">{D.marketTitle}</h1>
                <p className="market-header-subtitle">
                  {D.marketSubtitle}
                </p>
              </div>

              <div className="market-controls">
                <div className="market-search-wrapper">
                  <Search size={16} className="market-search-icon" />
                  <input
                    type="text"
                    className="market-search-input"
                    placeholder={D.marketSearchPlaceholder}
                    value={searchMarketQuery}
                    onChange={e => setSearchMarketQuery(e.target.value)}
                  />
                </div>
                <div className="market-categories">
                  {[
                    { id: 'all', label: D.marketCatAll },
                    { id: 'Minecraft Plugin', label: D.marketCatPlugins },
                    { id: 'Discord Bot', label: D.marketCatBots },
                    { id: 'Inne', label: D.marketCatOther }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      className={`market-cat-btn${selectedMarketCategory === cat.id ? ' active' : ''}`}
                      onClick={() => setSelectedMarketCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {marketplaceLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                  <div className="dash-stat-progress-bar" style={{ width: '40px', height: '4px', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
                </div>
              ) : (() => {
                const filtered = marketplaceItems.filter(item => {
                  const matchQuery = item.title.toLowerCase().includes(searchMarketQuery.toLowerCase()) || 
                                     item.prompt.toLowerCase().includes(searchMarketQuery.toLowerCase());
                  const matchCat = selectedMarketCategory === 'all' || item.category === selectedMarketCategory;
                  return matchQuery && matchCat;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="market-empty-state">
                      <ShoppingBag size={48} />
                      <div className="market-empty-title">{D.marketEmptyTitle}</div>
                      <div className="market-empty-desc">
                        {D.marketEmptyDesc}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="market-grid">
                    {filtered.map(item => {
                      const isOwner = user?.id === item.user_id;
                      const priceVal = parseFloat(item.price || 0);
                      const isPaid = priceVal > 0;
                      return (
                        <div key={item.id} className="market-card">
                          <div className="market-card-glow" />
                          <div className="market-card-header">
                            <div className="market-card-meta">
                              <span className="market-card-title">{item.title}</span>
                              <span className="market-author-label">
                                {D.marketAuthorLabel} <span className="market-author-name">{item.author_name}</span>
                              </span>
                            </div>
                            <span className={`market-card-price-badge${isPaid ? ' paid' : ''}`}>
                              {isPaid ? `${priceVal.toFixed(2)} PLN` : D.marketFree}
                            </span>
                          </div>

                          <p className="market-card-desc">{item.prompt}</p>

                          <div className="market-card-tags">
                            <span className="market-tag engine">{item.engine}</span>
                            <span className="market-tag">MC {item.version}</span>
                            <span className="market-tag">{item.category}</span>
                          </div>

                          <div className="market-card-footer">
                            <div className="market-card-stats">
                              <span className="market-stat-item">
                                <Download size={14} />
                                <span>{item.downloads} {D.marketDownloads}</span>
                              </span>
                            </div>
                            {isOwner ? (
                              <button
                                className="market-action-btn owned"
                                onClick={e => handleDeleteMarketItem(item.id, e)}
                              >
                                {D.marketWithdraw}
                              </button>
                            ) : (
                              <button
                                className="market-action-btn"
                                onClick={() => handleBuyItem(item)}
                                disabled={buyingItemId === item.id}
                              >
                                {buyingItemId === item.id ? (
                                  D.marketImporting
                                ) : isPaid ? (
                                  <>{D.marketBuyImport}</>
                                ) : (
                                  <>{D.marketImport}</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── CENNIK VIEW ─── */}
      {activeView === 'cennik' && (
        <div className="claude-pricing-container" style={{ padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ marginBottom: '0.5rem', fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{D.pricingComment}</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>{D.pricingTitle}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{D.pricingSub}</p>
            <p style={{ color: 'var(--accent)', fontWeight: '600', marginTop: '0.5rem', fontSize: '0.9rem' }}>{D.pricingNotSub}</p>
          </div>
          <div className="claude-pricing-grid">
            {getPLANS(D, isEN).map((plan) => (
              <div key={plan.name} className={`claude-pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="claude-badge">{D.pricingPopular}</div>}
                <div className="claude-tier-name">{plan.name}</div>
                <div className="claude-tier-price">
                  {plan.price} <span className="currency">PLN</span><span className="period">{D.pricingPeriod}</span>
                </div>
                <div className="claude-tier-credits">
                  <span className="claude-credits-val">{plan.credits}</span>
                  <span className="claude-credits-label">{D.pricingCreditsLabel}</span>
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
                  {D.pricingBuyBtn}
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
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>{D.adminPanelTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{D.adminPanelDesc}</p>
          </div>

          {/* ─── ZAMÓWIENIA OCZEKUJĄCE ─── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)', margin: 0 }}>{D.adminPendingOrders}</h3>
              {pendingOrders.length > 0 && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: '0.72rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '999px', fontFamily: 'var(--mono)' }}>{pendingOrders.length}</span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{D.adminPendingDesc}</p>

            {pendingOrders.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Brak oczekujących zamówień. Wszystko zrealizowane.
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-strong)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColOrder}</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColEmail}</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColNick}</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColPlan}</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColAmount}</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColDate}</th>
                      <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>{D.adminColActions}</th>
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
                                {isConfirming ? '...' : D.adminConfirmBtn}
                              </button>
                              <button
                                onClick={() => handleCancelOrder(o)}
                                disabled={isConfirming}
                                title="Anuluj zamówienie"
                                style={{ background: 'transparent', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)', padding: '0.4rem 0.7rem', borderRadius: 'var(--r-md)', fontSize: '0.75rem', fontWeight: '600', cursor: isConfirming ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <X size={13} /> {D.adminCancelBtn}
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
            <div style={{ color: 'var(--text-muted)' }}>{D.adminLoadingUsers}</div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-strong)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColEmail}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColPlan}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColBalance}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColLimit}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColTokens}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem' }}>{D.adminColSaved}</th>
                    <th style={{ padding: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', fontSize: '0.7rem', textAlign: 'right' }}>{D.adminColActions}</th>
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
                          <span style={{ color: 'var(--text-muted)' }}>{uncached.toLocaleString()}</span> / <span style={{ color: '#FF6B00' }}>{cached.toLocaleString()}</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#FF6B00', fontWeight: '700', fontFamily: 'var(--mono)' }}>{saved}%</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleViewChats(u)}
                              style={{ background: 'var(--bg-hover)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: 'var(--r-md)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              {D.adminChatsBtn}
                            </button>
                            <button
                              onClick={() => setEditingUser(u)}
                              style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--r-md)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                              {D.adminManageBtn}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {adminUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{D.adminNoUsers}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>{D.adminPromoTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{D.adminPromoDesc}</p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {D.adminPromoWip} 
              <br/><br/>
              <button style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: 'var(--r-md)', cursor: 'pointer', fontWeight: '600' }} onClick={() => alert(D.adminPromoSoon)}>{D.adminPromoBtn}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL ZARZĄDZANIA UŻYTKOWNIKIEM (ADMIN) ─── */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: '440px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)', marginBottom: '0.5rem' }}>{D.adminManageModalTitle} {editingUser.email}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>{D.adminManageModalDesc}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{D.adminPlanLabel}</label>
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
                  {D.adminFairUse}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editingUser.hybrid_mode || false} onChange={e => setEditingUser({...editingUser, hybrid_mode: e.target.checked})} />
                  {D.adminHybrid}
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{D.adminBalanceLabel}</label>
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
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{D.adminLimitLabel}</label>
                <input
                  type="number"
                  step="1"
                  value={editingUser.credits_limit || '10.00'}
                  onChange={(e) => setEditingUser({ ...editingUser, credits_limit: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.625rem', color: 'var(--text)', outline: 'none', fontFamily: 'var(--mono)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{D.adminSubEndLabel}</label>
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
                {D.adminCancelModalBtn}
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
                {D.adminSaveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="dash-footer">
        <span>Zenexcode © 2026</span>
        <span>·</span>
        <a href="#regulamin" className="dash-footer-link">{D.footerTos}</a>
      </footer>

      {checkoutItem && (
        <div className="claude-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="claude-modal-content" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '2.5rem', width: '100%', maxWidth: '440px', position: 'relative', textAlign: 'left' }}>
            <button className="claude-modal-close" onClick={() => setCheckoutItem(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <X size={20} />
            </button>
            
            <h2 className="claude-modal-title" style={{ fontSize: '1.375rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text)', letterSpacing: '-0.025em' }}>
              {D.checkoutTitle}
            </h2>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--mono)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{D.checkoutProduct}</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text)' }}>{checkoutItem.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{D.checkoutPriceLabel}</span>
                <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--accent)' }}>{checkoutItem.price}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--mono)' }}>{D.checkoutEmailLabel}</label>
              <input 
                type="email" 
                readOnly
                value={user?.email || ''} 
                className="claude-modal-input" 
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.8rem 1rem', borderRadius: 'var(--r-md)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--mono)' }}>{D.checkoutNickLabel}</label>
              <input 
                type="text" 
                placeholder={D.checkoutNickPlaceholder}
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
              {paying ? D.checkoutProcessing : `${D.checkoutPayBtn} (${checkoutItem.price})`}
            </button>
          </div>
        </div>
      )}

      {isEnhanceModalOpen && (
        <div className="dash-modal-overlay" onClick={() => setIsEnhanceModalOpen(false)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <h3>{D.enhanceTitle}</h3>
              <button className="dash-close-btn" onClick={() => setIsEnhanceModalOpen(false)}><X size={16} /></button>
            </div>
            <div className="dash-modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                {D.enhanceModalDesc}
              </p>
              <textarea 
                value={enhanceInput} 
                onChange={e => setEnhanceInput(e.target.value)} 
                placeholder={D.enhancePlaceholder}
                style={{ 
                  width: '100%', minHeight: '120px', background: 'var(--bg-input)', 
                  color: '#fff', border: '1px solid var(--border)', 
                  borderRadius: '8px', padding: '1rem', resize: 'vertical',
                  fontSize: '0.95rem'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button 
                  className="dash-generate-btn" 
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !enhanceInput.trim()}
                >
                  <span>{isEnhancing ? D.enhanceMagicWorking : D.enhanceGenerateBtn}</span>
                  <Wand2 size={12} className={isEnhancing ? "animate-pulse" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL CZATÓW UŻYTKOWNIKA ─── */}
      {viewingChatsUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setViewingChatsUser(null)}>
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text)' }}>{D.adminChatsModalTitle} {viewingChatsUser.email}</h3>
              <button onClick={() => setViewingChatsUser(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {userChats.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>{D.adminNoChats}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {userChats.map(chat => {
                  const msgCount = Array.isArray(chat.messages) ? chat.messages.length : 0;
                  return (
                    <div key={chat.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ color: 'var(--accent)', margin: 0, fontSize: '1.1rem' }}>{chat.title}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{D.adminMsgCount} {msgCount}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                        {msgCount === 0 ? (
                          <span style={{ color: 'var(--text-muted)' }}>{D.adminNoMsgs}</span>
                        ) : (
                          chat.messages.map((m, idx) => (
                            <div key={idx} style={{ padding: '0.8rem', borderRadius: '8px', background: m.sender === 'user' ? 'rgba(255,102,64,0.1)' : 'var(--bg-input)', border: m.sender === 'user' ? '1px solid rgba(255,102,64,0.2)' : '1px solid var(--border)' }}>
                              <strong style={{ display: 'block', marginBottom: '0.3rem', color: m.sender === 'user' ? 'var(--accent)' : 'var(--text-dim)', fontSize: '0.8rem' }}>{m.sender.toUpperCase()}</strong>
                              <div style={{ color: 'var(--text)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {m.text?.substring(0, 1000)}{m.text?.length > 1000 ? D.adminMsgTruncated : ''}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {isPublishModalOpen && (
        <div className="market-modal-overlay">
          <div className="market-modal">
            <div className="market-modal-header">
              <span className="market-modal-title">{D.publishModalTitle}</span>
              <button className="market-modal-close" onClick={() => setIsPublishModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="market-modal-body">
              <div className="market-form-group">
                <label className="market-form-label">{D.publishNameLabel}</label>
                <input
                  type="text"
                  className="market-form-input"
                  value={publishTitle}
                  onChange={e => setPublishTitle(e.target.value)}
                  placeholder={D.publishNamePlaceholder}
                />
              </div>
              <div className="market-form-group">
                <label className="market-form-label">{D.publishCategoryLabel}</label>
                <select
                  className="market-form-select"
                  value={publishCategory}
                  onChange={e => setPublishCategory(e.target.value)}
                >
                  <option value="Minecraft Plugin">Minecraft Plugin</option>
                  <option value="Discord Bot">Discord Bot</option>
                  <option value="Inne">Inne</option>
                </select>
              </div>
              <div className="market-form-group">
                <label className="market-form-label">{D.publishPriceLabel}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="market-form-input"
                  value={publishPrice}
                  onChange={e => setPublishPrice(e.target.value)}
                />
              </div>
              <div className="market-form-group">
                <label className="market-form-label">{D.publishDescLabel}</label>
                <textarea
                  className="market-form-textarea"
                  value={publishDesc}
                  onChange={e => setPublishDesc(e.target.value)}
                  placeholder={D.publishDescPlaceholder}
                />
              </div>
            </div>
            <div className="market-modal-footer">
              <button className="market-btn-secondary" onClick={() => setIsPublishModalOpen(false)}>
                {D.publishCancelBtn}
              </button>
              <button
                className="market-btn-primary"
                onClick={handlePublishToMarketplace}
                disabled={publishing || !publishTitle.trim()}
              >
                {publishing ? D.publishingBtn : D.publishSubmitBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
