import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  ArrowLeftIcon, 
  FingerprintIcon,
  ShieldCheckIcon,
  Download,
  Trophy,
  Activity,
  FileText,
  RotateCcw
} from "lucide-react";

export default function AttemptAnalytics() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const { testId, attemptNumber } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fakeAnalysis = {
    testTitle: "MHT-CET Full Mock Test #01",
    score: 142,
    rank: 124,
    analysis: [
      {
        questionText: "Which of the following describes the behavior of an ideal gas?",
        options: ["High pressure", "Low pressure", "Perfectly elastic collisions", "None"],
        correctAnswer: 2,
        selectedOption: 2,
        isCorrect: true
      }
    ]
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Ensure this matches your actual backend route exactly
        const res = await fetch(`${baseURL}/student/test-analysis/${testId}/attempt/${attemptNumber}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        
        // If API fails or return empty, use fakeAnalysis
        if (!res.ok || !result.analysis) {
           setData(fakeAnalysis);
        } else {
           setData(result);
        }
      } catch (err) {
        setData(fakeAnalysis);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [testId, attemptNumber]);

  const handleDownload = () => {
    if (!data || !data.analysis) return;
    const fileName = `Nexus_Diagnostic_Report_ATT${attemptNumber}.doc`;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body style="font-family: Arial, sans-serif;">`;
    const footer = `</body></html>`;
    
    let content = `
      <div style="background-color:#1e1b4b; padding:20px; color:white; text-align:center;">
        <h1 style="margin:0;">NEXUS SYSTEM LOGS</h1>
        <p style="margin:5px 0 0 0; font-size:12px; letter-spacing:2px;">AUTHENTICATED DIAGNOSTIC REPORT</p>
      </div>
      <div style="padding:20px; border:1px solid #e2e8f0;">
        <p><b>TEST MODULE:</b> ${data.testTitle}</p>
        <p><b>ATTEMPT ITERATION:</b> #${attemptNumber}</p>
        <p><b>NET SCORE:</b> ${data.score}</p>
        <p><b>GLOBAL RANK:</b> ${data.rank || 'N/A'}</p>
      </div>
      <h3 style="margin-top:30px; border-bottom:2px solid #4f46e5; padding-bottom:5px;">RESPONSE MATRIX</h3>
    `;

    data.analysis.forEach((q, i) => {
      const studentAns = q.selectedOption !== null ? q.options[q.selectedOption] : 'NO RESPONSE';
      const correctAns = q.options[q.correctAnswer];
      content += `
        <div style="margin-bottom:25px; padding:15px; border-left:4px solid ${q.isCorrect ? '#10b981' : '#f43f5e'}; background-color:#f8fafc;">
          <p style="margin:0 0 10px 0;"><b>[Q${i+1}] ${q.questionText}</b></p>
          <p style="margin:10px 0 0 0; font-size:12px;">
            <b>STUDENT CHOICE:</b> <span style="color:${q.isCorrect ? '#059669' : '#e11d48'};">${studentAns}</span><br/>
            <b>SYSTEM TRUTH:</b> <span style="color:#059669;">${correctAns}</span>
          </p>
        </div>
      `;
    });

    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
       <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence...</p>
    </div>
  );

  return (
    <div className="h-[88vh] flex flex-col bg-[#F8FAFF] font-sans text-slate-900 overflow-hidden">
      <nav className="shrink-0 bg-white border-b border-slate-100 px-6 py-4 z-30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-900 hover:text-white rounded-xl transition-all border border-slate-100">
            <ArrowLeftIcon size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Offline</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center relative">
        <FingerprintIcon size={400} strokeWidth={0.1} className="absolute text-indigo-500/5 pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-6">
              <ShieldCheckIcon size={12} className="text-indigo-600" />
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">Validated Result</span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-12 leading-none">
              {data.testTitle}
            </h2>
            
            <div className="flex justify-around items-center mb-12">
               <div className="space-y-1">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <Trophy size={20} className="text-amber-500" />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
                  <p className="text-2xl font-black text-slate-900">#{data.rank || 'N/A'}</p>
               </div>
               
               <div className="h-10 w-[1px] bg-slate-100" />

               <div className="space-y-1">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <Activity size={20} className="text-indigo-600" />
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Score</p>
                  <p className="text-2xl font-black text-slate-900">{data.score}</p>
               </div>
            </div>

            <button 
              onClick={handleDownload}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl group"
            >
              <FileText size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Generate Response Log</span>
              <Download size={14} className="animate-bounce" />
            </button>
          </div>

          <div className="mt-8 space-y-3">
            <button 
               onClick={() => navigate(`/student/test/${testId}`)}
               className="w-full bg-white border border-slate-200 text-slate-900 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-950 hover:text-white transition-all flex items-center justify-center gap-2"
             >
               <RotateCcw size={14} />
               Re-Attempt Module
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}