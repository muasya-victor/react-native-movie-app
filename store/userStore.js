import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Login flow state
      phoneNumber: '',

      // Actions
      setPhoneNumber: (phoneNumber) => {
        set({ phoneNumber });
      },

      setUser: (userData) => {
        set({
          user: userData,
          isAuthenticated: true,
          error: null,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (updatedData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updatedData },
          });
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          phoneNumber: '',
        });
      },

      // Helper functions
      getFullName: () => {
        const user = get().user;
        if (!user) return '';
        return `${user.first_name || ''} ${user.last_name || ''}`.trim();
      },

      getUserType: () => {
        const user = get().user;
        return user?.user_type || null;
      },

      isWageWorker: () => {
        return get().getUserType() === 'WageWorker';
      },

      isSiteManager: () => {
        return get().getUserType() === 'SiteManager';
      },

      isSystemAdmin: () => {
        return get().getUserType() === 'SystemAdmin';
      },

      // Phone number validation
      isValidPhoneNumber: () => {
        const phoneNumber = get().phoneNumber;
        // Basic validation - at least 9 digits
        const phoneRegex = /^\+?[1-9]\d{8,14}$/;
        return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
      },
    }),
    { 
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);