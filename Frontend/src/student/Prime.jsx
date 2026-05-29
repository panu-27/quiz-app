import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Flame, Search, ChevronRight, ListVideo, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const STATUS_BAR_H = 43.5;

const DEFAULT_AVATAR = (seed = "student") =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const TOP_EDUCATORS_DATA = [
  {
    id: 1,
    title: "Newton's Law of Motion and Friction",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahulY&backgroundColor=transparent&clothingColor=262e33",
    bg: "linear-gradient(to bottom, #4A3245, #1B1219)"
  },
  {
    id: 2,
    title: "GRAVITATION",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=ashishB&backgroundColor=transparent&clothingColor=3c4f5c",
    bg: "linear-gradient(to bottom, #6B1B1B, #2A0808)"
  },
  {
    id: 3,
    title: "Current Electricity",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=arvind&backgroundColor=transparent&clothingColor=262e33",
    bg: "linear-gradient(to bottom, #1B3A4B, #0A161E)"
  }
];

const SYLLABUS_VIDEOS = [
  {
    id: 1,
    title: "JEE Complete Mathematics (Class ...",
    count: 17,
    subject: "MATHEMATICS",
    author: "By Arvind",
    bgColor: "bg-gradient-to-br from-[#8A2B33] to-[#591B21]",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=arvind&backgroundColor=transparent&clothingColor=262e33",
  },
  {
    id: 2,
    title: "JEE Complete Physics (Class 11th)",
    count: 15,
    subject: "PHYSICS",
    author: "By Rahul Yadav",
    bgColor: "bg-gradient-to-br from-[#7A3E22] to-[#542915]",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=rahulY&backgroundColor=transparent&clothingColor=3c4f5c",
  },
  {
    id: 11,
    title: "JEE Complete Chemistry (Class 11th)",
    count: 12,
    subject: "CHEMISTRY",
    author: "By Ashish Bibyan",
    bgColor: "bg-gradient-to-br from-[#2D4A22] to-[#162A10]",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=ashishB&backgroundColor=transparent&clothingColor=5c3317",
  },
  {
    id: 12,
    title: "JEE Complete Biology (Class 11th)",
    count: 22,
    subject: "BIOLOGY",
    author: "By Seep Pahuja",
    bgColor: "bg-gradient-to-br from-[#1C4252] to-[#0D242E]",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=seepP&backgroundColor=transparent&clothingColor=ffdfbf",
  }
];

const PYQ_VIDEOS = [
  {
    id: 3,
    title: "JEE Physics PYQs (Class 11th)",
    count: 12,
    subject: "PHYSICS PYQs",
    author: "By Sharad Bajpai",
    bgColor: "bg-gradient-to-br from-[#A66E17] to-[#734A0B]",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=sharad&backgroundColor=transparent&clothingColor=262e33",
  },
  {
    id: 4,
    title: "JEE Chemistry PYQs (Class 11th)",
    count: 10,
    subject: "CHEMISTRY PYQs",
    author: "By Gaurav Singh",
    bgColor: "bg-gradient-to-br from-[#4A4B3A] to-[#2E2F23]",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=gaurav&backgroundColor=transparent&clothingColor=3c4f5c",
  },
  {
    id: 13,
    title: "JEE Mathematics PYQs (Class 11th)",
    count: 8,
    subject: "MATH PYQs",
    author: "By Arvind",
    bgColor: "bg-gradient-to-br from-[#3B2C4F] to-[#20152F]",
    teacherImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=arvind&backgroundColor=transparent&clothingColor=262e33",
  }
];

