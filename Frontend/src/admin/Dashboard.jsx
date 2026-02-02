import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { 
  FileText, PlusCircle, BarChart3, ChevronRight, 
  Upload, Wind, Beaker, Binary, Atom, CheckCircle2, File, X, Bell
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [toast, setToast] = useState(null); 
  const fileInputRef = useRef(null);

  const subjects = [
    { id: 'phy', name: 'Physics', icon: <Wind size={24} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'che', name: 'Chemistry', icon: <Beaker size={24} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'mat', name: 'Maths', icon: <Binary size={24} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    { id: 'bio', name: 'Biology', icon: <Atom size={24} />, color: 'text-pink-500', bg: 'bg-pink-50' },
  ];

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleButtonClick = () => {
    if (!selectedSubject) {
      showNotification("Please select a subject first", "error");
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setUploading(true);
      
      setTimeout(() => {
        setUploading(false);
        setFileName("");
        showNotification(`${file.name} uploaded successfully!`);
        e.target.value = null; 
      }, 3000);
    }
  };

  const menuItems = [
    { title: "See Tests", desc: "Manage active sessions", icon: <FileText size={24} className="text-[#673ab7]" />, path: "/admin/tests", color: "bg-purple-50" },
    { title: "Create Test", desc: "AI & Manual Creator", icon: <PlusCircle size={24} className="text-blue-600" />, path: "/admin/create-test", color: "bg-blue-50" },
    { title: "Performance", desc: "Grades & Analytics", icon: <BarChart3 size={24} className="text-emerald-600" />, path: "/admin/performance", color: "bg-emerald-50" }
  ];

  return (
    <div className="min-h-screen bg-[#f0ebf8] pb-20 relative">
      <AdminHeader userName={user?.name} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-6 pt-10">
        
        {/* ACTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {menuItems.map((item, idx) => (
            <button key={idx} onClick={() => navigate(item.path)} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-start gap-4 hover:shadow-xl transition-all group">
              <div className={`${item.color} p-4 rounded-2xl`}>{item.icon}</div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800 uppercase tracking-tight text-sm">{item.title}</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* MATERIAL UPLOAD SECTION */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
            <h2 className="font-black text-[9px] text-slate-400 uppercase tracking-[0.2em]">Material Repository</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-emerald-600 uppercase">Live Sync</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Select Subject</p>
              <div className="grid grid-cols-2 gap-3">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubject(s.id)}
                    className={`relative p-4 rounded-[24px] border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedSubject === s.id 
                      ? "bg-white border-[#673ab7] shadow-lg shadow-purple-100 scale-[1.02]" 
                      : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>
                      {React.cloneElement(s.icon, { size: 18 })}
                    </div>
                    <span className={`font-bold text-xs ${selectedSubject === s.id ? "text-slate-900" : "text-slate-500"}`}>
                      {s.name}
                    </span>
                    {selectedSubject === s.id && (
                      <CheckCircle2 size={16} className="absolute top-3 right-3 text-[#673ab7]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">2. Upload Documents</p>
              <div className="bg-[#f8f6ff] border-2 border-dashed border-purple-200 rounded-[24px] p-6 flex flex-col items-center text-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.docx,.ppt,.pptx"
                  className="hidden" 
                />
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 text-[#673ab7]">
                  {uploading ? <File className="animate-bounce" size={24} /> : <Upload size={24} />}
                </div>
                
                {/* FILENAME TRUNCATION FIX */}
                <h3 className="font-bold text-slate-800 text-sm mb-1 truncate w-full max-w-[200px] px-2">
                  {fileName ? fileName : "Drop material here"}
                </h3>
                
                <p className="text-[10px] text-slate-500 mb-6 uppercase font-bold tracking-tight">PDF, DOCX (MAX 20MB)</p>
                <button 
                  onClick={handleButtonClick}
                  disabled={uploading}
                  className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    uploading ? "bg-slate-100 text-slate-400" : "bg-[#673ab7] text-white shadow-md shadow-purple-200 hover:bg-[#5e35b1]"
                  }`}
                >
                  {uploading ? "Analyzing..." : "Select File"}
                </button>

                {uploading && (
                  <div className="w-full mt-6 animate-in fade-in slide-in-from-top-1">
                    <div className="flex justify-between text-[9px] font-black uppercase mb-1.5 text-[#673ab7]">
                      <span>Uploading...</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#673ab7] rounded-full animate-[progress_3s_ease-in-out]" style={{width: '85%'}}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* POPUP TRUNCATION FIX */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 px-4 w-full flex justify-center">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl border max-w-full md:max-w-md ${
            toast.type === "error" ? "bg-red-50 border-red-100 text-red-700" : "bg-white border-slate-100 text-slate-800"
          }`}>
            <div className={`shrink-0 p-2 rounded-xl ${toast.type === "error" ? "bg-red-100" : "bg-purple-100 text-[#673ab7]"}`}>
               <Bell size={18} />
            </div>
            <p className="text-xs font-bold uppercase tracking-tight truncate">
              {toast.message}
            </p>
            <button onClick={() => setToast(null)} className="shrink-0 ml-2 p-1 hover:bg-slate-100 rounded-full transition-colors">
              <X size={14} className="text-slate-400" />
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress { 0% { width: 0%; } 100% { width: 85%; } }
      `}} />
    </div>
  );
}