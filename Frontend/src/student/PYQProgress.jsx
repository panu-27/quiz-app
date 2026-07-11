import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, X, BarChart2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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

    const MOCK_STATS = {
        All: {
            Weekly: {
                All: { solved: 450, solvedData: [110, 95, 120, 125], time: "1m 15s", timeData: [78, 72, 75, 75], accuracy: 78, accuracyData: [75, 80, 76, 81] },
                Easy: { solved: 220, solvedData: [50, 60, 55, 55], time: "0m 45s", timeData: [42, 45, 48, 45], accuracy: 88, accuracyData: [85, 90, 87, 90] },
                Medium: { solved: 150, solvedData: [40, 25, 45, 40], time: "1m 20s", timeData: [85, 78, 82, 80], accuracy: 72, accuracyData: [70, 75, 71, 74] },
                Hard: { solved: 80, solvedData: [20, 10, 20, 30], time: "2m 45s", timeData: [170, 160, 165, 165], accuracy: 55, accuracyData: [50, 55, 53, 62] },
            },
            Monthly: {
                All: { solved: 1800, solvedData: [420, 480, 450, 450], time: "1m 12s", timeData: [74, 71, 72, 72], accuracy: 79, accuracyData: [77, 78, 80, 81] },
                Easy: { solved: 900, solvedData: [210, 240, 225, 225], time: "0m 42s", timeData: [41, 40, 43, 42], accuracy: 89, accuracyData: [88, 89, 90, 89] },
                Medium: { solved: 600, solvedData: [140, 160, 150, 150], time: "1m 18s", timeData: [80, 77, 78, 77], accuracy: 73, accuracyData: [71, 72, 75, 74] },
                Hard: { solved: 300, solvedData: [70, 80, 75, 75], time: "2m 38s", timeData: [160, 155, 158, 158], accuracy: 56, accuracyData: [54, 55, 57, 58] },
            }
        },
        Physics: {
            Weekly: {
                All: { solved: 120, solvedData: [30, 25, 35, 30], time: "1m 24s", timeData: [86, 80, 85, 85], accuracy: 74, accuracyData: [70, 75, 72, 79] },
                Easy: { solved: 60, solvedData: [15, 15, 15, 15], time: "0m 50s", timeData: [48, 52, 50, 50], accuracy: 86, accuracyData: [82, 88, 85, 89] },
                Medium: { solved: 40, solvedData: [10, 8, 12, 10], time: "1m 35s", timeData: [98, 92, 95, 95], accuracy: 68, accuracyData: [65, 70, 66, 71] },
                Hard: { solved: 20, solvedData: [5, 2, 8, 5], time: "3m 10s", timeData: [195, 180, 190, 195], accuracy: 50, accuracyData: [45, 50, 48, 57] },
            },
            Monthly: {
                All: { solved: 480, solvedData: [110, 130, 120, 120], time: "1m 20s", timeData: [82, 79, 80, 80], accuracy: 75, accuracyData: [73, 74, 76, 77] },
                Easy: { solved: 240, solvedData: [55, 65, 60, 60], time: "0m 48s", timeData: [47, 46, 49, 50], accuracy: 87, accuracyData: [86, 87, 88, 87] },
                Medium: { solved: 160, solvedData: [37, 43, 40, 40], time: "1m 30s", timeData: [92, 89, 90, 89], accuracy: 69, accuracyData: [67, 68, 71, 70] },
                Hard: { solved: 80, solvedData: [18, 22, 20, 20], time: "3m 0s", timeData: [185, 178, 180, 177], accuracy: 51, accuracyData: [49, 50, 52, 53] },
            }
        },
        Chemistry: {
            Weekly: {
                All: { solved: 95, solvedData: [20, 22, 28, 25], time: "0m 52s", timeData: [54, 50, 53, 51], accuracy: 82, accuracyData: [80, 84, 81, 83] },
                Easy: { solved: 50, solvedData: [12, 10, 15, 13], time: "0m 32s", timeData: [34, 30, 33, 31], accuracy: 92, accuracyData: [90, 94, 91, 93] },
                Medium: { solved: 30, solvedData: [5, 8, 9, 8], time: "1m 0s", timeData: [62, 58, 61, 59], accuracy: 78, accuracyData: [76, 80, 77, 79] },
                Hard: { solved: 15, solvedData: [3, 4, 4, 4], time: "1m 45s", timeData: [108, 102, 106, 104], accuracy: 62, accuracyData: [60, 64, 61, 63] },
            },
            Monthly: {
                All: { solved: 380, solvedData: [90, 100, 95, 95], time: "0m 50s", timeData: [52, 49, 50, 49], accuracy: 83, accuracyData: [81, 82, 84, 85] },
                Easy: { solved: 200, solvedData: [48, 52, 50, 50], time: "0m 30s", timeData: [32, 29, 30, 29], accuracy: 93, accuracyData: [92, 93, 94, 93] },
                Medium: { solved: 120, solvedData: [28, 32, 30, 30], time: "0m 58s", timeData: [60, 57, 58, 57], accuracy: 79, accuracyData: [77, 78, 80, 81] },
                Hard: { solved: 60, solvedData: [14, 16, 15, 15], time: "1m 42s", timeData: [105, 101, 103, 102], accuracy: 63, accuracyData: [61, 62, 64, 65] },
            }
        },
        Maths: {
            Weekly: {
                All: { solved: 150, solvedData: [35, 38, 37, 40], time: "2m 10s", timeData: [134, 128, 131, 127], accuracy: 76, accuracyData: [74, 78, 75, 77] },
                Easy: { solved: 70, solvedData: [16, 18, 18, 18], time: "1m 15s", timeData: [77, 73, 76, 74], accuracy: 86, accuracyData: [84, 88, 85, 87] },
                Medium: { solved: 55, solvedData: [13, 15, 14, 13], time: "2m 15s", timeData: [137, 133, 136, 134], accuracy: 72, accuracyData: [70, 74, 71, 73] },
                Hard: { solved: 25, solvedData: [6, 5, 5, 9], time: "4m 20s", timeData: [265, 255, 262, 258], accuracy: 52, accuracyData: [50, 54, 51, 53] },
            },
            Monthly: {
                All: { solved: 600, solvedData: [140, 160, 150, 150], time: "2m 5s", timeData: [129, 123, 126, 122], accuracy: 77, accuracyData: [75, 76, 78, 79] },
                Easy: { solved: 280, solvedData: [65, 75, 70, 70], time: "1m 12s", timeData: [74, 70, 73, 69], accuracy: 87, accuracyData: [85, 86, 88, 89] },
                Medium: { solved: 220, solvedData: [51, 59, 55, 55], time: "2m 10s", timeData: [132, 128, 131, 129], accuracy: 73, accuracyData: [71, 72, 74, 75] },
                Hard: { solved: 100, solvedData: [24, 26, 25, 25], time: "4m 12s", timeData: [256, 248, 253, 249], accuracy: 53, accuracyData: [51, 52, 54, 55] },
            }
        },
        Biology: {
            Weekly: {
                All: { solved: 85, solvedData: [25, 10, 20, 30], time: "0m 45s", timeData: [46, 42, 45, 47], accuracy: 80, accuracyData: [78, 82, 79, 81] },
                Easy: { solved: 40, solvedData: [12, 5, 10, 13], time: "0m 28s", timeData: [30, 26, 28, 28], accuracy: 90, accuracyData: [88, 92, 89, 91] },
                Medium: { solved: 25, solvedData: [8, 3, 6, 8], time: "0m 52s", timeData: [54, 50, 52, 52], accuracy: 76, accuracyData: [74, 78, 75, 77] },
                Hard: { solved: 20, solvedData: [5, 2, 4, 9], time: "1m 30s", timeData: [92, 88, 90, 90], accuracy: 60, accuracyData: [58, 62, 59, 61] },
            },
            Monthly: {
                All: { solved: 340, solvedData: [80, 90, 85, 85], time: "0m 42s", timeData: [44, 40, 42, 42], accuracy: 81, accuracyData: [79, 80, 82, 83] },
                Easy: { solved: 160, solvedData: [38, 42, 40, 40], time: "0m 26s", timeData: [28, 24, 26, 26], accuracy: 91, accuracyData: [90, 91, 92, 91] },
                Medium: { solved: 100, solvedData: [23, 27, 25, 25], time: "0m 50s", timeData: [52, 48, 50, 50], accuracy: 77, accuracyData: [75, 76, 78, 79] },
                Hard: { solved: 80, solvedData: [19, 21, 20, 20], time: "1m 26s", timeData: [88, 84, 86, 86], accuracy: 61, accuracyData: [59, 60, 62, 63] },
            }
        }
    };

    const stats = MOCK_STATS[perfSubject]?.[perfTimeline]?.[perfDifficulty] || MOCK_STATS.All.Weekly.All;
    const labels = perfTimeline === 'Weekly'
        ? ["04 May - 10 May", "11 May - 17 May", "18 May - 24 May", "25 May - 31 May"]
        : ["Feb", "Mar", "Apr", "May"];

    const solvedChartData = labels.map((l, i) => ({ label: l, value: stats.solvedData[i] }));
    const timeChartData = labels.map((l, i) => ({ label: l, value: stats.timeData[i] }));
    const accuracyChartData = labels.map((l, i) => ({ label: l, value: stats.accuracyData[i] }));

    const maxSolved = Math.max(...stats.solvedData, 10);
    const maxTime = Math.max(...stats.timeData, 60);

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
                <div className="max-w-md mx-auto space-y-4">
                    {/* Solved Card */}
                    <div style={{
                        background: theme === 'light' ? '#FFFFFF' : '#161C26',
                        border: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: theme === 'light' ? '0 4px 16px rgba(0,0,0,0.02)' : 'none',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 14, fontStyle: 'normal', fontWeight: 800, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                                Qs Attempted
                            </span>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 16, fontStyle: 'normal', fontWeight: 900, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                                    {stats.solved} Qs
                                </span>
                                <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>
                                    Total Solved
                                </span>
                            </div>
                        </div>
                        <PerformanceChart
                            data={solvedChartData}
                            maxValue={maxSolved}
                            formatTooltip={(val) => val + ' Qs'}
                            theme={theme}
                        />
                    </div>

                    {/* Time Card */}
                    <div style={{
                        background: theme === 'light' ? '#FFFFFF' : '#161C26',
                        border: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: theme === 'light' ? '0 4px 16px rgba(0,0,0,0.02)' : 'none',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 14, fontStyle: 'normal', fontWeight: 800, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                                Time Per Qs
                            </span>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 16, fontStyle: 'normal', fontWeight: 900, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                                    {stats.time}
                                </span>
                                <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>
                                    Total Average
                                </span>
                            </div>
                        </div>
                        <PerformanceChart
                            data={timeChartData}
                            maxValue={maxTime}
                            formatTooltip={(val) => Math.floor(val / 60) + 'm ' + (val % 60) + 's'}
                            theme={theme}
                        />
                    </div>

                    {/* Accuracy Card */}
                    <div style={{
                        background: theme === 'light' ? '#FFFFFF' : '#161C26',
                        border: theme === 'light' ? '1px solid rgba(226, 232, 240, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: theme === 'light' ? '0 4px 16px rgba(0,0,0,0.02)' : 'none',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 14, fontStyle: 'normal', fontWeight: 800, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                                Accuracy
                            </span>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 16, fontStyle: 'normal', fontWeight: 900, color: theme === 'light' ? '#1E293B' : '#FFFFFF' }}>
                                    {stats.accuracy} %
                                </span>
                                <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94A3B8', marginTop: 2 }}>
                                    Total Accuracy
                                </span>
                            </div>
                        </div>
                        <PerformanceChart
                            data={accuracyChartData}
                            maxValue={100}
                            formatTooltip={(val) => val + '%'}
                            theme={theme}
                        />
                    </div>
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
