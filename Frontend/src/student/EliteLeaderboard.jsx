import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ArrowLeft, Zap, ArrowDown, Crown } from "lucide-react";

export default function EliteLeaderboard() {
    const [showStickyBanner, setShowStickyBanner] = useState(false);
    const userRankRef = useRef(null);
    const listRef = useRef(null);

    const allRanks = [
    { rank: 1, name: "Adison Press", points: "2,569", country: "🇨🇦", avatar: "👩‍🎓" },
    { rank: 2, name: "Ruben Geidt", points: "1,469", country: "🇩🇪", avatar: "🧔" },
    { rank: 3, name: "Jakob Levin", points: "1,053", country: "🇨🇿", avatar: "👨‍🏫" },
    { rank: 4, name: "Madelyn Dias", points: "590", country: "🇮🇳", avatar: "👩‍🎓" },
    { rank: 5, name: "Zain Vaccaro", points: "448", country: "🇮🇹", avatar: "🧔" },
    { rank: 6, name: "Skylar Geidt", points: "410", country: "🇩🇪", avatar: "👩‍💼" },
    { rank: 7, name: "Elena Rossi", points: "370", country: "🇮🇹", avatar: "👩‍🎨" },
    { rank: 8, name: "Yuki Tanaka", points: "350", country: "🇯🇵", avatar: "👩‍🔬" },
    { rank: 9, name: "Lars Thomsen", points: "340", country: "🇩🇰", avatar: "👨‍💻" },
    { rank: 10, name: "Yuki Tanaka", points: "320", country: "🇯🇵", avatar: "👩‍🔬" },
    { rank: 11, name: "Sofia Silva", points: "310", country: "🇧🇷", avatar: "👩‍🎓" },
    { rank: 12, name: "Liam O'Brien", points: "295", country: "🇮🇪", avatar: "👨‍💼" ,  current: true},
  ];

    const top3 = [allRanks[1], allRanks[0], allRanks[2]];
    const remaining = allRanks.slice(3);
    const currentUser = allRanks.find(u => u.current);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setShowStickyBanner(!entry.isIntersecting),
            { threshold: 0.2 }
        );
        if (userRankRef.current) observer.observe(userRankRef.current);
        return () => observer.disconnect();
    }, []);

    const scrollToUser = () => {
        userRankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="min-h-screen bg-[#7A41F7] font-sans relative overflow-x-hidden selection:bg-indigo-300">

            {/* 1. STICKY TOP WORLD */}
            <div className="sticky top-0 h-[520px] w-full flex flex-col z-10">


                {/* PODIUM SECTION */}
                {/* PODIUM SECTION - Slimmer Width */}
<div className="flex-1 flex items-end justify-center gap-0 w-full max-w-sm mx-auto pb-15 px-4">

  {/* Rank 2 */}
  <PodiumBar
    rank={2}
    user={top3[0]}
    height="h-32"
    color="bg-[#9B86F7]"
    topColor="#CFC5FF"
    sideColor="#6A52D9"
  />

  {/* Rank 1 */}
  <PodiumBar
    rank={1}
    user={top3[1]}
    height="h-48"
    color="bg-[#B7A6FF]"
    topColor="#E6E1FF"
    sideColor="#7D68E6"
    isWinner
    zIndex="z-10"
  />

  {/* Rank 3 */}
  <PodiumBar
    rank={3}
    user={top3[2]}
    height="h-24"
    color="bg-[#9B86F7]"
    topColor="#CFC5FF"
    sideColor="#6A52D9"
  />
</div>


            </div>

            {/* 2. OVERLAY LIST */}
            {/* 2. OVERLAY LIST - COMPACT VERSION */}
<div
  ref={listRef}
  className="relative z-50 bg-[#F8FAFC] rounded-t-[3rem] shadow-[0_-40px_80px_rgba(0,0,0,0.4)] min-h-screen -mt-16"
>
  {/* Drag handle */}
  <div className="w-full flex justify-center pt-5 pb-2">
    <div className="w-11 h-1.5 bg-slate-200 rounded-full" />
  </div>

  <div className="px-5 space-y-3 pb-48 max-w-lg mx-auto">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] text-center mb-5">
      Intelligence Ranking
    </p>

    {remaining.map((user) => (
      <div
        key={user.rank}
        ref={user.current ? userRankRef : null}
        className={`
          px-4 py-3
          rounded-[2rem]
          flex items-center justify-between
          transition-all
          active:scale-[0.98]

          ${user.current
            ? 'bg-white ring-[3px] ring-indigo-500 shadow-lg shadow-indigo-100'
            : 'bg-white border border-slate-100 shadow-sm'
          }
        `}
      >
        <div className="flex items-center gap-4">
          
          {/* Rank */}
          <span
            className={`
              text-[10px] font-black w-5 text-center
              ${user.current ? 'text-indigo-600' : 'text-slate-300'}
            `}
          >
            {user.rank < 10 ? `0${user.rank}` : user.rank}
          </span>

          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-slate-50 rounded-[1.4rem] flex items-center justify-center text-xl shadow-inner">
              <span className="drop-shadow-md">{user.avatar}</span>
            </div>
            <span className="absolute -bottom-1 -right-1 text-[10px] bg-white rounded-lg shadow-sm px-1 border border-slate-100">
              {user.country}
            </span>
          </div>

          {/* Name + points */}
          <div>
            <p
              className={`
                text-xs font-black tracking-tight leading-none
                ${user.current ? 'text-indigo-600' : 'text-slate-800'}
              `}
            >
              {user.name}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tight">
              {user.points} points
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div
          className={`
            p-1.5 rounded-xl
            ${user.current ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300'}
          `}
        >
          <ChevronRight size={16} strokeWidth={3} />
        </div>
      </div>
    ))}
  </div>
