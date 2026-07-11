import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ChevronRight, ArrowLeft, Search, Trophy, ChevronDown,
  Phone, Languages, Zap, Loader2, Target, Calendar, AlignLeft
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import CounsellorModal from "../components/CounsellorModal";

const STATUS_BAR_H = 28.5;

export default function TestHistory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMainTab, setActiveMainTab] = useState("Tests");
  const [activeSubTab, setActiveSubTab] = useState("Upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [testsData, setTestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState(null);

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

    if (!matchesSearch || !matchesTab) return false;

    const isCompleted = test.attempts && test.attempts.length > 0;
    const now = new Date();
    const startTime = test.startTime ? new Date(test.startTime) : null;
    const endTime = test.endTime ? new Date(test.endTime) : null;

    if (activeSubTab === "Upcoming") {
      if (test.status) return test.status.toLowerCase() === "upcoming";
      return !isCompleted && (!startTime || startTime > now);
    }
    if (activeSubTab === "Ongoing") {
      if (test.status) return test.status.toLowerCase() === "ongoing";
      return !isCompleted && startTime && startTime <= now && (!endTime || endTime > now);
    }
    if (activeSubTab === "Completed") {
      if (test.status) return test.status.toLowerCase() === "completed" || isCompleted;
      return isCompleted;
    }
    if (activeSubTab === "Missed") {
      if (test.status) return test.status.toLowerCase() === "missed";
      return !isCompleted && endTime && endTime < now;
    }

    return true;
  });

  const toggleExpand = (id) => {
    setExpandedTestId(expandedTestId === id ? null : id);
  };

  const renderCard = (test) => {
    const isCompleted = test.attempts && test.attempts.length > 0;
    const isExpanded = expandedTestId === test._id;

    return (
      <div key={test._id} className={`rounded-xl p-4  border transition-all ${isDark ? 'bg-[#151E2E] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-[#25D3A4]' : 'text-[#1EBA9B]'}`}>
            {test.examType || "FULL SYLLABUS"}
          </span>
          <ChevronRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
        </div>

        <h3 className={`text-[15px] font-bold tracking-wide leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg border font-bold text-xs bg-blue-500 text-white border-blue-500 hover:bg-blue-600 shadow-sm transition-colors`}
            >
              Show Attempts
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
                {localStorage.getItem("selectedGoal") || "Select Goal"}
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
        <div className="px-4 mt-4 flex justify-center relative z-10">
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
            {["Upcoming", "Ongoing", "Completed", "Missed"].map(tab => (
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
          ) : displayedTests.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-medium">No records found.</div>
          ) : (
            displayedTests.map(renderCard)
          )}
        </div>
      </div>

      {/* ── COUNSELLOR MODAL ── */}
      <CounsellorModal
        isOpen={showCounsellorModal}
        onClose={() => setShowCounsellorModal(false)}
        title="Need help with your subscription?"
      />

    </div>
  );
}