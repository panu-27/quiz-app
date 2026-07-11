import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronUp, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PrimeVideo() {
  const navigate = useNavigate();
  const { videoId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('Assignments');

  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, []);

  // Dummy video URL
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#12111A]' : 'bg-[#F8FAFF]'} font-sans flex flex-col`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }
      `}</style>

      {/* Video Player Container */}
      <div className="w-full relative bg-black aspect-video">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full object-contain"
          poster="https://images.unsplash.com/photo-1633526543814-9710c776e336?auto=format&fit=crop&q=80&w=1200&h=675"
        />
      </div>

      {/* Video Info */}
      <div className={`px-5 py-4 flex items-center gap-4 ${isDark ? 'border-[#2A2938]' : 'border-slate-200'} border-b`}>
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=teacherJ&backgroundColor=transparent&clothingColor=262e33" alt="Teacher" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className={`text-[15px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Basic Mathematics and Vectors
          </h2>
          <p className={`text-[13px] mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Janardanudu Thallaparthi
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-2">
        <button 
          onClick={() => setActiveTab('Assignments')}
          className={`flex-1 py-3 text-[14px] font-bold transition-all border-b-2 ${
            activeTab === 'Assignments' 
              ? (isDark ? 'text-white border-white' : 'text-slate-900 border-slate-900')
              : (isDark ? 'text-slate-500 border-transparent' : 'text-slate-400 border-transparent')
          }`}
        >
          Assignments
        </button>
        <button 
          onClick={() => setActiveTab('Notes')}
          className={`flex-1 py-3 text-[14px] font-bold transition-all border-b-2 ${
            activeTab === 'Notes' 
              ? (isDark ? 'text-white border-white' : 'text-slate-900 border-slate-900')
              : (isDark ? 'text-slate-500 border-transparent' : 'text-slate-400 border-transparent')
          }`}
        >
          Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'Assignments' ? (
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-4 rounded-[12px] border ${isDark ? 'bg-[#1A1924] border-[#2A2938]' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                <FileText size={18} />
              </div>
              <p className={`text-[14px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Basic Mathematics and Vector Final.pdf
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <FileText size={48} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
            <p className={`mt-3 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No notes available
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className={`sticky bottom-0 left-0 right-0 p-4 flex items-center justify-between z-40 ${isDark ? 'bg-[#2A2938]' : 'bg-[#4B3C7B]'}`}>
        <div className="flex items-center gap-2 text-white">
          <ChevronUp size={20} className="opacity-80" />
          <span className="font-bold text-[15px]">Units and Dimensions</span>
        </div>
        <button className="px-5 py-2 rounded-[8px] font-bold text-[13px] tracking-wider border border-white/30 text-white hover:bg-white/10 transition-colors">
          NEXT
        </button>
      </div>
    </div>
  );
}
