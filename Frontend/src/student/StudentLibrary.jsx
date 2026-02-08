import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon, DocumentTextIcon, XMarkIcon,
  ArrowDownTrayIcon, ChevronRightIcon, Bars3BottomRightIcon,
  ArrowLeftIcon, InboxIcon
} from "@heroicons/react/24/outline";
import { Loader2 } from 'lucide-react';

export default function StudentLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [openingFile, setOpeningFile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = ['All', 'Notes', 'PYQs', 'Formulas'];
  const subjects = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const baseURL1 = import.meta.env.VITE_API_BASE_URL1;

  useEffect(() => {
    const fetchVaultData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/student/my-library`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        console.log(res);
        const data = await res.json();
        if (!data) {
          setResources([]);
          return;
        }
        console.log(data);

        const flattened = Object.values(data).flat();
        setResources(flattened);
      } catch (err) {
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVaultData();
  }, [baseURL]);

  const [showViewer, setShowViewer] = useState(false);

  const handleOpenFile = (item) => {
    setOpeningFile(item);
    setIsDecrypting(true);

    // Fake decryption delay for "Security" feel
    setTimeout(() => {
      setIsDecrypting(false);
      setShowViewer(true);
    }, 1200);
  };

  const handleDownload = (e, url, filename) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = `${baseURL}${url}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const filteredAssets = resources.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchesSubject = selectedSubject === 'All' || r.subject === selectedSubject;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubject && matchesSearch;
  });

  const categoryIcons = {
    'Notes': '/student/notes.svg',
    'PYQs': '/student/pdf.svg',      // Ensure these files exist in your public folder
    'Formulas': '/student/formulas.svg',
    'Default': '/student/notes.svg'
  };
  return (
    <div className="min-h-[88vh] bg-[#7A41F7] flex flex-col font-sans relative">

      {/* 1. COMPACT BRANDED HEADER */}
      <nav className="shrink-0 pt-6 pb-14 px-6 mb-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
        </div>

        <div className="max-w-lg mx-auto flex justify-between items-center relative z-10">
          <div className='flex items-center justify-start gap-4'>
            <button onClick={() => navigate("/student")} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white backdrop-blur-md">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-black text-white tracking-tight">Nexus Library</h2>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Secure Repository</p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl transition-all backdrop-blur-md z-[1001] ${isSidebarOpen ? 'bg-white text-[#7A41F7] shadow-lg' : 'bg-white/20 text-white'
              }`}
          >
            {isSidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3BottomRightIcon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* --- FLOATING DROPDOWN (ROOT LEVEL) --- */}
      {/* Moving this here ensures it is NEVER clipped by the Nav or the Sheet */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end p-6 pointer-events-none">
          {/* Backdrop */}
          <div className="fixed inset-0 pointer-events-auto" onClick={() => setIsSidebarOpen(false)} />

          {/* Dropdown Box */}
          <div className="relative mt-16 w-44 h-fit bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-slate-100 p-1.5 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-200">
            <p className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
              Filter Subject
            </p>
            <div className="space-y-0.5">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubject(sub);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${selectedSubject === sub
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. THE OVERLAPPING SHEET */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] relative  flex flex-col min-h-0 z-10">
        <main className="max-w-lg mx-auto w-full px-6 -mt-13 flex flex-col flex-1 min-h-0">

          {/* 3. SEARCH & CATEGORY BLOCK */}
          <div className="space-y-4 shrink-0">
            <div className="relative group mb-6">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7A41F7] transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search secure assets..."
                className="w-full bg-white border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:border-[#7A41F7] shadow-lg shadow-purple-900/5 transition-all outline-none"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                    : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 4. ASSET GRID */}
          {/* 4. ASSET GRID */}
          <div className="flex-1 overflow-y-auto no-scrollbar pt-4 pb-32 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Accessing Vault...</p>
              </div>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleOpenFile(item)}
                  className="group bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                >
                  {/* --- CUSTOM SVG ICON --- */}
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                    <img
                      src={categoryIcons[item.category] || categoryIcons.Default}
                      alt={item.category}
                      className="w-7 h-7 object-contain"
                      onError={(e) => { e.target.src = categoryIcons.Default; }} // Fallback if path is wrong
                    />
                  </div>

                  {/* --- TEXT CONTENT --- */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-slate-800 truncate leading-tight">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                        {item.subject}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {item.fileSize}
                      </span>
                    </div>
                  </div>

                  {/* --- ACTION ARROW (STYLIZED) --- */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <ChevronRightIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <InboxIcon className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No assets found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- FULL SCREEN PDF VIEWER MODAL --- */}
      {showViewer && openingFile && (
        <div className="fixed inset-0 z-[3000] bg-white flex flex-col animate-in fade-in duration-200">

          {/* SIMPLE TOP BAR */}
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowViewer(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
              <div className="truncate">
                <h3 className="text-[13px] font-bold text-slate-900 truncate">
                  {openingFile.title}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                  {openingFile.subject} • {openingFile.fileSize}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => handleDownload(e, openingFile.fileUrl, openingFile.title)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-800 transition-all active:scale-95"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          {/* CLEAN VIEWPORT */}
          <div className="flex-1 bg-slate-100">
            {openingFile.fileUrl ? (
              <iframe
                src={`${baseURL}${openingFile.fileUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title="Document Viewer"
              />
            ) : (
              /* FILE NOT FOUND STATE */
              <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                <div className="p-4 bg-slate-50 rounded-full mb-3">
                  <InboxIcon className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-900">Document not found</p>
                <p className="text-xs text-slate-500 mt-1">The file may have been moved or deleted.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}