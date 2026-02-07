import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ArrowLeft, Clock, Inbox, Search, 
  Zap, Layers, Target, Activity, Loader2, Calendar
} from "lucide-react";

export default function TestHistory() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Archive Sync Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [baseURL]);

  const filteredHistory = history.filter(record => {
    const title = record.testDetails?.title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  // Calculate Master Stats
  const totalTests = history.length;
  const totalAttempts = history.reduce((acc, curr) => acc + (curr.attempts?.length || 0), 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <Loader2 className="w-10 h-10 text-[#7A41F7] animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Nexus Archive...</p>
    </div>
  );

  return (
    <div className="fixed top-0 w-full min-h-screen bg-[#7A41F7] flex flex-col font-sans selection:bg-[#F1EBFE]">
      
      {/* 1. BRANDED HEADER OVERLAP */}
{/* 1. COMPACT NAV */}
<nav className=" bg-[#7A41F7] pt-5 pb-14 px-6 relative overflow-hidden">
  {/* Shrunken circles */}
  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
  
  <div className="max-w-lg mx-auto flex justify-between items-center relative z-10">
    <button onClick={() => navigate("/student")} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white backdrop-blur-md">
      <ArrowLeft size={18} />
    </button>
    <h2 className="text-lg font-black text-white tracking-tight">Test History</h2>
    <div className="w-9" />
  </div>
</nav>

<div className="">
  <main className="flex-1   rounded-t-2xl   max-w-lg mx-auto w-full px-6 -mt-10 space-y-4 relative  pb-24">
  
  {/* 2. COMPACT STATS CARDS */}
  <div className="bg-[#7A41F7] grid grid-cols-2 gap-2">
    {/* Tests Taken */}
    <div className="bg-white p-3 rounded-2xl shadow-lg shadow-purple-900/5 flex items-center gap-2.5 border border-white">
      <div className="w-8 h-8 rounded-lg bg-[#F1EBFE] flex items-center justify-center shrink-0">
        <Layers size={14} className="text-[#7A41F7]" />
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter opacity-70">Tests</p>
        <p className="text-base font-black text-slate-900 leading-none">{totalTests}</p>
      </div>
    </div>

    {/* Total Attempts */}
    <div className="bg-white p-3 rounded-2xl shadow-lg shadow-purple-900/5 flex items-center gap-2.5 border border-white">
      <div className="w-8 h-8 rounded-lg bg-[#FFF4EB] flex items-center justify-center shrink-0">
        <Zap size={14} className="text-orange-500" />
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter opacity-70">Attempts</p>
        <p className="text-base font-black text-slate-900 leading-none">{totalAttempts}</p>
      </div>
    </div>
  </div>

  {/* 3. COMPACT SEARCH BAR */}
  <div className=" rounded-2xl relative group">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7A41F7] transition-colors" size={16} />
    <input
      type="text"
      placeholder="Search records..."
      className="w-full bg-white border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:border-[#7A41F7] shadow-lg shadow-purple-900/5 transition-all outline-none"
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>


        {/* 4. RECENT ACTIVITY LIST */}
{/* 4. RECENT ACTIVITY LIST */}
<div className="flex flex-col bg-white rounded-t-[2.5rem] -mx-6 px-6 pt-6 mt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] h-[calc(80vh)]">
  
  {/* Header - Stays at the top of the white div */}
  <div className="flex items-center justify-between px-2 mb-4 shrink-0">
    <div className="flex items-center gap-2">
      <Activity size={14} className="text-[#7A41F7]" />
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Archive Logs</p>
    </div>
    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full">
      <Calendar size={12} className="text-slate-400" />
      <span className="text-[10px] font-bold text-slate-500">History</span>
    </div>
  </div>

  {/* SCROLLABLE AREA - This is what you need */}
  <div className="flex-1 overflow-y-auto pr-1 pb-32 space-y-3 no-scrollbar">
    {filteredHistory.length > 0 ? (
      filteredHistory.map((record) => (
        <HistoryLogItem 
          key={record._id} 
          record={record} 
          isExpanded={selectedId === record._id}
          onToggle={() => setSelectedId(selectedId === record._id ? null : record._id)}
          navigate={navigate}
        />
      ))
    ) : (
      <div className="py-20 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
        <Inbox className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Records Found</p>
      </div>
    )}
    
  </div>
</div>
      </main>
</div>
    </div>
  );
}

/* --- REUSABLE CARD COMPONENT --- */
function HistoryLogItem({ record, isExpanded, onToggle, navigate }) {
  return (
    <div className={`bg-white transition-all duration-500 ease-in-out overflow-hidden border ${
      isExpanded 
        ? 'rounded-[2rem] border-slate-100 shadow-xl shadow-purple-900/10' 
        : 'rounded-[1.5rem] border-slate-50 shadow-sm hover:shadow-md'
    }`}>
      <button 
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between group transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          {/* Circular Graphic Box - Refined sizes and colors */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isExpanded 
              ? 'bg-[#7A41F7] text-white shadow-lg shadow-purple-200' 
              : 'bg-slate-50 text-slate-400 group-hover:bg-[#F1EBFE] group-hover:text-[#7A41F7]'
          }`}>
             <Target size={20} className={isExpanded ? 'rotate-[360deg] transition-transform duration-700' : ''} />
          </div>

          <div className="min-w-0">
            <h3 className="font-black text-[14px] text-slate-800 truncate leading-tight uppercase tracking-tight">
              {record.testDetails?.title || "Standardized Test"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
               <div className="flex -space-x-1">
                  {[...Array(Math.min(record.attempts?.length, 3))].map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full border border-white bg-slate-200" />
                  ))}
               </div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                {record.attempts?.length} Previous {record.attempts?.length === 1 ? 'Attempt' : 'Attempts'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-1.5 rounded-lg transition-all duration-300 ${
          isExpanded ? 'bg-[#7A41F7] text-white' : 'bg-slate-50 text-slate-300 group-hover:text-slate-500'
        }`}>
           <ChevronRight size={16} className={isExpanded ? 'rotate-90' : ''} />
        </div>
      </button>

      {/* EXPANDED CONTENT - Modernized Attempt Rows */}
      {isExpanded && (
        <div className="px-4 pb-5 pt-0 space-y-2 animate-in fade-in slide-in-from-top-3 duration-500">
          <div className="h-px bg-slate-50 mb-4 mx-2" />
          
          {record.attempts?.map((attempt) => (
            <div 
              key={attempt._id} 
              className="bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                 <div className="text-center">
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Attempt</p>
                   <p className="text-[12px] font-black text-slate-700">#0{attempt.attemptNumber}</p>
                 </div>
                 
                 <div className="w-px h-6 bg-slate-200" />
                 
                 <div>
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Performance</p>
                   <div className="flex items-center gap-1">
                      <Zap size={10} className="text-orange-400" />
                      <p className="text-[12px] font-black text-[#7A41F7]">+{attempt.score}</p>
                   </div>
                 </div>
              </div>

              <button 
                onClick={() => navigate(`/student/analytics/${record._id}/attempt/${attempt.attemptNumber}`)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-[#7A41F7] hover:text-white hover:border-[#7A41F7] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
              >
                Analyze
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}