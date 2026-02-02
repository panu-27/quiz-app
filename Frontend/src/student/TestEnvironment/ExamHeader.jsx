import { ClockIcon, MonitorIcon, ChevronRight, PowerIcon, Maximize2 } from 'lucide-react';
import React from 'react';

const ExamHeader = ({ 
  testId, 
  timer, 
  activeSubject, 
  subjects, 
  onSubjectChange, 
  onMoveToSection, 
  isBlock1, 
  hasBlock2, 
  exitApp 
}) => {
  const minutes = Math.floor(timer / 60);
  const seconds = (timer % 60).toString().padStart(2, '0');
  
  // Logic to show exit only on desktop
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div className="flex flex-col shrink-0 select-none font-sans">
      {/* 1. Primary Top Bar (Dark Slate) - Matches image_8140b0.png */}
      <header className="h-10 mr-8 md:mr-0 bg-[#2d3436] flex items-center justify-between px-4 text-white">
        <div className="flex items-center gap-3">
          <MonitorIcon className="w-4 h-4 text-gray-400" />
          <span className="text-[12px] font-bold tracking-tight uppercase">
            MHT-CET Test: {testId?.slice(-4) || "02"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Section Transition Logic */}
          {isBlock1 && hasBlock2 && (
            <button 
              onClick={onMoveToSection}
              className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded transition-colors uppercase mr-2"
            >
              Go to Next Section
            </button>
          )}

          <div className="flex items-center gap-4 border-l border-gray-600 pl-4">
            {/* Fullscreen Icon from Screenshot */}
            {/* Timer - Exactly like Screenshot 2026-01-30 164451.jpg */}
            <div className="flex items-center gap-2 text-[14px] font-mono font-medium bg-[#3b4446] px-3 py-0.5 rounded border border-gray-600">
              <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>{minutes.toString().padStart(2, '0')}:{seconds}</span>
            </div>

            {/* Desktop Exit Button */}
            {isDesktop && (
              <button 
                onClick={exitApp}
                title="Exit Application"
                className="ml-2 p-1.5 bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white rounded transition-all"
              >
                <PowerIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Subject Navigation Bar - Matches green tabs from Screenshot */}
      <nav className="h-12  border-b border-gray-200 flex items-center px-2 gap-2 overflow-x-auto no-scrollbar shadow-sm">
        {/* Navigation Arrow Left */}
        

        <div className="flex items-center gap-2">
          {subjects.map((sub, index) => {
            const isActive = activeSubject === sub;
            return (
              <button 
                key={sub} 
                onClick={() => onSubjectChange(sub)} 
                className={`flex items-center gap-2 px-5 py-1.5 rounded-sm border transition-all text-[12px] font-bold uppercase
                  ${isActive 
                    ? 'bg-[#007f5f] text-white border-[#007f5f]' 
                    : 'bg-white text-[#007f5f] border-gray-300 hover:border-[#007f5f]'
                  }`}
              >
                {/* Subject Index Circle */}
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] 
                  ${isActive ? 'bg-white text-[#007f5f]' : 'bg-[#007f5f] text-white'}`}>
                  {index + 1}
                </div>
                {sub}
              </button>
            );
          })}
        </div>

        {/* Navigation Arrow Right */}
        
      </nav>
    </div>
  );
};

export default ExamHeader;