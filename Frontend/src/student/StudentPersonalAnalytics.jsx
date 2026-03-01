import React, { useState } from 'react';
import { BarChart2, Trophy } from "lucide-react";
import EliteLeaderboard from './EliteLeaderboard';
import StudentAnalysis from './StudentAnalysis';
import StudentHeader from './StudentHeader';

export default function StudentNexus() {
  const [activeTab, setActiveTab] = useState('analysis');

  const tabs = [
    { key: 'analysis',    label: 'Personal Analysis', icon: <BarChart2 size={15} /> },
    { key: 'leaderboard', label: 'Institute Ranking',  icon: <Trophy size={15} />    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-900 selection:bg-indigo-100">

      {/* ══════════════════════════════════════════
          DESKTOP (lg+)
          Tab switcher sits as a thin pill bar
          injected BELOW the StudentHeader
          (StudentHeader is rendered inside each child)
      ══════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <StudentHeader/>
        {/* Floating tab strip — rendered once here, above the child content */}
        <div className="z-[60] ml-8  backdrop-blur-md ">
          {/* We only show the tab bar — StudentHeader is inside each child component */}
          <div className="max-w-7xl mx-auto px-8 xl:px-12 py-3 flex items-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-[#7A41F7] text-white shadow-lg shadow-purple-200/60'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-100'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Full-width child — each manages its own StudentHeader + layout */}
        <div className="-mt-2">
          {activeTab === 'analysis' ? <StudentAnalysis /> : <EliteLeaderboard />}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE (< lg) — completely unchanged
      ══════════════════════════════════════════ */}
      <div className="lg:hidden pb-12">
        {/* Tab bar */}
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