import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, WifiOff, Users, Zap, Star } from "lucide-react";
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
  @keyframes floatUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: floatUp 0.3s ease both; }
  .no-scrollbar::-webkit-scrollbar { display:none; }
  .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
  @keyframes softPulse {
    0%,100% { opacity:0.45; transform:scale(1); }
    50%      { opacity:0.85; transform:scale(1.07); }
  }
  .petal-glow  { animation: softPulse 2.6s ease-in-out infinite; }
  @keyframes ringPulse {
    0%,100% { opacity:0.6; transform:scale(1); }
    50%      { opacity:1;   transform:scale(1.05); }
  }
  .ring-pulse { animation: ringPulse 2.4s ease-in-out infinite; }
`;

/* ── Avatar ── */
function Avatar({ src, name, size = 40, className = "" }) {
  const [failed, setFailed] = useState(false);
  const isUrl = src && (src.startsWith('http') || src.startsWith('/'));
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  const base = { width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  if (!isUrl || failed) {
    return (
      <div style={{ ...base, background: 'linear-gradient(135deg,#a78bfa,#7A41F7)', color: 'white', fontWeight: 700, fontSize: size * 0.38 }} className={className}>
        {initial}
      </div>
    );
  }
  return <img src={src} alt={name} onError={() => setFailed(true)} style={{ ...base, objectFit: 'cover' }} className={className} />;
}

/* ════════════════════════════════════════
   DESKTOP — Compact Top-3 horizontal strip
════════════════════════════════════════ */
const MEDAL_CONFIG = {
  1: { ring: '#F59E0B', glow: 'rgba(245,158,11,0.4)', bg: 'bg-gradient-to-br from-[#7A41F7] to-[#5B2ED6]', nameColor: 'text-white', ptColor: 'text-white/60', pillBg: 'bg-white/20 text-white', badge: 'bg-amber-400 text-slate-900', size: 56 },
  2: { ring: '#94A3B8', glow: 'rgba(148,163,184,0.3)', bg: 'bg-white', nameColor: 'text-slate-800', ptColor: 'text-slate-400', pillBg: 'bg-[#F3EBFF] text-[#7A41F7]', badge: 'bg-slate-100 text-slate-500', size: 48 },
  3: { ring: '#CD7C3A', glow: 'rgba(205,124,58,0.3)', bg: 'bg-white', nameColor: 'text-slate-800', ptColor: 'text-slate-400', pillBg: 'bg-[#F3EBFF] text-[#7A41F7]', badge: 'bg-orange-50 text-orange-500', size: 48 },
};

function DesktopPodiumStrip({ top3 }) {
  // order: 2, 1, 3
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const ranks = [2, 1, 3];

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {order.map((user, i) => {
        const rank = ranks[i];
        const c = MEDAL_CONFIG[rank];
        const isFirst = rank === 1;
        return (
          <div key={rank} className={`relative ${c.bg} rounded-2xl p-4 flex flex-col items-center gap-2 border ${isFirst ? 'border-[#7A41F7]/20 shadow-lg shadow-purple-100' : 'border-slate-100 shadow-sm'} ${isFirst ? 'scale-[1.03]' : ''} transition-transform`}>
            {/* Rank badge */}
            <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black ${c.badge}`}>
              #{rank}
            </div>

            {/* Avatar with ring */}
            <div className="mt-2 relative flex items-center justify-center" style={{ width: c.size + 10, height: c.size + 10 }}>
              {isFirst && (
                <div className="absolute ring-pulse rounded-full" style={{ width: c.size + 20, height: c.size + 20, border: `1.5px solid ${c.ring}40`, backgroundColor: `${c.ring}0D` }} />
              )}
              <div className="absolute rounded-full" style={{ width: c.size + 8, height: c.size + 8, border: `2.5px solid ${c.ring}`, boxShadow: `0 0 12px ${c.glow}` }} />
              <Avatar src={user.avatar} name={user.name} size={c.size} />
            </div>

            <p className={`text-[12px] font-bold truncate max-w-full text-center font-display ${c.nameColor}`}>{user.name.split(' ')[0]}</p>
            <div className={`px-3 py-1 rounded-full text-[9px] font-bold ${c.pillBg}`}>{user.points}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Desktop compact rank row ── */
