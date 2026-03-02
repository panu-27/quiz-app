import React from 'react';

const LoaderAnalysis = () => {
  return (
    <div className="md:hidden fixed inset-0 z-[5000] bg-white flex flex-col font-sans overflow-hidden">
      {/* 1. YouTube Top Purple Loading Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[5100] overflow-hidden">
        <div className="h-full bg-[#7A41F7] w-full origin-left animate-[yt-bar_2s_infinite_linear]" />
      </div>

      {/* 2. Nav Skeleton */}
      <div className="h-14 border-b border-slate-50 flex items-center px-6 shrink-0 bg-white">
        <div className="w-8 h-8 sk rounded-full" />
        <div className="mx-auto w-24 h-5 sk rounded-lg" />
        <div className="w-8 h-8 sk rounded-full" />
      </div>

      {/* 3. Main Content Scrollable Area */}
      <div className="flex-1 px-6 pt-6 space-y-8 overflow-hidden">
        
        {/* Trophy Rank Skeleton */}
        <div className="w-full h-56 bg-rose-50/50 rounded-[2.5rem] flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-20 h-20 sk rounded-full" />
          <div className="w-48 h-5 sk rounded-lg" />
          <div className="w-32 h-10 sk rounded-2xl" />
        </div>

        {/* 4-Grid Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4 px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 sk border border-white rounded-xl shadow-sm opacity-60" />
          ))}
        </div>

        {/* Subject Performance Bars Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between px-2">
            <div className="w-32 h-3 sk rounded" />
            <div className="w-20 h-3 sk rounded" />
          </div>
          
          <div className="relative flex gap-3 h-56 items-end justify-center px-4">
            <div className="absolute left-0 h-full w-4 flex flex-col justify-between py-2 opacity-30">
               {[1,2,3].map(i => <div key={i} className="w-full h-2 sk" />)}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[30px] sk rounded-t-sm" style={{ height: `${20 + (i * 20)}%` }} />
            ))}
          </div>
        </div>

        {/* Table/List Skeleton */}
        <div className="space-y-4 pb-10">
          <div className="w-32 h-4 sk rounded ml-2" />
          <div className="w-full h-40 sk rounded-2xl opacity-40" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes yt-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes yt-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-30%); }
          100% { transform: translateX(100%); }
        }
        .sk {
          background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: yt-shimmer 1.5s infinite linear;
        }
      `}} />
    </div>
  );
};

export default LoaderAnalysis;