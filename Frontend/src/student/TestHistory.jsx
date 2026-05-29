import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ChevronRight, ArrowLeft, Search, Trophy, ChevronDown,
  Phone, Languages, Zap, Loader2, Target, Calendar, AlignLeft
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const STATUS_BAR_H = 43.5;

export default function TestHistory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMainTab, setActiveMainTab] = useState("Tests");
  const [activeSubTab, setActiveSubTab] = useState("Upcoming Tests");
  const [searchQuery, setSearchQuery] = useState("");
  const [testsData, setTestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState(null);

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    return `${cleanBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Fetch actual data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/student/all-tests-with-attempts");
        setTestsData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch tests error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const name = user?.name || "Student";
  const avatar = resolveMediaUrl(user?.profilePic) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4`;

  // Filter based on active tab and search query
  const displayedTests = testsData.filter(test => {
    const matchesSearch = test.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const isQuiz = test.examType?.toLowerCase().includes("quiz");
    const matchesTab = activeMainTab === "Quizzes" ? isQuiz : !isQuiz;
    return matchesSearch && matchesTab;
  });

  const toggleExpand = (id) => {
    setExpandedTestId(expandedTestId === id ? null : id);
  };

  const renderCard = (test) => {
    const isCompleted = test.attempts && test.attempts.length > 0;
    const isExpanded = expandedTestId === test._id;

    return (
      <div key={test._id} className={`rounded-xl p-4 shadow-sm border transition-all ${isDark ? 'bg-[#151E2E] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-[#25D3A4]' : 'text-[#1EBA9B]'}`}>
            {test.examType || "FULL SYLLABUS"}
          </span>
          <ChevronRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
        </div>

        <h3 className={`text-lg font-bold font-display leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {test.title}
        </h3>

        <p className={`text-sm mt-1 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          By {test.teacherName || "Educator"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {test.totalQuestions || 0} questions
            </span>
            <span className={`px-2.5 py-1 rounded text-xs font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {test.duration || 0} min
            </span>
          </div>

          {isCompleted ? (
            <button
              onClick={() => navigate(`/student/listedattempts/${test._id}`, { state: { test } })}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border font-bold text-xs ${isDark ? 'border-purple-500 text-purple-400 hover:bg-purple-500/10' : 'border-[#7A41F7] text-[#7A41F7] hover:bg-[#7A41F7]/10'}`}
            >
              <Target size={14} /> Attempts ({test.attempts.length})
            </button>
          ) : (
            <button
              onClick={() => navigate(`/student/test/${test._id}`)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border font-bold text-xs ${isDark ? 'border-blue-500 text-blue-500 hover:bg-blue-500/10' : 'border-[#1EBA9B] text-[#1EBA9B] hover:bg-[#1EBA9B]/10'}`}
            >
              <AlignLeft size={14} /> Enroll
            </button>
          )}
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
          <div>
            <p className="text-[10px] font-medium leading-tight mb-0.5 text-slate-300">Current goal</p>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="font-bold text-[17px] font-display tracking-tight text-white">
                IIT JEE
              </span>
              <ChevronDown size={18} className="text-white" strokeWidth={2.5} />
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

        {/* Main Segmented Tabs (Tests | Quizzes) */}
        <div className="px-4 mt-8 flex justify-center relative z-10">
          <div className="flex items-end w-full max-w-[280px] relative -mb-[1px]">

            {/* Tests Tab */}
            <div
              onClick={() => setActiveMainTab("Tests")}
              className="relative flex-1 h-12 flex items-center justify-center cursor-pointer group"
              style={{ zIndex: activeMainTab === "Tests" ? 10 : 1 }}
            >
              <div
                className={`absolute inset-0 rounded-t-xl transition-all duration-300 origin-bottom ${activeMainTab === "Tests"
                  ? (isDark ? 'bg-[#0B121C] border-t-2 border-[#00A3FF] shadow-lg' : 'bg-[#F4F7FC] border-t-2 border-[#1EBA9B] shadow-sm')
                  : (isDark ? 'bg-[#0B121C] opacity-80 hover:opacity-100' : 'bg-[#F4F7FC] opacity-80 hover:opacity-100')
                  }`}
                style={{ transform: 'perspective(50px) rotateX(12deg)' }}
              />
              <span className={`relative z-10 mt-1.5 font-bold text-[15px] tracking-wide ${activeMainTab === "Tests"
                ? (isDark ? 'text-white' : 'text-slate-900')
                : (isDark ? 'text-slate-300' : 'text-[#2D5588]')
                }`}>
                Tests
              </span>
            </div>

            {/* Quizzes Tab */}
            <div
              onClick={() => setActiveMainTab("Quizzes")}
              className="relative flex-1 h-12 flex items-center justify-center cursor-pointer group -ml-3"
              style={{ zIndex: activeMainTab === "Quizzes" ? 10 : 1 }}
            >
              <div
                className={`absolute inset-0 rounded-t-xl transition-all duration-300 origin-bottom ${activeMainTab === "Quizzes"
                  ? (isDark ? 'bg-[#0B121C] border-t-2 border-[#00A3FF] shadow-lg' : 'bg-[#F4F7FC] border-t-2 border-[#1EBA9B] shadow-sm')
                  : (isDark ? 'bg-[#0B121C] opacity-80 hover:opacity-100' : 'bg-[#F4F7FC] opacity-80 hover:opacity-100')
                  }`}
                style={{ transform: 'perspective(50px) rotateX(12deg)' }}
              />
              <span className={`relative z-10 mt-1.5 font-bold text-[15px] tracking-wide ${activeMainTab === "Quizzes"
                ? (isDark ? 'text-white' : 'text-slate-900')
                : (isDark ? 'text-slate-300' : 'text-[#2D5588]')
                }`}>
                Quizzes
              </span>
            </div>

          </div>
        </div>
      </div>
      {/* ══ FIXED SEARCH & SUB-TABS AREA ══ */}
      <div
        className={`fixed left-0 right-0 z-40 ${isDark ? 'bg-[#0B121C]' : 'bg-[#F4F7FC]'}`}
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
          <div className="flex px-2 w-max min-w-full">
            {["Upcoming Tests", "Ongoing Tests", "Previous Year Tests"].map(tab => (
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
        <div className="px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar">
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
          ) : displayedTests.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium">No records found.</div>
          ) : (
            displayedTests.map(renderCard)
          )}
        </div>
      </div>

      {/* ── COUNSELLOR MODAL ── */}
      {showCounsellorModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          onClick={() => setShowCounsellorModal(false)}
        >
          <div className="absolute inset-0 bg-black/65 transition-opacity" style={{ backdropFilter: 'blur(3px)' }} />
          <div
            className={`relative w-full max-w-md overflow-hidden transition-transform animate-in slide-in-from-bottom-full duration-300 ${isDark ? 'bg-[#111827]' : 'bg-white'}`}
            style={{ borderRadius: '12px 12px 0 0' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-3">
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
            </div>
            <div className="px-6 pt-8 pb-2">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className={`font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: 19 }}>
                    Need help with your subscription?
                  </h2>
                  <p className={`text-[12px] mt-2 leading-relaxed ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
                    Talk to our experts who will guide you with all you need to crack it.
                  </p>
                </div>
                <div className={`w-[68px] h-[68px] rounded-full overflow-hidden flex-shrink-0 border-2 ${isDark ? 'border-white/10 bg-[#1F2937]' : 'border-slate-200 bg-slate-100'}`}>
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=counsellorF&backgroundColor=b6e3f4&clothingColor=3c4f5c"
                    className="w-full h-full object-cover"
                    alt="Expert"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 pt-6 pb-3">
              <a
                href="tel:+918585858585"
                className={`w-full flex items-center justify-center gap-3 active:scale-95 transition-transform ${isDark ? 'bg-white text-[#111827]' : 'bg-[#1EBA9B] text-white shadow-md'}`}
                style={{ borderRadius: 8, padding: '14px 24px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="font-bold" style={{ fontSize: 15 }}>+91 8585858585</span>
              </a>
            </div>
            <div className="px-6 pb-12">
              <button
                onClick={() => setShowCounsellorModal(false)}
                className={`w-full flex items-center justify-center gap-1.5 py-4 font-bold tracking-widest active:opacity-70 transition-opacity ${isDark ? 'text-white' : 'text-[#1EBA9B]'}`}
                style={{ fontSize: 11.5, letterSpacing: '0.08em' }}
              >
                GET A CALL FROM US <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}