const TopEducatorCard = ({ index, title, teacherImg, bg, isDark }) => (
  <div className="relative w-[150px] flex-shrink-0 pt-2 pl-4 mr-4">
    {/* Card */}
    <div className="w-full h-[200px] rounded-[16px] overflow-hidden relative shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-lg" style={{ background: bg }}>
      <div className="px-3 pt-6 pb-2">
        <h3 className="text-white font-black italic text-[14px] text-center leading-tight drop-shadow-md tracking-tight">
          {title}
        </h3>
      </div>

      {/* Teacher Image */}
      <img src={teacherImg} alt="Educator" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[65%] object-contain z-10" />

      {/* Prime tag */}
      <div className="absolute top-2 right-2 bg-[#2E68FF] px-1 py-0.5 rounded-[4px] z-20 flex items-center justify-center">
        <span className="text-[7px] font-black text-white leading-none">Prime</span>
      </div>

      {/* Texture overlay for that gritty/chalkboard look */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay" />
    </div>

    {/* The Big Number */}
    <div className="absolute bottom-[-15px] left-[-15px] z-30 pointer-events-none drop-shadow-2xl">
      <span
        className="text-[120px] font-black italic leading-none tracking-tighter"
        style={{
          background: isDark ? 'linear-gradient(to bottom, #FFFFFF 0%, #777777 100%)' : 'linear-gradient(to bottom, #1E293B 0%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          WebkitTextStroke: isDark ? '2px rgba(255,255,255,0.3)' : '2px rgba(255,255,255,0.8)',
          filter: isDark ? 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))' : 'drop-shadow(4px 8px 12px rgba(0,0,0,0.15))'
        }}
      >
        {index}
      </span>
    </div>
  </div>
);

const VideoCard = ({ title, count, subject, author, bgColor, teacherImg }) => (
  <div className="w-[170px] flex-shrink-0 bg-white dark:bg-[#151924] rounded-[16px] p-2 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-md border border-slate-200 dark:border-slate-800/50">
    
    {/* Stack Container */}
    <div className="relative pt-3">
      {/* Back Tab */}
      <div className="absolute top-0 left-6 right-6 h-6 bg-slate-100 dark:bg-[#222A38] rounded-t-[10px] z-0 border-t border-x border-slate-200 dark:border-white/5" />
      {/* Middle Tab */}
      <div className="absolute top-1.5 left-3 right-3 h-6 bg-slate-200 dark:bg-[#3B4654] rounded-t-[10px] z-0 border-t border-x border-slate-300 dark:border-white/10" />

      {/* Main Image Block */}
      <div className={`relative h-28 rounded-[12px] overflow-hidden ${bgColor} z-10 shadow-sm border border-white/5`}>
        
        {/* Subject Text */}
        <div className="absolute top-[40%] -translate-y-1/2 left-3 z-10">
        <h4 className="text-white font-black text-[13px] uppercase leading-tight max-w-[85px] drop-shadow-md tracking-wide">{subject}</h4>
      </div>
      
      {/* Teacher Image */}
      <img src={teacherImg} alt={author} className="absolute bottom-0 right-[-5px] h-[90%] object-contain z-10" />
      
      {/* By Author */}
      <div className="absolute bottom-2 left-3 bg-white px-2 py-0.5 rounded-full z-10 shadow-sm">
        <span className="text-[9px] text-black font-extrabold">{author}</span>
      </div>
      
      {/* Prime tag */}
      <div className="absolute top-1.5 right-1.5 bg-[#2E68FF] px-1.5 py-0.5 rounded z-10 shadow-sm flex items-center justify-center">
        <span className="text-[7px] font-black text-white leading-none tracking-wider">Prime</span>
      </div>

      {/* Faded Locked Overlay */}
      <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.6)]">
          <Lock size={18} className="text-white opacity-90" />
        </div>
      </div>
    </div> {/* Close Main Image Block */}
    </div> {/* Close Stack Container */}

    {/* Text Content */}
    <div className="px-1.5 pb-1">
      <h3 className="text-slate-900 dark:text-white text-[13px] font-bold leading-snug mb-2 line-clamp-2">{title}</h3>
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <ListVideo size={14} className="opacity-70" />
        <span className="text-[12px] font-medium">{count} videos</span>
      </div>
    </div>
  </div>
);

