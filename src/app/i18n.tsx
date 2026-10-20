import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import kn from '../locales/kn.json';

export type Language = 'en' | 'hi' | 'kn';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  short: string;
}

export const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', short: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', short: 'हिं' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', short: 'ಕನ್' }
];

const translations: Record<Language, any> = {
  en,
  hi,
  kn
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  availableLanguages: LanguageInfo[];
  currentLangInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'manospring_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi' || stored === 'kn') {
        return stored as Language;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLangInfo = useMemo(() => {
    return AVAILABLE_LANGUAGES.find(l => l.code === language) || AVAILABLE_LANGUAGES[0];
  }, [language]);

  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      const keys = key.split('.');
      
      // 1. Try selected language
      let current: any = translations[language];
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      if (typeof current === 'string') {
        return current;
      }

      // 2. Try English fallback
      if (language !== 'en') {
        let enCurrent: any = translations.en;
        for (const k of keys) {
          if (enCurrent && typeof enCurrent === 'object' && k in enCurrent) {
            enCurrent = enCurrent[k];
          } else {
            enCurrent = undefined;
            break;
          }
        }
        if (typeof enCurrent === 'string') {
          return enCurrent;
        }
      }

      // 3. Fallback or key itself
      return fallback !== undefined ? fallback : key;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      availableLanguages: AVAILABLE_LANGUAGES,
      currentLangInfo
    }),
    [language, currentLangInfo, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
