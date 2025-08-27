// store/withdrawalRequestStore.ts
import { create } from "zustand";
import {
  ApproveWithdrawalPayload,
  CreateWithdrawalRequestPayload,
  RejectWithdrawalPayload,
  WithdrawalRequest,
  WithdrawalRequestListResponse,
  WithdrawalRequestService,
  WithdrawalStatistics,
} from "../services/withdrawalRequestService";

interface WithdrawalRequestState {
  // Data
  myWithdrawalRequests: WithdrawalRequest[];
  managerWithdrawalRequests: WithdrawalRequestListResponse | null;
  pendingRequests: WithdrawalRequestListResponse | null;
  allRequests: WithdrawalRequestListResponse | null;
  statistics: WithdrawalStatistics | null;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  error: string | null;

  // Filters and pagination
  currentPage: number;
  selectedSiteId: number | null;
  selectedStatus: string | null;
  searchQuery: string;

  // Actions
  createWithdrawalRequest: (
    payload: CreateWithdrawalRequestPayload
  ) => Promise<void>;
  fetchMyWithdrawalRequests: () => Promise<void>;
  fetchManagerWithdrawalRequests: (params?: {
    site_id?: number;
    status?: string;
    page?: number;
  }) => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchAllRequests: (params?: {
    status?: string;
    site?: number;
    search?: string;
    page?: number;
  }) => Promise<void>;
  fetchStatistics: (params?: {
    site_id?: number;
    days?: number;
  }) => Promise<void>;

  approveWithdrawalRequest: (
    requestId: number,
    payload: ApproveWithdrawalPayload
  ) => Promise<void>;
  rejectWithdrawalRequest: (
    requestId: number,
    payload: RejectWithdrawalPayload
  ) => Promise<void>;

