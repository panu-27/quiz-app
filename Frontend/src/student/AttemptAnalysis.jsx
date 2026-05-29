import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Download, Trophy, X, Share2, 
  Circle, Triangle, ClipboardList, Loader2
} from "lucide-react";
import LoaderAnalysis from "./LoaderAnalysis";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

const STATUS_BAR_H = 43.5;

export default function AttemptAnalytics() {
  const { testId, attemptNumber, attemptId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false); 
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing]         = useState(false);

  const handleOpenAnswers = () => {
    if (attemptId) {
      navigate(`/student/analytics/quiz/${attemptId}/answers`);
    } else {
      navigate(`/student/analytics/${testId}/attempt/${attemptNumber}/answers`);
    }
  };

  const handleNavBack = () => {
    navigate(-1);
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

  const handleShare = async () => {
    console.log("Share clicked - action disabled");
  };
  
  const handleDownload = async () => {
    console.log("Download clicked - action disabled");
  };

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

  // ─── computed totals ──────────────────────────────────────────────────────
  const totalCorrect     = (data?.groupedAnalysis || []).reduce((acc, curr) => acc + curr.correct, 0) || 0;
  const totalWrong       = (data?.groupedAnalysis || []).reduce((acc, curr) => acc + curr.wrong, 0) || 0;
  const totalUnattempted = (data?.groupedAnalysis || []).reduce((acc, curr) => acc + curr.unattempted, 0) || 0;
  const accuracy = (totalCorrect + totalWrong) > 0
    ? ((totalCorrect / (totalCorrect + totalWrong)) * 100).toFixed(1) : 0;

  return (
    <div className={`w-full min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? "bg-[#0E131F] text-white" : "bg-[#F4F7FC] text-[#1E293B]"
    }`}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <nav 
        className={`sticky top-0 z-50 px-6 py-2 flex justify-center items-center border-b transition-colors ${
          isDark ? "bg-[#0E131F] border-white/[0.06]" : "bg-white border-slate-100"
        }`} 
        style={{ paddingTop: STATUS_BAR_H + 2 }}
      >
        <button 
          onClick={handleNavBack} 
          className={`absolute left-5 p-2 rounded-full transition-colors ${
            isDark ? "hover:bg-white/[0.05]" : "hover:bg-slate-100"
          }`}
        >
          <ArrowLeft size={20} className={isDark ? "text-white" : "text-slate-900"} />
        </button>
        <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Good Job!</h2>
        <button 
          onClick={() => navigate(-1)} 
          className={`absolute right-5 p-2 rounded-full transition-colors ${
            isDark ? "hover:bg-white/[0.05]" : "hover:bg-slate-100"
          }`}
        >
          <X size={20} className={isDark ? "text-white" : "text-slate-900"} />
        </button>
      </nav>
 
      <main className="flex-1 max-w-lg mx-auto w-full px-5 pt-5 space-y-6 flex flex-col">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
          {/* Hero card */}
          <div className="bg-[#FF9494] rounded-[2rem] p-8 text-center relative overflow-hidden shadow-xl shadow-rose-100/30 flex flex-col items-center">
            <div className="absolute top-4 left-4 text-white/30 rotate-12"><Circle size={24} /></div>
            <div className="absolute top-10 right-10 text-white/30 -rotate-12"><Triangle size={24} /></div>
            <div className="w-20 h-20 mb-3 flex items-center justify-center relative">
              <Trophy size={56} className="text-[#FFD700] fill-[#FFD700]" />
              <div className="absolute inset-0 flex items-center justify-center pt-1">
                <span className="text-white font-black text-lg">Q</span>
              </div>
            </div>
            <h3 className="text-white text-base font-extrabold">
              {data.rank === "N/A" ? "Completed Custom Practice Quiz" : `You got ${data.rank} Rank In This Test`}
            </h3>
            <button
              onClick={handleOpenAnswers}
              className="mt-5 px-8 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl text-xs font-bold border border-white/30 active:scale-95 transition-transform"
            >
              Check Answer Sheet
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl border transition-colors ${
              isDark ? "bg-[#161C26] border-white/[0.04]" : "bg-white border-slate-100 shadow-sm"
            }`}>
              <p className="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Correct</p>
              <p className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{totalCorrect} <span className="text-[10px] opacity-50 font-normal">Qs</span></p>
            </div>
            <div className={`p-4 rounded-2xl border transition-colors ${
              isDark ? "bg-[#161C26] border-white/[0.04]" : "bg-white border-slate-100 shadow-sm"
            }`}>
              <p className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">Accuracy</p>
              <p className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{accuracy}%</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-colors ${
              isDark ? "bg-[#161C26] border-white/[0.04]" : "bg-white border-slate-100 shadow-sm"
            }`}>
              <p className="text-[10px] font-black text-orange-500 uppercase mb-1 tracking-widest">Skipped</p>
              <p className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{totalUnattempted}</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-colors ${
              isDark ? "bg-[#161C26] border-white/[0.04]" : "bg-white border-slate-100 shadow-sm"
            }`}>
              <p className="text-[10px] font-black text-rose-500 uppercase mb-1 tracking-widest">Incorrect</p>
              <p className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>{totalWrong}</p>
            </div>
          </div>

          {/* Subject bars */}
          <div className={`p-5 rounded-2xl border transition-colors ${
            isDark ? "bg-[#161C26] border-white/[0.04]" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.04]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Performance</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" /><span className="text-[9px] font-bold text-slate-400">C</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#EF4444] rounded-full" /><span className="text-[9px] font-bold text-slate-400">W</span></div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#CBD5E1] rounded-full" /><span className="text-[9px] font-bold text-slate-400">S</span></div>
              </div>
            </div>
            <div className="relative flex gap-2 h-44 mt-4">
              <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 pr-1 border-r border-slate-100 dark:border-white/[0.06] mb-6">
                <span>100%</span><span>50%</span><span>0%</span>
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none mb-6">
                  <div className="w-full border-t border-slate-50 dark:border-white/[0.03]" />
                  <div className="w-full border-t border-slate-50 dark:border-white/[0.03]" />
                  <div className="w-full border-b border-slate-200 dark:border-white/[0.06]" />
                </div>
                <div className="h-full flex items-end justify-around px-2 gap-4 overflow-x-auto no-scrollbar pb-6">
                  {(data?.groupedAnalysis || []).map((s, i) => {
                    const total = s.correct + s.wrong + s.unattempted || 1;
                    return (
                      <div key={i} className="flex flex-col items-center min-w-[50px]">
                        <div className="w-[24px] h-32 bg-slate-50 dark:bg-white/[0.02] rounded-t-sm overflow-hidden flex flex-col-reverse shadow-sm">
                          <div style={{ height: `${(s.correct / total) * 100}%` }} className="bg-[#10B981] w-full transition-all duration-700" />
                          <div style={{ height: `${(s.wrong / total) * 100}%` }} className="bg-[#EF4444] w-full transition-all duration-700" />
                          <div style={{ height: `${(s.unattempted / total) * 100}%` }} className="bg-[#CBD5E1] w-full transition-all duration-700" />
                        </div>
                        <div className="mt-2 absolute bottom-0 h-4 flex items-center">
                          <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{s.subjectName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Subject table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <ClipboardList size={16} className="text-[#FF9494]" />
              <p className="text-[10px] font-black text-rose-450 uppercase tracking-widest">Analysis Table</p>
            </div>
            <div className={`w-full overflow-x-auto no-scrollbar rounded-2xl border transition-colors ${
              isDark ? "bg-[#161C26] border-white/[0.05]" : "bg-white border-slate-100 shadow-sm"
            }`}>
              <table className="w-full text-left border-collapse min-w-[420px]">
                <thead className={isDark ? "bg-white/[0.02] border-b border-white/[0.04]" : "bg-[#FFF5F5] border-b border-rose-50"}>
                  <tr>
                    <th className={`px-4 py-3 sticky left-0 text-[9px] font-black uppercase tracking-wider ${isDark ? 'bg-[#161C26] text-white/50' : 'bg-[#FFF5F5] text-rose-400'}`}>Subject</th>
                    <th className="px-3 py-3 text-[9px] font-black text-emerald-500 text-center uppercase tracking-wider">Correct</th>
                    <th className="px-3 py-3 text-[9px] font-black text-rose-500 text-center uppercase tracking-wider">Wrong</th>
                    <th className="px-3 py-3 text-[9px] font-black text-orange-500 text-center uppercase tracking-wider">Skipped</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 text-right uppercase tracking-wider">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {(data?.groupedAnalysis || []).map((s, i) => (
                    <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/50'}`}>
                      <td className={`px-4 py-3 sticky left-0 font-bold text-[12px] whitespace-nowrap ${isDark ? 'bg-[#161C26] text-white' : 'bg-white text-slate-800'}`}>{s.subjectName}</td>
                      <td className="px-3 py-3 text-center font-black text-emerald-500">{s.correct}</td>
                      <td className="px-3 py-3 text-center font-black text-rose-500">{s.wrong}</td>
                      <td className="px-3 py-3 text-center font-black text-orange-500">{s.unattempted}</td>
                      <td className={`px-4 py-3 text-right font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.score > 0 ? `+${s.score}` : s.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom actions */}
      <div className="sticky bottom-0 pb-6 pt-4 px-5 z-40 bg-transparent w-full">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-4 bg-[#7A41F7] text-white rounded-2xl font-bold shadow-lg shadow-purple-200/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
          >
            {downloading
              ? <><Loader2 size={18} className="animate-spin" /> Preparing PDF…</>
              : <><Download size={18} /> Download PDF</>
            }
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="p-4 border border-slate-200 dark:border-white/[0.08] rounded-2xl text-white bg-pink-500 transition-all active:scale-95 disabled:opacity-70"
          >
            {sharing
              ? <Loader2 size={20} className="animate-spin" />
              : <Share2 size={20} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}