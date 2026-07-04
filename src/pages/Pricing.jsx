import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import './Pricing.css';

const tiers = [
  {
    name: 'PRO',
    price: '30',
    credits: '$200',
    features: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Szybki czas odpowiedzi'],
  },
  {
    name: 'Developer',
    price: '50',
    credits: '$320',
    badge: '⭐ Popularne',
    features: ['Reset 1. dnia mies. o 02:00', 'Dostęp do API', 'Priorytetowe wsparcie', 'Zwiększony limit RPM'],
  },
  {
    name: 'VibeCoder',
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
    name: 'Unlimited*',
    price: '250',
    credits: '∞ tokenów',
    badge: '∞ Unlimited*',
    isUltimate: true,
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
    // Przekierowanie do suppi
    window.open('https://suppi.pl/vibecraft', '_blank');
  };

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1 className="pricing-title">Plany stworzone dla <span className="text-accent">profesjonalistów</span></h1>
        <p className="pricing-subtitle">
          Płać mniej za dostęp do najwyższej jakości modeli AI do generowania kodu. Skaluj swoje serwery Minecraft bez obaw o koszty programistów.
        </p>
      </div>

      <div className="pricing-grid">
        {tiers.map((tier, index) => (
          <div key={index} className={`pricing-card glass-panel ${tier.isUltimate ? 'tier-unlimited' : ''}`}>
            {tier.badge && (
              <div className={`tier-badge ${tier.isUltimate ? 'badge-unlimited' : ''}`}>
                {tier.badge}
              </div>
            )}

            <div className="tier-header">
              <h3 className="tier-name">{tier.name}</h3>
              <div className="tier-price">
                <span className="currency">PLN</span>
                <span className="amount">{tier.price}</span>
                <span className="period">/mo</span>
              </div>
            </div>

            <div className="tier-credits">
              <span className="credits-label">OTRZYMUJESZ</span>
              <span className={`credits-value font-mono ${tier.isUltimate ? 'text-accent glow-text' : ''}`}>
                {tier.credits}
              </span>
              <span className="credits-label">kredytów</span>
            </div>

            <div className="tier-features">
              {tier.features.map((feature, fIndex) => (
                <div key={fIndex} className="feature-item">
                  <Check size={16} className={tier.isUltimate ? 'text-accent' : 'text-muted'} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              className={`btn tier-btn ${tier.isUltimate ? 'btn-accent' : 'btn-secondary'}`}
              onClick={() => setSelectedTier(tier)}
            >
              Wybierz Tier <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        ))}
      </div>

      {selectedTier && (
        <div className="pricing-modal-overlay">
          <div className="pricing-modal">
            <button className="close-modal-btn" onClick={() => setSelectedTier(null)}>
              <X size={24} />
            </button>
            <h2>Zakup planu <span className="text-accent">{selectedTier.name}</span></h2>
            <p className="modal-price">Kwota do zapłaty: <strong>{selectedTier.price} PLN</strong> / miesiąc</p>
            
            <div className="modal-form">
              <div className="input-group">
                <label>Twój adres E-mail</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="input-group">
                <label>Twój Nick (taki sam jak wpiszesz na Suppi)</label>
                <input 
                  type="text" 
                  value={suppiNick} 
                  onChange={(e) => setSuppiNick(e.target.value)} 
                  placeholder="np. Kowalski123"
                  required
                />
              </div>
            </div>

            <div className="modal-info-box">
              <p>
                <strong>Skrypt automatycznie weryfikuje wpłatę przez Suppi.</strong> Po dokonaniu wpłaty na stronie Suppi (pamiętaj o podaniu tego samego Nicku!), system zaktualizuje Twoje konto i przydzieli tokeny na cały miesiąc.
              </p>
              <p className="psc-info">
                Jeśli chcesz zapłacić przez <strong>PSC</strong> lub inną metodą, otwórz ticket na naszym serwerze Discord!
              </p>
            </div>

            <button className="btn btn-accent full-width-btn" onClick={handleCheckout}>
              Opłać przez Suppi (Przekierowanie)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pricing;
