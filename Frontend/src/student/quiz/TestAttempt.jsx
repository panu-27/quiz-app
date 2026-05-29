import { useState, useEffect, useRef, useMemo } from 'react';
import { Check, X, ChevronLeft, ChevronRight, Clock, Menu, AlertTriangle, Info, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios.js'; // ← shared axios instance (auth + base URL handled there)

// ============= KaTeX LOADER =============
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
            if (!document.querySelector('script[src*="katex.min.js"]')) {
                const script1 = document.createElement('script');
                script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
                script1.onload = () => {
                    const script2 = document.createElement('script');
                    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
                    script2.onload = () => { loaded = true; resolve(); };
                    document.head.appendChild(script2);
                };
                document.head.appendChild(script1);
            } else { loaded = true; resolve(); }
        });
        return loading;
    };
})();

const KATEX_OPTS = {
    delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false,
};

const KaTeXSpan = ({ html }) => {
    const spanRef = useRef(null);
    useEffect(() => {
        if (!spanRef.current || !html) return;
        spanRef.current.innerHTML = html || '';
        loadKaTeX().then(() => {
            if (!spanRef.current || !window.renderMathInElement) return;
            window.renderMathInElement(spanRef.current, KATEX_OPTS);
        });
    }, [html]);
    return <span ref={spanRef} />;
};

function flattenExamData(examData) {
    const pool = [];
    examData.blocks.forEach((block, bIdx) => {
        block.sections.forEach((section) => {
            section.questions.forEach((q, qIdx) => {
                pool.push({
                    ...q,
                    blockName: block.blockName,
                    blockIdx: bIdx,
                    blockDuration: block.duration,
                    subjectName: section.subjectName,
                    globalIdx: pool.length,
                    localIdx: qIdx + 1,
                });
            });
        });
    });
    return pool;
}

/**
 * Marking scheme:
 *
 * Two-block exam (Block 1 = PCM, Block 2 = Maths/Bio):
 *   Block 1 (Physics / Chemistry): +1 correct,  0 wrong,  0 skipped
 *   Block 2 – Mathematics:         +2 correct,  0 wrong,  0 skipped
 *   Block 2 – Biology:             +1 correct,  0 wrong,  0 skipped
 *
 * Single-block exam (no Block 2):
 *   All subjects:                  +2 correct,  0 wrong,  0 skipped
 */
function getMarks(blockIdx, subjectName, totalBlocks) {
    // Single-block exam → +2/0 for everything
    if (totalBlocks === 1) return { correct: 2, wrong: 0 };

    // Multi-block exam
    if (blockIdx === 0) {
        // Block 1: Physics / Chemistry → +1/0
        return { correct: 1, wrong: 0 };
    }

    // Block 2
    const name = (subjectName || '').toLowerCase();
    if (name.includes('math')) return { correct: 2, wrong: 0 };
    return { correct: 1, wrong: 0 }; // Biology / any other Block-2 subject
}

const REPORT_REASONS = [
    { key: 'blurry_image',         label: 'Blurry / Missing Image',        icon: '🖼️' },
    { key: 'incorrect_question',   label: 'Incorrect Question Text',        icon: '❓' },
    { key: 'incorrect_options',    label: 'Incorrect / Missing Options',    icon: '📋' },
    { key: 'wrong_correct_option', label: 'Wrong Correct Answer Marked',    icon: '✅' },
    { key: 'improper_explanation', label: 'Improper / Missing Explanation', icon: '📖' },
    { key: 'ui_error',             label: 'UI / Display Error',             icon: '⚙️' },
];

