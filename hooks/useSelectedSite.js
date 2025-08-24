// hooks/useSelectedSite.js
import { useSiteContext } from '@/contexts/SiteContext';

export const useSelectedSite = () => {
  const { selectedSite, selectSite, clearSelectedSite, getRecentSites } = useSiteContext();

  return {
    // Current selected site
    selectedSite,
    
    // Actions
    selectSite,
    clearSelectedSite,
    
    // Helper functions
    isLoggedIntoSite: () => selectedSite !== null,
    getSiteName: () => selectedSite?.name || 'No Site Selected',
    getSiteId: () => selectedSite?.id || null,
    getSiteManager: () => selectedSite?.manager || 'Unknown',
    getWorkerCount: () => selectedSite?.workers || 0,
    getSiteStatus: () => selectedSite?.status || 'Unknown',
    getSiteType: () => selectedSite?.type || 'Unknown',
    getSiteAddress: () => selectedSite?.address || 'No Address',
    
    // Recent sites
    getRecentSites,
  };
};