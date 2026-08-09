import { io } from "socket.io-client";

// Get the base URL from the env or default to localhost, stripping any /api suffix if present
const RAW_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const SOCKET_URL = RAW_URL.endsWith('/api') ? RAW_URL.replace('/api', '') : RAW_URL;

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      autoConnect: false, // Connect manually when needed
    });
    
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }
  return socket;
};

export const getSocket = () => socket;
