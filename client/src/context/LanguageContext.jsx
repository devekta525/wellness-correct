import { createContext, useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const translations = {
  en: {
    home: 'Home',
    products: 'Products',
    blog: 'Blog',
    consult: 'Consult',
    science: 'Science',
    aboutUs: 'About Us',
    contact: 'Contact',
    login: 'Login',
    signUp: 'Sign Up',
    search: 'Search',
    cart: 'Cart',
    wishlist: 'Wishlist',
    profile: 'Profile',
    myOrders: 'My Orders',
    settings: 'Settings',
    signOut: 'Sign Out',
    quickLinks: 'Quick Links',
    customerService: 'Customer Service',
    followUs: 'Follow Us',
    dashboard: 'Dashboard',
    adminPanel: 'Admin Panel',
  },
  hi: {
    home: 'होम',
    products: 'उत्पाद',
    blog: 'ब्लॉग',
    consult: 'परामर्श',
    science: 'विज्ञान',
    aboutUs: 'हमारे बारे में',
    contact: 'संपर्क',
    login: 'लॉग इन',
    signUp: 'साइन अप',
    search: 'खोज',
    cart: 'कार्ट',
    wishlist: 'विशलिस्ट',
    profile: 'प्रोफ़ाइल',
    myOrders: 'मेरे ऑर्डर',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    quickLinks: 'त्वरित लिंक',
    customerService: 'ग्राहक सेवा',
    followUs: 'हमें फॉलो करें',
    dashboard: 'डैशबोर्ड',
    adminPanel: 'एडमिन पैनल',
  },
  ta: {
    home: 'முகப்பு',
    products: 'பொருட்கள்',
    blog: 'ப்ளாக்',
    consult: 'ஆலோசனை',
    science: 'அறிவியல்',
    aboutUs: 'எங்களைப் பற்றி',
    contact: 'தொடர்பு',
    login: 'உள்நுழை',
    signUp: 'பதிவு',
    search: 'தேடல்',
    cart: 'கார்ட்',
    wishlist: 'விருப்ப பட்டியல்',
    profile: 'சுயவிவரம்',
    myOrders: 'என் ஆர்டர்கள்',
    settings: 'அமைப்புகள்',
    signOut: 'வெளியேறு',
    quickLinks: 'விரைவு இணைப்புகள்',
    customerService: 'வாடிக்கையாளர் சேவை',
    followUs: 'எங்களைப் பின்தொடரவும்',
    dashboard: 'டாஷ்போர்டு',
    adminPanel: 'நிர்வாக குழு',
  },
  te: {
    home: 'హోమ్',
    products: 'ఉత్పత్తులు',
    blog: 'బ్లాగ్',
    consult: 'సంప్రదించండి',
    science: 'సైన్స్',
    aboutUs: 'మా గురించి',
    contact: 'సంప్రదించండి',
    login: 'లాగిన్',
    signUp: 'సైన్ అప్',
    search: 'వెతకండి',
    cart: 'కార్ట్',
    wishlist: 'విష్ లిస్ట్',
    profile: 'ప్రొఫైల్',
    myOrders: 'నా ఆర్డర్లు',
    settings: 'సెట్టింగ్‌లు',
    signOut: 'సైన్ అవుట్',
    quickLinks: 'త్వరిత లింకులు',
    customerService: 'కస్టమర్ సర్వీస్',
    followUs: 'మమ్మల్ని ఫాలో చేయండి',
    dashboard: 'డాష్‌బోర్డ్',
    adminPanel: 'అడ్మిన్ ప్యానెల్',
  },
};

const LanguageContext = createContext({ lang: 'en', t: (key) => key });

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const userLang = useSelector((s) => s.auth?.user?.language);
  const lang = userLang && translations[userLang] ? userLang : 'en';

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : (lang === 'hi' ? 'hi' : (lang === 'ta' ? 'ta' : (lang === 'te' ? 'te' : 'en')));
  }, [lang]);

  const t = useMemo(() => {
    const map = translations[lang] || translations.en;
    return (key) => map[key] || translations.en[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ lang, t }), [lang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
