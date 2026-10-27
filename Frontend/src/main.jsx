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

// Clean up any stale service workers in development to avoid caching/MIME issues
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Register service worker only in production web builds
if (import.meta.env.PROD && !isNativeApp && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.log("SW registration failed:", err));
  });
}

// Restrict application-level zooming across the website at any point
if (typeof window !== "undefined") {
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  window.addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")
    ) {
      if (!e.target.closest?.(".allow-pdf-zoom")) {
        e.preventDefault();
      }
    }
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length > 1 && !e.target.closest?.(".allow-pdf-zoom")) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1 && !e.target.closest?.(".allow-pdf-zoom")) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
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