import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try { 
        return JSON.parse(saved).language || 'English'; 
      } catch (e) {}
    }
    return 'English';
  });

  const isRTL = language === 'Urdu';

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    const saved = localStorage.getItem('userSettings') || '{}';
    try {
      const parsed = JSON.parse(saved);
      parsed.language = newLang;
      localStorage.setItem('userSettings', JSON.stringify(parsed));
    } catch (e) {
      localStorage.setItem('userSettings', JSON.stringify({ language: newLang }));
    }
    // Update document direction
    document.documentElement.dir = newLang === 'Urdu' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang === 'Urdu' ? 'ur' : 'en';
  };

  useEffect(() => {
    // Initial dir set
    document.documentElement.dir = language === 'Urdu' ? 'rtl' : 'ltr';
    document.documentElement.lang = language === 'Urdu' ? 'ur' : 'en';

    const handleStorageChange = () => {
      const saved = localStorage.getItem('userSettings');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (parsed.language && parsed.language !== language) {
            setLanguage(parsed.language);
            document.documentElement.dir = parsed.language === 'Urdu' ? 'rtl' : 'ltr';
          }
        } catch (e) {}
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);

  const t = (key) => {
    if (!translations[language]) return key;
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
