// store/siteStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  siteService,
  Site,
  SiteListItem,
  SiteListResponse,
  SiteOption,
  Worker,
  AddMembersRequest,
  AddManagersRequest,
  SiteListParams,
} from "../services/siteService";

interface SiteState {
  // Primary site data
  selectedSite: Site | null;
  workers: Worker[];
  sitesList: SiteListItem[];
  siteOptions: SiteOption[];

  // Pagination data for sites list
  sitesListPagination: {
    count: number;
    next: string | null;
    previous: string | null;
    currentPage: number;
    hasMore: boolean;
  };

  // Loading states
  isLoadingSite: boolean;
  isLoadingSitesList: boolean;
  isLoadingMoreSites: boolean;
  isRefreshingSites: boolean;
  isLoadingSiteOptions: boolean;
  isAddingMembers: boolean;
  isAddingManagers: boolean;

  // Error states
  siteError: string | null;
  sitesListError: string | null;

  // Search state
  sitesSearchQuery: string;

  // Existing actions (backward compatibility)
  setSelectedSite: (site: Site | null) => void;
  clearSelectedSite: () => void;
  isLoggedIntoSite: () => boolean;

  // Site actions
  fetchCurrentSite: (forceRefresh?: boolean) => Promise<void>;
  addMembers: (siteId: number, request: AddMembersRequest) => Promise<boolean>;
  addManagers: (
    siteId: number,
    request: AddManagersRequest
  ) => Promise<boolean>;

  // Sites list actions
  fetchSitesList: (
    params?: SiteListParams,
    isRefresh?: boolean
  ) => Promise<void>;
  loadMoreSites: () => Promise<void>;
  refreshSitesList: () => Promise<void>;
  searchSites: (query: string) => Promise<void>;
  setSitesSearchQuery: (query: string) => void;

  // Site options actions
  fetchSiteOptions: () => Promise<void>;

  // Error management
  clearSiteError: () => void;
  clearSitesListError: () => void;
  clearAllErrors: () => void;

  // Data management
  clearSiteData: () => void;
  clearSitesListData: () => void;
  clearAllData: () => void;

  // Computed getters
  getActiveWorkers: () => Worker[];
  getManagersOnly: () => Worker[];
  getMembersOnly: () => Worker[];
  getWorkerById: (id: number) => Worker | undefined;
  getTotalSitesCount: () => number;
  getCurrentPage: () => number;
  getFilteredSites: () => SiteListItem[];
}

