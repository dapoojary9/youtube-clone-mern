import axios from "axios";

// Single Axios instance used by the whole app
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const TOKEN_KEY = "yt_clone_token";

// Attach the JWT (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise error messages so components can simply show err.message / err.fieldErrors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error.response?.data || {};
    const normalised = new Error(data.message || error.message || "Something went wrong");
    normalised.status = error.response?.status;
    normalised.fieldErrors = data.errors || {};
    if (normalised.status === 401 && localStorage.getItem(TOKEN_KEY) && /expired|invalid|no longer/i.test(normalised.message)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(normalised);
  }
);

export default api;
