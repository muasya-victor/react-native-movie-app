// apiClient.js
import axios from "axios";

// Create an axios instance
const api = axios.create({
  // baseURL: "https://your-api.com/api",
  baseURL: "http://192.168.1.203:8000/api",
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    // const token = await SecureStore.getItemAsync("token"); // <-- retrieve saved token
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU2MTI4NTU5LCJpYXQiOjE3NTYxMTQxNTksImp0aSI6ImY4ZTIzYTY5MjZmYTQ0ODc5OWY3NmFmNWQ5YTk2YmM5IiwidXNlcl9pZCI6MX0.2Ubjx7WtHbOu9wWHsTBkjkYUhMGNfSqHhSJiM9KRyt0"
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
