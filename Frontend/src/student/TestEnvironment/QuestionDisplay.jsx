import React, { useEffect, useRef, useState } from 'react';

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

      /* ── Option layouts ──────────────────────────────────────────────
       *
       * .qd-opts-list  → always single column (text-only options)
       * .qd-opts-grid  → single column on mobile, 2×2 on ≥ 520px
       *
       * Rule: if ANY option has an image → use grid class → 2×2 on desktop
       *       if ALL options are text-only → use list class → always single column
       *
       * ─────────────────────────────────────────────────────────────── */
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

// ─── KaTeX loader ─────────────────────────────────────────────────────────────
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

// ─── LatexText ────────────────────────────────────────────────────────────────
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

// ─── NaturalImage ─────────────────────────────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
const LETTERS  = ['A', 'B', 'C', 'D', 'E', 'F'];
const BLUE     = '#2563eb';
const BLU_BG   = '#eff6ff';
const BLU_RING = 'rgba(37,99,235,0.11)';

const isNonEmpty = v => typeof v === 'string' && v.trim().length > 0;

// ─── QuestionDisplay ──────────────────────────────────────────────────────────
const QuestionDisplay = ({
  question,
  index,
  currentAnswer,
  setAnswer,
  activeSubject,
  totalQuestions,
}) => {
  useEffect(() => { injectGlobalStyles(); }, []);

  if (!question) return null;

  const hasQImage = isNonEmpty(question.questionImage);

  // If ANY option has an image → 2×2 grid on desktop, list on mobile
  // If ALL options are text-only → always single column list
  const anyOptHasImage = question.options?.some(o => isNonEmpty(o.image));

  return (
    <div className="qd-root" style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: '#fff', overflow: 'hidden',
    }}>
      <div
        className="qd-scroll"
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(14px, 3vw, 26px)' }}
      >

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
                {index + 1}{totalQuestions ? ` of ${totalQuestions}` : ''}
              </span>
            </span>

            {activeSubject && (
              <span style={{
                fontSize: 11, fontWeight: 500, color: '#6b7280',
                background: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: 20, padding: '3px 10px',
              }}>
                {activeSubject}
              </span>
            )}
          </div>

          <div style={{
            fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 400,
            lineHeight: 1.8, color: '#111827',
            overflowX: 'auto', overflowY: 'visible',
          }}>
            <LatexText text={question.questionText} />
          </div>

          {hasQImage && (
            <div style={{ marginTop: 14 }}>
              <NaturalImage
                src={question.questionImage}
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
            {question.options?.map((opt, i) => {
              const sel     = currentAnswer === i;
              const hasImg  = isNonEmpty(opt.image);
              const hasText = isNonEmpty(opt.text);
              // Pure image card: stack vertically (letter above image)
              const imgCard = hasImg && !hasText;

              return (
                <div
                  key={i}
                  className="qd-option qd-entry"
                  onClick={() => setAnswer(i)}
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: imgCard ? 'column' : 'row',
                    alignItems: 'flex-start',
                    gap: imgCard ? 6 : 11,
                    padding: hasImg ? '11px 12px' : '9px 13px',
                    border: sel ? `1.5px solid ${BLUE}` : '1.5px solid #e5e7eb',
                    borderRadius: 10,
                    background: sel ? BLU_BG : '#fff',
                    boxShadow: sel
                      ? `0 0 0 3px ${BLU_RING}, 0 1px 3px rgba(0,0,0,0.05)`
                      : '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Letter circle */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{
                      width: imgCard ? 22 : 27,
                      height: imgCard ? 22 : 27,
                      borderRadius: '50%',
                      border: sel ? `2px solid ${BLUE}` : '1.5px solid #d1d5db',
                      background: sel ? BLUE : '#f9fafb',
                      color: sel ? '#fff' : '#6b7280',
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
                        fontSize: 'clamp(13px, 1.8vw, 15px)',
                        fontWeight: sel ? 500 : 400,
                        color: sel ? '#1d4ed8' : '#374151',
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

                  {/* Checkmark */}
                  {sel && (
                    <div style={{
                      flexShrink: 0,
                      ...(imgCard
                        ? { position: 'absolute', top: 8, right: 8 }
                        : { alignSelf: 'center' }),
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="12" fill={BLUE}/>
                        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#fff" strokeWidth="2.3"
                          strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 10 }} />
      </div>
    </div>
  );
};

export default QuestionDisplay;