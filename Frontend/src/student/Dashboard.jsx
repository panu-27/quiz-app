import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid, BarChart2, Loader2, Clock,
  ArrowUpRight, MonitorPlay, ClipboardCheck,
  History, ArrowRight
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/student/my-tests");
        const testData = Array.isArray(res.data) ? res.data : (res.data.tests || []);
        setTests(testData);
      } catch (err) {
        console.error("Failed to fetch student tests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTests();
  }, []);

  return (
    <div className="bg-[#fcfcfc] pb-24 font-sans text-slate-900 min-h-screen">

      {/* 1. TOP NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1 rounded-lg shadow-sm">
              <LayoutGrid size={16} />
            </div>
            <span className="font-black italic tracking-tighter text-lg text-slate-900 uppercase">Nexus</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-inner">
            {user?.name?.charAt(0) || "S"}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-8">

        {/* 2. CINEMATIC POSTER */}
        {/* 2. CINEMATIC CLASSROOM POSTER (CLEAN) */}
       <div className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-10 bg-slate-900 shadow-2xl shadow-indigo-100">
  <img
    src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1600"
    alt="Students studying in classroom"
    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
  />
  <div className="absolute inset-0 bg-indigo-900/5 pointer-events-none" />
</div>


        {/* 3. CORE ACTION CARDS (TWO IN A ROW) */}
        <section className="grid grid-cols-2 gap-4 mb-12">
          <div
            onClick={() => navigate("/student/library")}
            className="group bg-white border border-slate-100 p-6 rounded-3xl hover:border-indigo-600 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
              <ClipboardCheck size={24} />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-2">Initialize Quiz</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Enter Courseware</p>
          </div>

          <div
            onClick={() => navigate("/student/history")}
            className="group bg-white border border-slate-100 p-6 rounded-3xl hover:border-violet-600 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-violet-500/5"
          >
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-inner">
              <History size={24} />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-2">Quiz History</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Access Records</p>
          </div>
        </section>

        {/* 4. SCHEDULED TESTS */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scheduled Exams</h3>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-200" /></div>
            ) : tests.length > 0 ? (
              tests.map((t) => (
                <div key={t._id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-400 transition-all shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none mb-2">{t.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.duration} Mins • Diagnostic</p>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/student/test/${t._id}`)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                    Launch
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-3xl">
                <p className="text-[10px] font-black text-slate-300 uppercase">No active assessment streams</p>
              </div>
            )}
          </div>
        </section>

        {/* 5. TEST ANALYTICS ARCHIVE */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Analysis Hub</h3>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>
          <div
            onClick={() => navigate("/student/history")}
            className="group flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[2.5rem] cursor-pointer hover:border-violet-500 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-500"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-violet-50 text-violet-600 border border-violet-100 rounded-[1.5rem] flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                <BarChart2 size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Intelligence Logs</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Historical Diagnostic Data</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
          </div>
        </section>

      </main>
    </div>
  );
}