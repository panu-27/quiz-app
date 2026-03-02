import React from 'react';

const NexusLoader = () => {
  return (
    <div className="md:hidden fixed inset-0 z-[5000] bg-[#F6F8FC] flex flex-col font-sans">
      {/* 1. YouTube Top Red/Purple Loading Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[5100] overflow-hidden">
        <div className="h-full bg-[#7A41F7] w-full origin-left animate-[yt-bar_2s_infinite_linear]" />
      </div>

      {/* 2. Simulated Header Skeleton */}
      <div className="bg-[#7A41F7] pt-40 pb-16 px-6 relative overflow-hidden">
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl sk-dark" /> {/* Back Button */}
            <div className="space-y-2">
              <div className="w-32 h-5 sk-dark" /> {/* Title */}
              <div className="w-20 h-2 sk-dark opacity-50" /> {/* Subtitle */}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl sk-dark" /> {/* Menu Button */}
        </div>
      </div>

      {/* 3. Simulated Content Sheet */}
      <div className="flex-1 bg-white -mt-8 rounded-t-[2.5rem] relative z-20 px-6 pt-18 space-y-6">
        
        {/* Tab Switcher Skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-11 sk rounded-2xl" />
          <div className="flex-1 h-11 sk rounded-2xl" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="w-full h-12 sk rounded-2xl" />

        {/* Categories Skeleton */}
        <div className="flex gap-2 overflow-hidden">
          <div className="w-16 h-8 sk rounded-xl shrink-0" />
          <div className="w-20 h-8 sk rounded-xl shrink-0" />
          <div className="w-20 h-8 sk rounded-xl shrink-0" />
          <div className="w-20 h-8 sk rounded-xl shrink-0" />
        </div>

        {/* Asset List Skeletons */}
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-slate-50 rounded-2xl">
              <div className="w-12 h-12 sk rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-3 sk rounded" />
                <div className="w-1/2 h-2 sk rounded opacity-60" />
              </div>
              <div className="w-8 h-8 rounded-full sk shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Tab Bar Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-50 flex items-center justify-around px-6">
        <div className="w-6 h-6 sk rounded" />
        <div className="w-6 h-6 sk rounded" />
        <div className="w-12 h-12 bg-slate-100 rounded-full -mt-10 border-4 border-white sk" />
        <div className="w-6 h-6 sk rounded" />
        <div className="w-6 h-6 sk rounded" />
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
        .sk-dark {
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
          background-size: 200% 100%;
          animation: yt-shimmer 1.5s infinite linear;
          border-radius: 0.5rem;
        }
      `}} />
    </div>
  );
};

export default NexusLoader;