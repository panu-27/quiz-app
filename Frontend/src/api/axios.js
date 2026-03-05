import axios from "axios";

// Priority:
// 1. window.__API_URL__  — injected by Electron preload.js at runtime (always correct)
// 2. VITE_API_BASE_URL   — baked in at build time from .env (web builds)
// 3. localhost fallback  — local dev safety net
const BASE_URL =
  (typeof window !== "undefined" && window.__API_URL__) ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — use hash navigation so it works in both browser and Electron
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // window.location.href = "/login" breaks in Electron (file:///login)
      // window.location.hash works correctly with HashRouter in both environments
      window.location.hash = "#/login";
    }
    return Promise.reject(error);
  }
);

export default api;