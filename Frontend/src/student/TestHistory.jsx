import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChartBarSquareIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import {useNavigate } from "react-router-dom";

export default function TestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); // Track only the ID for single-open logic
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    api.get("/tests/my-history")
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Filter logic
  const filteredHistory = history.filter(record =>
    record.testDetails?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle logic: If clicking the same one, close it. If clicking a new one, close the old one.
  const handleToggle = (id) => {
    setSelectedId(selectedId === id ? null : id);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-mono text-[11px] tracking-widest text-slate-400">
      LOG_SYSTEM_FETCHING...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-slate-900 font-sans antialiased">
      {/* HEADER & SEARCH */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <header className="max-w-3xl mx-auto px-5 py-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Archive</p>
              <h1 className="text-2xl font-bold tracking-tight">Test History</h1>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-400">
              {history.length} RECORDS_FOUND
            </div>
          </div>

          {/* PRO SEARCH BAR */}
          <div className="relative group">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH_BY_TEST_TITLE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 text-xs font-mono tracking-tight focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all rounded-none"
            />
          </div>
        </header>
      </div>

      <main className="max-w-3xl mx-auto p-5 pb-20">
        <div className="space-y-3">
          {filteredHistory.map((record) => {
            const isExpanded = selectedId === record._id;

            return (
              <div
                key={record._id}
                className={`bg-white border transition-all duration-300 ${isExpanded ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'
                  }`}
              >
                {/* LIST ITEM HEADER */}
                <button
                  onClick={() => handleToggle(record._id)}
                  className="w-full text-left p-4 flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">
                      ID::{record._id.slice(-6)}
                    </span>
                    <h3 className="text-sm font-bold tracking-tight text-slate-800 uppercase">
                      {record.testDetails?.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter ${record.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'
                        }`}>
                        {record.status}
                      </span>
                    </div>
                    <ChevronRightIcon className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-slate-900' : ''}`} />
                  </div>
                </button>

                {/* EXPANDED CONTENT (Single Open View) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-in fade-in zoom-in-95">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="border-l-2 border-slate-900 pl-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Attempts</span>
                        <span className="text-xl font-bold italic">{record.attempts.length}</span>
                      </div>
                      <div className="border-l-2 border-slate-200 pl-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Max Score</span>
                        <span className="text-xl font-bold italic text-slate-500">{record.testDetails?.totalMarks || 300}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Attempt Logs</p>
                      {record.attempts.map((attempt) => (
                        <div key={attempt._id} className="flex items-center justify-between p-3 bg-white border border-slate-100 hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[10px] text-slate-300">#0{attempt.attemptNumber}</span>
                            <div>
                              <div className="text-sm font-black text-slate-900">{attempt.score} <span className="text-[10px] text-slate-400 font-normal underline">PTS</span></div>
                              <div className="text-[9px] font-medium text-slate-400 flex items-center gap-1 uppercase">
                                <ClockIcon className="w-3 h-3" /> {Math.floor(attempt.timeTaken / 60)}M {attempt.timeTaken % 60}S
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/student/analytics/${record.testDetails._id}/attempt/${attempt.attemptNumber}`)}
                            className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                          >
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredHistory.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-slate-200">
              <p className="font-mono text-[10px] text-slate-400 uppercase">No_Matches_Found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}