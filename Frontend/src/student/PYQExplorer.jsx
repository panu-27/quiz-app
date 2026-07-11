import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ChevronDown, ChevronUp, Search,
    AlertTriangle, CheckCircle2, Loader2,
    Eye, EyeOff, X, Calendar,
    Atom, FlaskConical, Dna, ChevronRight, BarChart2,
    Calculator, Phone,
} from 'lucide-react';
import api from '../api/axios.js';
import { SUBJECT_MAP, YEAR_OPTIONS } from './pyqData';
import StudentHeader from './StudentHeader';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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

const parseMarkdown = (text) => {
    if (text === undefined || text === null) return '';
    const textStr = String(text);

    // 1. Extract math blocks to prevent markdown parsing inside them
    const mathBlocks = [];
    let placeholderIndex = 0;
    const mathRegex = /(\$\$[^\$]+\$\$|\$[^\$]+\$)/g;

    let processedText = textStr.replace(mathRegex, (match) => {
        const placeholder = `__MATH_BLOCK_${placeholderIndex}__`;
        mathBlocks.push({ placeholder, original: match });
        placeholderIndex++;
        return placeholder;
    });

    // 2. Render markdown formatting on processedText
    // Bold: **text** or __text__
    processedText = processedText
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    processedText = processedText
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>');

    // Inline code: `text`
    processedText = processedText
        .replace(/`([^`]+)`/g, '<code style="background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>');

    // Headers
    processedText = processedText
        .replace(/^### (.*$)/gim, '<h3 style="font-weight: 700; font-size: 1.1em; margin-top: 8px; margin-bottom: 4px;">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 style="font-weight: 700; font-size: 1.2em; margin-top: 10px; margin-bottom: 6px;">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 style="font-weight: 800; font-size: 1.3em; margin-top: 12px; margin-bottom: 8px;">$1</h1>');

    // Bullet & Numbered lists
    const lines = processedText.split('\n');
    let inList = false;
    let listType = null;
    const formattedLines = [];

    for (let line of lines) {
        const trimmed = line.trim();
        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isNumber = /^\d+\.\s/.test(trimmed);

        if (isBullet) {
            if (!inList || listType !== 'ul') {
                if (inList) formattedLines.push(`</${listType}>`);
                formattedLines.push('<ul style="list-style-type: disc; padding-left: 20px; margin: 4px 0;">');
                inList = true;
                listType = 'ul';
            }
            const content = trimmed.substring(2);
            formattedLines.push(`<li style="margin: 2px 0;">${content}</li>`);
        } else if (isNumber) {
            if (!inList || listType !== 'ol') {
                if (inList) formattedLines.push(`</${listType}>`);
                formattedLines.push('<ol style="list-style-type: decimal; padding-left: 20px; margin: 4px 0;">');
                inList = true;
                listType = 'ol';
            }
            const content = trimmed.replace(/^\d+\.\s/, '');
            formattedLines.push(`<li style="margin: 2px 0;">${content}</li>`);
        } else {
            if (inList) {
                formattedLines.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            formattedLines.push(line);
        }
    }
    if (inList) {
        formattedLines.push(`</${listType}>`);
    }

    processedText = formattedLines.join('\n');

    // Line breaks
    processedText = processedText.replace(/\n/g, '<br />');

    // 3. Restore math blocks
    mathBlocks.forEach(({ placeholder, original }) => {
        processedText = processedText.replace(placeholder, original);
    });

    return processedText;
};

const KaTeXSpan = ({ html }) => {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current || html === undefined || html === null) return;
        ref.current.innerHTML = parseMarkdown(html);
        loadKaTeX().then(() => {
            if (ref.current && window.renderMathInElement)
                window.renderMathInElement(ref.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
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

const CHAPTER_PALETTES = [
    { grad: 'linear-gradient(135deg,#6366F1,#8B5CF6)', light: '#EEF2FF', text: '#4F46E5', shadow: 'rgba(99,102,241,0.28)' },
    { grad: 'linear-gradient(135deg,#0EA5E9,#38BDF8)', light: '#E0F2FE', text: '#0369A1', shadow: 'rgba(14,165,233,0.28)' },
    { grad: 'linear-gradient(135deg,#10B981,#34D399)', light: '#D1FAE5', text: '#059669', shadow: 'rgba(16,185,129,0.28)' },
    { grad: 'linear-gradient(135deg,#F59E0B,#FBBF24)', light: '#FEF3C7', text: '#B45309', shadow: 'rgba(245,158,11,0.28)' },
    { grad: 'linear-gradient(135deg,#EF4444,#F87171)', light: '#FEE2E2', text: '#DC2626', shadow: 'rgba(239,68,68,0.28)' },
    { grad: 'linear-gradient(135deg,#EC4899,#F472B6)', light: '#FCE7F3', text: '#BE185D', shadow: 'rgba(236,72,153,0.28)' },
    { grad: 'linear-gradient(135deg,#8B5CF6,#A78BFA)', light: '#EDE9FE', text: '#7C3AED', shadow: 'rgba(139,92,246,0.28)' },
    { grad: 'linear-gradient(135deg,#14B8A6,#2DD4BF)', light: '#CCFBF1', text: '#0F766E', shadow: 'rgba(20,184,166,0.28)' },
];

const DOT_COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6'];

const STATUS_BAR_H = 28.5;
const BOTTOM_NAV_H = 70;

const MathIcon = () => <Calculator size={20} className="text-white" />;

const ProgressIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#F97316' }}>
        <rect x="3" y="12" width="4" height="8" rx="1" fill="currentColor" />
        <rect x="10" y="7" width="4" height="13" rx="1" fill="currentColor" />
        <rect x="17" y="3" width="4" height="17" rx="1" fill="currentColor" />
    </svg>
);

const resolveMediaUrl = url => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = api.defaults.baseURL || "http://localhost:5000/api";
    const cleanBase = baseUrl.replace(/\/api\/?$/, "");
    return `${cleanBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

// ════════════════════════════════════════════════════════════════════
// SKELETON COMPONENTS
// ════════════════════════════════════════════════════════════════════
const Shimmer = ({ w = '100%', h = 16, r = 8, mb = 0 }) => {
    const { theme } = useTheme();
    return (
        <div style={{
            width: w, height: h, borderRadius: r,
            marginBottom: mb,
            background: theme === 'light'
                ? 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)'
                : 'linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
            flexShrink: 0,
        }} />
    );
};