  // Filter and pagination actions
  setCurrentPage: (page: number) => void;
  setSelectedSiteId: (siteId: number | null) => void;
  setSelectedStatus: (status: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Utility actions
  clearError: () => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
}

export const useWithdrawalRequestStore = create<WithdrawalRequestState>()(
  (set, get) => ({
    // Initial state
    myWithdrawalRequests: [],
    managerWithdrawalRequests: null,
    pendingRequests: null,
    allRequests: null,
    statistics: null,

    isLoading: false,
    isCreating: false,
    isApproving: false,
    isRejecting: false,
    error: null,

    currentPage: 1,
    selectedSiteId: null,
    selectedStatus: null,
    searchQuery: "",

    // Actions
    createWithdrawalRequest: async (
      payload: CreateWithdrawalRequestPayload
    ) => {
      set({
        isCreating: true,
        error: null,
      });

      try {
        const newRequest =
          await WithdrawalRequestService.createWithdrawalRequest(payload);

        set((state) => ({
          myWithdrawalRequests: [newRequest, ...state.myWithdrawalRequests],
          isCreating: false,
        }));
      } catch (error: any) {
        set({
          error: error.message,
          isCreating: false,
        });
        throw error;
      }
    },

    fetchMyWithdrawalRequests: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const requests =
          await WithdrawalRequestService.getMyWithdrawalRequests();

        set({
          myWithdrawalRequests: requests,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.message,
          isLoading: false,
        });
      }
    },

    fetchManagerWithdrawalRequests: async (params) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const requests =
          await WithdrawalRequestService.getManagerWithdrawalRequests(params);

        set({
          managerWithdrawalRequests: requests,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.message,
          isLoading: false,
        });
      }
    },

    fetchPendingRequests: async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const requests =
          await WithdrawalRequestService.getPendingWithdrawalRequests();

        set({
          pendingRequests: requests,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.message,
          isLoading: false,
        });
      }
    },

    fetchAllRequests: async (params) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const requests = await WithdrawalRequestService.getWithdrawalRequests(
          params
        );

        set({
          allRequests: requests,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.message,
          isLoading: false,
        });
      }
    },

    fetchStatistics: async (params) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const stats = await WithdrawalRequestService.getWithdrawalStatistics(
          params
        );

        set({
          statistics: stats,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.message,
          isLoading: false,
        });
      }
    },

    approveWithdrawalRequest: async (
      requestId: number,
      payload: ApproveWithdrawalPayload
    ) => {
      set({
        isApproving: true,
        error: null,
      });

      try {
        await WithdrawalRequestService.approveWithdrawalRequest(
          requestId,
          payload
        );

        // Update the request status in all relevant arrays
        set((state) => {
          const updates: Partial<WithdrawalRequestState> = {
            isApproving: false,
          };

          // Update manager requests
          if (state.managerWithdrawalRequests) {
            const updatedResults = state.managerWithdrawalRequests.results.map(
              (request) =>
                request.id === requestId
                  ? {
                      ...request,
                      status: "Processed" as const,
                      approved_at: new Date().toISOString(),
                    }
                  : request
            );

            updates.managerWithdrawalRequests = {
              ...state.managerWithdrawalRequests,
              results: updatedResults,
            };
          }

          // Update pending requests (remove from pending)
          if (state.pendingRequests) {
            const filteredResults = state.pendingRequests.results.filter(
              (r) => r.id !== requestId
            );

            updates.pendingRequests = {
              ...state.pendingRequests,
              results: filteredResults,
              count: Math.max(0, state.pendingRequests.count - 1),
            };
          }

          // Update all requests
          if (state.allRequests) {
            const updatedResults = state.allRequests.results.map((request) =>
              request.id === requestId
                ? {
                    ...request,
                    status: "Processed" as const,
                    approved_at: new Date().toISOString(),
                  }
                : request
            );

            updates.allRequests = {
              ...state.allRequests,
              results: updatedResults,
            };
          }

          return updates;
        });

        // Optionally refresh statistics
        if (get().statistics) {
          await get().fetchStatistics();
        }
      } catch (error: any) {
        set({
          error: error.message,
          isApproving: false,
        });
        throw error;
      }
    },

    rejectWithdrawalRequest: async (
      requestId: number,
      payload: RejectWithdrawalPayload
    ) => {
      set({
        isRejecting: true,
        error: null,
      });

      try {
        await WithdrawalRequestService.rejectWithdrawalRequest(
          requestId,
          payload
        );

        // Update the request status in all relevant arrays
        set((state) => {
          const updates: Partial<WithdrawalRequestState> = {
            isRejecting: false,
          };

          // Update manager requests
          if (state.managerWithdrawalRequests) {
            const updatedResults = state.managerWithdrawalRequests.results.map(
              (request) =>
                request.id === requestId
                  ? {
                      ...request,
                      status: "Rejected" as const,
                      rejected_at: new Date().toISOString(),
                      rejection_reason: payload.rejection_reason,
                    }
                  : request
            );

            updates.managerWithdrawalRequests = {
              ...state.managerWithdrawalRequests,
              results: updatedResults,
            };
          }

          // Update pending requests (remove from pending)
          if (state.pendingRequests) {
            const filteredResults = state.pendingRequests.results.filter(
              (r) => r.id !== requestId
            );

            updates.pendingRequests = {
              ...state.pendingRequests,
              results: filteredResults,
              count: Math.max(0, state.pendingRequests.count - 1),
            };
          }

          // Update all requests
          if (state.allRequests) {
            const updatedResults = state.allRequests.results.map((request) =>
              request.id === requestId
                ? {
                    ...request,
                    status: "Rejected" as const,
                    rejected_at: new Date().toISOString(),
                    rejection_reason: payload.rejection_reason,
                  }
                : request
            );

            updates.allRequests = {
              ...state.allRequests,
              results: updatedResults,
            };
          }

          return updates;
        });

        // Optionally refresh statistics
        if (get().statistics) {
          await get().fetchStatistics();
        }
      } catch (error: any) {
        set({
          error: error.message,
          isRejecting: false,
        });
        throw error;
      }
    },

    // Filter and pagination actions
    setCurrentPage: (page: number) => {
      set({ currentPage: page });
    },

    setSelectedSiteId: (siteId: number | null) => {
      set({
        selectedSiteId: siteId,
        currentPage: 1, // Reset to first page when filter changes
      });
    },

    setSelectedStatus: (status: string | null) => {
      set({
        selectedStatus: status,
        currentPage: 1, // Reset to first page when filter changes
      });
    },

    setSearchQuery: (query: string) => {
      set({
        searchQuery: query,
        currentPage: 1, // Reset to first page when search changes
      });
    },

    // Utility actions
    clearError: () => {
      set({ error: null });
    },

    resetFilters: () => {
      set({
        currentPage: 1,
        selectedSiteId: null,
        selectedStatus: null,
        searchQuery: "",
      });
    },

    refreshData: async () => {
      const state = get();
      const promises: Promise<void>[] = [];

      // Refresh all currently loaded data
      if (state.myWithdrawalRequests.length > 0) {
        promises.push(state.fetchMyWithdrawalRequests());
      }

      if (state.managerWithdrawalRequests) {
        promises.push(
          state.fetchManagerWithdrawalRequests({
            site_id: state.selectedSiteId || undefined,
            status: state.selectedStatus || undefined,
            page: state.currentPage,
          })
        );
      }

      if (state.pendingRequests) {
        promises.push(state.fetchPendingRequests());
      }

      if (state.allRequests) {
        promises.push(
          state.fetchAllRequests({
            status: state.selectedStatus || undefined,
            site: state.selectedSiteId || undefined,
            search: state.searchQuery || undefined,
            page: state.currentPage,
          })
        );
      }

      if (state.statistics) {
        promises.push(
          state.fetchStatistics({
            site_id: state.selectedSiteId || undefined,
          })
        );
      }

      await Promise.allSettled(promises);
    },
  })
);

// Selectors for computed values
export const useWithdrawalRequestSelectors = () => {
  const store = useWithdrawalRequestStore();

  return {
    // Computed totals
    totalPendingAmount:
      store.pendingRequests?.results.reduce(
        (sum, request) => sum + parseFloat(request.amount),
        0
      ) || 0,

    totalMyRequestsAmount: store.myWithdrawalRequests.reduce(
      (sum, request) => sum + parseFloat(request.amount),
      0
    ),

    // Status counts
    myPendingRequestsCount: store.myWithdrawalRequests.filter(
      (r) => r.status === "Pending"
    ).length,
    myApprovedRequestsCount: store.myWithdrawalRequests.filter(
      (r) => r.status === "Approved"
    ).length,
    myRejectedRequestsCount: store.myWithdrawalRequests.filter(
      (r) => r.status === "Rejected"
    ).length,

    // Has data flags
    hasMyRequests: store.myWithdrawalRequests.length > 0,
    hasPendingRequests:
      store.pendingRequests && store.pendingRequests.results.length > 0,
    hasStatistics: !!store.statistics,

    // Loading states
    isAnyLoading:
      store.isLoading ||
      store.isCreating ||
      store.isApproving ||
      store.isRejecting,
  };
};
