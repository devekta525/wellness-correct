import axios from "axios";
import { getApiV1BaseUrl } from "./api";
import { clearAuthData } from "./auth";

const axiosInstance = axios.create({
  baseURL: getApiV1BaseUrl(),
  withCredentials: true,
});

// Request interceptor to attach token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // Check if we are in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is an authorization failure (401 or 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("Unauthorized! Clearing session and logging out.");
      clearAuthData();
      
      // Redirect safely to login if running in browser
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
