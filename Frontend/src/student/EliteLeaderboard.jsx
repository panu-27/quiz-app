import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowDown, Crown, WifiOff, Trophy, Medal, Star, TrendingUp, Users, Zap } from "lucide-react";
import StudentHeader from "./StudentHeader";

// ── Fallback data ─────────────────────────────────────────────────────────────
const FALLBACK_DATA = [
  { rank: 1, name: "Adison Press", points: "2,569", country: "🇨🇦", avatar: "👩‍🎓" },
  { rank: 2, name: "Ruben Geidt", points: "1,469", country: "🇩🇪", avatar: "🧔" },
  { rank: 3, name: "Jakob Levin", points: "1,053", country: "🇨🇿", avatar: "👨‍🏫" },
  { rank: 4, name: "Madelyn Dias", points: "590", country: "🇮🇳", avatar: "👩‍🎓" },
  { rank: 5, name: "Zain Vaccaro", points: "448", country: "🇮🇹", avatar: "🧔" },
  { rank: 6, name: "Skylar Geidt", points: "410", country: "🇩🇪", avatar: "👩‍💼" },
  { rank: 7, name: "Elena Rossi", points: "370", country: "🇮🇹", avatar: "👩‍🎨" },
  { rank: 8, name: "Yuki Tanaka", points: "350", country: "🇯🇵", avatar: "👩‍🔬" },
  { rank: 9, name: "Lars Thomsen", points: "340", country: "🇩🇰", avatar: "👨‍💻" },
  { rank: 10, name: "Hana Kim", points: "320", country: "🇰🇷", avatar: "👩‍🔬" },
  { rank: 11, name: "Sofia Silva", points: "310", country: "🇧🇷", avatar: "👩‍🎓" },
  { rank: 12, name: "Liam O'Brien", points: "295", country: "🇮🇪", avatar: "👨‍💼", current: true },
];

