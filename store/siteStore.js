import { create } from 'zustand';

export const useSiteStore = create((set, get) => ({
  selectedSite: null,
  setSelectedSite: (site) => set({ selectedSite: site }),
  clearSelectedSite: () => set({ selectedSite: null }),
  isLoggedIntoSite: () => get().selectedSite !== null,
}));

