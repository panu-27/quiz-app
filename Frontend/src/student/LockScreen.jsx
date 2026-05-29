import React from "react";
import { Lock, Sparkles, Compass } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function LockScreen({ onOpenGoalModal }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      {/* Decorative Outer Ring */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-purple-500/10 dark:bg-purple-400/10 blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-white dark:bg-[#121A28] border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Lock size={32} className="animate-bounce" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-white shadow animate-spin-slow">
          <Sparkles size={12} />
        </div>
      </div>

      {/* Text Content */}
      <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white max-w-md leading-tight">
        Your Dashboard is Locked
      </h2>
      <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-md mt-3 leading-relaxed">
        Unlock your personalized learning path, practice tests, and leaderboard stats by selecting an active academic goal.
      </p>

      {/* CTA Button */}
      <button
        onClick={onOpenGoalModal}
        className="mt-8 flex items-center gap-2.5 px-8 py-4 bg-[#7A41F7] hover:bg-[#6832E3] dark:bg-[#6832E3] dark:hover:bg-[#5727C6] text-white font-extrabold rounded-2xl text-base transition-all shadow-lg shadow-purple-200 dark:shadow-none hover:scale-105 active:scale-[0.98]"
      >
        <Compass size={18} />
        Select Academic Goal
      </button>

      {/* Extra helper tags */}
      <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-sm">
        {["HSC Class 11th", "HSC Class 12th", "MHT-CET"].map((g, idx) => (
          <span
            key={idx}
            className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 dark:bg-[#121A28] text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200/40 dark:border-slate-800/60"
          >
            {g} Available
          </span>
        ))}
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
