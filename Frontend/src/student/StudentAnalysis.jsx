import React from 'react';
import { Lock, TrendingUp, Brain, Target, BarChart2, Atom, Beaker, Ruler, Flame, Award } from "lucide-react";
import StudentHeader from "./StudentHeader";

/* ── Fonts ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap');
    * { font-family: 'DM Sans', sans-serif; }
    .font-display { font-family: 'Sora', sans-serif; }
    @keyframes loading {
      0%   { width: 30%; }
      50%  { width: 75%; }
      100% { width: 30%; }
    }
    @keyframes ping-slow {
      0%, 100% { transform: scale(1);   opacity: 0.2; }
      50%       { transform: scale(1.5); opacity: 0;   }
    }
    .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
  `}</style>
);

/* ── Fake data ── */
const fakeSubjects = [
  { name: "Physics",     score: 84, icon: <Atom size={16} />,   color: "bg-[#EBF3FF]", iconBg: "bg-[#D1E5FF]", iconColor: "text-blue-600",    bar: "bg-blue-500",    trend: "+12%" },
  { name: "Chemistry",   score: 67, icon: <Beaker size={16} />, color: "bg-[#FFF4EB]", iconBg: "bg-[#FFE9D6]", iconColor: "text-orange-500",  bar: "bg-orange-400",  trend: "+5%"  },
  { name: "Mathematics", score: 91, icon: <Ruler size={16} />,  color: "bg-[#F3EBFF]", iconBg: "bg-[#E6D6FF]", iconColor: "text-[#7A41F7]",   bar: "bg-[#7A41F7]",   trend: "+18%" },
  { name: "Biology",     score: 73, icon: <Brain size={16} />,  color: "bg-[#EBFDEB]", iconBg: "bg-[#D6F7D6]", iconColor: "text-emerald-600", bar: "bg-emerald-500", trend: "+8%"  },
];

const fakeWeakChapters = [
  { name: "Thermodynamics",    subject: "Physics",   accuracy: "42%" },
  { name: "Organic Chemistry", subject: "Chemistry", accuracy: "38%" },
  { name: "Integral Calculus", subject: "Maths",     accuracy: "55%" },
];

const fakeStrengths = [
  { name: "Kinematics", subject: "Physics", accuracy: "94%" },
  { name: "Algebra",    subject: "Maths",   accuracy: "89%" },
];

/* ── Lock overlay (shared) ── */
function LockOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-[#7A41F7]/20 rounded-full animate-ping-slow scale-150" />
          <div className="relative w-20 h-20 bg-white rounded-3xl shadow-2xl shadow-purple-100 flex items-center justify-center border border-purple-100">
            <Lock size={32} className="text-[#7A41F7]" strokeWidth={2.5} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight font-display">
            Your Analysis<br/>is Coming Soon
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[260px]">
            We're crafting a personalised SWOT breakdown with chapter-wise insights just for you.
          </p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-full px-5 py-3 flex items-center gap-3">
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#7A41F7] rounded-full" style={{ animation: 'loading 2s ease-in-out infinite', width: '60%' }} />
          </div>
          <span className="text-[10px] font-bold text-[#7A41F7] uppercase tracking-widest whitespace-nowrap">In Progress</span>
        </div>
      </div>
    </div>
  );
}

