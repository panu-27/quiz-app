import React, { useState } from 'react';
import { 
  ChevronRightIcon, 
  ChevronDownIcon, 
  BoltIcon, 
  BeakerIcon, 
  Square3Stack3DIcon, 
  AcademicCapIcon, 
  FireIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";

// Assuming you have moved this to mhtcetData.js
import { subjects, syllabusData } from './mhtcetData';

const iconMap = {
  BoltIcon: <BoltIcon className="w-6 h-6 text-orange-500"/>,
  BeakerIcon: <BeakerIcon className="w-6 h-6 text-purple-500"/>,
  Square3Stack3DIcon: <Square3Stack3DIcon className="w-6 h-6 text-blue-500"/>,
  AcademicCapIcon: <AcademicCapIcon className="w-6 h-6 text-green-500"/>
};

const StudentPersonalAnalytics = () => {
  const [view, setView] = useState('subjects');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);

  const handleChapterClick = (idx) => {
    setExpandedChapter(expandedChapter === idx ? null : idx);
  };

  return (
    <div className=" bg-[#F8F9FB] font-sans text-slate-900 flex flex-col overflow-hidden">
      
      {/* 1. EDTECH STYLE HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Learning Analysis</h1>
            <p className="text-xs text-slate-500 font-medium">MHT-CET 2026 Path</p>
          </div>
          <div className="bg-orange-50 p-2 rounded-full flex items-center gap-1">
            <FireIcon className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">12 Day Streak</span>
          </div>
        </div>
      </div>

      {/* 2. BREADCRUMBS (CLEANER) */}
      <div className="px-6 py-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => {setView('subjects'); setSelectedSubject(null); setSelectedGrade(null);}}
          className={`text-xs font-bold whitespace-nowrap px-3 py-1 rounded-full ${view === 'subjects' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          All Subjects
        </button>
        {selectedSubject && <ChevronRightIcon className="w-3 h-3 text-slate-400"/>}
        {selectedSubject && (
          <button className={`text-xs font-bold whitespace-nowrap px-3 py-1 rounded-full ${view === 'grades' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
            {selectedSubject}
          </button>
        )}
      </div>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-2 pb-32">
        
        {/* VIEW 1: SUBJECT CARDS */}
        {view === 'subjects' && (
          <div className="space-y-4">
            {subjects.map((sub) => (
              <button 
                key={sub.id}
                onClick={() => { setSelectedSubject(sub.name); setView('grades'); }}
                className="w-full bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="bg-slate-50 p-3 rounded-xl">
                  {iconMap[sub.icon]}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-slate-800">{sub.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800" style={{width: `${sub.accuracy}%`}}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{sub.accuracy}%</span>
                  </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-slate-300" />
              </button>
            ))}
          </div>
        )}

        {/* VIEW 2: GRADE SELECTION (VERTICAL CARDS) */}
        {view === 'grades' && (
          <div className="grid grid-cols-1 gap-4 mt-4">
             {['11th Standard', '12th Standard'].map(grade => (
               <button 
                 key={grade}
                 onClick={() => { setSelectedGrade(grade.split(' ')[0]); setView('chapters'); }}
                 className="bg-white p-6 rounded-2xl border-2 border-slate-50 flex flex-col items-center justify-center text-center gap-2 hover:border-slate-200 transition-all active:bg-slate-50"
               >
                 <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                 </div>
                 <span className="text-lg font-bold text-slate-800">{grade}</span>
                 <p className="text-xs text-slate-400">View Chapter-wise Analysis</p>
               </button>
             ))}
          </div>
        )}

        {/* VIEW 3: CHAPTER ACCORDIONS */}
        {view === 'chapters' && (
          <div className="space-y-3 mt-2">
            {syllabusData[selectedSubject]?.[selectedGrade]?.map((ch, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button 
                  onClick={() => handleChapterClick(idx)}
                  className="w-full p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ch.status === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                      {ch.status}
                    </span>
                    <h4 className="text-sm font-bold text-slate-700">{ch.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{ch.mastery}%</span>
                    {expandedChapter === idx ? <ChevronDownIcon className="w-4 h-4 text-slate-400" /> : <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {expandedChapter === idx && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="flex items-center gap-2 mb-2">
                         <FireIcon className="w-4 h-4 text-indigo-500" />
                         <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Analysis Hub Tip</p>
                       </div>
                       <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                         "{ch.suggestion}"
                       </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. BOTTOM NAVIGATION TAB (EDTECH STANDARD) */}
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center shadow-2xl">
          <div className="flex flex-col items-center gap-1 opacity-100">
            <div className="h-1.5 w-6 bg-slate-900 rounded-full mb-1"></div>
            <p className="text-[10px] font-bold">Analysis</p>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-30 cursor-not-allowed">
            <div className="h-1.5 w-6 bg-transparent rounded-full mb-1"></div>
            <p className="text-[10px] font-bold">Mock Tests</p>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-30 cursor-not-allowed">
            <div className="h-1.5 w-6 bg-transparent rounded-full mb-1"></div>
            <p className="text-[10px] font-bold">Planner</p>
          </div>
      </div>
    </div>
  );
};

export default StudentPersonalAnalytics;