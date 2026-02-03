import React from 'react';

const QuestionDisplay = ({ question, index, currentAnswer, setAnswer, activeSubject }) => {
  if (!question) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden font-sans">
      {/* 1. Header with Correct Subject Sync */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
        <span>Q{index + 1} of 50</span>
        <span className="text-gray-300">|</span>
        {/* FIX: Now uses the activeSubject from parent state */}
        <span>MHT-CET {activeSubject || question.subjectId?.name || "PHYSICS"}</span>
      </div>

      {/* 2. Main Question Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 min-h-0">
        <div className="mb-8">
          <div className="text-[15px] md:text-[16px] text-gray-900 leading-relaxed font-normal">
            <p className="whitespace-pre-wrap">{question.questionText}</p>
          </div>
        </div>

        {/* 3. Options Section */}
        <div className="space-y-0 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-bold py-3 uppercase tracking-wider bg-gray-50/50 px-3 -mx-3 mb-2 rounded-sm">
            Choose one from below options
          </p>
          
          {question.options?.map((opt, i) => {
  const isSelected = currentAnswer === i;
  return (
    <div 
      key={i} 
      onClick={() => setAnswer(i)} 
      className={`group flex items-center gap-4 py-3 px-4 cursor-pointer border-b border-gray-50 transition-colors
        ${isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
    >
      <div className="shrink-0">
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
      <div className="text-[14px] text-gray-700 font-medium w-6 uppercase">
        {String.fromCharCode(65 + i)}
      </div>
      <div className={`text-[14px] flex-1 ${isSelected ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
        {/* FIX: Render the option string directly */}
        {opt} 
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