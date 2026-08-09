import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  ChevronRight,
  ArrowRight,
  ClipboardCheck,
  History,
  Clock,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BarChart2,
  Trophy,
  BookOpen,
  Search,
  Gift,
  Phone,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Star,
  PlaySquare,
  Book,
  FileText,
  ShoppingBag,
  Moon,
  Sun,
  CheckCircle2,
  PlayCircle,
  TrendingUp,
  NotebookText,
  Play,
  BrainCircuit,
  ArrowUp,
} from "lucide-react";
import StudentHeader from "./StudentHeader";
import DesktopHeader from "../auth/DesktopHeader";
import CounsellorModal from "../components/CounsellorModal";
import { FakeStatsBar } from "./StudentDashboardOverlays";
import StudentDashboardOverlays from "./StudentDashboardOverlays";
import { PYQ_SUBJECTS } from "./pyqData";
import GoalModal from "./GoalModal";
import LockScreen from "./LockScreen";

const STATUS_BAR_H = 28.5;

const socials = [
  {
    name: "YouTube",
    url: "https://youtube.com",
    icon: (
      <svg
        className="w-4 h-4 text-[#FF0000]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.516 3.5 12 3.5 12 3.5s-7.516 0-9.388.555a3.003 3.003 0 0 0-2.11 2.108C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.484 20.5 12 20.5 12 20.5s7.516 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://instagram.com",
    icon: (
      <svg
        className="w-4 h-4 text-[#E1306C]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    url: "https://telegram.org",
    icon: (
      <svg
        className="w-4 h-4 text-[#0088cc]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.597 5.347 11.944 11.944 11.944 6.598 0 11.944-5.347 11.944-11.944C23.888 5.347 18.542 0 11.944 0zm5.66 8.358l-1.913 9.019c-.14.629-.514.784-1.039.49l-2.918-2.15-1.408 1.354c-.156.156-.287.287-.589.287l.21-2.969 5.4-4.88c.235-.208-.051-.324-.365-.115l-6.674 4.201-2.879-.901c-.626-.196-.639-.626.13-.925l11.25-4.333c.52-.19 1.002.135.838.932z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://facebook.com",
    icon: (
      <svg
        className="w-4 h-4 text-[#1877F2]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com",
    icon: (
      <svg
        className="w-4 h-4 text-[#0A66C2]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    url: "https://whatsapp.com",
    icon: (
      <svg
        className="w-4 h-4 text-[#25D366]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.953.01c3.177 0 6.162 1.241 8.41 3.493 2.25 2.25 3.488 5.24 3.487 8.419-.004 6.544-5.342 11.884-11.898 11.884-2.008 0-3.978-.51-5.733-1.482L0 24zm6.292-3.73l.361.214c1.546.917 3.325 1.4 5.242 1.4 5.373 0 9.745-4.373 9.749-9.75.002-2.607-1.012-5.059-2.859-6.907C16.945 3.38 14.5 2.36 11.951 2.36c-5.38 0-9.754 4.372-9.757 9.75-.001 2.024.529 4.004 1.536 5.748l.235.408L3.03 21.3l4.319-1.03z" />
      </svg>
    ),
  },
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
  backgroundImage:
    "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
  backgroundSize: "200% 100%",
  animation: "yt-shimmer 1.5s infinite linear",
};
const shimmerPurple = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.08) 100%)",
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
    backgroundImage:
      "linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)",
    backgroundSize: "200% 100%",
    animation: "yt-shimmer 1.5s infinite linear",
  };
  const shimmerBaseDark = {
    backgroundImage:
      "linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
    backgroundSize: "200% 100%",
    animation: "yt-shimmer 1.5s infinite linear",
  };
  return (
    <div
      className={`rounded-xl ${className}`}
      style={
        purple ? shimmerPurple : isDark ? shimmerBaseDark : shimmerBaseLight
      }
    />
  );
};
const StatsBarSkeleton = () => (
  <div className="grid grid-cols-3 gap-5 mb-8">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#121A28] rounded-2xl p-5 flex items-center gap-4 border border-slate-100 dark:border-slate-800"
      >
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
const HeroRowSkeleton = () => (
  <div className="grid grid-cols-3 gap-6 mb-8">
    <Sk className="col-span-2 h-[220px] rounded-3xl" />
    <Sk className="h-[220px] rounded-3xl" />
  </div>
);
const QuizGridSkeleton = () => (
  <div className="grid grid-cols-4 gap-5">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#121A28] rounded-3xl p-6 space-y-4 border border-slate-100 dark:border-slate-800"
      >
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
const TestRowSkeleton = () => (
  <div className="flex items-center gap-3 bg-white dark:bg-[#121A28] p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
    <Sk className="w-8 h-8 rounded-xl flex-shrink-0" />
    <Sk className="w-11 h-11 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Sk className="h-4 w-2/3" />
      <Sk className="h-3 w-1/3" />
    </div>
    <Sk className="w-20 h-9 rounded-xl flex-shrink-0" />
  </div>
);
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
const MobileTestRowSkeleton = () => (
  <div className="flex items-center justify-between bg-white dark:bg-[#121A28] p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-4 flex-1">
      <Sk className="w-10 h-10 rounded-2xl flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Sk className="h-4 w-3/4" />
        <Sk className="h-3 w-1/2" />
      </div>
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
  const [selectedGoal, setSelectedGoal] = useState(
    localStorage.getItem("selectedGoal") || ""
  );
  const [isGoalExpanded, setIsGoalExpanded] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [expandedTestId, setExpandedTestId] = useState(null);

  const reviews = [
    {
      name: "Honey",
      goal: "IIT JEE",
      text: "excellent experience ever......... just as offline classes occur at home 🏠🏠🏠🏠......... thank you for your support 💪💪💪... and also thanks all excellent teachers...",
    },
    {
      name: "Arjun Sharma",
      goal: "IIT JEE 2025",
      text: "The mock tests and live classes completely changed how I prepare. Got AIR 312! Highly recommend to everyone preparing.",
    },
    {
      name: "Priya Verma",
      goal: "NEET 2025",
      text: "Best platform for NEET prep. The PYQ books and analytics helped me score 680+. Thank you for the amazing support!",
    },
    {
      name: "Rahul Patil",
      goal: "MHT-CET 2025",
      text: "Teachers are amazing! Cleared MHT-CET with 99.2 percentile. The study plan and tests kept me on track the whole year.",
    },
  ];

  const resultsScrollRef = useRef(null);
  const bannerScrollRef = useRef(null);
  const resultsPosters = ["/JEE_MAIN_2026.png", "/rankers_2024.jpg", "/rankers_2026.jpg"];

  useEffect(() => {
    if (!selectedGoal) return;
    const interval = setInterval(() => {
      const el = bannerScrollRef.current;
      if (!el) return;
      const totalWidth = el.scrollWidth;
      const currentScroll = el.scrollLeft;
      const viewWidth = el.clientWidth;

      if (currentScroll + viewWidth >= totalWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollTo({ left: currentScroll + viewWidth, behavior: "smooth" });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedGoal]);

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
      document.body.setAttribute("data-hide-nav", "true");
    } else {
      document.body.removeAttribute("data-hide-nav");
    }
    return () => {
      document.body.removeAttribute("data-hide-nav");
    };
  }, [showCounsellorModal]);

  const banners = [
    {
      title: "Target MHT CET 2027",
      subtitle: "Crack MHT CET with top educators",
      details: "Comprehensive syllabus coverage | Mock tests",
      cta: "Admission Form",
      ctaLink: "https://forms.gle/uTzpboYQ4yRVcuGo6",
      secondaryCta: "Enquiry Form",
      secondaryCtaLink: "https://forms.gle/oHKY3wtTYrpGGDp76",
      badgeIcon: <Trophy className="w-4 h-4 text-yellow-400" />,
      badgeText: "Target Coaching Classes",
      teachers: ["Top Faculty"],
      footerNote: "Enroll today for guaranteed success",
      bgColorLight: "from-[#0B4F30] to-[#052818]",
      bgColorDark: "from-[#052416] to-[#02100A]",
    },
    {
      title: "Target Boards 2027",
      subtitle: "Secure 90%+ in your board exams",
      details: "Complete textbook solutions | Previous year papers",
      cta: "Admission Form",
      ctaLink: "https://forms.gle/uTzpboYQ4yRVcuGo6",
      secondaryCta: "Enquiry Form",
      secondaryCtaLink: "https://forms.gle/oHKY3wtTYrpGGDp76",
      badgeIcon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      badgeText: "Target Coaching Classes",
      teachers: ["Expert Teachers"],
      footerNote: "Limited seats available",
      bgColorLight: "from-[#3B1C78] to-[#1D0C40]",
      bgColorDark: "from-[#190C34] to-[#0A0418]",
    },
    {
      title: "Target Class 11 Batch",
      subtitle: "Build a strong foundation",
      details: "In-depth concept clarity | Regular assessments",
      cta: "Admission Form",
      ctaLink: "https://forms.gle/uTzpboYQ4yRVcuGo6",
      secondaryCta: "Enquiry Form",
      secondaryCtaLink: "https://forms.gle/oHKY3wtTYrpGGDp76",
      badgeIcon: <Atom className="w-4 h-4 text-blue-400" />,
      badgeText: "Target Coaching Classes",
      teachers: ["Subject Experts"],
      footerNote: "Start your journey with us",
      bgColorLight: "from-[#0F2027] to-[#203A43]",
      bgColorDark: "from-[#000000] to-[#0F2027]",
    },
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
        setIsGoalExpanded((prev) => {
          if (prev) return false;
          return prev;
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useDarkText = theme === "light" && (isHeaderScrolled || !selectedGoal);

  const selectGoal = (goal) => {
    localStorage.setItem("selectedGoal", goal);
    setSelectedGoal(goal);
    setIsGoalExpanded(false);
    window.location.reload();
  };

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (
      url.startsWith("http") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    )
      return url;
    const base = window.__API_URL__
      ? window.__API_URL__.replace(/\/api$/, "")
      : (import.meta.env.VITE_API_BASE_URL || "").replace(/\/api$/, "");
    return `${base}${url}`;
  };

  const [tests, setTests] = useState(_cache.tests ?? []);
  const [testsLoading, setTestsLoading] = useState(_cache.tests === null);
  const [topRankName, setTopRankName] = useState(
    _cache.topRank?.name ?? "Brandon Matrovs"
  );
  const [topRankPic, setTopRankPic] = useState(_cache.topRank?.pic ?? null);
  const [rankLoading, setRankLoading] = useState(_cache.topRank === null);
  const [stats, setStats] = useState({
    attempted: "_",
    scheduled: _cache.tests?.length ?? 0,
    completed: "_",
  });
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
          setStats((prev) => ({ ...prev, scheduled: list.length }));
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
          const res = await api.get("/leaderboard/stats/top-one", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const name =
            res.data?.name || res.data?.studentName || res.data?.student?.name;
          const pic = res.data?.avatar || res.data?.student?.avatar;
          _cache.topRank = {
            name: name || "Brandon Matrovs",
            pic: pic || null,
          };
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
    {
      name: "Physics Quiz",
      color: "bg-[#EBF3FF] dark:bg-[#1A233A]",
      badge: "bg-[#D1E5FF] dark:bg-[#253250]",
      tag: "Physics",
      icon: <Atom size={18} />,
      chapters: 28,
      pyq: "1.2k",
      subj: "physics",
    },
    {
      name: "Chemistry Quiz",
      color: "bg-[#FFF4EB] dark:bg-[#3A241A]",
      badge: "bg-[#FFE9D6] dark:bg-[#503225]",
      tag: "Chemistry",
      icon: <FlaskConical size={18} />,
      chapters: 28,
      pyq: "1.3k+",
      subj: "chemistry",
    },
    {
      name: "Math Quiz",
      color: "bg-[#F3EBFF] dark:bg-[#231A3A]",
      badge: "bg-[#E6D6FF] dark:bg-[#322550]",
      tag: "Math",
      icon: <Calculator size={18} />,
      chapters: 25,
      pyq: "1.5k+",
      subj: "maths",
    },
    {
      name: "Biology Quiz",
      color: "bg-[#EBFDEB] dark:bg-[#1A3A23]",
      badge: "bg-[#D6F7D6] dark:bg-[#255032]",
      tag: "Biology",
      icon: <Dna size={18} />,
      chapters: 27,
      pyq: "1.8k+",
      subj: "biology",
    },
  ];

  const TopRankContent = ({ large = false }) => (
    <div className="flex items-center gap-2 relative z-10">
      <div
        className={`${large ? "w-10 h-10 text-sm" : "w-7 h-7 text-xs"
          } rounded-full border-2 border-white/40 flex items-center justify-center text-white font-bold flex-shrink-0 -ml-3`}
      >
        #1
      </div>
      <div className="relative flex-shrink-0">
        <div
          className={`${large ? "w-16 h-16" : "w-14 h-14"
            } rounded-full bg-pink-200 border-2 border-white/20 overflow-hidden`}
        >
          <img
            src={
              topRankPic ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                topRankName
              )}`
            }
            alt="Top student"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="text-white min-w-0 flex-1 pr-12">
        <p
          className={`${large ? "text-base" : "text-[15px]"
            } font-bold truncate`}
        >
          {topRankName}
        </p>
        <p className="text-[12px] opacity-70 font-medium">Top of the week 🏆</p>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen overflow-x-hidden bg-[#F0F4F9] dark:bg-[#0B101A] text-slate-900 dark:text-white transition-colors duration-300 ${user?.approved === false ? "pb-52" : "pb-32"
        }`}
    >
      <ShimmerCSS />

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Landing-style header with Logout */}
        <DesktopHeader
          loggedIn={true}
          onLogout={handleLogout}
        />

        <div className="max-w-[1200px] mx-auto px-6 py-10 w-full">
          {/* Two-column: Left = ongoing tests | Right = student info */}
          <div className="grid grid-cols-3 gap-8">

            {/* -- LEFT: Ongoing / Scheduled Tests -- */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Ongoing Tests</h2>
                {!testsLoading && tests.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    {tests.length} Live Now
                  </span>
                )}
              </div>

              {testsLoading ? (
                <div className="space-y-3">
                  <TestRowSkeleton /><TestRowSkeleton /><TestRowSkeleton />
                </div>
              ) : tests.length > 0 ? (
                <div className="space-y-4">
                  {tests.map((t, idx) => {
                    const isExpanded = expandedTestId === t._id;
                    return (
                      <div
                        key={t._id}
                        className={`rounded-xl p-7 border bg-white hover:shadow-md transition-all cursor-pointer ${
                          isExpanded ? "border-[#1EBA9B]" : "border-slate-200"
                        }`}
                        onClick={() =>
                          setExpandedTestId(isExpanded ? null : t._id)
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-[#1EBA9B]">
                            {t.examType || "FULL SYLLABUS"}
                          </span>
                          <ChevronRight
                            size={16}
                            className={`text-slate-400 transition-transform duration-300 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                        <h3 className="text-[15px] font-bold tracking-wide leading-tight text-slate-900 mb-1">
                          {t.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                          By {t.teacherName || "Educator"}
                        </p>
                        
                        {/* Expanded Content: Instructions */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isExpanded ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                              <BookOpen size={16} className="text-[#1EBA9B]" /> Instructions
                            </h4>
                            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                              <li>This test contains {t.totalQuestions || 0} questions.</li>
                              <li>The total duration is {t.duration || 0} minutes.</li>
                              <li>Ensure you have a stable internet connection.</li>
                              <li>Do not switch tabs during the examination.</li>
                              <li>Submit the test before the timer runs out.</li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                              {t.totalQuestions || 0} questions
                            </span>
                            <span className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                              {t.duration || 0} min
                            </span>
                          </div>
                          {isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/student/test/${t._id}`);
                              }}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border font-bold text-xs bg-[#1EBA9B] border-[#1EBA9B] text-white hover:bg-[#159a7f] transition-colors"
                            >
                              <ArrowRight size={13} /> Start Now
                            </button>
                          )}
                          {!isExpanded && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/student/test/${t._id}`);
                              }}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border font-bold text-xs border-[#1EBA9B] text-[#1EBA9B] hover:bg-[#1EBA9B]/10 transition-colors"
                            >
                              <ArrowRight size={13} /> Start
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <ClipboardCheck className="text-slate-300" size={28} />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">No active tests scheduled</p>
                  <p className="text-xs text-slate-300 mt-1">Check back later for updates</p>
                </div>
              )}
            </div>

            {/* ── RIGHT: Student Info ── */}
            <div className="flex flex-col gap-5">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 text-white flex items-center justify-center text-3xl font-bold mb-3">
                  {user?.name?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{user?.name || "Student"}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{user?.email || ""}</p>
                <span className="mt-3 inline-block text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-[#7A41F7]">
                  {user?.className || selectedGoal || "Student"}
                </span>
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">My Stats</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Tests Available</span>
                    <span className="text-sm font-semibold text-slate-900">{tests.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Goal</span>
                    <span className="text-sm font-semibold text-[#7A41F7]">{selectedGoal || "Not set"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user?.approved ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {user?.approved ? "Active" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Links</p>
                <div className="space-y-1">
                  {[
                    { label: "Test History", icon: <History size={15} />, path: "/student/history" },
                    { label: "My Library", icon: <BookOpen size={15} />, path: "/student/library" },
                    { label: "Leaderboard", icon: <Trophy size={15} />, path: "/student/personal" },
                    { label: "My Profile", icon: <TrendingUp size={15} />, path: "/student/profile" },
                  ].map((link, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(link.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-[#7A41F7] transition-all text-sm font-medium group/link"
                    >
                      <span className="text-slate-400 group-hover/link:text-[#7A41F7] transition-colors">{link.icon}</span>
                      {link.label}
                      <ChevronRight size={13} className="ml-auto text-slate-300 group-hover/link:text-[#7A41F7] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE VIEW
      ══════════════════════════════════════════ */}
      <div className="md:hidden w-full overflow-x-hidden">
        {/* Top Header Background */}
        <div
          className={`relative w-full overflow-hidden ${selectedGoal ? "rounded-b-2xl" : ""
            }`}
        >
          {!selectedGoal ? (
            <div
              className={`absolute inset-0 ${theme === "dark" ? "bg-[#121D2E]" : "bg-[#F8FAFF]"
                }`}
            />
          ) : (
            <>
              {banners.map((banner, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${activeBannerIndex === index
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                    }`}
                >
                  {banner.image || banner.bgImage ? (
                    <img
                      src={banner.image || banner.bgImage}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${theme === "dark"
                        ? banner.bgColorDark
                        : banner.bgColorLight
                        }`}
                    />
                  )}
                </div>
              ))}
              <div
                className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-10 transition-opacity duration-500 ${banners[activeBannerIndex]?.image ||
                  banners[activeBannerIndex]?.bgImage
                  ? "opacity-0"
                  : "opacity-20"
                  }`}
              ></div>
            </>
          )}

          {/* Nav Spacer */}
          <div
            className={`relative z-10 transition-all duration-300 ease-in-out ${!selectedGoal ? "h-[116px]" : "h-[195px]"
              }`}
          />

          {/* Fixed Nav */}
          <div
            className={`fixed top-0 left-0 right-0 z-30 px-4 pb-3.5 flex flex-col gap-3 transition-all duration-300
              ${isHeaderScrolled || !selectedGoal
                ? theme === "dark"
                  ? "bg-[#121D2E]"
                  : "bg-white"
                : "bg-transparent border-b border-transparent"
              }
            `}
            style={{ paddingTop: STATUS_BAR_H + 16 }}
          >
            <div className="flex items-center justify-between px-1 gap-2 min-w-0">
              <div
                className="cursor-pointer min-w-0 flex-1 overflow-hidden"
                onClick={() => navigate("/student/goal-selection")}
              >
                <p
                  className={`text-[10px] font-medium leading-tight mb-0.5 transition-colors ${useDarkText ? "text-slate-500" : "text-white/70"
                    }`}
                >
                  Current goal
                </p>
                <div
                  className={`flex items-center gap-1 min-w-0 transition-colors ${useDarkText ? "text-slate-900" : "text-white"
                    }`}
                >
                  <span className="font-bold text-[17px] font-display tracking-tight truncate min-w-0">
                    {selectedGoal || "Select Goal"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0`}
                    strokeWidth={2.5}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${useDarkText
                    ? "bg-slate-100 border-slate-200 text-slate-800"
                    : "bg-black/20 border-white/10 text-white"
                    }`}
                >
                  <span className="text-orange-400">🔥</span>
                  <span className="text-xs font-bold whitespace-nowrap">
                    0 day
                  </span>
                </div>
                <button
                  onClick={() => setShowCounsellorModal(true)}
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border transition-all active:scale-95 ${useDarkText
                    ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-black/20 border-white/10 text-white hover:bg-white/10"
                    }`}
                >
                  <Phone size={14} className="fill-current" strokeWidth={0} />
                </button>
                <button
                  onClick={toggleTheme}
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border transition-all active:scale-95 ${useDarkText
                    ? "bg-slate-100 border-slate-200 text-slate-700"
                    : "bg-black/20 border-white/10 text-white"
                    }`}
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button
                  onClick={() => navigate("/student/profile")}
                  className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border-2 transition-all active:scale-95 ${useDarkText ? "border-transparent" : "border-transparent"
                    }`}
                >
                  {user?.profilePic ? (
                    <img
                      src={resolveMediaUrl(user?.profilePic)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Search */}
            {selectedGoal && (
              <div className="bg-white flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-300 transition-colors">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    theme === "dark"
                      ? "Search for courses"
                      : "Search for lessons"
                  }
                  className="bg-transparent outline-none border-none flex-1 text-slate-800 placeholder:text-slate-400 font-medium text-sm"
                />
              </div>
            )}
          </div>

          {/* Banner Swiper */}
          {selectedGoal && (
            <>
              <div
                ref={bannerScrollRef}
                onScroll={handleBannerScroll}
                className="relative z-10 mt-2 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar w-full"
                style={{ touchAction: "pan-x" }}
              >
                {banners.map((banner, index) => (
                  <div
                    key={index}
                    className={`w-full flex-shrink-0 snap-center relative ${banner.image ? "px-0 pb-0" : "px-4 pb-6"
                      }`}
                  >
                    {banner.image ? (
                      <div
                        onClick={() => {
                          if (banner.link) navigate(banner.link);
                        }}
                        className={`w-full h-[175px] bg-transparent ${banner.link ? "cursor-pointer" : ""
                          }`}
                      />
                    ) : (
                      <div className="overflow-hidden select-none">
                        <h2 className="text-white text-[19px] font-bold leading-tight">
                          {banner.title} <br />{" "}
                          <span className="text-white/90 text-[15px] font-medium">
                            {banner.subtitle}
                          </span>
                        </h2>
                        <div className="mt-2.5 inline-block border border-white/20 rounded-md px-2.5 py-0.5 bg-white/5 backdrop-blur-sm">
                          <p className="text-white text-[11px] font-medium tracking-wide">
                            {banner.details}
                          </p>
                        </div>
                        <div className="mt-3.5 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <a href={banner.ctaLink} target="_blank" rel="noreferrer" className="bg-[#FFC000] text-black font-bold px-4 py-1.5 rounded-lg text-[13px] shadow-[0_4px_14px_0_rgba(255,192,0,0.39)] whitespace-nowrap">
                              {banner.cta}
                            </a>
                            {banner.secondaryCta && (
                              <a href={banner.secondaryCtaLink} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-1.5 rounded-lg text-[13px] transition-colors whitespace-nowrap">
                                {banner.secondaryCta}
                              </a>
                            )}
                          </div>
                          <div className="flex items-start gap-1.5 mt-1">
                            <div className="mt-0.5 scale-90">
                              {banner.badgeIcon}
                            </div>
                            <p className="text-white/90 text-[11px] font-medium leading-tight">
                              {banner.badgeText}
                            </p>
                          </div>
                        </div>
                        <p className="text-[9px] text-white/50 mt-2.5">
                          {banner.footerNote}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                {banners.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeBannerIndex === i
                      ? "bg-[#FFC000] w-3"
                      : "bg-white/30"
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scrollable Content */}
        {!selectedGoal ? (
          <div
            className={`flex-1 min-h-[calc(100vh-116px)] ${theme === "dark" ? "bg-[#0B101A]" : "bg-[#F8FAFF]"
              }`}
          />
        ) : (
          <>
            <div className="px-4 mt-6 flex flex-col gap-6 pb-4">
              {/* ── Feedback Card (First Element, No Shadow) ── */}
              {!feedbackSubmitted ? (
                <div className="relative overflow-hidden bg-[#D8ECFC] dark:bg-[#18202F] rounded-md p-5 flex items-center justify-between min-h-[175px] shadow-sm border border-[#BFDBFE] dark:border-slate-800/60">
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 blur-xl pointer-events-none" />
                  <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 blur-2xl pointer-events-none" />

                  <div className="flex-1 z-10 pr-[38%]">
                    <h4 className="text-[17px] font-bold text-[#1E3A8A] dark:text-white leading-snug">
                      How is your experience?
                    </h4>
                    <p className="text-[12px] text-[#475569] dark:text-slate-300 mt-1.5 leading-normal">
                      We're working hard to make learning better. Let us know
                      what you think!
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => {
                          setFeedbackSubmitted(true);
                          navigate("/student/feedback");
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold rounded-md text-xs shadow-sm hover:shadow-md active:scale-95 transition-all"
                      >
                        👍 Loved it!
                      </button>
                      <button
                        onClick={() => {
                          setFeedbackSubmitted(true);
                          navigate("/student/feedback");
                        }}
                        className="flex items-center justify-center w-8 h-8 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white dark:border-slate-700 text-slate-800 dark:text-white rounded-md shadow-sm active:scale-95 transition-all"
                      >
                        👎
                      </button>
                    </div>
                  </div>

                  <div className="absolute right-0 bottom-0 top-0 w-[40%] pointer-events-none flex items-end justify-end">
                    <img
                      src="/feedback_illustration.png"
                      alt="Feedback Illustration"
                      className="h-[95%] w-auto object-contain object-bottom select-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-md p-5 bg-[#D8ECFC] dark:bg-[#1E293B] shadow-sm text-center flex flex-col items-center justify-center min-h-[175px] animate-fade-in border border-[#BFDBFE] dark:border-slate-800/60">
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 blur-xl pointer-events-none" />
                  <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 bg-white/80 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 animate-bounce shadow-sm">
                      <span className="text-lg">💖</span>
                    </div>
                    <h4 className="text-[16px] font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                      Thank you for your feedback!
                    </h4>
                    <p className="text-[12px] text-[#475569] dark:text-slate-400 mt-1 max-w-[280px]">
                      We appreciate your support in making our learning platform
                      better for everyone.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Popular Batches ── */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <div>
                    <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white">
                      Popular batches
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Handpicked for your preparation
                    </p>
                  </div>
                  <button className="flex items-center gap-0.5 text-[12px] font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                    See all <ChevronRight size={14} />
                  </button>
                </div>
                {(() => {
                  const popularBatches = [
                    {
                      id: 1,
                      goal: "MHT-CET",
                      title: "Target Coaching Classes MHT CET Batch 2027",
                      tags: ["Hinglish", "Full Syllabus"],
                      startDate: "15 April 2027",
                      price: "₹1,499",
                      originalPrice: "₹2,000",
                      discount: "SAVE 25%",
                      poster: "/Batch_MHT_CET_2027.png",
                    },
                    {
                      id: 2,
                      goal: "Boards",
                      title: "Target Coaching Classes Boards Batch 2027",
                      tags: ["Hinglish", "Full Syllabus"],
                      startDate: "15 April 2027",
                      price: "₹999",
                      originalPrice: "₹1,500",
                      discount: "SAVE 33%",
                      poster: "/Batch_BOARDS_2027.png",
                    },
                  ];

                  const matchedBatches = popularBatches.filter((b) => {
                    if (!selectedGoal) return true;
                    return (
                      b.goal
                        .toLowerCase()
                        .includes(selectedGoal.toLowerCase()) ||
                      selectedGoal.toLowerCase().includes(b.goal.toLowerCase())
                    );
                  });

                  const finalBatches =
                    matchedBatches.length > 0 ? matchedBatches : popularBatches;

                  return (
                    <div className="flex flex-col gap-5 pb-4">
                      {finalBatches.map((batch) => (
                        <div
                          key={batch.id}
                          className={`w-full overflow-hidden rounded-2xl border transition-all duration-200 active:scale-[0.985] ${theme === "dark"
                            ? "bg-[#0F172A] border-slate-800 shadow-xl"
                            : "bg-white border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
                            }`}
                        >
                          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                            <img
                              src={batch.poster}
                              alt={batch.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="p-4 flex flex-col gap-3">
                            {/* Tags */}
                            <div className="flex items-center gap-2">
                              {batch.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded tracking-wide ${theme === "dark"
                                    ? "bg-[#1E293B] text-slate-350"
                                    : "bg-slate-100 text-slate-650"
                                    }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Title */}
                            <h4
                              className={`text-[15px] font-bold leading-snug line-clamp-2 min-h-[42px] ${theme === "dark"
                                ? "text-white"
                                : "text-slate-850"
                                }`}
                            >
                              {batch.title}
                            </h4>

                            {/* Status Info */}
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                              <span
                                className={`text-[11px] font-medium ${theme === "dark"
                                  ? "text-slate-400"
                                  : "text-slate-500"
                                  }`}
                              >
                                Ongoing | Started {batch.startDate}
                              </span>
                            </div>

                            {/* Divider */}
                            <div
                              className={`border-t my-1 ${theme === "dark"
                                ? "border-slate-800"
                                : "border-slate-100"
                                }`}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => setShowCounsellorModal(true)}
                                className={`flex-1 py-3 border font-bold rounded-lg text-xs tracking-wider transition-colors active:scale-95 ${theme === "dark"
                                  ? "border-[#3B82F6] hover:bg-[#3B82F6]/10 text-[#3B82F6]"
                                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
                                  }`}
                              >
                                View details
                              </button>
                            </div>

                            {/* Contact counsellor link */}
                            <div className="flex items-center justify-center gap-1.5 mt-1 text-[12px]">
                              <span
                                className={
                                  theme === "dark"
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                }
                              >
                                Have questions?
                              </span>
                              <button
                                onClick={() => setShowCounsellorModal(true)}
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
                })()}
              </div>

              {/* ── Results Carousel ── */}
              {resultsPosters.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white mb-3">
                  Our Results
                </h3>
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
                        <img
                          src={src}
                          className="w-full h-full object-cover select-none"
                          alt={`Result Poster ${index + 1}`}
                        />
                      </div>
                      <p className="text-[11.5px] font-semibold text-center text-slate-600 dark:text-slate-400">
                        {index === 0 &&
                          "Celebrating our top rankers in recent mock assessments"}
                        {index === 1 &&
                          "Phenomenal score improvement rates across batches"}
                        {index === 2 &&
                          "Our learners securing top percentiles this academic year"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* ── What Our Learners Say ── */}
              <div>
                <h3 className="text-slate-800 dark:text-white text-lg font-bold mb-3">
                  What our learners say
                </h3>
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
                      className={`flex-shrink-0 w-[calc(100vw-32px)] p-6 snap-center transition-all duration-200 ${theme === "dark"
                        ? "bg-[#18202F] border border-slate-800/80 shadow-none"
                        : "bg-white border border-slate-200 shadow-sm"
                        }`}
                      style={{ borderRadius: 10 }}
                    >
                      <p
                        className={`text-[13.5px] leading-relaxed mb-6 font-normal ${theme === "dark" ? "text-slate-200" : "text-slate-700"
                          }`}
                      >
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
                      className={`h-[3px] rounded-full flex-1 transition-all duration-300 ${activeReviewIdx === idx
                        ? "bg-black dark:bg-white"
                        : "bg-slate-200 dark:bg-slate-800"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Join Prime / Subscription Section ── OUTSIDE px-4 wrapper for true full-width ──
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
                <p className="text-center mt-2 text-slate-400 dark:text-white/40 text-[12px]">Starts from ₹0nth</p>
              </div>
            </div> */}

            {/* ── Study with Your friends banner ── */}
            <div className="px-3 xs:px-4 mt-6">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md p-5 flex items-center justify-between min-h-[145px] shadow-sm">
                <div className="absolute -left-10 -bottom-10 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <div className="flex-1 z-10 pr-[38%]">
                  <h4 className="text-[16px] font-bold text-white leading-snug">
                    Study with Your friends
                  </h4>
                  <p className="text-[11px] text-white/80 mt-1 leading-normal">
                    Invite your friends to Target Coaching Classes app to learn
                    together.
                  </p>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator
                          .share({
                            title: "Target Coaching Classes App",
                            text: "Join me on Target Coaching Classes to study together!",
                            url: window.location.origin,
                          })
                          .catch(() => { });
                      } else {
                        navigator.clipboard.writeText(window.location.origin);
                        alert("App link copied to clipboard!");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 font-bold rounded-md text-xs mt-3.5 shadow-sm active:scale-95 transition-all"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186l5.302 2.651m-5.302-2.651l5.302-2.651m0 0a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Zm0-2.186l5.302 2.651M16.5 18a2.25 2.25 0 1 1-3.935-2.186A2.25 2.25 0 0 1 16.5 18Z"
                      />
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
                      <span className="text-[7px] font-bold bg-blue-100 text-blue-700 px-1 py-0.5 rounded w-max">
                        Learn. Grow.
                      </span>
                      <div className="w-full h-1.5 bg-blue-50 rounded" />
                      <div className="w-full h-1 bg-blue-50 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-3 h-3 rounded-full bg-blue-100 flex items-center justify-center text-[5px] font-bold">
                        🎓
                      </div>
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
                  <div
                    className={`w-full border-t ${theme === "dark" ? "border-slate-800" : "border-slate-200"
                      }`}
                  />
                </div>
                <div
                  className={`relative z-10 w-16 h-16 flex items-center justify-center`}
                >
                  <img
                    src="/logo.png"
                    alt="App Logo"
                    className="w-full h-full object-cover p-1.5"
                  />
                </div>
              </div>

              <div className="text-center">
                <h3
                  className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}
                >
                  We're on social media
                </h3>
                <p
                  className={`text-[12px] mt-2 max-w-md mx-auto leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                >
                  Follow us &amp; share with your friends. it motivates us to
                  keep working hard for you to bring new feature &amp; keep the
                  app FREE.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {socials.map((soc, i) => (
                  <a
                    key={i}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-xs transition-all active:scale-[0.97] border border-transparent
                      ${theme === "dark"
                        ? "bg-[#1E293B] text-slate-200 hover:bg-[#334155]"
                        : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/70"
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
      <CounsellorModal
        isOpen={showCounsellorModal}
        onClose={() => setShowCounsellorModal(false)}
        title="Need help with your subscription?"
      />

      {showScrollTop && (
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
            document.body.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`fixed right-5 z-[5000] w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-95 transition-all ${user?.approved === false ? "bottom-44" : "bottom-28"
            } ${isDark
              ? "bg-[#111A24] text-blue-400 border border-blue-400"
              : "bg-white text-[#25D3A4] border border-[#25D3A4]"
            }`}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <StudentDashboardOverlays user={user} resolveMediaUrl={resolveMediaUrl} />
    </div>
  );
}
