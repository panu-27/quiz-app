import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, CheckCircle2, Eye, Loader2, Calendar, Clock, Zap, 
  Globe, Trash2, Users, X, Timer, Hash, Settings2, Plus, Layout, Target, BookOpen
} from "lucide-react";

export default function PDFFormView() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [availableBatches, setAvailableBatches] = useState([]);
  const [configTree, setConfigTree] = useState([]); // Store subjects list for IDs
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [previewData, setPreviewData] = useState({ subject: "", questions: [] });

  const [testData, setTestData] = useState({
    title: "", pattern: "PCM", duration: 180, selectedBatchIds: [], 
    scheduleDate: "", scheduleTime: "", endTimeDate: "", endTimeTime: "",
    subjects: [], // Initialized in useEffect
  });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  /* ---------- FETCH INITIAL DATA ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [batchRes, treeRes] = await Promise.all([
            fetch(`${baseURL}/teacher/my-batches`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${baseURL}/bankQuestion/config-tree`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        const batchData = await batchRes.json();
        const treeData = await treeRes.json();
        
        setAvailableBatches(Array.isArray(batchData) ? batchData : batchData.batches || []);
        setConfigTree(treeData);
        
        // Initialize subjects with real IDs from treeData
        if (treeData.length > 0) {
            initSubjects("PCM", treeData);
        }
      } catch (err) { console.error(err); } 
      finally { setBatchesLoading(false); }
    };
    fetchData();
  }, [baseURL]);

  /* ---------- SUBJECT INITIALIZER ---------- */
  const initSubjects = (pattern, currentTree = configTree) => {
    const map = { 
        PCM: ["Physics", "Chemistry", "Mathematics"], 
        PCB: ["Physics", "Chemistry", "Biology"], 
        "JEE MAINS": ["Physics", "Chemistry", "Mathematics"],
        NEET: ["Physics", "Chemistry", "Biology"],
        SINGLE: ["Physics"] 
    };

    const targetNames = map[pattern] || ["Physics"];

    const newSubjects = targetNames.map((name) => {
        const matched = currentTree.find(s => 
            s.subjectName.toLowerCase().includes(name.toLowerCase())
        );
        return { 
            id: matched?._id || Math.random(), // Real DB ID
            name: matched?.subjectName || name, 
            file: null, synced: false, questions: [], loading: false, count: 0 
        };
    });
    setTestData(prev => ({ ...prev, pattern, subjects: newSubjects }));
  };

  const handlePatternChange = (pattern) => {
    initSubjects(pattern);
  };

  const updateSubjectName = (idx, newName) => {
    const matched = configTree.find(s => s.subjectName === newName);
    const updated = [...testData.subjects];
    updated[idx].name = newName;
    updated[idx].id = matched?._id || updated[idx].id;
    setTestData({ ...testData, subjects: updated });
  };

  /* ---------- PDF EXTRACTION ---------- */
  const handleSyncPDF = async (idx) => {
    const updated = [...testData.subjects];
    if (!updated[idx].file) return alert("Upload PDF first");
    updated[idx].loading = true;
    setTestData({ ...testData, subjects: updated });
    
    const formData = new FormData();
    formData.append("file", updated[idx].file);
    formData.append("subject", updated[idx].name);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseURL}/pdf/extract`, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData });
      const data = await res.json();
      const refreshed = [...testData.subjects];
      if (res.ok && data.questions) {
        refreshed[idx].questions = data.questions;
        refreshed[idx].count = data.questions.length; 
        refreshed[idx].synced = true;
        setPreviewData({ subject: updated[idx].name, questions: data.questions });
        setShowPreview(true);
      } else { alert(data.message || "Extraction failed"); }
      refreshed[idx].loading = false;
      setTestData({ ...testData, subjects: refreshed });
    } catch (err) {
      const reset = [...testData.subjects];
      reset[idx].loading = false;
      setTestData({ ...testData, subjects: reset });
    }
  };

  /* ---------- PUBLISH LOGIC ---------- */
const handleCreateTest = async () => {
  if (!testData.title || testData.selectedBatchIds.length === 0) return alert("Missing Title/Batch");
  setIsSubmitting(true);

  const typeMap = { "PCM": "PCM", "PCB": "PCB", "JEE MAINS": "JEE", "NEET": "NEET", "SINGLE": "OTHER" };
  const isNegative = ["JEE MAINS", "NEET"].includes(testData.pattern);

  const now = new Date();
  const startTime = testData.scheduleDate ? new Date(`${testData.scheduleDate}T${testData.scheduleTime || '00:00'}`) : now;
  let endTime;
  if (testData.endTimeDate) {
      endTime = new Date(`${testData.endTimeDate}T${testData.endTimeTime || '23:59'}`);
  } else {
      endTime = new Date(startTime.getTime() + (Number(testData.duration) + 60) * 60000);
  }

  // Helper to transform subject to section format
  const mapToSection = (sub) => ({
    subject: sub.id,
    subjectName: sub.name,
    numQuestions: sub.count,
    questions: sub.questions.map((q, qidx) => ({ 
        order: qidx + 1,
        questionText: q.questionText || q.text, 
        options: q.options, 
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
    }))
  });

  /* --- BLOCK SPLITTING LOGIC --- */
  let finalBlocks = [];
  const totalDuration = parseInt(testData.duration);

  if (testData.pattern === "PCM") {
    // Block 1: Physics & Chemistry (90 mins if 180 total)
    // Block 2: Mathematics (90 mins if 180 total)
    finalBlocks = [
      {
        blockName: "Physics & Chemistry",
        duration: totalDuration / 2,
        sections: testData.subjects
          .filter(s => s.name.toLowerCase().includes("phys") || s.name.toLowerCase().includes("chem"))
          .map(mapToSection)
      },
      {
        blockName: "Mathematics",
        duration: totalDuration / 2,
        sections: testData.subjects
          .filter(s => s.name.toLowerCase().includes("math"))
          .map(mapToSection)
      }
    ];
  } else if (testData.pattern === "PCB") {
    // Block 1: Physics & Chemistry
    // Block 2: Biology
    finalBlocks = [
      {
        blockName: "Physics & Chemistry",
        duration: totalDuration / 2,
        sections: testData.subjects
          .filter(s => s.name.toLowerCase().includes("phys") || s.name.toLowerCase().includes("chem"))
          .map(mapToSection)
      },
      {
        blockName: "Biology",
        duration: totalDuration / 2,
        sections: testData.subjects
          .filter(s => s.name.toLowerCase().includes("biol"))
          .map(mapToSection)
      }
    ];
  } else {
    // JEE, NEET, SINGLE: All sections in one single block
    finalBlocks = [{
      blockName: "Session 1",
      duration: totalDuration,
      sections: testData.subjects.map(mapToSection)
    }];
  }

  const payload = {
    title: testData.title,
    batchIds: testData.selectedBatchIds,
    examType: typeMap[testData.pattern] || "OTHER",
    duration: totalDuration,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    mode: "PDF",
    markingScheme: { 
      isNegativeMarking: isNegative, 
      defaultCorrect: 1, 
      defaultNegative: isNegative ? 1 : 0 
    },
    metadata: { distribution: "Single Set" },
    blocks: finalBlocks
  };

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${baseURL}/teacher/create-test`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, 
        body: JSON.stringify(payload) 
    });
    if (res.ok) alert("Assessment Published Successfully!");
    else {
        const err = await res.json();
        alert(err.message || "Failed to Publish");
    }
  } catch (err) { alert("Network Error"); } 
  finally { setIsSubmitting(false); }
};

  return (
    <div className="min-h-[92vh] bg-[#FDFDFF] pb-26  font-sans w-full overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-4 py-4 md:py-6 w-full">
        <div className="w-full max-w-[1920px] mx-auto space-y-4 px-2">
          <input
            placeholder="Untitled PDF Exam..."
            className="text-2xl md:text-4xl font-black bg-transparent border-none outline-none placeholder:text-slate-200 w-full tracking-tighter text-slate-900 uppercase"
            onChange={e => setTestData({ ...testData, title: e.target.value })}
          />
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white shadow-sm px-3 py-2 rounded-2xl flex items-center gap-2 border border-slate-100 min-w-[100px]">
              <Timer size={16} className="text-orange-500" />
              <input type="number" value={testData.duration} onWheel={e => e.target.blur()} onChange={e => setTestData({...testData, duration: e.target.value})} className="bg-transparent font-black w-8 outline-none text-xs text-slate-800 no-spinner"/>
              <span className="text-[10px] font-black text-slate-400">MIN</span>
            </div>

            <div className="bg-white shadow-sm px-3 py-2 rounded-2xl flex items-center gap-2 border border-slate-100 min-w-[120px]">
              <Target size={16} className="text-violet-500" />
              <div className="flex flex-col flex-1">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Pattern</span>
                <select className="bg-transparent font-black outline-none text-[10px] uppercase cursor-pointer text-slate-800" value={testData.pattern} onChange={e => handlePatternChange(e.target.value)}>
                    <option value="PCM">PCM (CET)</option>
                    <option value="PCB">PCB (CET)</option>
                    <option value="JEE MAINS">JEE MAINS</option>
                    <option value="NEET">NEET</option>
                    <option value="SINGLE">SINGLE</option>
                </select>
              </div>
            </div>

            <button onClick={() => setShowSchedule(!showSchedule)} className={`px-3 py-2 rounded-2xl flex items-center gap-2 border transition-all shadow-sm ${showSchedule ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                <Calendar size={16} /><span className="text-[10px] font-black uppercase">{showSchedule ? 'Close' : 'Schedule'}</span>
            </button>
            
            <div className="flex flex-wrap gap-1.5 items-center md:ml-auto">
              {availableBatches.map(batch => {
                const isSelected = testData.selectedBatchIds.includes(batch._id);
                return (
                  <button key={batch._id} onClick={() => setTestData({...testData, selectedBatchIds: isSelected ? testData.selectedBatchIds.filter(id => id !== batch._id) : [...testData.selectedBatchIds, batch._id]})}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${isSelected ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-transparent text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-violet-200'}`}
                  >{batch.name}</button>
                );
              })}
            </div>
          </div>

          {showSchedule && (
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200"><Calendar size={14} className="text-violet-500"/><input type="date" min={today} className="text-[10px] font-black outline-none px-2" onChange={e => setTestData({...testData, scheduleDate: e.target.value})} /> <input type="time" className="text-[10px] font-black outline-none border-l pl-2" onChange={e => setTestData({...testData, scheduleTime: e.target.value})} /></div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200"><Clock size={14} className="text-rose-500"/><input type="date" min={testData.scheduleDate || today} className="text-[10px] font-black outline-none px-2" onChange={e => setTestData({...testData, endTimeDate: e.target.value})} /> <input type="time" className="text-[10px] font-black outline-none border-l pl-2" onChange={e => setTestData({...testData, endTimeTime: e.target.value})} /></div>
            </div>
          )}
        </div>
      </div>

      {/* SUBJECT GRID */}
      <div className="w-full max-w-[1920px] mx-auto p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {testData.subjects.map((sub, idx) => {
          const synced = sub.synced;
          return (
            <div key={sub.id} className="group bg-white border border-slate-200 rounded-[2rem] p-5 transition-all hover:shadow-lg hover:border-violet-200 flex flex-col relative overflow-hidden">
              <div className={`absolute left-0 top-10 bottom-10 w-1 rounded-r-full transition-all ${synced ? 'bg-emerald-500' : 'bg-transparent'}`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${synced ? 'bg-emerald-50 text-emerald-600 shadow-md' : 'bg-violet-50 text-violet-600'}`}><FileText size={20} /></div>
                  <div className="flex flex-col">
                    {testData.pattern === "SINGLE" ? (
                      <select className="font-black text-slate-800 uppercase text-xs border-b border-violet-100 outline-none bg-transparent" value={sub.name} onChange={(e) => updateSubjectName(idx, e.target.value)}>
                        {configTree.map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                      </select>
                    ) : <h3 className="font-black text-slate-800 uppercase text-xs">{sub.name}</h3>}
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{synced ? `${sub.count} Qs Ready` : 'Pending PDF'}</span>
                  </div>
                </div>
                {synced && <button onClick={() => { setPreviewData({ subject: sub.name, questions: sub.questions }); setShowPreview(true); }} className="p-2 bg-violet-50 text-violet-600 rounded-lg hover:bg-violet-600 hover:text-white transition-all"><Eye size={14}/></button>}
              </div>

              <div className={`flex-1 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all ${sub.file ? 'bg-slate-50 border-slate-200' : 'bg-[#fcfaff] border-violet-100'}`}>
                {!sub.file ? (
                  <>
                    <input type="file" id={`f-${idx}`} className="hidden" accept=".pdf" onChange={(e) => { const updated = [...testData.subjects]; updated[idx].file = e.target.files[0]; setTestData({ ...testData, subjects: updated }); }} />
                    <label htmlFor={`f-${idx}`} className="cursor-pointer bg-slate-900 text-white px-5 py-2 text-[9px] font-black rounded-lg uppercase tracking-widest active:scale-95 shadow-md">Attach PDF</label>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100"><FileText size={12} className="text-rose-500" /><p className="text-[9px] font-black text-slate-600 truncate flex-1">{sub.file.name}</p><button onClick={() => { const up = [...testData.subjects]; up[idx].file = null; up[idx].synced = false; setTestData({...testData, subjects: up}); }} className="text-slate-300 hover:text-rose-500"><Trash2 size={12}/></button></div>
                    <button onClick={() => handleSyncPDF(idx)} disabled={sub.loading} className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-black rounded-xl shadow-md disabled:opacity-50 uppercase tracking-widest active:scale-95 transition-all">
                      {sub.loading ? <Loader2 className="animate-spin" size={12}/> : "Extract Qs"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-6 z-40">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex gap-2">
            <button disabled className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] font-black uppercase text-[10px] tracking-widest bg-slate-50 text-slate-400">
              <CheckCircle2 size={16}/> PDF MODE
            </button>
            <button onClick={handleCreateTest} disabled={isSubmitting || !testData.subjects.every(s => s.synced) || testData.selectedBatchIds.length === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 text-white ${!testData.subjects.every(s => s.synced) ? 'bg-slate-100 text-slate-300' : 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-200 hover:brightness-105'}`}
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16} />}
                Publish Test
            </button>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            <div className="p-6 border-b flex justify-between items-center bg-white shrink-0">
              <div><h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Extraction Preview</h2><p className="text-[9px] font-black text-slate-300 uppercase italic leading-none mt-1">Reviewing {previewData.subject} module</p></div>
              <button onClick={() => setShowPreview(false)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-50 rounded-xl"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
              {previewData.questions.map((q, i) => (
                <div key={i} className="space-y-3 p-5 border border-slate-200 rounded-[1.5rem] bg-white shadow-sm">
                  <p className="font-bold text-slate-800 text-[13px]">Q{i+1}. {q.questionText || q.text}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`p-3 text-[10px] rounded-xl border font-bold transition-all ${q.correctAnswer === oi ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        <span className="opacity-40 mr-1">{String.fromCharCode(65 + oi)}.</span> {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-white shrink-0"><button onClick={() => setShowPreview(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Looks Good</button></div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDE9FE; border-radius: 20px; }
          .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          .no-spinner { -moz-appearance: textfield; }
      `}} />
    </div>
  );
}