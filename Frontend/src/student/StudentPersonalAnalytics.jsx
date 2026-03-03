import React, { useState } from 'react';
import { BarChart2, Trophy, Lock, TrendingUp, Target, BookOpen, Brain, Award, FlameIcon, ChevronRight } from "lucide-react";
import EliteLeaderboard from './EliteLeaderboard';
import StudentAnalysis from './StudentAnalysis';
import StudentHeader from './StudentHeader';

/* ══════════════════════════════════════════════
   DISCORD-STYLE LOCKED SIDEBAR ITEMS
══════════════════════════════════════════════ */

const NAV_ITEMS = [
  {
    section: 'ANALYTICS',
    items: [
      { key: 'analysis',       label: 'Personal Analysis',   icon: <BarChart2 size={16} />,  locked: false, active: true  },
      { key: 'performance',    label: 'Performance Report',  icon: <TrendingUp size={16} />, locked: true  },
      { key: 'target',         label: 'Target Tracker',      icon: <Target size={16} />,     locked: true  },
    ],
  },
  {
    section: 'RANKINGS',
    items: [
      { key: 'leaderboard',    label: 'Institute Ranking',   icon: <Trophy size={16} />,     locked: false },
      { key: 'awards',         label: 'Achievements',        icon: <Award size={16} />,      locked: true  },
    ],
  },
  {
    section: 'STUDY',
    items: [
      { key: 'revision',       label: 'Revision Planner',    icon: <BookOpen size={16} />,   locked: true  },
    ],
  },
];

/* ══════════════════════════════════════════════
   LOCKED SCREEN PLACEHOLDER
══════════════════════════════════════════════ */
const LockedScreen = ({ label }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-40 select-none">
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center shadow-inner">
        <Lock size={32} className="text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#7A41F7] flex items-center justify-center">
        <span className="text-white text-[8px] font-black">!</span>
      </div>
    </div>
    <p className="text-base font-black text-slate-700">{label}</p>
    <p className="text-xs text-slate-400 mt-1.5 font-medium">This feature is coming soon</p>
    <div className="mt-5 px-5 py-2.5 rounded-2xl bg-[#F3EBFF] text-[#7A41F7] text-[11px] font-bold uppercase tracking-widest">
      🔒 Locked
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   SIDEBAR NAV ITEM
══════════════════════════════════════════════ */
const SidebarItem = ({ item, activeTab, onClick }) => {
  const isActive = activeTab === item.key;

  if (item.locked) {
    return (
      <div
        title="Coming Soon"
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-slate-300 cursor-not-allowed select-none group"
      >
        {/* Discord-style lock */}
        <span className="relative flex-shrink-0">
          <span className="text-slate-300 opacity-60">{item.icon}</span>
          <Lock
            size={10}
            className="absolute -bottom-0.5 -right-1 text-slate-400 fill-slate-200"
            strokeWidth={2.5}
          />
        </span>
        <span className="truncate opacity-50">{item.label}</span>
        <Lock size={12} className="ml-auto text-slate-300 flex-shrink-0 opacity-40" strokeWidth={2} />
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick(item.key)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
        isActive
          ? 'bg-[#F3EBFF] text-[#7A41F7]'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <span className={isActive ? 'text-[#7A41F7]' : 'text-slate-400'}>{item.icon}</span>
      <span className="truncate">{item.label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto flex-shrink-0" />}
    </button>
  );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function StudentNexus() {
  const [activeTab, setActiveTab] = useState('analysis');

  /* resolve what to render in the main area */
  const renderContent = () => {
    if (activeTab === 'analysis')    return <StudentAnalysis />;
    if (activeTab === 'leaderboard') return <EliteLeaderboard />;
    const found = NAV_ITEMS.flatMap(s => s.items).find(i => i.key === activeTab);
    return <LockedScreen label={found?.label ?? 'Feature'} />;
  };

  /* ── DESKTOP ── */
  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900 selection:bg-indigo-100">

      {/* ══════ DESKTOP (md+) ══════ */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StudentHeader />

        <div className="flex flex-1 max-w-7xl mx-auto w-full px-8 md:px-8 lg:px-12 2xl:px-20 pt-8 pb-2 gap-7">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="w-56 flex-shrink-0 flex flex-col gap-4">

            {/* Brand block */}
            <div className="bg-[#7A41F7] rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -right-1 -top-4 w-12 h-12 bg-white/5 rounded-full" />
              <BarChart2 size={22} className="mb-3 relative z-10 opacity-80" />
              <p className="font-black text-base relative z-10 leading-tight">Nexus<br />Analytics</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 relative z-10">Student Dashboard</p>
            </div>

            {/* Nav sections */}
            <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col gap-4">
              {NAV_ITEMS.map(section => (
                <div key={section.section}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 mb-1.5">
                    {section.section}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map(item => (
                      <SidebarItem
                        key={item.key}
                        item={item}
                        activeTab={activeTab}
                        onClick={setActiveTab}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Discord-style "locked" legend hint */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={12} className="text-slate-400" strokeWidth={2.5} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locked</p>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                These features are under development and will be unlocked soon.
              </p>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* ══════ MOBILE (< md) ══════ */}
      <div className="md:hidden pb-12">
        {/* Mobile tab bar — only unlocked tabs */}
        <div className="fixed w-full z-20 px-6 pt-4">
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

        <div className="max-w-md mx-auto">
          {activeTab === 'analysis' ? <StudentAnalysis /> : <EliteLeaderboard />}
        </div>
      </div>
    </div>
  );
}