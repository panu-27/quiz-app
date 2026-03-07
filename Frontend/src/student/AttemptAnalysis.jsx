import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeftIcon, Download, Trophy, Target, Zap,
  CheckCircle2, Loader2, ChevronDown, X, Share2,
  Circle, Triangle, BarChart2, ClipboardList
} from "lucide-react";
import LoaderAnalysis from "./LoaderAnalysis";
import api from "../api/axios";

// ─── KaTeX loader (same pattern as QuestionDisplay) ───────────────────────────
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

// ─── KaTeX CSS for download HTML ──────────────────────────────────────────────
const KATEX_CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
const KATEX_JS_URL  = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
const KATEX_AR_URL  = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';

export default function AttemptAnalytics() {
  const { testId, attemptNumber } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("overview");
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);

  const subjectRefs = useRef({});

  useEffect(() => {
    if (viewMode === "questions") {
      window.history.pushState({ view: "questions" }, "");
    }
    const handleBackButton = (event) => {
      if (viewMode === "questions") {
        event.preventDefault();
        setViewMode("overview");
      }
    };
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [viewMode]);

  const handleNavBack = () => {
    if (viewMode === "questions") setViewMode("overview");
    else navigate(-1);
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const { data: result } = await api.get(`/student/test-analysis/${testId}/attempt/${attemptNumber}`);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [testId, attemptNumber]);

  const scrollToSubject = (name) => {
    setViewMode("questions");
    setShowSubjectMenu(false);
    setTimeout(() => {
      subjectRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleShare = async () => {
    const shareData = {
      title: `My Rank: #${data?.rank}`,
      text: `I scored ${data?.overallScore} in ${data?.testTitle}! Check my analysis on Nexus.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log(err); }
    }
  };

  // ─── DOWNLOAD with KaTeX rendering + clean layout ─────────────────────────
  const handleDownload = () => {
    const renderOpt = (opt, i, isCorrect, isSelected, isWrong) => {
      const letter = String.fromCharCode(65 + i);
      let bg = '#FAFAFA', border = '#E5E7EB', color = '#374151', badge = '';
      if (isCorrect) {
        bg = '#F0FDF4'; border = '#86EFAC'; color = '#166534';
        badge = `<span style="display:inline-block;margin-left:6px;background:#22C55E;color:#fff;font-size:7px;font-weight:800;padding:1px 5px;border-radius:99px;vertical-align:middle;letter-spacing:.5px;">✓ CORRECT</span>`;
      } else if (isSelected && isWrong) {
        bg = '#FFF1F2'; border = '#FCA5A5'; color = '#991B1B';
        badge = `<span style="display:inline-block;margin-left:6px;background:#EF4444;color:#fff;font-size:7px;font-weight:800;padding:1px 5px;border-radius:99px;vertical-align:middle;letter-spacing:.5px;">✗ YOUR ANSWER</span>`;
      }
      return `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:7px 10px;border-radius:8px;border:1.5px solid ${border};background:${bg};margin-bottom:5px;">
          <span style="min-width:18px;height:18px;border-radius:50%;background:${isCorrect ? '#22C55E' : (isSelected && isWrong ? '#EF4444' : '#E5E7EB')};color:${isCorrect || (isSelected && isWrong) ? '#fff' : '#6B7280'};font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">${letter}</span>
          <span style="font-size:10.5px;color:${color};line-height:1.6;">${opt}${badge}</span>
        </div>`;
    };

    const renderQuestion = (q, qIdx) => {
      const isSkipped = q.selectedOption === null || q.selectedOption === undefined;
      const statusColor = isSkipped ? '#D97706' : (q.isCorrect ? '#16A34A' : '#DC2626');
      const statusBg    = isSkipped ? '#FFFBEB' : (q.isCorrect ? '#F0FDF4' : '#FFF1F2');
      const statusLabel = isSkipped ? 'Skipped' : (q.isCorrect ? 'Correct' : 'Incorrect');

      return `
        <div style="break-inside:avoid;-webkit-column-break-inside:avoid;margin-bottom:14px;padding:12px 14px;border-radius:10px;border:1px solid #F1F5F9;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <div style="display:flex;align-items:flex-start;gap:7px;flex:1;">
              <span style="min-width:20px;height:20px;border-radius:6px;background:#7A41F7;color:#fff;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">Q${qIdx + 1}</span>
              <span style="font-size:11px;font-weight:600;color:#1E1E2D;line-height:1.65;">${q.questionText}</span>
            </div>
            <span style="flex-shrink:0;font-size:8px;font-weight:900;color:${statusColor};background:${statusBg};border:1px solid ${statusColor}33;padding:2px 8px;border-radius:99px;letter-spacing:.4px;text-transform:uppercase;">${statusLabel}</span>
          </div>
          <div style="margin-left:27px;">
            ${q.options.map((opt, i) => renderOpt(
              opt, i,
              i === q.correctAnswer,
              i === q.selectedOption,
              !q.isCorrect && !isSkipped
            )).join('')}
          </div>
          ${q.explanation ? `
            <div style="margin-top:8px;margin-left:27px;padding:7px 10px;background:#F8F7FF;border-left:2.5px solid #7A41F7;border-radius:0 6px 6px 0;">
              <span style="font-size:7.5px;font-weight:900;color:#7A41F7;text-transform:uppercase;letter-spacing:.8px;display:block;margin-bottom:3px;">Explanation</span>
              <span style="font-size:9.5px;color:#4B5563;line-height:1.6;">${q.explanation}</span>
            </div>` : ''}
        </div>`;
    };

    const subjectContent = data.groupedAnalysis.map((subject, sIdx) => {
      const total = subject.correct + subject.wrong + subject.unattempted || 1;
      const pct   = Math.round((subject.correct / total) * 100);
      return `
        <div style="${sIdx !== 0 ? 'page-break-before:always;' : ''}padding-top:${sIdx !== 0 ? '20px' : '0'};">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #7A41F7;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:6px;height:28px;background:#7A41F7;border-radius:3px;display:inline-block;"></span>
              <div>
                <div style="font-size:15px;font-weight:900;color:#1E1E2D;letter-spacing:-.3px;">${subject.subjectName}</div>
                <div style="font-size:9px;color:#94A3B8;font-weight:600;margin-top:1px;">${subject.questions.length} questions</div>
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="background:#F0FDF4;border:1px solid #86EFAC;color:#166534;font-size:9px;font-weight:800;padding:3px 8px;border-radius:99px;">✓ ${subject.correct}</span>
              <span style="background:#FFF1F2;border:1px solid #FCA5A5;color:#991B1B;font-size:9px;font-weight:800;padding:3px 8px;border-radius:99px;">✗ ${subject.wrong}</span>
              <span style="background:#FFFBEB;border:1px solid #FCD34D;color:#92400E;font-size:9px;font-weight:800;padding:3px 8px;border-radius:99px;">— ${subject.unattempted}</span>
              <span style="background:#EDE9FE;border:1px solid #C4B5FD;color:#5B21B6;font-size:9px;font-weight:800;padding:3px 8px;border-radius:99px;">${subject.score > 0 ? '+' : ''}${subject.score} pts</span>
            </div>
          </div>
          <div style="background:#F8F5FF;border-radius:8px;padding:8px 10px;margin-bottom:14px;display:flex;align-items:center;gap:10px;">
            <span style="font-size:9px;color:#7A41F7;font-weight:700;flex-shrink:0;">Accuracy</span>
            <div style="flex:1;height:5px;background:#EDE9FE;border-radius:99px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:#7A41F7;border-radius:99px;"></div>
            </div>
            <span style="font-size:10px;font-weight:900;color:#7A41F7;flex-shrink:0;">${pct}%</span>
          </div>
          <div style="column-count:2;-webkit-column-count:2;column-gap:18px;column-rule:1px solid #F1F5F9;">
            ${subject.questions.map((q, i) => renderQuestion(q, i)).join('')}
          </div>
        </div>`;
    }).join('');

    const totalC = data.groupedAnalysis.reduce((a, s) => a + s.correct, 0);
    const totalW = data.groupedAnalysis.reduce((a, s) => a + s.wrong, 0);
    const totalU = data.groupedAnalysis.reduce((a, s) => a + s.unattempted, 0);
    const acc    = (totalC + totalW) > 0 ? ((totalC / (totalC + totalW)) * 100).toFixed(1) : 0;

    const documentHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" href="${KATEX_CSS_URL}"/>
  <style>
    @page { margin: 0.5in 0.55in; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #fff; color: #1E1E2D; margin: 0; }
    .katex { font-size: 1em !important; }
    .katex-display { margin: 0.3em 0; overflow-x: auto; }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#7A41F7 0%,#A855F7 100%);border-radius:12px;padding:18px 22px;margin-bottom:22px;color:#fff;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;opacity:.7;text-transform:uppercase;margin-bottom:4px;">Performance Transcript</div>
        <div style="font-size:20px;font-weight:900;letter-spacing:-.4px;">${data.testTitle}</div>
        <div style="font-size:10px;opacity:.75;margin-top:4px;">Attempt #${attemptNumber}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:28px;font-weight:900;letter-spacing:-1px;">${data.overallScore}<span style="font-size:13px;opacity:.7;font-weight:600;">/${data.totalMaxScore}</span></div>
        <div style="font-size:9px;opacity:.7;margin-top:2px;">Rank #${data.rank}</div>
      </div>
    </div>
    <!-- Summary strip -->
    <div style="display:flex;gap:10px;margin-top:14px;">
      ${[
        ['Correct', totalC, '#D1FAE5', '#065F46'],
        ['Wrong',   totalW, '#FFE4E6', '#9F1239'],
        ['Skipped', totalU, '#FEF9C3', '#713F12'],
        ['Accuracy',`${acc}%`, '#EDE9FE', '#4C1D95'],
      ].map(([label, val, bg, color]) => `
        <div style="flex:1;background:rgba(255,255,255,0.15);border-radius:8px;padding:8px 10px;text-align:center;backdrop-filter:blur(4px);">
          <div style="font-size:14px;font-weight:900;color:#fff;">${val}</div>
          <div style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.7);margin-top:2px;text-transform:uppercase;letter-spacing:.5px;">${label}</div>
        </div>`).join('')}
    </div>
  </div>

  <!-- SUBJECT CONTENT -->
  ${subjectContent}

  <script src="${KATEX_JS_URL}"></script>
  <script src="${KATEX_AR_URL}"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            {left:'$$',right:'$$',display:true},
            {left:'$',right:'$',display:false},
            {left:'\\\\(',right:'\\\\)',display:false},
            {left:'\\\\[',right:'\\\\]',display:true}
          ],
          throwOnError: false
        });
      }
    });
  </script>
</body>
</html>`;

    const blob = new Blob(['\ufeff', documentHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.testTitle.replace(/\s+/g, '_')}_Transcript.doc`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
  };

  if (loading) return <div><LoaderAnalysis /></div>;

  const totalCorrect     = data?.groupedAnalysis.reduce((acc, curr) => acc + curr.correct, 0) || 0;
  const totalWrong       = data?.groupedAnalysis.reduce((acc, curr) => acc + curr.wrong, 0) || 0;
  const totalUnattempted = data?.groupedAnalysis.reduce((acc, curr) => acc + curr.unattempted, 0) || 0;
  const accuracy = (totalCorrect + totalWrong) > 0
    ? ((totalCorrect / (totalCorrect + totalWrong)) * 100).toFixed(1) : 0;

  return (
    <div className="w-full min-h-screen bg-white flex flex-col font-sans">
      <nav className="sticky top-0 z-50 bg-white px-6 py-4 flex justify-center items-center border-b border-slate-50">
        <button onClick={handleNavBack} className="absolute left-5 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeftIcon size={20} className="text-slate-900" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">Good Job!</h2>
        <button onClick={() => navigate(-1)} className="absolute right-5 p-2 hover:bg-slate-100 rounded-full">
          <X size={20} className="text-slate-900" />
        </button>
      </nav>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 pt-6 space-y-8">
        {viewMode === "overview" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero card */}
            <div className="bg-[#FF9494] rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-xl shadow-rose-100 flex flex-col items-center">
              <div className="absolute top-4 left-4 text-white/30 rotate-12"><Circle size={24} /></div>
              <div className="absolute top-10 right-10 text-white/30 -rotate-12"><Triangle size={24} /></div>
              <div className="w-24 h-24 mb-4 flex items-center justify-center relative">
                <Trophy size={64} className="text-[#FFD700] fill-[#FFD700]" />
                <div className="absolute inset-0 flex items-center justify-center pt-1">
                  <span className="text-white font-black text-xl">Q</span>
                </div>
              </div>
              <h3 className="text-white text-lg font-bold">You got {data.rank} Rank In This Test</h3>
              <button
                onClick={() => setViewMode("questions")}
                className="mt-6 px-10 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl text-sm font-bold border border-white/30 active:scale-95 transition-transform"
              >
                Check Answer Sheet
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 px-2">
              <div className="bg-[#EBFDEB] p-5 rounded-xl border border-white shadow-sm shadow-emerald-100/50">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1 tracking-widest">Correct</p>
                <p className="text-xl font-black text-slate-900">{totalCorrect} <span className="text-[10px] opacity-50">Qs</span></p>
              </div>
              <div className="bg-[#EBF3FF] p-5 rounded-xl border border-white shadow-sm shadow-blue-100/50">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">Accuracy</p>
                <p className="text-xl font-black text-slate-900">{accuracy}%</p>
              </div>
              <div className="bg-[#FFF4EB] p-5 rounded-xl border border-white shadow-sm shadow-orange-100/50">
                <p className="text-[10px] font-black text-orange-600 uppercase mb-1 tracking-widest">Skipped</p>
                <p className="text-xl font-black text-slate-900">{totalUnattempted}</p>
              </div>
              <div className="bg-[#FFF0F0] p-5 rounded-xl border border-white shadow-sm shadow-rose-100/50">
                <p className="text-[10px] font-black text-rose-600 uppercase mb-1 tracking-widest">Incorrect</p>
                <p className="text-xl font-black text-slate-900">{totalWrong}</p>
              </div>
            </div>

            {/* Subject bars */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Performance</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#10B981]" /><span className="text-[9px] font-bold text-slate-400">C</span></div>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#EF4444]" /><span className="text-[9px] font-bold text-slate-400">W</span></div>
                  <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#CBD5E1]" /><span className="text-[9px] font-bold text-slate-400">S</span></div>
                </div>
              </div>
              <div className="relative flex gap-2 h-56 mt-4">
                <div className="flex flex-col justify-between text-[9px] font-bold text-slate-300 pr-1 border-r border-slate-100 mb-8">
                  <span>100%</span><span>50%</span><span>0%</span>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none mb-8">
                    <div className="w-full border-t border-slate-50" />
                    <div className="w-full border-t border-slate-50" />
                    <div className="w-full border-b border-slate-200" />
                  </div>
                  <div className="h-full flex items-end justify-around px-2 gap-4 overflow-x-auto no-scrollbar pb-8">
                    {data?.groupedAnalysis.map((s, i) => {
                      const total = s.correct + s.wrong + s.unattempted || 1;
                      return (
                        <div key={i} className="flex flex-col items-center min-w-[50px]">
                          <div className="w-[30px] h-40 bg-slate-50 rounded-t-sm overflow-hidden flex flex-col-reverse shadow-sm">
                            <div style={{ height: `${(s.correct / total) * 100}%` }} className="bg-[#10B981] w-full transition-all duration-700" />
                            <div style={{ height: `${(s.wrong / total) * 100}%` }} className="bg-[#EF4444] w-full transition-all duration-700" />
                            <div style={{ height: `${(s.unattempted / total) * 100}%` }} className="bg-[#CBD5E1] w-full transition-all duration-700" />
                          </div>
                          <div className="mt-3 absolute bottom-0 h-6 flex items-center">
                            <span className="text-[9px] font-bold text-slate-600 whitespace-nowrap">{s.subjectName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject table */}
            <div className="space-y-4 pb-10">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-[#FF9494]" />
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Analysis Table</p>
                </div>
              </div>
              <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-rose-100 shadow-sm shadow-rose-50">
                <table className="w-full text-left border-collapse min-w-[480px] bg-white">
                  <thead className="bg-[#FFF5F5] border-b border-rose-100">
                    <tr>
                      <th className="px-5 py-4 sticky left-0 bg-[#FFF5F5] text-[9px] font-black text-rose-400 border-r border-rose-50/30">Subject</th>
                      <th className="px-3 py-4 text-[9px] font-black text-emerald-600 text-center bg-emerald-50/20">Correct</th>
                      <th className="px-3 py-4 text-[9px] font-black text-rose-600 text-center bg-rose-50/20">Wrong</th>
                      <th className="px-3 py-4 text-[9px] font-black text-orange-600 text-center bg-orange-50/20">Skipped</th>
                      <th className="px-5 py-4 text-[9px] font-black text-slate-400 text-right">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50/30">
                    {data?.groupedAnalysis.map((s, i) => (
                      <tr key={i} className="hover:bg-rose-50/10 transition-colors group">
                        <td className="px-5 py-4 sticky left-0 bg-white group-hover:bg-[#FFFBFB] transition-colors border-r border-rose-50/30 font-bold text-slate-800 text-[12px] whitespace-nowrap">{s.subjectName}</td>
                        <td className="px-3 py-4 text-center font-black text-emerald-500">{s.correct}</td>
                        <td className="px-3 py-4 text-center font-black text-rose-500">{s.wrong}</td>
                        <td className="px-3 py-4 text-center font-black text-orange-500">{s.unattempted}</td>
                        <td className="px-5 py-4 text-right font-black text-slate-900">{s.score > 0 ? `+${s.score}` : s.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="sticky -bottom-8 flex items-center gap-4 pt-4 pb-12">
              <button
                onClick={handleDownload}
                className="flex-1 py-5 bg-[#7A41F7] text-white rounded-[1.5rem] font-bold shadow-lg shadow-purple-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Download size={20} /> Download Transcript
              </button>
              <button
                onClick={handleShare}
                className="p-5 border border-slate-100 rounded-[1.5rem] text-white bg-pink-400 transition-all shadow-lg active:scale-95"
              >
                <Share2 size={24} />
              </button>
            </div>
          </div>
        ) : (
          <div className="pb-20 animate-in duration-500">
            <div className="sticky top-[80px] z-40 py-2">
              <button
                onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                className="mx-auto bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 shadow-xl"
              >
                SUBJECTS <ChevronDown size={14} />
              </button>
              {showSubjectMenu && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50">
                  {data?.groupedAnalysis.map(s => (
                    <button
                      key={s.subjectName}
                      onClick={() => scrollToSubject(s.subjectName)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F1EBFE] rounded-xl text-xs font-bold text-slate-700"
                    >
                      {s.subjectName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {data?.groupedAnalysis.map((subject) => (
              <div
                key={subject.subjectName}
                ref={el => subjectRefs.current[subject.subjectName] = el}
                className="scroll-mt-32 space-y-6 mb-8"
              >
                <h2 className="text-[20px] font-black text-[#1E1E2D] tracking-tight border-l-4 border-[#7A41F7] pl-4">
                  {subject.subjectName}
                </h2>
                {subject.questions.map((q, qIdx) => (
                  <QuestionPaperCard key={qIdx} q={q} index={qIdx + 1} />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── QuestionPaperCard — with KaTeX rendering ─────────────────────────────────
function QuestionPaperCard({ q, index }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 mb-4 shadow-sm">
      <div className="flex gap-3 mb-3">
        <span className="w-7 h-7 shrink-0 rounded-md bg-[#F1EBFE] flex items-center justify-center text-[11px] font-bold text-[#7A41F7]">
          {index}
        </span>
        <p className="text-slate-800 text-sm font-semibold leading-snug">
          <LatexText text={q.questionText} />
        </p>
      </div>
      <div className="space-y-2">
        {q.options.map((opt, oIdx) => {
          const isCorrect  = oIdx === q.correctAnswer;
          const isSelected = oIdx === q.selectedOption;
          let style = "bg-slate-50 text-slate-600 border-slate-100";
          if (isCorrect) style = "bg-emerald-50 text-emerald-700 border-emerald-300";
          else if (isSelected && !q.isCorrect) style = "bg-rose-50 text-rose-700 border-rose-300";
          return (
            <div
              key={oIdx}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-between ${style}`}
            >
              <LatexText text={opt} />
              {isCorrect && <CheckCircle2 size={16} />}
            </div>
          );
        })}
      </div>
      {q.explanation && (
        <div className="mt-3 bg-[#F7F4FE] rounded-xl px-4 py-3">
          <p className="text-[10px] font-semibold text-[#7A41F7] uppercase mb-1">Explanation</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            <LatexText text={q.explanation} />
          </p>
        </div>
      )}
    </div>
  );
}