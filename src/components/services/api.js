import axios from "axios";

const getBaseUrl = () => {
  // 1. Check Vite's environment variable safely
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // 2. If running live on Vercel frontend domain but env var missed, fallback directly to live backend
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("vercel.app")
  ) {
    return "https://taskmanagement-backend-amber.vercel.app";
  }

  // 3. Local development fallbacks
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:3000`;
  }

  return "http://localhost:3000";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

export default api;
