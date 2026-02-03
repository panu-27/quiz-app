import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, Flame, ArrowLeft, 
  Activity, Compass, ShieldCheck, Zap
} from "lucide-react";
import { subjects, syllabusData } from './mhtcetData';

const StudentPersonalAnalytics = () => {
  const [view, setView] = useState('subjects');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);

  return (
    <div className="h-[88vh] flex flex-col bg-[#F9F9FB] font-sans text-slate-900 overflow-hidden">
      
      {/* 1. ULTRA-COMPACT NAV */}
     <nav className="shrink-0 bg-white border-b border-slate-100 px-6 py-6">
  <div className="max-w-6xl mx-auto flex justify-between items-center">
    
    {/* Left Side: Unified Title & Navigation */}
    <div className="flex items-center gap-3">
      {view !== 'subjects' && (
        <button 
          onClick={() => {
            if (view === 'chapters') setView('grades');
            else if (view === 'grades') setView('subjects');
          }} 
          className="p-1 hover:bg-slate-900 rounded-lg transition-all border border-slate-100 hover:text-white"
        >
          <ArrowLeft size={14} />
        </button>
      )}
      <h1 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
        <span className="text-indigo-600 italic">Nexus Analysis</span>
        <span className="text-slate-300 font-medium">/</span>
        <span className="truncate max-w-[150px]">
          {view === 'subjects' ? 'Intelligence Overview' : `${selectedSubject}`}
        </span>
      </h1>
    </div>

    

  </div>
</nav>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          
          {/* VIEW 1: SUBJECT GRID - COMPACT TILES */}
          {view === 'subjects' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-none">
              {subjects.map((sub) => (
                <div 
                  key={sub.id}
                  onClick={() => { setSelectedSubject(sub.name); setView('grades'); }}
                  className="group bg-white border border-slate-200 p-4 rounded-2xl hover:border-indigo-600 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Activity size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-900">{sub.accuracy}%</span>
                  </div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{sub.name}</h3>
                  <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 group-hover:bg-indigo-600 transition-all duration-700" style={{ width: `${sub.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 2: GRADE SELECTION - SIDE BY SIDE */}
          {view === 'grades' && (
            <div className="grid grid-cols-2 gap-4 h-32 flex-none">
              {['11th Standard', '12th Standard'].map(grade => (
                <button 
                  key={grade}
                  onClick={() => { setSelectedGrade(grade.split(' ')[0]); setView('chapters'); }}
                  className="group bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 hover:border-slate-900 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{grade}</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Initialize Deep Dive</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* VIEW 3: CHAPTERS - SCROLLABLE LIST WITHIN CONTAINER */}
          {view === 'chapters' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-4">
                 <ShieldCheck size={14} className="text-indigo-600" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Curriculum Matrix</span>
                 <div className="flex-1 h-[1px] bg-slate-100" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-1">
                {syllabusData[selectedSubject]?.[selectedGrade]?.map((ch, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-all">
                    <button 
                      onClick={() => setExpandedChapter(expandedChapter === idx ? null : idx)}
                      className="w-full px-4 py-6 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${ch.status === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{ch.name}</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-slate-400">{ch.mastery}%</span>
                        {expandedChapter === idx ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      </div>
                    </button>
                    
                    {expandedChapter === idx && (
                      <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-200">
                        <div className="bg-slate-900 p-3 rounded-lg flex gap-3 items-center">
                          <Zap size={12} className="text-amber-400 shrink-0" />
                          <p className="text-[10px] text-slate-300 italic font-medium">"{ch.suggestion}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GLOBAL INSIGHT PANEL - ALWAYS VISIBLE AT BOTTOM IN OVERVIEW */}
          {view === 'subjects' && (
            <div className="mt-6 p-4 bg-white border border-slate-200 rounded-3xl flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase">AI Recommendation</p>
                    <p className="text-[11px] text-slate-500 font-medium tracking-tight">Focus on Physics: Thermodynamics to boost rank by 12%</p>
                  </div>
               </div>
               <button className="px-4 py-2 bg-slate-50 text-[9px] font-black uppercase rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
                  Analyze All
               </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentPersonalAnalytics;