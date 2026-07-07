import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../LangContext';
import './Pricing.css';

const PLN_TO_USD = 0.25;

const tiersData = [
  {
    name: 'Basic',
    pricePLN: 30,
    credits: '$200',
    featuresPL: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Szybki czas odpowiedzi'],
    featuresEN: ['Resets 1st of month at 02:00', 'API access', 'Fast response time'],
  },
  {
    name: 'Pro',
    pricePLN: 50,
    credits: '$320',
    badgePL: '⭐ Popularne',
    badgeEN: '⭐ Popular',
    isPopular: true,
    featuresPL: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Priorytetowe wsparcie', 'Zwiększony limit RPM'],
    featuresEN: ['Resets 1st of month at 02:00', 'API access', 'Priority support', 'Increased RPM limit'],
  },
  {
    name: 'Elite',
    pricePLN: 100,
    credits: '$600',
    badgePL: '★ Najlepsza wartość',
    badgeEN: '★ Best value',
    featuresPL: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Dostęp do modeli Alpha', 'Wsparcie na Discordzie'],
    featuresEN: ['Resets 1st of month at 02:00', 'API access', 'Alpha model access', 'Discord support'],
  },
  {
    name: 'Ultimate',
    pricePLN: 150,
    credits: '$900',
    featuresPL: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Dedykowany serwer', 'Brak limitu RPM'],
    featuresEN: ['Resets 1st of month at 02:00', 'API access', 'Dedicated server', 'No RPM limit'],
  },
  {
    name: 'Unlimited+',
    pricePLN: 250,
    credits: '∞ tokens',
    badgePL: '∞ Unlimited+',
    badgeEN: '∞ Unlimited+',
    featuresPL: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Fair Use Unlimited', 'Najwyższy priorytet SLA'],
    featuresEN: ['Resets 1st of month at 02:00', 'API access', 'Fair Use Unlimited', 'Highest SLA priority'],
  },
];