function DesktopRankRow({ user, index, innerRef }) {
  const ringColor = user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#CD7C3A' : null;
  const ringGlow = user.rank === 1 ? 'rgba(245,158,11,0.3)' : user.rank === 2 ? 'rgba(148,163,184,0.25)' : user.rank === 3 ? 'rgba(205,124,58,0.25)' : null;

  return (
    <div
      ref={innerRef}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-default
        ${user.current
          ? 'bg-[#7A41F7] shadow-md shadow-purple-200/50'
          : 'bg-white border border-slate-50 hover:border-slate-100 hover:shadow-sm'}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <span className={`w-6 text-center text-[10px] font-black shrink-0 ${user.current ? 'text-white/50' : 'text-slate-300'}`}>
        {String(user.rank).padStart(2, '0')}
      </span>

      <div className="relative shrink-0 flex items-center justify-center" style={{ width: 36, height: 36 }}>
        <div className="absolute rounded-full" style={{
          width: 36, height: 36,
          border: ringColor ? `2px solid ${ringColor}` : user.current ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid #e2e8f0',
          boxShadow: ringGlow ? `0 0 8px ${ringGlow}` : 'none',
        }} />
        <Avatar src={user.avatar} name={user.name} size={30} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-bold truncate font-display leading-tight ${user.current ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
        <p className={`text-[10px] font-medium mt-0.5 ${user.current ? 'text-white/55' : 'text-slate-400'}`}>{user.points}</p>
      </div>

      <span className={`text-[9px] font-black shrink-0 ${user.current ? 'text-white/40' : 'text-slate-200'}`}>{user.country}</span>
    </div>
  );
}

/* ════════════════════════════════════════
   MOBILE (untouched) helpers
════════════════════════════════════════ */
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
      {rank !== 1 && <div className="h-[26px]" />}
      <div className="relative flex items-center justify-center" style={{ width: wrap, height: wrap }}>
        {rank === 1 && (
          <div className="absolute ring-pulse rounded-full" style={{ width: wrap + 10, height: wrap + 10, border: `2px solid ${r.outer}`, backgroundColor: r.outer }} />
        )}
        <div className="absolute rounded-full" style={{ width: wrap, height: wrap, border: `3px solid ${r.color}`, boxShadow: `0 0 16px ${r.glow}` }} />
        <Avatar src={user.avatar} name={user.name} size={size} />
      </div>
      <p className="font-bold text-white text-center truncate font-display" style={{ fontSize: elevated ? 13 : 11, maxWidth: wrap + 12 }}>
        {user.name.split(' ')[0]}
      </p>
      <div className="px-2.5 py-0.5 rounded-full font-bold" style={{ fontSize: 9, background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
        {user.points}
      </div>
    </div>
  );
}

function MobilePodium({ podiumUsers }) {
  const first = podiumUsers.find(u => u.rank === 1);
  const second = podiumUsers.find(u => u.rank === 2);
  const third = podiumUsers.find(u => u.rank === 3);
  if (podiumUsers.length === 1 && first) return <div className="flex justify-center py-6"><PodiumCircle user={first} rank={1} size={90} elevated /></div>;
  if (podiumUsers.length === 2) return (
    <div className="flex items-end justify-center gap-8 py-4 px-6">
      {second && <PodiumCircle user={second} rank={2} size={68} />}
      {first && <PodiumCircle user={first} rank={1} size={84} elevated />}
    </div>
  );
  return (
    <div className="flex items-end justify-center gap-4 px-6 py-2">
      <div className="flex-1 flex justify-center mb-1">{second && <PodiumCircle user={second} rank={2} size={64} />}</div>
      <div className="flex-1 flex justify-center">{first && <PodiumCircle user={first} rank={1} size={80} elevated />}</div>
      <div className="flex-1 flex justify-center mb-1">{third && <PodiumCircle user={third} rank={3} size={64} />}</div>
    </div>
  );
}

function MobileRankRow({ user, innerRef }) {
  const ringColor = user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#94A3B8' : user.rank === 3 ? '#CD7C3A' : null;
  const ringGlow = user.rank === 1 ? 'rgba(245,158,11,0.3)' : user.rank === 2 ? 'rgba(148,163,184,0.25)' : user.rank === 3 ? 'rgba(205,124,58,0.25)' : null;
  return (
    <div ref={innerRef} className={`flex items-center gap-3 px-4 py-3 rounded-2xl active:scale-[0.98] transition-all ${user.current ? 'bg-[#7A41F7] shadow-md' : 'bg-white border border-slate-100'}`}>
      <span className={`text-xs font-bold w-5 text-center shrink-0 ${user.current ? 'text-white/50' : 'text-slate-300'}`}>{String(user.rank).padStart(2, '0')}</span>
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: 42, height: 42 }}>
        <div className="absolute rounded-full" style={{ width: 42, height: 42, border: ringColor ? `2px solid ${ringColor}` : user.current ? '2px solid rgba(255,255,255,0.3)' : '1.5px solid #e2e8f0', boxShadow: ringGlow ? `0 0 8px ${ringGlow}` : 'none' }} />
        <Avatar src={user.avatar} name={user.name} size={36} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate leading-tight ${user.current ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
        <p className={`text-[10px] font-medium mt-0.5 ${user.current ? 'text-white/60' : 'text-slate-400'}`}>{user.points} score</p>
      </div>
    </div>
  );
}

