import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { siteAPI } from '../services/api';

const defaultSettings = {
  siteName: 'Wellness_fuel',
  siteTagline: '',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 999,
  standardShippingCost: 49,
  taxRate: 18,
};

const SiteContext = createContext({
  site: null,
  settings: defaultSettings,
  loading: true,
  refetch: () => { },
});

export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSite = useCallback(async () => {
    try {
      const res = await siteAPI.getSite();
      const data = res.data?.site || {};
      setSite(data);
    } catch {
      setSite({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  // Refetch when user returns to the tab so admin changes appear without full reload
  useEffect(() => {
    const onFocus = () => fetchSite();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchSite]);

  const settings = site?.settings
    ? { ...defaultSettings, ...site.settings }
    : defaultSettings;

  return (
    <SiteContext.Provider value={{ site, settings, loading, refetch: fetchSite }}>
      {children}
    </SiteContext.Provider>
  );
};
