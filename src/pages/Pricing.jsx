import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import './Pricing.css';

const tiers = [
  {
    name: 'Basic',
    price: '30',
    credits: '$200',
    features: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Szybki czas odpowiedzi'],
  },
  {
    name: 'Pro',
    price: '50',
    credits: '$320',
    badge: '⭐ Popularne',
    isPopular: true,
    features: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Priorytetowe wsparcie', 'Zwiększony limit RPM'],
  },
  {
    name: 'Elite',
    price: '100',
    credits: '$600',
    badge: '★ Najlepsza wartość',
    features: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Dostęp do modeli Alpha', 'Wsparcie na Discordzie'],
  },
  {
    name: 'Ultimate',
    price: '150',
    credits: '$900',
    features: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Dedykowany serwer', 'Brak limitu RPM'],
  },
  {
    name: 'Unlimited+',
    price: '250',
    credits: '∞ tokenów',
    badge: '∞ Unlimited+',
    features: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Fair Use Unlimited', 'Najwyższy priorytet SLA'],
  }
];

function Pricing() {
  const [selectedTier, setSelectedTier] = useState(null);
  const [email, setEmail] = useState('');
  const [suppiNick, setSuppiNick] = useState('');

  const handleCheckout = () => {
    if (!email || !suppiNick) {
      alert("Proszę wypełnić wszystkie pola!");
      return;
    }
    window.open('https://suppi.pl/zenexcode', '_blank');
  };

  return (
    <div className="claude-pricing-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>Wybierz plan</h2>
        <p style={{ color: 'var(--accent)', fontWeight: '600', marginTop: '0.5rem', fontSize: '0.9rem' }}>Uwaga: To NIE jest subskrypcja. Kupujesz jednorazowy pakiet ważny przez 1 miesiąc.</p>
      </div>
      <div className="claude-pricing-grid">
        {tiers.map((tier, index) => (
          <div key={index} className={`claude-pricing-card ${tier.isPopular ? 'popular' : ''}`}>
            {tier.badge && (
              <div className="claude-badge">
                {tier.badge}
              </div>
            )}

            <h3 className="claude-tier-name">{tier.name}</h3>
            
            <div className="claude-tier-price">
              {tier.price} <span className="currency">PLN</span><span className="period">/mies.</span>
            </div>

            <div className="claude-tier-credits">
              <span className="claude-credits-val">{tier.credits}</span>
              <span className="claude-credits-label">na generowanie kodu</span>
            </div>

            <ul className="claude-feature-list">
              {tier.features.map((feature, fIndex) => (
                <li key={fIndex} className="claude-feature-item">
                  <Check size={18} className="claude-feature-icon" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              className="claude-pricing-btn"
              onClick={() => setSelectedTier(tier)}
            >
              Wybierz plan
            </button>
          </div>
        ))}
      </div>

      {selectedTier && (
        <div className="claude-modal-overlay">
          <div className="claude-modal-content">
            <button className="claude-modal-close" onClick={() => setSelectedTier(null)}>
              <X size={24} />
            </button>
            
            <h2 className="claude-modal-title">Subskrypcja: {selectedTier.name}</h2>
            
            <input 
              type="email" 
              placeholder="Twój adres E-mail"
              className="claude-modal-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <input 
              type="text" 
              placeholder="Twój nick na suppi (do weryfikacji)"
              className="claude-modal-input"
              value={suppiNick}
              onChange={(e) => setSuppiNick(e.target.value)}
            />

            <div className="claude-modal-warning" style={{ backgroundColor: 'rgba(224, 122, 95, 0.08)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              <strong>⚠️ Ważne!</strong> Podaj tutaj <u>dokładnie taki sam Nick oraz E-mail</u>, jakiego użyjesz przy płatności na portalu Suppi! Tylko na tej podstawie przypiszemy pakiet do Twojego konta.
            </div>
            
            <button className="claude-checkout-btn" onClick={handleCheckout}>
              Przejdź do płatności ({selectedTier.price} PLN)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pricing;
