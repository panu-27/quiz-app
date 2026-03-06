const { contextBridge, ipcRenderer } = require("electron");

// ─── SET YOUR BACKEND API URL HERE ───────────────────────────
// This is injected into window.__API_URL__ before React loads.
// axios.js reads this at runtime so it always has a valid baseURL
// regardless of what was baked into the Vite build.
// Change this to your Render URL when deploying to production.
const API_URL = "https://api.pranavzinjad.in/api";
// ─────────────────────────────────────────────────────────────

// Inject API URL into the page — axios reads window.__API_URL__
contextBridge.exposeInMainWorld("__API_URL__", API_URL);

// Electron IPC bridge
contextBridge.exposeInMainWorld("electron", {
  examStarted:  () => ipcRenderer.send("EXAM_STARTED"),
  examFinished: () => ipcRenderer.send("EXAM_FINISHED"),
  forceExit:    () => ipcRenderer.send("FORCE_EXIT_APP"),

  onViolation: (callback) => {
    const handler = (_event, type) => callback(type);
    ipcRenderer.on("ELECTRON_VIOLATION", handler);
    return () => ipcRenderer.removeListener("ELECTRON_VIOLATION", handler);
  },

  isElectron: true,
});