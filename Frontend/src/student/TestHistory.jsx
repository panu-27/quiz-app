import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  ChevronRight, ArrowLeft, Search, Trophy, ChevronDown,
  Phone, Languages, Zap, Loader2, Target, Calendar, AlignLeft,
  Pin, Edit2, Check, X, History, User, Play, Clock, ArrowRight
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import CounsellorModal from "../components/CounsellorModal";
import useBackButton from "../hooks/useBackButton";

const STATUS_BAR_H = 28.5;

export default function TestHistory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState("Tests");
  const [activeSubTab, setActiveSubTab] = useState(location.state?.activeSubTab || "Completed");
  const [searchQuery, setSearchQuery] = useState("");
  const [testsData, setTestsData] = useState([]);
  const [quizzesData, setQuizzesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [editingQuizTitle, setEditingQuizTitle] = useState("");

  const handlePinToggle = async (test) => {
    if (!test.isGeneratedQuiz) return;
    try {
      const newStatus = !test.isPinned;
      await api.put(`/quiz/attempts/${test._id}/pin`, { isPinned: newStatus });
      setQuizzesData(prev => {
        const updated = prev.map(q => q._id === test._id ? { ...q, isPinned: newStatus } : q);
        return updated.sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1));
      });
    } catch (err) {
      console.error("Failed to pin:", err);
    }
  };

  const handleRenameSubmit = async (testId) => {
    if (!editingQuizTitle.trim()) return;
    try {
      await api.put(`/quiz/attempts/${testId}/rename`, { customTitle: editingQuizTitle });
      setQuizzesData(prev => prev.map(q => q._id === testId ? { ...q, title: editingQuizTitle } : q));
      setEditingQuizId(null);
    } catch (err) {
      console.error("Failed to rename:", err);
    }
  };

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

  useBackButton(() => {
    setShowCounsellorModal(false);
    return true;
  }, showCounsellorModal);

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
        const [testsRes, quizzesRes] = await Promise.all([
            api.get("/student/all-tests-with-attempts").catch(e => { console.error("Test fetch err:", e); return { data: [] }; }),
            api.get("/quiz/attempts?limit=100").catch(e => { console.error("Quiz fetch err:", e); return { data: { success: false } }; })
        ]);
        setTestsData(Array.isArray(testsRes.data) ? testsRes.data : []);
        console.log("FETCHED TESTS:", testsRes.data);
        console.log("FETCHED QUIZZES RESPONSE:", quizzesRes.data);

        if (quizzesRes.data?.success && quizzesRes.data?.data) {
            // ONLY keep actual practice/custom quizzes. The backend now returns attemptType and testId.
            const practiceAttempts = quizzesRes.data.data.filter(attempt => attempt.attemptType === 'practice' || !attempt.testId);
            
            const groupedQuizzes = {};
            practiceAttempts.forEach(attempt => {
                const groupId = attempt.parentAttemptId || attempt._id;
                if (!groupedQuizzes[groupId]) {
                    groupedQuizzes[groupId] = { parent: null, attempts: [] };
                }
                groupedQuizzes[groupId].attempts.push(attempt);
                if (!attempt.parentAttemptId || attempt._id === attempt.parentAttemptId) {
                    groupedQuizzes[groupId].parent = attempt;
                }
            });

            const mappedQuizzes = Object.keys(groupedQuizzes).map(groupId => {
                const group = groupedQuizzes[groupId];
                group.attempts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const representative = group.parent || group.attempts[0];
                const totalQs = (representative.totalCorrect || 0) + (representative.totalWrong || 0) + (representative.totalUnattempted || 0);
                
                const subjects = new Set();
                let chosenDuration = 0;
                
                if (representative.blocks && Array.isArray(representative.blocks)) {
                    representative.blocks.forEach(block => {
                        chosenDuration += (block.duration || 0);
                        if (block.sections && Array.isArray(block.sections)) {
                            block.sections.forEach(section => {
                                if (section.subjectName) subjects.add(section.subjectName);
                            });
                        }
                    });
                }
                const subjectDetails = subjects.size > 0 ? Array.from(subjects).join(", ") : "Mixed Subjects";
                
                return {
                    _id: groupId,
                    title: representative.customTitle || "Practice Quiz",
                    examType: "Quiz",
                    teacherName: subjectDetails,
                    totalQuestions: totalQs,
                    duration: chosenDuration > 0 ? chosenDuration : (Math.round((representative.timeTaken || 0) / 60) || 0),
                    status: representative.status,
                    isGeneratedQuiz: true,
                    isPinned: representative.isPinned || false,
                    attempts: group.attempts,
                    startTime: representative.createdAt,
                    endTime: representative.createdAt,
                    representative
                };
            });
            mappedQuizzes.sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1));
            setQuizzesData(mappedQuizzes);
        } else {
            console.warn("Quiz fetch failed or no data:", quizzesRes.data);
        }
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
  const combinedData = [...testsData, ...quizzesData];
  const displayedTests = combinedData.filter(test => {
    const matchesSearch = test.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeMainTab === "Quizzes" ? test.isGeneratedQuiz : !test.isGeneratedQuiz;

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

  const renderCard = (test) => {
    const isCompleted = test.attempts && test.attempts.length > 0;

    return (
      <div key={test._id} className={`rounded-xl p-4  border transition-all ${isDark ? 'bg-[#151E2E] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-[#25D3A4]' : 'text-[#1EBA9B]'}`}>
            {test.examType || "FULL SYLLABUS"}
          </span>
          <div className="flex items-center gap-2">
            {test.isGeneratedQuiz && (
                <button onClick={(e) => { e.stopPropagation(); handlePinToggle(test); }} className={`p-1.5 rounded-full transition-colors ${test.isPinned ? 'bg-amber-100 text-amber-600' : isDark ? 'bg-white/5 text-slate-500 hover:text-slate-300' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}>
                    <Pin size={14} fill={test.isPinned ? "currentColor" : "none"} />
                </button>
            )}
            <ChevronRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
          </div>
        </div>

        {editingQuizId === test._id ? (
          <div className="flex items-center gap-2 mb-1">
            <input 
              autoFocus
              value={editingQuizTitle} 
              onChange={(e) => setEditingQuizTitle(e.target.value)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-[15px] font-bold border ${isDark ? 'bg-[#0B121C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'} outline-none`}
            />
            <button onClick={() => handleRenameSubmit(test._id)} className="p-1.5 bg-green-500 text-white rounded-lg">
                <Check size={16} />
            </button>
            <button onClick={() => setEditingQuizId(null)} className="p-1.5 bg-red-500 text-white rounded-lg">
                <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className={`text-[15px] font-bold tracking-wide leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {test.title}
            </h3>
            {test.isGeneratedQuiz && (
                <button onClick={() => { setEditingQuizId(test._id); setEditingQuizTitle(test.title); }} className={isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}>
                    <Edit2 size={14} />
                </button>
            )}
          </div>
        )}

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
              onClick={() => {
                if (test.isGeneratedQuiz) {
                  navigate(`/student/listedattempts/quiz/${test._id}`, { state: { test } });
                } else {
                  navigate(`/student/listedattempts/${test._id}`, { state: { test } });
                }
              }}
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
        className="fixed top-0 left-0 lg:left-[280px] right-0 z-50"
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

        {/* Main Segmented Tabs (Tests | Quizzes) */}
        <div className="px-4 mt-4 flex justify-center relative z-10">
          <div className="flex items-end w-full max-w-[280px] relative -mb-[1px]">

            {/* Tests Tab */}
            <div
              onClick={() => {
                setActiveMainTab("Tests");
                if (!["Upcoming", "Ongoing", "Completed", "Missed"].includes(activeSubTab)) {
                  setActiveSubTab("Upcoming");
                } else if (activeSubTab === "Completed") {
                  setActiveSubTab("Upcoming");
                }
              }}
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
              onClick={() => {
                setActiveMainTab("Quizzes");
                setActiveSubTab("Completed");
              }}
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
        className={`fixed -mt-5 left-0 lg:left-[280px] right-0 z-40 ${isDark ? 'bg-[#0B121C]' : 'bg-[#F4F7FC]'}`}
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
            {(activeMainTab === "Tests" ? ["Upcoming", "Ongoing", "Completed", "Missed"] : ["Completed", "Ongoing"]).map(tab => (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayedTests.map(renderCard)}
            </div>
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
