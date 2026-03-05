import React from 'react';

const ExamFooter = ({ onBack, onNext, onMark, onClear, isFirst, isMarked }) => {
  return (
    <footer
      className="shrink-0 flex items-center justify-between border-t border-gray-300 bg-[#f5f5f5] select-none"
      style={{ height: 52, paddingLeft: 12, paddingRight: 12 }}
    >
      {/* Left: Clear + Mark */}
      <div className="flex gap-2">
        <button
          onClick={onClear}
          className="border border-gray-400 bg-white text-gray-700 font-semibold text-[11px] px-3 py-1.5 hover:bg-gray-50 transition-colors"
        >
          Clear Answer
        </button>
        <button
          onClick={onMark}
          className="border font-semibold text-[11px] px-3 py-1.5 transition-colors"
          style={isMarked
            ? { background: '#8e44ad', borderColor: '#7d3c98', color: 'white' }
            : { background: 'white', borderColor: '#adb5bd', color: '#555' }
          }
        >
          {isMarked ? 'Unmark Review' : 'Mark for Review'}
        </button>
      </div>

      {/* Right: Back + Save & Next */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={isFirst}
          className="border border-gray-400 font-semibold text-[11px] px-4 py-1.5 transition-colors"
          style={isFirst
            ? { background: '#f0f0f0', color: '#bbb', cursor: 'not-allowed' }
            : { background: 'white', color: '#555' }
          }
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="font-semibold text-[11px] px-5 py-1.5 text-white transition-colors"
          style={{ background: '#337ab7', border: '1px solid #2e6da4' }}
          onMouseEnter={e => e.currentTarget.style.background = '#286090'}
          onMouseLeave={e => e.currentTarget.style.background = '#337ab7'}
        >
          Save & Next →
        </button>
      </div>
    </footer>
  );
};

export default ExamFooter;
