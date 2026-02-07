import React, { useState } from 'react';
import { 
  Trophy, ChevronRight, Zap, ArrowLeft, 
  PlayCircle, Target, BarChart2,
  Beaker, Atom, Ruler, Medal,
  TrendingUp, Activity, Brain, 
  Crown, Globe, User, ZapOff,
  Flame, Award
} from "lucide-react";
import EliteLeaderboard from './EliteLeaderboard';
import StudentAnalysis from './StudentAnalysis';

export default function StudentNexus() {
  const [activeTab, setActiveTab] = useState('analysis');

  const leaderboardData = [
    { rank: 4, name: "Madelyn Dias", points: "590", country: "🇮🇳", avatar: "👩‍🎓", current: true },
    { rank: 5, name: "Zain Vaccaro", points: "448", country: "🇮🇹", avatar: "🧔" },
    { rank: 6, name: "Skylar Geidt", points: "410", country: "🇩🇪", avatar: "👩‍💼" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F9] font-sans text-slate-900 pb-12 selection:bg-indigo-100">
      
      {/* --- PREMIUM STICKY NAV --- */}
    

      {/* --- TAB CONTROL --- */}
      <div className="fixed w-full  z-20 px-6 pt-4">
        <div className="bg-slate-200/60 p-1.5 rounded-[2rem] flex gap-1 backdrop-blur-md">
          {['analysis', 'leaderboard'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[1.7rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-white shadow-xl shadow-indigo-100 text-indigo-600 scale-[1.02]' 
                : 'text-slate-900 hover:text-slate-700'
              }`}
            >
              {tab === 'analysis' ? 'Personal' : 'Institute Ranking'}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto">
        
        {activeTab === 'analysis' ? (
          /* --- ADVANCED INTELLIGENCE VIEW --- */
          <StudentAnalysis/>
        ) : (
          /* --- REFERENCE-MATCHED LEADERBOARD --- */
          <EliteLeaderboard/>
        )}
      </main>

      {/* --- FLOATING ACTION --- */}
      
    </div>
  );
}

// --- HELPER COMPONENTS ---

function LeaderAvatar({ avatar, flag, name, qp, isWinner }) {
  return (
    <div className="flex flex-col items-center mb-3">
      <div className="relative">
        {isWinner && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
             <div className="bg-amber-400 p-1.5 rounded-lg shadow-lg">
                <Crown size={14} className="text-white fill-white" />
             </div>
          </div>
        )}
        <div className={`w-14 h-14 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-2xl bg-white overflow-hidden`}>
           {avatar}
        </div>
        <span className="absolute bottom-0 right-0 text-xs bg-white rounded-full shadow-md px-0.5">{flag}</span>
      </div>
      <p className="text-[9px] font-black text-slate-800 uppercase mt-2 whitespace-nowrap">{name.split(' ')[0]}</p>
      <div className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-100 shadow-sm mt-1">
         <p className="text-[8px] font-black text-indigo-600">{qp} QP</p>
      </div>
    </div>
  );
}

function SubjectCard({ name, mastery, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <div>
          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{name}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Proficiency: {mastery}%</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-xs font-black text-slate-900">{mastery}%</div>
        <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5">
           <div className={`h-full ${color} rounded-full`} style={{ width: `${mastery}%` }} />
        </div>
      </div>
    </div>
  );
}