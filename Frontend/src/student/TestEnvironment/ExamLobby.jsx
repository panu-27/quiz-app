import React, { useState } from 'react';

// Inline power icon — no external dependency needed
const PowerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const ExamLobby = ({ testTitle, userName, enterFullscreen, exitApp, isLoading = false }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="h-screen w-full bg-white text-[#333] font-sans flex flex-col select-none overflow-hidden">

      {/* Fixed Header */}
      <header className="bg-[#242729] text-white px-4 py-2 flex justify-between items-center text-sm font-bold shadow-sm shrink-0">
        <span>{testTitle || 'MHT CET'}</span>
        <div className="flex items-center gap-4">
          <select className="bg-white text-gray-900 text-xs px-2 py-1 border border-gray-300 rounded-sm">
            <option>English</option>
          </select>
          <button onClick={exitApp} className="hover:text-red-400 transition-colors">
            <PowerIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col border-x border-gray-200 mx-auto w-full max-w-[1200px] p-2 min-h-0">

        {/* Examinee Details */}
        <div className="border border-gray-300 mb-2 shrink-0">
          <h3 className="bg-white px-3 py-1 text-[15px] font-bold border-b border-gray-300">Examinee Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 p-3 text-[13px] leading-relaxed">
            <div className="flex gap-2"><span className="text-gray-600">Name:</span> <span className="font-semibold uppercase">{userName}</span></div>
            <div className="flex gap-2"><span className="text-gray-600">Exam Duration:</span> <span className="font-semibold">180 Minutes</span></div>
            <div className="flex gap-2"><span className="text-gray-600">Date of Exam:</span> <span className="font-semibold">05/04/2025</span></div>
            <div className="flex gap-2"><span className="text-gray-600">Maximum marks:</span> <span className="font-semibold">200</span></div>
          </div>
        </div>

        {/* Scrollable Instructions */}
        <div className="flex-1 border border-gray-300 flex flex-col min-h-0">
          <h3 className="bg-white px-3 py-1 text-[15px] font-bold border-b border-gray-300 shrink-0">Exam Instructions</h3>
          <div className="flex-1 overflow-y-auto p-4 text-[13px] space-y-4">

            <div>
              <p className="font-bold underline mb-2">About Question Paper :</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>There are in all 150 Questions for this exam, <strong>Physics</strong> - 50 Questions (1 mark each), <strong>Chemistry</strong> - 50 Questions (1 mark each), <strong>Mathematics</strong> - 50 Questions (2 marks each).</li>
                <li>You will be given 180 minutes to answer all questions.</li>
                <li><strong>There is no negative marking system for this test.</strong></li>
                <li>Questions will be in two languages (English, Marathi).</li>
                <li>Mode of Examination - Online.</li>
                <li>The test comprises multiple choice objective type questions (Four Options).</li>
              </ul>
            </div>

            <div>
              <p className="font-bold underline mb-2">About answering the questions:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Click the circle beside your chosen answer, then click any navigation button. The selected option will be highlighted and the question number will turn <span className="text-green-600 font-bold">Green</span>.</li>
                <li>You can deselect your answer by clicking <strong>Clear Answer</strong>.</li>
                <li>You may <strong>Mark for Review</strong> questions to revisit later. These will appear in <span className="text-purple-600 font-bold">Purple</span> in the navigation panel.</li>
                <li>In case of connectivity loss, your responses are saved up to the last successful click.</li>
              </ul>
            </div>

            {/* Legend Table */}
            <div className="mt-4 border border-gray-300 rounded-sm overflow-hidden w-full max-w-md bg-white">
              <div className="bg-[#337ab7] text-white text-center py-1.5 text-[12px] font-bold tracking-wider">
                Navigation Button Legend
              </div>
              <table className="w-full text-[12px] border-collapse">
                <tbody className="divide-y divide-gray-200">
                  <LegendRow label="Answered" color="#5cb85c" />
                  <LegendRow label="Not Answered" color="#d9534f" />
                  <LegendRow label="Not Visited" color="#adb5bd" borderRadius="2px" />
                  <LegendRow label="Marked for Review" color="#8e44ad" />
                  <LegendRow label="Answered & Marked for Review" color="#f0ad4e" note="(will be evaluated)" />
                </tbody>
              </table>
            </div>

            <div className="pt-4 pb-6">
              <p className="font-bold underline mb-2">About Submission:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Exam will be automatically submitted at the end of stipulated time.</li>
                <li>Check the summary of answered questions before submission.</li>
                <li>You will not be permitted to submit before the stipulated time.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="p-4 border-t border-gray-300 bg-white shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col items-start gap-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-red-600 shrink-0"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span className="text-[13px] font-bold text-red-600 leading-tight">
              I have read and accept the disclaimer, terms and conditions and understood the instructions given above.
            </span>
          </label>

          <div className="w-full flex justify-center">
            <button
              disabled={!agreed || isLoading}
              onClick={enterFullscreen}
              className="px-10 py-2 text-sm font-bold border shadow-sm transition-all flex items-center gap-2"
              style={agreed && !isLoading
                ? { background: '#337ab7', borderColor: '#2e6da4', color: 'white', cursor: 'pointer' }
                : { background: '#f0f0f0', borderColor: '#ddd', color: '#aaa', cursor: 'not-allowed' }
              }
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading exam…
                </>
              ) : 'I am ready to begin'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const LegendRow = ({ label, color, note, borderRadius = '50%' }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-2.5 font-semibold border-r border-gray-200 text-gray-700">
      {label} {note && <span className="text-[10px] text-gray-400 font-normal">{note}</span>}
    </td>
    <td className="px-4 py-2.5 flex justify-center">
      <div
        className="w-7 h-6 flex items-center justify-center text-white text-[10px] font-bold"
        style={{ background: color, borderRadius }}
      >
        0
      </div>
    </td>
  </tr>
);

export default ExamLobby;