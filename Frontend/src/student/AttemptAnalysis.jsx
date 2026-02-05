import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeftIcon, Download, Trophy, Target, Zap,
  CheckCircle2, XCircle, HelpCircle, Loader2, ChevronDown, X, FileText
} from "lucide-react";

export default function AttemptAnalytics() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const { testId, attemptNumber } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("overview");
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const subjectRefs = useRef({});

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/student/test-analysis/${testId}/attempt/${attemptNumber}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        setData(result);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAnalysis();
  }, [testId, attemptNumber, baseURL]);

  const scrollToSubject = (name) => {
    setShowSubjectMenu(false);
    subjectRefs.current[name]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

const handleDownload = () => {
  // Generate the content based on current data
  const content = data.groupedAnalysis.map(subject => `
    <h2 style="color: #4f46e5; text-transform: uppercase; border-bottom: 1px solid #eee;">${subject.subjectName}</h2>
    ${subject.questions.map((q, idx) => {
      let statusHtml = "";
      if (q.selectedOption === -1) {
        statusHtml = `<span style="color: #94a3b8; font-size: 10px; font-weight: bold;">[SKIPPED]</span>`;
      } else if (q.isCorrect) {
        statusHtml = `<span style="color: #10b981; font-size: 10px; font-weight: bold;">[CORRECT]</span>`;
      } else {
        statusHtml = `<span style="color: #ef4444; font-size: 10px; font-weight: bold;">[WRONG]</span>`;
      }

      return `
        <div style="margin-bottom: 30px; page-break-inside: avoid;">
          <p><strong>Question ${idx + 1}:</strong> ${statusHtml}<br/>
          ${q.questionText}</p>
          
          <div style="margin-left: 20px; margin-bottom: 15px;">
            ${q.options.map((opt, oIdx) => {
              const isCorrect = oIdx === q.correctAnswer;
              const isSelected = oIdx === q.selectedOption;
              
              let color = "#475569";
              let weight = "normal";
              let prefix = "";

              if (isCorrect) {
                color = "#059669";
                weight = "bold";
                prefix = "✓ ";
              } else if (isSelected && !q.isCorrect) {
                color = "#dc2626";
                weight = "bold";
                prefix = "✗ ";
              }

              return `
                <p style="color: ${color}; font-weight: ${weight}; margin: 4px 0;">
                  ${prefix}${String.fromCharCode(65 + oIdx)}. ${opt}
                  ${isSelected ? ' <small>(Your Choice)</small>' : ''}
                </p>
              `;
            }).join('')}
          </div>

          <div style="background-color: #f8fafc; padding: 10px; border-left: 4px solid #6366f1;">
            <p style="color: #6366f1; font-size: 11px; font-weight: bold; margin: 0 0 5px 0;">EXPLANATION</p>
            <p style="font-size: 12px; color: #334155; margin: 0; font-style: italic;">${q.explanation || "No solution provided."}</p>
          </div>
        </div>
      `;
    }).join('')}
  `).join('<br/><hr/><br/>');

  const documentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'></head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif;">
      <h1 style="text-align: center; color: #1e293b;">${data.testTitle}</h1>
      <p style="text-align: center; color: #64748b;">Attempt #${attemptNumber} • Detailed Analysis Report</p>
      ${content}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', documentHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.testTitle.replace(/\s+/g, '_')}_Analysis.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synting Analytics...</p>
    </div>
  );

  return (
    <div className=" w-full bg-[#FBFDFF] flex flex-col font-sans selection:bg-indigo-100 print:bg-white">

      {/* --- PREMIUM NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl px-6 py-3 border-b border-slate-100 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeftIcon size={18} className="text-slate-600" />
        </button>

        <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200/50">
          {["overview", "questions"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight transition-all ${viewMode === mode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Download size={14} /> <span className="hidden md:inline">EXPORT</span>
        </button>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">

        {viewMode === "overview" ? (
          <div className="animate-in fade-in duration-700">
            {/* --- CLEAN PROFESSIONAL HEADER --- */}
            {/* --- PREMIUM COMPACT HEADER --- */}
            <div className="relative mb-8 group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-indigo-600 rounded-full" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                      {data?.testTitle}
                    </h1>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Trophy size={10} className="text-amber-500" />
                    Attempt #{attemptNumber} • Performance Transcript
                  </p>
                </div>

                <div className="flex items-center bg-white border border-slate-100 p-1.5 rounded-2xl shadow-xl shadow-slate-200/40">
                  {/* --- HEADER SCORE UPDATE --- */}
                  <div className="px-5 py-1 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Score</p>
                    <div className="flex items-baseline gap-0.5 justify-center">
                      <p className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">
                        {data?.overallScore}
                      </p>
                      <p className="text-xs font-bold text-slate-400">/{data?.totalMaxScore}</p>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="px-5 py-1 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Rank</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">#{data?.rank}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- HALF-HEIGHT PERFORMANCE TABLE --- */}
            <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-2xl shadow-slate-200/30 overflow-hidden">
              <div className=" overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-md shadow-sm">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Section</th>
                      <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Accuracy breakdown</th>
                      <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Net Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.groupedAnalysis.map((s, i) => {
                      const accuracy = (s.correct / (s.correct + s.wrong || 1)) * 100;
                      return (
                        <tr key={i} className="group hover:bg-slate-50/80 transition-all">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">
                                {s.subjectName.substring(0, 2).toUpperCase()}
                              </div>
                              <p className="font-bold text-slate-800 text-xs tracking-tight">{s.subjectName}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="flex items-center gap-2 text-[10px] font-black">
                                <span className="text-emerald-600">{s.correct}c</span>
                                <span className="text-rose-500">{s.wrong}w</span>
                                <span className="text-slate-400">{s.unattempted}s</span>
                              </div>
                              <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden flex">
                                <div className="bg-emerald-500 h-full" style={{ width: `${accuracy}%` }} />
                                <div className="bg-rose-400 h-full" style={{ width: `${100 - accuracy}%` }} />
                              </div>
                            </div>
                          </td>
                          {/* --- TABLE CELL UPDATE --- */}
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-indigo-600">
                                {s.score > 0 ? `+${s.score}` : s.score}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                out of {s.maxScore}
                              </span>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>



            {/* --- QUICK INSIGHTS --- */}
            <div className="grid grid-cols-2  gap-2 mt-8">
              <InsightCard label="Accuracy" value={`${((data?.groupedAnalysis.reduce((acc, curr) => acc + curr.correct, 0) / (data?.groupedAnalysis.reduce((acc, curr) => acc + curr.correct + curr.wrong, 0) || 1)) * 100).toFixed(1)}%`} desc="Precision" />
              <InsightCard label="Attempt Rate" value={`${((data?.groupedAnalysis.reduce((acc, curr) => acc + (curr.correct + curr.wrong), 0) / data?.groupedAnalysis.reduce((acc, curr) => acc + (curr.correct + curr.wrong + curr.unattempted), 0)) * 100).toFixed(0)}%`} desc="Intution" />
            </div>
          </div>
        ) : (
          /* --- QUESTIONS VIEW --- */
          <div className="space-y-6 animate-in slide-in-from-right-2 duration-500">
            {/* Subject Jump Pill */}
            <div className="sticky top-[70px] z-[40] py-2 flex justify-center print:hidden">
              <div className="relative group">
                <button onClick={() => setShowSubjectMenu(!showSubjectMenu)} className="bg-slate-900 text-white px-5 py-2 rounded-full text-[10px] font-bold flex items-center gap-3 shadow-xl">
                  SUBJECT NAVIGATOR <ChevronDown size={14} />
                </button>
                {showSubjectMenu && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white border border-slate-200 shadow-2xl rounded-xl p-1">
                    {data?.groupedAnalysis.map(s => (
                      <button key={s.subjectName} onClick={() => scrollToSubject(s.subjectName)} className="w-full text-left px-4 py-2 hover:bg-indigo-50 rounded-lg text-[10px] font-bold text-slate-600 transition-colors">
                        {s.subjectName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {data?.groupedAnalysis.map((subject) => (
              <div key={subject.subjectName} ref={el => subjectRefs.current[subject.subjectName] = el} className="scroll-mt-32">
                <div className="py-4 border-b-2 border-slate-100 mb-6 flex justify-between items-end">
                  <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">{subject.subjectName}</h2>
                  <span className="text-[10px] font-bold text-slate-400">{subject.questions.length} QUESTIONS</span>
                </div>
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

  <style>{`
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`}</style>
}

/* --- REUSABLE COMPONENTS --- */

function InsightCard({ label, value, desc }) {
  // Logic to assign icons and colors based on the label
  const getMeta = (label) => {
    const l = label.toLowerCase();
    if (l.includes("accuracy")) return {
      icon: <Target size={16} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "group-hover:border-emerald-200"
    };
    if (l.includes("rate") || l.includes("attempt")) return {
      icon: <Zap size={16} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "group-hover:border-amber-200"
    };
    return {
      icon: <Trophy size={16} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "group-hover:border-indigo-200"
    };
  };

  const meta = getMeta(label);

  return (
    <div className={`group relative bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${meta.border}`}>
      {/* Decorative Background Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${meta.bg} opacity-0 group-hover:opacity-40 rounded-full blur-3xl transition-opacity`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`${meta.bg} ${meta.color} p-2.5 rounded-xl shadow-inner`}>
            {meta.icon}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
              {value}
            </h3>
          </div>
          <p className="mt-3 text-[11px] font-bold text-slate-500 leading-tight">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function QuestionPaperCard({ q, index }) {
  return (
    <div className="mb-10 group">
      <div className="flex items-start gap-4 mb-4">
        <span className="text-sm font-black text-slate-300 group-hover:text-indigo-600 transition-colors">0{index}</span>
        <div className="flex-1">
          <p className="text-slate-800 font-bold leading-relaxed mb-6">{q.questionText}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.options.map((opt, oIdx) => {
              const isCorrect = oIdx === q.correctAnswer;
              const isSelected = oIdx === q.selectedOption;

              let style = "border-slate-100 text-slate-600";
              if (isCorrect) style = "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
              else if (isSelected && !q.isCorrect) style = "border-rose-400 bg-rose-50 text-rose-800";

              return (
                <div key={oIdx} className={`px-4 py-3 rounded-xl border-2 flex items-center justify-between text-sm transition-all ${style}`}>
                  <span className="font-semibold"><span className="opacity-30 mr-2">{String.fromCharCode(65 + oIdx)}.</span> {opt}</span>
                  {isCorrect && <CheckCircle2 size={14} />}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4">
            {!q.isCorrect && q.selectedOption !== -1 && (
              <span className="text-[9px] font-black text-rose-500 uppercase px-2 py-1 bg-rose-50 rounded">Wrong Choice</span>
            )}
            {q.selectedOption === -1 && (
              <span className="text-[9px] font-black text-slate-400 uppercase px-2 py-1 bg-slate-100 rounded">Skipped</span>
            )}
            <div className="h-px flex-1 bg-slate-50" />
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-400 print:bg-white">
            <p className="text-[9px] font-black text-indigo-500 uppercase mb-1 flex items-center gap-1"><Zap size={10} /> Explanation</p>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">{q.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}