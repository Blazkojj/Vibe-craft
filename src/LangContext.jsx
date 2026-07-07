import { useState, useEffect, createContext, useContext } from 'react';
import { translations } from './i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('vc_lang') || 'pl');

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem('vc_lang', l);
  };

  const t = translations[lang] || translations['pl'];

  return (
    <LangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
