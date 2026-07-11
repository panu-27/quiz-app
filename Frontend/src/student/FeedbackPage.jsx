import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Trophy } from "lucide-react";

export default function FeedbackPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`fixed inset-0 z-[99999] flex flex-col justify-between p-6 animate-fade-in ${theme === 'dark' ? 'bg-[#000000] text-white' : 'bg-[#FFFFFF] text-[#0F172A]'
      }`}>
      {/* Header Close Row */}
      <div className="flex mt-4 justify-between items-center w-full relative z-10">
        <button
          onClick={() => navigate("/student")}
          className={`p-3 -ml-3 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'
            }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 -mt-6">
        <h2 className="text-xl font-bold text-center tracking-tight px-4 leading-tight">
          Thanks for your feedback!
        </h2>

        {/* Simulated Play Store Card Container */}
        <div className="relative w-full max-w-[280px] pt-10">
          {/* Play Store Float Badge */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center shadow-none border z-10 ${theme === 'dark' ? 'bg-[#181A1D] border-white/[0.05]' : 'bg-[#FFFFFF] border-slate-200'
            }`}>
            <img
              src="/playstore-svgrepo-com.svg"
              alt="Google Play Store"
              className="w-12 h-12 ml-2 object-contain"
            />
          </div>

          {/* The Card */}
          <div className={`rounded-[14px] p-6 pt-14 shadow-none flex flex-col items-center border ${theme === 'dark' ? 'bg-[#181A1D] border-white/[0.05]' : 'bg-[#F3F4F6] border-slate-200'
            }`}>
            {/* Trophy Row */}
            <div className="flex items-center gap-4 w-full mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-[#293E56] text-[#3B82F6]' : 'bg-[#DBEAFE] text-[#2563EB]'
                }`}>
                <Trophy size={24} className="fill-current" />
              </div>
              <div className="flex-1 space-y-2">
                <div className={`h-2.5 w-3/4 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300/80'}`} />
                <div className={`h-2 w-1/2 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200/70'}`} />
              </div>
            </div>

            <div className={`w-full h-[1px] mb-6 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-slate-200/85'}`} />

            {/* 5 Green/Cyan Stars */}
            <div className="flex gap-2.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className="w-8 h-8 text-[#00A878] fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.62L12 2L9.19 8.62L2 9.24L7.45 13.97L5.82 21L12 17.27Z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Meta Text */}
        <div className="text-center space-y-2 max-w-[270px]">
          <h3 className="text-[17px] font-bold leading-tight">
            Rate Target Coaching Classes App on Google Play Store
          </h3>
          <p className={`text-xs px-2 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
            Take a moment to share your word with other learners
          </p>
        </div>
      </div>

      {/* Rate Now Button */}
      <div className="w-full pb-4">
        <button
          onClick={() => {
            navigate("/student");
            window.open('https://en.wikipedia.org', '_blank');
          }}
          className={`w-full py-3 font-bold text-base active:scale-[0.98] transition-all shadow-none rounded-[12px] text-center ${theme === 'dark' ? 'bg-white text-black hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
        >
          Rate now
        </button>
      </div>
    </div>
  );
}