/* ── Blurry preview content (shared) ── */
function BlurPreview({ mobile = false }) {
  return (
    <div className="select-none pointer-events-none" style={{ filter: 'blur(6px)', opacity: 0.5 }}>
      <div className={`${mobile ? 'pt-24 px-5 pb-6' : 'px-0 pb-6'} space-y-4`}>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Rank",     value: "#12",  icon: <Award size={14}/>,  color: "text-amber-500"   },
            { label: "Score",    value: "590",  icon: <Flame size={14}/>,  color: "text-rose-500"    },
            { label: "Accuracy", value: "76%",  icon: <Target size={14}/>, color: "text-emerald-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className="text-lg font-bold text-slate-900 font-display">{s.value}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Subject mastery */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Subject Mastery</p>
          <div className="space-y-3">
            {fakeSubjects.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 ${s.iconBg} rounded-xl flex items-center justify-center ${s.iconColor} shrink-0`}>{s.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-[10px] font-bold text-slate-700 uppercase">{s.name}</p>
                    <p className="text-[10px] font-bold text-emerald-500">{s.trend}</p>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${s.score}%` }} />
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-800 w-8 text-right">{s.score}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weak chapters */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Focus Areas</p>
          <div className="space-y-2">
            {fakeWeakChapters.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-rose-50 px-4 py-3 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">{c.name}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{c.subject}</p>
                </div>
                <span className="text-xs font-bold text-rose-500">{c.accuracy}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Strong Chapters</p>
          <div className="space-y-2">
            {fakeStrengths.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-emerald-50 px-4 py-3 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">{c.name}</p>
                  <p className="text-[9px] text-slate-400 font-semibold">{c.subject}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">{c.accuracy}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fake chart */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Performance Trend</p>
          <div className="flex items-end gap-2 h-24">
            {[40, 55, 48, 70, 65, 80, 76].map((h, i) => (
              <div key={i} className="flex-1 bg-[#E6D6FF] rounded-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════════════ */
export default function StudentAnalysis() {
  return (
    <>
      <GlobalStyles />

      {/* ══════════════════════════════════════════
          MOBILE  (< lg) — original blurred layout
      ══════════════════════════════════════════ */}
      <div className="lg:hidden relative max-h-screen overflow-hidden">
        <BlurPreview mobile />
        <LockOverlay />
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP  (lg+) — dashboard-style
      ══════════════════════════════════════════ */}
      <div className="hidden px-8 lg:flex flex-col min-h-screen bg-[#F6F8FC]">

        <div className="max-w-7xl mx-auto w-full px-16 xl:px-24 2xl:px-20 py-8">

          {/* Page heading */}
          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student Portal</p>
            <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Personal Analysis</h1>
          </div>

          {/* ── Stat cards row — same as dashboard ── */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: "Class Rank",  value: "#12",  icon: <Award  size={22} className="text-amber-500"   />, bg: "bg-amber-50",    iconBg: "bg-amber-100",    sub: "This week"  },
              { label: "Total Score", value: "590",  icon: <Flame  size={22} className="text-rose-500"    />, bg: "bg-rose-50",     iconBg: "bg-rose-100",     sub: "All time"   },
              { label: "Accuracy",    value: "76%",  icon: <Target size={22} className="text-[#7A41F7]"   />, bg: "bg-[#F3EBFF]",  iconBg: "bg-[#E6D6FF]",   sub: "Avg. across subjects" },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-5 flex items-center gap-4`}>
                <div className={`${s.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 font-display">{s.value}</p>
                  <p className="text-[13px] font-semibold text-slate-500">{s.label}</p>
                  <p className="text-[11px] text-slate-400">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main blurred grid + lock overlay ── */}
          <div className="grid grid-cols-3 gap-6">

            {/* Left col-span-2 — blurred subject + chapters */}
            <div className="col-span-2 relative">
              <div className="space-y-5 select-none pointer-events-none" style={{ filter: 'blur(5px)', opacity: 0.5 }}>

                {/* Subject mastery — quiz-card style row */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Subject Mastery</p>
                  <div className="grid grid-cols-2 gap-4">
                    {fakeSubjects.map((s, i) => (
                      <div key={i} className={`${s.color} rounded-3xl p-5`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`${s.iconBg} px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold ${s.iconColor}`}>
                            {s.icon}{s.name}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500">{s.trend}</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 mb-3 font-display">{s.score}%</p>
                        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                          <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak + strong chapters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Focus Areas</p>
                    <div className="space-y-2">
                      {fakeWeakChapters.map((c, i) => (
                        <div key={i} className="flex items-center justify-between bg-rose-50 px-4 py-3 rounded-2xl">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{c.name}</p>
                            <p className="text-[9px] text-slate-400 font-semibold">{c.subject}</p>
                          </div>
                          <span className="text-xs font-bold text-rose-500">{c.accuracy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Strong Chapters</p>
                    <div className="space-y-2">
                      {fakeStrengths.map((c, i) => (
                        <div key={i} className="flex items-center justify-between bg-emerald-50 px-4 py-3 rounded-2xl">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{c.name}</p>
                            <p className="text-[9px] text-slate-400 font-semibold">{c.subject}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600">{c.accuracy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fake chart */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Performance Trend</p>
                  <div className="flex items-end gap-2 h-28">
                    {[40, 55, 48, 70, 65, 80, 76, 68, 82, 78].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#E6D6FF] rounded-lg" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Lock overlay on top of left content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <LockOverlay />
              </div>
            </div>

            {/* Right sidebar — blurred SWOT-style cards */}
            <div className="space-y-5 select-none pointer-events-none" style={{ filter: 'blur(5px)', opacity: 0.5 }}>
              {/* Progress ring card */}
              <div className="bg-gradient-to-br from-[#7A41F7] to-[#5B2ED6] rounded-3xl p-6 text-white shadow-xl shadow-purple-200/50 relative overflow-hidden">
                <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-4">Overall Progress</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.15)" strokeWidth="7" fill="transparent" />
                      <circle cx="40" cy="40" r="34" stroke="white" strokeWidth="7" fill="transparent"
                        strokeDasharray={213} strokeDashoffset={213 - (213 * 76) / 100}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold font-display">76%</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display">Good</p>
                    <p className="text-xs text-white/60 font-semibold mt-1">Avg. across 4 subjects</p>
                  </div>
                </div>
              </div>

              {/* Mini stat cards */}
              {[
                { label: "Tests Taken",    value: "24",  bg: "bg-[#EBF3FF]", iconBg: "bg-[#D1E5FF]", icon: <BarChart2 size={16} className="text-blue-600" />     },
                { label: "Time Studied",   value: "48h", bg: "bg-[#FFF4EB]", iconBg: "bg-[#FFE9D6]", icon: <TrendingUp size={16} className="text-orange-500" /> },
                { label: "Chapters Done",  value: "31",  bg: "bg-[#EBFDEB]", iconBg: "bg-[#D6F7D6]", icon: <Target size={16} className="text-emerald-600" />    },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl p-4 flex items-center gap-4`}>
                  <div className={`${s.iconBg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
                  <div>
                    <p className="text-xl font-bold text-slate-800 font-display">{s.value}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}