// ── YouTube-style thin top loading bar ───────────────────────────────────────
function LoadingBar({ active }) {
  if (!active) return null;
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] overflow-hidden pointer-events-none">
        <div className="h-full bg-[#7A41F7] rounded-full" style={{ animation: 'ytbar 1.8s ease-in-out infinite' }} />
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }
        @keyframes ytbar {
          0%   { width: 0%;  margin-left: 0%;   opacity: 1; }
          50%  { width: 75%; margin-left: 10%; }
          90%  { width: 15%; margin-left: 90%;  opacity: 1; }
          100% { width: 0%;  margin-left: 100%; opacity: 0; }
        }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: floatUp 0.4s ease both; }
      `}</style>
    </>
  );
}

// ── Skeleton shimmer ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="px-4 py-3 rounded-[2rem] bg-white border border-slate-100 flex items-center gap-4 animate-pulse">
      <div className="w-5 h-3 bg-slate-100 rounded-full" />
      <div className="w-12 h-12 bg-slate-100 rounded-[1.4rem]" />
      <div className="flex-1 space-y-2">
        <div className="w-28 h-3 bg-slate-100 rounded-full" />
        <div className="w-16 h-2 bg-slate-100 rounded-full" />
      </div>
      <div className="w-7 h-7 bg-slate-100 rounded-xl" />
    </div>
  );
}

function SkeletonPodium({ height }) {
  return (
    <div className={`flex flex-col items-center flex-1 max-w-[95px] min-w-[80px] animate-pulse`}>
      <div className="w-16 h-16 bg-white/20 rounded-[1.8rem] mb-6" />
      <div className={`w-full ${height} bg-white/20 rounded-t-xl`} />
    </div>
  );
}

// ── Podium bar (mobile — original unchanged) ──────────────────────────────────
function PodiumBar({ rank, user, height, color, topColor, sideColor, isWinner, zIndex = "" }) {
  return (
    <div className={`flex flex-col items-center flex-1 max-w-[95px] min-w-[80px] ${zIndex} transition-all duration-500`}>
      <div className="mb-6 relative flex flex-col items-center group">
        {isWinner && (
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 rotate-[12deg] drop-shadow-2xl">
            <Crown size={30} className="text-amber-400 fill-amber-400 animate-[pulse_1.6s_ease-in-out_infinite]" />
          </div>
        )}
        <div className={`
          w-16 h-16 rounded-[1.8rem] border-[5px] bg-white
          flex items-center justify-center text-3xl relative transition-all duration-300 ease-out
          ${isWinner
            ? 'border-amber-400 shadow-[0_12px_30px_rgba(245,158,11,0.45)] scale-110'
            : 'border-white/90 shadow-[0_10px_24px_rgba(0,0,0,0.25)]'}
          group-hover:scale-[1.08] group-hover:-translate-y-1.5
        `}>
          <span className="drop-shadow-sm">{user.avatar}</span>
          <span className="absolute -bottom-1 -right-1 text-[9px] bg-white rounded-md px-1.5 py-0.5 shadow-lg border border-slate-100 font-bold">
            {user.country}
          </span>
        </div>
        <p className="text-[11px] font-extrabold text-white uppercase mt-3 tracking-tight text-center w-full truncate px-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
          {user.name.split(' ')[0]}
        </p>
        <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
          <p className="text-[9px] font-extrabold text-white leading-none tracking-wide">{user.points} QP</p>
        </div>
      </div>

      <div className={`relative w-full ${height} group/box`}>
        <div
          className="absolute -top-3.5 left-0 w-full h-8 z-10"
          style={{
            backgroundColor: topColor,
            transform: 'rotateX(65deg) scaleY(1.3) scaleX(1.05)',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.2), 0 5px 15px rgba(0,0,0,0.1)'
          }}
        />
        <div className={`w-full h-full ${color} flex items-center justify-center relative shadow-2xl rounded-b-xl overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-tr before:from-black/10 before:to-transparent`}>
          <span className="text-5xl font-black text-gray-100 select-none tracking-tighter mt-4">{rank}</span>
          <div className="absolute top-0 left-2 w-[1px] h-full bg-white/10" />
        </div>
        <div
          className={`absolute top-0 right-0 w-2.5 h-full ${sideColor} origin-left skew-y-[45deg] translate-x-full rounded-r-sm`}
          style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)' }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DESKTOP TOP-3 HERO CARDS
══════════════════════════════════════════════════ */
function DesktopTopCard({ user, rank }) {
  const configs = {
    1: {
      bg: "bg-gradient-to-br from-[#7A41F7] to-[#5B2ED6]",
      border: "border-[#7A41F7]/30",
      shadow: "shadow-[0_20px_60px_rgba(122,65,247,0.35)]",
      badge: "bg-amber-400 text-slate-900",
      badgeIcon: <Crown size={14} fill="currentColor" />,
      size: "w-20 h-20 text-4xl",
      nameColor: "text-white",
      ptColor: "text-white/70",
      scale: "scale-105",
      rankStyle: "text-amber-400",
      glow: true,
    },
    2: {
      bg: "bg-white",
      border: "border-slate-100",
      shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
      badge: "bg-slate-200 text-slate-600",
      badgeIcon: <Medal size={14} />,
      size: "w-16 h-16 text-3xl",
      nameColor: "text-slate-800",
      ptColor: "text-slate-400",
      scale: "",
      rankStyle: "text-slate-400",
      glow: false,
    },
    3: {
      bg: "bg-white",
      border: "border-slate-100",
      shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
      badge: "bg-orange-100 text-orange-600",
      badgeIcon: <Medal size={14} />,
      size: "w-16 h-16 text-3xl",
      nameColor: "text-slate-800",
      ptColor: "text-slate-400",
      scale: "",
      rankStyle: "text-orange-400",
      glow: false,
    },
  };
  const c = configs[rank];

  return (
    <div className={`relative ${c.bg} ${c.shadow} border ${c.border} rounded-3xl p-6 flex flex-col items-center gap-3 ${c.scale} transition-transform hover:scale-[1.03] cursor-pointer`}>
      {c.glow && <div className="absolute inset-0 rounded-3xl bg-white/5 pointer-events-none" />}

      {/* Rank badge */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${c.badge}`}>
        {c.badgeIcon} #{rank}
      </div>

      {/* Avatar */}
      <div className={`${c.size} rounded-[1.4rem] bg-slate-50 flex items-center justify-center mt-3 border-2 ${rank === 1 ? 'border-amber-400/40' : 'border-slate-100'} shadow-inner`}>
        {user.avatar}
      </div>

      <div className="text-center">
        <p className={`text-sm font-bold ${c.nameColor} font-display leading-tight`}>{user.name}</p>
        <p className={`text-xs ${c.ptColor} mt-0.5 font-semibold`}>{user.country}</p>
      </div>

      <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${rank === 1 ? 'bg-white/20 text-white' : 'bg-[#F3EBFF] text-[#7A41F7]'}`}>
        {user.points} QP
      </div>
    </div>
  );
}

/* ── Desktop rank row ── */
function DesktopRankRow({ user, index }) {
  const isTop5 = user.rank <= 5;
  return (
    <div className={`
      flex items-center gap-4 px-5 py-4 rounded-2xl transition-all
      ${user.current
        ? 'bg-[#7A41F7] shadow-lg shadow-purple-200/60'
        : isTop5 ? 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100'
          : 'bg-white border border-slate-50 hover:border-slate-100'
      }
    `} style={{ animationDelay: `${index * 40}ms` }}>
      {/* Rank number */}
      <div className={`w-8 text-center text-xs font-bold shrink-0 ${user.current ? 'text-white/60' : 'text-slate-300'}`}>
        {String(user.rank).padStart(2, "0")}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${user.current ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'}`}>
          {user.avatar}
        </div>
        <span className="absolute -bottom-1 -right-1 text-[9px] bg-white rounded-md shadow border border-slate-100 px-1">{user.country}</span>
      </div>

      {/* Name + points */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${user.current ? 'text-white' : 'text-slate-800'} font-display`}>{user.name}</p>
        <p className={`text-[10px] font-semibold mt-0.5 ${user.current ? 'text-white/60' : 'text-slate-400'}`}>{user.points} points</p>
      </div>

      {/* Points bar */}
      <div className="w-24 hidden xl:block">
        <div className={`h-1.5 rounded-full ${user.current ? 'bg-white/20' : 'bg-slate-100'}`}>
          <div
            className={`h-full rounded-full ${user.current ? 'bg-white/60' : 'bg-[#7A41F7]'}`}
            style={{ width: `${Math.min(100, (parseInt(user.points.replace(',', '')) / 2569) * 100)}%` }}
          />
        </div>
      </div>

      {/* Arrow */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${user.current ? 'bg-white/20' : 'bg-slate-50'}`}>
        <ChevronRight size={14} strokeWidth={2.5} className={user.current ? 'text-white' : 'text-slate-300'} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EliteLeaderboard() {
  const [allRanks, setAllRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showStickyBanner, setShowStickyBanner] = useState(false);
  const userRankRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/get-class-leaderboard');
        if (!res.ok) throw new Error('bad response');
        const json = await res.json();
        if (!cancelled) {
          setAllRanks(Array.isArray(json) ? json : FALLBACK_DATA);
          setUsingFallback(false);
        }
      } catch {
        if (!cancelled) { setAllRanks(FALLBACK_DATA); setUsingFallback(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBanner(!entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (userRankRef.current) observer.observe(userRankRef.current);
    return () => observer.disconnect();
  }, [loading, allRanks]);

  const top3 = allRanks.length >= 3 ? [allRanks[1], allRanks[0], allRanks[2]] : null;
  const remaining = allRanks.slice(3);
  const currentUser = allRanks.find(u => u.current);
  const scrollToUser = () => userRankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  /* ══════════════════════════════════════════════════════
     STYLES
  ══════════════════════════════════════════════════════ */
  const globalStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap');
    * { font-family: 'DM Sans', sans-serif; }
    .font-display { font-family: 'Sora', sans-serif; }
    @keyframes ytbar {
      0%   { width: 0%;  margin-left: 0%;   opacity: 1; }
      50%  { width: 75%; margin-left: 10%; }
      90%  { width: 15%; margin-left: 90%;  opacity: 1; }
      100% { width: 0%;  margin-left: 100%; opacity: 0; }
    }
    @keyframes floatUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: floatUp 0.4s ease both; }
  `;

  return (
    <>
      <style>{globalStyle}</style>
      <LoadingBar active={loading} />

      {/* ══════════════════════════════════════════
          MOBILE LAYOUT — completely unchanged
      ══════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen bg-[#7A41F7] font-sans relative overflow-x-hidden selection:bg-indigo-300">

        {usingFallback && !loading && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5 z-20">
            <WifiOff size={10} className="text-white/70" />
            <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">Demo data</span>
          </div>
        )}

        {/* sticky podium */}
        <div className="sticky top-0 h-[520px] w-full flex flex-col z-10">
          <div className="flex-1 flex items-end justify-center gap-0 w-full max-w-sm mx-auto pb-15 px-4">
            {loading || !top3 ? (
              <>
                <SkeletonPodium height="h-32" />
                <SkeletonPodium height="h-48" />
                <SkeletonPodium height="h-24" />
              </>
            ) : (
              <>
                <PodiumBar rank={2} user={top3[0]} height="h-32" color="bg-[#9B86F7]" topColor="#CFC5FF" sideColor="#6A52D9" />
                <PodiumBar rank={1} user={top3[1]} height="h-48" color="bg-[#B7A6FF]" topColor="#E6E1FF" sideColor="#7D68E6" isWinner zIndex="z-10" />
                <PodiumBar rank={3} user={top3[2]} height="h-24" color="bg-[#9B86F7]" topColor="#CFC5FF" sideColor="#6A52D9" />
              </>
            )}
          </div>
        </div>

        {/* overlay list */}
        <div
          ref={listRef}
          className="relative z-50 bg-[#F8FAFC] rounded-t-[3rem] shadow-[0_-40px_80px_rgba(0,0,0,0.4)] min-h-screen -mt-16"
        >
          <div className="w-full flex justify-center pt-5 pb-2">
            <div className="w-11 h-1.5 bg-slate-200 rounded-full" />
          </div>

          <div className="px-5 space-y-3 pb-48 max-w-lg mx-auto">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] text-center mb-5">
              Intelligence Ranking
            </p>

            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              : remaining.map((user) => (
                <div
                  key={user.rank}
                  ref={user.current ? userRankRef : null}
                  className={`
                      px-4 py-3 rounded-[2rem] flex items-center justify-between
                      transition-all active:scale-[0.98]
                      ${user.current
                      ? 'bg-white ring-[3px] ring-indigo-500 shadow-lg shadow-indigo-100'
                      : 'bg-white border border-slate-100 shadow-sm'
                    }
                    `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black w-5 text-center ${user.current ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {user.rank < 10 ? `0${user.rank}` : user.rank}
                    </span>
                    <div className="relative">
                      <div className="w-12 h-12 bg-slate-50 rounded-[1.4rem] flex items-center justify-center text-xl shadow-inner">
                        <span className="drop-shadow-md">{user.avatar}</span>
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-[10px] bg-white rounded-lg shadow-sm px-1 border border-slate-100">
                        {user.country}
                      </span>
                    </div>
                    <div>
                      <p className={`text-xs font-black tracking-tight leading-none ${user.current ? 'text-indigo-600' : 'text-slate-800'}`}>
                        {user.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tight">
                        {user.points} points
                      </p>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-xl ${user.current ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}`}>
                    <ChevronRight size={16} strokeWidth={3} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* sticky bottom banner */}
        {showStickyBanner && currentUser && (
          <div className="fixed bottom-18 left-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-6 duration-500">
            <button
              onClick={scrollToUser}
              className="w-full h-18 bg-slate-900/95 backdrop-blur-md text-white px-5 rounded-4xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center pt-2 justify-center shadow-lg shadow-indigo-500/20">
                  <ArrowDown size={18} strokeWidth={3} className="animate-bounce" />
                </div>
                <div className="text-left">
                  <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1">Instant Jump</p>
                  <p className="text-[11px] font-black uppercase tracking-tight leading-none">
                    #{currentUser.rank} <span className="text-slate-400 mx-1">•</span> {currentUser.name}
                  </p>
                </div>
              </div>
              <div className="bg-white/5 p-1.5 rounded-xl border border-white/5">
                <ChevronRight size={16} strokeWidth={3} className="text-indigo-400" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT — creative, dashboard-inspired
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col min-h-screen bg-[#F6F8FC]">

        {/* Dashboard-style header */}

        <div className="max-w-7xl mx-auto w-full px-16 xl:px-24 2xl:px-20  py-8">

          {/* ── Page title + meta ── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Institute Rankings</p>
              <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Leaderboard</h1>
            </div>
            {usingFallback && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-4 py-2">
                <WifiOff size={11} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Demo Data</span>
              </div>
            )}
          </div>

          {loading ? (
            /* ── Loading skeletons desktop ── */
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-5">
                {[0, 1, 2].map(i => <div key={i} className="h-[180px] bg-white rounded-3xl animate-pulse border border-slate-100" />)}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-3">
                  {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
                </div>
                <div className="h-[400px] bg-white rounded-3xl animate-pulse border border-slate-100" />
              </div>
            </div>
          ) : (
            <div className="fade-up">

              {/* ── Top 3 hero cards ── */}
              {top3 && (
                <div className="grid grid-cols-3 gap-5 mb-8 items-end">
                  {/* 2nd */}
                  <DesktopTopCard user={top3[0]} rank={2} />
                  {/* 1st — center, slightly larger */}
                  <DesktopTopCard user={top3[1]} rank={1} />
                  {/* 3rd */}
                  <DesktopTopCard user={top3[2]} rank={3} />
                </div>
              )}

              {/* ── Main grid: rank list + sidebar ── */}
              <div className="grid grid-cols-3 gap-6">

                {/* Rank list — col-span-2 */}
                <div className="col-span-2">

               
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Standings
                    </p>
                    <span className="text-[10px] font-bold text-slate-400">
                      {allRanks.length} Students
                    </span>
                  </div>

                  {/* Scrollable list */}
                  <div className="
                     space-y-2
                     max-h-[620px]     /* adjust height = ~10 rows */
                     overflow-y-auto
                     pr-2
                     no-scrollbar
                   ">
                    {allRanks.map((user, idx) => (
                      <div key={user.rank} ref={user.current ? userRankRef : null}>
                        <DesktopRankRow user={user} index={idx} />
                      </div>
                    ))}
                  </div>

                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-5">
                    <br/>
                  {/* Your position card */}
                  {currentUser && (
                    <div className="bg-gradient-to-br from-[#7A41F7] to-[#5B2ED6] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-purple-200/50">
                      <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
                      <div className="absolute right-[20px] bottom-[20px] w-16 h-16 bg-white/10 rounded-full pointer-events-none" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Your Position</p>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-bold font-display leading-none">#{currentUser.rank}</span>
                        <span className="text-white/50 text-sm font-semibold mb-1">of {allRanks.length}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">{currentUser.avatar}</div>
                        <div>
                          <p className="text-sm font-bold font-display">{currentUser.name}</p>
                          <p className="text-[10px] text-white/60 font-semibold">{currentUser.points} QP</p>
                        </div>
                      </div>
                      <button
                        onClick={scrollToUser}
                        className="mt-5 w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl py-2.5 text-xs font-bold transition-all"
                      >
                        <ArrowDown size={13} /> Jump to my rank
                      </button>
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</p>
                    <div className="space-y-3">
                      {[
                        { label: "Total Students", value: allRanks.length, icon: <Users size={14} className="text-[#7A41F7]" />, bg: "bg-[#F3EBFF]" },
                        { label: "Top Score", value: allRanks[0]?.points + " QP", icon: <Zap size={14} className="text-amber-500" />, bg: "bg-amber-50" },
                        { label: "Your Points", value: currentUser?.points + " QP" || "—", icon: <Star size={14} className="text-emerald-500" />, bg: "bg-emerald-50" },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold text-slate-400">{s.label}</p>
                            <p className="text-sm font-bold text-slate-800 font-display">{s.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>


                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}