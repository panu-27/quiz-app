import React from 'react';
import { Construction } from "lucide-react";

const StudentAnalysis = () => {
  return (
    <div className="min-h-screen bg-white w-full flex flex-col items-center justify-center text-center">
      <div className="space-y-6">
        {/* Simple Icon */}
        <div className="flex justify-center">
          <Construction size={40} className="text-slate-300" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Analysis Under Construction
          </h2>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
            We're building your detailed subject and chapter-wise SWOT analysis. 
            This feature will be available shortly.
          </p>
        </div>

        {/* Minimalist Progress Indicator */}
        <div className="pt-4 flex flex-col items-center gap-3">
          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-300 w-1/2 rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;