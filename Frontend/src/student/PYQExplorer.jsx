import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ChevronDown, ChevronUp, Search,
    AlertTriangle, CheckCircle2, Loader2,
    Eye, EyeOff, X, Calendar,
} from 'lucide-react';
import api from '../api/axios.js';
import { SUBJECT_MAP, YEAR_OPTIONS } from './pyqData';
import StudentHeader from './StudentHeader';

// ─── KaTeX singleton ────────────────────────────────────────────────
const loadKaTeX = (() => {
    let loaded = false, loading = null;
    return () => {
        if (loaded) return Promise.resolve();
        if (loading) return loading;
        loading = new Promise(resolve => {
            if (!document.querySelector('link[href*="katex"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
                document.head.appendChild(link);
            }
            const s1 = document.createElement('script');
            s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
            s1.onload = () => {
                const s2 = document.createElement('script');
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
                s2.onload = () => { loaded = true; resolve(); };
                document.head.appendChild(s2);
            };
            document.head.appendChild(s1);
        });
        return loading;
    };
})();

const KaTeXSpan = ({ html }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current || !html) return;
        ref.current.innerHTML = html;
        loadKaTeX().then(() => {
            if (ref.current && window.renderMathInElement)
                window.renderMathInElement(ref.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true },
                    ],
                    throwOnError: false,
                });
        });
    }, [html]);
    return <span ref={ref} />;
};

const DIFF_STYLE = {
    Easy:   { bg: '#ECFDF5', color: '#059669' },
    Medium: { bg: '#FFFBEB', color: '#D97706' },
    Hard:   { bg: '#FFF1F2', color: '#E11D48' },
};

const REPORT_REASONS = [
    { key: 'blurry_image',         label: 'Blurry / Missing Image' },
    { key: 'incorrect_question',   label: 'Incorrect Question Text' },
    { key: 'incorrect_options',    label: 'Incorrect / Missing Options' },
    { key: 'wrong_correct_option', label: 'Wrong Correct Answer Marked' },
    { key: 'improper_explanation', label: 'Improper / Missing Explanation' },
    { key: 'ui_error',             label: 'UI / Display Error' },
];

