import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios.js';

const injectGlobalStyles = (() => {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

      .qd-root * { box-sizing: border-box; }
      .qd-root { font-family: 'DM Sans', system-ui, sans-serif; }

      @keyframes qd-shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      @keyframes qd-fadein {
        from { opacity: 0; transform: translateY(4px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .qd-scroll::-webkit-scrollbar { display: none; }
      .qd-scroll { -ms-overflow-style: none; scrollbar-width: none; }

      .qd-option {
        transition: border-color 0.14s, background 0.14s, box-shadow 0.14s;
        cursor: pointer;
      }
      .qd-option:active { transform: scale(0.994); }
      .qd-entry { animation: qd-fadein 0.2s ease both; }

      .qd-root .katex { font-size: 1em !important; }
      .qd-root .katex-display {
        margin: 0.5em 0;
        overflow-x: auto;
        overflow-y: visible;
        scrollbar-width: none;
      }
      .qd-root .katex-display::-webkit-scrollbar { display: none; }
      .qd-root .katex-html { overflow: visible; }

      .qd-opts-list { display: flex; flex-direction: column; gap: 7px; }

      .qd-opts-grid { display: flex; flex-direction: column; gap: 7px; }
      @media (min-width: 520px) {
        .qd-opts-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
  };
})();

const loadKaTeX = (() => {
  let loaded = false, loading = null;
  return () => {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(resolve => {
      if (!document.querySelector('link[href*="katex"]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
        document.head.appendChild(l);
      }
      if (!document.querySelector('script[src*="katex.min.js"]')) {
        const s1 = document.createElement('script');
        s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
        s1.onload = () => {
          const s2 = document.createElement('script');
          s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
          s2.onload = () => { loaded = true; resolve(); };
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      } else { loaded = true; resolve(); }
    });
    return loading;
  };
})();

const KATEX_OPTS = {
  delimiters: [
    { left: '$$', right: '$$', display: true  },
    { left: '$',  right: '$',  display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true  },
  ],
  throwOnError: false,
};

const LatexText = ({ text, style: styleProp, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = text || '';
    loadKaTeX().then(() => {
      if (!ref.current || !window.renderMathInElement) return;
      window.renderMathInElement(ref.current, KATEX_OPTS);
    });
  }, [text]);
  return <span ref={ref} className={className} style={styleProp} />;
};

const NaturalImage = ({ src, alt, maxWidth = '100%', maxHeight = 340, radius = 6 }) => {
  const [status, setStatus] = useState('loading');
  useEffect(() => { if (src) setStatus('loading'); }, [src]);

  if (!src || typeof src !== 'string' || !src.trim()) return null;

  return (
    <div style={{ display: 'block', width: 'fit-content', maxWidth: '100%' }}>
      {status === 'loading' && (
        <div style={{
          position: 'relative', width: 200, height: 72,
          borderRadius: radius, background: '#f3f4f6', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
            animation: 'qd-shimmer 1.2s ease-in-out infinite',
          }} />
        </div>
      )}

      {status === 'error' && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', border: '1.5px dashed #e5e7eb',
          borderRadius: radius, background: '#fafafa',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15 16 10 5 21"/>
          </svg>
          <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>Image unavailable</span>
        </div>
      )}

      <img
        src={src} alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{
          display: status === 'error' ? 'none' : (status === 'loading' ? 'none' : 'block'),
          width: 'auto', height: 'auto',
          maxWidth, maxHeight,
          objectFit: 'contain',
          borderRadius: radius,
          animation: status === 'loaded' ? 'qd-fadein 0.25s ease both' : 'none',
        }}
      />
    </div>
  );
};

const LETTERS  = ['A', 'B', 'C', 'D', 'E', 'F'];
const BLUE     = '#2563eb';
const BLU_BG   = '#eff6ff';
const BLU_RING = 'rgba(37,99,235,0.11)';

const GREEN = '#10b981';
const GRN_BG = '#d1fae5';
const GRN_RING = 'rgba(16, 185, 129, 0.11)';

const RED = '#ef4444';
const RED_BG = '#fee2e2';
const RED_RING = 'rgba(239, 68, 68, 0.11)';

const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;

export default function PracticeModeOverlay({ 
    questions, 
    subject,
    chapterName,
    onClose, 
    isDark,
    bookmarks = [],
    onToggleBookmark = () => {}
}) {
    useEffect(() => { injectGlobalStyles(); }, []);

    const [batchStart, setBatchStart] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timer, setTimer] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmQuit, setShowConfirmQuit] = useState(false);

    const batchEnd = Math.min(batchStart + 5, questions.length);
    const batchLength = batchEnd - batchStart;
    const batchIndex = currentIndex - batchStart;

    const currentQ = questions[currentIndex];
    const isCurrentAnswered = !!answers[currentQ?._id];

    // Timer effect
    useEffect(() => {
        if (isSubmitting || isCurrentAnswered) return;
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [currentIndex, isSubmitting, isCurrentAnswered]);

    const handleOptionSelect = async (optIndex) => {
        if (answers[currentQ._id]) return; // already answered
        setAnswers(prev => ({
            ...prev,
            [currentQ._id]: {
                option: optIndex,
                timeTaken: timer
            }
        }));

        const payload = {
            subjectId: subject?._id || currentQ.subjectId,
            chapterId: currentQ.chapterId,
            topicId: currentQ.topicId,
            questionId: currentQ._id,
            isCorrect: optIndex === currentQ.correctOption,
            timeTaken: timer
        };

        try {
            await api.post('/quiz/submit-practice-question', payload);
        } catch (err) {
            console.error("Failed to submit individual question:", err);
        }
    };

    const handleNext = () => {
        if (!answers[currentQ._id]) {
            // Unattempted, optionally submit -1 here if we wanted to record skips,
            // but for practice, we usually just record actual selections.
            setAnswers(prev => ({
                ...prev,
                [currentQ._id]: { option: -1, timeTaken: timer }
            }));
        }
        
        if (currentIndex < batchEnd - 1) {
            setCurrentIndex(i => i + 1);
            setTimer(0);
        } else {
            // At the end of the batch
            if (batchEnd < questions.length) {
                // Load next 5 questions
                setBatchStart(batchEnd);
                setCurrentIndex(batchEnd);
                setTimer(0);
            } else {
                onClose(); // Exit without permission when reaching the end
            }
        }
    };

    const handlePrev = () => {
        if (currentIndex > batchStart) {
            setCurrentIndex(i => i - 1);
            setTimer(0);
        } else if (batchStart > 0) {
            const newBatchStart = Math.max(0, batchStart - 5);
            setBatchStart(newBatchStart);
            setCurrentIndex(batchStart - 1);
            setTimer(0);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };



    if (!currentQ) return null;
    const hasQImage = isNonEmpty(currentQ.questionImage);
    const anyOptHasImage = currentQ.options?.some(o => isNonEmpty(o.image));

    let nextButtonText = 'Next';
    if (currentIndex === batchEnd - 1) {
        if (batchEnd < questions.length) {
            nextButtonText = 'Next 5';
        } else {
            nextButtonText = 'Finish';
        }
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col qd-root" style={{ background: isDark ? '#0E131F' : '#fff' }}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-4 ${isDark ? 'bg-[#0E131F]' : 'bg-white'} border-b-0`}>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowConfirmQuit(true)} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isDark ? 'bg-[#1E293B] text-[#94A3B8]' : 'bg-slate-100 text-slate-600'}`}>
                        <X size={20} />
                    </button>
                    <div>
                        <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Practice Mode</h2>
                        <p className={`text-xs ${isDark ? 'text-[#8492A6]' : 'text-slate-500'}`}>{currentIndex + 1} of {questions.length}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-[#1E293B] text-[#94A3B8]' : 'bg-slate-100 text-slate-600'}`}>
                    <Clock size={14} />
                    <span className="text-sm font-bold font-mono tracking-wider">{formatTime(timer)}</span>
                </div>
            </div>

            {/* Segmented Horizontal Step Progress Bar */}
            <div className={`px-4 pb-3 flex gap-1.5 z-40 ${isDark ? 'bg-[#0E131F]' : 'bg-white'} border-b ${isDark ? 'border-[#1E293B]' : 'border-slate-200'}`}>
                {Array.from({ length: batchLength }).map((_, idx) => {
                    const isCompleted = idx < batchIndex;
                    const isActive = idx === batchIndex;
                    return (
                        <div
                            key={idx}
                            className={`flex-1 h-1.5 rounded-full overflow-hidden relative bg-slate-200`}
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    width: isActive || isCompleted ? '100%' : '0%'
                                }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="h-full rounded-full bg-[#3B82F6]"
                            />
                        </div>
                    );
                })}
            </div>

            {/* Question Area - Borrowed from QuestionDisplay */}
            <div className="qd-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(14px, 3vw, 26px)', paddingBottom: '90px', background: 'transparent' }}>
                {/* ── Question ── */}
                <div className="qd-entry" style={{ marginBottom: 24 }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                        marginBottom: 24,
                    }}>
                        <div style={{
                            fontSize: 'clamp(16px, 2.5vw, 17px)', fontWeight: 600,
                            lineHeight: 1.6, color: isDark ? '#E2E8F0' : '#1E293B',
                            overflowX: 'auto', overflowY: 'visible', flex: 1
                        }}>
                            Q{currentIndex + 1}. <LatexText text={currentQ.questionText || currentQ.question} />
                        </div>
                        <button 
                            onClick={() => onToggleBookmark(currentQ)}
                            style={{
                                flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '8px', borderRadius: '50%',
                                background: bookmarks.includes(currentQ._id)
                                    ? (isDark ? '#312E81' : '#EEF2FF')
                                    : (isDark ? '#1E293B' : '#F1F5F9'),
                                color: bookmarks.includes(currentQ._id) ? '#4F46E5' : (isDark ? '#94A3B8' : '#64748B'),
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarks.includes(currentQ._id) ? '#4F46E5' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>
                    </div>

                    {hasQImage && (
                        <div style={{ marginTop: 14 }}>
                            <NaturalImage
                                src={currentQ.questionImage}
                                alt="Question figure"
                                maxWidth="100%"
                                maxHeight={340}
                                radius={6}
                            />
                        </div>
                    )}
                </div>

                {/* ── Options ── */}
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {currentQ.options?.map((opt, i) => {
                            const isAnswered = !!answers[currentQ._id];
                            const ans = answers[currentQ._id];
                            
                            let isCorrectOpt = i === currentQ.correctOption;
                            let isChosenOpt = isAnswered && ans.option === i;
                            
                            const hasImage = isNonEmpty(opt.image);
                            const hasText = isNonEmpty(opt.text);
                            
                            let border = isDark ? '#334155' : '#F1F5F9';
                            let bg = isDark ? '#1E293B' : '#fff';
                            let textCol = isDark ? '#E2E8F0' : '#334155';
                            let letterBg = isDark ? '#334155' : '#F1F5F9';
                            let letterCol = isDark ? '#94A3B8' : '#94A3B8';

                            if (isAnswered) {
                                if (isCorrectOpt) {
                                    border = '#16A34A'; bg = '#F0FDF4'; textCol = '#16A34A'; letterBg = '#16A34A'; letterCol = '#fff';
                                } else if (isChosenOpt) {
                                    border = '#DC2626'; bg = '#FEF2F2'; textCol = '#DC2626'; letterBg = '#DC2626'; letterCol = '#fff';
                                }
                            }

                            return (
                                <button
                                    key={i}
                                    className={`qd-option qd-entry`}
                                    onClick={() => handleOptionSelect(i)}
                                    disabled={isAnswered}
                                    style={{
                                        animationDelay: `${i * 0.04}s`,
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: hasImage && !hasText ? 'column' : 'row',
                                        alignItems: hasImage && !hasText ? 'center' : 'flex-start',
                                        gap: hasImage && !hasText ? 6 : 12,
                                        padding: hasImage ? 12 : 16,
                                        border: `1px solid ${border}`,
                                        borderRadius: 12,
                                        background: bg,
                                        textAlign: 'left',
                                        cursor: isAnswered ? 'default' : 'pointer',
                                    }}
                                >
                                    <div style={{ flexShrink: 0 }}>
                                        <div style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: '50%',
                                            background: letterBg,
                                            color: letterCol,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 800,
                                            transition: 'background 0.14s, border-color 0.14s',
                                        }}>
                                            {LETTERS[i]}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {hasImage && (
                                            <div style={{ marginBottom: hasText ? 8 : 0 }}>
                                                <NaturalImage
                                                    src={opt.image}
                                                    alt={`Option ${LETTERS[i]}`}
                                                    maxWidth="100%"
                                                    maxHeight={180}
                                                    radius={5}
                                                />
                                            </div>
                                        )}

                                        {hasText && (
                                            <span style={{
                                                flex: 1,
                                                fontSize: 'clamp(14px, 2.2vw, 15px)',
                                                fontWeight: (isChosenOpt || isCorrectOpt) ? 700 : 500,
                                                color: textCol,
                                                lineHeight: 1.7,
                                                overflowX: 'auto', overflowY: 'visible',
                                            }}>
                                                <LatexText text={opt.text} />
                                            </span>
                                        )}

                                        {!hasImage && !hasText && (
                                            <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                                                Option {LETTERS[i]}
                                            </span>
                                        )}
                                    </div>

                                    {isAnswered && (isCorrectOpt || isChosenOpt) && (
                                        <div style={{ flexShrink: 0 }}>
                                            {isCorrectOpt ? <CheckCircle2 size={18} color="#16A34A" /> : <X size={18} color="#DC2626" />}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {isCurrentAnswered && currentQ.explanation && (
                        <div style={{ marginTop: 24, background: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 16, padding: 20, border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#4F46E5' }}>
                                <CheckCircle2 size={16} />
                                <span style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase' }}>Explanation</span>
                            </div>
                            <div style={{ fontSize: 14, lineHeight: 1.6, color: isDark ? '#CBD5E1' : '#475569' }}>
                                <LatexText text={currentQ.explanation} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Flat Bottom Navigation Bar */}
            <div className={`fixed bottom-0 left-0 right-0 p-5 z-50 flex gap-4 bg-transparent pointer-events-none`}>
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`flex-1 py-3 border rounded-[12px] font-semibold text-[16px] transition-all active:scale-[0.98] pointer-events-auto ${
                        currentIndex === 0 ? 'opacity-50 cursor-not-allowed ' : ''
                    }${
                        isDark
                            ? 'border-[#2A3441] text-white hover:bg-white/10 bg-[#0E131F]/90 backdrop-blur-md'
                            : 'border-slate-200 bg-white/90 backdrop-blur-md text-[#475569] hover:bg-slate-50'
                    }`}
                >
                    Prev
                </button>
                <button
                    onClick={handleNext}
                    disabled={isSubmitting || !isCurrentAnswered}
                    className={`flex-1 py-3 rounded-[12px] font-semibold text-[16px] transition-all pointer-events-auto flex items-center justify-center gap-2 ${
                        !isCurrentAnswered || isSubmitting
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                            : 'bg-[#4F46E5] text-white active:scale-[0.98] hover:bg-[#4338CA] shadow-[0_4px_10px_rgba(79,70,229,0.2)]'
                    }`}
                >
                    {nextButtonText}
                </button>
            </div>

            {/* ── CONFIRM QUIT MODAL ── */}
            {showConfirmQuit && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)', padding: 20 }}>
                    <div style={{ background: isDark ? '#1E293B' : '#fff', borderRadius: 20, padding: 24, maxWidth: 320, width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: 50, height: 50, background: isDark ? '#451a1a' : '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <AlertTriangle color="#EF4444" size={24} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#F8FAFC' : '#111827', margin: '0 0 8px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quit Practice?</h3>
                        <p style={{ fontSize: 14, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 24, lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your current practice progress for this session will be lost.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowConfirmQuit(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: isDark ? '#334155' : '#F1F5F9', border: 'none', color: isDark ? '#CBD5E1' : '#64748B', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Keep Going</button>
                            <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#EF4444', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
