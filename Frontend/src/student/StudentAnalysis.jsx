import React from 'react';
import { Construction } from "lucide-react";

export default function StudentAnalysis() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-68 sm:py-32 text-center select-none">
      <Construction size={40} className="text-slate-300 mb-5" />
      <h2 className="text-xl font-black text-slate-700 tracking-tight">Analysis Under Construction</h2>
      <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed mt-2">
        We're building your detailed subject and chapter-wise SWOT analysis. 
        This feature will be available shortly.
      </p>
      <div className="mt-6 flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-full px-5 py-3">
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#7A41F7] rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
        <span className="text-[10px] font-bold text-[#7A41F7] uppercase tracking-widest whitespace-nowrap">In Progress</span>
      </div>
    </div>
  );
}