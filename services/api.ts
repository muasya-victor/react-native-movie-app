// apiClient.js
import axios from "axios";

// Create an axios instance
const api = axios.create({
  // baseURL: "https://your-api.com/api",
  baseURL: "https://59088ac56d5d.ngrok-free.app/api",
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    // const token = await SecureStore.getItemAsync("token"); // <-- retrieve saved token
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU2MDc2NTgyLCJpYXQiOjE3NTYwNjIxODIsImp0aSI6IjAwNmJiODI1NDIwNDQyZmFiM2FmYzI0NTEwYzI5YjMxIiwidXNlcl9pZCI6MX0.0ftbOoLli3It1fuB_gjhfaMokPcNHg6rDChaHEryg2o"
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

    console.log(data, 'data');
    

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
