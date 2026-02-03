import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, DocumentTextIcon, PlayCircleIcon, 
  XMarkIcon, ArrowDownTrayIcon, FunnelIcon, 
  ChevronRightIcon, Bars3BottomRightIcon 
} from "@heroicons/react/24/outline";

export default function StudentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [openingFile, setOpeningFile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Now controls the Floating Tab

  const categories = ['All', 'Notes', 'PYQs', 'Formulas'];
  const subjects = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const baseURL1 = import.meta.env.VITE_API_BASE_URL1;
  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    const fetchVaultData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/student/my-library`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Sync Failed");
        const data = await res.json();
        const flattened = Object.values(data).flat();
        setResources(flattened);
      } catch (err) {
        console.error("Vault Error:", err.message);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVaultData();
  }, []);

  const handleOpenFile = (item) => {
    setOpeningFile(item);
    setIsDecrypting(true);
    setTimeout(() => setIsDecrypting(false), 1200);
  };

  /* ---------- FILTER LOGIC ---------- */
  const filteredAssets = resources.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSubject = selectedSubject === 'All' || r.subject === selectedSubject;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubject && matchesSearch;
  });

  return (
    <div className="flex   font-sans text-slate-900 overflow-hidden relative">
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* HEADER & SEARCH */}
        <header className="bg-white border-b border-slate-100 px-6 py-6 shrink-0 relative z-20">
  <div className="max-w-6xl mx-auto space-y-6">
    
    {/* Top Row: Unified Breadcrumb & Filter Trigger */}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <span className="text-indigo-600 italic">Nexus Vault</span>
          <span className="text-slate-300 font-medium">/</span>
          <span className="truncate max-w-[180px]">
            {selectedSubject === 'All' ? 'Academic Repository' : selectedSubject}
          </span>
        </h1>
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-1.5 rounded-lg transition-all border ${
            isSidebarOpen || selectedSubject !== 'All' 
            ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
            : 'bg-white text-slate-400 border-slate-100 hover:text-slate-900'
          }`}
        >
          {isSidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3BottomRightIcon className="w-5 h-5" />}
        </button>

        {/* FLOATING SUBJECT DROPDOWN */}
        {isSidebarOpen && (
          <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200 z-50">
            <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 mb-1">Select Sector</p>
            <div className="space-y-0.5">
              {subjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubject(sub); setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                    selectedSubject === sub 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Bottom Row: Minimal Search Bar */}
    <div className="relative group max-w-4xl mx-auto">
      <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
      <input 
        type="text" 
        placeholder="Query secure assets..." 
        className="w-full bg-slate-50 border border-transparent rounded-xl py-3.5 pl-12 pr-4 text-xs font-medium focus:bg-white focus:border-indigo-500 shadow-inner transition-all outline-none"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    
  </div>
</header>

        {/* TOP CATEGORY SCROLLBAR */}
        <div className="px-6 md:px-8 py-4 border-y border-slate-50 overflow-x-auto no-scrollbar flex gap-3 shrink-0 bg-white shadow-sm z-10">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ASSET GRID */}
        <main className="flex-1 overflow-y-auto px-6 md:px-8 py-8 space-y-3 custom-scrollbar" onClick={() => setIsSidebarOpen(false)}>
          {loading ? (
              <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : filteredAssets.length > 0 ? (
              filteredAssets.map((item) => (
                <div key={item._id} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all gap-4">
                  <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{item.category}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{item.subject} • {item.fileSize}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleOpenFile(item)} className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
          ) : null}
        </main>
      </div>

      {/* --- VIEWER --- */}
      {openingFile && (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-slate-900 shrink-0">
            <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
               <div className="p-2 bg-indigo-500 rounded-lg text-white shrink-0"><DocumentTextIcon className="w-5 h-5" /></div>
               <h2 className="text-white font-bold text-sm truncate">{openingFile.title}</h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a href={`${baseURL1}${openingFile.fileUrl}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-white transition-colors"><ArrowDownTrayIcon className="w-6 h-6" /></a>
              <button onClick={() => setOpeningFile(null)} className="p-2 text-slate-400 hover:text-white transition-colors"><XMarkIcon className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="flex-1 relative bg-slate-800">
            {isDecrypting ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-indigo-400 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">Establishing Secure Socket...</p>
              </div>
            ) : (
              <div className="w-full h-full bg-white">
                <iframe src={`${baseURL1}${openingFile.fileUrl}#toolbar=0`} className="w-full h-full border-none" title="Asset Viewer" />
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}