const QuestionSkeleton = () => {
    const { theme } = useTheme();
    return (
        <div style={{
            padding: '16px',
            borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151',
            background: theme === 'light' ? '#fff' : '#111827'
        }}>
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
};

const ChapterListSkeleton = () => {
    const { theme } = useTheme();
    return (
        <div style={{
            padding: '16px',
            background: theme === 'light' ? '#fff' : '#1E293B',
            border: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151',
            borderRadius: 12,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div style={{ flex: 1 }}>
                <Shimmer w="40%" h={14} r={6} mb={8} />
                <Shimmer w="20%" h={10} r={4} />
            </div>
            <Shimmer w={16} h={16} r={99} />
        </div>
    );
};

const TopicSkeleton = () => {
    const { theme } = useTheme();
    return (
        <div style={{
            padding: '14px 16px',
            borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: theme === 'light' ? '#fff' : '#111827'
        }}>
            <Shimmer w={9} h={9} r={99} />
            <Shimmer h={13} r={6} />
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════
// QUESTION ITEM
// ════════════════════════════════════════════════════════════════════
export const QuestionItem = ({ q, idx, onReport, isOpen, onToggle, isBookmarked, onToggleBookmark, isDone, onToggleDone }) => {
    const { theme } = useTheme();
    const [showSolution, setShowSolution] = useState(false);
    const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.Medium;
    useEffect(() => { if (!isOpen) setShowSolution(false); }, [isOpen]);

    return (
        <div style={{
            borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151',
            background: isOpen
                ? (theme === 'light' ? '#FAFBFF' : '#1E293B')
                : (theme === 'light' ? '#fff' : '#111827'),
            transition: 'background 0.2s ease',
            overflow: 'hidden',
        }}>
            <div
                onClick={onToggle}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', cursor: 'pointer' }}
            >
                <div style={{
                    width: 26, height: 26, borderRadius: 7,
                    background: isOpen ? '#4F46E5' : (theme === 'light' ? '#F1F5F9' : '#1F2937'),
                    color: isOpen ? '#fff' : (theme === 'light' ? '#94A3B8' : '#64748B'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 2,
                    transition: 'all 0.2s ease',
                }}>{idx + 1}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 14, fontWeight: 500,
                        color: theme === 'light' ? '#1E293B' : '#E2E8F0',
                        lineHeight: 1.55,
                        display: '-webkit-box', WebkitLineClamp: isOpen ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical', overflow: isOpen ? 'visible' : 'hidden',
                    }}>
                        <KaTeXSpan html={q.question || q.questionText || ''} />
                    </div>
                    {isOpen && q.questionImage && (
                        <img
                            src={q.questionImage}
                            alt=""
                            style={{
                                maxWidth: '100%',
                                borderRadius: 10,
                                marginTop: 12,
                                marginBottom: 4,
                                border: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151',
                                display: 'block'
                            }}
                        />
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                        {q.year && (
                            <span style={{
                                fontSize: 9, fontWeight: 800,
                                color: '#6366F1',
                                background: theme === 'light' ? '#EEF2FF' : '#312E81/50',
                                padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase'
                            }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                        {(q.options || []).map((opt, i) => {
                            const isCorrect = (q.correctOption ?? q.correctAnswer) === i;
                            const green = showSolution && isCorrect;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px', borderRadius: 12,
                                    border: `1px solid ${green ? '#BBF7D0' : (theme === 'light' ? '#F1F5F9' : '#374151')}`,
                                    background: green
                                        ? (theme === 'light' ? '#F0FDF4' : '#064E3B')
                                        : (theme === 'light' ? '#F8FAFC' : '#1F2937'),
                                    transition: 'all 0.15s',
                                }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        background: green ? '#16A34A' : (theme === 'light' ? '#E5E7EB' : '#475569'),
                                        color: green ? '#fff' : (theme === 'light' ? '#94A3B8' : '#CBD5E1'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 800,
                                    }}>{String.fromCharCode(65 + i)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {opt.image && (
                                            <img
                                                src={opt.image}
                                                alt=""
                                                style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8, marginBottom: opt.text ? 6 : 0, display: 'block' }}
                                            />
                                        )}
                                        {opt.text && (
                                            <span style={{
                                                fontSize: 13,
                                                fontWeight: 500,
                                                color: green
                                                    ? (theme === 'light' ? '#166534' : '#A7F3D0')
                                                    : (theme === 'light' ? '#374151' : '#E2E8F0'),
                                                lineHeight: 1.5
                                            }}>
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
                        <div style={{
                            background: theme === 'light' ? '#fff' : '#1F2937',
                            border: theme === 'light' ? '1px solid #E0E7FF' : '1px solid #374151',
                            borderRadius: 12, padding: 14, marginBottom: 12, overflowX: 'auto'
                        }}>
                            <p style={{ fontSize: 9, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Solution</p>
                            {q.explanation && (
                                <div style={{
                                    fontSize: 13,
                                    color: theme === 'light' ? '#475569' : '#CBD5E1',
                                    lineHeight: 1.65, width: 'max-content', maxWidth: '100%', minWidth: 0
                                }}>
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
                            background: showSolution ? '#4F46E5' : (theme === 'light' ? '#F1F5F9' : '#1F2937'),
                            color: showSolution ? '#fff' : (theme === 'light' ? '#64748B' : '#94A3B8'),
                            border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            {showSolution ? <EyeOff size={13} /> : <Eye size={13} />}
                            {showSolution ? 'Hide Solution' : 'View Solution'}
                        </button>

                        <button onClick={() => onToggleDone(q)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '10px 14px', borderRadius: 10,
                            background: isDone
                                ? (theme === 'light' ? '#DEF7EC' : '#064E3B')
                                : (theme === 'light' ? '#F1F5F9' : '#1F2937'),
                            color: isDone
                                ? (theme === 'light' ? '#03543F' : '#A7F3D0')
                                : (theme === 'light' ? '#64748B' : '#94A3B8'),
                            border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 700,
                        }}>
                            <CheckCircle2 size={14} color={isDone ? (theme === 'light' ? '#03543F' : '#34D399') : '#64748B'} />
                            {isDone ? 'Done' : 'Mark Done'}
                        </button>

                        <button onClick={() => onToggleBookmark(q)} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '10px 14px', borderRadius: 10,
                            background: isBookmarked
                                ? (theme === 'light' ? '#EEF2FF' : '#312E81')
                                : (theme === 'light' ? '#F1F5F9' : '#1F2937'),
                            color: isBookmarked ? '#4F46E5' : (theme === 'light' ? '#64748B' : '#94A3B8'),
                            border: 'none', cursor: 'pointer',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? '#4F46E5' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
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
// TOPIC SECTION
// ════════════════════════════════════════════════════════════════════
const TopicSection = ({ topic, topicIdx, accent, filterYear, allQuestions, isExpanded, onToggle, openQuestionId, setOpenQuestionId, onReport, bookmarks, onToggleBookmark, doneQuestions, onToggleDone }) => {
    const { theme } = useTheme();
    const dotColor = DOT_COLORS[topicIdx % DOT_COLORS.length];

    const topicQuestions = useMemo(() => {
        let qs = allQuestions.filter(q => {
            return (q.topicId === topic._id) || (q.topicId?._id === topic._id) || (q._topicId === topic._id);
        });
        if (filterYear !== 'All') {
            qs = qs.filter(q => String(q.year) === String(filterYear));
        }
        return qs;
    }, [allQuestions, topic._id, filterYear]);

    return (
        <div style={{ borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151' }}>
            <div
                onClick={onToggle}
                style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', cursor: 'pointer',
                    background: isExpanded
                        ? (theme === 'light' ? '#FAFBFF' : '#1E293B')
                        : (theme === 'light' ? '#fff' : '#111827'),
                    transition: 'background 0.2s',
                }}
            >
                <div style={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    background: dotColor,
                    boxShadow: `0 0 0 3px ${dotColor}28`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        fontSize: 13.5, fontWeight: 700,
                        color: theme === 'light' ? '#1E293B' : '#FFFFFF',
                        margin: 0
                    }}>{topic.name}</p>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0', fontWeight: 600 }}>
                        {topicQuestions.length} question{topicQuestions.length !== 1 ? 's' : ''}
                        {filterYear !== 'All' ? ` · ${filterYear}` : ''}
                    </p>
                </div>
                <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                    background: isExpanded
                        ? (theme === 'light' ? '#EEF2FF' : '#312E81')
                        : (theme === 'light' ? '#F8FAFC' : '#1F2937'),
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
                            isBookmarked={bookmarks.some(b => b._id === q._id)}
                            onToggleBookmark={onToggleBookmark}
                            isDone={doneQuestions.some(item => item?.questionId === q._id || item === q._id)}
                            onToggleDone={onToggleDone}
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
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeSubjectId, setActiveSubjectId] = useState(subjectId || null);

    const subject = SUBJECT_MAP[activeSubjectId || subjectId];
    const accent = subject?.accent || '#4F46E5';


    const { user } = useAuth();
    const isApproved = !!user?.isApproved;

    const [searchSubject, setSearchSubject] = useState('');
    const [chapterTab, setChapterTab] = useState('all');

    const [bookmarks, setBookmarks] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pyq_bookmarks') || '[]');
        } catch {
            return [];
        }
    });

    const [doneQuestions, setDoneQuestions] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pyq_done') || '[]');
        } catch {
            return [];
        }
    });

    const [activeChapter, setActiveChapter] = useState(null);
    const [viewMode, setViewMode] = useState('all');
    const [chapters, setChapters] = useState([]);
    const [chaptersLoading, setChaptersLoading] = useState(true);
    const [chaptersMap, setChaptersMap] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [expandedSubject, setExpandedSubject] = useState(subjectId || null);

    const [allQuestions, setAllQuestions] = useState([]);
    const [questionsLoading, setQLoading] = useState(false);
    const [openQuestionId, setOpenQuestionId] = useState(null);
    const [searchQ, setSearchQ] = useState('');
    const [topics, setTopics] = useState([]);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [expandedTopicId, setExpandedTopicId] = useState(null);
    const [topicOpenQId, setTopicOpenQId] = useState(null);
    const [filterYear, setFilterYear] = useState('All');
    const [yearPickerOpen, setYearPickerOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportDone, setReportDone] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);
    const [showCounsellorPopup, setShowCounsellorPopup] = useState(false);

    useEffect(() => {
        if (showCounsellorPopup) {
            document.body.setAttribute('data-hide-nav', 'true');
        } else {
            document.body.removeAttribute('data-hide-nav');
        }
        return () => {
            document.body.removeAttribute('data-hide-nav');
        };
    }, [showCounsellorPopup]);

    useEffect(() => {
        localStorage.setItem('pyq_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('pyq_done', JSON.stringify(doneQuestions));
    }, [doneQuestions]);

    const handleToggleBookmark = useCallback((question) => {
        setBookmarks(prev => {
            const exists = prev.some(b => b._id === question._id);
            if (exists) {
                return prev.filter(b => b._id !== question._id);
            } else {
                return [...prev, question];
            }
        });
    }, []);

    const handleToggleDone = useCallback((question) => {
        setDoneQuestions(prev => {
            const qId = question._id;
            const cId = question.chapterId || activeChapter?._id;
            const exists = prev.some(item => item.questionId === qId);
            if (exists) {
                return prev.filter(item => item.questionId !== qId);
            } else {
                return [...prev, { questionId: qId, chapterId: cId }];
            }
        });
    }, [activeChapter]);

    useEffect(() => { loadKaTeX(); }, []);

    useEffect(() => {
        const loadAllChapters = async () => {
            setChaptersLoading(true);
            try {
                // Fetch real subjects
                const subRes = await api.get('/quiz/subjects');
                const realSubjects = subRes.data?.data || subRes.data || [];
                setSubjects(realSubjects);
                
                const cmap = {};
                await Promise.all(
                    realSubjects.map(async (sub) => {
                        const res = await api.get(`/quiz/subjects/${sub._id}/chapters`);
                        cmap[sub._id] = res.data?.data || res.data || [];
                    })
                );
                setChaptersMap(cmap);
            } catch (err) {
                console.error("Error loading chapters:", err);
            } finally {
                setChaptersLoading(false);
            }
        };
        loadAllChapters();
    }, []);

    const loadChapterData = useCallback(async (chap, subId) => {
        if (!chap) return;
        setQLoading(true);
        setTopicsLoading(true);
        setAllQuestions([]);
        setTopics([]);
        const targetSubId = subId || subjectId || activeSubjectId || chap.subjectId;
        try {
            const topicsRes = await api.get(`/pyq/${targetSubId}/chapters/${chap._id}/topics`);
            const topicList = topicsRes.data || [];
            setTopics(topicList);
            setTopicsLoading(false);
            const allQsRes = await api.get(`/quiz/pyq/${chap._id}`);
            const allQs = allQsRes.data?.data || allQsRes.data || [];
            
            // Map the topic names to the questions if possible
            const enrichedQs = allQs.map(q => {
                const topic = topicList.find(t => String(t._id) === String(q.topicId));
                return {
                    ...q,
                    _topicName: topic ? topic.name : 'Unassigned',
                };
            });
            
            setAllQuestions(enrichedQs);
        } catch (err) { console.error(err); }
        finally { setQLoading(false); setTopicsLoading(false); }
    }, [subjectId, activeSubjectId]);

    const enterChapter = (chap, subId) => {
        setActiveSubjectId(subId);
        setActiveChapter(chap);
        setViewMode('all');
        setFilterYear('All');
        setYearPickerOpen(false);
        setOpenQuestionId(null);
        setTopicOpenQId(null);
        setExpandedTopicId(null);
        setSearchQ('');
        loadChapterData(chap, subId);
    };

    const getChapterStats = useCallback((chap) => {
        const totalQs = chap?.questionCount || 0;
        const solvedQs = doneQuestions.filter(item => item.chapterId === chap._id).length;
        
        return { totalQs, solvedQs };
    }, [doneQuestions]);

    // filteredQuestions: filter by search query and year when inside a chapter
    const filteredQuestions = useMemo(() => {
        let qs = allQuestions;
        if (filterYear !== 'All') {
            qs = qs.filter(q => String(q.year) === String(filterYear));
        }
        if (searchQ.trim()) {
            const sq = searchQ.toLowerCase();
            qs = qs.filter(q =>
                (q.question || q.questionText || '').toLowerCase().includes(sq)
            );
        }
        return qs;
    }, [allQuestions, filterYear, searchQ]);

    const handleReport = useCallback(async (reason) => {
        if (!reportTarget) return;
        try {
            await api.post('/pyq/report', { questionId: reportTarget._id, reason });
        } catch (_) { /* ignore */ }
        setReportDone(true);
        setTimeout(() => {
            setReportTarget(null);
            setSelectedReason(null);
            setReportDone(false);
        }, 1800);
    }, [reportTarget]);

    // ── SUBJECTS / CHAPTERS LIST VIEW ───────────────────────────────────
    if (!activeChapter) {
        const getSubjectIcon = (name) => {
            const n = name.toLowerCase();
            if (n.includes('phys')) return { bg: 'bg-[#F97316]', icon: <Atom size={20} className="text-white" /> };
            if (n.includes('chem')) return { bg: 'bg-[#10B981]', icon: <FlaskConical size={20} className="text-white" /> };
            if (n.includes('math')) return { bg: 'bg-[#3B82F6]', icon: <MathIcon /> };
            if (n.includes('bio')) return { bg: 'bg-[#EC4899]', icon: <Dna size={20} className="text-white" /> };
            return { bg: 'bg-[#6366F1]', icon: <Atom size={20} className="text-white" /> };
        };


        // Counsellor popup shared helper
        const CounsellorPopup = () => showCounsellorPopup ? (
            <div
                className="fixed inset-0 z-[9999] flex items-end justify-center"
                onClick={() => setShowCounsellorPopup(false)}
            >
                <div className="absolute inset-0 bg-black/65" style={{ backdropFilter: 'blur(3px)' }} />
                <div
                    className="relative w-full max-w-md bg-[#111827] overflow-hidden"
                    style={{ borderRadius: '12px 12px 0 0' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-center pt-4 pb-3">
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                    </div>
                    <div className="px-6 pt-8 pb-2">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-white font-black leading-tight" style={{ fontSize: 19 }}>
                                    Need help with your subscription?
                                </h2>
                                <p className="text-white/55 text-[12px] mt-2 leading-relaxed">
                                    Talk to our experts who will guide you with all you need to crack it.
                                </p>
                            </div>
                            <div className="w-[68px] h-[68px] rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10 bg-[#1F2937]">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=counsellorF&backgroundColor=b6e3f4&clothingColor=3c4f5c" className="w-full h-full object-cover" alt="Expert" />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 pt-6 pb-3">
                        <a href="tel:+918585858585" className="w-full flex items-center justify-center gap-3 bg-white active:scale-95 transition-transform" style={{ borderRadius: 8, padding: '12px 24px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span className="font-bold text-[#111827]" style={{ fontSize: 15 }}>+91 8585858585</span>
                        </a>
                    </div>
                    <div className="px-6 pb-12">
                        <button onClick={() => setShowCounsellorPopup(false)} className="w-full flex items-center justify-center gap-1.5 py-3 text-white font-bold tracking-widest active:opacity-70 transition-opacity" style={{ fontSize: 11.5, letterSpacing: '0.08em' }}>
                            GET A CALL FROM US <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        ) : null;

        // ══════════════════════════════════════════════════════
        // CHAPTERS LIST VIEW (subject selected, no chapter yet)
        // ══════════════════════════════════════════════════════
        if (activeSubjectId) {
            const sub = subjects.find(s => s._id === activeSubjectId);
            const allChaps = chaptersMap[activeSubjectId] || [];

            const displayChaps = allChaps.filter((chap, idx) => {
                const matchesSearch = searchSubject === '' || chap.name.toLowerCase().includes(searchSubject.toLowerCase());
                if (!matchesSearch) return false;
                const { totalQs, solvedQs } = getChapterStats(chap, idx);
                if (chapterTab === 'completed') return solvedQs === totalQs;
                if (chapterTab === 'unattempted') return solvedQs < totalQs;
                return true;
            });

            return (
                <div
                    className={`fixed inset-0 z-[600] flex flex-col font-sans ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#F8FAFF] text-[#1E293B]'}`}
                >
                    {/* Sticky Header */}
                    <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`} style={{ paddingTop: STATUS_BAR_H + 8 }}>
                        <div className="flex items-center justify-between">
                            {/* Left: back + subject heading */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setActiveSubjectId(null); setSearchSubject(''); }}
                                    className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <h1 className={`text-[17px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {sub ? sub.name : 'Chapters'}
                                </h1>
                            </div>

                            {/* Right: bookmark + progress with borders */}
                            <div className="flex items-center gap-2">
                                {/* Bookmark icon */}
                                <button
                                    onClick={() => navigate('/student/pyq/bookmarks')}
                                    className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${isDark
                                        ? 'border-[#2A3441] bg-[#161C26] text-white'
                                        : 'border-slate-200 bg-white text-slate-700'
                                        }`}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                    </svg>
                                </button>

                                {/* Progress icon */}
                                <button
                                    onClick={() => navigate('/student/pyq/progress')}
                                    className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${isDark
                                        ? 'border-[#2A3441] bg-[#161C26] text-white'
                                        : 'border-slate-200 bg-white text-slate-700'
                                        }`}
                                >
                                    <BarChart2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} size={18} />
                            <input
                                type="text"
                                placeholder="Search chapters..."
                                value={searchSubject}
                                onChange={e => setSearchSubject(e.target.value)}
                                className={`w-full py-3.5 pl-12 pr-4 rounded-[24px] text-[15px] focus:outline-none focus:border-[#3B82F6] transition-colors ${isDark
                                    ? 'border border-[#2A3441] text-white placeholder-[#8492A6]'
                                    : 'bg-white text-slate-800 placeholder-slate-400 shadow-none'
                                    }`}
                            />
                        </div>

                        {/* Tab filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar -mt-1">
                            {['all', 'completed', 'unattempted'].map(tab => {
                                const label = tab === 'all' ? 'All' : tab === 'completed' ? 'Completed' : 'Unattempted';
                                const isActive = chapterTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setChapterTab(tab)}
                                        className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all whitespace-nowrap flex-shrink-0 ${isActive
                                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                            : isDark
                                                ? 'border-[#2A3441] text-[#8492A6]'
                                                : 'border-transparent bg-slate-100 text-slate-500'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chapters List */}
                    <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-3 no-scrollbar">
                        {chaptersLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-[76px] animate-pulse rounded-[16px] ${isDark ? 'bg-[#161C26]' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                        ) : displayChaps.length === 0 ? (
                            <p className={`text-center mt-10 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
                                No chapters found.
                            </p>
                        ) : (
                            displayChaps.map((chap) => {
                                const originalIdx = allChaps.findIndex(c => c._id === chap._id);
                                const { totalQs, solvedQs } = getChapterStats(chap, originalIdx);
                                const pct = totalQs > 0 ? Math.round((solvedQs / totalQs) * 100) : 0;
                                return (
                                    <div
                                        key={chap._id}
                                        onClick={() => enterChapter(chap, activeSubjectId)}
                                        className={`flex items-center px-4 py-4 rounded-[16px] cursor-pointer active:scale-[0.99] transition-all ${isDark ? 'bg-[#161C26]' : 'bg-white shadow-none'
                                            }`}
                                    >


                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-[16px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {chap.name}
                                            </h3>
                                            <p className={`text-[13px] font-medium mt-0.5 ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                                                {solvedQs}/{totalQs} completed
                                            </p>
                                            {/* Progress bar */}
                                            <div className={`mt-2 h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#2A3441]' : 'bg-slate-100'}`}>
                                                <div
                                                    className="h-full rounded-full bg-[#2563EB] transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>

                                        <ChevronRight size={20} className={`ml-3 flex-shrink-0 ${isDark ? 'text-[#2A3441]' : 'text-slate-300'}`} />
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <CounsellorPopup />
                </div>
            );
        }

        // ══════════════════════════════════════════════════════
        // SUBJECTS LIST (top level — CreatePractice Step 1 style)
        // ══════════════════════════════════════════════════════
        const filteredSubjects = subjects.filter(sub =>
            sub.name.toLowerCase().includes(searchSubject.toLowerCase())
        );

        return (
            <div
                className={`fixed inset-0 z-[600] flex flex-col font-sans ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#F8FAFF] text-[#1E293B]'}`}
            >
                {/* Sticky Header */}
                <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`} style={{ paddingTop: STATUS_BAR_H + 8 }}>
                    <div className={`flex items-center justify-between`}>
                        {/* Left: back button + title */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/student')}
                                className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <h1 className={`text-[17px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                PYQ Explorer
                            </h1>
                        </div>

                        {/* Right: bookmark + progress with borders */}
                        <div className="flex items-center gap-2">
                            {/* Bookmark icon */}
                            <button
                                onClick={() => navigate('/student/pyq/bookmarks')}
                                className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${isDark
                                    ? 'border-[#2A3441] bg-[#161C26] text-white'
                                    : 'border-slate-200 bg-white text-slate-700'
                                    }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>

                            {/* Progress icon */}
                            <button
                                onClick={() => navigate('/student/pyq/progress')}
                                className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${isDark
                                    ? 'border-[#2A3441] bg-[#161C26] text-white'
                                    : 'border-slate-200 bg-white text-slate-700'
                                    }`}
                            >
                                <BarChart2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchSubject}
                            onChange={e => setSearchSubject(e.target.value)}
                            className={`w-full py-3.5 pl-12 pr-4 rounded-[24px] text-[15px] focus:outline-none focus:border-[#3B82F6] transition-colors ${isDark
                                ? 'border border-[#2A3441] text-white placeholder-[#8492A6]'
                                : 'bg-white text-slate-800 placeholder-slate-400 shadow-none'
                                }`}
                        />
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 pb-32 space-y-3 no-scrollbar">
                    {/* Subject cards — plain buttons like CreatePractice Step 1 */}
                    {filteredSubjects.length === 0 ? (
                        <p className={`text-center mt-10 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>No subjects found.</p>
                    ) : (
                        filteredSubjects.map(sub => {
                            const allChaps = chaptersMap[sub._id] || [];

                            // Calculate solved/total stats for the subject
                            let totalQs = 0;
                            let solvedQs = 0;
                            allChaps.forEach((chap, idx) => {
                                const stats = getChapterStats(chap, idx);
                                totalQs += stats.totalQs;
                                solvedQs += stats.solvedQs;
                            });

                            const { bg, icon } = getSubjectIcon(sub.name);

                            return (
                                <div
                                    key={sub._id}
                                    onClick={() => { setActiveSubjectId(sub._id); setSearchSubject(''); setChapterTab('all'); }}
                                    className={`flex items-center px-4 py-4 rounded-[16px] cursor-pointer active:scale-[0.99] transition-all ${isDark ? 'bg-[#161C26]' : 'bg-white shadow-none'
                                        }`}
                                >
                                    {/* Icon styled like checkbox container */}
                                    <div className={`w-[24px] h-[24px] rounded-[6px] mr-4 flex-shrink-0 flex items-center justify-center transition-all ${bg}`}>
                                        {icon}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className={`text-[17px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{sub.name}</h3>
                                        <p className={`text-[13px] font-medium mt-0.5 ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                                            {chaptersLoading ? 'Loading...' : allChaps.length + ' chapters'} • {solvedQs}/{totalQs} completed
                                        </p>
                                    </div>

                                    <ChevronRight size={22} className={isDark ? 'text-white' : 'text-slate-500'} />
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bottom Prime CTA (unapproved only) */}
                {!isApproved && (
                    <div className="fixed left-0 right-0 z-[400] bottom-4">
                        <div className="bg-gradient-to-r from-[#7A41F7] to-[#6330E3] flex items-center justify-between px-5 py-3.5">
                            <div>
                                <p className="text-white font-bold text-[13px]">5 free questions available</p>
                                <p className="text-white/60 text-[11px]">Get unlimited access with Prime.</p>
                            </div>
                            <button className="bg-white text-[#7A41F7] font-bold text-[12px] px-4 py-2.5 rounded-xl flex-shrink-0">Join Prime</button>
                        </div>
                    </div>
                )}

                <CounsellorPopup />
            </div>
        );
    }

    // ── CHAPTER QUESTIONS VIEW ──────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-[600] flex flex-col"
            style={{ background: theme === 'light' ? '#F8FAFC' : '#0B101A' }}
        >
            {/* ── Chapter View: Sticky Header ── */}
            <div
                className="flex-shrink-0 sticky top-0 z-20 flex flex-col gap-3"
                style={{
                    background: theme === 'light' ? '#F8FAFC' : '#0B101A',
                    paddingTop: STATUS_BAR_H + 8,
                    paddingBottom: 12,
                    borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #1F2937',
                }}
            >
                {/* Back button + Heading + Calendar Toggle Button */}
                <div className="flex items-center justify-between px-4 gap-3">
                    {/* Left side: back button + text */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                            onClick={() => setActiveChapter(null)}
                            className={`w-10 h-10 -ml-2 flex items-center justify-center rounded-[10px] active:scale-95 transition-all flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-800'
                                }`}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="min-w-0 flex-1">
                            <p className={`text-[10px] font-black tracking-wider uppercase leading-none ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                                {subjects.find(s => s._id === activeSubjectId)?.name || 'PYQ'}
                            </p>
                            <h1 className={`text-[17px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {activeChapter.name}
                            </h1>
                        </div>
                    </div>

                    {/* Right side: Calendar toggle button */}
                    <button
                        onClick={() => setYearPickerOpen(o => !o)}
                        className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all flex-shrink-0 ${filterYear !== 'All'
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : isDark
                                ? 'border-[#2A3441] bg-[#161C26] text-white'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                    >
                        <Calendar size={18} />
                    </button>
                </div>

                {/* 100% width toggle filter */}
                <div className="px-4">
                    <div className={`flex p-1 rounded-xl ${isDark ? 'bg-[#161C26]' : 'bg-slate-100'}`}>
                        {['all', 'topic'].map(mode => {
                            const label = mode === 'all' ? 'All Questions' : 'Topic Wise';
                            const isActive = viewMode === mode;
                            return (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isActive
                                        ? (isDark ? 'bg-[#2563EB] text-white' : 'bg-white text-slate-900 shadow-sm')
                                        : (isDark ? 'text-slate-400' : 'text-slate-500')
                                        }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Horizontal scrollable year filters (toggled) */}
                {yearPickerOpen && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-1 pb-1">
                        {YEAR_OPTIONS.map(y => {
                            const isSelected = filterYear === y;
                            return (
                                <button
                                    key={y}
                                    onClick={() => setFilterYear(y)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap flex-shrink-0 ${isSelected
                                        ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                        : isDark
                                            ? 'border-[#2A3441] bg-transparent text-[#8492A6]'
                                            : 'border-transparent bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    {y}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Scrollable content ── */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">



                {/* All Questions */}
                {activeChapter && viewMode === 'all' && (
                    <div style={{
                        background: theme === 'light' ? '#fff' : '#111827',
                        borderTop: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151'
                    }}>
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
                                        isBookmarked={bookmarks.some(b => b._id === q._id)}
                                        onToggleBookmark={handleToggleBookmark}
                                        isDone={doneQuestions.some(item => item.questionId === q._id)}
                                        onToggleDone={handleToggleDone}
                                    />
                                ))
                        }
                    </div>
                )}

                {/* Topic Wise */}
                {activeChapter && viewMode === 'topic' && (
                    <div style={{
                        background: theme === 'light' ? '#fff' : '#111827',
                        borderTop: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151'
                    }}>
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
                                        bookmarks={bookmarks}
                                        onToggleBookmark={handleToggleBookmark}
                                        doneQuestions={doneQuestions}
                                        onToggleDone={handleToggleDone}
                                    />
                                ))
                        }
                    </div>
                )}
            </div>

            {/* ══════════ REPORT MODAL — professional bottom sheet ══════════ */}
            {reportTarget && (
                <div
                    onClick={() => { setReportTarget(null); setSelectedReason(null); setReportDone(false); }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 480,
                            background: theme === 'light' ? '#fff' : '#1F2937', borderRadius: '24px 24px 0 0',
                            padding: '8px 0 40px',
                            animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
                        }}
                    >
                        {/* Handle bar */}
                        <div style={{ width: 36, height: 4, borderRadius: 99, background: theme === 'light' ? '#E2E8F0' : '#475569', margin: '8px auto 20px' }} />

                        {reportDone ? (
                            <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    background: '#F0FDF4', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px',
                                }}>
                                    <CheckCircle2 size={28} color="#16A34A" strokeWidth={1.8} />
                                </div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: theme === 'light' ? '#0F172A' : '#FFFFFF', marginBottom: 6 }}>Report Submitted</p>
                                <p style={{ fontSize: 13, color: theme === 'light' ? '#94A3B8' : '#CBD5E1', fontWeight: 500 }}>Thanks for helping us improve!</p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div style={{ padding: '0 20px 16px', borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <AlertTriangle size={16} color="#EF4444" />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 15, fontWeight: 700, color: theme === 'light' ? '#0F172A' : '#FFFFFF', margin: 0 }}>Report an Issue</p>
                                            <p style={{ fontSize: 11, color: theme === 'light' ? '#94A3B8' : '#CBD5E1', margin: 0, fontWeight: 500 }}>Select the issue you found</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reasons with checkbox */}
                                <div style={{ padding: '8px 16px' }}>
                                    {REPORT_REASONS.map(r => (
                                        <button
                                            key={r.key}
                                            onClick={() => setSelectedReason(r.key)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center',
                                                gap: 12, padding: '13px 12px', borderRadius: 12,
                                                border: 'none', cursor: 'pointer', marginBottom: 4,
                                                background: selectedReason === r.key ? (theme === 'light' ? '#EEF2FF' : '#312E81') : 'transparent',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{
                                                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                                border: selectedReason === r.key ? 'none' : `2px solid ${theme === 'light' ? '#E2E8F0' : '#475569'}`,
                                                background: selectedReason === r.key ? '#4F46E5' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.15s',
                                            }}>
                                                {selectedReason === r.key && (
                                                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                                        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{
                                                fontSize: 13.5, fontWeight: selectedReason === r.key ? 600 : 500,
                                                color: selectedReason === r.key ? '#4F46E5' : (theme === 'light' ? '#374151' : '#E2E8F0'),
                                                transition: 'all 0.15s',
                                            }}>{r.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Submit button */}
                                <div style={{ padding: '4px 20px 0' }}>
                                    <button
                                        onClick={() => selectedReason && handleReport(selectedReason)}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: 14,
                                            border: 'none', fontSize: 14, fontWeight: 700,
                                            cursor: selectedReason ? 'pointer' : 'not-allowed',
                                            background: selectedReason ? '#4F46E5' : (theme === 'light' ? '#F1F5F9' : '#111827'),
                                            color: selectedReason ? '#fff' : '#CBD5E1',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Submit Report
                                    </button>
                                    <button
                                        onClick={() => { setReportTarget(null); setSelectedReason(null); }}
                                        style={{
                                            width: '100%', marginTop: 8, padding: '12px',
                                            background: 'none', border: 'none', fontSize: 13,
                                            fontWeight: 'bold', color: '#9ca3af', cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Counsellor Popup Modal ── */}
            {showCounsellorPopup && (
                <div
                    className="fixed inset-0 z-[9999] flex items-end justify-center"
                    onClick={() => setShowCounsellorPopup(false)}
                >
                    {/* Dim backdrop */}
                    <div className="absolute inset-0 bg-black/65" style={{ backdropFilter: 'blur(3px)' }} />

                    {/* Bottom sheet */}
                    <div
                        className="relative w-full max-w-md bg-[#111827] overflow-hidden"
                        style={{ borderRadius: '12px 12px 0 0' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-4 pb-3">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* Content area */}
                        <div className="px-6 pt-8 pb-2">
                            <div className="flex items-center justify-between gap-6">
                                <div className="flex-1">
                                    <h2 className="text-white font-black leading-tight" style={{ fontSize: 19 }}>
                                        Need help with your subscription?
                                    </h2>
                                    <p className="text-white/55 text-[12px] mt-2 leading-relaxed">
                                        Talk to our experts who will guide you with all you need to crack it.
                                    </p>
                                </div>
                                {/* Avatar illustration */}
                                <div className="w-[68px] h-[68px] rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10 bg-[#1F2937]">
                                    <img
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=counsellorF&backgroundColor=b6e3f4&clothingColor=3c4f5c"
                                        className="w-full h-full object-cover"
                                        alt="Expert"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phone number big button */}
                        <div className="px-6 pt-6 pb-3">
                            <a
                                href="tel:+918585858585"
                                className="w-full flex items-center justify-center gap-3 bg-white active:scale-95 transition-transform"
                                style={{ borderRadius: 8, padding: '12px 24px' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span className="font-bold text-[#111827]" style={{ fontSize: 15 }}>+91 8585858585</span>
                            </a>
                        </div>

                        {/* Get a call CTA */}
                        <div className="px-6 pb-12">
                            <button
                                onClick={() => setShowCounsellorPopup(false)}
                                className="w-full flex items-center justify-center gap-1.5 py-3 text-white font-bold tracking-widest active:opacity-70 transition-opacity"
                                style={{ fontSize: 11.5, letterSpacing: '0.08em' }}
                            >
                                GET A CALL FROM US <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}