const CHAPTER_PALETTES = [
    { grad: 'linear-gradient(135deg,#6366F1,#8B5CF6)', light: '#EEF2FF', text: '#4F46E5', shadow: 'rgba(99,102,241,0.28)' },
    { grad: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', light: '#E0F2FE', text: '#0369A1', shadow: 'rgba(14,165,233,0.28)' },
    { grad: 'linear-gradient(135deg,#10B981,#34D399)', light: '#D1FAE5', text: '#059669', shadow: 'rgba(16,185,129,0.28)' },
    { grad: 'linear-gradient(135deg,#F59E0B,#FBBF24)', light: '#FEF3C7', text: '#B45309', shadow: 'rgba(245,158,11,0.28)' },
    { grad: 'linear-gradient(135deg,#EF4444,#F87171)', light: '#FEE2E2', text: '#DC2626', shadow: 'rgba(239,68,68,0.28)'  },
    { grad: 'linear-gradient(135deg,#EC4899,#F472B6)', light: '#FCE7F3', text: '#BE185D', shadow: 'rgba(236,72,153,0.28)' },
    { grad: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', light: '#EDE9FE', text: '#7C3AED', shadow: 'rgba(139,92,246,0.28)' },
    { grad: 'linear-gradient(135deg,#14B8A6,#2DD4BF)', light: '#CCFBF1', text: '#0F766E', shadow: 'rgba(20,184,166,0.28)'  },
];

const DOT_COLORS = ['#6366F1','#0EA5E9','#10B981','#F59E0B','#EF4444','#EC4899','#8B5CF6','#14B8A6'];

// ════════════════════════════════════════════════════════════════════
// SKELETON COMPONENTS — YouTube-style shimmer
// ════════════════════════════════════════════════════════════════════
const Shimmer = ({ w = '100%', h = 16, r = 8, mb = 0 }) => (
    <div style={{
        width: w, height: h, borderRadius: r,
        marginBottom: mb,
        background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        flexShrink: 0,
    }} />
);

const QuestionSkeleton = () => (
    <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', background: '#fff' }}>
        <div style={{ display: 'flex', gap: 12 }}>
            <Shimmer w={26} h={26} r={7} />
            <div style={{ flex: 1 }}>
                <Shimmer h={13} r={6} mb={6} />
                <Shimmer w="75%" h={13} r={6} mb={10} />
                <div style={{ display: 'flex', gap: 6 }}>
                    <Shimmer w={54} h={16} r={4} />
                    <Shimmer w={46} h={16} r={4} />
                </div>
            </div>
        </div>
    </div>
);

const ChapterSkeleton = () => (
    <div style={{ padding: '18px 16px 16px', borderRadius: 20, background: '#fff', border: '1px solid #F1F5F9' }}>
        <Shimmer w={32} h={32} r={10} mb={12} />
        <Shimmer h={13} r={6} mb={6} />
        <Shimmer w="60%" h={13} r={6} />
    </div>
);

const TopicSkeleton = () => (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
        <Shimmer w={9} h={9} r={99} />
        <Shimmer h={13} r={6} />
    </div>
);

// ════════════════════════════════════════════════════════════════════
// QUESTION ITEM
// ════════════════════════════════════════════════════════════════════
const QuestionItem = ({ q, idx, onReport, isOpen, onToggle }) => {
    const [showSolution, setShowSolution] = useState(false);
    const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.Medium;
    useEffect(() => { if (!isOpen) setShowSolution(false); }, [isOpen]);

    return (
        <div style={{
            borderBottom: '1px solid #F1F5F9',
            background: isOpen ? '#FAFBFF' : '#fff',
            transition: 'background 0.2s ease',
            overflow: 'hidden',
        }}>
            <div
                onClick={onToggle}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', cursor: 'pointer' }}
            >
                <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: isOpen ? '#4F46E5' : '#F1F5F9',
                    color: isOpen ? '#fff' : '#94A3B8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 2,
                    transition: 'all 0.2s ease',
                }}>{idx + 1}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 14, fontWeight: 500, color: '#1E293B', lineHeight: 1.55,
                        display: '-webkit-box', WebkitLineClamp: isOpen ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical', overflow: isOpen ? 'visible' : 'hidden',
                    }}>
                        <KaTeXSpan html={q.question || q.questionText || ''} />
                    </div>
                    {/* Question image */}
                    {isOpen && q.questionImage && (
                        <img
                            src={q.questionImage}
                            alt=""
                            style={{ maxWidth: '100%', borderRadius: 10, marginTop: 12, marginBottom: 4, border: '1px solid #F1F5F9', display: 'block' }}
                        />
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                        {q.year && (
                            <span style={{ fontSize: 9, fontWeight: 800, color: '#6366F1', background: '#EEF2FF', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                {q.year}{q.shift ? ` · ${q.shift}` : ''}
                            </span>
                        )}
                        {q.difficulty && (
                            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase', background: diff.bg, color: diff.color }}>
                                {q.difficulty}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ color: isOpen ? '#4F46E5' : '#CBD5E1', flexShrink: 0, marginTop: 3 }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {isOpen && (
                <div style={{ padding: '0 16px 16px 16px', animation: 'fadeIn 0.2s ease', minWidth: 0 }}>
                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                        {(q.options || []).map((opt, i) => {
                            const isCorrect = (q.correctOption ?? q.correctAnswer) === i;
                            const green = showSolution && isCorrect;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px', borderRadius: 12,
                                    border: `1px solid ${green ? '#BBF7D0' : '#F1F5F9'}`,
                                    background: green ? '#F0FDF4' : '#F8FAFC', transition: 'all 0.15s',
                                }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        background: green ? '#16A34A' : '#E5E7EB',
                                        color: green ? '#fff' : '#94A3B8',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 800,
                                    }}>{String.fromCharCode(65 + i)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* Option image */}
                                        {opt.image && (
                                            <img
                                                src={opt.image}
                                                alt=""
                                                style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8, marginBottom: opt.text ? 6 : 0, display: 'block' }}
                                            />
                                        )}
                                        {opt.text && (
                                            <span style={{ fontSize: 13, fontWeight: 500, color: green ? '#166534' : '#374151', lineHeight: 1.5 }}>
                                                <KaTeXSpan html={opt.text} />
                                            </span>
                                        )}
                                    </div>
                                    {green && <CheckCircle2 size={14} color="#16A34A" style={{ flexShrink: 0, marginTop: 3 }} />}
                                </div>
                            );
                        })}
                    </div>

                    {/* Solution — only the explanation box scrolls horizontally if content overflows */}
                    {showSolution && (q.explanation || q.explanationImage) && (
                        <div style={{ background: '#fff', border: '1px solid #E0E7FF', borderRadius: 12, padding: 14, marginBottom: 12, overflowX: 'auto' }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Solution</p>
                            {q.explanation && (
                                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, width: 'max-content', maxWidth: '100%', minWidth: 0 }}>
                                    <KaTeXSpan html={q.explanation} />
                                </div>
                            )}
                            {q.explanationImage && (
                                <img src={q.explanationImage} alt="" style={{ display: 'block', maxHeight: 340, borderRadius: 8, marginTop: q.explanation ? 10 : 0 }} />
                            )}
                        </div>
                    )}















                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowSolution(s => !s)} style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '10px 0', borderRadius: 10,
                            background: showSolution ? '#4F46E5' : '#F1F5F9',
                            color: showSolution ? '#fff' : '#64748B',
                            border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
                            {showSolution ? 'Hide Solution' : 'View Solution'}
                        </button>
                        <button onClick={() => onReport(q)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#EF4444', border: 'none', cursor: 'pointer',
                        }}>
                            <AlertTriangle size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════
