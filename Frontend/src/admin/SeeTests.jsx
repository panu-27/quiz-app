import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, FileText, ChevronRight, Trophy, 
  Users, BarChart3, Search, Target
} from "lucide-react";

export default function SeeTests() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null);
  const [testSearch, setTestSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const tests = [
    { id: 1, title: "Quantum Basics", subject: "Physics", date: "Today", avg: "72%" },
    { id: 2, title: "Organic Nomenclature", subject: "Chemistry", date: "Yesterday", avg: "64%" },
    { id: 3, title: "Calculus III", subject: "Maths", date: "Oct 20", avg: "45%" },
    { id: 4, title: "Static Mechanics", subject: "Physics", date: "Oct 18", avg: "82%" },
    { id: 5, title: "Atomic Structure", subject: "Chemistry", date: "Oct 15", avg: "77%" },
  ];

  const testResults = {
    1: {
      top: ["Aditya Kulkarni", "Swarangi Patil", "Tanmay Deshpande"],
      all: [
        { name: "Aditya Kulkarni", score: 98 },
        { name: "Swarangi Patil", score: 92 },
        { name: "Tanmay Deshpande", score: 88 },
        { name: "Ananya Joshi", score: 84 },
        { name: "Chinmay Bhave", score: 76 },
        { name: "Rohan Gaikwad", score: 65 },
        { name: "Ishani More", score: 42 },
        { name: "Siddhesh Shinde", score: 55 },
      ]
    }
  };

  const filteredTests = tests.filter(t => t.title.toLowerCase().includes(testSearch.toLowerCase()));
  const currentResults = testResults[selectedTest?.id] || testResults[1];
  const filteredStudents = currentResults.all.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="h-[100dvh] bg-[#fcfcfc] flex flex-col overflow-hidden font-sans text-slate-900">
      {/* <AdminHeader userName={user?.name} onLogout={logout} /> */}

      {/* MOBILE HEADER OVERLAY */}
      {selectedTest && (
        <div className="lg:hidden px-6 py-4 bg-white border-b border-slate-100 flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setSelectedTest(null)} 
            className="p-2 bg-slate-900 text-white rounded-lg shadow-lg active:scale-95 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-black tracking-tight">{selectedTest.title}</h2>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{selectedTest.subject}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* LEFT PANEL: TEST BANK */}
        <div className={`flex flex-col gap-6 w-full lg:w-[360px] shrink-0 h-full ${selectedTest ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Vault</h1>
          </div>

          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search by test title..."
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 rounded-xl py-4 pl-12 pr-4 text-sm font-medium transition-all"
              value={testSearch}
              onChange={(e) => setTestSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 no-scrollbar">
            {filteredTests.map((test) => (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 group ${
                  selectedTest?.id === test.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-1" 
                  : "bg-white border-slate-100 hover:border-indigo-400 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{test.title}</p>
                    <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-widest ${selectedTest?.id === test.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                      <span>{test.date}</span>
                      <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                      <span>{test.avg} avg</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`transition-transform duration-300 ${selectedTest?.id === test.id ? 'translate-x-1 opacity-100' : 'opacity-20'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: ANALYTICS DETAIL */}
        <div className={`flex-1 bg-white rounded-[2rem] border border-slate-200 flex flex-col overflow-hidden transition-all duration-500 ${!selectedTest ? 'hidden lg:flex opacity-20 bg-slate-50 border-dashed' : 'flex'}`}>
          {selectedTest ? (
            <>
              {/* ANALYTICS HEADER */}
              <div className="p-5 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-6 bg-slate-50/50 shrink-0">
  <div>
    <span className="inline-block bg-indigo-600 text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-md uppercase tracking-[0.2em] mb-2 sm:mb-4">
      {selectedTest.subject}
    </span>
    {/* Scaled down on mobile (text-2xl), full power on desktop (text-4xl) */}
    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight sm:tracking-tighter leading-tight">
      {selectedTest.title}
    </h2>
  </div>

  <div className="text-left sm:text-right flex items-baseline sm:flex-col gap-2 sm:gap-0 mt-1 sm:mt-0">
    {/* Average score made more compact for mobile */}
    <p className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tighter">
      {selectedTest.avg}
    </p>
    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
      Cohort Average
    </p>
  </div>
</div>

              {/* DASHBOARD CONTENT */}
              <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
                
                {/* TOP 3 GRID */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Trophy size={14} className="text-indigo-500" />
                    Top Performance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {currentResults.top.map((name, i) => (
                      <div key={name} className="bg-white border border-slate-100 p-6 rounded-xl flex items-center sm:flex-col gap-4 sm:gap-2 group hover:border-indigo-600 transition-all">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <span className="text-xs font-black">0{i+1}</span>
                        </div>
                        <div className="sm:text-center">
                          <p className="text-sm font-bold text-slate-900">{name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rank Distinction</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROSTER TABLE */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Users size={14} className="text-indigo-500" />
                      Detailed Scores
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input 
                        type="text"
                        placeholder="Filter by name..."
                        className="bg-slate-50 border border-slate-100 rounded-lg py-3 pl-10 pr-4 text-xs font-bold focus:bg-white focus:border-indigo-500 w-full sm:w-64 transition-all"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredStudents.map((student) => (
                      <div key={student.name} className="flex items-center justify-between p-5 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all group">
                        <span className="text-sm font-bold text-slate-700">{student.name}</span>
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden md:block">
                            <div 
                              className={`h-full transition-all duration-1000 ${student.score > 85 ? 'bg-indigo-600' : student.score > 60 ? 'bg-slate-900' : 'bg-rose-500'}`} 
                              style={{ width: `${student.score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-black w-12 text-right ${student.score > 85 ? 'text-indigo-600' : 'text-slate-900'}`}>{student.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 size={32} className="text-slate-200" />
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Selection Required</h3>
              <p className="text-xs text-slate-400 mt-4 max-w-[240px] leading-relaxed">Select a session from the test bank to analyze real-time cohort performance and roster data.</p>
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
}