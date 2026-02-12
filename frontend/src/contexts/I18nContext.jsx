import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import mk from '../i18n/mk.json';
import en from '../i18n/en.json';
import al from '../i18n/al.json';

const dictionaries = { mk, en, al };

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState('mk');

  useEffect(() => {
    const saved = localStorage.getItem('lang');
    if (saved && dictionaries[saved]) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = useMemo(() => {
    const dict = dictionaries[lang] || dictionaries.mk;
    return (key, fallback) => {
      const parts = key.split('.');
      let cur = dict;
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur) {
          cur = cur[p];
        } else {
          return fallback !== undefined ? fallback : key;
        }
      }
      return cur !== undefined ? cur : fallback !== undefined ? fallback : key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  return useContext(I18nContext);
};
