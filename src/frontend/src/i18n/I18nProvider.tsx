import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { translations, supportedLocales, type Locale, type TranslationKey } from './index';

interface I18nContextValue {
  language: Locale;
  setLanguage: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'appLanguage';

// Deterministic default: Try browser preference, fallback to English
function getDefaultLanguage(): Locale {
  try {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supportedLocales.includes(stored as Locale)) {
      return stored as Locale;
    }

    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) {
      return 'pt-BR';
    }

    // Default to English
    return 'en';
  } catch {
    return 'en';
  }
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Locale>(getDefaultLanguage);

  useEffect(() => {
    // Persist language selection
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.error('Failed to persist language preference:', error);
    }
  }, [language]);

  const setLanguage = (locale: Locale) => {
    if (supportedLocales.includes(locale)) {
      setLanguageState(locale);
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const translation = translations[language][key] || translations['en'][key] || key;
    
    // Simple parameter replacement
    if (params) {
      return Object.entries(params).reduce((text, [param, value]) => {
        return text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      }, translation);
    }
    
    return translation;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18nContext() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}
