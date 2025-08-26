// apiClient.js
import axios from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: process.env.API_BASE_URL || "http://192.168.100.70:8000/api",
  timeout: Number(process.env.API_TIMEOUT) || 10000,
});

api.interceptors.request.use(
  async (config) => {
    // const token = await SecureStore.getItemAsync("token"); // <-- retrieve saved token
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU2MTU0Nzk2LCJpYXQiOjE3NTYxNDAzOTYsImp0aSI6ImYwYjk0NDExNDkzNTRkYjdhOTNlMzg0ZjI3YjM2NzFkIiwidXNlcl9pZCI6N30.eDD9a2c6nIMD5Eti0G9nEgpB6YtMkn02IhcasyQ3vLw"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}
