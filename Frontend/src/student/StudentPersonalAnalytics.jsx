import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, WifiOff, Users, Zap, Star, ChevronDown } from "lucide-react";
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from "../api/axios";

const FALLBACK_ALL_TIME = [
  { rank: 1, name: "Mushafir", points: "8.6,684,187,627,438,1e+,242", level: 33, percentile: 100, avatar: null },
  { rank: 2, name: "Jashan", points: "7.3,348,158,761,678,4e+,242", level: 33, percentile: 100, avatar: null },
  { rank: 3, name: "Bk jha", points: "6.6,680,144,328,798,6e+,242", level: 33, percentile: 100, avatar: null },
  { rank: 4, name: "Madelyn Dias", points: "45,590", level: 22, percentile: 90, avatar: null },
  { rank: 5, name: "Zain Vaccaro", points: "32,448", level: 18, percentile: 85, avatar: null },
  { rank: 6, name: "Skylar Geidt", points: "12,410", level: 15, percentile: 75, avatar: null },
  { rank: 7, name: "Elena Rossi", points: "8,370", level: 12, percentile: 60, avatar: null },
  { rank: 8, name: "Yuki Tanaka", points: "5,350", level: 10, percentile: 50, avatar: null },
  { rank: 9, name: "Lars Thomsen", points: "3,340", level: 8, percentile: 40, avatar: null },
  { rank: 10, name: "Hana Kim", points: "2,320", level: 6, percentile: 30, avatar: null },
  { rank: 11, name: "Sofia Silva", points: "1,310", level: 4, percentile: 20, avatar: null },
  { rank: 12, name: "Pranav Zinjad", points: "0", level: 1, percentile: 0, avatar: null, current: true },
];

const FALLBACK_LAST_7 = [
  { rank: 1, name: "Mushafir", points: "1.2,684,187,627,438,1e+,242", level: 33, percentile: 100, avatar: null },
  { rank: 2, name: "Jashan", points: "1.1,348,158,761,678,4e+,242", level: 33, percentile: 100, avatar: null },
  { rank: 3, name: "Bk jha", points: "9.6,680,144,328,798,6e+,230", level: 33, percentile: 100, avatar: null },
  { rank: 4, name: "Madelyn Dias", points: "6,590", level: 22, percentile: 90, avatar: null },
  { rank: 5, name: "Zain Vaccaro", points: "4,448", level: 18, percentile: 85, avatar: null },
  { rank: 6, name: "Skylar Geidt", points: "2,410", level: 15, percentile: 75, avatar: null },
  { rank: 7, name: "Elena Rossi", points: "1,370", level: 12, percentile: 60, avatar: null },
  { rank: 8, name: "Yuki Tanaka", points: 850, level: 10, percentile: 50, avatar: null },
  { rank: 9, name: "Lars Thomsen", points: 540, level: 8, percentile: 40, avatar: null },
  { rank: 10, name: "Hana Kim", points: 320, level: 6, percentile: 30, avatar: null },
  { rank: 11, name: "Sofia Silva", points: 110, level: 4, percentile: 20, avatar: null },
  { rank: 12, name: "Pranav Zinjad", points: "0", level: 1, percentile: 0, avatar: null, current: true },
];

const STATUS_BAR_H = 28.5;

function Avatar({ src, name, size = 42, level = 1, className = "", isCurrentUser = false }) {
  const [failed, setFailed] = useState(false);
  const isUrl = src && (src.startsWith('http') || src.startsWith('/'));
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const avatarWrapperStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    position: 'relative',
    flexShrink: 0,
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
  };

  return (
    <div style={avatarWrapperStyle} className={className}>
      {!isUrl || failed ? (
        <div style={imgStyle} className="flex items-center justify-center text-white font-bold text-sm">
          {initial}
        </div>
      ) : (
        <img src={src} alt={name} onError={() => setFailed(true)} style={imgStyle} />
      )}
      {/* Level Badge at bottom right */}
      <div
        className={`absolute -bottom-1 -right-1 px-1 py-0.5 rounded text-[8px] font-black border leading-none transition-colors ${isCurrentUser
          ? 'bg-[#22D3EE] text-[#111111] border-[#7A41F7]'
          : 'bg-[#3B82F6] text-white border-white dark:border-[#1A1A1A]'
          }`}
      >
        LV {level}
      </div>
    </div>
  );
}

