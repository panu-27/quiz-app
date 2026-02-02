import React from 'react';

const ExamFooter = ({ onBack, onNext, onMark, onClear, isFirst, isMarked }) => {
  return (
    <footer className="h-14 md:h-16 border-t border-gray-300 flex items-center justify-between px-2 md:px-6 bg-[#f5f5f5] shrink-0 select-none">
      
      {/* Left Side: Mark and Clear */}
      <div className="flex gap-1 md:gap-2">
        <button 
          onClick={onMark} 
          className="bg-white border border-gray-400 text-gray-700 px-2 md:px-4 py-2 text-[10px] md:text-[11px] font-bold shadow-sm hover:bg-gray-50 active:bg-gray-100 whitespace-nowrap"
        >
          {/* Responsive Text Logic */}
          <span className="md:hidden">{isMarked ? 'UNMARK' : 'MARK'}</span>
          <span className="hidden md:inline">{isMarked ? 'UNMARK' : 'MARK FOR REVIEW & NEXT'}</span>
        </button>
        
        <button 
          onClick={onClear} 
          className="bg-white border border-gray-400 text-gray-700 px-2 md:px-4 py-2 text-[10px] md:text-[11px] font-bold shadow-sm hover:bg-gray-50 whitespace-nowrap"
        >
          <span className="md:hidden">CLEAR</span>
          <span className="hidden md:inline">CLEAR RESPONSE</span>
        </button>
      </div>

      {/* Right Side: Back and Save & Next */}
      <div className="flex gap-1 md:gap-2">
        <button 
          onClick={onBack} 
          disabled={isFirst} 
          className={`px-3 md:px-6 py-2 text-[10px] md:text-[11px] font-bold border border-gray-400 shadow-sm transition-opacity whitespace-nowrap
            ${isFirst ? 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          <span className="md:hidden">PREV</span>
          <span className="hidden md:inline">PREVIOUS</span>
        </button>

        <button 
          onClick={onNext} 
          className="bg-[#337ab7] border border-[#2e6da4] text-white px-4 md:px-8 py-2 text-[10px] md:text-[11px] font-bold shadow-sm hover:bg-[#286090] transition-colors whitespace-nowrap"
        >
          <span className="md:hidden">NEXT</span>
          <span className="hidden md:inline">SAVE & NEXT</span>
        </button>
      </div>
    </footer>
  );
};

export default ExamFooter;