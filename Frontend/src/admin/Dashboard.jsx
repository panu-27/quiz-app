import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { 
  FileText, PlusCircle, BarChart3, 
  Upload, Wind, Beaker, Binary, Atom, CheckCircle2, File, X, Bell, Loader2,
  BookOpen, HelpCircle, Sigma, Trash2,
  CloudAlertIcon, Users
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState('Notes');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState(null); 
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); 
  const fileInputRef = useRef(null);

  // --- BATCH STATE ---
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const subjects = [
    { id: 'phy', name: 'Physics', icon: <Wind size={24} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'che', name: 'Chemistry', icon: <Beaker size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'mat', name: 'Maths', icon: <Binary size={24} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'bio', name: 'Biology', icon: <Atom size={24} />, color: 'text-pink-500', bg: 'bg-pink-50' },
  ];

  const resourceTypes = [
    { id: 'Notes', label: 'Notes', icon: <BookOpen size={14} /> },
    { id: 'PYQs', label: 'PYQs', icon: <HelpCircle size={14} /> },
    { id: 'Formulas', label: 'Formulas', icon: <Sigma size={14} /> },
  ];

  const menuItems = [
    { title: "See Tests", desc: "Manage active sessions", icon: <FileText size={24} className="text-indigo-600" />, path: "/admin/tests", color: "bg-indigo-50" },
    { title: "Create Test", desc: "AI & Manual Creator", icon: <PlusCircle size={24} className="text-blue-600" />, path: "/admin/create-test", color: "bg-blue-50" },
    { title: "Performance", desc: "Grades & Analytics", icon: <BarChart3 size={24} className="text-emerald-600" />, path: "/admin/performance", color: "bg-emerald-50" }
  ];

  // --- FETCH BATCHES ON LOAD ---
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/teacher/my-batches");
        setAvailableBatches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Batch fetch error:", err);
      } finally {
        setBatchesLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleBatch = (id) => {
    setSelectedBatchIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleSelectClick = () => {
    if (!selectedSubject) {
      showNotification("Please select a subject first", "error");
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStatus('staged');
    }
  };

const startUpload = async () => {
  if (!selectedFile || !selectedSubject) return;
  if (selectedBatchIds.length === 0) {
    showNotification("Select at least one batch", "error");
    return;
  }

  setUploading(true);
  setStatus('uploading');
  setProgress(0);

  // 1. Prepare FormData (Required for file uploads)
  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("subjectId", selectedSubject);
  formData.append("category", selectedType);
  // Backend service expects a parsed array or stringified JSON
  formData.append("batchIds", JSON.stringify(selectedBatchIds));

  // Logging for your debugging
  console.group("🚀 NEXUS DEPLOYMENT INITIATED");
  console.log("Payload:", { 
    fileName: selectedFile.name, 
    subjectId: selectedSubject, 
    category: selectedType, 
    batches: selectedBatchIds 
  });
  console.groupEnd();

  const interval = setInterval(() => {
    setProgress((prev) => (prev >= 95 ? 95 : prev + 5));
  }, 150);

  try {
    const token = localStorage.getItem("token");
    
    // 2. Execute Fetch Call with Full URL and Token
    const res = await fetch(`${baseURL}/teacher/upload-material`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // NOTE: Do NOT add 'Content-Type': 'multipart/form-data' here. 
        // Fetch will handle it automatically for FormData.
      },
      body: formData
    });

    const result = await res.json();

    if (res.ok) {
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setStatus('success');
        showNotification(`${selectedFile.name} deployed successfully!`);
      }, 500);
    } else {
      throw new Error(result.message || "Upload failed");
    }
  } catch (err) {
    console.error("Upload Error:", err);
    showNotification(err.message || "Network Error", "error");
    resetState();
  } finally {
    clearInterval(interval);
  }
};

  const resetState = () => {
    setSelectedFile(null);
    setSelectedBatchIds([]);
    setStatus('idle');
    setProgress(0);
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20 font-sans text-slate-900">
      <AdminHeader userName={user?.name} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-6 pt-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {menuItems.map((item, idx) => (
            <button key={idx} onClick={() => navigate(item.path)} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-start gap-4 hover:shadow-xl hover:border-indigo-100 transition-all group shadow-sm">
              <div className={`${item.color} p-4 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                {item.icon}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">{item.title}</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest leading-none">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h2 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-1">Asset Pipeline</h2>
              <p className="text-sm font-bold text-slate-900">Deploy Study Material</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-600 uppercase">Live Sync</span>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">01. Target Subject & Category</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {subjects.map((s) => (
                    <button key={s.id} onClick={() => status === 'idle' && setSelectedSubject(s.id)} className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${selectedSubject === s.id ? "bg-indigo-50/50 border-indigo-600 ring-4 ring-indigo-50" : "bg-white border-slate-100 hover:border-slate-200"}`}>
                      <div className={`${s.bg} ${s.color} p-3 rounded-lg`}>{React.cloneElement(s.icon, { size: 20 })}</div>
                      <span className="font-bold text-xs">{s.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {resourceTypes.map((type) => (
                    <button key={type.id} onClick={() => status !== 'uploading' && setSelectedType(type.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all border ${selectedType === type.id ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"}`}>
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* --- NEW BATCH SELECTION UI --- */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Users size={14} /> 02. Shared With (Batches)
                </p>
                <div className="flex flex-wrap gap-2">
                  {batchesLoading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                      <Loader2 className="animate-spin" size={14} /> Loading Nexus Batches...
                    </div>
                  ) : availableBatches.map(batch => (
                    <button
                      key={batch._id}
                      onClick={() => status === 'idle' || status === 'staged' ? toggleBatch(batch._id) : null}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                        selectedBatchIds.includes(batch._id) 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                        : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      {batch.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">03. Material Deployment</p>
              <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center transition-all ${status === 'success' ? "bg-emerald-50 border-emerald-200" : status === 'staged' ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"}`}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf" />
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-4 transition-all ${status === 'success' ? 'bg-emerald-500 text-white' : status === 'staged' ? 'bg-indigo-600 text-white animate-bounce' : 'bg-white text-slate-400'}`}>
                  {status === 'success' ? <CheckCircle2 size={28} /> : uploading ? <Loader2 className="animate-spin" size={28} /> : status === 'staged' ? <FileText size={28} /> : <Upload size={28} />}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 truncate w-full px-6">{status === 'success' ? "Asset Deployed" : selectedFile ? selectedFile.name : "Select PDF Document"}</h3>
                <p className="text-[10px] text-slate-400 mb-8 uppercase font-bold tracking-widest">{status === 'success' ? "Available in Student Vault" : status === 'staged' ? `Ready for ${selectedBatchIds.length} Batches` : "PDF format only (Max 20MB)"}</p>

                {status === 'uploading' ? (
                  <div className="w-full space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-indigo-600 uppercase"><span>Syncing...</span><span>{progress}%</span></div>
                    <div className="w-full h-1 bg-indigo-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-300" style={{width: `${progress}%`}}></div></div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <button onClick={() => status === 'staged' ? startUpload() : status === 'success' ? resetState() : handleSelectClick()} className={`w-full py-4 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all ${status === 'success' ? "bg-emerald-600 text-white" : status === 'staged' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200"}`}>
                      {status === 'success' ? "Deploy Another" : status === 'staged' ? "Start Deployment" : "Select File"}
                    </button>
                    {status === 'staged' && <button onClick={resetState} className="flex items-center gap-2 mx-auto text-slate-400 hover:text-rose-500 text-[10px] font-bold uppercase transition-colors"><Trash2 size={12} /> Discard</button>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 px-4 w-full flex justify-center">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border w-full max-w-[340px] sm:max-w-md ${toast.type === "error" ? "bg-red-50 border-red-100 text-red-700" : "bg-white border-slate-100 text-slate-800"}`}>
            <div className={`shrink-0 p-2 rounded-xl ${toast.type === "error" ? "bg-red-100" : "bg-indigo-100 text-indigo-600"}`}><Bell size={18} /></div>
            <div className="min-w-0 flex-1"><p className="text-[11px] font-black uppercase tracking-tight truncate">{toast.message}</p></div>
            <button onClick={() => setToast(null)} className="shrink-0 ml-1 p-1 hover:bg-slate-100 rounded-lg transition-colors"><X size={14} className="text-slate-400" /></button>
          </div>
        </div>
      )}
    </div>
  );
}