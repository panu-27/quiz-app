import React from 'react';

/*
  Sidebar design matching the CET reference screenshot:
  - Top: answered count
  - Grid: numbered boxes with color-coded bottom bar
  - Legend: small boxes with labels
  - Violation: simple bar, no skulls/emojis
  - Finish Test button
*/

const QuestionSidebar = ({
  questions = [],
  currentIndex = 0,
  answers = {},
  marked = {},
  visited = {},
  setIndex,
  onFinish,
  violationCount = 0,
  maxViolations = 5,
}) => {
  const total = questions.length;

  const answeredCount = questions.filter(q =>
    answers[q.questionId] !== undefined
  ).length;

  const answeredAndMarkedCount = questions.filter(q =>
    answers[q.questionId] !== undefined && marked[q.questionId]
  ).length;

  const markedOnlyCount = Object.keys(marked).filter(id =>
    questions.some(q => q.questionId === id) && answers[id] === undefined
  ).length;

  const notAnsweredVisitedCount = questions.filter(q =>
    visited[q.questionId] &&
    answers[q.questionId] === undefined &&
    !marked[q.questionId]
  ).length;

  const notVisitedCount = questions.filter(q =>
    !visited[q.questionId] &&
    answers[q.questionId] === undefined &&
    !marked[q.questionId]
  ).length;

  const livesLeft = maxViolations - violationCount;

  return (
    <aside className="w-[280px] flex flex-col h-full bg-white select-none" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Top: answered count ── */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between bg-white">
        <span className="text-[12px] font-semibold text-gray-700">
          {answeredCount}/{total} Answered
        </span>
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      </div>

      {/* ── Question grid ── */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#f5f5f5]">
        <div className="grid grid-cols-6 gap-1.5">
          {questions.map((item, i) => {
            const id         = item.questionId;
            const hasAnswered = answers[id] !== undefined;
            const hasMarked   = marked[id];
            const hasVisited  = visited[id];
            const isActive    = currentIndex === i;

            // Color logic matching CET reference
            let barColor = '#adb5bd'; // not visited — gray

            if (hasMarked && hasAnswered)      barColor = '#f0ad4e'; // answered + marked — yellow/orange
            else if (hasMarked)                barColor = '#8e44ad'; // marked only — purple
            else if (hasAnswered)              barColor = '#5cb85c'; // answered — green
            else if (isActive || hasVisited)   barColor = '#d9534f'; // not answered, visited — red

            return (
              <button
                key={id}
                onClick={() => setIndex(i)}
                className="relative flex flex-col items-center justify-center bg-white border border-gray-300 shadow-sm transition-all"
                style={{
                  height: 38,
                  outline: isActive ? '2px solid #337ab7' : 'none',
                  outlineOffset: -1,
                }}
              >
                <span className="text-[11px] font-bold text-gray-700">{i + 1}</span>
                <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: barColor }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white space-y-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <LegendItem count={answeredCount}           label="Answered"            color="#5cb85c" />
          <LegendItem count={notAnsweredVisitedCount} label="Not Answered"         color="#d9534f" />
          <LegendItem count={markedOnlyCount}         label="Marked for Review"    color="#8e44ad" />
          <LegendItem count={answeredAndMarkedCount}  label="Answered & Marked"    color="#f0ad4e" />
        </div>
        <LegendItem count={notVisitedCount} label="Not Visited" color="#adb5bd" />

        {/* ── Violation bar ── */}
        {violationCount > 0 && (
          <div className="mt-1 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Violations</span>
              <span
                className="text-[11px] font-bold"
                style={{ color: livesLeft === 0 ? '#ef4444' : livesLeft <= 2 ? '#f97316' : '#eab308' }}
              >
                {violationCount}/{maxViolations}
              </span>
            </div>
            {/* Simple segmented bar */}
            <div className="flex gap-1">
              {Array.from({ length: maxViolations }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-sm"
                  style={{
                    background: i < violationCount
                      ? (livesLeft === 0 ? '#ef4444' : livesLeft <= 2 ? '#f97316' : '#eab308')
                      : '#e5e7eb',
                  }}
                />
              ))}
            </div>
            {livesLeft === 0 && (
              <p className="text-[9px] text-red-500 font-bold mt-1 uppercase tracking-wide">
                Next violation = auto submit
              </p>
            )}
          </div>
        )}

        {/* ── Finish button ── */}
        <button
          onClick={onFinish}
          className="w-full mt-2 py-2 text-white text-[13px] font-bold rounded-sm transition-colors"
          style={{ background: '#d9534f' }}
          onMouseEnter={e => e.currentTarget.style.background = '#c9302c'}
          onMouseLeave={e => e.currentTarget.style.background = '#d9534f'}
        >
          Finish Test
        </button>
      </div>
    </aside>
  );
};

const LegendItem = ({ count, label, color }) => (
  <div className="flex items-center gap-2">
    <div
      className="relative flex items-center justify-center bg-white border border-gray-300 shrink-0"
      style={{ width: 32, height: 26 }}
    >
      <span className="text-[10px] font-bold text-gray-700 z-10">{count}</span>
      <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ background: color }} />
    </div>
    <span className="text-[10px] text-gray-500 font-medium leading-tight">{label}</span>
  </div>
);

export default QuestionSidebar;
