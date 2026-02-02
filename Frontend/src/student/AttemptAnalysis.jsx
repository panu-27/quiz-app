import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, StopCircleIcon } from "@heroicons/react/24/outline";

export default function AttemptAnalytics() {
  const { testId, attemptNumber } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/student/test-analysis/${testId}/attempt/${attemptNumber}`)
      .then(res => {
        console.log("ANALYSIS_DATA_RECEIVED:", res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ANALYSIS_FETCH_FAILED:", err);
        setLoading(false);
      });
  }, [testId, attemptNumber]);

  if (loading) return <div className="h-screen flex items-center justify-center font-mono text-[10px] bg-white">LOADING_ANALYSIS_DATA...</div>;
  if (!data || !data.analysis) return <div className="p-10 text-center font-mono">RECORD_NOT_FOUND</div>;

  // Calculate stats from the analysis array
  const totalCorrect = data.analysis.filter(q => q.isCorrect).length;
  const totalQuestions = data.totalQuestions || data.analysis.length;
  const accuracy = Math.round((totalCorrect / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
      {/* NAVIGATION */}
      <nav className="border-b border-slate-100 px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={() => navigate(`/student/take-test/${testId}`)}
          className="text-[10px] font-black uppercase border border-slate-900 px-3 py-1.5 hover:bg-slate-900 hover:text-white transition-all"
        >
          Re-Attempt Test
        </button>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Diagnostic Report</p>
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">{data.testTitle}</h1>
          <div className="flex gap-4 mt-4 font-mono text-[10px] uppercase">
             <span className="bg-slate-100 px-2 py-1 text-slate-600">Attempt: #0{attemptNumber}</span>
             <span className="bg-slate-100 px-2 py-1 text-slate-600">Questions: {totalQuestions}</span>
          </div>
        </header>

        {/* SUMMARY STATS GRID */}
        <div className="grid grid-cols-2 border border-slate-900 mb-12">
          <div className="p-6 border-r border-slate-900">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Total Score</p>
            <span className="text-4xl font-bold">{data.score}</span>
          </div>
          <div className="p-6">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Accuracy Percentage</p>
            <span className="text-4xl font-bold">{accuracy}%</span>
          </div>
        </div>

        {/* QUESTIONS REVIEW */}
        <div className="space-y-12">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">Response Analysis</h3>
          {data.analysis.map((q, idx) => (
            <div key={idx} className="group">
              <div className="flex items-start gap-4 mb-4">
                <span className="font-mono text-[11px] text-slate-300 mt-1">[{String(idx + 1).padStart(2, '0')}]</span>
                <p className="font-bold text-lg leading-tight text-slate-800">{q.questionText}</p>
              </div>

              <div className="grid gap-2 pl-10">
                {q.options.map((opt, oIdx) => {
                  const isCorrectChoice = oIdx === q.correctAnswer;
                  const isStudentChoice = oIdx === q.selectedOption;

                  // CSS Logic for option highlighting
                  let borderClass = "border-slate-100 text-slate-400";
                  let bgClass = "bg-white";

                  if (isCorrectChoice) {
                    borderClass = "border-emerald-500 text-emerald-900";
                    bgClass = "bg-emerald-50";
                  } else if (isStudentChoice && !isCorrectChoice) {
                    borderClass = "border-red-500 text-red-900";
                    bgClass = "bg-red-50";
                  }

                  return (
                    <div key={oIdx} className={`p-4 text-sm border flex justify-between items-center ${borderClass} ${bgClass}`}>
                      <span>{opt}</span>
                      <div className="flex items-center gap-2">
                        {isCorrectChoice && <span className="text-[9px] font-bold uppercase tracking-tighter text-emerald-600">Correct Answer</span>}
                        {isCorrectChoice && <CheckCircleIcon className="w-4 h-4 text-emerald-600" />}
                        {isStudentChoice && !isCorrectChoice && <XCircleIcon className="w-4 h-4 text-red-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SKIPPED STATUS */}
              {(q.selectedOption === null || q.selectedOption === undefined) && (
                <div className="mt-3 pl-10 flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase">
                  <StopCircleIcon className="w-3 h-3" /> No Response Provided
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}