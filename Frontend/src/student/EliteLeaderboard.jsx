import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowUp, Crown, WifiOff, Medal, Star, Users, Zap } from "lucide-react";
import api from "../api/axios";


const FALLBACK_DATA = [
  { rank: 1, name: "Adison Press", points: "2,569", country: "🇨🇦", avatar: null },
  { rank: 2, name: "Ruben Geidt", points: "1,469", country: "🇩🇪", avatar: null },
  { rank: 3, name: "Jakob Levin", points: "1,053", country: "🇨🇿", avatar: null },
  { rank: 4, name: "Madelyn Dias", points: "590", country: "🇮🇳", avatar: null },
  { rank: 5, name: "Zain Vaccaro", points: "448", country: "🇮🇹", avatar: null },
  { rank: 6, name: "Skylar Geidt", points: "410", country: "🇩🇪", avatar: null },
  { rank: 7, name: "Elena Rossi", points: "370", country: "🇮🇹", avatar: null },
  { rank: 8, name: "Yuki Tanaka", points: "350", country: "🇯🇵", avatar: null },
  { rank: 9, name: "Lars Thomsen", points: "340", country: "🇩🇰", avatar: null },
  { rank: 10, name: "Hana Kim", points: "320", country: "🇰🇷", avatar: null },
  { rank: 11, name: "Sofia Silva", points: "310", country: "🇧🇷", avatar: null },
  { rank: 12, name: "Liam O'Brien", points: "295", country: "🇮🇪", avatar: null, current: true },
];

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { font-family: 'DM Sans', sans-serif; }
  .font-display { font-family: 'Sora', sans-serif; }
  @keyframes floatUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: floatUp 0.35s ease both; }
  .no-scrollbar::-webkit-scrollbar { display:none; }
  .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
  @keyframes softPulse {
    0%,100% { opacity:0.45; transform:scale(1); }
    50%      { opacity:0.85; transform:scale(1.07); }
  }
  .petal-glow  { animation: softPulse 2.6s ease-in-out infinite; }
  .petal-glow2 { animation: softPulse 2.6s ease-in-out infinite 0.5s; }
  @keyframes ringPulse {
    0%,100% { opacity:0.6; transform:scale(1); }
    50%      { opacity:1;   transform:scale(1.05); }
  }
  .ring-pulse { animation: ringPulse 2.4s ease-in-out infinite; }