export default function Prime() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeFilter, setActiveFilter] = useState('Class 11th - JEE');
  const filters = ['Class 11th - JEE', 'Class 12th - JEE', 'Dropper - JEE'];

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = window.__API_URL__
      ? window.__API_URL__.replace(/\/api$/, '')
      : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    return `${base}${url}`;
  };

  const name = user?.name || "Student";
  const resolvedAvatar = resolveMediaUrl(user?.profilePic) || DEFAULT_AVATAR(name);

  // Match the StudentLayout fake status bar color!
  const bgClass = isDark ? 'bg-[#0B101A]' : 'bg-white';

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${bgClass} font-sans`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ══ FIXED HEADER AREA ══ */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isDark ? 'bg-[#0B101A]' : 'bg-white'}`}
        style={{ paddingTop: STATUS_BAR_H }}
      >

        {/* Top Header Row */}
        <div className="flex items-center justify-between px-4 py-2 mt-2 mb-4">
          <div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mb-0.5">Current goal</p>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className={`font-bold text-[16px] font-display tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                IIT JEE
              </span>
              <ChevronDown size={16} className={isDark ? 'text-white' : 'text-slate-900'} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isDark ? 'bg-[#1A1F2E] border-slate-800' : 'bg-white border-slate-200'}`}>
              <Flame size={14} className="text-orange-500 fill-orange-500" />
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>0 day</span>
            </div>
            <div className={`w-8 h-8 rounded-full overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <img src={resolvedAvatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-5">
          <div className={`rounded-[12px] flex items-center gap-3 px-4 py-2.5 border ${isDark ? 'bg-[#1A1F2E] border-[#2A3441]' : 'bg-[#F8FAFF] border-slate-200'}`}>
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search for a lesson"
              className={`bg-transparent border-none outline-none text-[13px] font-medium placeholder:text-slate-500 w-full ${isDark ? 'text-white' : 'text-slate-900'}`}
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 pb-4 flex gap-2.5 overflow-x-auto hide-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all border ${activeFilter === f
                ? (isDark ? 'bg-white text-black border-white' : 'bg-slate-900 text-white border-slate-900')
                : (isDark ? 'bg-[#1A1F2E] text-slate-300 border-[#2A3441]' : 'bg-white text-slate-600 border-slate-200')
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ══ SCROLLABLE CONTENT ══ */}
      {/* Add top padding to account for the fixed header + status bar */}
      <div className="pt-[250px] px-4 space-y-6">

        {/* Top Educators / Prime Picks Section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className={`text-[17px] font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Our Educators
            </h2>
          </div>
          <div className="flex overflow-x-auto overflow-y-hidden hide-scrollbar pb-10 pt-4 -mx-4 px-4 pl-6">
            {TOP_EDUCATORS_DATA.map((item, i) => (
              <TopEducatorCard key={item.id} index={i + 1} isDark={isDark} {...item} />
            ))}
          </div>
        </div>

        {/* Section 1 */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className={`text-[17px] font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
              JEE Class 11 Complete Syllabus
            </h2>
            <ChevronRight size={18} className="text-[#C084FC]" />
          </div>
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar pb-6 pt-2 -mx-4 px-4">
            {SYLLABUS_VIDEOS.map(video => <VideoCard key={video.id} {...video} />)}
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-[17px] font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
              JEE PYQs (Class 11th)
            </h2>
            <ChevronRight size={18} className="text-[#C084FC]" />
          </div>
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar pb-6 pt-2 -mx-4 px-4">
            {PYQ_VIDEOS.map(video => <VideoCard key={video.id} {...video} />)}
          </div>
        </div>

      </div>

      {/* ══ FLOATING BOTTOM BANNER ══ */}
      {user?.approved === false && (
        <div className="fixed bottom-[60px] left-0 right-0 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] px-4 py-3.5 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(139,92,246,0.2)]">
          <div>
            <p className="text-white font-bold text-[14px]">2 videos left for today</p>
            <p className="text-white/80 text-[12px] font-medium mt-0.5">Get unlimited videos with Prime.</p>
          </div>
          <button className="bg-white text-[#7B46F6] px-4 py-2.5 rounded-lg text-[13px] font-bold shadow-sm active:scale-95 transition-transform flex-shrink-0 ml-4">
            Join Prime
          </button>
        </div>
      )}

    </div>
  );
}
