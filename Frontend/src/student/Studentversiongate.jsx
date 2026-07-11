import { useState, useEffect } from "react";
import api from "../api/axios";

// ── App Version from ENV ──
const APP_VERSION = Number(import.meta.env.VITE_APP_VERSION) || 1;

function AppLogo() {
  return (
    <header>
      {/* <div className="flex items-center gap-3">
        <img
          src="./icon-512.png"
          alt="Nexus"
          className="hidden sm:block h-8 sm:h-14 w-auto object-contain"
        />
        <img
          src="./icon-512.png"
          alt="Nexus"
          className="block sm:hidden h-12 w-auto object-contain"
        />
        <span className="text-[22px] font-bold text-slate-800 dark:text-white tracking-tight">Nexus</span>
      </div> */}
    </header>
  );
}

// ── Update Wall Component ──
function UpdateWall() {
  const handleUpdate = () => {
    window.open("https://wikipedia.org", "_blank");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B101A] flex flex-col font-sans relative">
      <AppLogo />
      <div className="flex-1 flex flex-col px-4 sm:px-12 md:px-6 xl:px-52">
        <section className="flex-1 max-w-7xl mx-auto w-full flex items-center justify-center pt-10 pb-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center w-full">
            {/* LEFT */}
            <div className="max-w-xl order-2 md:order-1 text-center md:text-left">
              <h1 className="text-[32px] sm:text-[40px] leading-[1.15] font-serif tracking-tight text-slate-800 dark:text-white">
                App Update Required
              </h1>
              <p className="mt-4 text-[15px] sm:text-[16px] text-slate-600 dark:text-slate-400">
                You are using an older version of the app. Please update to the latest version to continue your preparation seamlessly.
              </p>
              
            </div>
            {/* RIGHT */}
            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <img src="./home-illustration.svg" alt="Update Required" className="w-[280px] sm:w-[350px] md:w-[480px]" />
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50 bg-white/80 dark:bg-[#0B101A]/80 backdrop-blur-md">
        <button
          onClick={handleUpdate}
          className="w-full max-w-md py-3.5 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold text-sm cursor-pointer hover:bg-slate-900 dark:hover:bg-slate-100 transition shadow-lg"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}

// ── Server Error Wall Component ──
function ServerErrorWall({ onRetry }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B101A] flex flex-col font-sans relative">
      <AppLogo />
      <div className="flex-1 flex flex-col px-4 sm:px-12 md:px-6 xl:px-52">
        <section className="flex-1 max-w-7xl mx-auto w-full flex items-center justify-center pt-10 pb-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center w-full">
            {/* LEFT */}
            <div className="max-w-xl order-2 md:order-1 text-center md:text-left">
              <h1 className="text-[32px] sm:text-[40px] leading-[1.15] font-serif tracking-tight text-slate-800 dark:text-white">
                Connection Failed
              </h1>
              <p className="mt-4 text-[15px] sm:text-[16px] text-slate-600 dark:text-slate-400">
                We couldn't reach the server to verify your app version. Please check your internet connection and try again.
              </p>
            </div>
            {/* RIGHT */}
            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <img src="./home-illustration.svg" alt="Connection Failed" className="w-[280px] sm:w-[350px] md:w-[480px]" />
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50 bg-white/80 dark:bg-[#0B101A]/80 backdrop-blur-md">
        <button
          onClick={onRetry}
          className="w-full max-w-md py-3.5 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold text-sm cursor-pointer hover:bg-slate-900 dark:hover:bg-slate-100 transition shadow-lg"
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
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-[#0B101A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-800 border-t-slate-800 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "outdated") return <UpdateWall />;
  if (status === "server-error") return <ServerErrorWall onRetry={() => setRetry(k => k + 1)} />;

  return children;
}