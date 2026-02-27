import axios from "axios";

/**
 * Create a new Axios instance with a custom configuration.
 * This instance will be used for all API calls throughout the application.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Important for cookie-based authentication
});

/**
 * Axios Request Interceptor
 * This function will be called before every request is sent.
 * It retrieves the token from localStorage and attaches it to the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    // Check if running in a browser environment
    if (typeof window !== "undefined") {
      // Retrieve token from localStorage, checking both possible keys
      let token = localStorage.getItem("authToken") || localStorage.getItem("token");

      if (token) {
        // Common issue: token might be stored with extra quotes. This removes them.
        token = token.replace(/^"|"$/g, "");
        
        // Set the Authorization header for the request
        config.headers["Authorization"] = `Bearer ${token}`;
        console.log("🔑 Interceptor: Attaching token to request headers.");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;