import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  // Navigation & UI Elements
  Search,
  Bell,
  ChevronRight,
  ArrowRight,
  // Feature & Status Icons
  ClipboardCheck,
  History,
  Clock,
  Loader2,
  // Subject & Category Icons
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BarChart2 // Added for the 'Hard' difficulty badge
} from "lucide-react";
import StudentHeader from "./StudentHeader";

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
        setTests(res.data?.tests || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTests();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] pb-24">

      {/* ===== DESKTOP HEADER ===== */}
      <div className="hidden md:block">
        <StudentHeader />
      </div>

      {/* ===== MOBILE / TABLET HEADER ===== */}
      <div className="md:hidden  px-4 pt-6">
        <div className="flex items-center justify-between">
          {/* Left Side: Avatar and Welcome Text */}
          <div className="flex items-center gap-3">
            {/* Profile Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[#7A41F7] font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
              )}
            </div>

            {/* Welcome Message */}
            <div>
              <p className="text-[13px] text-slate-500 font-medium leading-tight">Welcome</p>
              <h2 className="text-[16px] font-bold text-slate-900 leading-tight">
                {user?.name || "Student"}
              </h2>
            </div>
          </div>

          {/* Right Side: Action Icons */}
          <div className="flex items-center gap-2">
            {/* Notification Button */}
            <button className="p-2.5 bg-slate-50 rounded-full text-slate-600 active:bg-slate-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => handleLogout()} // Ensure you have your logout logic defined
              className="p-2.5 bg-slate-50 rounded-full text-[#7A41F7] active:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>



      <div className="flex flex-col pb-24 xl:mx-52">
        <div className="px-4 mt-8">
        <h4 className="text-[16px] font-bold text-slate-800 mb-3">Top rank of the week</h4>

        <div
          className="relative bg-[#7A41F7] rounded-[2rem] p-5 flex items-center justify-between overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/student/leaderboard")}
        >
          {/* Decorative Background Swirls */}
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
            <svg width="150" height="100" viewBox="0 0 150 100" fill="none">
              <circle cx="120" cy="80" r="60" stroke="white" strokeWidth="2" />
              <circle cx="120" cy="80" r="40" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {/* Rank Number Ring */}
            <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center text-white text-xs font-bold">
              1
            </div>

            {/* Avatar with Flag Badge */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-pink-200 border-2 border-white/20 overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Brandon"
                  alt="Top student"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Small Flag Indicator (matching the image) */}
              <div className="absolute -right-1 -bottom-1 w-6 h-4 bg-white rounded-sm overflow-hidden border border-white shadow-sm">
                <div className="h-1/2 bg-[#D91E18]" /> {/* Red part for simple flag placeholder */}
              </div>
            </div>

            {/* Student Info */}
            <div className="text-white">
              <p className="text-[15px] font-bold">Brandon Matrovs</p>
              <p className="text-[12px] opacity-80 font-medium">124 points</p>
            </div>
          </div>

          {/* Gold Crown Hexagon Badge */}
          <div className="relative z-10 flex items-center justify-center w-10 h-10">
            <div className="absolute inset-0 bg-[#FFD700] clip-path-hexagon shadow-lg"
              style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white relative z-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
            </svg>
          </div>
        </div>
      </div>


      <div className="px-4 mt-6">
        <div
          className="
      relative
      bg-[#7A41F7]
      rounded-3xl
      p-8
      flex items-center
      min-h-[160px]
      overflow-hidden
    "
        >
          {/* ===== LEFT CONTENT ===== */}
          <div className="relative z-20 max-w-[60%]">
            <h3 className="text-white text-lg font-bold leading-tight">
              Test your knowledge <br />
              and learn new things.
            </h3>

            <button
              onClick={() => navigate("/student/library")}
              className="
          mt-5
          px-7 py-2.5
          bg-white
          text-[#7A41F7]
          rounded-full
          text-sm
          font-bold
          shadow-md
          active:scale-95 transition-transform
        "
            >
              Start Quiz
            </button>
          </div>

          {/* ===== RIGHT CIRCLE BACKGROUND ===== */}
          {/* Positioned to act as a frame for the illustration */}
          <div
            className="
        absolute
        right-[-5%]
        top-28
        -translate-y-1/2
        w-44 h-44
        rounded-full
        bg-white/15
        z-0
      "
          />

          {/* ===== ILLUSTRATION ===== */}
          <img
            src="/student/tests.svg"
            alt="Quiz illustration"
            className="
        absolute
        right-2
        bottom-2
        w-32
        z-10
        object-contain
      "
          />
        </div>
      </div>


      {/* ===== QUICK ACTIONS ===== */}
      <div className="px-4 mt-8">
        {/* Header with "See all" */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[16px] font-bold text-slate-800">Discover Quiz</h4>
          <button
            onClick={() => navigate("/student/library")}
            className="text-xs font-semibold text-[#7A41F7] flex items-center gap-1"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>

        {/* Horizontal Scroller */}
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          {[
            { name: "Physics Quiz", color: "bg-[#EBF3FF]", badge: "bg-[#D1E5FF]", tag: "Physics", icon: <Atom size={18} />, questions: 10, players: "20k+" },
            { name: "Chemistry Quiz", color: "bg-[#FFF4EB]", badge: "bg-[#FFE9D6]", tag: "Chemistry", icon: <FlaskConical size={18} />, questions: 15, players: "12k+" },
            { name: "Math Quiz", color: "bg-[#F3EBFF]", badge: "bg-[#E6D6FF]", tag: "Math", icon: <Calculator size={18} />, questions: 20, players: "15k+" },
            { name: "Biology Quiz", color: "bg-[#EBFDEB]", badge: "bg-[#D6F7D6]", tag: "Biology", icon: <Dna size={18} />, questions: 12, players: "8k+" },
          ].map((quiz, index) => (
            <div
              key={index}
              onClick={() => navigate(`/student/quiz/${quiz.tag.toLowerCase()}`)}
              className={`${quiz.color} min-w-[260px] rounded-[2.5rem] p-7 flex-shrink-0 cursor-pointer transition-transform active:scale-95`}
            >
              {/* Badges Section - Matching image colors */}
              <div className="flex gap-2 mb-8">
                <div className={`${quiz.badge} px-4 py-2 rounded-full flex items-center gap-2 text-[12px] font-bold text-slate-500/80`}>
                  {quiz.icon}
                  {quiz.tag}
                </div>
                <div className={`${quiz.badge} px-4 py-2 rounded-full text-[12px] font-bold text-slate-500/80 flex items-center gap-1`}>
                  <BarChart2 size={16} />
                  Hard
                </div>
              </div>

              {/* Title - Larger and bolder */}
              <h5 className="text-[22px] font-black text-slate-900 mb-8 tracking-tight">
                {quiz.name}
              </h5>

              {/* Stats - Neutral color with specific spacing */}
              <div className="flex items-center gap-8 text-[13px] font-bold text-slate-400">
                <span>{quiz.questions} Questions</span>
                <span>{quiz.players} Players</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SCHEDULED TESTS ===== */}
      <div className="px-4 mt-10 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[16px] font-bold text-slate-800">Scheduled Tests</h4>
          {tests.length > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-1 bg-orange-100 text-orange-600 rounded-lg">
              {tests.length} Test Live Now
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin text-[#7A41F7]" />
          </div>
        ) : tests.length > 0 ? (
          <div className="space-y-4">
            {tests.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Subject-based Icon Container */}
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F7FF] flex items-center justify-center flex-shrink-0 border border-slate-100">
                    <Clock className="text-[#7A41F7]" size={20} />
                  </div>

                  <div className="min-w-0">
                    <h5 className="text-[15px] font-bold text-slate-900 truncate">
                      {t.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-slate-400">
                        {t.duration} Mins
                      </span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[11px] font-bold text-[#7A41F7]">
                        Online Exam
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/test/${t._id}`)}
                  className="group flex items-center gap-2 px-6 py-3 bg-[#7A41F7] hover:bg-[#6832E3] text-white rounded-2xl text-[13px] font-bold transition-all active:scale-95 shadow-lg shadow-purple-100"
                >
                  Start
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <ClipboardCheck className="text-slate-300" size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400">No active tests scheduled</p>
            <p className="text-[11px] text-slate-300">Check back later for updates</p>
          </div>
        )}
      </div>

      {/* ===== ANALYTICS CTA ===== */}
      <div className="px-4  -mb-20">
        {/* Section Header with exact font sizing */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[16px] font-semibold text-[#1E1E2D]">Completed Tests</h4>
          <button
            onClick={() => navigate("/student/history")}
            className="text-[14px] font-semibold text-[#7A41F7]"
          >
            See all
          </button>
        </div>

        {/* Analytics CTA Card */}
        <div
          onClick={() => navigate("/student/history")}
          className="
      group
      relative
      bg-[#DDCEFD] 
      p-4 
      rounded-[1.8rem] 
      border border-[#F0F0F5]
      shadow-sm
      flex items-center justify-between
      cursor-pointer
      active:scale-[0.98] transition-all
      overflow-hidden
    "
        >
          {/* Decorative background flare using Primary / 50 (#F1EBFE) */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#F1EBFE] rounded-full opacity-40" />

          <div className="flex items-center gap-4">
            {/* Subject-style Icon Container using Primary / main (#7A41F7) */}
            <div className="w-16 h-16 rounded-[1.2rem] bg-[#7A41F7] flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-200">
              <div className="relative">
                <History className="text-white" size={24} />
                {/* Subtle status indicator */}
                <div className="absolute -right-1 -top-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#7A41F7]" />
              </div>
            </div>

            <div>
              {/* Exact typography hierarchy from reference */}
              <h5 className="text-[16px] font-bold text-[#1E1E2D] leading-tight">
                Test History
              </h5>
              <p className="text-[13px] font-medium text-[#7A41F7]/70 mt-1">
                View detailed analysis • Performance
              </p>
            </div>
          </div>

          {/* Integrated Chevron Navigation */}
          <div className="pr-2">
            <ChevronRight
              className="text-[#7A41F7]  group-hover:translate-x-1 transition-transform"
              size={20}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
