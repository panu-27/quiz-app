import { Gift, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Shared desktop header.
 * - loggedIn=false (default): shows "Log in" + "Join for free"
 * - loggedIn=true: shows "Logout" button; calls onLogout()
 */
export default function DesktopHeader({ loggedIn = false, onLogout }) {
  const navigate = useNavigate();

  return (
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
          <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition">
            <Gift size={20} />
          </button>

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
  );
}
