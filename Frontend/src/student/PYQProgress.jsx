import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, X, BarChart2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.js';

const STATUS_BAR_H = 28.5;

// Performance SVG Line & Area Chart
const PerformanceChart = ({ data, maxValue, formatTooltip, theme }) => {
    const isDark = theme === 'dark';
    const W = 320;
    const H = 160;
    const paddingLeft = 35;
    const paddingRight = 35;
    const paddingTop = 40;
    const paddingBottom = 25;

    const N = data.length;
    const chartHeight = H - paddingTop - paddingBottom; // 95px

    const points = data.map((item, i) => {
        const x = paddingLeft + (i * (W - paddingLeft - paddingRight)) / (N - 1);
        const heightPercent = maxValue > 0 ? (item.value / maxValue) : 0;
        const y = H - paddingBottom - (heightPercent * chartHeight);
        return { x, y, label: item.label, value: item.value };
    });

    // Helper for smooth bezier curve path
    const getCurvePath = (pts) => {
        if (pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp1y = p0.y;
            const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
            const cp2y = p1.y;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        return path;
    };

    // Construct curved line path
    const linePath = getCurvePath(points);

    // Construct curved area path (closes at the bottom y = H - paddingBottom)
    const bottomY = H - paddingBottom;
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`
        : '';

    return (
        <div style={{ position: 'relative', height: 165, width: '100%', marginTop: 24 }}>
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                {[35, 65, 95, 125].map((yVal, idx) => (
                    <line
                        key={idx}
                        x1={15}
                        y1={yVal}
                        x2={W - 15}
                        y2={yVal}
                        stroke="#94A3B8"
                        strokeDasharray="3,3"
                        strokeOpacity={isDark ? 0.15 : 0.25}
                    />
                ))}

                {/* Gradient Area Fill */}
                {points.length > 0 && (
                    <path d={areaPath} fill="url(#areaGrad)" />
                )}

                {/* Line Path */}
                {points.length > 0 && (
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* Nodes & Tooltips */}
                {points.map((p, i) => (
                    <g key={i}>
                        {/* Circle marker */}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill={isDark ? '#161C26' : '#FFFFFF'}
                            stroke="#3B82F6"
                            strokeWidth="2.5"
                        />

                        {/* X-Axis Label Text */}
                        <text
                            x={p.x}
                            y={H - 5}
                            textAnchor="middle"
                            style={{
                                fontSize: 8.5,
                                fill: '#94A3B8',
                                fontWeight: 600,
                                fontFamily: 'sans-serif',
                            }}
                        >
                            {p.label}
                        </text>

                        {/* Permanent HTML Tooltip using foreignObject */}
                        <foreignObject
                            x={p.x - 50}
                            y={p.y - 41}
                            width="100"
                            height="32"
                            style={{ overflow: 'visible' }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                            }}>
                                <div style={{
                                    position: 'relative',
                                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                    border: isDark ? '1px solid #374151' : '1px solid #E2E8F0',
                                    color: isDark ? '#FFFFFF' : '#334155',
                                    fontSize: 9,
                                    fontWeight: 650,
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    whiteSpace: 'nowrap',
                                    boxShadow: isDark ? '0 4px 10px rgba(0,0,0,0.3)' : '0 2px 6px rgba(15,23,42,0.06)',
                                }}>
                                    {formatTooltip ? formatTooltip(p.value) : p.value}
                                    {/* Tooltip Downward Arrow */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: -4.5,
                                        left: '50%',
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        width: 8,
                                        height: 8,
                                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                        borderRight: isDark ? '1px solid #374151' : '1px solid #E2E8F0',
                                        borderBottom: isDark ? '1px solid #374151' : '1px solid #E2E8F0',
                                        zIndex: -1,
                                    }} />
                                </div>
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// In-app Dropdown Component
const Dropdown = ({ label, value, options, onChange, theme }) => {
    const [open, setOpen] = useState(false);
    const isDark = theme === 'dark';
    return (
        <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </span>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: isDark ? '1px solid #2A3441' : '1px solid #E2E8F0',
                    background: isDark ? '#161C26' : '#FFFFFF',
                    color: isDark ? '#E2E8F0' : '#334155',
                    fontSize: 13,
                    fontWeight: 750,
                    textAlign: 'left',
                    cursor: 'pointer',
                    outline: 'none',
                }}
            >
                <span style={{ flex: 1 }}>
                    {options.find(o => o.value === value)?.label || value}
                </span>
                <ChevronDown size={14} style={{ color: '#94A3B8', marginLeft: 4, flexShrink: 0 }} />
            </button>
            {open && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
                        onClick={() => setOpen(false)}
                    />
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        marginTop: 6,
                        borderRadius: 12,
                        border: isDark ? '1px solid #2A3441' : '1px solid #F1F5F9',
                        background: isDark ? '#161C26' : '#FFFFFF',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        zIndex: 10001,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '10px 16px',
                                    fontSize: 13,
                                    fontWeight: 650,
                                    border: 'none',
                                    background: value === opt.value
                                        ? 'linear-gradient(135deg, #3B82F6, #2563EB)'
                                        : 'transparent',
                                    color: value === opt.value
                                        ? '#FFFFFF'
                                        : (isDark ? '#E2E8F0' : '#334155'),
                                    cursor: 'pointer',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default function PYQProgress() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { user } = useAuth();
    const isApproved = !!user?.isApproved;
    const PRIME_BANNER_H = 60;


    const [perfSubject, setPerfSubject] = useState('All');
    const [perfTimeline, setPerfTimeline] = useState('Weekly');
    const [perfDifficulty, setPerfDifficulty] = useState('All');

    const goal = localStorage.getItem("selectedGoal") || "MHT CET";

    const subjectOptions = [
        { value: 'All', label: 'All Subjects' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Maths', label: 'Maths' },
        { value: 'Biology', label: 'Biology' },
    ];

    const timelineOptions = [
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Monthly', label: 'Monthly' },
    ];

    const [rawAttempts, setRawAttempts] = useState([]);

    useEffect(() => {
        if (!user) return;
        api.get('/quiz/pyq-progress').then(res => {
            if (res.data?.success && res.data.data.attempts) {
                setRawAttempts(res.data.data.attempts);
            }
        }).catch(err => console.error(err));
    }, [user]);

    const computeStats = () => {
        let bucketSolved = [0, 0, 0, 0];
        let bucketCorrect = [0, 0, 0, 0];
        let bucketTime = [0, 0, 0, 0];
        
        const now = new Date();
        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const bucketSizeDays = perfTimeline === 'Weekly' ? 7 : 30; // 7 days or 30 days
        
        rawAttempts.forEach(att => {
            const date = new Date(att.updatedAt || att.createdAt);
            const daysAgo = Math.floor((now - date) / MS_PER_DAY);
            
            let bucketIndex = 3 - Math.floor(daysAgo / bucketSizeDays);
            if (bucketIndex < 0) return; 
            if (bucketIndex > 3) bucketIndex = 3; 

            // Filter by subject
            const subjName = (att.subjectId?.name || '').toLowerCase();
            const filterSubj = perfSubject.toLowerCase();
            if (filterSubj !== 'all' && !subjName.includes(filterSubj)) return;
            
            if (att.status === 'correct' || att.status === 'incorrect') {
                bucketSolved[bucketIndex]++;
                bucketTime[bucketIndex] += (att.totalTimeSpent || 0);
                if (att.status === 'correct') {
                    bucketCorrect[bucketIndex]++;
                }
            }
        });

        const solved = bucketSolved.reduce((a,b)=>a+b, 0);
        const totalTimeSecs = bucketTime.reduce((a,b)=>a+b, 0);
        const correct = bucketCorrect.reduce((a,b)=>a+b, 0);
        
        const accuracy = solved > 0 ? Math.round((correct / solved) * 100) : 0;
        const avgTime = solved > 0 ? Math.round(totalTimeSecs / solved) : 0;
        
        const accuracyData = bucketSolved.map((s, i) => s > 0 ? Math.round((bucketCorrect[i] / s) * 100) : 0);
        const timeData = bucketSolved.map((s, i) => s > 0 ? Math.round(bucketTime[i] / s) : 0);

        const m = Math.floor(avgTime / 60);
        const s = avgTime % 60;
        const timeStr = `${m}m ${s < 10 ? '0' : ''}${s}s`;

        return {
            solved,
            solvedData: bucketSolved,
            time: timeStr,
            timeData,
            accuracy,
            accuracyData
        };
    };

    const stats = computeStats();
    const getDynamicLabels = () => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
        const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short' });
        
        if (perfTimeline === 'Weekly') {
            return [3, 2, 1, 0].map(weeksAgo => {
                const start = new Date(now.getTime() - (weeksAgo * 7 + 6) * 24 * 60 * 60 * 1000);
                const end = new Date(now.getTime() - (weeksAgo * 7) * 24 * 60 * 60 * 1000);
                if (weeksAgo === 0) return 'This Week';
                return `${formatter.format(start)} - ${formatter.format(end)}`;
            });
        } else {
            return [3, 2, 1, 0].map(monthsAgo => {
                const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
                return monthFormatter.format(d);
            });
        }
    };
    const labels = getDynamicLabels();

    const solvedChartData = labels.map((l, i) => ({ label: l, value: stats.solvedData[i] }));
    const timeChartData = labels.map((l, i) => ({ label: l, value: stats.timeData[i] }));
    const accuracyChartData = labels.map((l, i) => ({ label: l, value: stats.accuracyData[i] }));

    const maxSolved = Math.max(...stats.solvedData, 10);
    const maxTime = Math.max(...stats.timeData, 60);

    const hasData = rawAttempts.length > 0;

    const renderCard = (title, mainStat, subStat, chartData, maxVal, formatTooltip) => (
        <div style={{ position: 'relative' }}>
            <div style={{
                background: theme === 'light' ? '#FFFFFF' : '#161C26',
                border: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                padding: 20,
                boxShadow: theme === 'light' ? '0 4px 16px rgba(0,0,0,0.02)' : 'none',
                filter: !hasData ? 'blur(5px)' : 'none',
                opacity: !hasData ? 0.6 : 1,
                pointerEvents: !hasData ? 'none' : 'auto',
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, fontStyle: 'normal', fontWeight: 800, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                        {title}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 16, fontStyle: 'normal', fontWeight: 900, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                            {mainStat}
                        </span>
                        <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>
                            {subStat}
                        </span>
                    </div>
                </div>
                <PerformanceChart
                    data={chartData}
                    maxValue={maxVal}
                    formatTooltip={formatTooltip}
                    theme={theme}
                />
            </div>
            
            {!hasData && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', padding: 20, textAlign: 'center'
                }}>
                    <div style={{
                        background: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(22, 28, 38, 0.9)',
                        padding: '12px 24px', borderRadius: 100,
                        border: theme === 'light' ? '1px solid #E2E8F0' : '1px solid #2A3441',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                            Start practice to unlock this feature
                        </span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-[600] flex flex-col transition-all duration-300"
            style={{
                background: theme === 'light' ? '#F8FAFF' : '#0E131F',
            }}
        >
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display:none; }
            `}</style>

            {/* Sticky Header */}
            <div
                className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${theme === 'dark' ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`}
                style={{ paddingTop: STATUS_BAR_H + 8 }}
            >
                <div className="flex items-center justify-between">
                    {/* Left: back + title */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className={`text-[17px] font-bold truncate leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                Performance
                            </h1>
                        </div>
                    </div>

                    {/* Right: bookmark + progress with borders */}
                    <div className="flex items-center gap-2">
                        {/* Bookmark icon */}
                        <button
                            onClick={() => navigate('/student/pyq/bookmarks')}
                            className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${theme === 'dark'
                                ? 'border-[#2A3441] bg-[#161C26] text-white'
                                : 'border-slate-200 bg-white text-slate-700'
                                }`}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>

                        {/* Progress icon (highlighted active) */}
                        <button
                            onClick={() => navigate('/student/pyq/progress')}
                            className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${theme === 'dark'
                                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                                : 'border-[#2563EB] bg-[#2563EB] text-white'
                                }`}
                        >
                            <BarChart2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Subject Filter Tabs */}
            <div
                className={`flex-shrink-0 flex gap-1 overflow-x-auto no-scrollbar w-full px-5 py-2 mb-4 ${theme === 'dark' ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {['All', 'Physics', 'Chemistry', 'Maths', 'Biology'].map((sub) => (
                    <button
                        key={sub}
                        onClick={() => setPerfSubject(sub)}
                        className={`flex-shrink-0 px-4 text-sm font-bold transition-all whitespace-nowrap ${perfSubject === sub
                            ? (theme === 'dark' ? 'text-[#93C5FD] border-b-2 border-[#93C5FD]' : 'text-[#3B82F6] border-b-2 border-[#3B82F6]')
                            : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}
                        style={{ paddingBottom: 6 }}
                    >
                        {sub}
                    </button>
                ))}
            </div>

            {/* Timeline Toggle */}
            <div className="px-5 mb-4 flex-shrink-0">
                <div className={`flex p-1 rounded-full ${theme === 'dark' ? 'bg-[#161C26]' : 'bg-slate-100'}`} style={{ border: theme === 'dark' ? '1px solid #2A3441' : '1px solid #E2E8F0' }}>
                    {['Weekly', 'Monthly'].map((timeline) => {
                        const isActive = perfTimeline === timeline;
                        return (
                            <button
                                key={timeline}
                                onClick={() => setPerfTimeline(timeline)}
                                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${isActive
                                    ? (theme === 'dark'
                                        ? 'bg-[#161C26] border border-[#2563EB] text-[#93C5FD]'
                                        : 'bg-white border border-[#3B82F6] text-[#3B82F6] shadow-sm')
                                    : (theme === 'dark' ? 'text-slate-400 border border-transparent' : 'text-slate-500 border border-transparent')
                                    }`}
                            >
                                {timeline}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Difficulty Capsules */}
            <div className="px-5 mb-5 flex-shrink-0 flex gap-2 overflow-x-auto no-scrollbar">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                    const isActive = perfDifficulty === diff;
                    return (
                        <button
                            key={diff}
                            onClick={() => setPerfDifficulty(diff)}
                            className={`px-4 py-2 text-xs font-bold transition-all flex-shrink-0 ${isActive
                                ? (theme === 'dark'
                                    ? 'bg-[#2563EB] text-white'
                                    : 'bg-[#3B82F6] text-white shadow-sm')
                                : (theme === 'dark'
                                    ? 'bg-[#161C26] border border-[#2A3441] text-slate-400'
                                    : 'bg-white border border-slate-200 text-slate-500')
                                }`}
                            style={{ borderRadius: 8 }}
                        >
                            {diff}
                        </button>
                    );
                })}
            </div>

            {/* Stats Cards Scroll Area */}
            <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar"
                style={{
                    paddingBottom: isApproved ? 32 : (PRIME_BANNER_H + 48),
                }}
            >
                <div className="max-w-md mx-auto space-y-6">
                    {renderCard(
                        "Qs Attempted", 
                        `${stats.solved} Qs`, 
                        "Total Solved", 
                        solvedChartData, 
                        maxSolved, 
                        (val) => val + ' Qs'
                    )}
                    
                    {renderCard(
                        "Time Per Qs", 
                        stats.time, 
                        "Total Average", 
                        timeChartData, 
                        maxTime, 
                        (val) => Math.floor(val / 60) + 'm ' + (val % 60) + 's'
                    )}
                    
                    {renderCard(
                        "Accuracy", 
                        `${stats.accuracy} %`, 
                        "Total Accuracy", 
                        accuracyChartData, 
                        100, 
                        (val) => val + '%'
                    )}
                </div>
            </div>

            {/* Prime banner */}
            {!isApproved && (
                <div style={{ position: 'fixed', left: 0, right: 0, bottom: '16px', zIndex: 400 }}>
                    <div style={{
                        background: 'linear-gradient(to right, #7A41F7, #6330E3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px',
                    }}>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>5 free questions available</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0, marginTop: 2 }}>Get unlimited access with Prime.</p>
                        </div>
                        <button style={{
                            background: '#fff', color: '#7A41F7', fontWeight: 700,
                            fontSize: 12, padding: '8px 16px', borderRadius: 12,
                            border: 'none', cursor: 'pointer', flexShrink: 0,
                        }}>
                            Join Prime
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
