import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, DocumentTextIcon, PlayCircleIcon, 
  ArrowDownTrayIcon, AdjustmentsHorizontalIcon, XMarkIcon, EyeIcon 
} from "@heroicons/react/24/outline";

const StudentLibrary = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');

  const categories = ['All', 'Notes', 'Videos', 'PYQs', 'Formulas'];
  const subjects = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];

  const resources = [
    { id: 1, title: 'Rotational Dynamics - Short Notes', type: 'Notes', subject: 'Physics', size: '2.4 MB', date: '2 days ago' },
    { id: 2, title: 'Organic Chemistry: Name Reactions', type: 'Formulas', subject: 'Chemistry', size: '1.1 MB', date: '5 days ago' },
    { id: 3, title: 'Integration Masterclass - Part 1', type: 'Videos', duration: '45 mins', subject: 'Maths', date: '1 week ago' },
    { id: 4, title: 'MHT-CET 2024 Question Paper', type: 'PYQs', subject: 'Maths', size: '5.8 MB', date: 'Mar 2025' },
    { id: 5, title: 'Kinetic Theory of Gases (PDF)', type: 'Notes', subject: 'Physics', size: '3.1 MB', date: 'Yesterday' },
  ];

  const filteredResources = useMemo(() => {
    return resources.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || item.type === activeTab;
      const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
      return matchesSearch && matchesTab && matchesSubject;
    });
  }, [searchQuery, activeTab, selectedSubject]);

  return (
    <div className=" bg-[#FDFDFF] flex flex-col overflow-hidden relative font-sans">
      
      {/* 1. PREMIUM HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-6 pt-14 pb-4 border-b border-slate-100 sticky top-0 z-30">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Resources</span>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">The <span className="text-indigo-600">Vault</span></h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200 active:scale-90 transition-all"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH ENGINE UI */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search masterclasses, notes..." 
            className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* 2. TAB SCROLLER (NO SCROLLBAR) */}
      <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-white/50 border-b border-slate-50">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === cat 
              ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-4 ring-indigo-50/50' 
              : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-4 custom-scrollbar">
        <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Material</h2>
            <div className="h-px flex-1 bg-slate-100 ml-4"></div>
        </div>

        {filteredResources.map((item) => (
          <div key={item.id} className="group bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center gap-4 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              item.type === 'Videos' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
            }`}>
              {item.type === 'Videos' ? <PlayCircleIcon className="w-7 h-7" /> : <DocumentTextIcon className="w-7 h-7" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 font-medium italic">{item.subject} • {item.size || item.duration}</p>
            </div>

            <div className="flex flex-col gap-2">
              <button className="p-2 hover:bg-indigo-50 rounded-full text-slate-300 hover:text-indigo-600 transition-all">
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. SIDEBAR WITH SMOOTH ANIMATION */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        
        {/* Sidebar Container */}
        <div className={`absolute right-0 w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-8 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Filters</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-50 rounded-full">
              <XMarkIcon className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="px-8 space-y-8 flex-1">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-6">Subject Filter</label>
              <div className="space-y-3">
                {subjects.map(sub => (
                  <button 
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`w-full py-4 px-6 rounded-2xl text-left text-sm font-bold transition-all ${
                      selectedSubject === sub 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-2' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          
        </div>
      </div>

      {/* CSS Injection for no-scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentLibrary;