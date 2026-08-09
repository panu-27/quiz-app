import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, ChevronRight, Loader2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const STATUS_BAR_H = 28.5;

export default function ListedAttempts() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { testId } = useParams();

  const isApproved = !!user?.approved;

  const [test, setTest] = useState(location.state?.test || null);
  const [loading, setLoading] = useState(!test);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Manage status bar color
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => { });
      StatusBar.setBackgroundColor({ color: isDark ? '#0E131F' : '#EAEDF2' }).catch(() => { });
    }
  }, [isDark]);

  useEffect(() => {
    if (!test) {
      const fetchTest = async () => {
        try {
          let found = null;
          if (location.pathname.includes('/quiz/')) {
            const { data } = await api.get("/quiz/attempts?limit=100");
            const practiceAttempts = data.data?.filter(a => a.attemptType === 'practice' || !a.testId) || [];
            const group = practiceAttempts.filter(a => (a.parentAttemptId || a._id) === testId);
            if (group.length > 0) {
              group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
              const representative = group.find(a => (!a.parentAttemptId || a._id === a.parentAttemptId)) || group[0];
              const totalQs = (representative.totalCorrect || 0) + (representative.totalWrong || 0) + (representative.totalUnattempted || 0);
              const subjects = new Set();
              if (representative.blocks) {
                representative.blocks.forEach(b => {
                  b.sections?.forEach(s => {
                    if (s.subjectName) subjects.add(s.subjectName);
                  });
                });
              }
              found = {
                _id: testId,
                title: representative.customTitle || "Practice Quiz",
                teacherName: subjects.size > 0 ? Array.from(subjects).join(", ") : "Mixed Subjects",
                totalQuestions: totalQs,
                isGeneratedQuiz: true,
                attempts: group,
                representative
              };
            }
          } else {
            const { data } = await api.get("/student/all-tests-with-attempts");
            found = data.find(t => t._id === testId);
          }
          if (found) setTest(found);
        } catch (error) {
          console.error("Error fetching test attempts:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [test, testId, location.pathname]);

  if (loading) {
    return (
      <div className={`min-h-[100dvh] relative ${isDark ? 'bg-[#0E131F]' : 'bg-[#EAEDF2]'}`}>
        <style>{`
          @keyframes ytLoad {
            0% { transform: translateX(-100%); width: 30%; }
            50% { transform: translateX(50%); width: 60%; }
            100% { transform: translateX(300%); width: 30%; }
          }
        `}</style>
        <div className="absolute top-0 left-0 right-0 h-[3px] z-[9999] overflow-hidden">
          <div className="h-full bg-[#2563EB]" style={{ animation: 'ytLoad 1.5s infinite ease-in-out' }}></div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#EAEDF2] text-[#1E293B]'}`}>
        <p>Test not found.</p>
        <button onClick={() => navigate('/student/history')} className="mt-4 px-4 py-2 bg-[#2563EB] text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  const handleAttemptAgain = () => {
    if (test.isGeneratedQuiz && test.representative) {
      const parent = test.representative;
      const cleanBlocks = (parent.blocks || []).map(b => ({
        ...b,
        sections: (b.sections || []).map(s => ({
          ...s,
          questions: (s.questions || []).map(q => ({
            ...q,
            chosenOption: -1,
            timeTakenSeconds: 0
          }))
        }))
      }));
      const examData = {
        title: parent.customTitle || "Practice Quiz",
        blocks: cleanBlocks,
        duration: parent.timeTaken
      };
      navigate('/student/quiztest', { state: { questions: examData, parentAttemptId: test._id } });
    } else {
      navigate(`/student/test/${test._id}`);
    }
  };

  const filteredAttempts = (test.attempts || []).filter((attempt) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const attemptNumStr = `attempt #${attempt.attemptNumber}`;
      const scoreStr = `${attempt.score} pts`;
      if (!attemptNumStr.includes(q) && !scoreStr.includes(q) && !String(attempt.attemptNumber).includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#EAEDF2] text-[#1E293B]'
        }`}
    >
      <div
        className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#EAEDF2]'
          }`}
        style={{ paddingTop: STATUS_BAR_H + 8 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => navigate(-1)}
              className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'
                }`}
            >
              <ArrowLeft size={24} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className={`text-[17px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'
                }`}>
                {test.title}
              </h1>
              <p className={`text-[11px] font-medium truncate mt-0.5 ${isDark ? 'text-[#8492A6]' : 'text-slate-500'
                }`}>
                {test.isGeneratedQuiz && test.teacherName ? `${test.teacherName} • ` : ''}{test.totalQuestions || 0} Qs
              </p>
            </div>
          </div>
        </div>

        <div className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full border ${isDark ? 'bg-[#151E2E] border-slate-800' : 'bg-white border-slate-200'}`}>
          <Search size={18} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          <input
            type="text"
            placeholder="Search attempts (e.g. 1, 2)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full font-medium placeholder:text-slate-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto px-5 space-y-3 no-scrollbar ${!isApproved ? 'pb-40' : 'pb-28'}`}>
        {filteredAttempts.length === 0 ? (
          <p className={`text-center mt-10 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
            No attempts found.
          </p>
        ) : (
          filteredAttempts.map((attempt) => {
            const totalAns = (attempt.totalCorrect || 0) + (attempt.totalWrong || 0);
            // If totalAns is 0, we can fallback to score > 0 logic or just 0%.
            const accuracyPct = totalAns > 0 ? Math.round(((attempt.totalCorrect || 0) / totalAns) * 100) : 0;
            const accent = '#3B82F6';

            return (
              <div
                key={attempt._id}
                onClick={() => {
                  if (test.isGeneratedQuiz) {
                    navigate(`/student/analytics/quiz/${attempt._id}`);
                  } else {
                    navigate(`/student/analytics/${test._id}/attempt/${attempt.attemptNumber}`);
                  }
                }}
                style={{
                  background: isDark ? '#111827' : '#FFFFFF',
                  border: isDark ? '1px solid #1F2937' : '1px solid #F1F5F9',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                  <h4 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isDark ? '#F8FAFC' : '#1E293B',
                    margin: '0 0 6px 0',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    Attempt #{String(attempt.attemptNumber).padStart(2, "0")}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 500 }}>
                      <span style={{ color: accent, fontWeight: 800 }}>{accuracyPct}% Accuracy</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, height: 4, background: isDark ? '#1F2937' : '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${accuracyPct}%`, background: accent, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: isDark ? '#1F2937' : '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isDark ? '#94A3B8' : '#64748B'
                }}>
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={`fixed left-0 right-0 px-5 pt-6 pb-4 z-40 ${isDark ? 'bg-gradient-to-t from-[#0E131F] via-[#0E131F] to-transparent' : 'bg-gradient-to-t from-[#EAEDF2] via-[#EAEDF2] to-transparent'} ${!isApproved ? 'bottom-[76px]' : 'bottom-0'}`}>
        <button
          onClick={handleAttemptAgain}
          className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition-colors shadow-lg"
        >
          Attempt Again
        </button>
      </div>

      {user?.approved === false && (
        <div className="fixed bottom-0 left-0 right-0 z-[5010] bg-gradient-to-r from-[#1EBA9B] to-[#25D3A4] text-white px-5 py-4 flex items-center justify-between shadow-[0_-4px_20px_rgba(30,186,155,0.2)]">
          <div className="flex flex-col">
            <span className="font-bold text-[12px] leading-tight">Get access to all the batches</span>
            <span className="text-[13px] text-white/90 mt-0.5">Please fill out this form</span>
          </div>
          <button
            onClick={() => window.open('https://forms.gle/oHKY3wtTYrpGGDp76', '_blank')}
            className="bg-white text-[#1EBA9B] px-5 py-2 rounded-lg font-bold text-[14px] active:scale-95 transition-transform whitespace-nowrap"
          >
            Enquiry Form
          </button>
        </div>
      )}
    </div>
  );
}
