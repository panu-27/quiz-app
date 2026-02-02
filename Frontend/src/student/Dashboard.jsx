import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Power, LayoutGrid, BookOpen, Heart, User as UserIcon, ChevronRight, BarChart2, Loader2, Calendar } from "lucide-react";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTests = async () => {
      try {
        setLoading(true);
        // Using the endpoint you provided
        const res = await api.get("/student/my-tests");
        
        // Ensure we handle both array or object response
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

  const exitApp = () => {
    if (window.electron?.forceExit) {
      window.electron.forceExit();
    } else {
      alert("Exit works only in desktop app");
    }
  };

  const SubjectCard = ({ title, icon, color }) => (
    <div onClick={() => navigate(`/student/subject/${title}`)} className="bg-white p-6 rounded-[2rem] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all cursor-pointer border border-zinc-50 group">
      <div className={`w-20 h-20 mb-4 flex items-center justify-center rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="font-bold text-sm tracking-tight text-zinc-900">{title}</p>
    </div>
  );

  return (
    <div className=" bg-[#F8FAFF] pb-32 font-sans text-zinc-800 animate-in fade-in duration-500 min-h-screen">
      {/* Header */}
      <header className="px-6 pt-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-zinc-100">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
          </div>
          <div fertile-cols>
             <h1 className="text-xl font-bold tracking-tight">Hi, {user?.name || "Student"} 👋</h1>
             <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{user?.batchName || "Standard Plan"}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={logout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
          <button onClick={exitApp} className="p-2 hidden md:block bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"><Power className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Promo Banner */}
      <div className="px-6 mt-8">
        <div className="bg-[#A5C0FF] rounded-3xl p-8 relative overflow-hidden flex justify-between items-center shadow-lg shadow-indigo-100">
          <div className="z-10 max-w-[60%]">
            <h2 className="text-3xl font-black text-white leading-tight mb-2">Ready for your next challenge?</h2>
            <button className="bg-white/30 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">View Schedule</button>
          </div>
          <div className="absolute right-[-10px] bottom-[-20px] w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="text-6xl grayscale opacity-80">🚀</div>
        </div>
      </div>

      {/* Study Material */}
      <div className="px-6 mt-10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Subjects</h3>
        <button className="text-zinc-400 text-sm font-medium">See all</button>
      </div>
      <div className="px-6 mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SubjectCard title="Physics" icon="⚛️" color="bg-blue-50" />
        <SubjectCard title="Chemistry" icon="🧪" color="bg-orange-50" />
        <SubjectCard title="Maths" icon="📐" color="bg-green-50" />
        <SubjectCard title="Biology" icon="🧬" color="bg-red-50" />
      </div>

      {/* Scheduled Tests Section */}
      <div className="px-6 mt-10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Upcoming Tests</h3>
        <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Live Now</span>
      </div>

      <div className="px-6 mt-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
             <Loader2 className="animate-spin text-indigo-600" />
             <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Fetching your assigned tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white p-10 rounded-[2rem] border-2 border-dashed border-zinc-100 flex flex-col items-center">
            <Calendar className="text-zinc-200 mb-2" size={32} />
            <p className="text-zinc-400 text-sm font-medium italic">No upcoming tests scheduled for your batch.</p>
          </div>
        ) : (
          tests.map((t) => (
            <div key={t._id} className="bg-white p-6 rounded-[2rem] flex items-center justify-between shadow-sm border border-zinc-50 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span className="text-xl font-bold">
                    {t.metadata?.pattern === "NEET" ? "N" : t.metadata?.pattern === "JEE MAINS" ? "J" : "T"}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">{t.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black text-zinc-400 uppercase bg-zinc-50 px-1.5 py-0.5 rounded-md">{t.duration} Mins</span>
                    <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 px-1.5 py-0.5 rounded-md">{t.metadata?.pattern}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/student/test/${t._id}`)} 
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
              >
                Start Test
              </button>
            </div>
          ))
        )}
      </div>

      {/* History Card (Keep as is) */}
      <div className="px-6 mt-10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Performance History</h3>
        <button onClick={() => navigate("/student/history")} className="text-zinc-400 text-sm font-medium hover:text-indigo-600 transition-colors">See all</button>
      </div>

      <div className="px-6 mt-6 pb-10">
        <div onClick={() => navigate("/student/history")} className="bg-white p-6 rounded-[2rem] flex items-center justify-between shadow-sm border border-zinc-50 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900">Detailed Analytics</p>
              <p className="text-xs text-zinc-400">View all past attempt scores & review</p>
            </div>
          </div>
          <div className="bg-zinc-50 p-2 rounded-full group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}