export const useSiteStore = create<SiteState>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedSite: null,
      workers: [],
      sitesList: [],
      siteOptions: [],
      sitesListPagination: {
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        hasMore: false,
      },
      isLoadingSite: false,
      isLoadingSitesList: false,
      isLoadingMoreSites: false,
      isRefreshingSites: false,
      isLoadingSiteOptions: false,
      isAddingMembers: false,
      isAddingManagers: false,
      siteError: null,
      sitesListError: null,
      sitesSearchQuery: "",

      // Existing actions (backward compatibility)
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

      // Fetch sites list with pagination and search
      fetchSitesList: async (
        params: SiteListParams = {},
        isRefresh = false
      ) => {
        // Set appropriate loading state
        if (isRefresh) {
          set({ isRefreshingSites: true, sitesListError: null });
        } else if (params.page && params.page > 1) {
          set({ isLoadingMoreSites: true, sitesListError: null });
        } else {
          set({
            isLoadingSitesList: true,
            sitesListError: null,
            sitesList: [], // Clear existing data for new search
            sitesListPagination: {
              count: 0,
              next: null,
              previous: null,
              currentPage: 1,
              hasMore: false,
            },
          });
        }

        try {
          const response = await siteService.getSites(params);

          if (response.success && response.data) {
            const { count, next, previous, results } = response.data;
            const currentPage = params.page || 1;
            console.log("Fetched sites: ***", results);
            if (isRefresh || currentPage === 1) {
              // Replace data for refresh or first page
              set({
                sitesList: results,
                sitesListPagination: {
                  count,
                  next,
                  previous,
                  currentPage,
                  hasMore: !!next,
                },
              });
            } else {
              // Append data for pagination
              const currentSites = get().sitesList;
              set({
                sitesList: [...currentSites, ...results],
                sitesListPagination: {
                  count,
                  next,
                  previous,
                  currentPage,
                  hasMore: !!next,
                },
              });
            }

            set({
              isLoadingSitesList: false,
              isRefreshingSites: false,
              isLoadingMoreSites: false,
              sitesListError: null,
            });
          } else {
            set({
              isLoadingSitesList: false,
              isRefreshingSites: false,
              isLoadingMoreSites: false,
              sitesListError:
                response.error?.message || "Failed to fetch sites",
            });
          }
        } catch (error) {
          console.error("Error in fetchSitesList:", error);
          set({
            isLoadingSitesList: false,
            isRefreshingSites: false,
            isLoadingMoreSites: false,
            sitesListError: "An unexpected error occurred while fetching sites",
          });
        }
      },

      // Load more sites (pagination)
      loadMoreSites: async () => {
        const { sitesListPagination, sitesSearchQuery } = get();

        if (!sitesListPagination.hasMore || get().isLoadingMoreSites) {
          return;
        }

        const nextPage = sitesListPagination.currentPage + 1;
        const params = siteService.createSiteListParams(
          nextPage,
          sitesSearchQuery || undefined
        );

        await get().fetchSitesList(params);
      },

      // Refresh sites list
      refreshSitesList: async () => {
        const { sitesSearchQuery } = get();
        const params = siteService.createSiteListParams(
          1,
          sitesSearchQuery || undefined
        );

        await get().fetchSitesList(params, true);
      },

      // Search sites
      searchSites: async (query: string) => {
        set({ sitesSearchQuery: query });

        const params = siteService.createSiteListParams(1, query || undefined);
        await get().fetchSitesList(params);
      },

      // Set search query without triggering search
      setSitesSearchQuery: (query: string) => {
        set({ sitesSearchQuery: query });
      },

      // Fetch site options
      fetchSiteOptions: async () => {
        set({
          isLoadingSiteOptions: true,
          siteError: null,
        });

        try {
          const response = await siteService.getSiteOptions();

          if (response.success && response.data) {
            set({
              siteOptions: response.data,
              isLoadingSiteOptions: false,
              siteError: null,
            });
          } else {
            set({
              isLoadingSiteOptions: false,
              siteError:
                response.error?.message || "Failed to fetch site options",
            });
          }
        } catch (error) {
          console.error("Error in fetchSiteOptions:", error);
          set({
            isLoadingSiteOptions: false,
            siteError:
              "An unexpected error occurred while fetching site options",
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

      // Error management
      clearSiteError: () => set({ siteError: null }),

      clearSitesListError: () => set({ sitesListError: null }),

      clearAllErrors: () =>
        set({
          siteError: null,
          sitesListError: null,
        }),

      // Data management
      clearSiteData: () =>
        set({
          selectedSite: null,
          workers: [],
          siteError: null,
        }),

      clearSitesListData: () =>
        set({
          sitesList: [],
          sitesListPagination: {
            count: 0,
            next: null,
            previous: null,
            currentPage: 1,
            hasMore: false,
          },
          sitesSearchQuery: "",
          sitesListError: null,
        }),

      clearAllData: () =>
        set({
          selectedSite: null,
          workers: [],
          sitesList: [],
          siteOptions: [],
          sitesListPagination: {
            count: 0,
            next: null,
            previous: null,
            currentPage: 1,
            hasMore: false,
          },
          sitesSearchQuery: "",
          siteError: null,
          sitesListError: null,
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

      getTotalSitesCount: () => {
        return get().sitesListPagination.count;
      },

      getCurrentPage: () => {
        return get().sitesListPagination.currentPage;
      },

      getFilteredSites: () => {
        const { sitesList, sitesSearchQuery } = get();

        if (!sitesSearchQuery.trim()) {
          return sitesList;
        }

        const query = sitesSearchQuery.toLowerCase().trim();
        return sitesList.filter(
          (site) =>
            site.name.toLowerCase().includes(query) ||
            site.location.toLowerCase().includes(query)
        );
      },
    }),
    {
      name: "site-store",
    }
  )
);
