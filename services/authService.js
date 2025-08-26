// services/authService.js
import { apiRequest } from './api';

export const authService = {
  // Login with phone number and password
  login: async (phoneNumber, password) => {
    try {
      const response = await apiRequest('POST', 'users/token/', {
        phone_number: phoneNumber,
        password: password
      });

      return response;
    } catch (error) {
      console.error('Auth service login error:', error);
      throw error;
    }
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      const response = await apiRequest('GET', 'users/users/get-current-user/');
      return response;
    } catch (error) {
      console.error('Auth service get current user error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiRequest('POST', 'users/token/refresh/', {
        refresh: refreshToken
      });
      return response;
    } catch (error) {
      console.error('Auth service refresh token error:', error);
      throw error;
    }
  },

  // Logout (if you have an endpoint for it)
  logout: async () => {
    try {
      const response = await apiRequest('POST', 'users/logout/');
      return response;
    } catch (error) {
      console.error('Auth service logout error:', error);
      throw error;
    }
  }
};