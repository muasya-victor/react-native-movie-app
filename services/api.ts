// services/api.js
import axios from "axios";
import { useRouter } from "expo-router";
import { useUserStore } from "../store/userStore";
import { handleErrorWithToast } from "../utils/errorHandler";
const router = useRouter();

// Create an axios instance
const api = axios.create({
  // baseURL: process.env.API_BASE_URL || "http://167.86.92.49:8000/api",
  baseURL: "http://localhost:8000/api",
  timeout: Number(process.env.API_TIMEOUT) || 10000,
});

console.log(api.defaults.baseURL);

// Function to get the current token from store
const getTokenFromStore = () => {
  try {
    const store = useUserStore.getState();
    return store.accessToken;
  } catch (error) {
    console.warn("Could not access user store:", error);
    return null;
  }
};

// Function to handle token refresh
const refreshAccessToken = async () => {
  try {
    const store = useUserStore.getState();
    const refreshToken = store.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${api.defaults.baseURL}/users/token/refresh/`,
      { refresh: refreshToken },
      { timeout: 10000 }
    );

    const { access } = response.data;

    // Update the store with new access token
    store.setTokens(access, refreshToken);

    return access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    router.replace("/login");

    // If refresh fails, logout user
    const store = useUserStore.getState();
    store.logout();

    throw error;
  }
};

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = getTokenFromStore();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        // console.log();

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed, redirecting to login");

        // Handle logout/redirect logic here if needed
        // For React Native with Expo Router, you might want to:
        // router.replace('/login');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Universal API function
export async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
      headers,
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.log("Full error object:", error.config?.url);
    console.error(`API Request Error [${method} ${endpoint}]:`, error);

    // Use standardized error for consistent error handling
    const standardizedError = handleErrorWithToast(error);

    return {
      success: false,
      error: standardizedError,
      status: standardizedError.status,
    };
  }
}

// Specific API functions that don't require authentication
export async function apiRequestNoAuth(
  method,
  endpoint,
  data = null,
  headers = {}
) {
  try {
    const response = await axios.request({
      method,
      url: `${api.defaults.baseURL}/${endpoint}`,
      data,
      headers,
      timeout: 10000,
    });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error(
      `API Request (No Auth) Error [${method} ${endpoint}]:`,
      error
    );

    // Use standardized error for consistent error handling
    const standardizedError = handleErrorWithToast(error);

    return {
      success: false,
      error: standardizedError,
      status: standardizedError.status,
    };
  }
}