`;

/* ─────────────────────────────────────
   Avatar — image if valid URL, else initial
───────────────────────────────────── */
function Avatar({ src, name, size = 40, className = "" }) {
  const [failed, setFailed] = useState(false);
  const isUrl = src && (src.startsWith('http') || src.startsWith('/'));
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const base = {
    width: size, height: size, borderRadius: '50%',
    flexShrink: 0, overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  if (!isUrl || failed) {
    return (
      <div style={{ ...base, background: 'linear-gradient(135deg,#a78bfa,#7A41F7)', color: 'white', fontWeight: 700, fontSize: size * 0.38 }} className={className}>
        {initial}
      </div>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setFailed(true)}
      style={{ ...base, objectFit: 'cover' }} className={className} />
  );
}

/* ─────────────────────────────────────
   DESKTOP — Top-3 cards (original layout, circles inside)
───────────────────────────────────── */
function DesktopTopCard({ user, rank }) {
  const configs = {
    1: {
      bg: "bg-gradient-to-br from-[#7A41F7] to-[#5B2ED6]",
      border: "border-[#7A41F7]/30",
      shadow: "shadow-[0_20px_60px_rgba(122,65,247,0.35)]",
      badge: "bg-amber-400 text-slate-900",
      avatarSize: 80,
      ringColor: "#F59E0B",
      ringGlow: "rgba(245,158,11,0.45)",
      nameColor: "text-white",
      ptColor: "text-white/70",
      ptBg: "bg-white/20 text-white",
      scale: "scale-105",
    },
    2: {
      bg: "bg-white",
      border: "border-slate-100",
      shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
      badge: "bg-slate-200 text-slate-600",
      avatarSize: 64,
      ringColor: "#94A3B8",
      ringGlow: "rgba(148,163,184,0.35)",
      nameColor: "text-slate-800",
      ptColor: "text-slate-400",
      ptBg: "bg-[#F3EBFF] text-[#7A41F7]",
      scale: "",
    },
    3: {
      bg: "bg-white",
      border: "border-slate-100",
      shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
      badge: "bg-orange-100 text-orange-600",
      avatarSize: 64,
      ringColor: "#CD7C3A",
      ringGlow: "rgba(205,124,58,0.35)",
      nameColor: "text-slate-800",
      ptColor: "text-slate-400",
      ptBg: "bg-[#F3EBFF] text-[#7A41F7]",
      scale: "",
    },
  };
  const c = configs[rank];
  return (
    <div className={`relative ${c.bg} ${c.shadow} border ${c.border} rounded-3xl p-6 flex flex-col items-center gap-3 ${c.scale} transition-transform hover:scale-[1.03] cursor-pointer`}>
      {/* Rank badge */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${c.badge}`}>
        {c.badgeIcon} #{rank}
      </div>

      {/* Circle avatar with colored ring */}
      <div className="mt-3 relative" style={{ width: c.avatarSize + 12, height: c.avatarSize + 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer glow ring for #1 */}
        {rank === 1 && (
          <div className="absolute ring-pulse rounded-full" style={{ width: c.avatarSize + 20, height: c.avatarSize + 20, border: `2px solid ${c.ringColor}30`, backgroundColor: `${c.ringColor}0D` }} />
        )}
        {/* Colored ring */}
        <div className="absolute rounded-full" style={{ width: c.avatarSize + 8, height: c.avatarSize + 8, border: `3px solid ${c.ringColor}`, boxShadow: `0 0 14px ${c.ringGlow}` }} />
        {/* Avatar */}
        <Avatar src={user.avatar} name={user.name} size={c.avatarSize} />
      </div>

      {/* Name + country */}
      <div className="text-center">
        <p className={`text-sm font-bold ${c.nameColor} font-display leading-tight`}>{user.name}</p>
        <p className={`text-xs mt-0.5 font-semibold ${c.ptColor}`}>{user.country}</p>
      </div>

      {/* Points pill */}
      <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${c.ptBg}`}>
        {user.points} score
      </div>
    </div>
  );
}

/* ── Desktop Rank Row — circle avatar ── */
function DesktopRankRow({ user, index, innerRef }) {
  const isTop5 = user.rank <= 5;
  const ringColor = user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#CD7C3A' : null;
  const ringGlow = user.rank === 1 ? 'rgba(245,158,11,0.3)' : user.rank === 2 ? 'rgba(148,163,184,0.25)' : user.rank === 3 ? 'rgba(205,124,58,0.25)' : null;

  return (
    <div
      ref={innerRef}
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all
        ${user.current ? 'bg-[#7A41F7] shadow-lg shadow-purple-200/60'
          : isTop5 ? 'bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100'
            : 'bg-white border border-slate-50 hover:border-slate-100'}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className={`w-8 text-center text-xs font-bold shrink-0 ${user.current ? 'text-white/60' : 'text-slate-300'}`}>
        {String(user.rank).padStart(2, "0")}
      </div>

      {/* Circle avatar */}
      <div className="relative shrink-0" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="absolute rounded-full" style={{
          width: 44, height: 44,
          border: ringColor ? `2.5px solid ${ringColor}` : user.current ? '2px solid rgba(255,255,255,0.35)' : '1.5px solid #e2e8f0',
          boxShadow: ringGlow ? `0 0 10px ${ringGlow}` : 'none',
        }} />
        <Avatar src={user.avatar} name={user.name} size={38} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate font-display ${user.current ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
        <p className={`text-[10px] font-semibold mt-0.5 ${user.current ? 'text-white/60' : 'text-slate-400'}`}>{user.points} score</p>
      </div>


    </div>
  );
}

/* ─────────────────────────────────────
   MOBILE — Circle Podium
   handles 1 / 2 / 3 users gracefully
───────────────────────────────────── */
const RING = {
  1: { color: '#F59E0B', glow: 'rgba(245,158,11,0.4)', outer: 'rgba(245,158,11,0.15)' },
  2: { color: '#94A3B8', glow: 'rgba(148,163,184,0.3)', outer: null },
  3: { color: '#CD7C3A', glow: 'rgba(205,124,58,0.3)', outer: null },
};

function PodiumCircle({ user, rank, size = 70, elevated = false }) {
  const r = RING[rank] || RING[3];
  const wrap = size + 14;
  return (
    <div className={`flex flex-col items-center gap-1.5 ${elevated ? '-mt-6 z-10' : ''}`}>
      {/* Crown for #1, spacer for others */}
      {rank === 1
        ? null
        : <div className="h-[26px]" />}

      <div className="relative flex items-center justify-center" style={{ width: wrap, height: wrap }}>
        {/* Outer pulse ring — #1 only */}
        {rank === 1 && (
          <div className="absolute ring-pulse rounded-full" style={{ width: wrap + 10, height: wrap + 10, border: `2px solid ${r.outer}`, backgroundColor: r.outer }} />
        )}
        {/* Main ring */}
        <div className="absolute rounded-full" style={{ width: wrap, height: wrap, border: `3px solid ${r.color}`, boxShadow: `0 0 16px ${r.glow}` }} />
        {/* Avatar */}
        <Avatar src={user.avatar} name={user.name} size={size} />
      </div>

      <p className="font-bold text-white text-center truncate font-display" style={{ fontSize: elevated ? 13 : 11, maxWidth: wrap + 12 }}>
        {user.name.split(' ')[0]}
      </p>
      <div className="px-2.5 py-0.5 rounded-full font-bold" style={{ fontSize: 9, background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
        {user.points} score
      </div>
    </div>
  );
}

function MobilePodium({ podiumUsers }) {
  const first = podiumUsers.find(u => u.rank === 1);
  const second = podiumUsers.find(u => u.rank === 2);
  const third = podiumUsers.find(u => u.rank === 3);

  if (podiumUsers.length === 1 && first) {
    return <div className="flex justify-center py-6"><PodiumCircle user={first} rank={1} size={90} elevated /></div>;
  }
  if (podiumUsers.length === 2) {
    return (
      <div className="flex items-end justify-center gap-8 py-4 px-6">
        {second && <PodiumCircle user={second} rank={2} size={68} />}
        {first && <PodiumCircle user={first} rank={1} size={84} elevated />}
      </div>
    );
  }
  return (
    <div className="flex items-end justify-center gap-4 px-6 py-2">
      <div className="flex-1 flex justify-center mb-1">{second && <PodiumCircle user={second} rank={2} size={64} />}</div>
      <div className="flex-1 flex justify-center">{first && <PodiumCircle user={first} rank={1} size={80} elevated />}</div>
      <div className="flex-1 flex justify-center mb-1">{third && <PodiumCircle user={third} rank={3} size={64} />}</div>
    </div>
  );
}

/* ── Mobile Rank Row ── */
function MobileRankRow({ user, innerRef }) {
  const ringColor = user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#CD7C3A' : null;
  const ringGlow = user.rank === 1 ? 'rgba(245,158,11,0.3)' : user.rank === 2 ? 'rgba(148,163,184,0.25)' : user.rank === 3 ? 'rgba(205,124,58,0.25)' : null;

  return (
    <div
      ref={innerRef}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl active:scale-[0.98] transition-all
        ${user.current ? 'bg-[#7A41F7] shadow-md' : 'bg-white border border-slate-100'}`}
    >
      <span className={`text-xs font-bold w-5 text-center shrink-0 ${user.current ? 'text-white/50' : 'text-slate-300'}`}>
        {String(user.rank).padStart(2, '0')}
      </span>

      {/* Circle avatar with ring for top 3 */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: 42, height: 42 }}>
        <div className="absolute rounded-full" style={{
          width: 42, height: 42,
          border: ringColor ? `2px solid ${ringColor}` : user.current ? '2px solid rgba(255,255,255,0.3)' : '1.5px solid #e2e8f0',
          boxShadow: ringGlow ? `0 0 8px ${ringGlow}` : 'none',
        }} />
        <Avatar src={user.avatar} name={user.name} size={36} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight ${user.current ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
        <p className={`text-[10px] font-medium mt-0.5 ${user.current ? 'text-white/60' : 'text-slate-400'}`}>{user.points} score</p>
      </div>

    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100 animate-pulse">
      <div className="w-5 h-3 bg-slate-100 rounded-full" />
      <div className="w-10 h-10 bg-slate-100 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="w-24 h-3 bg-slate-100 rounded-full" />
        <div className="w-14 h-2 bg-slate-100 rounded-full" />
      </div>
      <div className="w-4 h-4 bg-slate-100 rounded" />
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN
───────────────────────────────────── */
export default function EliteLeaderboard() {
  const [allRanks, setAllRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showJumpBtn, setShowJumpBtn] = useState(false);

  const userRankRef = useRef(null);
  const desktopUserRef = useRef(null);
  // 1. Correct Vite Env access
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // 2. Axios call (Note: If your 'api' instance already has a baseURL, 
        // just use "/leaderboard/stats/all")
        const res = await api.get(`${baseURL}/leaderboard/stats/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 3. Axios stores the response in .data automatically
        const data = res.data;

        if (!cancelled) {
          setAllRanks(Array.isArray(data) && data.length > 0 ? data : FALLBACK_DATA);
          setUsingFallback(!Array.isArray(data) || data.length === 0);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (!cancelled) {
          setAllRanks(FALLBACK_DATA);
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading || !userRankRef.current) return;
    const observer = new IntersectionObserver(([e]) => setShowJumpBtn(!e.isIntersecting), { threshold: 0.5 });
    observer.observe(userRankRef.current);
    return () => observer.disconnect();
  }, [loading, allRanks]);

  const podiumUsers = allRanks.slice(0, Math.min(3, allRanks.length));
  const listRanks = allRanks.slice(podiumUsers.length);
  const currentUser = allRanks.find(u => u.current);
  const currentInTop5 = currentUser && currentUser.rank <= 5;

  // For desktop top-3 cards — [2nd, 1st, 3rd] order
  const desktopTop3 = allRanks.length >= 3
    ? [allRanks[1], allRanks[0], allRanks[2]]
    : null;

  const scrollToUser = () => userRankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const desktopScrollToUser = () => desktopUserRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ════════════════ MOBILE ════════════════ */}
      <div className="lg:hidden min-h-screen bg-[#7A41F7] relative flex flex-col">

        <div className="px-5 pt-12 pb-2 flex items-center justify-between shrink-0">
          <br />


          {usingFallback && (
            <div className="flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1.5">
              <WifiOff size={10} className="text-white/60" />
              <span className="text-[9px] font-bold text-white/60 uppercase">Demo</span>
            </div>
          )}
        </div>

        {/* Podium */}
        <div className="shrink-0 px-2">
          {loading ? (
            <div className="flex items-end justify-center gap-6 py-8 px-6">
              {[68, 84, 68].map((s, i) => (
                <div key={i} className={`flex flex-col items-center gap-2 animate-pulse ${i === 1 ? '-mt-4' : 'mb-2'}`}>
                  <div className="rounded-full bg-white/20" style={{ width: s, height: s }} />
                  <div className="w-14 h-2 bg-white/15 rounded-full mt-1" />
                  <div className="w-10 h-2 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          ) : podiumUsers.length > 0 ? (
            <MobilePodium podiumUsers={podiumUsers} />
          ) : null}
        </div>

        {/* White sheet */}
        <div className="flex-1 bg-[#F6F8FC] rounded-t-[2rem] overflow-y-auto no-scrollbar" style={{ paddingBottom: '160px', minHeight: '55vh' }}>
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-4 mb-4" />

          {listRanks.length > 0 && (
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-4">Rankings</p>
          )}

          <div className="space-y-2 px-4 max-w-md mx-auto">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : listRanks.map(user => (
                <MobileRankRow key={user.rank} user={user} innerRef={user.current ? userRankRef : null} />
              ))
            }
            {!loading && allRanks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <span className="text-5xl">🏆</span>
                <p className="text-slate-500 font-semibold text-sm">No rankings yet</p>
                <p className="text-slate-400 text-xs">Be the first to complete the test!</p>
              </div>
            )}
          </div>
        </div>

        {/* Jump button */}
        {showJumpBtn && currentUser && !currentInTop5 && (
          <div className="fixed left-4 right-4 z-[60]" style={{ bottom: '86px' }}>
            <button
              onClick={scrollToUser}
              className="w-full bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-white/10 active:scale-[0.97] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full overflow-hidden shrink-0 border border-white/20" style={{ width: 34, height: 34 }}>
                  <Avatar src={currentUser.avatar} name={currentUser.name} size={34} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Your rank</p>
                  <p className="text-sm font-bold leading-none">#{currentUser.rank} · {currentUser.name.split(' ')[0]} · {currentUser.points} score</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-1.5 shrink-0">
                <ArrowUp size={14} className="text-purple-400" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ════════════════ DESKTOP ════════════════ */}
      <div className="hidden lg:flex flex-col min-h-screen bg-[#F6F8FC]">
        <div className="max-w-7xl mx-auto w-full px-16 xl:px-24 2xl:px-20 py-8">

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
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-5">
                {[0, 1, 2].map(i => <div key={i} className="h-[200px] bg-white rounded-3xl animate-pulse border border-slate-100" />)}
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-3">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse border border-slate-100" />)}</div>
                <div className="h-[400px] bg-white rounded-3xl animate-pulse border border-slate-100" />
              </div>
            </div>
          ) : (
            <div className="fade-up">

              {/* Top-3 cards — original grid layout, circles inside */}
              {desktopTop3 && (
                <div className="grid grid-cols-3 gap-5 mb-8 items-end">
                  <DesktopTopCard user={desktopTop3[0]} rank={2} />
                  <DesktopTopCard user={desktopTop3[1]} rank={1} />
                  <DesktopTopCard user={desktopTop3[2]} rank={3} />
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standings</p>
                    <span className="text-[10px] font-bold text-slate-400">{allRanks.length} Students</span>
                  </div>
                  <div className="space-y-2 max-h-[620px] overflow-y-auto pr-2 no-scrollbar">
                    {allRanks.map((user, idx) => (
                      <DesktopRankRow
                        key={user.rank}
                        user={user}
                        index={idx}
                        innerRef={user.current ? desktopUserRef : null}
                      />
                    ))}
                    {allRanks.length === 0 && (
                      <div className="flex flex-col items-center py-16 gap-3">
                        <span className="text-4xl">🏆</span>
                        <p className="text-slate-400 text-sm font-semibold">No rankings yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-5">
                  <br />
                  {currentUser && (
                    <div className="bg-gradient-to-br from-[#7A41F7] to-[#5B2ED6] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-purple-200/50">
                      <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Your Position</p>
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-bold font-display leading-none">#{currentUser.rank}</span>
                        <span className="text-white/50 text-sm font-semibold mb-1">of {allRanks.length}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-full overflow-hidden shrink-0" style={{ width: 44, height: 44, border: '2px solid rgba(255,255,255,0.4)' }}>
                          <Avatar src={currentUser.avatar} name={currentUser.name} size={40} />
                        </div>
                        <div>
                          <p className="text-sm font-bold font-display">{currentUser.name}</p>
                          <p className="text-[10px] text-white/60 font-semibold">{currentUser.points} score</p>
                        </div>
                      </div>
                      {!currentInTop5 && (
                        <button
                          onClick={desktopScrollToUser}
                          className="mt-5 w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl py-2.5 text-xs font-bold transition-all"
                        >
                          <ArrowUp size={13} /> Jump to my rank
                        </button>
                      )}
                    </div>
                  )}

                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</p>
                    <div className="space-y-3">
                      {[
                        { label: "Total Students", value: allRanks.length, icon: <Users size={14} className="text-[#7A41F7]" />, bg: "bg-[#F3EBFF]" },
                        { label: "Top Score", value: allRanks[0] ? allRanks[0].points + " score" : "—", icon: <Zap size={14} className="text-amber-500" />, bg: "bg-amber-50" },
                        { label: "Your Points", value: currentUser ? currentUser.points + " score" : "—", icon: <Star size={14} className="text-emerald-500" />, bg: "bg-emerald-50" },
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