// import axios from "axios";

// // Falls back to localhost for local dev, but reads from an env var so the
// // same build can point at a real backend in staging/production.
// const api = axios.create({
//   baseURL: import.meta.env?.VITE_API_URL || "http://localhost:3001",
//   withCredentials: true,
// });

// export default api;

import axios from "axios";

// Helper to dynamically get the computer's local IP address in development
const getDevBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    return `http://${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
};

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || getDevBaseUrl(),
  withCredentials: true,
});

export default api;
