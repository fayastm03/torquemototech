// services/api.js
// WHY: Instead of writing the full URL in every API call, we create
// a pre-configured Axios instance with:
//  - Base URL pointing to our backend
//  - Auto-attach JWT token from localStorage to every request
//  - Intercept 401 errors globally (auto logout if token expires)

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create a custom Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds — fail fast if server is down
});

// ── Request Interceptor ────────────────────────────────────────────────────
// WHY: Runs BEFORE every outgoing request.
// Automatically reads the token from localStorage and attaches it
// so we don't have to manually pass it in every single API call.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────
// WHY: Runs AFTER every incoming response.
// If the server returns 401 (token expired / invalid),
// we automatically log the user out and redirect to login.
api.interceptors.response.use(
  (response) => response, // Pass through successful responses unchanged

  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token is expired or invalid — clean up and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Only redirect if NOT already on the login page (prevent loops)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?session=expired";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
