import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
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
    isDark
}) {
    useEffect(() => { injectGlobalStyles(); }, []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timer, setTimer] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [resultData, setResultData] = useState(null);

    const currentQ = questions[currentIndex];
    const isCurrentAnswered = !!answers[currentQ?._id];

    // Timer effect
    useEffect(() => {
        if (submitted || isSubmitting || isCurrentAnswered) return;
        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [currentIndex, submitted, isSubmitting, isCurrentAnswered]);

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
            subjectId: subject?._id,
            subjectName: subject?.name || 'Practice',
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
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setTimer(0);
        } else {
            setResultData(true);
            setSubmitted(true);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (submitted && resultData) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6" style={{ background: isDark ? '#0B101A' : '#F8FAFC' }}>
                <div className={`w-full max-w-sm rounded-2xl p-6 shadow-lg text-center ${isDark ? 'bg-[#161C26]' : 'bg-white'}`}>
                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Practice Finished!</h2>
                    <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No questions left. Keep practicing to clear your mistakes!</p>
                    <button onClick={onClose} className="w-full py-3 bg-[#2563EB] text-white rounded-xl font-bold active:scale-95 transition-all">
                        Back to Chapter
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQ) return null;
    const hasQImage = isNonEmpty(currentQ.questionImage);
    const anyOptHasImage = currentQ.options?.some(o => isNonEmpty(o.image));

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col qd-root" style={{ background: '#fff' }}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-4 border-b bg-white border-slate-200`}>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all bg-slate-100 text-slate-600`}>
                        <X size={20} />
                    </button>
                    <div>
                        <h2 className={`text-sm font-bold text-slate-800`}>Practice Mode</h2>
                        <p className="text-xs text-slate-400">{currentIndex + 1} of {questions.length} • {formatTime(timer)}</p>
                    </div>
                </div>
                <button onClick={handleNext} disabled={isSubmitting} className="flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm bg-[#2563EB] text-white active:scale-95 transition-all">
                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
                </button>
            </div>

            {/* Question Area - Borrowed from QuestionDisplay */}
            <div className="qd-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(14px, 3vw, 26px)' }}>
                {/* ── Question ── */}
                <div className="qd-entry" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: '#f0f9ff', border: '1px solid #bae6fd',
                            borderRadius: 20, padding: '3px 10px 3px 4px',
                        }}>
                            <span style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: BLUE, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9, fontWeight: 800,
                            }}>Q</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0369a1' }}>
                                {currentIndex + 1} of {questions.length}
                            </span>
                        </span>

                        {subject && (
                            <span style={{
                                fontSize: 11, fontWeight: 500, color: '#6b7280',
                                background: '#f9fafb', border: '1px solid #e5e7eb',
                                borderRadius: 20, padding: '3px 10px',
                            }}>
                                {subject.name}
                            </span>
                        )}
                    </div>

                    <div style={{
                        fontSize: 'clamp(16px, 2.5vw, 18px)', fontWeight: 500,
                        lineHeight: 1.8, color: '#111827',
                        overflowX: 'auto', overflowY: 'visible',
                    }}>
                        <LatexText text={currentQ.questionText || currentQ.question} />
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1.1, textTransform: 'uppercase' }}>
                            Choose one answer
                        </span>
                        <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
                    </div>

                    <div className={anyOptHasImage ? 'qd-opts-grid' : 'qd-opts-list'}>
                        {currentQ.options?.map((opt, i) => {
                            const isAnswered = !!answers[currentQ._id];
                            const ans = answers[currentQ._id];
                            
                            // Color logic based on practice correctness
                            let isCorrectOpt = i === currentQ.correctOption;
                            let isChosenOpt = isAnswered && ans.option === i;
                            
                            let boxBorder = '#e5e7eb';
                            let boxBg = '#fff';
                            let boxRing = '0 1px 2px rgba(0,0,0,0.04)';
                            let iconStroke = '#d1d5db';
                            let iconBg = '#f9fafb';
                            let iconText = '#6b7280';
                            let mainTextColor = '#374151';

                            if (isAnswered) {
                                if (isCorrectOpt) {
                                    boxBorder = GREEN; boxBg = GRN_BG; 
                                    boxRing = `0 0 0 3px ${GRN_RING}, 0 1px 3px rgba(0,0,0,0.05)`;
                                    iconStroke = GREEN; iconBg = GREEN; iconText = '#fff';
                                    mainTextColor = '#065f46';
                                } else if (isChosenOpt && !isCorrectOpt) {
                                    boxBorder = RED; boxBg = RED_BG; 
                                    boxRing = `0 0 0 3px ${RED_RING}, 0 1px 3px rgba(0,0,0,0.05)`;
                                    iconStroke = RED; iconBg = RED; iconText = '#fff';
                                    mainTextColor = '#991b1b';
                                }
                            }

                            const hasImg  = isNonEmpty(opt.image);
                            const hasText = isNonEmpty(opt.text);
                            const imgCard = hasImg && !hasText;

                            return (
                                <div
                                    key={i}
                                    className={`qd-option qd-entry`}
                                    onClick={() => handleOptionSelect(i)}
                                    style={{
                                        animationDelay: `${i * 0.04}s`,
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: imgCard ? 'column' : 'row',
                                        alignItems: 'flex-start',
                                        gap: imgCard ? 6 : 11,
                                        padding: hasImg ? '11px 12px' : '9px 13px',
                                        border: `1.5px solid ${boxBorder}`,
                                        borderRadius: 10,
                                        background: boxBg,
                                        boxShadow: boxRing,
                                        cursor: isAnswered ? 'default' : 'pointer',
                                    }}
                                >
                                    {/* Letter circle */}
                                    <div style={{ flexShrink: 0 }}>
                                        <div style={{
                                            width: imgCard ? 22 : 27,
                                            height: imgCard ? 22 : 27,
                                            borderRadius: '50%',
                                            border: `1.5px solid ${iconStroke}`,
                                            background: iconBg,
                                            color: iconText,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: imgCard ? 10 : 12,
                                            fontWeight: 700,
                                            transition: 'background 0.14s, border-color 0.14s',
                                        }}>
                                            {LETTERS[i]}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {hasImg && (
                                            <div style={{ marginBottom: hasText ? 8 : 0 }}>
                                                <NaturalImage
                                                    src={opt.image}
                                                    alt={`Option ${LETTERS[i]}`}
                                                    maxWidth="100%"
                                                    maxHeight={160}
                                                    radius={5}
                                                />
                                            </div>
                                        )}

                                        {hasText && (
                                            <div style={{
                                                fontSize: 'clamp(15px, 2.2vw, 17px)',
                                                fontWeight: isAnswered && (isCorrectOpt || isChosenOpt) ? 600 : 500,
                                                color: mainTextColor,
                                                lineHeight: 1.7,
                                                overflowX: 'auto', overflowY: 'visible',
                                            }}>
                                                <LatexText text={opt.text} />
                                            </div>
                                        )}

                                        {!hasImg && !hasText && (
                                            <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                                                Option {LETTERS[i]}
                                            </span>
                                        )}
                                    </div>

                                    {/* Icons */}
                                    {isAnswered && (isCorrectOpt || isChosenOpt) && (
                                        <div style={{
                                            flexShrink: 0,
                                            ...(imgCard
                                                ? { position: 'absolute', top: 8, right: 8 }
                                                : { alignSelf: 'center' }),
                                        }}>
                                            {isCorrectOpt ? (
                                                <svg width="17" height="17" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="12" fill={GREEN}/>
                                                    <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2.3"
                                                        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                                </svg>
                                            ) : (
                                                <svg width="17" height="17" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="12" fill={RED}/>
                                                    <path d="M7 7l10 10m0-10L7 17" stroke="#fff" strokeWidth="2.3"
                                                        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {isCurrentAnswered && currentQ.explanation && (
                        <div className={`mt-6 p-4 rounded-xl text-sm border-l-4 border-blue-500 bg-blue-50 text-slate-700`}>
                            <p className="font-bold mb-2 flex items-center gap-1">
                                <CheckCircle2 size={16} className="text-blue-500" /> Explanation
                            </p>
                            <LatexText text={currentQ.explanation} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
