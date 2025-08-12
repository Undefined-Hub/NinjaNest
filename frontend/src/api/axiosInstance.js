// src/api/axiosInstance.js
import axios from "axios";
import { store } from "../redux/store";
import { logoutUser } from "../features/User/userSlice";
import { toast } from "react-hot-toast";

// Create an Axios instance
const api = axios.create({
    baseURL: "${import.meta.env.VITE_SERVER_URL}/api", // Change this to your real backend API URL
});

// Request Interceptor: Add token to headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem("token");
        store.dispatch(logoutUser());

        // 🚀 Store current path for redirect after login
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);

        // Store error toast flag
        sessionStorage.setItem("sessionExpired", "true");

        // Redirect
        window.location.href = "/auth";
        }


    return Promise.reject(error);
  }
);

export default api;
