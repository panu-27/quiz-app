import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  ChevronRight, ArrowRight, ClipboardCheck, History,
  Clock, Atom, FlaskConical, Calculator, Dna, BarChart2,
  Trophy, BookOpen, Search, Gift, Phone, ChevronDown,
  ThumbsUp, ThumbsDown, Star, PlaySquare, Book, FileText,
  ShoppingBag, Moon, Sun, CheckCircle2, PlayCircle, TrendingUp, NotebookText, Play, BrainCircuit, ArrowUp,
} from "lucide-react";
import StudentHeader from "./StudentHeader";
import { FakeStatsBar } from "./StudentDashboardOverlays";
import StudentDashboardOverlays from "./StudentDashboardOverlays";
import { PYQ_SUBJECTS } from "./pyqData";
import GoalModal from "./GoalModal";
import LockScreen from "./LockScreen";

const socials = [
  {
    name: "YouTube",
    url: "https://youtube.com",
    icon: (
      <svg className="w-4 h-4 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.388.555a3.003 3.003 0 0 0-2.11 2.108C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.484 20.5 12 20.5 12 20.5s7.516 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  },
  {
    name: "Instagram",
    url: "https://instagram.com",
    icon: (
      <svg className="w-4 h-4 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    )
  },
  {
    name: "Telegram",
    url: "https://telegram.org",
    icon: (
      <svg className="w-4 h-4 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.598 0 11.944-5.347 11.944-11.944C23.888 5.347 18.542 0 11.944 0zm5.66 8.358l-1.913 9.019c-.14.629-.514.784-1.039.49l-2.918-2.15-1.408 1.354c-.156.156-.287.287-.589.287l.21-2.969 5.4-4.88c.235-.208-.051-.324-.365-.115l-6.674 4.201-2.879-.901c-.626-.196-.639-.626.13-.925l11.25-4.333c.52-.19 1.002.135.838.932z" />
      </svg>
    )
  },
  {
    name: "Facebook",
    url: "https://facebook.com",
    icon: (
      <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com",
    icon: (
      <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
      </svg>
    )
  },
  {
    name: "WhatsApp",
    url: "https://whatsapp.com",
    icon: (
      <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.953.01c3.177 0 6.162 1.241 8.41 3.493 2.25 2.25 3.488 5.24 3.487 8.419-.004 6.544-5.342 11.884-11.898 11.884-2.008 0-3.978-.51-5.733-1.482L0 24zm6.292-3.73l.361.214c1.546.917 3.325 1.4 5.242 1.4 5.373 0 9.745-4.373 9.749-9.75.002-2.607-1.012-5.059-2.859-6.907C16.945 3.38 14.5 2.36 11.951 2.36c-5.38 0-9.754 4.372-9.757 9.75-.001 2.024.529 4.004 1.536 5.748l.235.408L3.03 21.3l4.319-1.03z" />
      </svg>
    )
  }
];

/* ══════════════════════════════════════════════════════
   MODULE-LEVEL CACHE  (survives re-mounts, cleared on hard refresh)
   ══════════════════════════════════════════════════════ */
const _cache = {
  tests: null,
  topRank: null,
};

/* ══════════════════════════════════════════════════════
   SHIMMER PRIMITIVES
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
const ShimmerCSS = () => (
  <style>{`
    @keyframes yt-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);
const Sk = ({ className = "", purple = false }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const shimmerBaseLight = {
    backgroundImage: "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
    backgroundSize: "200% 100%",
    animation: "yt-shimmer 1.5s infinite linear",
  };
  const shimmerBaseDark = {
    backgroundImage: "linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
    backgroundSize: "200% 100%",
    animation: "yt-shimmer 1.5s infinite linear",
  };
  return (
    <div
      className={`rounded-xl ${className}`}
      style={purple ? shimmerPurple : (isDark ? shimmerBaseDark : shimmerBaseLight)}
    />
  );
};
const StatsBarSkeleton = () => (
  <div className="grid grid-cols-3 gap-5 mb-8">
    {[0, 1, 2].map(i => (
      <div key={i} className="bg-white dark:bg-[#121A28] rounded-2xl p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-800">
        <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2"><Sk className="h-6 w-14" /><Sk className="h-3 w-28" /><Sk className="h-3 w-16" /></div>
      </div>
    ))}
  </div>
);
const HeroRowSkeleton = () => (
  <div className="grid grid-cols-3 gap-6 mb-8">
    <Sk className="col-span-2 h-[220px] rounded-3xl" />
    <Sk className="h-[220px] rounded-3xl" />
  </div>
);
const QuizGridSkeleton = () => (
  <div className="grid grid-cols-4 gap-5">
    {[0, 1, 2, 3].map(i => (
      <div key={i} className="bg-white dark:bg-[#121A28] rounded-3xl p-6 space-y-4 border border-slate-100 dark:border-slate-800">
        <div className="flex gap-2"><Sk className="h-7 w-20 rounded-full" /><Sk className="h-7 w-14 rounded-full" /></div>
        <Sk className="h-5 w-4/5" /><Sk className="h-3 w-1/2" /><Sk className="h-3 w-1/3" />
      </div>
    ))}
  </div>
);
const TestRowSkeleton = () => (
  <div className="flex items-center gap-3 bg-white dark:bg-[#121A28] p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
    <Sk className="w-8 h-8 rounded-xl flex-shrink-0" />
    <Sk className="w-11 h-11 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2"><Sk className="h-4 w-2/3" /><Sk className="h-3 w-1/3" /></div>
    <Sk className="w-20 h-9 rounded-xl flex-shrink-0" />
  </div>
);
const TopRankMobileSkeleton = () => (
  <div className="relative bg-[#7A41F7] rounded-[2rem] p-5 overflow-hidden min-h-[80px]">
    <div className="flex items-center gap-4">
      <Sk className="w-8 h-8 rounded-full" purple />
      <Sk className="w-14 h-14 rounded-full" purple />
      <div className="space-y-2"><Sk className="h-4 w-32 rounded-lg" purple /><Sk className="h-3 w-20 rounded" purple /></div>
    </div>
  </div>
);
const MobileTestRowSkeleton = () => (
  <div className="flex items-center justify-between bg-white dark:bg-[#121A28] p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-4 flex-1">
      <Sk className="w-10 h-10 rounded-2xl flex-shrink-0" />
      <div className="space-y-2 flex-1"><Sk className="h-4 w-3/4" /><Sk className="h-3 w-1/2" /></div>
    </div>
    <Sk className="w-16 h-8 rounded-2xl flex-shrink-0 ml-4" />
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [selectedGoal, setSelectedGoal] = useState(localStorage.getItem("selectedGoal") || "");
  const [isGoalExpanded, setIsGoalExpanded] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  const reviews = [
    { name: "Honey", goal: "IIT JEE", text: "excellent experience ever......... just as offline classes occur at home 🏠🏠🏠🏠......... thank you for your support 💪💪💪... and also thanks all excellent teachers..." },
    { name: "Arjun Sharma", goal: "IIT JEE 2025", text: "The mock tests and live classes completely changed how I prepare. Got AIR 312! Highly recommend to everyone preparing." },
    { name: "Priya Verma", goal: "NEET 2025", text: "Best platform for NEET prep. The PYQ books and analytics helped me score 680+. Thank you for the amazing support!" },
    { name: "Rahul Patil", goal: "MHT-CET 2025", text: "Teachers are amazing! Cleared MHT-CET with 99.2 percentile. The study plan and tests kept me on track the whole year." }
  ];

  const resultsScrollRef = useRef(null);
  const resultsPosters = [
    "/student/results_1.png",
    "/student/results_2.png",
    "/student/results_3.png"
  ];

  useEffect(() => {
    if (!selectedGoal) return;
    const interval = setInterval(() => {
      const el = resultsScrollRef.current;
      if (!el) return;
      const totalWidth = el.scrollWidth;
      const currentScroll = el.scrollLeft;
      const viewWidth = el.clientWidth;

      if (currentScroll + viewWidth >= totalWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: currentScroll + viewWidth, behavior: "smooth" });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedGoal]);

  useEffect(() => {
    if (showCounsellorModal) {
      document.body.setAttribute('data-hide-nav', 'true');
    } else {
      document.body.removeAttribute('data-hide-nav');
    }
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, [showCounsellorModal]);

  const banners = [
    {
      title: theme === 'dark' ? 'Phoenix SRG Batch' : 'Phoenix Elite Batch',
      subtitle: `for ${selectedGoal || "IIT JEE"}`,
      details: "650+ Live Lectures | 15+ Tests | Droppers",
      cta: "Enroll Now",
      badgeIcon: (
        <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badgeText: `Batch starts on ${theme === 'dark' ? '20th' : '15th'} April`,
      teachers: ["Teacher1", "Teacher2", "Teacher3"],
      footerNote: "T&C apply, as available on the platform",
      bgImage: "/student/red_nebula_bg.png"
    },
    {
      title: "National Scholarship Test",
      subtitle: `Win up to 90% scholarship!`,
      details: "Syllabus: Physics, Chemistry, Mathematics & Logic",
      cta: "Register Free",
      badgeIcon: (
        <Trophy className="w-4 h-4 text-yellow-400" />
      ),
      badgeText: "Every Sunday | Online Mode",
      teachers: ["Teacher4", "Teacher5", "Teacher6"],
      footerNote: "*Applicable for all selected goal programs",
      bgColorLight: "from-[#0B4F30] to-[#052818]",
      bgColorDark: "from-[#052416] to-[#02100A]"
    },
    {
      title: "1-on-1 Mentorship Slot",
      subtitle: "Guidance from top rankers",
      details: "Mock test strategy | Study plan customization",
      cta: "Book Free Slot",
      badgeIcon: (
        <Clock className="w-4 h-4 text-emerald-400" />
      ),
      badgeText: "Duration: 30 mins live 1:1 call",
      teachers: ["Teacher7", "Teacher8", "Teacher1"],
      footerNote: "Only 10 slots left for today!",
      bgColorLight: "from-[#3B1C78] to-[#1D0C40]",
      bgColorDark: "from-[#190C34] to-[#0A0418]"
    },
    {
      title: "Custom Image Promo",
      image: "/student/edu_banner_ad.png",
      bgColorLight: "from-[#1F1F38] to-[#0D0D1C]",
      bgColorDark: "from-[#0F0F1B] to-[#06060F]",
      link: "/student/library"
    }
  ];

  const handleBannerScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveBannerIndex(index);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 80);
      if (window.scrollY > 10) {
        setIsGoalExpanded(prev => {
          if (prev) return false;
          return prev;
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useDarkText = theme === 'light' && (isHeaderScrolled || !selectedGoal);

  const selectGoal = (goal) => {
    localStorage.setItem("selectedGoal", goal);
    setSelectedGoal(goal);
    setIsGoalExpanded(false);
    window.location.reload();
  };

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = window.__API_URL__
      ? window.__API_URL__.replace(/\/api$/, '')
      : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    return `${base}${url}`;
  };

  const [tests, setTests] = useState(_cache.tests ?? []);
  const [testsLoading, setTestsLoading] = useState(_cache.tests === null);
  const [topRankName, setTopRankName] = useState(_cache.topRank?.name ?? "Brandon Matrovs");
  const [topRankPic, setTopRankPic] = useState(_cache.topRank?.pic ?? null);
  const [rankLoading, setRankLoading] = useState(_cache.topRank === null);
  const [stats, setStats] = useState({ attempted: "_", scheduled: _cache.tests?.length ?? 0, completed: "_" });
  const [statsLoading, setStatsLoading] = useState(_cache.tests === null);

  useEffect(() => {
    if (_cache.tests !== null) {
      setTests(_cache.tests);
      setTestsLoading(false);
      setStatsLoading(false);
    } else {
      const fetchMyTests = async () => {
        try {
          const res = await api.get("/student/my-tests");
          const list = res.data?.tests || res.data || [];
          _cache.tests = list;
          setTests(list);
          setStats(prev => ({ ...prev, scheduled: list.length }));
        } catch (err) {
          console.error("my-tests failed", err);
          _cache.tests = [];
        } finally {
          setTestsLoading(false);
          setStatsLoading(false);
        }
      };
      fetchMyTests();
    }
    if (_cache.topRank !== null) {
      setTopRankName(_cache.topRank.name);
      setTopRankPic(_cache.topRank.pic);
      setRankLoading(false);
    } else {
      const fetchTopRank = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await api.get("/leaderboard/stats/top-one", { headers: { Authorization: `Bearer ${token}` } });
          const name = res.data?.name || res.data?.studentName || res.data?.student?.name;
          const pic = res.data?.avatar || res.data?.student?.avatar;
          _cache.topRank = { name: name || "Brandon Matrovs", pic: pic || null };
          if (name) setTopRankName(name);
          if (pic) setTopRankPic(pic);
        } catch {
          _cache.topRank = { name: "Brandon Matrovs", pic: null };
        } finally {
          setRankLoading(false);
        }
      };
      fetchTopRank();
    }
  }, []);

  const handleLogout = () => {
    _cache.tests = null;
    _cache.topRank = null;
    localStorage.clear();
    window.location.href = "/";
  };

  const quizzes = [
    { name: "Physics Quiz", color: "bg-[#EBF3FF] dark:bg-[#1A233A]", badge: "bg-[#D1E5FF] dark:bg-[#253250]", tag: "Physics", icon: <Atom size={18} />, chapters: 28, pyq: "1.2k", subj: "physics" },
    { name: "Chemistry Quiz", color: "bg-[#FFF4EB] dark:bg-[#3A241A]", badge: "bg-[#FFE9D6] dark:bg-[#503225]", tag: "Chemistry", icon: <FlaskConical size={18} />, chapters: 28, pyq: "1.3k+", subj: "chemistry" },
    { name: "Math Quiz", color: "bg-[#F3EBFF] dark:bg-[#231A3A]", badge: "bg-[#E6D6FF] dark:bg-[#322550]", tag: "Math", icon: <Calculator size={18} />, chapters: 25, pyq: "1.5k+", subj: "maths" },
    { name: "Biology Quiz", color: "bg-[#EBFDEB] dark:bg-[#1A3A23]", badge: "bg-[#D6F7D6] dark:bg-[#255032]", tag: "Biology", icon: <Dna size={18} />, chapters: 27, pyq: "1.8k+", subj: "biology" },
  ];

  const TopRankContent = ({ large = false }) => (
    <div className="flex items-center gap-2 relative z-10">
      <div className={`${large ? "w-10 h-10 text-sm" : "w-7 h-7 text-xs"} rounded-full border-2 border-white/40 flex items-center justify-center text-white font-bold flex-shrink-0 -ml-3`}>#1</div>
      <div className="relative flex-shrink-0">
        <div className={`${large ? "w-16 h-16" : "w-14 h-14"} rounded-full bg-pink-200 border-2 border-white/20 overflow-hidden`}>
          <img src={topRankPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(topRankName)}`} alt="Top student" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="text-white min-w-0 flex-1 pr-12">
        <p className={`${large ? "text-base" : "text-[15px]"} font-bold truncate`}>{topRankName}</p>
        <p className="text-[12px] opacity-70 font-medium">Top of the week 🏆</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen overflow-x-hidden bg-[#F0F4F9] dark:bg-[#0B101A] text-slate-900 dark:text-white transition-colors duration-300 ${user?.approved === false ? 'pb-52' : 'pb-32'}`}>
      <ShimmerCSS />

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════ */}
      <div className="hidden md:block">
        <StudentHeader />
        {!selectedGoal ? (
          <LockScreen onOpenGoalModal={() => setIsGoalModalOpen(true)} />
        ) : (
          <div className="max-w-7xl mx-auto px-8 lg:px-8 xl:px-24 2xl:px-20 py-8">
            <div className="flex justify-end mb-4">
              <button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
                <span className="text-sm font-semibold dark:text-white">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
            <FakeStatsBar />
            {/* Desktop Banner Row */}
            <div className="mb-8">
              <div className="relative bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-3xl p-10 flex items-center min-h-[220px] overflow-hidden cursor-pointer group shadow-xl" onClick={() => navigate("/student/quiz")}>
                <div className="relative z-20 max-w-[65%]">
                  <p className="text-[#FFC000] text-xs font-bold uppercase tracking-wider mb-2">Ready to learn?</p>
                  <h3 className="text-white text-3xl font-black leading-tight mb-6">Test your knowledge <br />and learn new things.</h3>
                  <div className="inline-flex items-center gap-2 px-8 py-3 bg-[#FFC000] text-black rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-all">
                    Start Quiz <ArrowRight size={16} />
                  </div>
                </div>
                <div className="absolute right-[-3%] top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/5 z-0" />
                <img src="/student/tests.svg" alt="Quiz illustration" className="absolute right-8 bottom-0 w-44 z-10 object-contain" />
              </div>
            </div>

            {/* Desktop Scheduled Tests & Sidebar */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white">Scheduled Tests</h4>
                  {!testsLoading && tests.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-lg">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />{tests.length} Live Now
                    </span>
                  )}
                </div>
                {testsLoading ? (
                  <div className="space-y-3"><TestRowSkeleton /><TestRowSkeleton /><TestRowSkeleton /></div>
                ) : tests.length > 0 ? (
                  <div className="space-y-3">
                    {tests.map((t, idx) => (
                      <div key={t._id} className="flex items-center gap-3 bg-white dark:bg-[#121A28] p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-purple-100 dark:hover:border-purple-900/50 transition-all group">
                        <div className="w-8 h-8 rounded-xl bg-[#F3EBFF] dark:bg-purple-950/40 flex items-center justify-center text-[#7A41F7] dark:text-[#9B6AF9] font-black text-sm flex-shrink-0">{String(idx + 1).padStart(2, "0")}</div>
                        <div className="w-11 h-11 rounded-xl bg-[#F8F7FF] dark:bg-purple-950/20 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-800"><Clock className="text-[#7A41F7] dark:text-[#9B6AF9]" size={18} /></div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[15px] font-bold text-slate-900 dark:text-white truncate group-hover:text-[#7A41F7] dark:group-hover:text-[#9B6AF9] transition-colors">{t.title}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{t.duration} Mins</span>
                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <span className="text-[11px] font-bold text-[#7A41F7] dark:text-[#9B6AF9] bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full">Online Exam</span>
                          </div>
                        </div>
                        <button onClick={() => navigate(`/student/test/${t._id}`)} className="group/btn flex items-center gap-2 px-5 py-2.5 bg-[#7A41F7] dark:bg-[#6832E3] hover:bg-[#6832E3] dark:hover:bg-[#5727C6] text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md shadow-purple-100 dark:shadow-none flex-shrink-0">
                          Start <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-[#121A28] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm"><ClipboardCheck className="text-slate-300 dark:text-slate-600" size={28} /></div>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No active tests scheduled</p>
                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Check back later for updates</p>
                  </div>
                )}
              </div>
              {/* Right Sidebar */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">Completed Tests</h4>
                    <button onClick={() => navigate("/student/history")} className="text-sm font-semibold text-[#7A41F7] dark:text-[#9B6AF9]">See all</button>
                  </div>
                  <div onClick={() => navigate("/student/history")} className="group relative bg-gradient-to-br from-[#7A41F7] to-[#9B6AF9] p-6 rounded-3xl shadow-lg shadow-purple-200/50 dark:shadow-none flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden min-h-[170px]">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
                    <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"><History className="text-white" size={22} /></div>
                      <div><h5 className="text-base font-bold text-white leading-tight">Test History</h5><p className="text-xs font-medium text-white/70 mt-0.5">Performance & Analysis</p></div>
                    </div>
                    <div className="relative z-10 mt-5 flex items-center justify-between">
                      <p className="text-xs font-medium text-white/60">View detailed results →</p>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors"><ArrowRight className="text-white" size={14} /></div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#121A28] rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Quick Links</p>
                  <div className="space-y-1">
                    {[
                      { label: "My Library", icon: <BookOpen size={16} />, path: "/student/library" },
                      { label: "Leaderboard", icon: <Trophy size={16} />, path: "/student/personal" },
                      { label: "My Progress", icon: <TrendingUp size={16} />, path: "/student/history" },
                      { label: "Quiz History", icon: <History size={16} />, path: "/student/history" },
                    ].map((link, i) => (
                      <button key={i} onClick={() => navigate(link.path)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-[#F3EBFF] dark:hover:bg-purple-950/20 hover:text-[#7A41F7] dark:hover:text-[#9B6AF9] transition-all text-sm font-semibold group/link">
                        <span className="text-slate-400 dark:text-slate-500 group-hover/link:text-[#7A41F7] dark:group-hover/link:text-[#9B6AF9] transition-colors">{link.icon}</span>
                        {link.label}
                        <ChevronRight size={14} className="ml-auto text-slate-300 dark:text-slate-600 group-hover/link:text-[#7A41F7] dark:group-hover/link:text-[#9B6AF9] transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          MOBILE VIEW
      ══════════════════════════════════════════ */}
      <div className="md:hidden w-full overflow-x-hidden">
        {/* Top Header Background */}
        <div className={`relative w-full overflow-hidden ${selectedGoal ? 'rounded-b-2xl' : ''}`}>
          {!selectedGoal ? (
            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#121D2E]' : 'bg-[#F8FAFF]'}`} />
          ) : (
            <>
              {banners.map((banner, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${activeBannerIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  {banner.image || banner.bgImage ? (
                    <img src={banner.image || banner.bgImage} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${theme === 'dark' ? banner.bgColorDark : banner.bgColorLight}`} />
                  )}
                </div>
              ))}
              <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-10 transition-opacity duration-500 ${banners[activeBannerIndex]?.image || banners[activeBannerIndex]?.bgImage ? 'opacity-0' : 'opacity-20'}`}></div>
            </>
          )}

          {/* Nav Spacer */}
          <div className={`relative z-10 transition-all duration-300 ease-in-out ${!selectedGoal ? 'h-[116px]' : isGoalExpanded ? 'h-[324px]' : 'h-[204px]'}`} />

          {/* Fixed Nav */}
          <div
            className={`fixed top-0 left-0 right-0 z-30 px-4 pt-[59.5px] pb-3.5 flex flex-col gap-3 transition-all duration-300
              ${(isHeaderScrolled || !selectedGoal)
                ? (theme === 'dark' ? 'bg-[#121D2E]' : 'bg-white')
                : 'bg-transparent border-b border-transparent'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col cursor-pointer" onClick={() => setIsGoalExpanded(!isGoalExpanded)}>
                <span className={`text-xs font-medium transition-colors ${useDarkText ? "text-slate-500" : "text-white/70"}`}>CURRENT GOAL</span>
                <div className={`flex items-center gap-1 text-lg font-bold transition-colors ${useDarkText ? "text-slate-800" : "text-white"}`}>
                  {selectedGoal || "Select Goal"}
                  <ChevronDown size={18} className={`transition-transform duration-300 ${isGoalExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${useDarkText ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-black/20 border-white/10 text-white"}`}>
                  <span className="text-orange-400">🔥</span>
                  <span className="text-sm font-bold">0 day</span>
                </div>
                <button className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${useDarkText ? "bg-slate-100 border-slate-200 text-red-500" : "bg-black/20 border-white/10 text-red-400"}`}>
                  <Gift size={16} />
                </button>
                <button onClick={toggleTheme} className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all active:scale-95 ${useDarkText ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-black/20 border-white/10 text-white"}`}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button onClick={() => navigate('/student/profile')} className={`w-8 h-8 rounded-full overflow-hidden border transition-all active:scale-95 ${useDarkText ? "border-slate-200" : "border-white/20"}`}>
                  {user?.profilePic ? (
                    <img src={resolveMediaUrl(user?.profilePic)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0) || "S"}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Goal selector dropdown */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-0 -mx-4
                ${isGoalExpanded ? 'max-h-[200px] mt-2 opacity-100 pb-2' : 'max-h-0 opacity-0 pointer-events-none m-0'}
              `}
            >
              {['Boards', 'MHT-CET'].map(goal => {
                const isSelected = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    onClick={() => selectGoal(goal)}
                    className={`
                      w-full py-3.5 px-4 flex items-center justify-between transition-colors
                      ${useDarkText ? 'hover:bg-slate-100/50 text-slate-800' : 'hover:bg-white/10 text-white'}
                      ${isSelected ? (useDarkText ? 'bg-slate-100/50 font-bold' : 'bg-white/10 font-bold') : 'font-semibold'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-[2px] flex items-center justify-center transition-colors
                        ${isSelected ? (useDarkText ? 'border-slate-800' : 'border-white') : (useDarkText ? 'border-slate-400' : 'border-white/50')}
                      `}>
                        {isSelected && (
                          <div className={`w-2.5 h-2.5 rounded-full ${useDarkText ? 'bg-slate-800' : 'bg-white'}`} />
                        )}
                      </div>
                      <span className="text-[16px] tracking-wide">{goal}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            {selectedGoal && (
              <div className="bg-white flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-300 transition-colors">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  placeholder={theme === 'dark' ? 'Search for courses' : 'Search for lessons'}
                  className="bg-transparent outline-none border-none flex-1 text-slate-800 placeholder:text-slate-400 font-medium text-[15px]"
                />
              </div>
            )}
          </div>

          {/* Banner Swiper */}
          {selectedGoal && (
            <>
              <div
                onScroll={handleBannerScroll}
                className="relative z-10 mt-6 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar w-full"
                style={{ touchAction: 'pan-x' }}
              >
                {banners.map((banner, index) => (
                  <div
                    key={index}
                    className={`w-full flex-shrink-0 snap-center relative ${banner.image ? 'px-0 pb-0' : 'px-4 pb-2'}`}
                  >
                    {banner.image ? (
                      <div
                        onClick={() => { if (banner.link) navigate(banner.link); }}
                        className={`w-full h-[220px] bg-transparent ${banner.link ? 'cursor-pointer' : ''}`}
                      />
                    ) : (
                      <div className="overflow-hidden select-none">
                        <h2 className="text-white text-2xl font-bold leading-tight">
                          {banner.title} <br /> <span className="text-white/90 text-xl font-medium">{banner.subtitle}</span>
                        </h2>
                        <div className="mt-4 inline-block border border-white/20 rounded-md px-3 py-1 bg-white/5 backdrop-blur-sm">
                          <p className="text-white text-xs font-medium tracking-wide">{banner.details}</p>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                          <button className="bg-[#FFC000] text-black font-bold px-6 py-2.5 rounded-lg text-sm shadow-[0_4px_14px_0_rgba(255,192,0,0.39)]">
                            {banner.cta}
                          </button>
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">{banner.badgeIcon}</div>
                            <p className="text-white text-xs font-medium leading-tight">{banner.badgeText}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-white/50 mt-4">{banner.footerNote}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {banners.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeBannerIndex === i ? 'bg-[#FFC000] w-3' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scrollable Content */}
        {!selectedGoal ? (
          <div className="flex-1" />
        ) : (
          <>
            <div className="px-4 mt-6 flex flex-col gap-6 pb-4">

              {/* ── Feedback Card (First Element, No Shadow) ── */}
              {!feedbackSubmitted ? (
                <div className="rounded-md overflow-hidden relative p-5 bg-[#E8F2FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-slate-800/60 shadow-none flex items-center justify-between min-h-[145px]">
                  {/* Left Side Info */}
                  <div className="flex-1 z-10 pr-[38%]">
                    <h4 className="text-[16px] font-bold text-[#1E3A8A] dark:text-[#93C5FD] leading-snug">
                      How do you feel about the app?
                    </h4>
                    <p className="text-[11px] text-[#475569] dark:text-slate-400 mt-1 leading-normal">
                      Your word will help us improve your learning experience
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => {
                          setFeedbackSubmitted(true);
                          navigate("/student/feedback");
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#334155] hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-[12.5px] border border-slate-200/60 dark:border-slate-700 active:scale-95 transition-all"
                      >
                        <ThumbsUp size={14} className="text-[#FFC000]" fill="#FFC000" />
                        <span>Love it!</span>
                      </button>
                      <button
                        onClick={() => {
                          setFeedbackSubmitted(true);
                          navigate("/student/feedback");
                        }}
                        className="flex items-center justify-center p-2 bg-white dark:bg-[#334155] hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200/60 dark:border-slate-700 active:scale-95 transition-all"
                      >
                        <ThumbsDown size={14} className="text-[#FFC000]" fill="#FFC000" />
                      </button>
                    </div>
                  </div>

                  {/* Right Side Illustration */}
                  <div className="absolute right-0 bottom-0 top-0 w-[40%] pointer-events-none flex items-end justify-end">
                    <img
                      src="/feedback_illustration.png"
                      alt="Feedback Illustration"
                      className="h-[95%] w-auto object-contain object-bottom select-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-md p-5 bg-[#E8F2FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-slate-800/60 shadow-none text-center flex flex-col items-center justify-center min-h-[145px] animate-fade-in">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-950/30 rounded-full flex items-center justify-center mb-2 animate-bounce">
                    <span className="text-lg">💖</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                    Thank you for your feedback!
                  </h4>
                  <p className="text-[11px] text-[#475569] dark:text-slate-400 mt-1 max-w-[280px]">
                    We appreciate your support in making our learning platform better for everyone.
                  </p>
                </div>
              )}

              {/* ── Scheduled Tests Mobile (Flat Layout) ── */}
              <div>
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white">Scheduled Tests</h3>
                    {!testsLoading && tests.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-md flex items-center gap-1">
                        <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />Live
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate('/student/history')}
                    className="flex items-center gap-0.5 text-[12px] font-semibold text-[#2563EB] dark:text-[#60A5FA]"
                  >
                    See all <ChevronRight size={14} />
                  </button>
                </div>
                {testsLoading ? (
                  <div className="space-y-3 py-1">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-slate-200/40 dark:border-slate-800/40">
                        <div className="flex items-center gap-3 flex-1">
                          <Sk className="w-10 h-10 rounded-xl flex-shrink-0" />
                          <div className="space-y-2 flex-1"><Sk className="h-4 w-2/3" /><Sk className="h-3 w-1/3" /></div>
                        </div>
                        <Sk className="w-16 h-8 rounded-xl flex-shrink-0 ml-4" />
                      </div>
                    ))}
                  </div>
                ) : tests.length > 0 ? (
                  <div className="divide-y divide-slate-200/50 dark:divide-slate-800/70">
                    {tests.map((t, idx) => (
                      <div key={t._id} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#F3EBFF] dark:bg-purple-950/40 flex items-center justify-center text-[#7A41F7] dark:text-[#9B6AF9] flex-shrink-0">
                            <Clock size={18} />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{t.title}</h5>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{t.duration} Mins</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/student/test/${t._id}`)}
                          className="ml-3 flex-shrink-0 px-4 py-2.5 bg-[#7A41F7] text-white rounded-xl text-[12px] font-black active:scale-95 transition-transform"
                        >
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5">
                      <ClipboardCheck className="text-slate-350 dark:text-slate-650" size={22} />
                    </div>
                    <p className="text-xs font-bold text-slate-450 dark:text-slate-500">No active tests scheduled</p>
                  </div>
                )}
              </div>

              {/* ── Popular Batches ── */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <div>
                    <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white">Popular batches</h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Handpicked for your preparation</p>
                  </div>
                  <button className="flex items-center gap-0.5 text-[12px] font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                    See all <ChevronRight size={14} />
                  </button>
                </div>
                {(() => {
                  const popularBatches = [
                    {
                      id: 1,
                      goal: "Boards",
                      title: "Target Coaching Classes Legends Reloaded Batch for Boards 2026",
                      tags: ["Hinglish", "Full Syllabus"],
                      startDate: "11 May 2026",
                      price: "₹903/mo",
                      originalPrice: "₹1,042/mo",
                      discount: "SAVE 13%",
                      poster: "/student/nexus_batch_banner.png",
                    },
                    {
                      id: 2,
                      goal: "Boards",
                      title: "Phoenix Elite Revision Batch for Boards 2026",
                      tags: ["English", "Revision"],
                      startDate: "18 May 2026",
                      price: "₹750/mo",
                      originalPrice: "₹999/mo",
                      discount: "SAVE 25%",
                      poster: "/student/nexus_batch_banner.png",
                    },
                    {
                      id: 3,
                      goal: "MHT-CET",
                      title: "Target Coaching Classes Legends Reloaded Batch for MHT-CET 2026",
                      tags: ["Hinglish", "Full Syllabus"],
                      startDate: "11 May 2026",
                      price: "₹903/mo",
                      originalPrice: "₹1,042/mo",
                      discount: "SAVE 13%",
                      poster: "/student/nexus_batch_banner.png",
                    },
                    {
                      id: 4,
                      goal: "MHT-CET",
                      title: "Phoenix SRG Crash Course for MHT-CET 2026",
                      tags: ["Hinglish", "Crash Course"],
                      startDate: "20 May 2026",
                      price: "₹800/mo",
                      originalPrice: "₹1,200/mo",
                      discount: "SAVE 33%",
                      poster: "/student/nexus_batch_banner.png",
                    },
                    {
                      id: 5,
                      goal: "IIT JEE",
                      title: "Target Coaching Classes Legends Reloaded Batch for IIT JEE 2027",
                      tags: ["Hinglish", "Full Syllabus"],
                      startDate: "11 May 2026",
                      price: "₹903/mo",
                      originalPrice: "₹1,042/mo",
                      discount: "SAVE 13%",
                      poster: "/student/nexus_batch_banner.png",
                    },
                    {
                      id: 6,
                      goal: "IIT JEE",
                      title: "Phoenix SRG Dropper Batch for IIT JEE 2026",
                      tags: ["Hinglish", "Droppers"],
                      startDate: "15 April 2026",
                      price: "₹1,200/mo",
                      originalPrice: "₹1,500/mo",
                      discount: "SAVE 20%",
                      poster: "/student/nexus_batch_banner.png",
                    },
                    {
                      id: 7,
                      goal: "NEET",
                      title: "Target Coaching Classes Legends Reloaded Batch for NEET 2027",
                      tags: ["Hinglish", "Full Syllabus"],
                      startDate: "11 May 2026",
                      price: "₹903/mo",
                      originalPrice: "₹1,042/mo",
                      discount: "SAVE 13%",
                      poster: "/student/nexus_batch_banner.png",
                    },
                    {
                      id: 8,
                      goal: "NEET",
                      title: "Phoenix SRG Dropper Batch for NEET 2026",
                      tags: ["Hinglish", "Droppers"],
                      startDate: "15 April 2026",
                      price: "₹1,200/mo",
                      originalPrice: "₹1,500/mo",
                      discount: "SAVE 20%",
                      poster: "/student/nexus_batch_banner.png",
                    }
                  ];

                  const matchedBatches = popularBatches.filter(b => {
                    if (!selectedGoal) return true;
                    return b.goal.toLowerCase().includes(selectedGoal.toLowerCase()) || 
                           selectedGoal.toLowerCase().includes(b.goal.toLowerCase());
                  });

                  if (matchedBatches.length > 0) {
                    return (
                      <div className="flex flex-col gap-5 pb-4">
                        {matchedBatches.map((batch) => (
                          <div
                            key={batch.id}
                            className={`w-full overflow-hidden rounded-2xl border transition-all duration-200 active:scale-[0.985] ${
                              theme === 'dark'
                                ? 'bg-[#0F172A] border-slate-800 shadow-xl'
                                : 'bg-white border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
                            }`}
                          >
                            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                              <img src={batch.poster} alt={batch.title} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="p-4 flex flex-col gap-3">
                              {/* Tags */}
                              <div className="flex items-center gap-2">
                                {batch.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded tracking-wide ${
                                      theme === 'dark'
                                        ? 'bg-[#1E293B] text-slate-350'
                                        : 'bg-slate-100 text-slate-650'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {/* Title */}
                              <h4 className={`text-[15px] font-bold leading-snug line-clamp-2 min-h-[42px] ${
                                theme === 'dark' ? 'text-white' : 'text-slate-850'
                              }`}>
                                {batch.title}
                              </h4>

                              {/* Status Info */}
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span className={`text-[11px] font-medium ${
                                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Ongoing | Started {batch.startDate}
                                </span>
                              </div>

                              {/* Divider */}
                              <div className={`border-t my-1 ${
                                theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
                              }`} />

                              {/* Price Row */}
                              <div className="flex items-center gap-2.5">
                                <span className={`text-[17px] font-extrabold ${
                                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                                }`}>{batch.price}</span>
                                <span className={`text-[13px] font-medium line-through ${
                                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                                }`}>{batch.originalPrice}</span>
                                <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                                  {batch.discount}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => navigate('/student/subscription')}
                                  className="flex-1 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-lg text-xs tracking-wider transition-colors active:scale-95"
                                >
                                  Buy now
                                </button>
                                <button
                                  onClick={() => navigate('/student/subscription')}
                                  className={`flex-1 py-3 border font-bold rounded-lg text-xs tracking-wider transition-colors active:scale-95 ${
                                    theme === 'dark'
                                      ? 'border-[#3B82F6] hover:bg-[#3B82F6]/10 text-[#3B82F6]'
                                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  View details
                                </button>
                              </div>

                              {/* Contact counsellor link */}
                              <div className="flex items-center justify-center gap-1.5 mt-1 text-[12px]">
                                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Have questions?</span>
                                <button
                                  onClick={() => window.open('https://wa.me/918585858585', '_blank')}
                                  className="text-[#3B82F6] hover:underline font-bold flex items-center gap-1"
                                >
                                  <Phone size={12} /> Talk to counsellor
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center py-6 text-center w-full">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5">
                        <ClipboardCheck className="text-slate-350 dark:text-slate-650" size={22} />
                      </div>
                      <p className="text-xs font-bold text-slate-450 dark:text-slate-500">No batches found for your goal</p>
                    </div>
                  );
                })()}
              </div>

              {/* ── Results Carousel ── */}
              <div className="mt-4">
                <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white mb-3">Our Results</h3>
                <div
                  ref={resultsScrollRef}
                  className="flex overflow-x-auto gap-3.5 no-scrollbar snap-x snap-mandatory pb-1 -mx-4 px-4"
                >
                  {resultsPosters.map((src, index) => (
                    <div
                      key={index}
                      className="w-[calc(100vw-24px)] xs:w-[calc(100vw-32px)] flex-shrink-0 snap-center flex flex-col gap-2"
                    >
                      <div 
                        className="w-full rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#E8F2FF] dark:bg-[#121A28] shadow-sm"
                        style={{ aspectRatio: "16/10" }}
                      >
                        <img src={src} className="w-full h-full object-cover select-none" alt={`Result Poster ${index + 1}`} />
                      </div>
                      <p className="text-[11.5px] font-semibold text-center text-slate-600 dark:text-slate-400">
                        {index === 0 && "Celebrating our top rankers in recent mock assessments"}
                        {index === 1 && "Phenomenal score improvement rates across batches"}
                        {index === 2 && "Our learners securing top percentiles this academic year"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>







              {/* ── What Our Learners Say ── */}
              <div>
                <h3 className="text-slate-800 dark:text-white text-lg font-bold mb-3">What our learners say</h3>
                <div 
                  className="flex overflow-x-auto gap-3.5 no-scrollbar pb-3 -mx-4 px-4 snap-x snap-mandatory"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const scrollLeft = el.scrollLeft;
                    const scrollStep = el.clientWidth - 18; // 100vw - 32px card width + 14px gap = 100vw - 18px
                    const idx = Math.round(scrollLeft / (scrollStep || 300));
                    setActiveReviewIdx(idx);
                  }}
                >
                  {reviews.map((review, i) => (
                    <div
                      key={i}
                      className={`flex-shrink-0 w-[calc(100vw-32px)] p-6 snap-center transition-all duration-200 ${theme === 'dark'
                        ? 'bg-[#18202F] border border-slate-800/80 shadow-none'
                        : 'bg-white border border-slate-200 shadow-sm'
                        }`}
                      style={{ borderRadius: 10 }}
                    >
                      <p className={`text-[13.5px] leading-relaxed mb-6 font-normal ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        {review.text}
                      </p>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                          {review.goal}
                        </p>
                        <p className="text-[11.5px] font-medium text-slate-400 dark:text-slate-450 mt-1">
                          {review.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination indicators */}
                <div className="flex gap-2 mt-4 w-full">
                  {reviews.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-[3px] rounded-full flex-1 transition-all duration-300 ${
                        activeReviewIdx === idx
                          ? 'bg-black dark:bg-white'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* ── Join Prime / Subscription Section ── OUTSIDE px-4 wrapper for true full-width ── */}
            <div className="w-full bg-transparent py-10 mt-6">
              <div className="px-4">
                <h3 className="text-slate-900 dark:text-white text-[18px] font-bold leading-tight">
                  Unlimited <span style={{ color: '#25D3A4' }}>access</span> to the best<br />batches &amp; educators
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {[
                    "Thousands of live and recorded classes",
                    "20,000+ Test & Practice questions",
                    "Learn from India's top educators",
                    "Notes, Doubts and many more premium features",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600 dark:text-slate-300 py-1">
                      <CheckCircle2 size={16} style={{ color: '#25D3A4', flexShrink: 0, marginTop: 1 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 relative aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800/80 bg-slate-900">
                  <img 
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" 
                    alt="Unlimited Access Premium Banner" 
                    className="w-full h-full object-cover opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
                <button
                  onClick={() => navigate('/student/subscription')}
                  className="w-full mt-5 font-bold text-white active:scale-95 transition-transform"
                  style={{ background: '#25D3A4', borderRadius: 10, padding: '16px 24px', fontSize: 15 }}
                >
                  View subscription plans
                </button>
                <p className="text-center mt-2 text-slate-400 dark:text-white/40 text-[12px]">Starts from ₹0/month</p>
              </div>
            </div>



            {/* ── Counsellor Support CTA ── OUTSIDE px-4 wrapper for true full-width ── */}
            <div
              className="py-6 relative overflow-hidden w-full bg-transparent transition-colors duration-300"
              style={{ borderRadius: 0 }}
            >
              {/* Background patterns */}
              <div className={`absolute -left-10 -bottom-10 w-28 h-28 rounded-full blur-xl pointer-events-none ${theme === 'dark' ? 'bg-emerald-950/20' : 'bg-emerald-100/10'}`} />
              <div className={`absolute -right-12 -top-4 w-32 h-32 rounded-full blur-xl pointer-events-none ${theme === 'dark' ? 'bg-emerald-950/20' : 'bg-emerald-100/10'}`} />

              <div className="px-4">
                {/* Header Row */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-full flex-shrink-0 overflow-hidden relative z-10 ${theme === 'dark' ? 'bg-[#1F2937]' : 'bg-white border border-slate-200 shadow-none'}`}>
                    <img
                      src="/student/counsellor_profile.png"
                      className="w-full h-full object-cover"
                      alt="Counsellor Avatar"
                    />
                  </div>
                  <div className="z-10">
                    <h4 className={`text-[18px] font-bold leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Need {selectedGoal || "IIT JEE"} guidance?
                    </h4>
                    <p className={`text-[13px] mt-1.5 leading-normal ${theme === 'dark' ? 'text-slate-400' : 'text-slate-555'}`}>
                      Our counsellor can help you with your preparation
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.open('https://wa.me/918585858585', '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#00966A] hover:bg-[#059669] text-white font-bold text-[14px] active:scale-[0.98] transition-all"
                    style={{ borderRadius: 10 }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Chat on WhatsApp
                  </button>
                  <a
                    href="tel:+918585858585"
                    className={`w-full flex items-center justify-center gap-2 py-3.5 border font-bold text-[14px] active:scale-[0.98] transition-all text-center ${theme === 'dark' ? 'border-[#2563EB] text-[#3b82f6]' : 'border-blue-200 text-blue-600 bg-white hover:bg-slate-50'}`}
                    style={{ borderRadius: 10 }}
                  >
                    <Phone size={14} className={theme === 'dark' ? 'text-[#3b82f6]' : 'text-blue-600'} /> Call +91 8585858585
                  </a>
                </div>
              </div>
            </div>

            {/* ── Study with Your friends banner ── */}
            <div className="px-3 xs:px-4 mt-6">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md p-5 flex items-center justify-between min-h-[145px] shadow-sm">
                <div className="absolute -left-10 -bottom-10 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="flex-1 z-10 pr-[38%]">
                  <h4 className="text-[16px] font-bold text-white leading-snug">
                    Study with Your friends
                  </h4>
                  <p className="text-[11px] text-white/80 mt-1 leading-normal">
                    Invite your friends to Target Coaching Classes app to learn together.
                  </p>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Target Coaching Classes App',
                          text: 'Join me on Target Coaching Classes to study together!',
                          url: window.location.origin
                        }).catch(() => { });
                      } else {
                        navigator.clipboard.writeText(window.location.origin);
                        alert('App link copied to clipboard!');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 font-bold rounded-md text-xs mt-3.5 shadow-sm active:scale-95 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186l5.302 2.651m-5.302-2.651l5.302-2.651m0 0a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Zm0-2.186l5.302 2.651M16.5 18a2.25 2.25 0 1 1-3.935-2.186A2.25 2.25 0 0 1 16.5 18Z" />
                    </svg>
                    Share App
                  </button>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[110px] h-[120px] flex items-center justify-center pointer-events-none select-none">
                  <div className="absolute w-[80px] h-[100px] bg-white/20 border border-white/10 rounded-md p-2 flex flex-col justify-between shadow-sm transform -rotate-12 translate-x-[-15px] translate-y-[-5px]">
                    <div className="w-8 h-1.5 bg-white/40 rounded-full" />
                    <div className="w-full h-1 bg-white/20 rounded-full" />
                    <div className="w-full h-1 bg-white/20 rounded-full" />
                  </div>
                  <div className="absolute w-[80px] h-[100px] bg-white/30 border border-white/10 rounded-md p-2 flex flex-col justify-between shadow-sm transform -rotate-6 translate-x-[-5px] translate-y-[-2px]">
                    <div className="w-10 h-1.5 bg-white/50 rounded-full" />
                    <div className="w-full h-1 bg-white/30 rounded-full" />
                    <div className="w-full h-1 bg-white/30 rounded-full" />
                  </div>
                  <div className="absolute w-[85px] h-[105px] bg-white text-blue-600 rounded-md p-2 flex flex-col justify-between shadow-md transform rotate-6 translate-x-[10px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded w-max">Learn. Grow.</span>
                      <div className="w-full h-1.5 bg-blue-50 rounded" />
                      <div className="w-full h-1 bg-blue-50 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-3 h-3 rounded-full bg-blue-100 flex items-center justify-center text-[5px] font-bold">🎓</div>
                      <div className="w-6 h-2 bg-blue-600 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Social Media Section ── */}
            <div className="px-3 xs:px-4 mt-10 mb-8">
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`} />
                </div>
                <div className={`relative z-10 w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center shadow-sm ${theme === 'dark' ? 'bg-[#111827]' : 'bg-white'}`}>
                  <span className="text-blue-500 dark:text-blue-400 font-extrabold text-xl tracking-tighter relative">
                    B
                    <span className="absolute -top-1 -right-1.5 text-xs text-orange-500 font-black">⚡</span>
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  We're on social media
                </h3>
                <p className={`text-[12px] mt-2 max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Follow us &amp; share with your friends. it motivates us to keep working hard for you to bring new feature &amp; keep the app FREE.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {socials.map((soc, i) => (
                  <a
                    key={i}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2.5 py-3.5 rounded-md border font-bold text-xs shadow-sm transition-all active:scale-[0.97]
                      ${theme === 'dark'
                        ? 'bg-[#111827] border-slate-800 hover:bg-[#1E293B] text-slate-200'
                        : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-700'
                      }
                    `}
                  >
                    {soc.icon}
                    {soc.name}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Counsellor Bottom Sheet Modal */}
      {showCounsellorModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          onClick={() => setShowCounsellorModal(false)}
        >
          <div className="absolute inset-0 bg-black/65" style={{ backdropFilter: 'blur(3px)' }} />
          <div
            className={`relative w-full max-w-md overflow-hidden ${isDark ? 'bg-[#111827]' : 'bg-white'}`}
            style={{ borderRadius: '12px 12px 0 0' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-3">
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
            </div>
            <div className="px-6 pt-8 pb-2">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className={`font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: 19 }}>
                    Need help with your subscription?
                  </h2>
                  <p className={`text-[12px] mt-2 leading-relaxed ${isDark ? 'text-white/55' : 'text-slate-500'}`}>
                    Talk to our experts who will guide you with all you need to crack it.
                  </p>
                </div>
                <div className={`w-[68px] h-[68px] rounded-full overflow-hidden flex-shrink-0 border-2 ${isDark ? 'border-white/10 bg-[#1F2937]' : 'border-slate-200 bg-slate-100'}`}>
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=counsellorF&backgroundColor=b6e3f4&clothingColor=3c4f5c"
                    className="w-full h-full object-cover"
                    alt="Expert"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 pt-6 pb-3">
              <a
                href="tel:+918585858585"
                className={`w-full flex items-center justify-center gap-3 active:scale-95 transition-transform ${isDark ? 'bg-white text-[#111827]' : 'bg-[#1EBA9B] text-white shadow-md'}`}
                style={{ borderRadius: 8, padding: '14px 24px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="font-bold" style={{ fontSize: 15 }}>+91 8585858585</span>
              </a>
            </div>
            <div className="px-6 pb-12">
              <button
                onClick={() => setShowCounsellorModal(false)}
                className={`w-full flex items-center justify-center gap-1.5 py-4 font-bold tracking-widest active:opacity-70 transition-opacity ${isDark ? 'text-white' : 'text-[#1EBA9B]'}`}
                style={{ fontSize: 11.5, letterSpacing: '0.08em' }}
              >
                GET A CALL FROM US <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}


      {showScrollTop && (
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
            document.body.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`fixed right-5 z-[5000] w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-95 transition-all ${
            user?.approved === false ? 'bottom-44' : 'bottom-28'
          } ${isDark ? 'bg-[#111A24] text-blue-400 border border-blue-400' : 'bg-white text-[#25D3A4] border border-[#25D3A4]'}`}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <StudentDashboardOverlays user={user} resolveMediaUrl={resolveMediaUrl} />
    </div>
  );
}
