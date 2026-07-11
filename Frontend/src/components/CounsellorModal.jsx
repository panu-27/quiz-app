import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function CounsellorModal({ isOpen, onClose, title = "Need help with your preparation?" }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/65 transition-opacity" style={{ backdropFilter: 'blur(3px)' }} />
      <div
        className={`relative w-full max-w-md overflow-hidden transition-transform animate-in slide-in-from-bottom-full duration-300 ${isDark ? 'bg-[#111827]' : 'bg-white'}`}
        style={{ borderRadius: '12px 12px 0 0' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-4 pb-3">
          <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
        </div>
        <div className="px-6 pt-8 pb-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className={`font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: 19 }}>
                {title}
              </h2>
              <p className={`text-[12px] mt-2 leading-relaxed ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
                Talk to our experts who will guide you with all you need to crack it.
              </p>
            </div>
            <div className={`w-[68px] h-[68px] rounded-full overflow-hidden flex-shrink-0 border-2 ${isDark ? 'border-white/10 bg-[#1F2937]' : 'border-slate-200 bg-slate-100'}`}>
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=counsellorF&backgroundColor=b6e3f4&clothingColor=3c4f5c"
                className="w-full h-full object-cover"
                alt="Expert"
              />
            </div>
          </div>
        </div>
        <div className="px-6 pt-2 pb-2">
          <a
            href="tel:+918585858585"
            className={`w-full flex items-center justify-center gap-3 active:scale-95 transition-transform ${isDark ? 'bg-white text-[#111827]' : 'bg-[#1EBA9B] text-white shadow-md'}`}
            style={{ borderRadius: 8, padding: '12px 24px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="font-bold" style={{ fontSize: 15 }}>+91 8585858585</span>
          </a>
        </div>
        <div className="px-6 pb-4">
          <button
            onClick={onClose}
            className={`w-full flex items-center justify-center gap-1.5 py-3 font-bold tracking-widest active:opacity-70 transition-opacity ${isDark ? 'text-white' : 'text-[#1EBA9B]'}`}
            style={{ fontSize: 11.5, letterSpacing: '0.08em' }}
          >
            GET A CALL FROM US <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
