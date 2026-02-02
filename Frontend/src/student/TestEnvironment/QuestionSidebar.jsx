import React from 'react';

const QuestionSidebar = ({ questions, currentIndex, answers, marked, visited = {}, setIndex, onFinish }) => {
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  
  // Calculate answered and marked (Yellow)
  const answeredAndMarkedCount = questions.filter(q => 
    answers[q._id] !== undefined && marked[q._id]
  ).length;

  // Calculate pure marked for review (Purple)
  const markedOnlyCount = Object.keys(marked).length - answeredAndMarkedCount;

  // Calculate Not Visited properly
  const notVisitedCount = questions.filter(q => !visited[q._id] && answers[q._id] === undefined && !marked[q._id]).length;

  return (
    <aside className="w-80 lg:w-[280px] flex flex-col h-full border-l border-gray-200 bg-white select-none">
      {/* 1. Status Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[12px] font-semibold text-gray-600">{answeredCount}/{total} Answered</span>
        </div>
      </div>

      {/* 2. Question Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa]">
        <div className="grid grid-cols-6 gap-2">
          {questions.map((item, i) => {
            const id = item._id;
            const hasAnswered = answers[id] !== undefined;
            const hasMarked = marked[id];
            const hasActuallyVisited = visited[id]; // Use the tracked state
            const isActive = currentIndex === i;

            let barColor = "bg-gray-400"; // Default: Gray
            
            if (hasMarked && hasAnswered) {
              barColor = "bg-[#f1c40f]"; // Yellow
            } else if (hasMarked) {
              barColor = "bg-[#8e44ad]"; // Purple
            } else if (hasAnswered) {
              barColor = "bg-[#2ecc71]"; // Green
            } else if (isActive || hasActuallyVisited) {
              // ONLY red if the user has actually landed on this question
              barColor = "bg-[#e74c3c]"; 
            }

            return (
              <button
                key={id}
                onClick={() => setIndex(i)}
                className={`group relative flex flex-col items-center justify-center h-10 w-full bg-white border border-gray-200 shadow-sm transition-all
                  ${isActive ? 'ring-2 ring-red-400 ring-inset' : ''}`}
              >
                <span className={`text-[11px] font-bold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${barColor}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. The Legend Area */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-3">
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          <LegendItem count={answeredCount} label="Answered" color="bg-[#2ecc71]" />
          {/* Legend Not Answered: Filter questions that were visited but have no answer/mark */}
          <LegendItem 
            count={questions.filter(q => visited[q._id] && answers[q._id] === undefined && !marked[q._id]).length} 
            label="Not Answered" 
            color="bg-[#e74c3c]" 
          />
          <LegendItem count={markedOnlyCount} label="Marked for Review" color="bg-[#8e44ad]" />
          <LegendItem count={answeredAndMarkedCount} label="Answered & Marked for Review" color="bg-[#f1c40f]" />
        </div>
        <div className="pt-2">
          <LegendItem count={notVisitedCount} label="Not Visited" color="bg-gray-400" />
        </div>

        <button 
          onClick={onFinish}
          className="w-full mt-4 bg-[#e74c3c] text-white py-2 rounded font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
        >
          <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
          Finish Test
        </button>
      </div>
    </aside>
  );
};

const LegendItem = ({ count, label, color }) => (
  <div className="flex items-center gap-2">
    <div className="relative w-8 h-7 bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold">
      {count}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${color}`} />
    </div>
    <span className="text-[10px] text-gray-500 font-medium leading-tight">{label}</span>
  </div>
);

export default QuestionSidebar;