export default function StudentPersonalAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [timeframe, setTimeframe] = useState('last7'); // 'last7' | 'all'
  const [allRanks, setAllRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showStickyCard, setShowStickyCard] = useState(false);

  const userRowRef = useRef(null);
  const graphScrollRef = useRef(null);

  // Auto-scroll graph to end when data loads
  useEffect(() => {
    if (!loading && graphScrollRef.current) {
      setTimeout(() => {
        if (graphScrollRef.current) {
          graphScrollRef.current.scrollLeft = graphScrollRef.current.scrollWidth;
        }
      }, 50);
    }
  }, [loading, allRanks]);

  // Load user data
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await api.get("/leaderboard/stats/all");
        if (!cancelled) {
          const list = Array.isArray(data) && data.length > 0 ? data : (timeframe === 'last7' ? FALLBACK_LAST_7 : FALLBACK_ALL_TIME);
          const formatted = list.map((item, idx) => ({
            ...item,
            rank: item.rank || idx + 1,
            points: typeof item.points === 'string' ? item.points : (item.points ? item.points.toLocaleString() : "0"),
            level: item.level || Math.max(1, Math.floor(33 - (idx * 2.5))),
            percentile: item.percentile !== undefined ? item.percentile : Math.max(0, 100 - Math.floor(idx * 9)),
            current: item.current || (item.name?.toLowerCase().includes('pranav') || item.studentName?.toLowerCase().includes('pranav')),
          }));
          setAllRanks(formatted);
          setUsingFallback(!Array.isArray(data) || data.length === 0);
        }
      } catch {
        if (!cancelled) {
          setAllRanks(timeframe === 'last7' ? FALLBACK_LAST_7 : FALLBACK_ALL_TIME);
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [timeframe]);

  // Observer to show/hide sticky bottom user card
  useEffect(() => {
    if (loading || !userRowRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Show sticky bottom card if current user row is NOT in viewport
      setShowStickyCard(!entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(userRowRef.current);
    return () => observer.disconnect();
  }, [loading, allRanks]);

  // Hide bottom layout navigation tabs
  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, []);

  const currentUser = allRanks.find(u => u.current) || { rank: 12, name: user?.name || "Pranav Zinjad", points: "0", level: 1, percentile: 0, current: true };

  const handleBack = () => {
    navigate('/student');
  };

  const resolveMediaUrl = url => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = window.__API_URL__ ? window.__API_URL__.replace(/\/api$/, '') : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    return `${base}${url}`;
  };

  // Curve visual logic
  const rankTrend = currentUser?.rankTrend || [];
  let trendPath = "";
  let trendPoints = [];
  
  const paddingX = 50;
  const pointDistance = 85; 
  const svgWidth = Math.max(340, (rankTrend.length - 1) * pointDistance + paddingX * 2);
  const svgHeight = 160;

  if (rankTrend.length > 0) {
    const minRank = 1;
    const maxRank = Math.max(10, ...rankTrend.map(r => r.rank));

    rankTrend.forEach((rt, i) => {
      const x = rankTrend.length === 1 ? svgWidth / 2 : paddingX + i * pointDistance;
      const y = 40 + ((rt.rank - minRank) / Math.max(1, maxRank - minRank)) * 80;
      
      const dateStr = rt.date ? new Date(rt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A";
      
      trendPoints.push({ x, y, rank: rt.rank, title: rt.testName, dateStr });

      if (i === 0) trendPath += `M ${x} ${y} `;
      else trendPath += `L ${x} ${y} `;
    });
  } else {
    // Fallback curve spanning the width
    trendPath = `M 0 120 C ${svgWidth * 0.25} 120, ${svgWidth * 0.35} 40, ${svgWidth * 0.5} 40 C ${svgWidth * 0.65} 40, ${svgWidth * 0.75} 120, ${svgWidth} 120`;
  }
  
  const getCurvePoint = (p) => {
    const x = paddingX + (p / 100) * (svgWidth - paddingX * 2);
    const exponent = -Math.pow((p - 50) / 25, 2);
    const y = 120 - 80 * Math.exp(exponent);
    return { x, y };
  };
  const currentMarker = rankTrend.length > 0 ? null : getCurvePoint(currentUser.percentile);

  return (
    <div
      className="fixed inset-0 transition-colors duration-300 flex flex-col overflow-hidden"
      style={{ background: isDark ? '#111111' : '#F5F5F5' }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── FIXED HEADER & TABS ── */}
      <div
        className="sticky top-0 z-50 border-b transition-colors duration-300"
        style={{
          background: isDark ? '#111111' : '#F5F5F5',
          borderColor: isDark ? '#262626' : '#E5E5E5',
          paddingTop: STATUS_BAR_H,
        }}
      >
        <div className="max-w-2xl mx-auto px-5 pt-3 pb-1">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 active:opacity-60 transition-opacity">
                <ArrowLeft size={20} />
              </button>
              <span className="text-[20px] font-bold tracking-tight text-slate-800 dark:text-white">Leaderboard</span>
            </div>
            {usingFallback && (
              <div className="flex items-center gap-1.5 bg-slate-200/55 dark:bg-white/5 rounded-full px-2.5 py-1">
                <WifiOff size={10} className="text-slate-450 dark:text-slate-500" />
                <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase">Demo</span>
              </div>
            )}
          </div>

          {/* Segmented Controls / Tab Bar */}
          <div className="flex mt-2 relative">
            <button
              onClick={() => setTimeframe('last7')}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all duration-200 ${timeframe === 'last7'
                ? 'border-slate-800 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-slate-500'
                }`}
            >
              Last 7 days
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all duration-200 ${timeframe === 'all'
                ? 'border-slate-800 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 dark:text-slate-500'
                }`}
            >
              All time
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY CONTENT ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-32 space-y-6">

          {/* ── Trend Graph Card ── */}
          <div
            className="pt-4 pb-2 transition-colors"
            style={{
              background: 'transparent',
              border: 'none',
            }}
          >
            {loading ? (
              <div className="w-full h-[180px] mt-4 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse flex flex-col justify-between p-4">
                  {/* Faux graph lines */}
                  <div className="w-full h-px bg-slate-300 dark:bg-white/10 mt-6" />
                  <div className="w-full h-px bg-slate-300 dark:bg-white/10" />
                  <div className="w-full h-px bg-slate-300 dark:bg-white/10 mb-6" />
              </div>
            ) : (
              <>
                {/* Distribution Curve / Trend SVG Container with horizontal scroll */}
                <div 
                  ref={graphScrollRef}
                  className="relative pt-4 pb-2 overflow-x-auto overflow-y-visible no-scrollbar w-full scroll-smooth"
                >
                  <svg 
                    style={{ width: svgWidth, height: svgHeight, minWidth: svgWidth }} 
                    className="overflow-visible" 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  >
                    {/* Subtle horizontal grid lines */}
                    {[40, 80, 120].map(y => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2={svgWidth}
                        y2={y}
                        stroke={isDark ? "#262626" : "#E5E5E5"}
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Continuous Curve or Line */}
                    <path
                      d={trendPath}
                      fill="none"
                      stroke="#22D3EE"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />

                    {/* Cyan indicator dots & Text */}
                    {rankTrend.length > 0 ? (
                      trendPoints.map((pt, i) => (
                        <g key={i}>
                          {/* Trend point circle */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill="#22D3EE"
                            stroke={isDark ? "#111111" : "#F5F5F5"}
                            strokeWidth="2"
                          />
                          {/* Rank Label */}
                          <text x={pt.x} y={pt.y - 12} fill={isDark ? "#E5E5E5" : "#525252"} fontSize="12" fontWeight="bold" textAnchor="middle">
                            Rank #{pt.rank}
                          </text>
                          {/* Date Label */}
                          <text x={pt.x} y={pt.y + 20} fill={isDark ? "#A3A3A3" : "#737373"} fontSize="10" textAnchor="middle">
                            {pt.dateStr}
                          </text>
                        </g>
                      ))
                    ) : (
                      currentMarker && (
                        <circle
                          cx={currentMarker.x}
                          cy={currentMarker.y}
                          r="4"
                          fill="#22D3EE"
                          stroke={isDark ? "#111111" : "#F5F5F5"}
                          strokeWidth="2"
                        />
                      )
                    )}
                  </svg>
                </div>

                <p className="text-[12px] text-slate-450 dark:text-slate-400 text-center mt-4 font-medium leading-relaxed">
                  {rankTrend.length > 0 ? "Your past test rank trends" : "No recent test data to plot rank trends."}
                </p>
              </>
            )}
          </div>

          {/* ── Top Learners Section Title ── */}
          <div className="pt-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Top learners</h2>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">Updates every 30 minutes</p>
          </div>

          {/* ── Minimal Rankings List ── */}
          <div className="space-y-4 pb-8">
            {loading ? (
              // Simple skeleton rows matching the clean layout
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-5 pl-0 pr-5 rounded-xl animate-pulse"
                  style={{
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-12 h-2 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-12 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              ))
            ) : (
              allRanks.map((userItem) => {
                const isCurrentUser = userItem.current;

                return (
                  <div
                    key={userItem.rank}
                    ref={isCurrentUser ? userRowRef : null}
                    className="flex items-center gap-4 pl-0 pr-5 py-5 rounded-xl transition-colors relative"
                    style={{
                      background: 'transparent',
                      border: 'none',
                    }}
                  >
                    {/* Avatar Wrapper */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <Avatar
                        src={resolveMediaUrl(userItem.avatar)}
                        name={userItem.name}
                        size={40}
                        level={userItem.level}
                        isCurrentUser={isCurrentUser}
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-bold truncate leading-tight ${isCurrentUser ? 'text-cyan-550 dark:text-cyan-400' : 'text-slate-800 dark:text-white'}`}>
                        {userItem.name}
                      </p>
                      <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5 leading-none">
                        {userItem.percentile}th percentile
                      </p>
                    </div>

                    {/* Score (XP) */}
                    <span
                      className={`text-[12px] font-black tracking-tight shrink-0 ${isCurrentUser ? 'text-cyan-550 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-350'
                        }`}
                    >
                      {userItem.points} XP
                    </span>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* ── STICKY BOTTOM USER CARD ── */}
      {currentUser && !loading && showStickyCard && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t transition-all duration-300 shadow-lg"
          style={{
            background: isDark ? '#2A2A2A' : '#FFFFFF',
            borderColor: isDark ? '#333333' : '#E5E5E5',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="max-w-2xl mx-auto pl-5 pr-10 pt-4 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar
                  src={resolveMediaUrl(currentUser.avatar)}
                  name={currentUser.name}
                  size={40}
                  level={currentUser.level}
                  isCurrentUser={true}
                />
              </div>
              <div className="text-left">
                <p className={`text-[14px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {currentUser.name}
                </p>
                <p className={`text-[11px] mt-0.5 leading-none ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                  {currentUser.percentile}th percentile
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-[12px] font-black tracking-tight shrink-0 ${isDark ? 'text-white' : 'text-[#7A41F7]'}`}>
                {currentUser.points} XP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}