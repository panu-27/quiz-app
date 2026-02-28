import React, { useEffect, useRef } from 'react';

// Dynamically load KaTeX if not already loaded
const loadKaTeX = (() => {
  let loaded = false;
  let loading = null;
  return () => {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve) => {
      // Load KaTeX CSS
      if (!document.querySelector('link[href*="katex"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
        document.head.appendChild(link);
      }
      // Load KaTeX JS
      if (!document.querySelector('script[src*="katex.min.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
        script.onload = () => {
          // Load auto-render extension
          const script2 = document.createElement('script');
          script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
          script2.onload = () => { loaded = true; resolve(); };
          document.head.appendChild(script2);
        };
        document.head.appendChild(script);
      } else {
        loaded = true;
        resolve();
      }
    });
    return loading;
  };
})();

// Hook to render LaTeX inside a DOM ref
const useLatex = (text) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !text) return;
    loadKaTeX().then(() => {
      if (!ref.current) return;
      if (window.renderMathInElement) {
        window.renderMathInElement(ref.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
        });
      }
    });
  }, [text]);

  return ref;
};

// Component to render text with LaTeX
const LatexText = ({ text, className = '' }) => {
  const ref = useLatex(text);
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
};

const QuestionDisplay = ({ question, index, currentAnswer, setAnswer, activeSubject, totalQuestions }) => {
  if (!question) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden font-sans">
      {/* 1. Header with dynamic counts */}
  

      {/* 2. Main Question Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 min-h-0">
        <div className="mb-8">
          {/* Question image */}
          {question.questionImage ? (
            <div className="mb-4">
              <img
                src={question.questionImage}
                alt="Question"
                className="max-w-full max-h-64 object-contain rounded border border-gray-100"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ) : null}

          <div className="text-[15px] md:text-[16px] text-gray-900 leading-relaxed font-normal">
            <LatexText text={question.questionText} className="whitespace-pre-wrap" />
          </div>
        </div>

        {/* 3. Options Section */}
        <div className="space-y-0 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-bold py-3 uppercase tracking-wider bg-gray-50/50 px-3 -mx-3 mb-2 rounded-sm">
            Choose one from below options
          </p>

          {question.options?.map((opt, i) => {
            const isSelected = currentAnswer === i;
            const hasImage = opt.isImageOption && opt.image;
            const hasText = opt.text && opt.text.trim().length > 0;

            return (
              <div
                key={i}
                onClick={() => setAnswer(i)}
                className={`group flex items-start gap-4 py-3 px-4 cursor-pointer border-b border-gray-50 transition-colors
                  ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
              >
                {/* Option radio circle */}
                <div className="shrink-0 mt-0.5">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white group-hover:border-gray-400'
                  }`}>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* Option letter */}
                <div className="text-[14px] text-gray-700 font-medium w-6 uppercase shrink-0 mt-0.5">
                  {String.fromCharCode(65 + i)}
                </div>

                {/* Option content */}
                <div className={`text-[14px] flex-1 ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                  {hasImage ? (
                    <div className="flex flex-col gap-2">
                      <img
                        src={opt.image}
                        alt={`Option ${String.fromCharCode(65 + i)}`}
                        className="max-h-40 max-w-xs object-contain rounded border border-gray-100"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      {hasText && (
                        <LatexText text={opt.text} className="text-[13px]" />
                      )}
                    </div>
                  ) : hasText ? (
                    <LatexText text={opt.text} />
                  ) : (
                    <span className="text-gray-400 italic text-[12px]">Option {String.fromCharCode(65 + i)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-2 border-t border-gray-100 shrink-0">
        <span className="text-[10px] text-gray-400 font-medium italic">
          All choices are mutually exclusive. Click an option to select your answer.
        </span>
      </div>
    </div>
  );
};

export default QuestionDisplay;