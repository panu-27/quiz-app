import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, FileText, ChevronRight, Trophy, 
  Users, BarChart2, Search
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
    <div className="h-screen bg-[#f0ebf8] flex flex-col overflow-hidden font-sans">
      <AdminHeader userName={user?.name} onLogout={logout} />

      {/* MOBILE BACK NAV */}
      {selectedTest && (
        <div className="lg:hidden px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center gap-3 shrink-0">
          <button onClick={() => setSelectedTest(null)} className="p-2 bg-slate-100 rounded-xl text-slate-600">
            <ArrowLeft size={16} />
          </button>
          <h2 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Back to Test Bank</h2>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* LEFT SIDEBAR: STAYS FIXED, LIST SCROLLS */}
        <div className={`flex flex-col gap-4 w-full lg:w-80 shrink-0 h-full ${selectedTest ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-[#673ab7] transition-all">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Tests</h1>
          </div>

          {/* SEARCH BOX FIXED */}
          <div className="relative shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text"
              placeholder="Search by title..."
              className="w-full bg-white border-transparent focus:border-purple-200 focus:ring-0 rounded-[22px] py-4 pl-12 pr-4 text-sm font-bold text-slate-700 shadow-sm"
              value={testSearch}
              onChange={(e) => setTestSearch(e.target.value)}
            />
          </div>

          {/* INTERNAL SCROLL AREA */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {filteredTests.map((test) => (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test)}
                className={`w-full text-left p-5 rounded-[30px] border transition-all duration-300 flex items-center justify-between group ${
                  selectedTest?.id === test.id 
                  ? "bg-[#673ab7] border-[#673ab7] text-white shadow-xl shadow-purple-200 translate-x-1" 
                  : "bg-white border-transparent hover:border-purple-100 text-slate-800"
                }`}
              >
                <div className="flex items-center gap-4 truncate">
                  <div className={`p-3 rounded-2xl transition-colors ${selectedTest?.id === test.id ? "bg-white/20" : "bg-purple-50 text-[#673ab7]"}`}>
                    <FileText size={18} />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-[13px] truncate">{test.title}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${selectedTest?.id === test.id ? 'text-purple-200' : 'text-slate-400'}`}>
                      {test.date} • {test.avg} avg
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className={`transition-transform duration-300 ${selectedTest?.id === test.id ? 'translate-x-1 opacity-100' : 'opacity-20'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: DETAILS */}
        <div className={`flex-1 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col overflow-hidden transition-all duration-500 ${!selectedTest ? 'hidden lg:flex opacity-40 bg-slate-50' : 'flex'}`}>
          {selectedTest ? (
            <>
              {/* FIXED DETAIL HEADER */}
              <div className="p-8 border-b border-slate-50 flex justify-between items-end bg-slate-50/40 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#673ab7]/10 text-[#673ab7] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      {selectedTest.subject}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{selectedTest.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl lg:text-4xl font-black text-[#673ab7] tracking-tighter">{selectedTest.avg}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class Average</p>
                </div>
              </div>

              {/* DETAIL CONTENT SCROLL AREA */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                
                {/* PODIUM VIEW */}
                <div className="space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Podium Finishers</p>
                  <div className="grid grid-cols-3 gap-4">
                    {currentResults.top.map((name, i) => (
                      <div key={name} className="bg-slate-50 p-5 rounded-[32px] border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-md transition-all">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Trophy size={20} />
                        </div>
                        <span className="text-[11px] font-black text-slate-800 text-center leading-tight">{name.split(' ')[0]}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Rank {i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ROSTER WITH SEARCH */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-400" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Roster</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <input 
                        type="text"
                        placeholder="Filter by name..."
                        className="bg-slate-50 border-transparent rounded-[20px] py-3 pl-10 pr-4 text-[11px] font-bold focus:ring-0 focus:bg-white focus:shadow-sm w-full md:w-56 transition-all"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <div key={student.name} className="flex items-center justify-between p-5 rounded-[28px] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all group">
                        <span className="text-sm font-bold text-slate-700">{student.name}</span>
                        <div className="flex items-center gap-5">
                          <div className="w-24 lg:w-32 h-2 bg-slate-200/50 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${student.score > 85 ? 'bg-emerald-400' : student.score > 60 ? 'bg-[#673ab7]' : 'bg-red-400'}`} 
                              style={{ width: `${student.score}%` }}
                            />
                          </div>
                          <span className={`text-sm font-black w-10 text-right ${student.score > 85 ? 'text-emerald-500' : 'text-slate-900'}`}>{student.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
              <div className="w-20 h-20 bg-white rounded-[30px] shadow-sm flex items-center justify-center mb-6">
                <BarChart2 size={32} className="text-slate-200" />
              </div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Select Test Session</h3>
              <p className="text-[10px] text-slate-300 mt-2 max-w-[200px] leading-relaxed">Choose a test from the bank to see student scores and ranking</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}