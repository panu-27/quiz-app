import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ChevronDown, ChevronUp, Search,
    AlertTriangle, X, CheckCircle2, Loader2,
    Eye, EyeOff, SlidersHorizontal,
} from 'lucide-react';
import api from '../api/axios.js';
import { SUBJECT_MAP, DIFFICULTY_OPTIONS, YEAR_OPTIONS } from './pyqData';
import StudentHeader from './StudentHeader';

// ─── KaTeX (singleton) ───────────────────────────────────────────────
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
    Easy: { bg: '#ECFDF5', color: '#059669' },
    Medium: { bg: '#FFFBEB', color: '#D97706' },
    Hard: { bg: '#FFF1F2', color: '#E11D48' },
};

const REPORT_REASONS = [
    { key: 'blurry_image', label: 'Blurry / Missing Image' },
    { key: 'incorrect_question', label: 'Incorrect Question Text' },
    { key: 'incorrect_options', label: 'Incorrect / Missing Options' },
    { key: 'wrong_correct_option', label: 'Wrong Correct Answer Marked' },
    { key: 'improper_explanation', label: 'Improper / Missing Explanation' },
    { key: 'ui_error', label: 'UI / Display Error' },
];

// ════════════════════════════════════════════════════════════════════
// QUESTION ITEM (Prop-driven open state for Accordion behavior)
// ════════════════════════════════════════════════════════════════════
const QuestionItem = ({ q, idx, onReport, isOpen, onToggle }) => {
    const [showSolution, setShowSolution] = useState(false);
    const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.Medium;

    // Reset solution toggle when closed
    useEffect(() => { if (!isOpen) setShowSolution(false); }, [isOpen]);

    return (
        <div style={{
            borderBottom: '1px solid #F1F5F9',
            background: isOpen ? '#FAFBFF' : '#fff',
            transition: 'background 0.2s ease',
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
                    transition: 'all 0.2s ease'
                }}>
                    {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 14, fontWeight: 500, color: '#1E293B', lineHeight: 1.55,
                        display: '-webkit-box', WebkitLineClamp: isOpen ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical', overflow: isOpen ? 'visible' : 'hidden',
                    }}>
                        <KaTeXSpan html={q.question || q.questionText || ''} />
                    </div>

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
                <div style={{ padding: '0 16px 16px 16px', animation: 'fadeIn 0.2s ease' }}>
                    {q.questionImage && (
                        <img src={q.questionImage} style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 14, border: '1px solid #F1F5F9' }} alt="" />
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                        {(q.options || []).map((opt, i) => {
                            const isCorrect = (q.correctOption ?? q.correctAnswer) === i;
                            const green = showSolution && isCorrect;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: '12px', borderRadius: 12,
                                    border: `1px solid ${green ? '#BBF7D0' : '#F1F5F9'}`,
                                    background: green ? '#F0FDF4' : '#F8FAFC',
                                    transition: 'all 0.15s',
                                }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        background: green ? '#16A34A' : '#E5E7EB',
                                        color: green ? '#fff' : '#94A3B8',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 800,
                                    }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {opt.image && <img src={opt.image} style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain', borderRadius: 6, marginBottom: opt.text ? 6 : 0 }} alt="" />}
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

                    {showSolution && (q.explanation || q.explanationImage) && (
                        <div style={{ background: '#fff', border: '1px solid #E0E7FF', borderRadius: 12, padding: 14, marginBottom: 12 }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Solution</p>
                            {q.explanation && (
                                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.65 }}>
                                    <KaTeXSpan html={q.explanation} />
                                </div>
                            )}
                            {q.explanationImage && (
                                <img src={q.explanationImage} style={{ maxWidth: '100%', borderRadius: 8, marginTop: 10 }} alt="" />
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => setShowSolution(s => !s)}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px 0', borderRadius: 10,
                                background: showSolution ? '#4F46E5' : '#F1F5F9',
                                color: showSolution ? '#fff' : '#64748B',
                                border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
                            {showSolution ? 'Hide Solution' : 'View Solution'}
                        </button>
                        <button
                            onClick={() => onReport(q)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '10px 14px', borderRadius: 10,
                                background: '#FEF2F2', color: '#EF4444',
                                border: 'none', cursor: 'pointer',
                            }}
                        >
                            <AlertTriangle size={14} />
                        </button>
                    </div>
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
    const navigate = useNavigate();
    const subject = SUBJECT_MAP[subjectId];
    const accent = subject?.accent || '#4F46E5';

    const [chapters, setChapters] = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(true);
    const [activeChapter, setActiveChapter] = useState(null);
    const [openQuestionId, setOpenQuestionId] = useState(null); // Accordion state

    const [searchQ, setSearchQ] = useState('');
    const [filterDiff, setFilterDiff] = useState('All');
    const [filterYear, setFilterYear] = useState('All');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);
    const [reporting, setReporting] = useState(false);
    const [reportDone, setReportDone] = useState(false);

    // Scroll handling for header
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!activeChapter) { setHeaderVisible(true); return; }
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setHeaderVisible(false);
            } else {
                setHeaderVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeChapter]);

    useEffect(() => { loadKaTeX(); }, []);

    useEffect(() => {
        if (!subjectId) return;
        setChaptersLoading(true);
        api.get(`/quiz/subjects/${subjectId}/chapters`)
            .then(res => setChapters(res.data?.data || []))
            .finally(() => setChaptersLoading(false));
    }, [subjectId]);

    const fetchQuestions = useCallback(async () => {
        if (!activeChapter) return;
        setLoading(true);
        try {
            const res = await api.get(`/quiz/pyq/${activeChapter._id}`, {
                params: {
                    difficulty: filterDiff !== 'All' ? filterDiff : undefined,
                    year: filterYear !== 'All' ? filterYear : undefined,
                },
            });
            setQuestions(res.data?.data || []);
            setOpenQuestionId(null);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [activeChapter, filterDiff, filterYear]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const filteredQuestions = useMemo(() => {
        const q = searchQ.toLowerCase();
        if (!q) return questions;
        return questions.filter(item => (item.question || '').toLowerCase().includes(q));
    }, [questions, searchQ]);

    const handleReport = async (reasonKey) => {
        if (!reportTarget) return;
        setReporting(true);
        try {
            await api.post('/quiz/question-report', {
                questionId: reportTarget._id,
                reason: reasonKey,
            });
            setReportDone(true);
            setTimeout(() => { setReportTarget(null); setReportDone(false); }, 1600);
        } catch (err) { setReportTarget(null); }
        finally { setReporting(false); }
    };

    const activeFiltersCount = [filterDiff !== 'All', filterYear !== 'All'].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display:none; }
                .chap-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -6px rgba(0,0,0,0.08); }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            <div className="hidden md:block"><StudentHeader /></div>

            {/* ── Smart Sticky Header ── */}

<div style={{
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #F1F5F9',
    transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
        <button
            onClick={() => { if (activeChapter) { setActiveChapter(null); setFiltersOpen(false); } else navigate(-1); }}
            style={{ width: 36, height: 36, borderRadius: 10, background: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <ArrowLeft size={16} color="#475569" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeChapter ? activeChapter.name : subject.name}
            </p>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>PYQ Explorer</p>
        </div>
        {activeChapter && (
            <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                style={{
                    padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: (filtersOpen || activeFiltersCount > 0) ? accent : '#F8FAFC',
                    color: (filtersOpen || activeFiltersCount > 0) ? '#fff' : '#475569',
                    border: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: '0.2s'
                }}
            >
                <SlidersHorizontal size={14} />
                {activeFiltersCount > 0 && <span>{activeFiltersCount}</span>}
            </button>
        )}
    </div>

    {filtersOpen && activeChapter && (
        <div style={{ background: '#fff', borderTop: '1px solid #F1F5F9', padding: '16px', animation: 'fadeIn 0.2s' }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                    value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search questions..."
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 12, border: '1px solid #F1F5F9', background: '#F8FAFC', fontSize: 13, outline: 'none' }}
                />
            </div>

            {/* Difficulty Filter */}
            <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Difficulty</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                    {[ ...DIFFICULTY_OPTIONS].map(d => (
                        <button key={d} onClick={() => setFilterDiff(d)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: filterDiff === d ? accent : '#F1F5F9', color: filterDiff === d ? '#fff' : '#64748B', border: 'none', transition: '0.2s' }}>{d}</button>
                    ))}
                </div>
            </div>

            {/* Year Filter */}
            <div>
                <p style={{ fontSize: 9, fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Exam Year</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                    {[ ...YEAR_OPTIONS].map(y => (
                        <button key={y} onClick={() => setFilterYear(y)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: filterYear === y ? accent : '#F1F5F9', color: filterYear === y ? '#fff' : '#64748B', border: 'none', transition: '0.2s' }}>{y}</button>
                    ))}
                </div>
            </div>
        </div>
    )}
</div>

            <div className='pb-24' style={{ maxWidth: 600, margin: '0 auto'}}>
                {!activeChapter ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '20px 16px' }}>
                        {chaptersLoading ? [...Array(6)].map((_, i) => <div key={i} style={{ height: 100, borderRadius: 20, background: '#F1F5F9', animation: 'pulse 1.5s infinite' }} />)
                            : chapters.map((chap, idx) => (
                                <div key={chap._id} onClick={() => setActiveChapter(chap)} className="chap-card" style={{ padding: '20px', borderRadius: 20, background: '#fff', border: '1px solid #F1F5F9', cursor: 'pointer', transition: '0.2s' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: subject.accentLight, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginBottom: 12 }}>{idx + 1}</div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', lineHeight: 1.4 }}>{chap.name}</h3>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div style={{ background: '#fff' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}><Loader2 size={30} className="animate-spin" style={{ color: accent, margin: '0 auto' }} /></div>
                        ) : filteredQuestions.map((q, i) => (
                            <QuestionItem
                                key={q._id} q={q} idx={i}
                                isOpen={openQuestionId === q._id}
                                onToggle={() => setOpenQuestionId(openQuestionId === q._id ? null : q._id)}
                                onReport={setReportTarget}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {reportTarget && (
                <div
                    onClick={() => setReportTarget(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 24, animation: 'fadeIn 0.3s ease'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 340,
                            animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        {reportDone ? (
                            /* --- Minimalist Success --- */
                            <div style={{ textAlign: 'center' }}>
                                <CheckCircle2 size={32} strokeWidth={1.5} color={accent} style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em' }}>Received</p>
                            </div>
                        ) : (
                            /* --- Selection List --- */
                            <>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20, textAlign: 'center' }}>
                                    Report Issue
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {REPORT_REASONS.map(r => (
                                        <button
                                            key={r.key}
                                            onClick={() => handleReport(r.key)}
                                            style={{
                                                textAlign: 'center', padding: '14px 10px',
                                                borderRadius: 12, background: 'transparent',
                                                border: 'none', fontSize: 14, fontWeight: 500,
                                                color: '#334155', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#000'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setReportTarget(null)}
                                    style={{
                                        width: '100%', marginTop: 12, padding: '12px',
                                        background: 'none', border: 'none',
                                        fontSize: 12, color: '#CBD5E1', cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
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