function Pricing() {
  const { lang } = useLang();
  const isEN = lang === 'en';

  const [selectedTier, setSelectedTier] = useState(null);
  const [email, setEmail] = useState('');
  const [suppiNick, setSuppiNick] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatPrice = (pricePLN) => {
    if (isEN) return `$${Math.round(pricePLN * PLN_TO_USD)}`;
    return `${pricePLN}`;
  };

  const currency = isEN ? '' : 'PLN';
  const period = isEN ? '/mo.' : '/mies.';

  const handleCheckout = async () => {
    if (!email || !suppiNick) {
      alert(isEN ? 'Please fill in all fields!' : 'Proszę wypełnić wszystkie pola!');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const hasDiscord = currentUser?.identities?.some(id => id.provider === 'discord') || !!currentUser?.user_metadata?.discord_profile;
      if (!hasDiscord) {
        alert(isEN
          ? 'To make a purchase, please connect your Discord account in Settings!'
          : 'Aby dokonać zakupu, musisz połączyć swoje konto z Discordem w zakładce Ustawienia!');
        return;
      }

      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const now = new Date();
      const validUntilDate = new Date(now);
      validUntilDate.setMonth(validUntilDate.getMonth() + 1);
      const validUntil = validUntilDate.toISOString().split('T')[0];

      const newOrder = {
        orderId,
        planName: selectedTier.name,
        price: selectedTier.pricePLN,
        creditsLabel: selectedTier.credits,
        suppiNick: suppiNick.trim(),
        status: 'pending',
        createdAt: now.toISOString(),
        validUntil,
        discordId: currentUser?.user_metadata?.discord_profile?.id || currentUser?.identities?.find(id => id.provider === 'discord')?.id || null,
        discordTag: currentUser?.user_metadata?.discord_profile?.username || null,
      };

      const profileKey = `__user_profile:${currentUser.email}__`;
      const { data: profs } = await supabase
        .from('projects')
        .select('*')
        .eq('title', profileKey);

      if (profs && profs.length > 0) {
        const record = profs[0];
        const pData = record.messages || {};
        await supabase
          .from('projects')
          .update({ messages: { ...pData, pending_orders: [...(pData.pending_orders || []), newOrder] } })
          .eq('id', record.id);
      } else {
        await supabase.from('projects').insert([{
          user_id: currentUser.id,
          title: profileKey,
          messages: { email: currentUser.email, pending_orders: [newOrder] },
        }]);
      }

      const priceDisplay = isEN
        ? `$${Math.round(selectedTier.pricePLN * PLN_TO_USD)}`
        : `${selectedTier.pricePLN} zł`;

      alert(isEN
        ? `Order placed! ID: ${orderId}\n\nPay ${priceDisplay} on https://suppi.pl/zenexcode using nick: ${suppiNick}\n\nSuppi will open now. The system will detect your payment in real time and activate the plan instantly!`
        : `Zamówienie złożone! Nr: ${orderId}\n\nWpłać ${selectedTier.pricePLN} zł na https://suppi.pl/zenexcode używając nicku: ${suppiNick}\n\nZa chwilę otworzy się strona Suppi. System automatycznie wykryje Twoją wpłatę w czasie rzeczywistym i w ułamku sekundy aktywuje pakiet na koncie!`);

      window.open('https://suppi.pl/zenexcode', '_blank');
      setSelectedTier(null);
      setSuppiNick('');
      setEmail('');
    } catch (e) {
      console.error(e);
      alert(isEN ? 'An unexpected error occurred while placing the order.' : 'Wystąpił nieoczekiwany błąd podczas składania zamówienia.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="claude-pricing-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>
          {isEN ? 'Choose a plan' : 'Wybierz plan'}
        </h2>
        <p style={{ color: 'var(--accent)', fontWeight: '600', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          {isEN
            ? 'Note: This is NOT a subscription. You buy a one-time package valid for 1 month.'
            : 'Uwaga: To NIE jest subskrypcja. Kupujesz jednorazowy pakiet ważny przez 1 miesiąc.'}
        </p>
        {isEN && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
            Prices shown in USD (approx.). Payment is processed in PLN via Suppi.
          </p>
        )}
      </div>

      <div className="claude-pricing-grid">
        {tiersData.map((tier, index) => {
          const badge = isEN ? tier.badgeEN : tier.badgePL;
          const features = isEN ? tier.featuresEN : tier.featuresPL;
          return (
            <div key={index} className={`claude-pricing-card ${tier.isPopular ? 'popular' : ''}`}>
              {badge && <div className="claude-badge">{badge}</div>}

              <h3 className="claude-tier-name">{tier.name}</h3>

              <div className="claude-tier-price">
                {formatPrice(tier.pricePLN)}{' '}
                {currency && <span className="currency">{currency}</span>}
                <span className="period">{period}</span>
              </div>

              <div className="claude-tier-credits">
                <span className="claude-credits-val">{tier.credits}</span>
                <span className="claude-credits-label">
                  {isEN ? 'for code generation' : 'na generowanie kodu'}
                </span>
              </div>

              <ul className="claude-feature-list">
                {features.map((feature, fIndex) => (
                  <li key={fIndex} className="claude-feature-item">
                    <Check size={18} className="claude-feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="claude-pricing-btn" onClick={() => setSelectedTier(tier)}>
                {isEN ? 'Choose plan' : 'Wybierz plan'}
              </button>
            </div>
          );
        })}
      </div>

      {selectedTier && (
        <div className="claude-modal-overlay">
          <div className="claude-modal-content">
            <button className="claude-modal-close" onClick={() => setSelectedTier(null)}>
              <X size={24} />
            </button>

            <h2 className="claude-modal-title">
              {isEN ? 'Subscribe:' : 'Subskrypcja:'} {selectedTier.name}
            </h2>

            <input
              type="email"
              placeholder={isEN ? 'Your e-mail address' : 'Twój adres E-mail'}
              className="claude-modal-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder={isEN ? 'Your Suppi nickname (for verification)' : 'Twój nick na suppi (do weryfikacji)'}
              className="claude-modal-input"
              value={suppiNick}
              onChange={(e) => setSuppiNick(e.target.value)}
            />

            <div className="claude-modal-warning" style={{ backgroundColor: 'rgba(224, 122, 95, 0.08)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              {isEN
                ? <><strong>⚠️ Important!</strong> Enter the <u>exact same nickname and e-mail</u> you will use when paying on Suppi. That is how we link the plan to your account.</>
                : <><strong>⚠️ Ważne!</strong> Podaj tutaj <u>dokładnie taki sam Nick oraz E-mail</u>, jakiego użyjesz przy płatności na portalu Suppi! Tylko na tej podstawie przypiszemy pakiet do Twojego konta.</>}
            </div>

            <button className="claude-checkout-btn" onClick={handleCheckout} disabled={submitting}>
              {submitting
                ? (isEN ? 'Processing...' : 'Przetwarzanie...')
                : isEN
                  ? `Proceed to payment ($${Math.round(selectedTier.pricePLN * PLN_TO_USD)})`
                  : `Przejdź do płatności (${selectedTier.pricePLN} PLN)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pricing;
