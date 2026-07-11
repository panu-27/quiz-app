import React from 'react';
import { useTheme } from '../context/ThemeContext';

const STATUS_BAR_H = 28.5;

export default function PublicPageLayout({ children, bgImage = false, transparent = false }) {
  const { theme } = useTheme();
  
  const bgClass = transparent 
    ? 'bg-transparent' 
    : (theme === 'dark' ? 'bg-[#202124] text-[#E8EAED]' : 'bg-white text-[#202124]');

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans ${bgClass}`}>
      {bgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none bg-slate-900">
          <img src="/auth-bg.png" alt="Background" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>
      )}

      <div 
        className="relative z-10 w-full h-full min-h-screen flex flex-col overflow-y-auto"
        style={{ paddingTop: STATUS_BAR_H + 24 }}
      >
        <div className="flex-1 w-full max-w-md mx-auto px-6 pb-12 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
