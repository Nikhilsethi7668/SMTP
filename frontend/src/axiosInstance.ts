import axios from "axios";
import { useUserStore } from "./store/useUserStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL!,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response interceptor to handle 401 unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user from store
      useUserStore.getState().clearUser();
      
      // Only redirect if we're not already on the auth page
      if (window.location.pathname !== "/auth" && window.location.pathname !== "/") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