// TOPIC SECTION — uses pre-fetched allQuestions, filters by topicId
// No extra API call per topic — just filters from parent's loaded data
// ════════════════════════════════════════════════════════════════════
const TopicSection = ({ topic, topicIdx, accent, filterYear, allQuestions, isExpanded, onToggle, openQuestionId, setOpenQuestionId, onReport }) => {
    const dotColor = DOT_COLORS[topicIdx % DOT_COLORS.length];

    // Filter questions for this topic from the already-loaded allQuestions list
    const topicQuestions = useMemo(() => {
        let qs = allQuestions.filter(q => {
            // match by topicId field on the question, or _topicName we injected
            return (q.topicId === topic._id) || (q.topicId?._id === topic._id) || (q._topicId === topic._id);
        });
        // If year filter is set, filter client-side too
        if (filterYear !== 'All') {
            qs = qs.filter(q => String(q.year) === String(filterYear));
        }
        return qs;
    }, [allQuestions, topic._id, filterYear]);

    return (
        <div style={{ borderBottom: '1px solid #F1F5F9' }}>
            <div
                onClick={onToggle}
                style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', cursor: 'pointer',
                    background: isExpanded ? '#FAFBFF' : '#fff',
                    transition: 'background 0.2s',
                }}
            >
                <div style={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    background: dotColor,
                    boxShadow: `0 0 0 3px ${dotColor}28`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B', margin: 0 }}>{topic.name}</p>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0', fontWeight: 600 }}>
                        {topicQuestions.length} question{topicQuestions.length !== 1 ? 's' : ''}
                        {filterYear !== 'All' ? ` · ${filterYear}` : ''}
                    </p>
                </div>
                <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                    background: isExpanded ? '#EEF2FF' : '#F8FAFC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isExpanded ? '#4F46E5' : '#CBD5E1',
                    transition: 'all 0.2s',
                }}>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </div>
            </div>

            {isExpanded && (
                <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    {topicQuestions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '28px 0', color: '#CBD5E1', fontSize: 13, fontWeight: 600 }}>
                            No questions {filterYear !== 'All' ? `for ${filterYear}` : ''}
                        </div>
                    ) : topicQuestions.map((q, i) => (
                        <QuestionItem
                            key={q._id} q={q} idx={i}
                            isOpen={openQuestionId === q._id}
                            onToggle={() => setOpenQuestionId(openQuestionId === q._id ? null : q._id)}
                            onReport={onReport}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export default function PYQExplorer() {
    const { subjectId } = useParams();
    const navigate      = useNavigate();
    const subject       = SUBJECT_MAP[subjectId];
    const accent        = subject?.accent || '#4F46E5';

    const [activeChapter, setActiveChapter]     = useState(null);
    const [viewMode, setViewMode]               = useState('all');

    const [chapters, setChapters]               = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(true);

    // Single source of truth for ALL questions in the chapter (fetched once)
    const [allQuestions, setAllQuestions]       = useState([]);
    const [questionsLoading, setQLoading]       = useState(false);
    const [openQuestionId, setOpenQuestionId]   = useState(null);
    const [searchQ, setSearchQ]                 = useState('');

    // Topics list (fetched once per chapter entry)
    const [topics, setTopics]                   = useState([]);
    const [topicsLoading, setTopicsLoading]     = useState(false);
    const [expandedTopicId, setExpandedTopicId] = useState(null);
    const [topicOpenQId, setTopicOpenQId]       = useState(null);

    const [filterYear, setFilterYear]           = useState('All');
    const [yearPickerOpen, setYearPickerOpen]   = useState(false);

    const [reportTarget, setReportTarget]       = useState(null);
    const [reportDone, setReportDone]           = useState(false);

    const [headerVisible, setHeaderVisible]     = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const fn = () => {
            const cur = window.scrollY;
            setHeaderVisible(cur <= lastScrollY.current || cur <= 100);
            lastScrollY.current = cur;
        };
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => { loadKaTeX(); }, []);

    // Fetch chapter list
    useEffect(() => {
        if (!subjectId) return;
        setChaptersLoading(true);
        api.get(`/quiz/subjects/${subjectId}/chapters`)
            .then(res => setChapters(res.data?.data || res.data || []))
            .finally(() => setChaptersLoading(false));
    }, [subjectId]);

    // Fetch topics + all questions in one go when entering chapter
    // Questions are fetched per-topic in parallel and merged with topicId attached
    const loadChapterData = useCallback(async (chap) => {
        if (!chap) return;
        setQLoading(true);
        setTopicsLoading(true);
        setAllQuestions([]);
        setTopics([]);
        try {
            const topicsRes = await api.get(`/pyq/${subjectId}/chapters/${chap._id}/topics`);
            const topicList = topicsRes.data || [];
            setTopics(topicList);
            setTopicsLoading(false);

            // Fetch questions for all topics in parallel — NO year filter here, load everything
            // Year filtering is done client-side so we never re-fetch
            const allQs = await Promise.all(
                topicList.map(t =>
                    api.get(`/pyq/${subjectId}/chapters/${chap._id}/topics/${t._id}/questions`)
                        .then(r => (r.data || []).map(q => ({
                            ...q,
                            topicId: t._id,        // attach topicId for client-side grouping
                            _topicName: t.name,
                        })))
                        .catch(() => [])
                )
            );
            setAllQuestions(allQs.flat());
        } catch (err) { console.error(err); }
        finally { setQLoading(false); setTopicsLoading(false); }
    }, [subjectId]);

    const enterChapter = (chap) => {
        setActiveChapter(chap);
        setViewMode('all');
        setFilterYear('All');
        setYearPickerOpen(false);
        setOpenQuestionId(null);
        setTopicOpenQId(null);
        setExpandedTopicId(null);
        setSearchQ('');
        loadChapterData(chap);
    };

    // All Questions: client-side filter by year + search (no re-fetch)
    const filteredQuestions = useMemo(() => {
        let qs = allQuestions;
        if (filterYear !== 'All') qs = qs.filter(q => String(q.year) === String(filterYear));
        const sq = searchQ.toLowerCase();
        if (sq) qs = qs.filter(q => (q.question || '').toLowerCase().includes(sq));
        return qs;
    }, [allQuestions, filterYear, searchQ]);

    const handleReport = async (reasonKey) => {
        if (!reportTarget) return;
        try {
            await api.post('/quiz/question-report', { questionId: reportTarget._id, reason: reasonKey });
            setReportDone(true);
            setTimeout(() => { setReportTarget(null); setReportDone(false); }, 1600);
        } catch { setReportTarget(null); }
    };

    const goBack = () => {
        if (activeChapter) {
            setActiveChapter(null);
            setAllQuestions([]);
            setTopics([]);
            setYearPickerOpen(false);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display:none; }
                .chap-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
                .chap-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px -6px rgba(0,0,0,0.10); }
                .view-tab { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
                .year-chip { transition: all 0.15s ease; }
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                @keyframes scaleIn   { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
                @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-7px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin      { to{transform:rotate(360deg)} }
            `}</style>

            <div className="hidden md:block"><StudentHeader /></div>

            {/* ══════════ STICKY HEADER ══════════ */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(255,255,255,0.93)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid #F1F5F9',
                transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {/* Row 1 — back + title + year btn */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
                    <button onClick={goBack} style={{
                        width: 36, height: 36, borderRadius: 10, background: '#F8FAFC',
                        border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                    }}>
                        <ArrowLeft size={16} color="#475569" />
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {activeChapter && (
                            <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1px' }}>
                                {subject.name}
                            </p>
                        )}
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeChapter ? activeChapter.name : subject.name}
                        </p>
                        {!activeChapter && (
                            <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>PYQ Explorer</p>
                        )}
                    </div>

                    {activeChapter && (
                        <button
                            onClick={() => setYearPickerOpen(o => !o)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '7px 11px', borderRadius: 10, border: 'none', flexShrink: 0,
                                background: filterYear !== 'All' ? accent : '#F1F5F9',
                                color: filterYear !== 'All' ? '#fff' : '#475569',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            <Calendar size={13} />
                            {filterYear !== 'All' ? filterYear : 'Year'}
                            {filterYear !== 'All' && (
                                <span
                                    onClick={e => { e.stopPropagation(); setFilterYear('All'); setYearPickerOpen(false); }}
                                    style={{ display: 'flex', alignItems: 'center', opacity: 0.75, marginLeft: 1 }}
                                >
                                    <X size={11} />
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* Row 2 — toggle */}
                {activeChapter && (
                    <div style={{ padding: '0 16px 10px' }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            background: '#F1F5F9', borderRadius: 12, padding: 3, gap: 3,
                        }}>
                            {[{ key: 'all', label: 'All Questions' }, { key: 'topic', label: 'Topic Wise' }].map(({ key, label }) => (
                                <button
                                    key={key}
                                    className="view-tab"
                                    onClick={() => { setViewMode(key); setOpenQuestionId(null); setTopicOpenQId(null); setExpandedTopicId(null); }}
                                    style={{
                                        padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 700,
                                        border: 'none', cursor: 'pointer',
                                        background: viewMode === key ? '#fff' : 'transparent',
                                        color: viewMode === key ? accent : '#94A3B8',
                                        boxShadow: viewMode === key ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                                    }}
                                >{label}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Year picker dropdown */}
                {yearPickerOpen && activeChapter && (
                    <div style={{ padding: '2px 16px 13px', borderTop: '1px solid #F8FAFC', animation: 'slideDown 0.2s ease' }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Filter by Year</p>
                        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }} className="no-scrollbar">
                            {YEAR_OPTIONS.map(y => (
                                <button
                                    key={y} className="year-chip"
                                    onClick={() => { setFilterYear(y); setYearPickerOpen(false); }}
                                    style={{
                                        padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                        whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
                                        background: filterYear === y ? accent : '#F1F5F9',
                                        color: filterYear === y ? '#fff' : '#64748B',
                                    }}
                                >{y}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search — All mode only */}
                {activeChapter && viewMode === 'all' && (
                    <div style={{ padding: '0 16px 10px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#CBD5E1' }} />
                            <input
                                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                                placeholder="Search questions…"
                                style={{
                                    width: '100%', padding: '9px 34px 9px 34px', borderRadius: 11,
                                    border: '1px solid #F1F5F9', background: '#F8FAFC',
                                    fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#334155',
                                }}
                            />
                            {searchQ && (
                                <button onClick={() => setSearchQ('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: 0, display: 'flex' }}>
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════ BODY ══════════ */}
            <div className="pb-24" style={{ maxWidth: 600, margin: '0 auto' }}>

                {/* Chapter grid */}
                {!activeChapter && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '20px 16px' }}>
                        {chaptersLoading
                            ? [...Array(8)].map((_, i) => <ChapterSkeleton key={i} />)
                            : chapters.map((chap, idx) => {
                                const pal = CHAPTER_PALETTES[idx % CHAPTER_PALETTES.length];
                                return (
                                    <div
                                        key={chap._id}
                                        onClick={() => enterChapter(chap)}
                                        className="chap-card"
                                        style={{ padding: '18px 16px 16px', borderRadius: 20, background: '#fff', border: '1px solid #F1F5F9', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                    >
                                        <div style={{ position: 'absolute', top: -20, right: -20, width: 72, height: 72, borderRadius: '50%', background: pal.grad, opacity: 0.12 }} />
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 10, background: pal.grad, marginBottom: 12,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, fontWeight: 800, color: '#fff',
                                            boxShadow: `0 4px 12px ${pal.shadow}`,
                                        }}>{idx + 1}</div>
                                        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', lineHeight: 1.4, margin: 0 }}>{chap.name}</h3>
                                        {chap.weightage && (
                                            <p style={{ fontSize: 10, color: pal.text, fontWeight: 700, margin: '5px 0 0', background: pal.light, display: 'inline-block', padding: '2px 7px', borderRadius: 5 }}>
                                                {chap.weightage}%
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* All Questions */}
                {activeChapter && viewMode === 'all' && (
                    <div style={{ background: '#fff', borderTop: '1px solid #F1F5F9' }}>
                        {questionsLoading
                            ? [...Array(15)].map((_, i) => <QuestionSkeleton key={i} />)
                            : filteredQuestions.length === 0
                                ? (
                                    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#CBD5E1', marginBottom: 6 }}>No questions found</p>
                                        <p style={{ fontSize: 12, color: '#E2E8F0' }}>
                                            {filterYear !== 'All' ? 'Try a different year' : 'Try searching something else'}
                                        </p>
                                    </div>
                                )
                                : filteredQuestions.map((q, i) => (
                                    <QuestionItem
                                        key={q._id} q={q} idx={i}
                                        isOpen={openQuestionId === q._id}
                                        onToggle={() => setOpenQuestionId(openQuestionId === q._id ? null : q._id)}
                                        onReport={setReportTarget}
                                    />
                                ))
                        }
                    </div>
                )}

                {/* Topic Wise */}
                {activeChapter && viewMode === 'topic' && (
                    <div style={{ background: '#fff', borderTop: '1px solid #F1F5F9' }}>
                        {topicsLoading
                            ? [...Array(5)].map((_, i) => <TopicSkeleton key={i} />)
                            : topics.length === 0
                                ? (
                                    <div style={{ textAlign: 'center', padding: '70px 24px', color: '#CBD5E1', fontSize: 13, fontWeight: 600 }}>
                                        No topics found
                                    </div>
                                )
                                : topics.map((topic, tidx) => (
                                    <TopicSection
                                        key={topic._id}
                                        topic={topic}
                                        topicIdx={tidx}
                                        accent={accent}
                                        filterYear={filterYear}
                                        allQuestions={allQuestions}
                                        isExpanded={expandedTopicId === topic._id}
                                        onToggle={() => {
                                            setExpandedTopicId(expandedTopicId === topic._id ? null : topic._id);
                                            setTopicOpenQId(null);
                                        }}
                                        openQuestionId={topicOpenQId}
                                        setOpenQuestionId={setTopicOpenQId}
                                        onReport={setReportTarget}
                                    />
                                ))
                        }
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {reportTarget && (
                <div
                    onClick={() => setReportTarget(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 24, animation: 'fadeIn 0.25s ease',
                    }}
                >
                    <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 340, animation: 'scaleIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
                        {reportDone ? (
                            <div style={{ textAlign: 'center' }}>
                                <CheckCircle2 size={32} strokeWidth={1.5} color={accent} style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>Received</p>
                            </div>
                        ) : (
                            <>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, textAlign: 'center' }}>Report Issue</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {REPORT_REASONS.map(r => (
                                        <button
                                            key={r.key} onClick={() => handleReport(r.key)}
                                            style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 12, background: 'transparent', border: 'none', fontSize: 14, fontWeight: 500, color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                                        >{r.label}</button>
                                    ))}
                                </div>
                                <button onClick={() => setReportTarget(null)} style={{ width: '100%', marginTop: 10, padding: '12px', background: 'none', border: 'none', fontSize: 12, color: '#CBD5E1', cursor: 'pointer', fontWeight: 600 }}>
                                    Dismiss
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}