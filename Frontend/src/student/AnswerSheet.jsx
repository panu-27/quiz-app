import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft, Download, Trophy, Target, Zap,
  CheckCircle2, Loader2, ChevronDown, X, Share2,
  Circle, Triangle, BarChart2, ClipboardList,
  Atom, FlaskConical, Dna, ChevronRight, ChevronLeft, AlertTriangle
} from "lucide-react";
import LoaderAnalysis from "./LoaderAnalysis";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

const STATUS_BAR_H = 43.5;

const REPORT_REASONS = [
  { key: 'incorrect_options', label: 'Options are incorrect' },
  { key: 'incomplete_question', label: 'Incomplete question' },
  { key: 'incomplete_solution', label: 'Incomplete solution' },
  { key: 'incorrect_solution', label: 'Solution explanation is incorrect' },
  { key: 'out_of_syllabus', label: 'Out of syllabus' },
  { key: 'other', label: 'Other' }
];

// ─── KaTeX loader ─────────────────────────────────────────────────────────────
const loadKaTeX = (() => {
  let loaded = false, loading = null;
  return () => {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(resolve => {
      if (!document.querySelector('link[href*="katex"]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
        document.head.appendChild(l);
      }
      if (!document.querySelector('script[src*="katex.min.js"]')) {
        const s1 = document.createElement('script');
        s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
        s1.onload = () => {
          const s2 = document.createElement('script');
          s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
          s2.onload = () => { loaded = true; resolve(); };
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      } else { loaded = true; resolve(); }
    });
    return loading;
  };
})();

const KATEX_OPTS = {
  delimiters: [
    { left: '$$', right: '$$', display: true  },
    { left: '$',  right: '$',  display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true  },
  ],
  throwOnError: false,
};

// ─── LatexText component ───────────────────────────────────────────────────────
const LatexText = ({ text, style: styleProp, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = text || '';
    loadKaTeX().then(() => {
      if (!ref.current || !window.renderMathInElement) return;
      window.renderMathInElement(ref.current, KATEX_OPTS);
    });
  }, [text]);
  return <span ref={ref} className={className} style={styleProp} />;
};

export default function AnswerSheet() {
  const { testId, attemptNumber, attemptId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false); 
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing]         = useState(false);
  const [selectedSubjectName, setSelectedSubjectName] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const [reportTarget, setReportTarget] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [reportDone, setReportDone] = useState(false);

  const listRef = useRef(null);

  const handleHorizontalScroll = (e) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.clientWidth;
    if (itemWidth === 0) return;
    
    const activeIdx = Math.round(scrollLeft / itemWidth);
    
    if (activeIdx !== activeQuestionIndex && !isNaN(activeIdx) && activeIdx >= 0) {
      setActiveQuestionIndex(activeIdx);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      const newIdx = activeQuestionIndex - 1;
      const element = document.getElementById(`q-card-${newIdx}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  };

  const handleNext = () => {
    const questions = (data?.groupedAnalysis || []).find(s => s.subjectName === selectedSubjectName)?.questions || [];
    if (activeQuestionIndex < questions.length - 1) {
      const newIdx = activeQuestionIndex + 1;
      const element = document.getElementById(`q-card-${newIdx}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  };

  const handleReport = async () => {
    if (!reportTarget?._id || selectedReasons.length === 0) return;
    const combinedReason = selectedReasons.join(', ') + (additionalInfo ? ` | Details: ${additionalInfo}` : '');
    try {
      await api.post(`/quiz/questions/${reportTarget._id}/report`, { reason: combinedReason });
      setReportDone(true);
      setTimeout(() => {
        setReportTarget(null);
        setReportDone(false);
        setSelectedReasons([]);
        setAdditionalInfo('');
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavBack = () => {
    if (attemptId) {
      navigate(`/student/analytics/quiz/${attemptId}`);
    } else {
      navigate(`/student/analytics/${testId}/attempt/${attemptNumber}`);
    }
  };

  const handleClose = () => {
    navigate("/student/history");
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(false);
      try {
        if (attemptId) {
          const { data: response } = await api.get(`/quiz/attempts/${attemptId}`);
          const attempt = response.data || response;
          
          const totalMaxScore = attempt.blocks.reduce((acc, block) => {
            return acc + block.sections.reduce((sAcc, sec) => {
              let maxSecScore = 0;
              sec.questions.forEach(q => {
                const name = (sec.subjectName || '').toLowerCase();
                if (name.includes('math')) maxSecScore += 2;
                else if (name.includes('biol')) maxSecScore += 1;
                else maxSecScore += 2;
              });
              return sAcc + maxSecScore;
            }, 0);
          }, 0);

          const mappedResult = {
            testTitle: "Practice Quiz",
            overallScore: attempt.totalScore,
            totalMaxScore,
            rank: "N/A",
            totalCorrect: attempt.totalCorrect,
            totalWrong: attempt.totalWrong,
            totalUnattempted: attempt.totalUnattempted,
            groupedAnalysis: attempt.blocks.flatMap(block => 
              block.sections.map(section => ({
                subjectName: section.subjectName,
                score: section.score,
                maxScore: section.questions.reduce((s, q) => {
                  const name = (section.subjectName || '').toLowerCase();
                  if (name.includes('math')) return s + 2;
                  if (name.includes('biol')) return s + 1;
                  return s + 2;
                }, 0),
                correct: section.correct,
                wrong: section.wrong,
                unattempted: section.unattempted,
                questions: section.questions.map(q => ({
                  _id: q._id || q.id || null,
                  questionText: q.questionText,
                  options: q.options.map(opt => typeof opt === "string" ? opt : (opt.text || "")),
                  correctAnswer: q.correctAnswer,
                  selectedOption: q.chosenOption === -1 ? null : q.chosenOption,
                  isCorrect: q.chosenOption !== -1 && q.chosenOption === q.correctAnswer,
                  explanation: q.explanation || null
                }))
              }))
            )
          };
          setData(mappedResult);
        } else {
          const { data: result } = await api.get(`/student/test-analysis/${testId}/attempt/${attemptNumber}`);
          const normalized = {
            ...result,
            groupedAnalysis: (result.groupedAnalysis || []).map(section => ({
              ...section,
              questions: (section.questions || []).map(q => ({
                ...q,
                _id: q._id || q.id || null,
                selectedOption: q.selectedOption !== undefined ? q.selectedOption : (q.chosenOption !== -1 && q.chosenOption === q.correctAnswer ? q.chosenOption : null),
                isCorrect: q.isCorrect !== undefined ? q.isCorrect : (q.chosenOption !== -1 && q.chosenOption === q.correctAnswer)
              }))
            }))
          };
          setData(normalized);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [testId, attemptNumber, attemptId]);

  // Auto-select first subject if not set
  useEffect(() => {
    if (data?.groupedAnalysis?.length > 0 && !selectedSubjectName) {
      setSelectedSubjectName(data.groupedAnalysis[0].subjectName);
    }
  }, [data, selectedSubjectName]);

  if (loading) return <div><LoaderAnalysis /></div>;

  if (error || !data) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col font-sans">
        <nav className="sticky top-0 z-50 bg-white px-6 py-4 flex justify-center items-center border-b border-slate-50">
          <button onClick={() => navigate(-1)} className="absolute left-5 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-900" />
          </button>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-550 font-medium text-lg mb-4">Try after some time</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-2.5 bg-slate-100 text-slate-800 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 w-full overflow-hidden overscroll-none flex flex-col font-sans transition-colors duration-300 ${
      isDark ? "bg-[#0E131F] text-white" : "bg-white text-[#1E293B]"
    }`}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <main className="flex-1 max-w-lg mx-auto w-full px-0 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sticky Navigation & Filters Row */}
          <div 
            className={`sticky top-0 z-50 transition-colors ${
              isDark ? "bg-[#0E131F]" : "bg-white"
            }`} 
            style={{ padding: `0 16px`, paddingTop: STATUS_BAR_H + 12 }}
          >
            {/* Horizontal Subject filters */}
            <div className="flex gap-6 overflow-x-auto no-scrollbar pt-2 border-b border-slate-200/60 dark:border-white/[0.04]">
              {(data?.groupedAnalysis || []).map((s) => {
                const isActive = s.subjectName === selectedSubjectName;
                return (
                  <button
                    key={s.subjectName}
                    onClick={() => {
                      setSelectedSubjectName(s.subjectName);
                      setActiveQuestionIndex(0);
                      if (listRef.current) listRef.current.scrollLeft = 0;
                    }}
                    className={`pb-2.5 text-[14px] font-bold relative whitespace-nowrap transition-all ${
                      isActive
                        ? (isDark ? 'text-[#A78BFA]' : 'text-[#7A41F7]')
                        : (isDark ? 'text-white/40' : 'text-slate-400')
                    }`}
                  >
                    {s.subjectName}
                    {isActive && (
                      <span className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full ${
                        isDark ? 'bg-[#A78BFA]' : 'bg-[#7A41F7]'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Questions List Container */}
          <div
            ref={listRef}
            onScroll={handleHorizontalScroll}
            className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-none no-scrollbar"
            style={{ scrollBehavior: 'smooth' }}
          >
            {((data?.groupedAnalysis || []).find(s => s.subjectName === selectedSubjectName)?.questions || []).map((q, qIdx, arr) => (
              <div key={q._id || qIdx} id={`q-card-${qIdx}`} className="w-full h-full flex-shrink-0 snap-start overflow-y-auto pb-24 px-4 pt-4 no-scrollbar">
                <QuestionPaperCard q={q} index={qIdx + 1} totalQuestions={arr.length} isDark={isDark} onReport={setReportTarget} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom actions */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 z-40 flex items-center justify-end ${
        isDark ? "bg-[#0E131F] border-t border-[#333]" : "bg-white border-t border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={activeQuestionIndex === 0}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 ${
              isDark ? 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={activeQuestionIndex === (((data?.groupedAnalysis || []).find(s => s.subjectName === selectedSubjectName)?.questions || []).length - 1)}
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 ${
              isDark ? 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-[#333]' : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {reportTarget && (
        <div
          onClick={() => { setReportTarget(null); setSelectedReasons([]); setAdditionalInfo(''); setReportDone(false); }}
          className="fixed inset-0 z-[1000] bg-black/45 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200"
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-md p-2 pb-8 transition-colors duration-300 animate-in slide-in-from-bottom duration-300 ${
              isDark ? 'bg-[#1F2937]' : 'bg-white'
            }`}
          >
            {/* Handle bar */}
            <div className={`w-9 h-1 rounded-full mx-auto my-3 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />

            {reportDone ? (
              <div className="text-center py-8 px-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <p className={`text-base font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Report Submitted</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Thanks for helping us improve!</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="px-5 pt-2 pb-6">
                  <h3 className={`text-[19px] font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>Reason for reporting the question</h3>
                  <p className={`text-[14px] ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Help us understand the issue better</p>
                </div>

                {/* Checkboxes */}
                <div className="px-5 space-y-4 mb-8">
                  {REPORT_REASONS.map(r => {
                    const isSelected = selectedReasons.includes(r.label);
                    return (
                      <label key={r.key} className="flex items-center gap-3.5 cursor-pointer group">
                        <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all ${
                          isSelected 
                            ? (isDark ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-700 border-slate-700') 
                            : (isDark ? 'border-slate-600 bg-transparent' : 'border-slate-200 bg-transparent group-hover:border-slate-300')
                        }`}>
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <span className={`text-[15px] font-bold ${isDark ? 'text-white/80' : 'text-slate-600'}`}>{r.label}</span>
                        <input type="checkbox" className="hidden" checked={isSelected} onChange={() => {
                          if (isSelected) {
                            setSelectedReasons(selectedReasons.filter(reason => reason !== r.label));
                          } else {
                            setSelectedReasons([...selectedReasons, r.label]);
                          }
                        }} />
                      </label>
                    );
                  })}
                </div>

                {/* Text Area */}
                <div className="px-5 mb-8">
                  <label className={`block text-[14px] font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-700'}`}>Tell us more</label>
                  <textarea 
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Explain your issue in detail"
                    className={`w-full p-4 rounded-[14px] text-[15px] outline-none transition-all resize-none h-[120px] ${
                      isDark ? 'bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/30 focus:border-white/20' 
                             : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-300'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="px-5 flex gap-3">
                  <button
                    onClick={() => { setReportTarget(null); setSelectedReasons([]); setAdditionalInfo(''); }}
                    className={`flex-1 py-4 rounded-xl text-[16px] font-bold border transition-all ${
                      isDark ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-800 text-slate-800 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={selectedReasons.length === 0}
                    className={`flex-1 py-4 rounded-xl text-[16px] font-bold transition-all ${
                      selectedReasons.length > 0
                        ? (isDark ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-[#3F4851] text-white hover:bg-[#2C343C]')
                        : (isDark ? 'bg-white/10 text-white/30' : 'bg-slate-100 text-slate-400')
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QuestionPaperCard component ─────────────────────────────────────────────
function QuestionPaperCard({ q, index, totalQuestions, isDark, onReport }) {
  return (
    <div className={`w-full min-w-0 ${isDark ? "bg-transparent text-white" : "bg-transparent text-[#1E293B]"}`}>
      <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? 'border-[#333]' : 'border-slate-200'}`}>
        <h3 className="font-bold text-[17px]">Q{index} of {totalQuestions}</h3>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-300 transition-colors">
            <svg width="16" height="20" viewBox="0 0 18 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21l-8-5-8 5V5a2 2 0 012-2h12a2 2 0 012 2v16z"></path></svg>
          </button>
          <button onClick={() => onReport(q)} className="text-slate-400 hover:text-slate-300 transition-colors">
            <svg width="4" height="18" viewBox="0 0 4 18" fill="currentColor"><circle cx="2" cy="2" r="2"/><circle cx="2" cy="9" r="2"/><circle cx="2" cy="16" r="2"/></svg>
          </button>
        </div>
      </div>

      <div className={`text-[15px] font-medium leading-relaxed mb-8 ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
        <LatexText text={q.questionText} />
      </div>

      <p className={`text-[11px] font-bold tracking-widest uppercase mb-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Select one option</p>

      <div className="space-y-3">
        {q.options.map((opt, oIdx) => {
          const isCorrect  = oIdx === q.correctAnswer;
          const isSelected = oIdx === q.selectedOption;
          
          let cardStyle = isDark 
            ? "bg-transparent border-[#333] text-white/80" 
            : "bg-transparent border-slate-200 text-slate-700";
          let circleStyle = isDark ? "bg-white/[0.08] text-white" : "bg-slate-100 text-slate-600";
          
          if (isCorrect) {
            cardStyle = isDark 
              ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400" 
              : "bg-emerald-50 border-emerald-500 text-emerald-800";
            circleStyle = isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500 text-white";
          } else if (isSelected && !q.isCorrect) {
            cardStyle = isDark 
              ? "bg-rose-950/20 border-rose-500/50 text-rose-400" 
              : "bg-rose-50 border-rose-500 text-rose-800";
            circleStyle = isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-500 text-white";
          }

          return (
            <div
              key={oIdx}
              className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${cardStyle}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-bold transition-all ${circleStyle}`}>
                {String.fromCharCode(65 + oIdx)}
              </div>
              <span className="min-w-0 break-words flex-1 text-[15px]"><LatexText text={opt} /></span>
              {isCorrect && <CheckCircle2 size={18} className="shrink-0 text-emerald-500 ml-auto" />}
            </div>
          );
        })}
      </div>

      {q.explanation && (
        <div className={`mt-6 rounded-xl p-5 ${
          isDark ? "bg-white/[0.02] border border-white/[0.05]" : "bg-slate-50 border border-slate-100"
        }`}>
          <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Solution</p>
          <p className={`text-[13px] leading-relaxed break-words ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
            <LatexText text={q.explanation} />
          </p>
        </div>
      )}
    </div>
  );
}
