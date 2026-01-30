import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { ArrowLeftIcon, ClockIcon, ShieldExclamationIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function AttemptAnalytics() {
  const { testId, attemptNumber } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSubject, setOpenSubject] = useState(null);

  useEffect(() => {
    api.get(`/tests/analytics/${testId}/attempt/${attemptNumber}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [testId, attemptNumber]);

  if (loading) return <div className="h-screen flex items-center justify-center font-mono text-[10px] tracking-widest text-slate-400 bg-white">INITIALIZING_DIAGNOSTIC_RENDER...</div>;

  const subjects = Object.values(data?.subjectWiseAnalytics || {});

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
      {/* MINIMALIST TOP BAR */}
      <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
        </button>
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit_Ref: {testId.slice(-6)}</span>
      </nav>

      <main className="max-w-xl mx-auto p-6">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
             <span className="h-2 w-2 bg-slate-900"></span>
             <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Performance Report</h2>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-1 uppercase italic">{data.testTitle}</h1>
          <p className="text-sm font-mono text-slate-500 uppercase tracking-tighter">Attempt Sequence #0{data.attemptNumber}</p>
        </header>

        {/* DATA GRID */}
        <section className="grid grid-cols-2 border border-slate-900 mb-12">
          <StatBox label="Net Score" value={data.score} sub="Points" />
          <StatBox label="Time Taken" value={`${Math.floor(data.timeTaken/60)}m`} sub={`${data.timeTaken%60}s`} />
          <StatBox label="Violations" value={data.violations} sub="Integrity" highlight={data.violations > 0} />
          <StatBox label="Accuracy" value={`${Math.round((data.score / (subjects.length * 10 || 1)) * 100)}%`} sub="Efficiency" />
        </section>

        {/* SUBJECT SECTIONS */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Subject Breakdown</h3>
          {subjects.map((sub, idx) => (
            <div key={idx} className={`border ${openSubject === idx ? 'border-slate-900' : 'border-slate-100'} transition-all`}>
              <button 
                onClick={() => setOpenSubject(openSubject === idx ? null : idx)}
                className="w-full p-4 flex justify-between items-center text-left"
              >
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">{sub.subjectName}</h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{sub.correct} CORRECT / {sub.wrong} WRONG</p>
                </div>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${openSubject === idx ? 'rotate-180' : ''}`} />
              </button>

              {openSubject === idx && (
                <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-6 animate-in slide-in-from-top-1">
                  {sub.questions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3">
                      <div className="flex gap-3">
                        <span className="font-mono text-[10px] text-slate-300 mt-1">Q{qIdx+1}</span>
                        <p className="text-xs font-bold leading-relaxed text-slate-800">{q.questionText}</p>
                      </div>
                      <div className="grid gap-1.5 pl-6">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.correctOption;
                          const isSelected = oIdx === q.selectedOption;
                          return (
                            <div key={oIdx} className={`p-2.5 text-[11px] border font-medium transition-all ${
                              isCorrect ? 'border-slate-900 bg-white text-slate-900' : 
                              isSelected ? 'border-slate-200 bg-slate-100 text-slate-400 line-through' :
                              'border-transparent text-slate-400'
                            }`}>
                              {opt.text}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value, sub, highlight }) {
  return (
    <div className="p-5 border-[0.5px] border-slate-100">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${highlight ? 'text-red-600' : 'text-slate-900'}`}>{value}</span>
        <span className="text-[10px] font-mono text-slate-400">{sub}</span>
      </div>
    </div>
  );
}