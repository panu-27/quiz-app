import { Clock, Power, Lock, ArrowRight, Menu } from 'lucide-react';
import React from 'react';

/*
  Desktop: ONE single row — logo | subject tabs (scrollable) | answered count | timer | exit
  Mobile:  ONE single row — logo | timer | hamburger menu
  Subject tabs are embedded in the header on desktop (not a separate bar)
*/

const ExamHeader = ({
  timer,
  onMoveToSection,
  isBlock1,
  hasBlock2,
  isBlock2Locked,
  exitApp,
  // Subject tab props
  block1Subjects = [],
  block2Subjects = [],
  activeBlock,
  activeSubject,
  isBlock1Locked,
  navigateToSubject,
  answeredCount,
  totalCount,
  violationCount = 0,
  maxViolations = 5,
  onOpenSidebar,
  qIndex,
  setQIndex,
  currentSubjectQsLength,
}) => {
  const totalSec  = timer ?? 0;
  const mins      = Math.floor(totalSec / 60);
  const secs      = (totalSec % 60).toString().padStart(2, '0');
  const isCrit    = totalSec > 0 && totalSec <= 60;

  const renderSubjectBtn = (blockIdx, sub, subIdx) => {
    const isActive = activeBlock === blockIdx && activeSubject === sub;
    const locked   = (blockIdx === 0 && isBlock1Locked) || (blockIdx === 1 && isBlock2Locked);

    return (
      <button
        key={`${blockIdx}-${sub}`}
        onClick={() => navigateToSubject(blockIdx, sub)}
        title={locked ? (blockIdx === 1 ? 'Locked — Section 1 still running' : 'Section 1 locked') : sub}
        className={`flex items-center gap-1 whitespace-nowrap border font-semibold rounded-full transition-colors
          px-2.5 py-1 text-[11px]
          ${isActive
            ? 'bg-[#337ab7] border-[#2e6da4] text-white'
            : locked
              ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
              : 'bg-transparent border-gray-500 text-gray-300 hover:border-white hover:text-white'
          }`}
      >
        <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0
          ${isActive ? 'bg-white text-[#337ab7]' : locked ? 'bg-gray-600 text-gray-400' : 'bg-gray-600 text-gray-300'}`}>
          {locked ? <Lock size={7} /> : subIdx + 1}
        </span>
        <span>{sub}</span>
      </button>
    );
  };

  return (
    <div className="shrink-0 select-none font-sans relative z-[100]">
      {/* ── Single row ── */}
      <div className="h-12 bg-[#242729] text-white flex items-center px-3 md:px-4 gap-3 border-b border-gray-800 shadow-md">

        {/* LEFT: Logo (desktop) / Logo (mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#337ab7] w-6 h-6 flex items-center justify-center rounded-sm shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span className="text-[13px] font-bold tracking-tight hidden md:block">MHT CET</span>
        </div>

        {/* MIDDLE: Subject tabs — desktop only, scrollable */}
        <div className="hidden md:flex flex-1 items-center gap-1.5 overflow-x-auto min-w-0" style={{ scrollbarWidth: 'none' }}>
          {/* Prev question chevron */}
          <button
            onClick={() => setQIndex(prev => Math.max(0, prev - 1))}
            disabled={qIndex === 0}
            className={`shrink-0 p-1 rounded transition-colors ${qIndex === 0 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-300 hover:text-white'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {block1Subjects.map((sub, i) => renderSubjectBtn(0, sub, i))}

          {/* Block separator + move-to-section button */}
          {hasBlock2 && (
            <>
              <div className="w-px h-5 bg-gray-600 mx-1 shrink-0" />
              {block2Subjects.map((sub, i) => renderSubjectBtn(1, sub, i))}
              {isBlock1 && (
                <button
                  onClick={onMoveToSection}
                  disabled={isBlock2Locked}
                  className={`shrink-0 p-1 rounded transition-colors ${isBlock2Locked ? 'text-gray-600 opacity-50 cursor-not-allowed' : 'text-yellow-400 hover:text-yellow-300'}`}
                  title="Move to Section 2"
                >
                  {isBlock2Locked ? <Lock size={12} /> : <ArrowRight size={14} />}
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setQIndex(prev => Math.min(currentSubjectQsLength - 1, prev + 1))}
            disabled={qIndex === currentSubjectQsLength - 1}
            className={`shrink-0 p-1 rounded transition-colors ${qIndex === currentSubjectQsLength - 1 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-gray-300 hover:text-white'}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* RIGHT: answered count (desktop) + timer + violation badge + exit */}
        <div className="flex items-center gap-2 ml-auto shrink-0">

          {/* Answered count — desktop */}
          <span className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {answeredCount}/{totalCount}
          </span>

          {/* Violation badge — desktop */}
          {violationCount > 0 && (
            <span
              className="hidden md:inline text-white text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: violationCount >= maxViolations ? '#ef4444' : '#f97316' }}
            >
              ⚠ {violationCount}/{maxViolations}
            </span>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[13px] font-bold leading-none
            ${isCrit ? 'bg-red-600 border-red-700 animate-pulse text-white' : 'bg-[#1a1c1e] border-gray-700 text-white'}`}>
            <Clock size={12} className={isCrit ? 'text-white' : 'text-gray-500'} />
            <span>{mins}:{secs}</span>
          </div>

          {/* Hamburger — mobile */}
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-1.5 text-gray-300 hover:text-white border border-gray-600 rounded-sm"
          >
            <Menu size={15} />
          </button>

          {/* Exit */}
          <button onClick={exitApp} className="p-1.5 text-red-400 hover:text-red-300 transition-colors">
            <Power size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;
