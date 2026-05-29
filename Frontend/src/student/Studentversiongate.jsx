import { useState, useEffect } from "react";
import api from "../api/axios";

// ── App Version from ENV ──
const APP_VERSION = Number(import.meta.env.VITE_APP_VERSION) || 1; 

// ── Minimal Update Wall Component ──
function UpdateWall() {
  const handleUpdate = () => {
    window.open("https://wikipedia.org", "_blank");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="/auth-bg.png" alt="Background" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* No text as requested */}

      {/* Button at the absolute bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-12 sm:max-w-md sm:mx-auto">
        <button 
          onClick={handleUpdate}
          className="w-full h-14 bg-white text-slate-900 font-semibold text-base hover:bg-slate-100 transition rounded-none"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}

// ── Minimal Server Error Wall Component ──
function ServerErrorWall({ onRetry }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="/auth-bg.png" alt="Background" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Connection Failed</h1>
        <p className="text-base text-slate-300 text-center max-w-sm leading-relaxed">
          We couldn't reach the server to verify your app version. Please check your internet connection.
        </p>
      </div>

      {/* Button at the absolute bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-12 sm:max-w-md sm:mx-auto">
        <button 
          onClick={onRetry}
          className="w-full h-14 border border-white/50 text-white font-semibold text-base hover:bg-white/10 transition backdrop-blur-sm rounded-none"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ── Version Gate Component ──
export default function StudentVersionGate({ children }) {
  const [status, setStatus] = useState("checking");
  const [retryKey, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("checking");

    (async () => {
      try {
        const res = await api.get("/app/min-version");
        const requiredVersion = Number(res.data.minVersion);
        
        if (!requiredVersion) throw new Error("Invalid version data");
        
        if (cancelled) return;
        
        setStatus(APP_VERSION < requiredVersion ? "outdated" : "ok");
      } catch (err) {
        console.error("Version check failed:", err);
        if (!cancelled) setStatus("server-error");
      }
    })();

    return () => { cancelled = true; };
  }, [retryKey]);

  if (status === "checking") {
    // Show a minimal full-screen loader while checking to prevent flashes
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "outdated") return <UpdateWall />;
  if (status === "server-error") return <ServerErrorWall onRetry={() => setRetry(k => k + 1)} />;
  
  return children;
}