import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBackButton from '../hooks/useBackButton';
import {
    ArrowLeft, ChevronDown, ChevronUp, Share2,
    Sliders, ChevronRight, FileText, Search,
    Loader2, Download, ExternalLink, X, Check,
    ZoomIn, ZoomOut, Maximize2, Award, Percent, Clock, Lock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const STATUS_BAR_H = 28.5;

// Mock PDF Questions Data for high-fidelity offline preview
const MOCK_PDF_QUESTIONS = [
    {
        num: 1,
        q: "A particle is moving in a circle of radius R with a constant speed v. The change in velocity when the particle describes an angle of 60° is:",
        opts: ["v", "v √2", "v √3", "2v"],
        subject: "Physics",
        ans: "A"
    },
    {
        num: 2,
        q: "The focal length of a biconvex lens of refractive index 1.5 is 20 cm. If it is immersed in water of refractive index 1.33, its focal length will become:",
        opts: ["20 cm", "40 cm", "80 cm", "10 cm"],
        subject: "Physics",
        ans: "C"
    },
    {
        num: 3,
        q: "Which of the following compounds is the most basic in nature?",
        opts: ["Aniline", "Benzylamine", "p-Nitroaniline", "Acetanilide"],
        subject: "Chemistry",
        ans: "B"
    },
    {
        num: 4,
        q: "The value of integral ∫ (0 to π/2) [ sin³(x) / (sin³(x) + cos³(x)) ] dx is equal to:",
        opts: ["π/2", "π/4", "π", "0"],
        subject: "Mathematics",
        ans: "B"
    },
    {
        num: 5,
        q: "For a reaction A + B → C, the rate law is given by Rate = k[A]¹/²[B]². What is the overall order of the reaction?",
        opts: ["5/2", "3/2", "2", "1/2"],
        subject: "Chemistry",
        ans: "A"
    }
];

// Mock database of previous year papers by goal
const PYQ_PAPERS_DB = {
    "MHT CET": [
        {
            year: "2025",
            papersCount: 16,
            items: [
                { id: "cet-2025-s1", title: "MHT CET 2025 (19 Apr Shift 1)", date: "19 Apr 2025", questions: 150, time: "180 mins" },
                { id: "cet-2025-s2", title: "MHT CET 2025 (19 Apr Shift 2)", date: "19 Apr 2025", questions: 150, time: "180 mins" },
                { id: "cet-2025-s3", title: "MHT CET 2025 (20 Apr Shift 1)", date: "20 Apr 2025", questions: 150, time: "180 mins" },
                { id: "cet-2025-s4", title: "MHT CET 2025 (20 Apr Shift 2)", date: "20 Apr 2025", questions: 150, time: "180 mins" },
                { id: "cet-2025-s5", title: "MHT CET 2025 (21 Apr Shift 1)", date: "21 Apr 2025", questions: 150, time: "180 mins" },
                { id: "cet-2025-s6", title: "MHT CET 2025 (21 Apr Shift 2)", date: "21 Apr 2025", questions: 150, time: "180 mins" },
                { id: "cet-2025-s7", title: "MHT CET 2025 (22 Apr Shift 1)", date: "22 Apr 2025", questions: 150, time: "180 mins" },
                { id: "cet-2025-s8", title: "MHT CET 2025 (22 Apr Shift 2)", date: "22 Apr 2025", questions: 150, time: "180 mins" },
            ]
        },
        {
            year: "2024",
            papersCount: 16,
            items: [
                { id: "cet-2024-s1", title: "MHT CET 2024 (16 May Shift 1)", date: "16 May 2024", questions: 150, time: "180 mins" },
                { id: "cet-2024-s2", title: "MHT CET 2024 (16 May Shift 2)", date: "16 May 2024", questions: 150, time: "180 mins" },
                { id: "cet-2024-s3", title: "MHT CET 2024 (17 May Shift 1)", date: "17 May 2024", questions: 150, time: "180 mins" },
                { id: "cet-2024-s4", title: "MHT CET 2024 (17 May Shift 2)", date: "17 May 2024", questions: 150, time: "180 mins" },
            ]
        },
        {
            year: "2023",
            papersCount: 10,
            items: [
                { id: "cet-2023-s1", title: "MHT CET 2023 (09 May Shift 1)", date: "09 May 2023", questions: 150, time: "180 mins" },
                { id: "cet-2023-s2", title: "MHT CET 2023 (09 May Shift 2)", date: "09 May 2023", questions: 150, time: "180 mins" },
            ]
        },
        {
            year: "2022",
            papersCount: 8,
            items: [
                { id: "cet-2022-s1", title: "MHT CET 2022 (05 Aug Shift 1)", date: "05 Aug 2022", questions: 150, time: "180 mins" },
                { id: "cet-2022-s2", title: "MHT CET 2022 (05 Aug Shift 2)", date: "05 Aug 2022", questions: 150, time: "180 mins" },
            ]
        },
        {
            year: "2021",
            papersCount: 10,
            items: [
                { id: "cet-2021-s1", title: "MHT CET 2021 (20 Sep Shift 1)", date: "20 Sep 2021", questions: 150, time: "180 mins" },
                { id: "cet-2021-s2", title: "MHT CET 2021 (20 Sep Shift 2)", date: "20 Sep 2021", questions: 150, time: "180 mins" },
            ]
        },
        {
            year: "2020",
            papersCount: 14,
            items: [
                { id: "cet-2020-s1", title: "MHT CET 2020 (12 Oct Shift 1)", date: "12 Oct 2020", questions: 150, time: "180 mins" },
                { id: "cet-2020-s2", title: "MHT CET 2020 (12 Oct Shift 2)", date: "12 Oct 2020", questions: 150, time: "180 mins" },
            ]
        }
    ],
    "IIT JEE": [
        {
            year: "2025",
            papersCount: 12,
            items: [
                { id: "jee-2025-1", title: "JEE Main 2025 (24 Jan Shift 1)", date: "24 Jan 2025", questions: 90, time: "180 mins" },
                { id: "jee-2025-2", title: "JEE Main 2025 (24 Jan Shift 2)", date: "24 Jan 2025", questions: 90, time: "180 mins" },
                { id: "jee-2025-3", title: "JEE Main 2025 (25 Jan Shift 1)", date: "25 Jan 2025", questions: 90, time: "180 mins" },
            ]
        },
        {
            year: "2024",
            papersCount: 10,
            items: [
                { id: "jee-2024-1", title: "JEE Main 2024 (27 Jan Shift 1)", date: "27 Jan 2024", questions: 90, time: "180 mins" },
                { id: "jee-2024-2", title: "JEE Main 2024 (27 Jan Shift 2)", date: "27 Jan 2024", questions: 90, time: "180 mins" },
            ]
        }
    ],
    "NEET": [
        {
            year: "2025",
            papersCount: 2,
            items: [
                { id: "neet-2025-1", title: "NEET 2025 (04 May)", date: "04 May 2025", questions: 200, time: "200 mins" },
            ]
        },
        {
            year: "2024",
            papersCount: 2,
            items: [
                { id: "neet-2024-1", title: "NEET 2024 (05 May)", date: "05 May 2024", questions: 200, time: "200 mins" },
            ]
        }
    ]
};

export default function PYQPapers() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const goal = localStorage.getItem("selectedGoal") || "MHT CET";

    const [activeYearFilter, setActiveYearFilter] = useState("All");
    const [expandedYears, setExpandedYears] = useState({ "2025": true });
    const [searchQuery, setSearchQuery] = useState("");
    const [sortByNewest, setSortByNewest] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    
    useBackButton(() => {
        if (showFilters) {
            setShowFilters(false);
            return true;
        }
        return false;
    }, showFilters);
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showFilters && !e.target.closest('.filter-container')) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilters]);

    // UI feedback states
    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 2000);
    };

    // Filter and retrieve papers data based on the active goal
    const rawGoalData = PYQ_PAPERS_DB[goal] || PYQ_PAPERS_DB["MHT CET"];

    const yearOptions = ["All", ...rawGoalData.map(g => g.year)];

    const processedData = rawGoalData.map(group => {
        const filteredItems = group.items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return {
            ...group,
            filteredItems
        };
    }).filter(group => {
        if (activeYearFilter !== "All" && group.year !== activeYearFilter) return false;
        return group.filteredItems.length > 0;
    });

    if (!sortByNewest) {
        processedData.reverse();
    }

    const totalCount = processedData.reduce((acc, curr) => acc + curr.filteredItems.length, 0);

    const toggleAccordion = (year) => {
        setExpandedYears(prev => ({
            ...prev,
            [year]: !prev[year]
        }));
    };

    const handleShare = (paperTitle, e) => {
        e.stopPropagation();
        const dummyUrl = `${window.location.origin}/#/student/pyq/papers?paper=${encodeURIComponent(paperTitle)}`;
        navigator.clipboard.writeText(dummyUrl).then(() => {
            showToast("Copied paper link to clipboard!");
        }).catch(() => {
            showToast("Failed to copy link");
        });
    };

    return (
        <div
            className="fixed inset-0 z-[600] flex flex-col transition-all duration-300"
            style={{
                background: isDark ? '#0E131F' : '#F8FAFF',
            }}
        >
            {/* Success Toast */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: 30,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: 30,
                    fontSize: 12,
                    fontWeight: 700,
                    zIndex: 10000,
                    boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
                    animation: 'fadeUp 0.2s ease-out'
                }}>
                    {toastMessage}
                </div>
            )}

            {/* Sticky Header */}
            <div
                className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`}
                style={{ paddingTop: STATUS_BAR_H + 8 }}
            >
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className={`w-10 h-10 -ml-2 flex items-center justify-center rounded-xl active:scale-95 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div>
                            <h1 className={`text-[17px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {goal} Papers
                            </h1>
                        </div>
                    </div>
                </div>



                {/* Horizontal Filter Row */}
                <div className="flex gap-2 items-center w-full filter-container">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: isDark ? '1px solid #2A3441' : '1px solid #E2E8F0',
                            background: isDark ? '#161C26' : '#FFFFFF',
                            color: (showFilters || activeYearFilter !== 'All') ? '#3B82F6' : (isDark ? '#94A3B8' : '#64748B'),
                            cursor: 'pointer',
                            flexShrink: 0
                        }}
                    >
                        <div className="relative">
                            <Sliders size={18} />
                            {activeYearFilter !== "All" && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#161C26]">
                                    1
                                </span>
                            )}
                        </div>
                    </button>

                    {showFilters ? (
                        <div className="flex gap-2 items-center overflow-x-auto no-scrollbar flex-1" style={{ scrollbarWidth: 'none' }}>
                            {yearOptions.map(yr => {
                                const isActive = activeYearFilter === yr;
                                return (
                                    <button
                                        key={yr}
                                        onClick={() => {
                                            setActiveYearFilter(yr);
                                            setShowFilters(false);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 10,
                                            border: isActive ? '1px solid #3B82F6' : (isDark ? '1px solid #2A3441' : '1px solid #E2E8F0'),
                                            background: isActive ? '#3B82F6' : (isDark ? '#161C26' : '#FFFFFF'),
                                            color: isActive ? '#FFFFFF' : (isDark ? '#E2E8F0' : '#64748B'),
                                            fontSize: 12,
                                            fontWeight: 750,
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {yr}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'
                                    }`}
                            />
                            <input
                                type="text"
                                placeholder="Search papers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full py-2.5 pl-10 pr-4 text-sm font-semibold rounded-xl border outline-none transition-all ${isDark
                                    ? 'bg-[#161C26] border-[#2A3441] text-white placeholder-slate-500 focus:border-blue-500'
                                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                    }`}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'
                                        }`}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-status Row */}
            <div className="px-5 py-2 flex items-center justify-between flex-shrink-0">
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                    Showing all PYQ mock ({totalCount})
                </span>

                <button
                    onClick={() => setSortByNewest(!sortByNewest)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        border: 'none',
                        background: 'transparent',
                        color: '#3B82F6',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer'
                    }}
                >
                    <span>Sort</span>
                    <span style={{ fontSize: 13 }}>{sortByNewest ? "↓↑" : "↑↓"}</span>
                </button>
            </div>

            {/* Scrollable Container with Accordion Groups */}
            <div className="flex-1 overflow-y-auto pb-8 space-y-2.5 no-scrollbar">
                {processedData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <FileText size={48} style={{ color: '#94A3B8', margin: '0 auto 16px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#FFFFFF' : '#334155', margin: 0 }}>
                            No papers found
                        </h3>
                        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                            Try adjusting your search criteria or filter.
                        </p>
                    </div>
                ) : (
                    processedData.map((group) => {
                        const isOpen = !!expandedYears[group.year];
                        return (
                            <div
                                key={group.year}
                                style={{
                                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #E2E8F0',
                                    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #E2E8F0',
                                    background: isDark ? '#161C26' : '#FFFFFF',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Accordion Header */}
                                <button
                                    onClick={() => toggleAccordion(group.year)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px 20px',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{
                                        fontSize: 13.5,
                                        fontWeight: 800,
                                        color: isDark ? '#E2E8F0' : '#334155'
                                    }}>
                                        {goal} {group.year} Papers <span style={{ color: '#94A3B8', fontWeight: 600 }}>({group.filteredItems.length} Papers)</span>
                                    </span>
                                    {isOpen ? (
                                        <ChevronUp size={16} style={{ color: '#94A3B8' }} />
                                    ) : (
                                        <ChevronDown size={16} style={{ color: '#94A3B8' }} />
                                    )}
                                </button>

                                {/* Accordion Body */}
                                {isOpen && (
                                    <div style={{
                                        padding: '0 16px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10,
                                        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #F1F5F9'
                                    }}>
                                        {/* Shift Papers List */}
                                        {group.filteredItems.map(paper => (
                                            <div
                                                key={paper.id}
                                                onClick={() => showToast("Coming Soon")}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 6,
                                                    padding: '14px 18px',
                                                    borderRadius: 12,
                                                    border: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid #F1F5F9',
                                                    background: isDark ? '#1F2937' : '#F8FAFC',
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    opacity: 0.8
                                                }}
                                            >
                                                {/* Card Header Row */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        <span style={{
                                                            fontSize: 13,
                                                            fontWeight: 750,
                                                            color: isDark ? '#FFFFFF' : '#334155'
                                                        }}>
                                                            {paper.title}
                                                        </span>
                                                        <span style={{
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            color: '#F59E0B',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}>
                                                            Coming Soon
                                                        </span>
                                                    </div>

                                                    <Lock size={16} style={{ color: '#94A3B8' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
