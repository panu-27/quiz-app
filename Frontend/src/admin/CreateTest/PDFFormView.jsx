import React, { useState, useEffect } from "react";
import { 
  FileText, CheckCircle, AlertTriangle, Eye, Loader2, 
  Calendar, Clock, Zap, Globe, Trash2, Users, X, Timer
} from "lucide-react";

export default function PDFFormView() {
  const [testData, setTestData] = useState({
    title: "", 
    pattern: "PCM", 
    duration: 180,
    selectedBatchIds: [], 
    scheduleDate: "", 
    scheduleTime: "",
    endTimeDate: "", 
    endTimeTime: "",
    subjects: [
      { id: "p", name: "Physics", file: null, synced: false, questions: [], loading: false, count: 0 },
      { id: "c", name: "Chemistry", file: null, synced: false, questions: [], loading: false, count: 0 },
      { id: "m", name: "Math", file: null, synced: false, questions: [], loading: false, count: 0 },
    ],
  });

  const [availableBatches, setAvailableBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({ subject: "", questions: [] });

  /* ---------- FETCH BATCHES ---------- */
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/teacher/my-batches", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAvailableBatches(Array.isArray(data) ? data : data.batches || []);
      } catch (err) {
        console.error("Batch fetch error:", err.message);
      } finally {
        setBatchesLoading(false);
      }
    };
    fetchBatches();
  }, []);

  /* ---------- PATTERN LOGIC ---------- */
  const handlePatternChange = (pattern) => {
    const subjectsMap = { 
        PCM: ["Physics", "Chemistry", "Math"], 
        PCB: ["Physics", "Chemistry", "Biology"], 
        SINGLE: ["Select Subject"] 
    };
    const newSubjects = subjectsMap[pattern].map((name) => ({ 
        id: Math.random(), 
        name, 
        file: null, 
        synced: false, 
        questions: [], 
        loading: false,
        count: 0
    }));
    setTestData({ ...testData, pattern, subjects: newSubjects });
  };

  const updateSubjectName = (idx, newName) => {
    const updated = [...testData.subjects];
    updated[idx].name = newName;
    setTestData({ ...testData, subjects: updated });
  };

  /* ---------- EXTRACT PDF ---------- */
  const handleSyncPDF = async (idx) => {
    const updated = [...testData.subjects];
    if (!updated[idx].file) return alert("Please upload a PDF first");
    if (updated[idx].name === "Select Subject") return alert("Please select a subject name first");

    updated[idx].loading = true;
    setTestData({ ...testData, subjects: updated });
    
    const formData = new FormData();
    formData.append("file", updated[idx].file);
    formData.append("subject", updated[idx].name);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/pdf/extract", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      const refreshedSubjects = [...testData.subjects];
      
      if (data.success || data.questions) {
        const extractedQuestions = data.questions || [];
        refreshedSubjects[idx].questions = extractedQuestions;
        refreshedSubjects[idx].count = extractedQuestions.length; // ✅ Store question count
        refreshedSubjects[idx].synced = true;
        setPreviewData({ subject: updated[idx].name, questions: extractedQuestions });
        setShowPreview(true);
      } else {
          alert(data.message || "Extraction failed");
      }
      refreshedSubjects[idx].loading = false;
      setTestData({ ...testData, subjects: refreshedSubjects });
    } catch (err) {
      const resetSubjects = [...testData.subjects];
      resetSubjects[idx].loading = false;
      setTestData({ ...testData, subjects: resetSubjects });
    }
  };

  /* ---------- CREATE TEST ---------- */
  const handleCreateTest = async () => {
    if (testData.selectedBatchIds.length === 0) return alert("Please select at least one batch");
    setIsSubmitting(true);
    
    // 🔥 BUILD CONFIGURATION ARRAY
    const configuration = testData.subjects.map(sub => ({
      subject: sub.name,
      questions: sub.count // This allows the backend to know the "index" for each block
    }));

    // FLAT LIST OF ALL QUESTIONS
    const allQuestions = testData.subjects.reduce((acc, sub) => {
      const formatted = sub.questions.map(q => ({
        questionText: q.questionText || q.text,
        options: q.options,
        correctAnswer: q.correctAnswer 
      }));
      return [...acc, ...formatted];
    }, []);

    let startTime = new Date().toISOString(); 
    if (testData.scheduleDate) {
        startTime = new Date(`${testData.scheduleDate}T${testData.scheduleTime || '00:00'}`).toISOString();
    }

    let endTime = "2030-01-01T00:00:00Z";
    if (testData.endTimeDate) {
        endTime = new Date(`${testData.endTimeDate}T${testData.endTimeTime || '23:59'}`).toISOString();
    }

    // 🔥 PREPARE PAYLOAD
    const payload = {
      title: testData.title || "Untitled Test",
      batchIds: testData.selectedBatchIds,
      questions: allQuestions,
      configuration: configuration, // ✅ Added Configuration
      startTime,
      endTime,
      duration: parseInt(testData.duration),
      mode: "PDF" // ✅ Standardized mode
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/teacher/create-test", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("Assessment Published Successfully!");
      else alert("Error publishing test");
    } catch (err) {
      alert("Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ebf8] py-6 md:py-10 px-3 md:px-4 font-sans text-slate-900">
      {/* PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-[#673ab7] uppercase">Preview: {previewData.subject} ({previewData.questions.length} Qs)</h2>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {previewData.questions.map((q, i) => (
                <div key={i} className="space-y-3 p-4 border rounded-xl bg-white">
                  <p className="font-bold text-slate-800">Q{i+1}. {q.questionText}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`p-2 text-xs rounded border ${q.correctAnswer === oi ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-slate-50'}`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-slate-50 text-center">
              <button onClick={() => setShowPreview(false)} className="bg-[#673ab7] text-white px-8 py-2 rounded-full font-bold text-sm">Looks Good!</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-3 bg-[#673ab7] rounded-t-xl w-full" />

        <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#673ab7]" />
          
          <input 
            className="w-full text-2xl md:text-4xl font-normal border-b-2 border-transparent focus:border-[#673ab7] outline-none pb-2 mb-8 transition-all" 
            placeholder="Untitled Exam Title" 
            onChange={(e) => setTestData({...testData, title: e.target.value})}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Timer size={14} /> Duration (Mins)</label>
                <input type="number" className="w-full bg-[#f8f9fa] p-3 rounded-lg border-b-2 border-slate-200 outline-none focus:border-[#673ab7] font-bold" value={testData.duration} onChange={(e) => setTestData({...testData, duration: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> Pattern</label>
                <select className="w-full bg-[#f8f9fa] p-3 rounded-lg border-b-2 border-slate-200 outline-none focus:border-[#673ab7] font-bold" value={testData.pattern} onChange={(e) => handlePatternChange(e.target.value)}>
                  <option value="PCM">PCM (JEE/CET)</option>
                  <option value="PCB">PCB (NEET)</option>
                  <option value="SINGLE">Single Subject</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Users size={14} /> Batches</label>
              <div className="flex flex-wrap gap-2 p-1">
                {batchesLoading ? <Loader2 size={16} className="animate-spin" /> : availableBatches.map(batch => (
                  <button key={batch._id} onClick={() => {
                      const ids = testData.selectedBatchIds.includes(batch._id) ? testData.selectedBatchIds.filter(id => id !== batch._id) : [...testData.selectedBatchIds, batch._id];
                      setTestData({...testData, selectedBatchIds: ids});
                  }} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${testData.selectedBatchIds.includes(batch._id) ? 'bg-[#673ab7] text-white' : 'bg-white text-slate-500'}`}>{batch.name}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> Start Time</label>
              <div className="flex gap-2">
                <input type="date" className="w-1/2 p-2 rounded border text-xs font-bold" onChange={(e) => setTestData({...testData, scheduleDate: e.target.value})}/>
                <input type="time" className="w-1/2 p-2 rounded border text-xs font-bold" onChange={(e) => setTestData({...testData, scheduleTime: e.target.value})}/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2"><Clock size={14} /> Expiry</label>
              <div className="flex gap-2">
                <input type="date" className="w-1/2 p-2 rounded border text-xs font-bold" onChange={(e) => setTestData({...testData, endTimeDate: e.target.value})}/>
                <input type="time" className="w-1/2 p-2 rounded border text-xs font-bold" onChange={(e) => setTestData({...testData, endTimeTime: e.target.value})}/>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {testData.subjects.map((sub, idx) => (
            <div key={sub.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${sub.synced ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-[#673ab7]'}`}><FileText size={20} /></div>
                   {testData.pattern === "SINGLE" ? (
                     <select 
                        className="font-black text-slate-700 uppercase tracking-tight border-b-2 border-[#673ab7] outline-none bg-transparent"
                        value={sub.name}
                        onChange={(e) => updateSubjectName(idx, e.target.value)}
                     >
                        <option disabled value="Select Subject">Select Subject</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Math">Math</option>
                        <option value="Biology">Biology</option>
                        <option value="English">English</option>
                        <option value="Other">Other</option>
                     </select>
                   ) : (
                     <h3 className="font-black text-slate-700 uppercase tracking-tight">
                        {sub.name} {sub.synced && <span className="text-emerald-500 ml-2">({sub.count} Qs)</span>}
                     </h3>
                   )}
                </div>
                {sub.synced && (
                  <button onClick={() => { setPreviewData({ subject: sub.name, questions: sub.questions }); setShowPreview(true); }} className="text-xs font-bold text-[#673ab7] underline">View</button>
                )}
              </div>
              <div className={`p-6 border-2 border-dashed rounded-xl ${sub.file ? 'bg-slate-50 border-slate-300' : 'bg-[#fcfaff] border-purple-100'}`}>
                {!sub.file ? (
                  <div className="flex flex-col items-center gap-2">
                    <input type="file" id={`f-${idx}`} className="hidden" accept=".pdf" onChange={(e) => {
                      const updated = [...testData.subjects];
                      updated[idx].file = e.target.files[0];
                      setTestData({ ...testData, subjects: updated });
                    }} />
                    <label htmlFor={`f-${idx}`} className="cursor-pointer bg-[#673ab7] text-white px-8 py-3 text-[10px] font-black rounded-full uppercase">Attach PDF</label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{sub.file.name}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleSyncPDF(idx)} disabled={sub.loading} className="px-4 py-2 bg-[#673ab7] text-white text-[10px] font-black rounded-lg">
                        {sub.loading ? <Loader2 className="animate-spin" size={14}/> : "Extract"}
                      </button>
                      <button onClick={() => {
                        const updated = [...testData.subjects];
                        updated[idx].file = null;
                        updated[idx].synced = false;
                        updated[idx].questions = [];
                        updated[idx].count = 0;
                        setTestData({...testData, subjects: updated});
                      }} className="p-2 text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-10 pb-20 flex flex-col items-center">
          <button 
            disabled={!testData.subjects.every(s => s.synced) || isSubmitting || testData.selectedBatchIds.length === 0}
            onClick={handleCreateTest}
            className="w-full md:w-auto px-16 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl bg-[#673ab7] text-white disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-3">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Zap size={22} />}
              <span>{isSubmitting ? 'Processing...' : 'Go Live Now'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}