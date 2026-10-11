// ;

// import axios from "axios";

// // Helper to dynamically get the computer's local IP address in development
// const getDevBaseUrl = () => {
//   if (
//     typeof window !== "undefined" &&
//     window.location.hostname !== "localhost"
//   ) {
//     return `http://${window.location.hostname}:3001`;
//   }
//   return "http://localhost:3001";
// };

// const api = axios.create({
//   baseURL: import.meta.env?.VITE_API_URL || getDevBaseUrl(),
//   withCredentials: true,
// });

// export default api;

import axios from "axios";

const getDevBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  const hostname = window.location.hostname;

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3001";
  }

  // Accessing the frontend from another device
  return `http://${hostname}:3001`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || getDevBaseUrl(),
  withCredentials: true,
});

export default api;
