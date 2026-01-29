import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Power, LayoutGrid, BookOpen, Heart, User as UserIcon } from "lucide-react";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tests immediately without a UI timer
    api.get("/tests").then(res => setTests(res.data));
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
    <div className="min-h-screen bg-[#F8FAFF] pb-32 font-sans text-zinc-800 animate-in fade-in duration-500">
      {/* Header */}
      <header className="px-6 pt-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-zinc-100">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Hi, {user?.name || "Student"} 👋</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={logout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
          <button onClick={exitApp} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"><Power className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Promo Banner */}
      <div className="px-6 mt-8">
        <div className="bg-[#A5C0FF] rounded-3xl p-8 relative overflow-hidden flex justify-between items-center shadow-lg shadow-indigo-100">
          <div className="z-10 max-w-[60%]">
            <h2 className="text-3xl font-black text-white leading-tight mb-2">Let's Learn more</h2>
            <button className="bg-white/30 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Get Started</button>
          </div>
          <div className="absolute right-[-10px] bottom-[-20px] w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          <div className="text-6xl grayscale opacity-80">📚</div>
        </div>
      </div>

      {/* Study Material */}
      <div className="px-6 mt-10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Study Material</h3>
        <button className="text-zinc-400 text-sm font-medium">See all</button>
      </div>
      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        <SubjectCard title="Physics" icon="⚛️" color="bg-blue-50" />
        <SubjectCard title="Chemistry" icon="🧪" color="bg-orange-50" />
        <SubjectCard title="Maths" icon="📐" color="bg-green-50" />
        <SubjectCard title="Biology" icon="🧬" color="bg-red-50" />
      </div>

      {/* Scheduled Tests */}
      <div className="px-6 mt-10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Scheduled Tests</h3>
        <button className="text-zinc-400 text-sm font-medium">See all</button>
      </div>
      <div className="px-6 mt-6 space-y-4">
        {tests.length === 0 ? (
          <p className="text-zinc-400 text-sm italic px-4">No upcoming tests scheduled.</p>
        ) : (
          tests.map((t) => (
            <div key={t._id} className="bg-white p-6 rounded-[2rem] flex items-center justify-between shadow-sm border border-zinc-50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><span className="text-xl">🕒</span></div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900">{t.title}</h4>
                  <p className="text-xs text-zinc-400">Upcoming Attempt</p>
                </div>
              </div>
              <button onClick={() => navigate(`/student/test/${t._id}`)} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Start</button>
            </div>
          ))
        )}
      </div>

      {/* Completed Tests */}
      <div className="px-6 mt-10 flex justify-between items-center">
        <h3 className="text-lg font-bold text-zinc-900">Completed Tests</h3>
        <button className="text-zinc-400 text-sm font-medium">History</button>
      </div>
      <div className="px-6 mt-6">
        <div className="bg-white p-6 rounded-[2rem] flex items-center justify-between shadow-sm border border-zinc-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center"><span className="text-xl">✅</span></div>
            <div>
              <p className="font-bold text-sm text-zinc-900">Last Session</p>
              <p className="text-xs text-zinc-400">View your scores and review</p>
            </div>
          </div>
          <button className="text-indigo-600 font-bold text-xs uppercase tracking-widest">View</button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white shadow-2xl shadow-indigo-200 px-8 py-3 flex justify-between items-center border border-zinc-100/50 backdrop-blur-sm z-50">
        <button className="text-indigo-600 bg-indigo-50 p-2 rounded-2xl"><LayoutGrid className="w-6 h-6" /></button>
        <button className="text-zinc-300 hover:text-indigo-400 transition-colors"><BookOpen className="w-6 h-6" /></button>
        <button className="text-zinc-300 hover:text-indigo-400 transition-colors"><Heart className="w-6 h-6" /></button>
        <button className="text-zinc-300 hover:text-indigo-400 transition-colors"><UserIcon className="w-6 h-6" /></button>
      </nav>
    </div>
  );
}