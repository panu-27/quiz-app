import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import CounsellorModal from "../components/CounsellorModal";
import {
  ChevronRight, Search, ChevronDown, Lock,
  Phone, Languages, Loader2, BookOpen, Clock, ShoppingBag
} from "lucide-react";

const STATUS_BAR_H = 28.5;

export default function MyLearning() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMainTab, setActiveMainTab] = useState("Courses");
  const [activeSubTab, setActiveSubTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showCounsellorModal) {
      document.body.setAttribute('data-hide-nav', 'true');
    } else {
      document.body.removeAttribute('data-hide-nav');
    }
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, [showCounsellorModal]);

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    return `${cleanBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const name = user?.name || "Student";
  const avatar = resolveMediaUrl(user?.profilePic) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`;

  // Mock enrolled courses data
  const enrolledCourses = [];

  const filteredCourses = enrolledCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeSubTab === "Ongoing") {
      return c.status === "Ongoing";
    }
    if (activeSubTab === "Completed") {
      return c.status === "Completed";
    }
    return true;
  });

  const renderCard = (course) => {
    return (
      <div
        key={course._id}
        className={`relative overflow-hidden rounded-[20px] border transition-all duration-300 active:scale-[0.99] ${
          isDark 
            ? 'bg-[#111827] border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.28)]' 
            : 'bg-white border-slate-200 shadow-[0_4px_24px_rgba(15,23,42,0.06)]'
        }`}
      >
        <div className="p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#25D3A4]/15 flex items-center justify-center flex-shrink-0">
            <BookOpen size={22} className="text-[#25D3A4]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-[15px] font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {course.title}
            </h4>
            <p className={`text-[12px] mt-0.5 font-medium ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
              {course.educator}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${isDark ? 'bg-white/[0.06] text-white/50' : 'bg-slate-100 text-slate-500'}`}>
                <Clock size={11} /> {course.lessonsCount} lessons
              </span>
            </div>
          </div>
          <ChevronRight size={18} className={`mt-1 flex-shrink-0 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-[#0B121C]' : 'bg-[#F4F7FC]'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ══ FIXED HEADER AREA ══ */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          paddingTop: STATUS_BAR_H,
          background: 'radial-gradient(ellipse 60% 100% at 70% 20%, rgba(255,255,255,0.12) 0%, #2D5588 40%, #2D5588 100%)',
          backgroundColor: '#2D5588'
        }}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between px-5 py-2 mt-2 mb-4">
          <div onClick={() => { if (!user?.approved) navigate('/student/goal-selection'); }}>
            <p className="text-[10px] font-medium leading-tight mb-0.5 text-slate-300">Current goal</p>
            <div className={`flex items-center gap-1 ${!user?.approved ? 'cursor-pointer' : ''}`}>
              <span className="font-bold text-[17px] font-display tracking-tight text-white">
                {localStorage.getItem("selectedGoal") || "Select Goal"}
              </span>
              {!user?.approved && <ChevronDown size={18} className="text-white" strokeWidth={2.5} />}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCounsellorModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-colors bg-[#ffffff1a] text-white hover:bg-white/20"
            >
              <Phone size={14} fill="white" strokeWidth={0} />
              <span className="text-xs font-bold tracking-wide">Talk to counsellor</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent">
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Main Segmented Tabs */}
        <div className="px-4 mt-4 flex justify-center relative z-10">
          <div className="flex items-end w-full max-w-[280px] relative -mb-[1px]">
            {/* Courses Tab */}
            <div
              onClick={() => setActiveMainTab("Courses")}
              className="relative flex-1 h-12 flex items-center justify-center cursor-pointer group"
              style={{ zIndex: activeMainTab === "Courses" ? 10 : 1 }}
            >
              <div
                className={`absolute inset-0 rounded-t-xl transition-all duration-300 origin-bottom ${activeMainTab === "Courses"
                  ? (isDark ? 'bg-[#0B121C] border-t-2 border-[#00A3FF] shadow-lg' : 'bg-[#F4F7FC] border-t-2 border-[#1EBA9B] shadow-sm')
                  : (isDark ? 'bg-[#0B121C] opacity-80 hover:opacity-100' : 'bg-[#F4F7FC] opacity-80 hover:opacity-100')
                  }`}
                style={{ transform: 'perspective(50px) rotateX(12deg)' }}
              />
              <span className={`relative z-10 mt-1.5 font-bold text-[15px] tracking-wide ${activeMainTab === "Courses"
                ? (isDark ? 'text-white' : 'text-slate-900')
                : (isDark ? 'text-slate-300' : 'text-[#2D5588]')
                }`}>
                Courses
              </span>
            </div>

            {/* Materials Tab */}
            <div
              className="relative flex-1 h-12 flex items-center justify-center group -ml-3 opacity-60 cursor-not-allowed"
              style={{ zIndex: 1 }}
            >
              <div
                className={`absolute inset-0 rounded-t-xl transition-all duration-300 origin-bottom ${isDark ? 'bg-[#0B121C]' : 'bg-[#F4F7FC]'}`}
                style={{ transform: 'perspective(50px) rotateX(12deg)' }}
              />
              <span className={`relative z-10 mt-1.5 font-bold text-[15px] tracking-wide flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Materials <Lock size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FIXED SEARCH & SUB-TABS AREA ══ */}
      <div
        className={`fixed -mt-5 left-0 right-0 z-40 ${isDark ? 'bg-[#0B121C]' : 'bg-[#F4F7FC]'}`}
        style={{ top: STATUS_BAR_H + 144 }}
      >
        {/* Search & Translation */}
        <div className="px-4 py-4 flex items-center gap-3">
          <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full border ${isDark ? 'bg-[#151E2E] border-slate-800' : 'bg-white border-slate-200'}`}>
            <Search size={18} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
            <input
              type="text"
              placeholder={`Search ${activeMainTab.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent text-sm focus:outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
            />
          </div>
          <button className={`p-2.5 rounded-full border ${isDark ? 'bg-[#151E2E] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
            <Languages size={18} />
          </button>
        </div>

        {/* Secondary Scrollable Tabs */}
        <div className={`w-full overflow-x-auto no-scrollbar border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex px-2 -mt-2 w-max min-w-full">
            {["All", "Ongoing", "Completed"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-3 text-[13px] font-bold whitespace-nowrap transition-all border-b-2 ${activeSubTab === tab
                  ? (isDark ? 'border-blue-500 text-blue-500' : 'border-[#1EBA9B] text-[#1EBA9B]')
                  : `border-transparent hover:border-slate-500/30 ${isDark ? 'text-slate-400' : 'text-slate-500'}`
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT AREA ══ */}
      <div
        className={`flex-1 flex flex-col`}
        style={{ paddingTop: STATUS_BAR_H + 144 + 118 }} // Offset for BOTH fixed headers
      >
        {/* Filters */}
        <div className="px-4 -mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${isDark ? 'bg-[#151E2E] border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            Educator <ChevronDown size={14} />
          </button>
          <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors ${isDark ? 'bg-[#151E2E] border-slate-800 text-blue-400 hover:bg-slate-800' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}>
            All subscription types <ChevronDown size={14} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 px-4 py-4 space-y-4 pb-24">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="mb-5">
                <BookOpen size={40} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              </div>

              <h3 className={`text-[17px] font-bold mb-1.5 font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>No courses found</h3>
              <p className={`text-[13px] font-medium max-w-[240px] mb-7 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {searchQuery || activeSubTab !== "All" 
                  ? "We couldn't find any courses matching your criteria." 
                  : "You haven't enrolled in any courses yet."}
              </p>

              <button
                onClick={() => navigate('/student/prime')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold border active:scale-95 transition-all ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
              >
                <ShoppingBag size={14} />
                Explore Prime
              </button>
            </div>
          ) : (
            filteredCourses.map(renderCard)
          )}
        </div>
      </div>

      {/* ── COUNSELLOR MODAL ── */}
      <CounsellorModal
        isOpen={showCounsellorModal}
        onClose={() => setShowCounsellorModal(false)}
        title="Need help with your learning?"
      />
    </div>
  );
}
