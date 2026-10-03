import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import ScrollToTop from './utility/ScrollToTop.jsx'

// Register service worker ONLY on web builds (not in Electron)
// In Electron: window.__API_URL__ is injected by preload.js — use that as the flag.
// Also: service worker path must be relative (./) not absolute (/) for Electron builds.
const isElectron = typeof window !== "undefined" && !!window.electron?.isElectron;
const isCapacitor = typeof window !== "undefined" && !!window.Capacitor?.isNative;
const isNativeApp = isElectron || isCapacitor;

if (!isElectron && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Use relative path so it works when Vite base is "./"
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.log("SW registration failed:", err));
  });
}

const Router = isNativeApp ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ScrollToTop />
      <App />
    </Router>
  </StrictMode>,
)