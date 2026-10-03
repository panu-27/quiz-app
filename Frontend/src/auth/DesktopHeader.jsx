import { Gift, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/**
 * Shared desktop header.
 * - loggedIn=false (default): shows "Log in" + "Join for free"
 * - loggedIn=true: shows "Logout" button; calls onLogout()
 */
export default function DesktopHeader({ loggedIn = false, onLogout }) {
  const navigate = useNavigate();
  const [showOffer, setShowOffer] = useState(false);

  return (
    <>
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-800 cursor-pointer"
          onClick={() => navigate(loggedIn ? "/student" : "/")}
        >
          <img src="/logo.png" alt="Targate Coaching Classes Logo" className="w-10 h-10 object-contain" />
          Targate Coaching Classes
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {!loggedIn && (
            <button
              type="button"
              onClick={() => setShowOffer(true)}
              className="flex cursor-pointer items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition"
            >
              <img
                src="https://static.uacdn.net/production/_next/static/images/giftHomePage.svg"
                alt="Gift"
                className="w-5 h-5"
              />
            </button>
          )}

          {loggedIn ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-2.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition"
              >
                Join for free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
    
    {showOffer && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute cursor-pointer inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowOffer(false)}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-md
                        px-6 py-8 text-center animate-[scaleIn_0.2s_ease-out]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2
                          bg-gradient-to-r from-pink-500 to-rose-500
                          text-white text-xs font-semibold px-4 py-1 rounded-full">
            🎉 Limited Time Offer
          </div>
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-slate-800">Welcome!</h3>
          <p className="mt-2 text-sm text-slate-600">
            Get <span className="font-semibold text-green-600">5 FREE test access</span>{" "}
            for your first preparation track.
          </p>
          <p className="mt-1 text-xs text-slate-500">Valid for new students only</p>
          <button
            onClick={() => { setShowOffer(false); navigate("/register"); }}
            className="mt-6 w-full py-3 rounded-xl cursor-pointer
                       bg-slate-800 text-white font-semibold text-sm
                       hover:bg-slate-900 transition"
          >
            Claim your gift 🎁
          </button>
          <button
            onClick={() => setShowOffer(false)}
            className="mt-3 cursor-pointer text-xs text-slate-500 hover:underline"
          >
            Maybe later
          </button>
        </div>
      </div>
    )}
    </>
  );
}
