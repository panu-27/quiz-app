import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ClockIcon,
  InboxIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export default function TestHistory() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // --- FAKE CONTENT FOR UI PREVIEW ---
  const fakeHistory = [
    {
      _id: "697ece284b04818008eda001",
      testDetails: { title: "MHT-CET Full Mock Test #01" },
      attempts: [
        { _id: "att1", attemptNumber: 1, score: 142 },
        { _id: "att2", attemptNumber: 2, score: 185 }
      ]
    },
    {
      _id: "697ece284b04818008eda002",
      testDetails: { title: "Physics: Rotational Dynamics Sectional" },
      attempts: [
        { _id: "att3", attemptNumber: 1, score: 45 }
      ]
    },
    {
      _id: "697ece284b04818008eda003",
      testDetails: { title: "Chemistry: Organic Convergence" },
      attempts: [
        { _id: "att4", attemptNumber: 1, score: 38 },
        { _id: "att5", attemptNumber: 2, score: 50 }
      ]
    }
  ];

  /* ---------- NATIVE FETCH API CALL ---------- */
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/student/my-history`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        // IF API SUCCESS BUT EMPTY OR FAILED, USE FAKE CONTENT
        if (!res.ok || (Array.isArray(data) && data.length === 0)) {
          console.warn("API empty or failed. Loading Synthetic Data.");
          setHistory(fakeHistory);
        } else {
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Archive Sync Error. Loading Fallback Data.");
        setHistory(fakeHistory); // Load fake content on network error
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(record => {
    if (!searchQuery.trim()) return true;
    const title = record.testDetails?.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const handleToggle = (id) => {
    setSelectedId(selectedId === id ? null : id);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-3">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Syncing Archive...</p>
    </div>
  );

  return (
    <div className="h-[88vh] flex flex-col bg-[#F9F9FB] font-sans text-slate-900 overflow-hidden">

      {/* 1. BREADCRUMB NAV */}
      <nav className="shrink-0 bg-white border-b border-slate-100 px-6 py-3 z-30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/student")}
              className="p-1 hover:bg-slate-900 rounded-lg transition-all border border-slate-100 hover:text-white"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <h1 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="text-indigo-600 italic">Nexus Archive</span>
              <span className="text-slate-300 font-medium">/</span>
              <span className="truncate">Historical Logs</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg shadow-sm">
            <ClockIcon className="w-3 h-3 text-indigo-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-tighter">{history.length} RECORDS</span>
          </div>
        </div>
      </nav>

      {/* 2. SEARCH PANEL */}
      <div className="bg-white border-b border-slate-50 px-6 py-6 shrink-0 z-20">
        <div className="max-w-4xl mx-auto relative group">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Query historical records..."
            className="w-full bg-slate-50 border border-transparent rounded-xl py-3.5 pl-12 pr-4 text-xs font-medium focus:bg-white focus:border-indigo-500 shadow-inner transition-all outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. SCROLLABLE RECORDS LIST */}
      <main className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((record) => {
              const recordId = record._id;
              const isExpanded = selectedId === recordId;

              return (
                <div key={recordId} className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all hover:border-slate-300 shadow-sm">
                  <button
                    onClick={() => handleToggle(recordId)}
                    className="w-full p-5 flex justify-between items-center hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
                        <ChartBarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">REF: {recordId.slice(-8).toUpperCase()}</p>
                        <h3 className="font-bold text-sm text-slate-800 uppercase tracking-tight truncate max-w-[200px] md:max-w-sm">
                          {record.testDetails?.title || "Untitled Test"}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest hidden sm:block">
                        {record.attempts?.length || 0} ATTEMPTS
                      </span>
                      <ChevronRightIcon className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-slate-50/50 p-4 border-t border-slate-50 space-y-2 animate-in slide-in-from-top-2 duration-300">
                      {record.attempts?.map((attempt) => (
                        <div key={attempt._id} className="flex items-center justify-between bg-white px-5 py-4 rounded-xl border border-white hover:border-indigo-200 transition-all shadow-sm">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ITERATION</p>
                              <p className="text-xs font-bold text-slate-900">#0{attempt.attemptNumber}</p>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-100" />
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SCORE</p>
                              <p className="text-sm font-black text-indigo-600">
                                {attempt.score} <span className="text-[9px] text-slate-300">PTS</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/student/analytics/${recordId}/attempt/${attempt.attemptNumber}`)}
                            className="bg-slate-900 text-white px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                          >
                            Analyze
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <InboxIcon className="w-12 h-12 text-slate-100" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No Data Streams Found</p>
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