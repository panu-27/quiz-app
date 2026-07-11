import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Lock, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MOCK_VIDEOS = [
  { id: 101, title: "Fundamental of Mathematics", duration: "1h 21 min", bgStart: "#5c2a2a", bgEnd: "#2a0808" },
  { id: 102, title: "Logarithm", duration: "2h 35 min", bgStart: "#2a3b4c", bgEnd: "#0a161e" },
  { id: 103, title: "Function", duration: "3h 15 min", bgStart: "#4a3245", bgEnd: "#1b1219" },
  { id: 104, title: "Sequence & Series", duration: "5h 27 min", bgStart: "#5a5b4a", bgEnd: "#2e2f23" },
  { id: 105, title: "Compound Angle", duration: "41 min", bgStart: "#6b4c8f", bgEnd: "#3b2c4f" },
  { id: 106, title: "Trigonometric Equations", duration: "40 min", bgStart: "#3a5a2a", bgEnd: "#162a10" },
];

const STATUS_BAR_H = 28.5;

export default function PrimeCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const isApproved = !!user?.approved;

  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, []);

  const handleVideoClick = (index, videoId) => {
    if (!isApproved && index !== 0) {
      // Logic for locked videos for unapproved users
      return;
    }
    navigate(`/student/prime/video/${videoId}`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#12111A]' : 'bg-[#F8FAFF]'} font-sans pb-10`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }
      `}</style>

      {/* Header */}
      <div
        className={`sticky top-0 z-50 px-4 pb-3 ${isDark ? 'bg-[#12111A]' : 'bg-[#F8FAFF]'}`}
        style={{ paddingTop: STATUS_BAR_H + 12 }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`p-1 -ml-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <ChevronLeft size={24} />
          </button>
          <h1 className={`text-[17px] font-semibold font-display line-clamp-3 whitespace-normal ${isDark ? 'text-white' : 'text-slate-900'}`}>
            JEE Complete Mathematics (Class 11th + 12th) - Full Syllabus
          </h1>
        </div>
      </div>

      {/* Video List */}
      <div className="px-4 mt-2 space-y-3">
        {MOCK_VIDEOS.map((video, index) => {
          const isLocked = !isApproved && index !== 0;
          return (
            <div
              key={video.id}
              onClick={() => handleVideoClick(index, video.id)}
              className={`flex items-center p-2 rounded-[16px] transition-all cursor-pointer border ${
                isDark 
                  ? 'bg-[#1A1924] border-[#2A2938] hover:bg-[#232231]' 
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              } ${isLocked ? 'opacity-60 grayscale-[50%]' : 'active:scale-[0.98]'}`}
            >
              {/* Thumbnail */}
              <div 
                className="w-[140px] h-[75px] rounded-[10px] overflow-hidden flex-shrink-0 relative"
                style={{ background: `linear-gradient(135deg, ${video.bgStart}, ${video.bgEnd})` }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <span className="text-white font-bold italic text-[15px] leading-tight text-center drop-shadow-none">
                    {video.title.split(' ')[0]}
                  </span>
                </div>
                {isLocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Lock size={24} className="text-white/80" />
                  </div>
                )}
                {/* Prime Tag */}
                <div className="absolute top-1.5 right-1.5 bg-[#2E68FF] px-1 py-0.5 rounded-[3px] flex items-center justify-center">
                  <span className="text-[6px] font-bold text-white leading-none tracking-wider">Prime</span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 pl-3 pr-2 py-1">
                <h3 className={`text-[15px] font-semibold leading-tight mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {video.title}
                </h3>
                <div className="flex items-center gap-2">
                  <p className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {video.duration}
                  </p>
                  {isLocked && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <Lock size={10} /> Locked
                    </span>
                  )}
                  {!isLocked && index === 0 && !isApproved && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <PlayCircle size={10} /> Free
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom CTA for Unapproved Users */}
      {!isApproved && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] p-4 flex items-center justify-between pointer-events-auto border-t border-white/10 w-full">
            <div>
              <p className="text-white font-semibold text-[14px]">Unlock all videos</p>
              <p className="text-white/80 text-[12px] font-medium mt-0.5">Join Prime for full access.</p>
            </div>
            <button className="bg-white text-[#7B46F6] px-4 py-2 rounded-sm text-[13px] font-semibold active:scale-95 transition-transform flex-shrink-0 ml-4">
              Join Prime
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