</div>



            {/* 3. STICKY USER BANNER - COMPACT VERSION */}
            {showStickyBanner && currentUser && (
  <div className="fixed bottom-18 left-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-6 duration-500">
    <button
      onClick={scrollToUser}
      className="w-full h-18 bg-slate-900/95 backdrop-blur-md text-white px-5 rounded-4xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-between border border-white/10 active:scale-95 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Compact Icon Box */}
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center pt-2 justify-center shadow-lg shadow-indigo-500/20">
          <ArrowDown size={18} strokeWidth={3} className="animate-bounce" />
        </div>
        
        <div className="text-left">
          <p className="text-[7px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mb-1">
            Instant Jump
          </p>
          <p className="text-[11px] font-black uppercase tracking-tight leading-none">
            #{currentUser.rank} <span className="text-slate-400 mx-1">•</span> {currentUser.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">View</span>
        <div className="bg-white/5 p-1.5 rounded-xl border border-white/5">
          <ChevronRight size={16} strokeWidth={3} className="text-indigo-400" />
        </div>
      </div>
    </button>
  </div>
)}
        </div>
    );
}

function PodiumBar({ rank, user, height, color, topColor, sideColor, isWinner, zIndex = "" }) {
    return (
        /* Refined max-width from 130px to 85px - 95px range makes the bar feel significantly "taller" 
           without changing the height property.
        */
        <div className={`flex flex-col items-center flex-1 max-w-[95px] min-w-[80px] ${zIndex} transition-all duration-500`}>

            {/* AVATAR SECTION - Slightly scaled down to match slimmer base */}
            <div className="mb-6 relative flex flex-col items-center group">

  {/* Crown */}
  {isWinner && (
    <div className="absolute -top-11 left-1/2 -translate-x-1/2 rotate-[12deg] drop-shadow-2xl">
      <Crown
        size={30}
        className="text-amber-400 fill-amber-400 animate-[pulse_1.6s_ease-in-out_infinite]"
      />
    </div>
  )}

  {/* Avatar */}
  <div
    className={`
      w-16 h-16 rounded-[1.8rem]
      border-[5px]
      bg-white
      flex items-center justify-center
      text-3xl
      relative
      transition-all duration-300 ease-out

      ${isWinner
        ? 'border-amber-400 shadow-[0_12px_30px_rgba(245,158,11,0.45)] scale-110'
        : 'border-white/90 shadow-[0_10px_24px_rgba(0,0,0,0.25)]'
      }

      group-hover:scale-[1.08]
      group-hover:-translate-y-1.5
    `}
  >
    <span className="drop-shadow-sm">{user.avatar}</span>

    {/* Country badge */}
    <span
      className="
        absolute -bottom-1 -right-1
        text-[9px]
        bg-white
        rounded-md
        px-1.5 py-0.5
        shadow-lg
        border border-slate-100
        font-bold
      "
    >
      {user.country}
    </span>
  </div>

  {/* Name */}
  <p
    className="
      text-[11px]
      font-extrabold
      text-white
      uppercase
      mt-3
      tracking-tight
      text-center
      w-full
      truncate
      px-1
      drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]
    "
  >
    {user.name.split(' ')[0]}
  </p>

  {/* Points pill */}
  <div
    className="
      mt-1.5
      px-2.5 py-0.5
      rounded-full
      bg-white/15
      backdrop-blur-md
      border border-white/20
      shadow-inner
    "
  >
    <p className="text-[9px] font-extrabold text-white leading-none tracking-wide">
      {user.points} QP
    </p>
  </div>
</div>


            {/* SLIM ISOMETRIC BOX */}
            <div className={`relative w-full ${height} group/box`}>
                {/* Top Kite Face - Increased scaleY and adjusted top offset 
            to create a sharper perspective for a slimmer bar.
        */}
                <div
                    className="absolute -top-3.5 left-0 w-full h-8 z-10"
                    style={{
                        backgroundColor: topColor,
                        transform: 'rotateX(65deg) scaleY(1.3) scaleX(1.05)',
                        borderRadius: '4px',
                        boxShadow: 'inset 0 0 15px rgba(255,255,255,0.2), 0 5px 15px rgba(0,0,0,0.1)'
                    }}
                />

                {/* FRONT FACE */}
                <div className={`
          w-full h-full ${color} flex items-center justify-center relative shadow-2xl rounded-b-xl overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-tr before:from-black/10 before:to-transparent
        `}>
                    <span className="text-5xl font-black text-gray-100 select-none tracking-tighter mt-4">
                        {rank}
                    </span>

                    {/* LIGHT REFLECTION LINE */}
                    <div className="absolute top-0 left-2 w-[1px] h-full bg-white/10" />
                </div>

                {/* SIDE DEPTH FACE - Sharper skew for slim profile */}
                <div
                    className={`absolute top-0 right-0 w-2.5 h-full ${sideColor} origin-left skew-y-[45deg] translate-x-full rounded-r-sm`}
                    style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)' }}
                />
            </div>
        </div>
    );
}