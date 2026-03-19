import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, ArrowRight, ClipboardCheck, History,
  Clock, Atom, FlaskConical, Calculator, Dna, BarChart2,
  Trophy, BookOpen, CheckCircle2, PlayCircle, TrendingUp,
} from "lucide-react";
import StudentHeader from "./StudentHeader";
import { FakeStatsBar } from "./StudentDashboardOverlays";
import StudentDashboardOverlays from "./StudentDashboardOverlays";


/* ══════════════════════════════════════════════════════
   SHIMMER PRIMITIVES  — YouTube-style skeleton loader
══════════════════════════════════════════════════════ */
const shimmerBase = {
  backgroundImage: "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
  backgroundSize: "200% 100%",
  animation: "yt-shimmer 1.5s infinite linear",
};

const shimmerPurple = {
  backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.08) 100%)",
  backgroundSize: "200% 100%",
  animation: "yt-shimmer 1.5s infinite linear",
};

/* Global keyframe — injected once */
const ShimmerCSS = () => (
  <style>{`@keyframes yt-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
);

/* Plain shimmer block */
const Sk = ({ className = "", purple = false }) => (
  <div className={`rounded-xl ${className}`} style={purple ? shimmerPurple : shimmerBase} />
);

/* ── Skeleton: 3 stat cards ── */
const StatsBarSkeleton = () => (
  <div className="grid grid-cols-3 gap-5 mb-8">
    {[0, 1, 2].map(i => (
      <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-slate-100">
        <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Sk className="h-6 w-14" />
          <Sk className="h-3 w-28" />
          <Sk className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Skeleton: hero + leaderboard row ── */
const HeroRowSkeleton = () => (
  <div className="grid grid-cols-3 gap-6 mb-8">
    <Sk className="col-span-2 h-[220px] rounded-3xl" />
    <Sk className="h-[220px] rounded-3xl" />
  </div>
);

/* ── Skeleton: 4 quiz cards ── */
const QuizGridSkeleton = () => (
  <div className="grid grid-cols-4 gap-5">
    {[0, 1, 2, 3].map(i => (
      <div key={i} className="bg-white rounded-3xl p-6 space-y-4 border border-slate-100">
        <div className="flex gap-2">
          <Sk className="h-7 w-20 rounded-full" />
          <Sk className="h-7 w-14 rounded-full" />
        </div>
        <Sk className="h-5 w-4/5" />
        <Sk className="h-3 w-1/2" />
        <Sk className="h-3 w-1/3" />
      </div>
    ))}
  </div>
);

/* ── Skeleton: test row ── */
const TestRowSkeleton = () => (
  <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100">
    <Sk className="w-8 h-8 rounded-xl flex-shrink-0" />
    <Sk className="w-11 h-11 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Sk className="h-4 w-2/3" />
      <Sk className="h-3 w-1/3" />
    </div>
    <Sk className="w-20 h-9 rounded-xl flex-shrink-0" />
  </div>
);

/* ── Mobile: top rank card skeleton (purple bg) ── */
const TopRankMobileSkeleton = () => (
  <div className="relative bg-[#7A41F7] rounded-[2rem] p-5 overflow-hidden min-h-[80px]">
    <div className="flex items-center gap-4">
      <Sk className="w-8 h-8 rounded-full" purple />
      <Sk className="w-14 h-14 rounded-full" purple />
      <div className="space-y-2">
        <Sk className="h-4 w-32 rounded-lg" purple />
        <Sk className="h-3 w-20 rounded" purple />
      </div>
    </div>
  </div>
);

/* ── Mobile: scheduled test row skeleton ── */
const MobileTestRowSkeleton = () => (
  <div className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-50">
    <div className="flex items-center gap-4 flex-1">
      <Sk className="w-12 h-12 rounded-2xl flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Sk className="h-4 w-3/4" />
        <Sk className="h-3 w-1/2" />
      </div>
    </div>
    <Sk className="w-20 h-10 rounded-2xl flex-shrink-0 ml-4" />
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = window.__API_URL__
      ? window.__API_URL__.replace(/\/api$/, '')
      : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    return `${base}${url}`;
  };

  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(true);

  const [topRankName, setTopRankName] = useState("Brandon Matrovs");
  const [topRankPic, setTopRankPic] = useState(null);
  const [rankLoading, setRankLoading] = useState(true);

  const [stats, setStats] = useState({ attempted: "_", scheduled: 0, completed: "_" });
  const [statsLoading, setStatsLoading] = useState(true);


  /* ── fetches ── */
  useEffect(() => {
    /* scheduled tests */
    const fetchMyTests = async () => {
      try {
        setTestsLoading(true);
        const res = await api.get("/student/my-tests");
        const list = res.data?.tests || res.data || [];
        setTests(list);
        setStats(prev => ({ ...prev, scheduled: list.length }));
      } catch (err) {
        console.error("my-tests failed", err);
      } finally {
        setTestsLoading(false);
      }
    };

    /* top rank */
    const fetchTopRank = async () => {
      try {
        setRankLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/leaderboard/stats/top-one", {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });
        const name = res.data?.name || res.data?.studentName || res.data?.student?.name;
        const profilePic = res.data?.avatar || res.data?.student?.avatar;
        console.log("Top rank data:", res.data);
        if (name) setTopRankName(name);
        if(profilePic) setTopRankPic(profilePic);
      } catch {
        /* stays "Brandon Matrovs" */
      } finally {
        setRankLoading(false);
      }
    };



    fetchMyTests();
    fetchTopRank();

  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";  // ← full reload, works for both web + Electron
  };

  const quizzes = [
    { name: "Physics Quiz", color: "bg-[#EBF3FF]", badge: "bg-[#D1E5FF]", tag: "Physics", icon: <Atom size={18} />, questions: 15, players: "20k+", subj: "physics" },
    { name: "Chemistry Quiz", color: "bg-[#FFF4EB]", badge: "bg-[#FFE9D6]", tag: "Chemistry", icon: <FlaskConical size={18} />, questions: 15, players: "12k+", subj: "chemistry" },
    { name: "Math Quiz", color: "bg-[#F3EBFF]", badge: "bg-[#E6D6FF]", tag: "Math", icon: <Calculator size={18} />, questions: 15, players: "15k+", subj: "maths" },
    { name: "Biology Quiz", color: "bg-[#EBFDEB]", badge: "bg-[#D6F7D6]", tag: "Biology", icon: <Dna size={18} />, questions: 15, players: "8k+", subj: "biology" },
  ];

  /* ── shared top rank content (real data) ── */
  const TopRankContent = ({ large = false }) => (
    <div className="flex items-center gap-2 relative z-10">
      <div className={`${large ? "w-10 h-10 text-sm" : "w-7 h-7 text-xs"} rounded-full border-2 border-white/40 flex items-center justify-center text-white font-bold flex-shrink-0 -ml-3`}>
        #1
      </div>
      <div className="relative flex-shrink-0">
        <div className={`${large ? "w-16 h-16" : "w-14 h-14"} rounded-full bg-pink-200 border-2 border-white/20 overflow-hidden`}>
          <img
            src={topRankPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(topRankName)}`}
            alt="Top student"
            className="w-full h-full object-cover"
          />
        </div>

      </div>
      <div className="text-white min-w-0 flex-1 pr-12"> {/* Added flex-1 to push the text to fill space */}
        <p className={`${large ? "text-base" : "text-[15px]"} font-bold truncate `}>
          {topRankName}
        </p>
        <p className="text-[12px] opacity-70 font-medium">Top of the week 🏆</p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════
     JSX
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F6F8FC] pb-24">
      <ShimmerCSS />

      {/* DESKTOP HEADER */}
      <div className="hidden md:block"><StudentHeader /></div>

      {/* MOBILE HEADER */}
      <div className="md:hidden px-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {user?.profilePic
                ? <img src={resolveMediaUrl(user.profilePic)} alt="Profile" className="w-full h-full object-cover" />
                : <div className="text-[#7A41F7] font-bold text-lg">{user?.name?.charAt(0)?.toUpperCase() || "S"}</div>
              }
            </div>
            <div>
              <p className="text-[13px] text-slate-500 font-medium leading-tight">Welcome</p>
              <h2 className="text-[16px] font-bold text-slate-900 leading-tight">{user?.name || "Student"}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* NOTIFICATION BELL WITH LIVE TEST COUNT */}
            <button className="relative p-2.5 bg-slate-50 rounded-full text-slate-600 active:bg-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>

              {/* Badge: only shows if tests exist and loading is finished */}
              {!testsLoading && tests.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {tests.length}
                </div>
              )}
            </button>

            <button onClick={handleLogout} className="p-2.5 bg-slate-50 rounded-full text-[#7A41F7] active:bg-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* ══════════════════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col pb-24">

        {/* Top Rank — shimmer on mobile */}
        <div className="px-4 mt-8">
          <h4 className="text-[16px] font-bold text-slate-800 mb-3">Top rank of the week</h4>
          {rankLoading ? (
            <TopRankMobileSkeleton />
          ) : (
            <div
              className="relative bg-[#7A41F7] rounded-[2rem] p-5 flex items-center  overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate("/student/personal")}
            >
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <svg width="150" height="100" viewBox="0 0 150 100" fill="none">
                  <circle cx="120" cy="80" r="60" stroke="white" strokeWidth="2" />
                  <circle cx="120" cy="80" r="40" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <TopRankContent large={false} />
              <div className="absolute bottom-2 right-3 z-20 flex items-center justify-center w-10 h-10">
                <div className="absolute right-0 inset-0 bg-[#FFD700] shadow-lg" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }} />
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white relative z-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Hero Banner */}
        <div className="px-4 mt-6">
          <div
            className="relative bg-[#7A41F7] rounded-3xl p-8 flex items-center min-h-[160px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate("/student/quiz")}
          >
            <div className="relative z-20 max-w-[60%]">
              <h3 className="text-white text-lg font-bold leading-tight">Test your knowledge <br />and learn new things.</h3>
              <div className="mt-5 px-7 py-2.5 bg-white text-[#7A41F7] rounded-full text-sm font-bold shadow-md inline-block">Start Quiz</div>
            </div>
            <div className="absolute right-[-5%] top-28 -translate-y-1/2 w-44 h-44 rounded-full bg-white/15 z-0" />
            <img src="./student/tests.svg" alt="Quiz illustration" className="absolute right-2 bottom-2 w-32 z-10 object-contain" />
          </div>
        </div>

        {/* Discover Quiz */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[16px] font-bold text-slate-800">Discover Quiz</h4>
            <button onClick={() => navigate("/student/library")} className="text-xs font-semibold text-[#7A41F7] flex items-center gap-1">See all <ChevronRight size={14} /></button>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {quizzes.map((quiz, index) => (
              <div key={index} onClick={() => navigate(`/student/quiz?subj=${quiz.subj}`)} className={`${quiz.color} min-w-[260px] rounded-[2.5rem] p-7 flex-shrink-0 cursor-pointer transition-transform active:scale-95`}>
                <div className="flex gap-2 mb-8">
                  <div className={`${quiz.badge} px-4 py-2 rounded-full flex items-center gap-2 text-[12px] font-bold text-slate-500/80`}>{quiz.icon}{quiz.tag}</div>
                  <div className={`${quiz.badge} px-4 py-2 rounded-full text-[12px] font-bold text-slate-500/80 flex items-center gap-1`}><BarChart2 size={16} />Hard</div>
                </div>
                <h5 className="text-[22px] font-black text-slate-900 mb-8 tracking-tight">{quiz.name}</h5>
                <div className="flex items-center gap-8 text-[13px] font-bold text-slate-400">
                  <span>{quiz.questions} Questions</span>
                  <span>{quiz.players} Players</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Tests — shimmer on mobile */}
        <div className="px-4 mt-10 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[16px] font-bold text-slate-800">Scheduled Tests</h4>
            {!testsLoading && tests.length > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-1 bg-orange-100 text-orange-600 rounded-lg">{tests.length} Test Live Now</span>
            )}
          </div>
          {testsLoading ? (
            <div className="space-y-4">
              <MobileTestRowSkeleton />
              <MobileTestRowSkeleton />
            </div>
          ) : tests.length > 0 ? (
            <div className="space-y-4">
              {tests.map((t) => (
                <div key={t._id} className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#F8F7FF] flex items-center justify-center flex-shrink-0 border border-slate-100"><Clock className="text-[#7A41F7]" size={20} /></div>
                    <div className="min-w-0">
                      <h5 className="text-[15px] font-bold text-slate-900 truncate">{t.title}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-slate-400">{t.duration} Mins</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[11px] font-bold text-[#7A41F7]">Online Exam</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/student/test/${t._id}`)} className="group flex items-center gap-2 px-6 py-3 bg-[#7A41F7] hover:bg-[#6832E3] text-white rounded-2xl text-[13px] font-bold transition-all active:scale-95 shadow-lg shadow-purple-100">
                    Start <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm"><ClipboardCheck className="text-slate-300" size={24} /></div>
              <p className="text-sm font-bold text-slate-400">No active tests scheduled</p>
              <p className="text-[11px] text-slate-300">Check back later for updates</p>
            </div>
          )}
        </div>

        {/* Completed Tests CTA */}
        <div className="px-4 -mb-20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[16px] font-semibold text-[#1E1E2D]">Completed Tests</h4>
            <button onClick={() => navigate("/student/history")} className="text-[14px] font-semibold text-[#7A41F7]">See all</button>
          </div>
          <div onClick={() => navigate("/student/history")} className="group relative bg-[#DDCEFD] p-4 rounded-[1.8rem] border border-[#F0F0F5] shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#F1EBFE] rounded-full opacity-40" />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[1.2rem] bg-[#7A41F7] flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-200">
                <div className="relative">
                  <History className="text-white" size={24} />
                  <div className="absolute -right-1 -top-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#7A41F7]" />
                </div>
              </div>
              <div>
                <h5 className="text-[16px] font-bold text-[#1E1E2D] leading-tight">Test History</h5>
                <p className="text-[13px] font-medium text-[#7A41F7]/70 mt-1">View detailed analysis • Performance</p>
              </div>
            </div>
            <div className="pr-2"><ChevronRight className="text-[#7A41F7] group-hover:translate-x-1 transition-transform" size={20} /></div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP / TABLET LAYOUT
      ══════════════════════════════════════════ */}
      <div className="hidden md:block max-w-7xl mx-auto px-8 lg:px-8 xl:px-24 2xl:px-20 py-8">

        {/* ── Stats Bar ── */}
        <FakeStatsBar />

        {/* ── Hero + Leaderboard Row ── */}
        {rankLoading ? (
          <HeroRowSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Hero → profile */}
            <div
              className="col-span-2 relative bg-[#7A41F7] rounded-3xl p-10 flex items-center min-h-[220px] overflow-hidden cursor-pointer group"
              onClick={() => navigate("/student/quiz")}
            >
              <div className="relative z-20 max-w-[55%]">
                <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">Ready to learn?</p>
                <h3 className="text-white text-3xl font-black leading-tight mb-6">Test your knowledge <br />and learn new things.</h3>
                <div className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#7A41F7] rounded-full text-sm font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all pointer-events-none">
                  Start Quiz <ArrowRight size={16} />
                </div>
              </div>
              <div className="absolute right-[-3%] top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/10 z-0" />
              <div className="absolute right-[-6%] top-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-white/10 z-0" />
              <img src="./student/tests.svg" alt="Quiz illustration" className="absolute right-8 bottom-0 w-44 z-10 object-contain" />
            </div>

            {/* Top Rank Card */}
            <div
              className="relative bg-[#7A41F7] rounded-3xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
              onClick={() => navigate("/student/leaderboard")}
            >
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
                <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
                  <circle cx="160" cy="120" r="90" stroke="white" strokeWidth="2" />
                  <circle cx="160" cy="120" r="60" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Leaderboard</p>
                <h4 className="text-white text-lg font-bold">Top rank of the week</h4>
              </div>
              <div className="mt-6"><TopRankContent large={true} /></div>
              <div className="relative z-10 mt-4 ml-auto w-9 h-9 rounded-full border border-white/30 flex items-center justify-center">
                <ChevronRight className="text-white" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* ── Discover Quiz ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-xl font-bold text-slate-800">Discover Quiz</h4>
            <button onClick={() => navigate("/student/library")} className="text-sm font-semibold text-[#7A41F7] flex items-center gap-1 hover:gap-2 transition-all">See all <ChevronRight size={16} /></button>
          </div>
          {/* Quiz cards don't depend on async data — show immediately */}
          <div className="grid grid-cols-4 gap-5">
            {quizzes.map((quiz, index) => (
              <div key={index} onClick={() => navigate(`/student/quiz?subj=${quiz.subj}`)} className={`${quiz.color} rounded-3xl p-6 cursor-pointer hover:scale-[1.03] active:scale-95 transition-transform`}>
                <div className="flex gap-2 mb-6 flex-wrap">
                  <div className={`${quiz.badge} px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-slate-500/80`}>{quiz.icon}{quiz.tag}</div>
                  <div className={`${quiz.badge} px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-500/80 flex items-center gap-1`}><BarChart2 size={14} />Hard</div>
                </div>
                <h5 className="text-xl font-black text-slate-900 mb-5 tracking-tight leading-tight">{quiz.name}</h5>
                <div className="flex flex-col gap-1 text-[12px] font-bold text-slate-400">
                  <span>{quiz.questions} Questions</span>
                  <span>{quiz.players} Players</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom: Scheduled Tests + Sidebar ── */}
        <div className="grid grid-cols-3 gap-6">

          {/* Scheduled Tests */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-xl font-bold text-slate-800">Scheduled Tests</h4>
              {!testsLoading && tests.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  {tests.length} Live Now
                </span>
              )}
            </div>

            {testsLoading ? (
              <div className="space-y-3">
                <TestRowSkeleton />
                <TestRowSkeleton />
                <TestRowSkeleton />
              </div>
            ) : tests.length > 0 ? (
              <div className="space-y-3">
                {tests.map((t, idx) => (
                  <div key={t._id} className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-[#F3EBFF] flex items-center justify-center text-[#7A41F7] font-black text-sm flex-shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#F8F7FF] flex items-center justify-center flex-shrink-0 border border-slate-100">
                      <Clock className="text-[#7A41F7]" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[15px] font-bold text-slate-900 truncate group-hover:text-[#7A41F7] transition-colors">{t.title}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">{t.duration} Mins</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[11px] font-bold text-[#7A41F7] bg-purple-50 px-2 py-0.5 rounded-full">Online Exam</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/student/test/${t._id}`)}
                      className="group/btn flex items-center gap-2 px-5 py-2.5 bg-[#7A41F7] hover:bg-[#6832E3] text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-purple-100 flex-shrink-0"
                    >
                      Start <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <ClipboardCheck className="text-slate-300" size={28} />
                </div>
                <p className="text-sm font-bold text-slate-400">No active tests scheduled</p>
                <p className="text-xs text-slate-300 mt-1">Check back later for updates</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-slate-800">Completed Tests</h4>
                <button onClick={() => navigate("/student/history")} className="text-sm font-semibold text-[#7A41F7]">See all</button>
              </div>
              <div
                onClick={() => navigate("/student/history")}
                className="group relative bg-gradient-to-br from-[#7A41F7] to-[#9B6AF9] p-6 rounded-3xl shadow-lg shadow-purple-200/50 flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden min-h-[170px]"
              >
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <History className="text-white" size={22} />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-white leading-tight">Test History</h5>
                    <p className="text-xs font-medium text-white/70 mt-0.5">Performance & Analysis</p>
                  </div>
                </div>
                <div className="relative z-10 mt-5 flex items-center justify-between">
                  <p className="text-xs font-medium text-white/60">View detailed results →</p>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="text-white" size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">Quick Links</p>
              <div className="space-y-1">
                {[
                  { label: "My Library", icon: <BookOpen size={16} />, path: "/student/library" },
                  { label: "Leaderboard", icon: <Trophy size={16} />, path: "/student/leaderboard" },
                  { label: "My Progress", icon: <TrendingUp size={16} />, path: "/student/history" },
                ].map((link, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(link.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-[#F3EBFF] hover:text-[#7A41F7] transition-all text-sm font-semibold group/link"
                  >
                    <span className="text-slate-400 group-hover/link:text-[#7A41F7] transition-colors">{link.icon}</span>
                    {link.label}
                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover/link:text-[#7A41F7] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      <StudentDashboardOverlays user={user} resolveMediaUrl={resolveMediaUrl} />


    </div>
  );
}