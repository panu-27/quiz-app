import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowRightIcon,
  ArchiveBoxIcon,
  InboxIcon
} from "@heroicons/react/24/outline";

export default function TestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/student/my-history")
      .then(res => {
        console.log("FETCH_SUCCESS:", res.data);
        setHistory(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("FETCH_ERROR:", err);
        setLoading(false);
      });
  }, []);

  const filteredHistory = history.filter(record => {
    if (!searchQuery.trim()) return true;
    const title = record.testDetails?.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const handleToggle = (id) => {
    console.log("Toggling ID:", id);
    setSelectedId(selectedId === id ? null : id);
  };

  if (loading) return <div className="p-20 text-center font-mono">LOADING_RECORDS...</div>;

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
      {/* HEADER */}
      <header className="max-w-2xl mx-auto p-6 border-b">
        <h1 className="text-2xl font-black uppercase">Test History ({filteredHistory.length})</h1>
        <input
          type="text"
          placeholder="Search..."
          className="w-full mt-4 p-2 border border-slate-300 rounded"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      {/* MAIN LIST */}
      <main className="max-w-2xl mx-auto p-6">
        <div className="flex flex-col gap-4">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((record, index) => {
              // DEBUG: If this shows in console, the HTML below MUST exist in the DOM
              console.log(`Rendering Item ${index}:`, record._id);
              
              const recordId = record._id;
              const isExpanded = selectedId === recordId;

              return (
                <div key={recordId} className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => handleToggle(recordId)}
                    className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="text-[10px] font-mono text-slate-400 uppercase">REF: {recordId.slice(-6)}</p>
                      <h3 className="font-bold text-lg uppercase">{record.testDetails?.title || "Untitled Test"}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">
                        {record.attempts?.length || 0} Attempts
                      </span>
                      <ChevronRightIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200">
                      {record.attempts?.map((attempt) => (
                        <div key={attempt._id} className="flex items-center justify-between bg-white p-3 border mb-2 rounded shadow-sm">
                          <div>
                            <p className="text-xs font-black uppercase">Attempt #0{attempt.attemptNumber}</p>
                            <p className="text-xl font-bold">{attempt.score} <span className="text-xs font-normal text-slate-400">PTS</span></p>
                          </div>
                          <button
                            onClick={() => navigate(`/student/analytics/${recordId}/attempt/${attempt.attemptNumber}`)}
                            className="bg-slate-900 text-white px-4 py-2 text-[10px] font-black uppercase rounded hover:bg-slate-700"
                          >
                            View Analysis
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-200">
              <p className="text-slate-400 uppercase font-mono text-xs">No records found matching criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}