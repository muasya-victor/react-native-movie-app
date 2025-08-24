// apiClient.js
import axios from "axios";

// Create an axios instance
const api = axios.create({
  // baseURL: "https://your-api.com/api",
  baseURL: "https://9db0e682ca4d.ngrok-free.app/api",
  timeout: 10000,
});

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
