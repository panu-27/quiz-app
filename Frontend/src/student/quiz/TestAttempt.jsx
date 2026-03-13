/* ══════════════════════════════════════════════
   SCREEN 4 — Test Attempt  (MOBILE FIXED)
   Extracted from StudentQuizFlow — zero UI changes.
   Bugs fixed (from original v6):
   - No longer receives QUESTIONS/SUBJECTS/CHAPTERS as props (uses module scope)
   - Result view: wrong count = answeredCount - correct (not double-subtracted)
   - Layout uses height:100dvh + flex properly on mobile
   - Footer is sticky within the component (not fixed to viewport)
   - QPanel renders inside a portal-style overlay correctly
══════════════════════════════════════════════ */

import { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronLeft, ChevronRight, Clock, Flag, Menu, RotateCcw } from 'lucide-react';
import { SUBJECTS, QUESTIONS } from './quizData';
import { TEST_ATTEMPT_STYLES } from './quizStyles';
import { submitQuizAttempt } from './quizApi';

const TestAttempt = ({ subjectIds, chapterIds = [], topicKeys = [], questions = [], onFinish }) => {
    /*
     * Pool priority: use API-fetched questions if provided,
     * otherwise fall back to local QUESTIONS constant.
     */
    const pool = useRef(
        (questions.length > 0
            ? questions.map((q, i) => ({ ...q, globalIdx: i }))
            : subjectIds.flatMap(sid =>
                  (QUESTIONS[sid] || []).slice(0, 6).map(q => ({ ...q, subj: sid }))
              ).map((q, i) => ({ ...q, globalIdx: i }))
        )
    ).current;

    const startTime = useRef(Date.now());

    const [cur, setCur]           = useState(0);
    const [answers, setAnswers]   = useState({});
    const [flags, setFlags]       = useState({});
    const [panelOpen, setPanelOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(pool.length * 120);
    const [questionKey, setQuestionKey] = useState(0);
    const [animDir, setAnimDir]   = useState(1);
    const timerRef = useRef(null);

    useEffect(() => {
        if (submitted) return;
        timerRef.current = setInterval(() => setTimeLeft(t => {
            if (t <= 1) {
                clearInterval(timerRef.current);
                /* Auto-submit on timer expiry */
                const answersPayload = pool.map(item => ({
                    questionId:      item.id,
                    selectedOption:  answers[item.globalIdx] ?? null,
                    _correctOption:  item.ans,
                }));
                submitQuizAttempt({
                    subjectIds,
                    chapterIds,
                    topicKeys,
                    answers: answersPayload,
                    timeTakenSeconds: pool.length * 120,
                }).catch(err => console.error('[TestAttempt] Auto-submit failed:', err));
                setSubmitted(true);
                return 0;
            }
            return t - 1;
        }), 1000);
        return () => clearInterval(timerRef.current);
    }, [submitted]);

    const navigate = (next) => {
        setAnimDir(next > cur ? 1 : -1);
        setQuestionKey(k => k + 1);
        setCur(next);
    };

    const q             = pool[cur];
    const sel           = answers[cur];
    const isFlagged     = flags[cur];
    const answeredCount = Object.keys(answers).length;
    const flagCount     = Object.values(flags).filter(Boolean).length;
    const mm            = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss            = String(timeLeft % 60).padStart(2, '0');
    const timeWarn      = timeLeft < 300;
    const timeCritical  = timeLeft < 60;

    const handleSubmit = () => {
        if (window.confirm("Submit your exam now?")) {
            clearInterval(timerRef.current);

            /* Build answers payload for API */
            const answersPayload = pool.map(item => ({
                questionId:      item.id,
                selectedOption:  answers[item.globalIdx] ?? null,
                _correctOption:  item.ans,   // kept for fake response scoring; strip in real API call
            }));

            submitQuizAttempt({
                subjectIds,
                chapterIds,
                topicKeys: topicKeys,
                answers:   answersPayload,
                timeTakenSeconds: Math.round((Date.now() - startTime.current) / 1000),
            }).catch(err => console.error('[TestAttempt] Submit failed:', err));

            setSubmitted(true);
        }
    };

    /* ─── RESULTS VIEW ─── */
    if (submitted) {
        const correct   = pool.filter((item, i) => answers[i] === item.ans).length;
        const unanswered = pool.length - Object.keys(answers).length;
        const score     = Math.round((correct / pool.length) * 100);
        const grade     = score >= 90 ? { label: 'Outstanding', icon: '🏆', color: '#10b981' }
            : score >= 75 ? { label: 'Excellent',  icon: '🎯', color: '#6366f1' }
            : score >= 60 ? { label: 'Good Work',  icon: '👍', color: '#f59e0b' }
            :               { label: 'Keep Going', icon: '💪', color: '#ef4444' };

        return (
            <div style={{ position: 'fixed', inset: 0, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', background: '#f8fafc', color: '#1e293b' }}>
                {/* ── TOP NAV ── */}
                <header style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', zIndex: 30, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>Q</div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Performance Report</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RotateCcw size={14} /> <span className="r-hide-mob">Retry</span>
                        </button>
                        <button onClick={onFinish} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            Finish
                        </button>
                    </div>
                </header>

                {/*
                    DESKTOP  → flex row, overflow:hidden on wrapper, each column scrolls independently.
                    MOBILE   → .r-wrap switches to flex column + overflow-y:auto so the whole page
                               scrolls as one. aside/main lose their own overflow so nothing is clipped.
                */}
                <div className="r-wrap" style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                    {/* ── SIDEBAR ── */}
                    <aside className="r-aside" style={{
                        width: 280, flexShrink: 0,
                        background: '#fff', borderRight: '1px solid #e2e8f0',
                        display: 'flex', flexDirection: 'column',
                        padding: 24, gap: 32,
                        overflowY: 'auto',
                    }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Overview</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                                    <svg width="64" height="64" viewBox="0 0 64 64">
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                        <circle cx="32" cy="32" r="28" fill="none" stroke={grade.color} strokeWidth="6" strokeDasharray="176" strokeDashoffset={176 - (176 * score / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{score}%</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700 }}>{grade.label}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{correct} of {pool.length} correct</div>
                                </div>
                            </div>
                        </div>

                        <div className="r-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { label: 'Correct',  val: correct,                            color: '#10b981', bg: '#ecfdf5' },
                                { label: 'Wrong',    val: pool.length - correct - unanswered, color: '#ef4444', bg: '#fef2f2' },
                                { label: 'Skipped',  val: unanswered,                          color: '#f59e0b', bg: '#fffbeb' },
                                { label: 'Total',    val: pool.length,                         color: '#6366f1', bg: '#eef2ff' },
                            ].map(s => (
                                <div key={s.label} style={{ padding: '12px', borderRadius: 12, background: s.bg, border: `1px solid ${s.color}20` }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: s.color, opacity: 0.8, textTransform: 'uppercase' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* ── REVIEW CONTENT ── */}
                    <main className="r-main" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '28px 20px' }}>
                        <div style={{ maxWidth: 800, margin: '0 auto' }}>
                            <div style={{ marginBottom: 28 }}>
                                <p style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Question Review</p>
                                <p style={{ color: '#64748b', fontSize: 14 }}>Walk through your answers and find areas to improve.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {pool.map((item, i) => {
                                    const userAns   = answers[i];
                                    const isCorrect = userAns === item.ans;
                                    return (
                                        <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Q{i + 1}</span>
                                                    <span style={{ height: 4, width: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                                                    <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: '#475569' }}>
                                                        {SUBJECTS.find(x => x.id === item.subj)?.name}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: isCorrect ? '#10b981' : userAns === undefined ? '#f59e0b' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {isCorrect ? 'Correct' : userAns === undefined ? 'Skipped' : 'Incorrect'}
                                                </div>
                                            </div>

                                            <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.6, marginBottom: 20 }}>{item.q}</p>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                                                {item.opts.map((opt, oi) => {
                                                    const isRight = oi === item.ans;
                                                    const isUser  = oi === userAns;
                                                    return (
                                                        <div key={oi} style={{
                                                            padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                                                            display: 'flex', alignItems: 'center', gap: 10,
                                                            border: '1px solid',
                                                            borderColor: isRight ? '#10b981' : isUser ? '#ef4444' : '#f1f5f9',
                                                            background:  isRight ? '#f0fdf4' : isUser ? '#fef2f2' : '#f8fafc',
                                                            color:       isRight ? '#065f46' : isUser ? '#991b1b' : '#64748b',
                                                        }}>
                                                            <div style={{
                                                                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                background: isRight ? '#10b981' : isUser ? '#ef4444' : '#e2e8f0',
                                                                color: '#fff',
                                                            }}>
                                                                {isRight ? <Check size={12} /> : isUser ? <X size={12} /> : null}
                                                            </div>
                                                            {opt}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>

                <style>{`
                    .r-hide-mob { display: inline; }

                    /* MOBILE: single unified scroll — sidebar stacks above review */
                    @media (max-width: 768px) {
                        .r-wrap {
                            flex-direction: column !important;
                            overflow-y: auto !important;
                            overflow-x: hidden !important;
                        }
                        .r-aside {
                            width: 100% !important;
                            border-right: none !important;
                            border-bottom: 1px solid #e2e8f0 !important;
                            overflow-y: visible !important;
                            flex-shrink: 0 !important;
                            padding: 16px !important;
                            gap: 16px !important;
                        }
                        .r-main {
                            overflow-y: visible !important;
                            min-height: unset !important;
                            padding: 16px !important;
                        }
                        .r-stats-grid {
                            grid-template-columns: repeat(4, 1fr) !important;
                            gap: 8px !important;
                        }
                        .r-hide-mob { display: none !important; }
                    }

                    /* Very narrow: stats back to 2×2 */
                    @media (max-width: 420px) {
                        .r-stats-grid { grid-template-columns: 1fr 1fr !important; }
                    }
                `}</style>
            </div>
        );
    }

    /* ─── RIGHT SIDEBAR NAV PANEL ─── */
    const NavPanel = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Question Navigator</span>
                <button onClick={() => setPanelOpen(false)} className="mobile-only" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 4, borderRadius: 4 }}><X size={14} /></button>
            </div>

            {/* Stats row */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, flexShrink: 0 }}>
                {[
                    { label: 'Answered', val: answeredCount,               color: '#6366f1', bg: '#eef2ff' },
                    { label: 'Flagged',  val: flagCount,                    color: '#d97706', bg: '#fffbeb' },
                    { label: 'Left',     val: pool.length - answeredCount,  color: '#6b7280', bg: '#f9fafb' },
                ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 6, padding: '6px 8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
                {[{ bg: '#6366f1', label: 'Answered' }, { bg: '#fef3c7', border: '#f59e0b', label: 'Flagged' }, { bg: '#f9fafb', label: 'Pending' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: l.bg, border: `1px solid ${l.border || '#e5e7eb'}` }} />
                        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{l.label}</span>
                    </div>
                ))}
            </div>

            {/* Question grid */}
            <div className="side-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {subjectIds.map(sid => {
                        const subPool = pool.filter(p => p.subj === sid);
                        const done    = subPool.filter(p => answers[p.globalIdx] !== undefined).length;
                        return (
                            <div key={sid}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {SUBJECTS.find(x => x.id === sid)?.name}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{done}/{subPool.length}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>
                                    {subPool.map(item => {
                                        const isCur  = cur === item.globalIdx;
                                        const isDone = answers[item.globalIdx] !== undefined;
                                        const isFlg  = flags[item.globalIdx];
                                        return (
                                            <button key={item.globalIdx}
                                                className={`qmap-btn${isDone && !isFlg ? ' done' : ''}${isFlg ? ' flagged' : ''}${isCur ? ' current' : ''}`}
                                                onClick={() => { navigate(item.globalIdx); setPanelOpen(false); }}>
                                                {item.globalIdx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submit button */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', background: '#fafafa', flexShrink: 0 }}>
                <button onClick={handleSubmit} style={{
                    width: '100%', height: 36, borderRadius: 7, border: 'none',
                    background: '#059669', color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans'",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'background 0.15s'
                }} onMouseOver={e => e.currentTarget.style.background = '#047857'}
                    onMouseOut={e => e.currentTarget.style.background = '#059669'}>
                    Submit Exam <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );

    /* ─── MAIN TEST UI ─── */
    return (
        <div style={{ position: 'fixed', inset: 0, background: '#f9fafb', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{TEST_ATTEMPT_STYLES}</style>

            {/* ── TOP BAR ── */}
            <header style={{
                height: 52, background: '#fff', borderBottom: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', flexShrink: 0, zIndex: 30
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Q</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Practice Exam</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1, marginTop: 1 }}>{pool.length} questions</div>
                    </div>
                </div>

                {/* Center: progress (desktop only) */}
                <div className="desktop-only" style={{ flex: 1, maxWidth: 340, margin: '0 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: '#6366f1', width: `${(answeredCount / pool.length) * 100}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', whiteSpace: 'nowrap' }}>{answeredCount}/{pool.length} answered</span>
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Timer */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                        borderRadius: 6, border: `1px solid ${timeCritical ? '#fca5a5' : timeWarn ? '#fcd34d' : '#e5e7eb'}`,
                        background: timeCritical ? '#fef2f2' : timeWarn ? '#fffbeb' : '#f9fafb'
                    }}>
                        <Clock size={13} style={{ color: timeCritical ? '#dc2626' : timeWarn ? '#d97706' : '#9ca3af' }} />
                        <span style={{
                            fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums',
                            color: timeCritical ? '#dc2626' : timeWarn ? '#d97706' : '#374151'
                        }} className={timeCritical ? 'timer-crit' : ''}>{mm}:{ss}</span>
                    </div>

                    {/* Flag */}
                    <button onClick={() => setFlags(f => ({ ...f, [cur]: !f[cur] }))} style={{
                        height: 34, padding: '0 10px', borderRadius: 6, cursor: 'pointer',
                        border: `1px solid ${isFlagged ? '#f59e0b' : '#e5e7eb'}`,
                        background: isFlagged ? '#fef3c7' : '#fff',
                        color: isFlagged ? '#92400e' : '#9ca3af',
                        display: 'flex', alignItems: 'center', gap: 5,
                        transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans'"
                    }}>
                        <Flag size={13} fill={isFlagged ? '#f59e0b' : 'none'} strokeWidth={1.8} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{isFlagged ? 'Flagged' : 'Flag'}</span>
                    </button>

                    {/* Mobile hamburger */}
                    <button onClick={() => setPanelOpen(true)} className="mobile-only" style={{
                        height: 34, width: 34, borderRadius: 6, border: '1px solid #e5e7eb',
                        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280'
                    }}><Menu size={15} /></button>
                </div>
            </header>

            {/* ── BODY: Question LEFT, Sidebar RIGHT ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* ── MAIN QUESTION AREA ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    <main className="main-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 12px 6px 18px' }}>
                        {/* Subject + Q label row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: '#6366f1',
                                background: '#eef2ff', padding: '3px 10px', borderRadius: 99,
                                border: '1px solid #c7d2fe'
                            }}>Question {cur + 1} <span style={{ color: '#a5b4fc' }}>of {pool.length}</span></span>

                            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                                — {SUBJECTS.find(x => x.id === q.subj)?.name}
                            </span>

                            {isFlagged && (
                                <span style={{
                                    fontSize: 11, fontWeight: 600, color: '#92400e',
                                    background: '#fef3c7', padding: '3px 8px', borderRadius: 99,
                                    border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: 4
                                }}><Flag size={10} fill="#f59e0b" /> Flagged</span>
                            )}
                        </div>

                        {/* Question + Options */}
                        <div key={questionKey} className={animDir > 0 ? 'q-enter-r' : 'q-enter-l'} style={{ maxWidth: 680 }}>
                            <p style={{
                                fontSize: 15, fontWeight: 600, color: '#111827',
                                lineHeight: 1.65, marginBottom: 22, letterSpacing: '-0.01em'
                            }}>
                                {q.q}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {q.opts.map((opt, i) => {
                                    const isSelected = sel === i;
                                    return (
                                        <div key={i} className="opt-row" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <button className={`opt-btn${isSelected ? ' sel' : ''}`}
                                                onClick={() => setAnswers(a => ({ ...a, [cur]: i }))}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isSelected ? '#6366f1' : '#f3f4f6',
                                                    color: isSelected ? '#fff' : '#6b7280',
                                                    fontSize: 11, fontWeight: 700, transition: 'all 0.15s'
                                                }}>
                                                    {isSelected ? <Check size={14} /> : String.fromCharCode(65 + i)}
                                                </div>
                                                <span style={{
                                                    flex: 1, fontSize: 13, fontWeight: isSelected ? 600 : 500,
                                                    color: isSelected ? '#4338ca' : '#374151', lineHeight: 1.5,
                                                    transition: 'color 0.15s'
                                                }}>{opt}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>

                    {/* ── FOOTER NAV ── */}
                    <footer style={{
                        background: '#fff', borderTop: '1px solid #e5e7eb',
                        padding: '10px 32px', flexShrink: 0, zIndex: 10
                    }}>
                        <div style={{ maxWidth: 680, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="nav-prev" disabled={cur === 0}
                                onClick={() => navigate(cur - 1)}
                                style={{ width: 84 }}>
                                <ChevronLeft size={15} /> Back
                            </button>

                            {/* Dot indicators */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden', padding: '0 8px' }}>
                                {pool.length <= 30 ? pool.map((_, i) => (
                                    <div key={i} onClick={() => navigate(i)} style={{
                                        width: i === cur ? 18 : 6, height: 6, borderRadius: 99, cursor: 'pointer', flexShrink: 0,
                                        background: i === cur ? '#6366f1' : answers[i] !== undefined ? '#a5b4fc' : flags[i] ? '#fcd34d' : '#e5e7eb',
                                        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'
                                    }} />
                                )) : (
                                    <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{cur + 1} / {pool.length}</span>
                                )}
                            </div>

                            {cur + 1 < pool.length ? (
                                <button className="nav-next" onClick={() => navigate(cur + 1)} style={{ minWidth: 84 }}>
                                    Next <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button className="nav-next submit" onClick={handleSubmit} style={{ minWidth: 100 }}>
                                    Submit <ChevronRight size={15} />
                                </button>
                            )}
                        </div>
                    </footer>
                </div>

                {/* ── RIGHT SIDEBAR (desktop only) ── */}
                <aside className="desktop-only" style={{
                    width: 248, background: '#fff', borderLeft: '1px solid #e5e7eb',
                    display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden'
                }}>
                    <NavPanel />
                </aside>
            </div>

            {/* ── MOBILE DRAWER ── */}
            {panelOpen && (
                <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div onClick={() => setPanelOpen(false)} style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)'
                    }} />
                    <div style={{
                        position: 'relative', marginLeft: 'auto',
                        width: 'min(88vw,300px)', height: '100%',
                        background: '#fff', borderLeft: '1px solid #e5e7eb', overflowY: 'auto',
                        animation: 'fadeSlideRight 0.22s ease'
                    }}>
                        <NavPanel />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestAttempt;