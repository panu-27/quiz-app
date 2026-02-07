import React from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, Trophy, AlertCircle, Sparkles, Target, ChevronRight 
} from "lucide-react";

export default function Performance() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const classStats = [
    { subject: "Physics", level: "82%", color: "bg-blue-600" },
    { subject: "Chemistry", level: "64%", color: "bg-emerald-500" },
    { subject: "Maths", level: "48%", color: "bg-indigo-600" },
  ];

  const leaderboard = [
    { name: "Alex Rivera", rank: "1st", color: "text-emerald-600", score: "98%" },
    { name: "Sarah Chen", rank: "2nd", color: "text-slate-600", score: "94%" },
    { name: "James Wilson", rank: "3rd", color: "text-slate-500", score: "91%" },
    { name: "Priya Sharma", rank: "4th", color: "text-slate-400", score: "89%" },
  ];

  const focusList = [
    { name: "Marcus Wright", reason: "Missed 2 tests" },
    { name: "Julian Voss", reason: "Physics dropping" },
    { name: "Elena Rodriguez", reason: "Inactive 4 days" },
    { name: "David Kim", reason: "Low Maths avg" },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans text-slate-900 selection:bg-indigo-100">
      {/* <AdminHeader userName={user?.name} onLogout={logout} /> */}
      <AdminHeader userName={user?.name} onLogout={logout} />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
        
        {/* HEADER AREA */}
        

        {/* 1. SUBJECT PROFICIENCY - SCROLLABLE ON MOBILE, GRID ON DESKTOP */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Mastery</h3>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {classStats.map((stat, i) => (
              <div key={i} className="min-w-[200px] md:min-w-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.subject}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.level}</h3>
                </div>
                <div className="absolute bottom-0 left-0 h-1.5 bg-slate-100 w-full">
                  <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: stat.level }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. AI INSIGHT - FULL WIDTH */}
        <section className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
            <Target size={180} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10 shrink-0">
                <Sparkles size={24} className="text-indigo-300" />
            </div>
            <div className="max-w-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-indigo-400">Critical Insight</p>
              <h2 className="text-lg md:text-xl font-medium leading-tight tracking-tight">
                Mathematics proficiency is <span className="text-rose-400 font-bold underline underline-offset-4">trending down</span>.
                Launch a Basics Recall quiz to stabilize the cohort.
              </h2>
            </div>
          </div>
        </section>

        {/* 3. DUAL DATA LISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Top Talent */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Top Performers</h3>
              </div>
              <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">View Rankings</button>
            </div>
            <div className="space-y-2">
              {leaderboard.map((s, i) => (
                <div key={i} className="group bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between hover:border-indigo-600 transition-all cursor-default">
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 ${s.color}`}>
                      {s.rank.charAt(0)}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{s.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-colors">{s.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Intervention Needed */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <AlertCircle size={16} className="text-rose-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attention Required</h3>
            </div>
            <div className="space-y-2">
              {focusList.map((s, i) => (
                <div key={i} className="group bg-white border border-slate-100 p-4 rounded-xl flex items-center justify-between hover:border-rose-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-bold text-slate-800">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md tracking-tighter">
                      {s.reason}
                    </span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}