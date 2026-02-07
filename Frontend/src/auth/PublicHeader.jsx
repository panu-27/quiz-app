import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";


export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOffer, setShowOffer] = useState(false);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="h-14 sm:h-18 border-b-amber-500 bg-gray-50 flex items-center justify-between
                   px-3 sm:px-10 md:px-4 xl:px-48">

      {/* ===== LEFT : LOGO ===== */}
      <a href="/" className="flex items-center">

        {/* Desktop / Tablet logo — UNCHANGED */}
        <img
          src="/icon-512.png"
          alt="Nexus"
          className="hidden sm:block h-8 sm:h-14 w-auto object-contain"
        />

        {/* Mobile logo — FIXED */}
        <img
          src="/icon-512.png"
          alt="Nexus"
          className="block sm:hidden h-12 w-auto object-contain"
        />

      </a>
      <div
        className={`${isAuthPage ? "hidden sm:flex" : "flex"} items-center gap-2 sm:gap-3`}
      >
        <button
          type="button"
          onClick={() => setShowOffer(true)}
          className="hidden sm:flex cursor-pointer items-center justify-center w-9 h-9 rounded-full hover:bg-slate-100"
        >
          <img
            src="https://static.uacdn.net/production/_next/static/images/giftHomePage.svg"
            alt="Gift"
            className="w-5 h-5"
          />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-4">
          <button
            onClick={() => navigate("/login")}
            className="h-[32px] sm:h-[40px] w-[96px] sm:w-[104px]
                 flex items-center justify-center cursor-pointer
                 border border-slate-900 rounded-lg
                 text-sm font-medium text-slate-700
                 hover:bg-slate-50 transition"
          >
            Log in
          </button>

          <button
            onClick={() => navigate("/register")}
            className="h-[32px] sm:h-[40px] px-3 sm:px-4
                 flex items-center justify-center
                 bg-slate-800 text-white rounded-lg
                 text-sm font-semibold cursor-pointer
                 hover:bg-slate-900 transition"
          >
            Join for free
          </button>
        </div>
      </div>
      {showOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* Backdrop */}
          <div
            className="absolute cursor-pointer inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowOffer(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-md
                    px-6 py-8 text-center animate-[scaleIn_0.2s_ease-out]">

            {/* Ribbon */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2
                      bg-gradient-to-r from-pink-500 to-rose-500
                      text-white text-xs font-semibold px-4 py-1 rounded-full">
              🎉 Limited Time Offer
            </div>

            {/* Blast emoji */}
            <div className="text-5xl mb-4">🎁</div>

            <h3 className="text-xl font-bold text-slate-800">
              Welcome to Nexus!
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Get <span className="font-semibold text-green-600">5 FREE test access</span>{" "}
              for your first preparation track.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Valid for new students only
            </p>

            {/* CTA */}
            <button
              onClick={() => {
                setShowOffer(false);
                navigate("/register");
              }}
              className="mt-6 w-full py-3 rounded-xl cursor-pointer
                   bg-slate-800 text-white font-semibold text-sm
                   hover:bg-slate-900 transition"
            >
              Claim your gift 🎁
            </button>

            {/* Close */}
            <button
              onClick={() => setShowOffer(false)}
              className="mt-3 cursor-pointer text-xs text-slate-500 hover:underline"
            >
              Maybe later
            </button>

          </div>
        </div>
      )}

    </header>

  );
}
