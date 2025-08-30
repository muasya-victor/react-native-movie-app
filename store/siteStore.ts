import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  siteService,
  Site,
  Worker,
  AddMembersRequest,
  AddManagersRequest,
} from "../services/siteService";

interface SiteState {
  // Primary site data
  selectedSite: Site | null;
  workers: Worker[];
  sites: Site[]; // Added to store all sites
  
  // Loading states
  isLoadingSite: boolean;
  isAddingMembers: boolean;
  isAddingManagers: boolean;
  isLoading: boolean; // Added for fetchSites loading state

  // Error states
  siteError: string | null;
  error: string | null;

  setSelectedSite: (site: Site | null) => void;
  clearSelectedSite: () => void;
  isLoggedIntoSite: () => boolean;

  // New actions
  fetchCurrentSite: (forceRefresh?: boolean) => Promise<void>;
  addMembers: (siteId: number, request: AddMembersRequest) => Promise<boolean>;
  addManagers: (
    siteId: number,
    request: AddManagersRequest
  ) => Promise<boolean>;
  clearSiteError: () => void;
  clearSiteData: () => void;
  fetchSites: () => Promise<void>; // Added new action to fetch all sites

  // Computed getters
  getActiveWorkers: () => Worker[];
  getManagersOnly: () => Worker[];
  getMembersOnly: () => Worker[];
  getWorkerById: (id: number) => Worker | undefined;
}

export const useSiteStore = create<SiteState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedSite: null,
      workers: [],
      sites: [], // Initialize the new sites array
      isLoadingSite: false,
      isAddingMembers: false,
      isAddingManagers: false,
      isLoading: false, // Initialize new loading state
      siteError: null,
      error: null, // Initialize new error state

      // Existing actions (backward compatibility)
      fetchSites: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await siteService.getSites();
          
          if (response.success && response.data) {
            set({ 
              sites: response.data,
              isLoading: false,
              error: null 
            });
          } else {
            set({ 
              isLoading: false,
              error: response.error?.message || 'Failed to fetch sites'
            });
          }
        } catch (error) {
          console.error('Error in fetchSites:', error);
          set({ 
            isLoading: false,
            error: 'An unexpected error occurred while fetching sites'
          });
        }
      },
      setSelectedSite: (site) => {
        set({ selectedSite: site });

        // Auto-populate workers when a site is selected
        if (site && (site.members || site.managers)) {
          const workers = siteService.transformSiteDataToWorkers(site);
          set({ workers });
        } else if (!site) {
          set({ workers: [] });
        }
      },

      clearSelectedSite: () => {
        set({
          selectedSite: null,
          workers: [],
        });
      },

      isLoggedIntoSite: () => get().selectedSite !== null,

      // Fetch current site from API and store it as selectedSite
      fetchCurrentSite: async (forceRefresh = false) => {
        set({
          isLoadingSite: true,
          siteError: null,
        });

        try {
          const response = await siteService.getCurrentSite();

          if (response.success && response.data) {
            set({
              selectedSite: response.data,
              isLoadingSite: false,
              siteError: null,
            });

            // Auto-populate workers from the fetched site data
            const workers = siteService.transformSiteDataToWorkers(
              response.data
            );
            set({ workers });
          } else {
            set({
              isLoadingSite: false,
              siteError: response.error?.message || "Failed to fetch site data",
            });
          }
        } catch (error) {
          console.error("Error in fetchCurrentSite:", error);
          set({
            isLoadingSite: false,
            siteError: "An unexpected error occurred while fetching site data",
          });
        }
      },

      // Add members to current site
      addMembers: async (siteId: number, request: AddMembersRequest) => {
        set({ isAddingMembers: true, siteError: null });

        try {
          const response = await siteService.addMembers(siteId, request);

          if (response.success) {
            // Refresh site data after successful addition
            await get().fetchCurrentSite(true);
            set({ isAddingMembers: false });
            return true;
          } else {
            set({
              isAddingMembers: false,
              siteError: response.error?.message || "Failed to add members",
            });
            return false;
          }
        } catch (error) {
          console.error("Error adding members:", error);
          set({
            isAddingMembers: false,
            siteError: "An unexpected error occurred while adding members",
          });
          return false;
        }
      },

      // Add managers to current site
      addManagers: async (siteId: number, request: AddManagersRequest) => {
        set({ isAddingManagers: true, siteError: null });

        try {
          const response = await siteService.addManagers(siteId, request);

          if (response.success) {
            // Refresh site data after successful addition
            await get().fetchCurrentSite(true);
            set({ isAddingManagers: false });
            return true;
          } else {
            set({
              isAddingManagers: false,
              siteError: response.error?.message || "Failed to add managers",
            });
            return false;
          }
        } catch (error) {
          console.error("Error adding managers:", error);
          set({
            isAddingManagers: false,
            siteError: "An unexpected error occurred while adding managers",
          });
          return false;
        }
      },

      // Clear error
      clearSiteError: () => set({ siteError: null }),

      // Clear all data
      clearSiteData: () =>
        set({
          selectedSite: null,
          workers: [],
          siteError: null,
        }),

      // Computed getters
      getActiveWorkers: () => {
        return get().workers.filter((worker) => worker.status === "Active");
      },

      getManagersOnly: () => {
        return get().workers.filter((worker) => worker.role === "Manager");
      },

      getMembersOnly: () => {
        return get().workers.filter((worker) => worker.role === "Member");
      },

      getWorkerById: (id: number) => {
        return get().workers.find((worker) => worker.id === id);
      },
    }),
    {
      name: "site-store",
    }
  )
);
