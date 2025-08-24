// apiClient.js
import axios from "axios";

// Create an axios instance
const api = axios.create({
  // baseURL: "https://your-api.com/api",
  baseURL: "https://9db0e682ca4d.ngrok-free.app/api",
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    // const token = await SecureStore.getItemAsync("token"); // <-- retrieve saved token
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU2MDc0MzYwLCJpYXQiOjE3NTYwNTk5NjAsImp0aSI6IjZkZmI2OTI0ZjkyYTQ1ZDA5MTA2MDUwYjY3N2I2ODU0IiwidXNlcl9pZCI6MX0.tN9HJVkTgZBSgizALO4RuwV6zIvTazCxSWwYmBboiGc"
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
