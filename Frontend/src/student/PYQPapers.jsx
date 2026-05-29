import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, ChevronDown, ChevronUp, Share2, 
    Sliders, ChevronRight, FileText, Search, 
    Loader2, Download, ExternalLink, X, Check,
    ZoomIn, ZoomOut, Maximize2, Award, Percent, Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STATUS_BAR_H = 43.5;

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
    
    // UI feedback states
    const [activePdf, setActivePdf] = useState(null);
    const [pdfZoom, setPdfZoom] = useState(100);
    const [activeAnalysis, setActiveAnalysis] = useState(null);
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
                                {goal}
                            </h1>
                            <p className={`text-[10px] font-black tracking-wider uppercase leading-none mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                2020-2025 | {totalCount} PYQ Tests
                            </p>
                        </div>
                    </div>
                </div>



                {/* Horizontal Filter Row (Scrollable Year Filters + Sliders option) */}
                <div className="flex gap-2 items-center overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: isDark ? '1px solid #2A3441' : '1px solid #E2E8F0',
                        background: isDark ? '#161C26' : '#FFFFFF',
                        color: isDark ? '#94A3B8' : '#64748B',
                        fontSize: 12,
                        fontWeight: 750,
                        cursor: 'pointer',
                        flexShrink: 0
                    }}>
                        <Sliders size={13} />
                        <span>Filter</span>
                    </button>

                    {yearOptions.map(yr => {
                        const isActive = activeYearFilter === yr;
                        return (
                            <button
                                key={yr}
                                onClick={() => setActiveYearFilter(yr)}
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
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {yr}
                            </button>
                        );
                    })}
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
            <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-3.5 no-scrollbar">
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
                                    borderRadius: 16,
                                    border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #E2E8F0',
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
                                                onClick={() => setActivePdf(paper)}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 6,
                                                    padding: '14px 18px',
                                                    borderRadius: 12,
                                                    border: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid #F1F5F9',
                                                    background: isDark ? '#1F2937' : '#F8FAFC',
                                                    cursor: 'pointer',
                                                    position: 'relative'
                                                }}
                                            >
                                                {/* Card Header Row */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{
                                                        fontSize: 13,
                                                        fontWeight: 750,
                                                        color: isDark ? '#FFFFFF' : '#334155'
                                                    }}>
                                                        {paper.title}
                                                    </span>
                                                    
                                                    <ChevronRight size={16} style={{ color: '#10B981' }} />
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

            {/* MOCK HIGH-FIDELITY OFFLINE PDF DOCUMENT READER MODAL */}
            {activePdf && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#1E1E1E',
                    color: '#FFFFFF',
                    animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) both'
                }}>
                    {/* Viewer Toolbar */}
                    <div style={{
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                        borderBottom: '1px solid #333333',
                        backgroundColor: '#2D2D2D'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button
                                onClick={() => setActivePdf(null)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#FFFFFF',
                                    cursor: 'pointer',
                                    padding: 4
                                }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <span style={{ fontSize: 13, fontWeight: 800, display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {activePdf.title}.pdf
                                </span>
                                <span style={{ fontSize: 10, color: '#A0A0A0', display: 'block' }}>
                                    {activePdf.questions} Qs · {activePdf.time}
                                </span>
                            </div>
                        </div>

                        {/* PDF Tools */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button 
                                onClick={() => setPdfZoom(z => Math.max(z - 10, 80))}
                                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer' }}
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span style={{ fontSize: 11, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                                {pdfZoom}%
                            </span>
                            <button 
                                onClick={() => setPdfZoom(z => Math.min(z + 10, 150))}
                                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer' }}
                            >
                                <ZoomIn size={16} />
                            </button>
                            <button 
                                onClick={() => showToast("Downloaded paper PDF successfully!")}
                                style={{ border: 'none', background: 'transparent', color: '#FFFFFF', cursor: 'pointer', padding: 4 }}
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    {/* PDF Document View Area */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        backgroundColor: '#1E1E1E',
                        padding: '24px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20
                    }}>
                        {/* Page 1 (Watermarked Document) */}
                        <div style={{
                            width: '100%',
                            maxWidth: 450,
                            aspectRatio: '1 / 1.414',
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                            padding: '30px 24px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            transform: `scale(${pdfZoom / 100})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.15s ease'
                        }}>
                            {/* Watermark */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-45deg)',
                                fontSize: 40,
                                fontWeight: 900,
                                color: 'rgba(29, 78, 216, 0.04)',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                userSelect: 'none'
                            }}>
                                {goal.toUpperCase()} EXPLORER
                            </div>

                            {/* Document Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '2px solid #000000',
                                paddingBottom: 8,
                                marginBottom: 16
                            }}>
                                <span style={{ fontSize: 10, fontWeight: 900 }}>{goal} PYQ</span>
                                <span style={{ fontSize: 10, fontWeight: 900 }}>{activePdf.date}</span>
                            </div>

                            {/* Paper Info */}
                            <h2 style={{ fontSize: 13, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>
                                {activePdf.title}
                            </h2>
                            <p style={{ fontSize: 9, color: '#666666', textAlign: 'center', marginBottom: 16 }}>
                                PHYSICS, CHEMISTRY & MATHEMATICS PAPER
                            </p>

                            {/* Exam Instructions */}
                            <div style={{
                                border: '1px solid #CCCCCC',
                                padding: 10,
                                borderRadius: 4,
                                marginBottom: 16
                            }}>
                                <h3 style={{ fontSize: 9, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>
                                    Important Instructions:
                                </h3>
                                <ul style={{ fontSize: 8, color: '#333333', paddingLeft: 12, margin: 0, listStyleType: 'decimal' }}>
                                    <li>This question paper contains {activePdf.questions} questions in total.</li>
                                    <li>All questions are compulsory. There is no negative marking for MHT CET.</li>
                                    <li>For each question, select the option corresponding to the correct answer.</li>
                                    <li>Do not write anything on the question booklet except your seat number.</li>
                                </ul>
                            </div>

                            {/* Question 1 */}
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: 10.5, fontWeight: 800, lineHeight: 1.4 }}>
                                    Q{MOCK_PDF_QUESTIONS[0].num}. {MOCK_PDF_QUESTIONS[0].q}
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 6,
                                    marginTop: 8,
                                    paddingLeft: 8
                                }}>
                                    {MOCK_PDF_QUESTIONS[0].opts.map((opt, oIdx) => (
                                        <div key={oIdx} style={{ fontSize: 9.5, fontWeight: 600 }}>
                                            ({String.fromCharCode(65 + oIdx)}) {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Page Footer */}
                            <div style={{
                                position: 'absolute',
                                bottom: 12,
                                left: 24,
                                right: 24,
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '1px solid #E0E0E0',
                                paddingTop: 6,
                                fontSize: 8,
                                color: '#999999'
                            }}>
                                <span>Page 1 of 3</span>
                                <span>Powered by Antigravity IDE</span>
                            </div>
                        </div>

                        {/* Page 2 */}
                        <div style={{
                            width: '100%',
                            maxWidth: 450,
                            aspectRatio: '1 / 1.414',
                            backgroundColor: '#FFFFFF',
                            color: '#1A1A1A',
                            padding: '30px 24px',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            transform: `scale(${pdfZoom / 100})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.15s ease'
                        }}>
                            {/* Watermark */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) rotate(-45deg)',
                                fontSize: 40,
                                fontWeight: 900,
                                color: 'rgba(29, 78, 216, 0.04)',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none'
                            }}>
                                {goal.toUpperCase()} EXPLORER
                            </div>

                            {/* Questions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Q2 */}
                                <div>
                                    <p style={{ fontSize: 10.5, fontWeight: 800, lineHeight: 1.4 }}>
                                        Q{MOCK_PDF_QUESTIONS[1].num}. {MOCK_PDF_QUESTIONS[1].q}
                                    </p>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 6,
                                        marginTop: 8,
                                        paddingLeft: 8
                                    }}>
                                        {MOCK_PDF_QUESTIONS[1].opts.map((opt, oIdx) => (
                                            <div key={oIdx} style={{ fontSize: 9.5, fontWeight: 600 }}>
                                                ({String.fromCharCode(65 + oIdx)}) {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Q3 */}
                                <div>
                                    <p style={{ fontSize: 10.5, fontWeight: 800, lineHeight: 1.4 }}>
                                        Q{MOCK_PDF_QUESTIONS[2].num}. {MOCK_PDF_QUESTIONS[2].q}
                                    </p>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 6,
                                        marginTop: 8,
                                        paddingLeft: 8
                                    }}>
                                        {MOCK_PDF_QUESTIONS[2].opts.map((opt, oIdx) => (
                                            <div key={oIdx} style={{ fontSize: 9.5, fontWeight: 600 }}>
                                                ({String.fromCharCode(65 + oIdx)}) {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Page Footer */}
                            <div style={{
                                position: 'absolute',
                                bottom: 12,
                                left: 24,
                                right: 24,
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '1px solid #E0E0E0',
                                paddingTop: 6,
                                fontSize: 8,
                                color: '#999999'
                            }}>
                                <span>Page 2 of 3</span>
                                <span>Powered by Antigravity IDE</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MOCK VIEW ANALYSIS MODAL */}
            {activeAnalysis && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <div 
                        onClick={() => setActiveAnalysis(null)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.65)',
                            backdropFilter: 'blur(3px)'
                        }}
                    />

                    {/* Modal Content */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 380,
                        backgroundColor: isDark ? '#161C26' : '#FFFFFF',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                        borderRadius: 20,
                        padding: 24,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
                        zIndex: 1,
                        animation: 'fadeUp 0.2s ease-out'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 900, color: isDark ? '#FFFFFF' : '#1E293B', margin: 0 }}>
                                Paper Analysis
                            </h3>
                            <button
                                onClick={() => setActiveAnalysis(null)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                    padding: 2
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Title of Paper */}
                        <p style={{ fontSize: 13, fontWeight: 750, color: '#3B82F6', margin: '0 0 16px' }}>
                            {activeAnalysis.title}
                        </p>

                        {/* Metrics Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 12,
                            marginBottom: 20
                        }}>
                            {/* Avg Score */}
                            <div style={{
                                padding: 14,
                                borderRadius: 12,
                                border: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid #F1F5F9',
                                backgroundColor: isDark ? '#1F2937' : '#F8FAFC'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3B82F6', marginBottom: 4 }}>
                                    <Award size={14} />
                                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>Avg Score</span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 900, color: isDark ? '#FFFFFF' : '#334155' }}>
                                    118/150
                                </span>
                            </div>

                            {/* Cutoff Percentile */}
                            <div style={{
                                padding: 14,
                                borderRadius: 12,
                                border: isDark ? '1px solid rgba(255,255,255,0.02)' : '1px solid #F1F5F9',
                                backgroundColor: isDark ? '#1F2937' : '#F8FAFC'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', marginBottom: 4 }}>
                                    <Percent size={14} />
                                    <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>Cutoff %ile</span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 900, color: isDark ? '#FFFFFF' : '#334155' }}>
                                    98.4 %
                                </span>
                            </div>
                        </div>

                        {/* Detailed Analysis Text */}
                        <div style={{
                            fontSize: 11.5,
                            lineHeight: 1.6,
                            color: isDark ? '#94A3B8' : '#64748B',
                            marginBottom: 24,
                            padding: 12,
                            borderLeft: '3px solid #10B981',
                            backgroundColor: isDark ? 'rgba(16,185,129,0.03)' : '#F0FDF4',
                            borderRadius: '0 8px 8px 0'
                        }}>
                            <strong>Difficulty:</strong> Moderate-Easy. Chemistry section was highly theoretical with 90% syllabus covered from State Board books. Mathematics contained lengthier calculus problems.
                        </div>

                        {/* Footer button */}
                        <button
                            onClick={() => {
                                setActiveAnalysis(null);
                                setActivePdf(activeAnalysis);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-transparent font-bold text-[13px] text-white active:scale-95 transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                                cursor: 'pointer'
                            }}
                        >
                            <FileText size={15} />
                            <span>Open Question Paper</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
