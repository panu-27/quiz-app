import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const TYPE_LABELS = {
  tab_switch:  'Tab Switch / Window Change',
  window_blur: 'Window Focus Lost',
  visibility:  'Screen Minimized or Hidden',
  devtools:    'Developer Tools Accessed',
  right_click: 'Prohibited Right-Click',
  copy_paste:  'Prohibited Copy/Paste Attempt',
};

const ViolationModal = ({ violationCount, maxViolations, violationType, onDismiss }) => {
  const btnRef     = useRef(null);
  const livesLeft  = maxViolations - violationCount;
  const isLast     = livesLeft === 0;
  const typeLabel  = TYPE_LABELS[violationType] || 'Unfair Means Attempt';

  // Auto-focus dismiss button
  useEffect(() => {
    const t = setTimeout(() => btnRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 font-sans select-none">
      <div
        className="bg-white w-full max-w-sm shadow-2xl"
        style={{ borderTop: `4px solid ${isLast ? '#ef4444' : '#f97316'}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <span className="text-[13px] font-bold text-gray-800 uppercase tracking-tight">
            Security Violation
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
              style={{ background: isLast ? '#ef4444' : '#f97316' }}
            >
              {violationCount}/{maxViolations}
            </span>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Incident type */}
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-sm text-white text-sm font-bold"
              style={{ background: isLast ? '#ef4444' : '#f97316' }}
            >
              !
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-700 mb-0.5">{typeLabel}</p>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                {isLast
                  ? 'This is your FINAL warning. Any further violation will cause your exam to be automatically submitted.'
                  : 'Leaving the exam window is recorded as a violation. Please remain on this screen until your exam is complete.'
                }
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex gap-1">
              {Array.from({ length: maxViolations }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-sm transition-colors"
                  style={{
                    background: i < violationCount
                      ? (isLast ? '#ef4444' : '#f97316')
                      : '#e5e7eb',
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400">
              {livesLeft > 0 ? `${livesLeft} warning${livesLeft > 1 ? 's' : ''} remaining` : 'No warnings remaining'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4">
          <button
            ref={btnRef}
            onClick={onDismiss}
            className="w-full py-2.5 text-[13px] font-bold text-white rounded-sm transition-colors"
            style={{ background: isLast ? '#ef4444' : '#337ab7' }}
            onMouseEnter={e => e.currentTarget.style.background = isLast ? '#c9302c' : '#286090'}
            onMouseLeave={e => e.currentTarget.style.background = isLast ? '#ef4444' : '#337ab7'}
          >
            {isLast ? 'I Understand — Return to Exam' : 'Resume Exam'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViolationModal;
