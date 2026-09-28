'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './en';
import mr from './mr';
import type { TranslationKeys } from './en';

type Language = 'en' | 'mr';

interface LanguageContextType {
  lang: Language;
  t: TranslationKeys;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const translations: Record<Language, TranslationKeys> = { en, mr };

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: en,
  setLang: () => {},
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('popto_lang') as Language | null;
    if (stored && (stored === 'en' || stored === 'mr')) {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('popto_lang', newLang);
    document.documentElement.lang = newLang;
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'mr' : 'en');
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export default LanguageContext;
