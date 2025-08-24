// contexts/SiteContext.js
import React, { createContext, useContext, useState } from 'react';

const SiteContext = createContext();

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteContext must be used within a SiteProvider');
  }
  return context;
};

export const SiteProvider = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteHistory, setSiteHistory] = useState([]);

  const selectSite = (site) => {
    setSelectedSite(site);
    
    // Add to history if not already the most recent
    setSiteHistory(prevHistory => {
      const filteredHistory = prevHistory.filter(s => s.id !== site.id);
      return [site, ...filteredHistory].slice(0, 5); // Keep last 5 sites
    });
  };

  const clearSelectedSite = () => {
    setSelectedSite(null);
  };

  const getRecentSites = () => {
    return siteHistory;
  };

  const value = {
    selectedSite,
    selectSite,
    clearSelectedSite,
    getRecentSites,
    siteHistory
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};