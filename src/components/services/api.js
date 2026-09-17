import axios from "axios";

// Helper to get the correct base URL safely
const getBaseUrl = () => {
  // 1. If VITE_API_URL is provided (e.g., in Vercel production), use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 2. Fallback for local network testing (if accessing via local IP)
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `http://${window.location.hostname}:3000`; // Matches your backend port 3000
  }

  // 3. Default local development fallback
  return "http://localhost:3000";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

export default api;