const TestAttempt = ({ examData, onFinish }) => {
    useEffect(() => { loadKaTeX(); }, []);

    const flattenedPool = useMemo(() => flattenExamData(examData), [examData]);
    const blocks = examData.blocks;
    const totalBlocks = blocks.length; // ← passed into getMarks

    const [activeBlockIdx, setActiveBlockIdx] = useState(0);
    const blockDurationSecs = (bIdx) => (blocks[bIdx]?.duration || 30) * 60;
    const [timeLeft, setTimeLeft] = useState(blockDurationSecs(0));
    const firstIdxOfBlock = (bIdx) => flattenedPool.findIndex(p => p.blockIdx === bIdx);

    const [cur, setCur] = useState(0);
    const [answers, setAnswers] = useState({});
    const [reviewStatus, setReviewStatus] = useState({});
    const [visited, setVisited] = useState({ 0: true });
    const [submitted, setSubmitted] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reporting, setReporting] = useState(false);
    const [reportDone, setReportDone] = useState(false);

    const blockQuestions = useMemo(
        () => flattenedPool.filter(p => p.blockIdx === activeBlockIdx),
        [flattenedPool, activeBlockIdx]
    );
    const visiblePool = (reviewMode || submitted) ? flattenedPool : blockQuestions;

    const isUnlimited = useMemo(() => {
        return blocks[activeBlockIdx]?.duration >= 9999;
    }, [blocks, activeBlockIdx]);

    useEffect(() => {
        if (submitted || reviewMode || isUnlimited) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    const nextBlockIdx = activeBlockIdx + 1;
                    if (nextBlockIdx < blocks.length) {
                        setActiveBlockIdx(nextBlockIdx);
                        const nextFirstIdx = firstIdxOfBlock(nextBlockIdx);
                        if (nextFirstIdx !== -1) {
                            setCur(nextFirstIdx);
                            setVisited(v => ({ ...v, [nextFirstIdx]: true }));
                        }
                        return blockDurationSecs(nextBlockIdx);
                    } else {
                        setSubmitted(true);
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [submitted, reviewMode, activeBlockIdx, blocks.length, isUnlimited]);

    const navigate = (targetGlobalIdx) => {
        const pool = visiblePool;
        if (!pool.length) return;
        let found = pool.find(p => p.globalIdx === targetGlobalIdx);
        if (!found) {
            const curLocalPos = pool.findIndex(p => p.globalIdx === cur);
            const nextPos = ((curLocalPos + (targetGlobalIdx > cur ? 1 : -1)) + pool.length) % pool.length;
            found = pool[nextPos];
        }
        setVisited(prev => ({ ...prev, [found.globalIdx]: true }));
        setCur(found.globalIdx);
        setPanelOpen(false);
    };

    const navNext = () => {
        const pool = visiblePool;
        const pos = pool.findIndex(p => p.globalIdx === cur);
        navigate(pool[(pos + 1) % pool.length].globalIdx);
    };

    const navPrev = () => {
        const pool = visiblePool;
        const pos = pool.findIndex(p => p.globalIdx === cur);
        navigate(pool[(pos - 1 + pool.length) % pool.length].globalIdx);
    };

    const switchToSubject = (subjectName) => {
        const first = visiblePool.find(p => p.subjectName === subjectName);
        if (first) navigate(first.globalIdx);
    };

    const handleReport = async (reasonKey) => {
        setReporting(true);
        try {
            await api.post('/quiz/question-report', {
                questionId: flattenedPool[cur]?.questionId,
                reason: reasonKey,
            });
            setReportDone(true);
            setTimeout(() => { setShowReportModal(false); setReportDone(false); }, 1800);
        } catch (err) {
            console.error('[Report]', err);
            setShowReportModal(false);
        } finally {
            setReporting(false);
        }
    };

    const q = flattenedPool[cur];
    const mm = isUnlimited ? 'Unlimited' : String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss = isUnlimited ? '' : String(timeLeft % 60).padStart(2, '0');
    const isCritical = !isUnlimited && timeLeft <= 300 && !submitted && !reviewMode;

    const getBtnStatus = (idx) => {
        if (reviewMode) {
            if (answers[idx] === undefined) return 'status-not-visited';
            return answers[idx] === flattenedPool[idx].correctAnswer ? 'status-ans' : 'status-not-ans';
        }
        if (reviewStatus[idx]) return 'status-mfr';
        if (answers[idx] !== undefined) return 'status-ans';
        if (visited[idx]) return 'status-not-ans';
        return 'status-not-visited';
    };

    // ════════════════════════════════════════════════
    // RESULT SCREEN
    // ════════════════════════════════════════════════
    if (submitted && !reviewMode) {

        let totalScore = 0;
        let totalCorrect = 0, totalWrong = 0, totalSkipped = 0;

        const blockResults = blocks.map((block, bIdx) => {
            const bqPool = flattenedPool.filter(p => p.blockIdx === bIdx);
            const subjNames = [...new Set(bqPool.map(p => p.subjectName))];
            const subjectResults = subjNames.map(subj => {
                const qs = bqPool.filter(p => p.subjectName === subj);
                const marks = getMarks(bIdx, subj, totalBlocks);
                let score = 0, correct = 0, wrong = 0, skipped = 0;
                qs.forEach(q => {
                    const ua = answers[q.globalIdx];
                    if (ua === undefined) { skipped++; }
                    else if (ua === q.correctAnswer) { correct++; score += marks.correct; }
                    else { wrong++; score += marks.wrong; }
                });
                return { subj, total: qs.length, correct, wrong, skipped, score, marks };
            });

            const blockScore   = subjectResults.reduce((s, sr) => s + sr.score,   0);
            const blockCorrect = subjectResults.reduce((s, sr) => s + sr.correct,  0);
            const blockWrong   = subjectResults.reduce((s, sr) => s + sr.wrong,    0);
            const blockSkipped = subjectResults.reduce((s, sr) => s + sr.skipped,  0);
            const blockTotal   = subjectResults.reduce((s, sr) => s + sr.total,    0);

            totalScore   += blockScore;
            totalCorrect += blockCorrect;
            totalWrong   += blockWrong;
            totalSkipped += blockSkipped;

            return { blockName: block.blockName, blockIdx: bIdx, blockScore, blockTotal, blockCorrect, blockWrong, blockSkipped, subjectResults };
        });

        const maxScore = flattenedPool.reduce((s, q) => {
            const marks = getMarks(q.blockIdx, q.subjectName, totalBlocks);
            return s + marks.correct;
        }, 0);

        const accuracy = totalCorrect + totalWrong > 0
            ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
            : 0;

        const BLOCK_COLORS = ['#4F46E5', '#7C3AED'];

        return (
            <div style={{ position: 'fixed', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', zIndex: 9999, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>Quiz Analysis Report</h2>
                        <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>{examData.title}</p>
                    </div>
                    <button onClick={onFinish} style={{ background: '#F1F5F9', border: 'none', padding: 6, borderRadius: 8, cursor: 'pointer' }}><X size={18} color="#64748B" /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    

                    {/* Stat tiles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 600, margin: '0 auto 24px' }}>
                        <div style={{ padding: 16, borderRadius: 16, background: '#EEF2FF', border: '1.5px solid #C7D2FE', gridColumn: '1 / -1' }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', marginBottom: 4 }}>Total Score</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span style={{ fontSize: 32, fontWeight: 900, color: '#4F46E5' }}>{totalScore}</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#818CF8' }}>/ {maxScore}</span>
                            </div>
                            <div style={{ height: 6, background: '#C7D2FE', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
                                <div style={{ height: '100%', background: '#4F46E5', borderRadius: 4, width: `${maxScore > 0 ? (Math.max(0, totalScore) / maxScore) * 100 : 0}%`, transition: 'width 0.8s ease' }} />
                            </div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 16, background: '#F5F3FF', border: '1.5px solid #EDE9FE' }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', marginBottom: 4 }}>Accuracy</p>
                            <span style={{ fontSize: 24, fontWeight: 900, color: '#7C3AED' }}>{accuracy}%</span>
                        </div>
                        <div style={{ padding: 16, borderRadius: 16, background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Skipped</p>
                            <span style={{ fontSize: 24, fontWeight: 900, color: '#334155' }}>{totalSkipped}</span>
                        </div>
                        <div style={{ padding: 16, borderRadius: 16, background: '#F0FDF4', border: '1.5px solid #DCFCE7' }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', marginBottom: 4 }}>Correct</p>
                            <span style={{ fontSize: 24, fontWeight: 900, color: '#16A34A' }}>{totalCorrect}</span>
                        </div>
                        <div style={{ padding: 16, borderRadius: 16, background: '#FEF2F2', border: '1.5px solid #FEE2E2' }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', marginBottom: 4 }}>Wrong</p>
                            <span style={{ fontSize: 24, fontWeight: 900, color: '#991B1B' }}>{totalWrong}</span>
                        </div>
                    </div>

                    {/* Per-block breakdown */}
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                        {blockResults.map((br) => {
                            const accent = BLOCK_COLORS[br.blockIdx] || '#4F46E5';
                            return (
                                <div key={br.blockName} style={{ background: '#FAFAFA', border: '1.5px solid #F0F0F4', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
                                            <span style={{ fontWeight: 800, fontSize: 13, color: '#1F2937' }}>{br.blockName}</span>
                                            <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>{br.blockTotal}Q</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                            <span style={{ fontSize: 20, fontWeight: 900, color: accent }}>{br.blockScore}</span>
                                            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>pts</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                        <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700 }}>✓ {br.blockCorrect}</span>
                                        <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 700 }}>✗ {br.blockWrong}</span>
                                        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700 }}>— {br.blockSkipped}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {br.subjectResults.map(sr => (
                                            <div key={sr.subj} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #F0F0F4' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontWeight: 700, fontSize: 13, color: '#1F2937' }}>{sr.subj}</span>
                                                        <span style={{ fontSize: 9, fontWeight: 800, color: accent, background: `${accent}18`, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                            +{sr.marks.correct}/0
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                                                        <span style={{ fontSize: 16, fontWeight: 900, color: accent }}>{sr.score}</span>
                                                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>/ {sr.total * sr.marks.correct}</span>
                                                    </div>
                                                </div>
                                                <div style={{ height: 4, background: '#F0F0F4', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', background: accent, borderRadius: 3, width: `${sr.total > 0 ? (Math.max(0, sr.score) / (sr.total * sr.marks.correct)) * 100 : 0}%`, transition: 'width 0.8s ease' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                                                    <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>✓ {sr.correct}</span>
                                                    <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>✗ {sr.wrong}</span>
                                                    <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>— {sr.skipped}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 600, width: '100%', margin: '0 auto' }}>
                    <button onClick={() => setReviewMode(true)} style={{ width: '100%', height: 50, borderRadius: 14, background: '#4F46E5', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Review Detailed Answers <ChevronRight size={16} />
                    </button>
                    <button onClick={onFinish} style={{ width: '100%', height: 50, borderRadius: 14, background: '#fff', color: '#64748B', border: '1.5px solid #E2E8F0', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Exit to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const subjectsInView = [...new Set(visiblePool.map(p => p.subjectName))];
    const curMarks = q ? getMarks(q.blockIdx, q.subjectName, totalBlocks) : { correct: 2, wrong: 0 };

    // ════════════════════════════════════════════════
    // QUIZ SCREEN
    // ════════════════════════════════════════════════
    return (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                .status-not-visited { background: #F1F5F9; color: #94A3B8; }
                .status-not-ans     { background: #EF4444; color: #fff; }
                .status-ans         { background: #22C55E; color: #fff; }
                .status-mfr         { background: #9333EA; color: #fff; border-radius: 50% !important; }
                .subject-tab        { padding: 14px 20px; font-size: 13px; font-weight: 700; color: #94A3B8; cursor: pointer; transition: 0.2s; border-bottom: 3px solid transparent; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; }
                .subject-tab.active { color: #4F46E5; border-bottom: 3px solid #4F46E5; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar       { -ms-overflow-style: none; scrollbar-width: none; }
                .report-row:hover   { background: #F5F3FF !important; border-color: #A5B4FC !important; }
                @keyframes slideUp  { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes spin     { to { transform: rotate(360deg); } }
            `}</style>

            {/* ── HEADER ── */}
            <header style={{ height: 60, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                {!reviewMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {blocks.length > 1 && (
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#7C3AED', background: '#F5F3FF', padding: '3px 8px', borderRadius: 6 }}>
                                {blocks[activeBlockIdx]?.blockName}
                            </span>
                        )}
                        <div style={{ background: isCritical ? '#FEF2F2' : '#F8FAFC', padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${isCritical ? '#FECACA' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={16} color={isCritical ? '#DC2626' : '#4F46E5'} />
                            <span style={{ fontSize: 15, fontWeight: 800, color: isCritical ? '#DC2626' : '#1E293B', fontVariantNumeric: 'tabular-nums' }}>
                                {isUnlimited ? 'Unlimited' : `${mm}:${ss}`}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => setReviewMode(false)} style={{ background: '#F1F5F9', border: 'none', padding: '6px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#64748B', fontWeight: 700, fontSize: 12 }}>
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#4F46E5' }}>Quiz Review</div>
                    </div>
                )}
                <button onClick={() => setPanelOpen(true)} style={{ background: '#F1F5F9', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer' }}>
                    <Menu size={20} color="#4F46E5" />
                </button>
            </header>

            {/* ── SUBJECT TABS ── */}
            <div style={{ display: 'flex', background: '#FDFDFD', borderBottom: '1px solid #F1F5F9', overflowX: 'auto' }} className="no-scrollbar">
                {subjectsInView.map(sub => (
                    <div key={sub} onClick={() => switchToSubject(sub)} className={`subject-tab ${q?.subjectName === sub ? 'active' : ''}`}>{sub}</div>
                ))}
            </div>

            {/* ── QUESTION BODY ── */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {q && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                                Q{q.localIdx}
                                {q.year && <span style={{ color: '#6366f1', marginLeft: 8, fontSize: 11 }}>· {q.year}{q.shift ? ` ${q.shift}` : ''}</span>}
                                <span style={{ color: '#16A34A', marginLeft: 8 }}>+{curMarks.correct}</span>
                                <span style={{ color: curMarks.wrong < 0 ? '#DC2626' : '#94A3B8', marginLeft: 4 }}>{curMarks.wrong === 0 ? '/ 0' : curMarks.wrong}</span>
                            </span>
                            <button
                                onClick={() => { setShowReportModal(true); setReportDone(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: '0.15s' }}
                                onMouseOver={e => e.currentTarget.style.color = '#EF4444'}
                                onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                            >
                                <AlertTriangle size={14} /> Report
                            </button>
                        </div>

                        <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, color: '#1E293B', marginBottom: 24 }}>
                            Q{q.localIdx}. <KaTeXSpan html={q.questionText} />
                        </div>

                        {q.questionImage && (
                            <img src={q.questionImage} style={{ maxWidth: '100%', borderRadius: 12, marginBottom: 24, border: '1px solid #F1F5F9' }} alt="Q-Img" />
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {q.options.map((opt, i) => {
                                const isSel = answers[cur] === i;
                                const isRight = q.correctAnswer === i;
                                const hasImage = opt.image && typeof opt.image === 'string' && opt.image.trim().length > 0;
                                const hasText = opt.text && typeof opt.text === 'string' && opt.text.trim().length > 0;
                                let border = isSel ? '#4F46E5' : '#F1F5F9';
                                let bg = isSel ? '#EEF2FF' : '#fff';
                                if (reviewMode) {
                                    if (isRight) { border = '#16A34A'; bg = '#F0FDF4'; }
                                    else if (isSel) { border = '#DC2626'; bg = '#FEF2F2'; }
                                }
                                return (
                                    <button key={i} disabled={reviewMode}
                                        onClick={() => setAnswers({ ...answers, [cur]: i })}
                                        style={{ display: 'flex', alignItems: hasImage && !hasText ? 'center' : 'flex-start', flexDirection: hasImage && !hasText ? 'column' : 'row', padding: hasImage ? 12 : 16, borderRadius: 12, border: `1px solid ${border}`, background: bg, textAlign: 'left', cursor: reviewMode ? 'default' : 'pointer', transition: '0.15s', gap: hasImage && !hasText ? 6 : 12 }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: isSel ? '#4F46E5' : '#F1F5F9', color: isSel ? '#fff' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {hasImage && <img src={opt.image} alt={`Option ${String.fromCharCode(65 + i)}`} style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, marginBottom: hasText ? 8 : 0 }} />}
                                            {hasText && (
                                                <span style={{ flex: 1, fontSize: 15, fontWeight: isSel ? 700 : 500, color: '#334155' }}>
                                                    <KaTeXSpan html={opt.text} />
                                                </span>
                                            )}
                                        </div>
                                        {reviewMode && isRight && <Check size={18} color="#16A34A" style={{ flexShrink: 0 }} />}
                                    </button>
                                );
                            })}
                        </div>

                        {reviewMode && q.explanation && (
                            <div style={{ marginTop: 24, background: '#F8FAFC', borderRadius: 16, padding: 20, border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#4F46E5' }}>
                                    <Info size={16} />
                                    <span style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase' }}>Explanation</span>
                                </div>
                                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#475569' }}>
                                    <KaTeXSpan html={q.explanation} />
                                </div>
                                {q.explanationImage && <img src={q.explanationImage} style={{ maxWidth: '100%', borderRadius: 8, marginTop: 12 }} alt="Explanation" />}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── FOOTER NAV ── */}
            <footer style={{ padding: '12px 12px 4px', borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: reviewMode ? '1fr 1fr' : '1fr 1.2fr 1fr 1.5fr', gap: 8, background: '#fff' }}>
                <button onClick={navPrev} style={{ height: 44, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={16} />
                </button>
                {!reviewMode && (
                    <>
                        <button onClick={() => { const a = { ...answers }; delete a[cur]; setAnswers(a); }} style={{ height: 44, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 700, color: '#64748B', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Clear</button>
                        <button onClick={() => { setReviewStatus({ ...reviewStatus, [cur]: !reviewStatus[cur] }); navNext(); }} style={{ height: 44, borderRadius: 8, border: '1px solid #9333EA', background: '#fff', fontSize: 12, fontWeight: 700, color: '#9333EA', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {reviewStatus[cur] ? 'Unmark' : 'Mark'}
                        </button>
                    </>
                )}
                <button onClick={navNext} style={{ height: 44, borderRadius: 8, background: '#4F46E5', border: 'none', fontSize: 13, fontWeight: 800, color: '#fff', boxShadow: '0 4px 10px rgba(79,70,229,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Next <ChevronRight size={16} />
                </button>
            </footer>

            {/* ── REPORT BOTTOM SHEET ── */}
            {showReportModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)' }}>
                    <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', animation: 'slideUp 0.22s cubic-bezier(.22,1,.36,1)', paddingBottom: 32 }}>
                        <div style={{ width: 36, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '12px auto 0' }} />
                        {reportDone ? (
                            <div style={{ textAlign: 'center', padding: '28px 24px 12px' }}>
                                <div style={{ width: 56, height: 56, background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                    <CheckCircle2 size={28} color="#16A34A" />
                                </div>
                                <p style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Report Submitted!</p>
                                <p style={{ fontSize: 13, color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Thanks! Our team will review this question.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 20px 14px' }}>
                                    <div>
                                        <p style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Report a Problem</p>
                                        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Q{q?.localIdx} · Select what's wrong</p>
                                    </div>
                                    <button disabled={reporting} onClick={() => setShowReportModal(false)} style={{ background: '#F1F5F9', border: 'none', padding: 7, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <X size={16} color="#64748B" />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 16px' }}>
                                    {REPORT_REASONS.map(({ key, label, icon }) => (
                                        <button key={key} disabled={reporting} onClick={() => handleReport(key)} className="report-row"
                                            style={{ textAlign: 'left', padding: '13px 16px', borderRadius: 14, background: '#F8FAFC', border: '1.5px solid #F0F0F4', color: '#1F2937', fontWeight: 600, fontSize: 14, cursor: reporting ? 'not-allowed' : 'pointer', transition: '0.15s', display: 'flex', alignItems: 'center', gap: 12, opacity: reporting ? 0.55 : 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                            <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {reporting && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#4F46E5', fontSize: 12, fontWeight: 700, marginTop: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                        Submitting…
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── CONFIRM SUBMIT ── */}
            {showConfirmSubmit && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', padding: 20 }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 320, width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: 50, height: 50, background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <AlertTriangle color="#EF4444" size={24} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Finish Quiz?</h3>
                        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 24, lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You cannot change your answers after submitting.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowConfirmSubmit(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#F1F5F9', border: 'none', color: '#64748B', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Keep Going</button>
                            <button onClick={() => { setSubmitted(true); setShowConfirmSubmit(false); }} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#EF4444', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── QUESTION MAP PANEL ── */}
            {panelOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
                    <div onClick={() => setPanelOpen(false)} style={{ flex: 1, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} />
                    <div style={{ width: 300, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}>
                        <div style={{ padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 600, fontSize: 18, color: '#1E293B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Questions</h3>
                            <button onClick={() => setPanelOpen(false)} style={{ background: '#F1F5F9', border: 'none', padding: 6, borderRadius: '50%', cursor: 'pointer' }}><X size={20} color="#64748B" /></button>
                        </div>
                        <div style={{ padding: '0 20px 10px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {[{ cls: 'status-ans', label: 'Answered' }, { cls: 'status-not-ans', label: 'Not Answered' }, { cls: 'status-not-visited', label: 'Not Visited' }, { cls: 'status-mfr', label: 'Marked' }].map(({ cls, label }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div className={cls} style={{ width: 14, height: 14, borderRadius: 3, fontSize: 0 }} />
                                    <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }} className="no-scrollbar">
                            {subjectsInView.map(subj => (
                                <div key={subj} style={{ marginBottom: 24 }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>{subj}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                                        {visiblePool.filter(p => p.subjectName === subj).map(p => (
                                            <button key={p.globalIdx}
                                                onClick={() => { navigate(p.globalIdx); setPanelOpen(false); }}
                                                style={{ height: 38, borderRadius: 8, border: p.globalIdx === cur ? '2px solid #4F46E5' : 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                                className={getBtnStatus(p.globalIdx)}>
                                                {p.localIdx}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!reviewMode && (
                            <div style={{ padding: 20, borderTop: '1px solid #f1f5f9' }}>
                                <button onClick={() => { setPanelOpen(false); setShowConfirmSubmit(true); }}
                                    style={{ width: '100%', background: '#EF4444', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.2)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                    SUBMIT TEST
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestAttempt;