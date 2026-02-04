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

  // Added "explanation" field to fake data to show how it renders
  const fakeAnalysis = {
    testTitle: "MHT-CET Full Mock #01",
    score: 142,
    rank: 124,
    analysis: [
      {
        questionText: "Which of the following describes the behavior of an ideal gas?",
        options: ["High pressure", "Low pressure", "Perfectly elastic collisions", "None of these"],
        correctAnswer: 2,
        selectedOption: 2,
        isCorrect: true,
        explanation: "Ideal gas particles undergo perfectly elastic collisions where no kinetic energy is lost."
      }
    ]
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/student/test-analysis/${testId}/attempt/${attemptNumber}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await res.json();
        if (!res.ok || !result.analysis) {
           setData(fakeAnalysis);
        } else {
           setData(result);
           console.log(result);
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
    const fileName = `Nexus_Analysis_ATT${attemptNumber}.doc`;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body style="font-family: 'Segoe UI', Arial; line-height:1.4;">`;
    const footer = `</body></html>`;
    
    let content = `
      <div style="background-color:#0f172a; padding:30px; color:white; text-align:center; border-radius:10px;">
        <h1 style="margin:0; font-size:24px;">NEXUS INTELLIGENCE REPORT</h1>
        <p style="margin:5px 0 0 0; font-size:10px; letter-spacing:4px; color:#94a3b8;">SECURE DIAGNOSTIC LOG</p>
      </div>
      <div style="padding:15px; border-bottom:1px solid #e2e8f0; margin-bottom:20px;">
        <p><b>MODULE:</b> ${data.testTitle} | <b>SCORE:</b> ${data.score} | <b>RANK:</b> ${data.rank || 'N/A'}</p>
      </div>
    `;

    data.analysis.forEach((q, i) => {
      let optionsHtml = "";
      q.options.forEach((opt, idx) => {
        let color = "#334155"; // Default text
        let weight = "normal";
        let icon = "○";

        if (idx === q.correctAnswer) {
          color = "#059669"; // Green for correct
          weight = "bold";
          icon = "● [CORRECT]";
        } else if (idx === q.selectedOption && !q.isCorrect) {
          color = "#dc2626"; // Red for wrong selection
          weight = "bold";
          icon = "● [YOUR CHOICE]";
        }

        optionsHtml += `<p style="color:${color}; font-weight:${weight}; margin:4px 0;">${icon} ${opt}</p>`;
      });

      content += `
        <div style="margin-bottom:30px; border:1px solid #f1f5f9; padding:15px; border-radius:8px;">
          <p style="font-size:14px; margin-bottom:10px;"><b>Q${i+1}. ${q.questionText}</b></p>
          <div style="padding-left:15px; margin-bottom:10px;">${optionsHtml}</div>
          <div style="background-color:#f8fafc; padding:10px; border-top:1px dashed #cbd5e1;">
            <p style="font-size:11px; color:#475569; margin:0;"><b>EXPLANATION:</b> ${q.explanation || 'No explanation provided for this module.'}</p>
          </div>
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
    <div className="flex flex-col items-center justify-center h-screen bg-white overflow-hidden">
       <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence...</p>
    </div>
  );

  return (
    <div className="h-[80vh] w-full flex flex-col bg-[#F8FAFF] overflow-hidden">
      {/* Header - Compact */}
      <nav className="shrink-0 bg-white/80 backdrop-blur-md px-6 py-3 border-b border-slate-100 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
          <ArrowLeftIcon size={18} />
        </button>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attempt #{attemptNumber}</span>
      </nav>

      {/* Main Content - No Scroll Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <FingerprintIcon size={300} strokeWidth={0.1} className="absolute text-indigo-500/5 pointer-events-none" />

        <div className="w-full max-w-sm flex flex-col gap-4">
          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full mb-4">
              <ShieldCheckIcon size={12} className="text-indigo-600" />
              <span className="text-[9px] font-black text-indigo-600 uppercase">Analysis Ready</span>
            </div>
            
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 leading-tight line-clamp-2">
              {data.testTitle}
            </h2>
            
            <div className="flex justify-between items-center px-4 mb-8">
               <div className="text-center">
                  <Trophy size={20} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
                  <p className="text-xl font-black text-slate-900">#{data.rank || '--'}</p>
               </div>
               
               <div className="h-8 w-[1px] bg-slate-100" />

               <div className="text-center">
                  <Activity size={20} className="text-indigo-600 mx-auto mb-1" />
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                  <p className="text-xl font-black text-slate-900">{data.score}</p>
               </div>
            </div>

            <button 
              onClick={handleDownload}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
            >
              <FileText size={16} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Download Results</span>
              <Download size={14} className="animate-bounce" />
            </button>
          </div>

          {/* Action Button */}
          <button 
             onClick={() => navigate(`/student/test/${testId}`)}
             className="w-full bg-white border border-slate-200 text-slate-900 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] active:bg-slate-100 transition-all flex items-center justify-center gap-2"
           >
             <RotateCcw size={14} />
             Retake Module
           </button>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="shrink-0 p-4 text-center">
         <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">Nexus Evolution System</p>
      </footer>
    </div>
  );
}