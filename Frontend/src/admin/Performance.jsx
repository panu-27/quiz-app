import React from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, Trophy, AlertCircle, Sparkles, Activity, Target
} from "lucide-react";

export default function Performance() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Minimal Data Points
  const classStats = [
    { subject: "Physics", level: "82%", color: "bg-blue-500" },
    { subject: "Chemistry", level: "64%", color: "bg-emerald-500" },
    { subject: "Maths", level: "48%", color: "bg-[#673ab7]" },
  ];

const leaderboard = [
    { name: "Alex Rivera", rank: "1st", color: "text-emerald-600" },
    { name: "Sarah Chen", rank: "2nd", color: "text-slate-600" },
    { name: "James Wilson", rank: "3rd", color: "text-slate-500" },
    { name: "Priya Sharma", rank: "4th", color: "text-slate-400" },
  ];

  // Expanded to 5 students with actionable "reasons"
  const focusList = [
    { name: "Marcus Wright", reason: "Missed 2 tests" },
    { name: "Julian Voss", reason: "Physics dropping" },
    { name: "Elena Rodriguez", reason: "Inactive 4 days" },
    { name: "David Kim", reason: "Low Maths avg" },
  ];

  return (
    <div className="h-screen bg-[#f0ebf8] flex flex-col overflow-hidden">
      <AdminHeader userName={user?.name} onLogout={logout} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col gap-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-[#673ab7] transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Class Pulse</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Live Updates</span>
          </div>
        </div>

        {/* TOP STATS: CLASS PROFICIENCY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          {classStats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.subject}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.level}</h3>
              </div>
              {/* Subtle Progress Bar Background */}
              <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
                <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: stat.level }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* AI INSIGHT CARD */}
        <div className="bg-[#673ab7] rounded-[40px] p-7 text-white shadow-xl shadow-purple-200 relative overflow-hidden shrink-0 group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Target size={100} />
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
                <Sparkles size={24} className="text-emerald-300" />
            </div>
            <div className="max-w-md">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1 text-purple-200">System Insight</p>
              <h2 className="text-lg font-medium leading-tight">
                Maths proficiency is at a <span className="font-black text-red-300">critical low</span>. We recommend launching a 10-minute "Basics Recall" quiz tomorrow.
              </h2>
            </div>
          </div>
        </div>

        {/* DUAL LISTS: TALENT & FOCUS */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          
          {/* TOP TALENT */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center gap-2 px-2 shrink-0">
              <Trophy size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Top Talent</span>
            </div>
            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {leaderboard.map((s, i) => (
                <div key={i} className="bg-white/60 p-4 rounded-[24px] flex items-center justify-between border border-transparent hover:border-emerald-100 transition-all">
                  <span className="text-sm font-bold text-slate-800">{s.name}</span>
                  <span className={`text-[9px] font-black uppercase ${s.color}`}>{s.rank}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FOCUS NEEDED */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex items-center gap-2 px-2 shrink-0">
              <AlertCircle size={14} className="text-red-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Needs Focus</span>
            </div>
            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {focusList.map((s, i) => (
                <div key={i} className="bg-white/60 p-4 rounded-[24px] flex items-center justify-between border border-transparent hover:border-red-100 transition-all">
                  <span className="text-sm font-bold text-slate-800">{s.name}</span>
                  <span className="text-[8px] font-black uppercase text-red-400 px-2 py-1 bg-red-50 rounded-lg">{s.reason}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}