function SkeletonRow({ compact = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 ${compact ? 'py-2.5' : 'py-3'} rounded-xl bg-white border border-slate-50 animate-pulse`}>
      <div className="w-5 h-2.5 bg-slate-100 rounded-full" />
      <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} bg-slate-100 rounded-full`} />
      <div className="flex-1 space-y-1.5">
        <div className="w-20 h-2.5 bg-slate-100 rounded-full" />
        <div className="w-12 h-2 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN
════════════════════════════════════════ */
export default function EliteLeaderboard() {
  const [allRanks, setAllRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showJumpBtn, setShowJumpBtn] = useState(false);

  const userRankRef = useRef(null);
  const desktopUserRef = useRef(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`${baseURL}/leaderboard/stats/all`, { headers: { Authorization: `Bearer ${token}` } });
        const data = res.data;
        if (!cancelled) {
          setAllRanks(Array.isArray(data) && data.length > 0 ? data : FALLBACK_DATA);
          setUsingFallback(!Array.isArray(data) || data.length === 0);
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
    if (loading || !userRankRef.current) return;
    const observer = new IntersectionObserver(([e]) => setShowJumpBtn(!e.isIntersecting), { threshold: 0.5 });
    observer.observe(userRankRef.current);
    return () => observer.disconnect();
  }, [loading, allRanks]);

  const podiumUsers = allRanks.slice(0, Math.min(3, allRanks.length));
  const listRanks = allRanks.slice(podiumUsers.length);
  const currentUser = allRanks.find(u => u.current);
  const currentInTop5 = currentUser && currentUser.rank <= 5;
  const desktopTop3 = allRanks.length >= 3 ? allRanks.slice(0, 3) : null;

  const scrollToUser = () => userRankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const desktopScrollToUser = () => desktopUserRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ════════ MOBILE (untouched) ════════ */}
      <div className="md:hidden min-h-screen bg-[#7A41F7] relative flex flex-col">
        <div className="px-5 pt-12 pb-2 flex items-center justify-between shrink-0">
          <br />
          {usingFallback && (
            <div className="flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1.5">
              <WifiOff size={10} className="text-white/60" />
              <span className="text-[9px] font-bold text-white/60 uppercase">Demo</span>
            </div>
          )}
        </div>

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
          ) : podiumUsers.length > 0 ? <MobilePodium podiumUsers={podiumUsers} /> : null}
        </div>

        <div className="flex-1 bg-[#F6F8FC] rounded-t-[2rem] overflow-y-auto no-scrollbar" style={{ paddingBottom: '160px', minHeight: '55vh' }}>
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-4 mb-4" />
          {listRanks.length > 0 && <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-4">Rankings</p>}
          <div className="space-y-2 px-4 max-w-md mx-auto">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : listRanks.map(user => <MobileRankRow key={user.rank} user={user} innerRef={user.current ? userRankRef : null} />)}
          </div>
        </div>

        {showJumpBtn && currentUser && !currentInTop5 && (
          <div className="fixed left-4 right-4 z-[60]" style={{ bottom: '86px' }}>
            <button onClick={scrollToUser} className="w-full bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between border border-white/10 active:scale-[0.97] transition-transform">
              <div className="flex items-center gap-3">
                <Avatar src={currentUser.avatar} name={currentUser.name} size={34} />
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Your rank</p>
                  <p className="text-sm font-bold leading-none">#{currentUser.rank} · {currentUser.name.split(' ')[0]} · {currentUser.points}</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-1.5 shrink-0">
                <ArrowUp size={14} className="rotate-180 text-purple-400" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ════════ DESKTOP — fits inside StudentNexus sidebar layout ════════ */}
      <div className="hidden md:block w-full fade-up">

        {/* Page title row */}
        

        {loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[0, 1, 2].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
            </div>
            {Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} compact />)}
          </div>
        ) : (
          <>
            {/* Compact podium strip */}

            {/* Two-col: list + sidebar */}
            <div className="grid grid-cols-5 gap-5">


              {/* ── Rank list (wider) ── */}
              <div className="col-span-3">
                <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Institute</p>
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Leaderboard</h1>
          </div>
          {usingFallback && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5">
              <WifiOff size={10} className="text-amber-500" />
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Demo</span>
            </div>
          )}
        </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Standings</p>
                  <span className="text-[9px] font-bold text-slate-300">{allRanks.length} students</span>
                </div>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                  {allRanks.map((user, idx) => (
                    <DesktopRankRow
                      key={user.rank}
                      user={user}
                      index={idx}
                      innerRef={user.current ? desktopUserRef : null}
                    />
                  ))}
                </div>
              </div>

              {/* ── Sidebar (narrow) ── */}
              <div className="col-span-2 flex flex-col gap-8">

                {/* ── 1. Top Performers Section (Rankings First) ── */}
                <div className="flex items-end justify-center gap-2 pt-8 pb-4">

                  {/* 2nd Place */}
                  {allRanks[1] && (
                    <div className="flex flex-col items-center flex-1 transition-transform hover:scale-105">
                      <div className="relative mb-3">
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#2ECC71] text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white z-10 shadow-sm">
                          2
                        </div>
                        <div className="rounded-full p-1 border-2 border-[#2ECC71]/30">
                          <Avatar src={allRanks[1].avatar} name={allRanks[1].name} size={52} className="border-2 border-white shadow-md" />
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 truncate w-20 text-center font-display leading-tight">
                        {allRanks[1].name}
                      </p>
                      <p className="text-[10px] font-black text-[#2ECC71] mt-1 bg-[#2ECC71]/10 px-2 py-0.5 rounded-full">
                        {allRanks[1].points}
                      </p>
                    </div>
                  )}

                  {/* 1st Place */}
                  {allRanks[0] && (
                    <div className="flex flex-col items-center flex-1 z-10 scale-110 -mt-6">
                      <div className="relative mb-3">
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#F1C40F] text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-white z-10 shadow-md">
                          1
                        </div>
                        <div className="rounded-full p-1.5 border-2 border-[#F1C40F] ring-4 ring-[#F1C40F]/10">
                          <Avatar src={allRanks[0].avatar} name={allRanks[0].name} size={64} className="border-2 border-white shadow-lg" />
                        </div>
                      </div>
                      <p className="text-[13px] font-black text-slate-900 truncate w-24 text-center font-display leading-tight">
                        {allRanks[0].name}
                      </p>
                      <p className="text-[11px] font-black text-[#F59E0B] mt-1 bg-[#F59E0B]/10 px-3 py-1 rounded-full shadow-sm">
                        {allRanks[0].points}
                      </p>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {allRanks[2] && (
                    <div className="flex flex-col items-center flex-1 transition-transform hover:scale-105">
                      <div className="relative mb-3">
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#E67E22] text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white z-10 shadow-sm">
                          3
                        </div>
                        <div className="rounded-full p-1 border-2 border-[#E67E22]/30">
                          <Avatar src={allRanks[2].avatar} name={allRanks[2].name} size={52} className="border-2 border-white shadow-md" />
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 truncate w-20 text-center font-display leading-tight">
                        {allRanks[2].name}
                      </p>
                      <p className="text-[10px] font-black text-[#E67E22] mt-1 bg-[#E67E22]/10 px-2 py-0.5 rounded-full">
                        {allRanks[2].points}
                      </p>
                    </div>
                  )}
                </div>

                {/* ── 2. Your Position Card (Jump To) ── */}
                {currentUser && (
                  <div className="bg-gradient-to-br from-[#7A41F7] to-[#5B2ED6] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-purple-200/40">
                    <div className="absolute right-[-16px] bottom-[-16px] w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Your Position</p>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-4xl font-bold font-display leading-none">#{currentUser.rank}</span>
                      <span className="text-white/50 text-xs font-semibold mb-0.5">of {allRanks.length}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Avatar src={currentUser.avatar} name={currentUser.name} size={36} className="border-2 border-white/30 rounded-full" />
                      <div>
                        <p className="text-xs font-bold font-display">{currentUser.name}</p>
                        <p className="text-[10px] text-white/55">{currentUser.points} pts</p>
                      </div>
                    </div>
                    {!currentInTop5 && (
                      <button onClick={desktopScrollToUser} className="mt-4 w-full flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl py-2 text-[10px] font-bold transition-all">
                        <ArrowUp size={11} /> Jump to my rank
                      </button>
                    )}
                  </div>
                )}

                {/* ── 3. Simplified Quick Stats (Overview) ── */}
                <div className="px-2">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-5">
                    Overview
                  </p>

                  <div className="space-y-5">
                    {[
                      { label: "Class Strength", value: allRanks.length, icon: <Users size={14} /> },
                      { label: "Top Score", value: allRanks[0]?.points || "0", icon: <Zap size={14} /> },
                      { label: "Your Standing", value: currentUser ? `#${currentUser.rank}` : "N/A", icon: <Star size={14} /> },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                            {s.icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 leading-none mb-1 uppercase">
                              {s.label}
                            </p>
                            <p className="text-sm font-black text-slate-800 font-display">
                              {s.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}