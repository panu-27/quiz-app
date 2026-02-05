import React, { useState } from 'react';
import { 
  Trophy, ChevronRight, Zap, ArrowLeft, 
  PlayCircle, Target, BarChart2,
  Beaker, Atom, Ruler, Medal,
  TrendingUp, Activity
} from "lucide-react";

export default function StudentNexus() {
  const [view, setView] = useState('main');

  const subjectData = [
    { name: 'Physics', icon: <Atom size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', mastery: 82 },
    { name: 'Chemistry', icon: <Beaker size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50', mastery: 65 },
    { name: 'Mathematics', icon: <Ruler size={18} />, color: 'text-violet-600', bg: 'bg-violet-50', mastery: 91 },
    // { name: 'Biology', icon: <Ruler size={18} />, color: 'text-green-600', bg: 'bg-green-50', mastery: 81 },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 pb-12 selection:bg-indigo-100">
      
      {/* --- ELITE NAV --- */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-xl z-50 px-6 py-4 flex justify-between items-center border-b border-slate-100/50">
        <div className="flex items-center gap-3">
           {view === 'subject' && (
              <button onClick={() => setView('main')} className="p-2 bg-slate-50 rounded-lg active:scale-90 transition-all">
                <ArrowLeft size={16} />
              </button>
            )}
           <h1 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 italic">Nexus.Elite</h1>
        </div>
        <div className="p-2 bg-indigo-50 rounded-full">
            <Activity size={14} className="text-indigo-600" />
        </div>
      </nav>

      <main className="px-6 max-w-md mx-auto mt-6 space-y-6">

        {view === 'main' ? (
          <>
            {/* --- HERO RANK SECTION --- */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/30 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full" />
                        <div className="relative w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-amber-200 border-b-4 border-amber-700">
                            <Medal size={32} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-1">Rank Standing</p>
                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 leading-none">#04 <span className="text-xs font-bold text-slate-300">/ 120</span></h2>
                        <div className="mt-2 inline-flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase">
                           <TrendingUp size={10} /> Up 2 spots
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CORE PERFORMANCE --- */}
            <div className="grid grid-cols-2 gap-3">
              <HeaderStat label="Accuracy" val="78.4%" icon={<Target size={14} className="text-emerald-500" />} />
              <HeaderStat label="Attempt Rate" val="92%" icon={<BarChart2 size={14} className="text-indigo-500" />} />
            </div>

            {/* --- SUBJECT HUD --- */}
            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Curriculum Mastery</p>
              {subjectData.map((sub) => (
                <button 
                  key={sub.name}
                  onClick={() => setView('subject')}
                  className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-200 active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 ${sub.bg} ${sub.color} rounded-xl flex items-center justify-center`}>
                      {sub.icon}
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{sub.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${sub.color.replace('text', 'bg')}`} style={{ width: `${sub.mastery}%` }} />
                         </div>
                         <span className="text-[9px] font-black text-slate-400">{sub.mastery}%</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-200" />
                </button>
              ))}
            </div>

            {/* --- REDESIGNED TAKE TEST ACTION --- */}
            <div className="pt-2">
                <button className="w-full bg-slate-900 p-5 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-slate-300 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                            <PlayCircle size={22} />
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Recommended Attempt</p>
                            <p className="text-sm font-bold text-white uppercase tracking-tight">Thermodynamics Drill</p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                         <p className="text-[10px] font-black text-white uppercase tracking-tighter">15m</p>
                    </div>
                </button>
            </div>
          </>
        ) : (
          /* --- SUBJECT DETAIL: PURE MASTERY --- */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <Atom size={28} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Subject Proficiency</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">82.4%</h2>
                <div className="w-full h-1.5 bg-slate-50 rounded-full mt-6 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '82.4%' }} />
                </div>
            </div>

            <div className="space-y-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Concept Matrix</p>
              <ChapterRow name="Rotational Dynamics" mastery={32} status="High Focus" color="text-rose-500" />
              <ChapterRow name="Oscillations" mastery={88} status="Strong" color="text-emerald-500" />
              <ChapterRow name="Wave Optics" mastery={54} status="Review" color="text-amber-500" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- REFINED COMPONENTS ---

function HeaderStat({ label, val, icon }) {
  return (
    <div className="flex-1 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-slate-50 rounded-lg">{icon}</div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{label}</p>
      </div>
      <p className="text-xl font-black text-slate-900 tracking-tighter">{val}</p>
    </div>
  );
}

function ChapterRow({ name, mastery, status, color }) {
  return (
    <div className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
      <div>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{name}</span>
        <div className="flex items-center gap-2 mt-1">
            <span className={`text-[8px] font-black uppercase tracking-widest ${color}`}>{status}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-black text-slate-900">{mastery}%</span>
        <div className="w-10 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div className={`h-full ${color.replace('text', 'bg')}`} style={{ width: `${mastery}%` }} />
        </div>
      </div>
    </div>
  );
}