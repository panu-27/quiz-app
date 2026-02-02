import React, { useState } from 'react';
import { PowerIcon } from "@heroicons/react/24/solid";

const ExamLobby = ({ testTitle, userName, enterFullscreen, exitApp }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    /* h-screen locks the height to the window; overflow-hidden prevents the whole page from bouncing */
    <div className="h-screen w-full bg-white text-[#333] font-sans flex flex-col select-none overflow-hidden">
      
      {/* 1. Fixed Header */}
      <header className="bg-[#242729] text-white px-4 py-2 flex justify-between items-center text-sm font-bold shadow-sm shrink-0">
        <span>PCM CET - 02</span>
        <div className="flex items-center gap-4">
          <select className="bg-white text-gray-900 text-xs px-2 py-1 border border-gray-300 rounded-sm">
            <option>English</option>
          </select>
          <button onClick={exitApp} className="hover:text-red-400">
            <PowerIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 flex flex-col border-x border-gray-200 mx-auto w-full max-w-[1200px] p-2 min-h-0">
        
        {/* Fixed Examinee Details */}
        <div className="border border-gray-300 mb-2 shrink-0">
          <h3 className="bg-white px-3 py-1 text-[15px] font-bold border-b border-gray-300">Examinee Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 p-3 text-[13px] leading-relaxed">
            <div className="flex gap-2"><span className="text-gray-600">Name:</span> <span className="font-semibold uppercase">{userName}</span></div>
            <div className="flex gap-2"><span className="text-gray-600">Exam Duration:</span> <span className="font-semibold">180 Minutes</span></div>
            <div className="flex gap-2"><span className="text-gray-600">Date of Exam:</span> <span className="font-semibold">05/04/2025</span></div>
            <div className="flex gap-2"><span className="text-gray-600">Maximum marks:</span> <span className="font-semibold">200</span></div>
          </div>
        </div>

        {/* 3. SCROLLABLE Exam Instructions Box */}
        <div className="flex-1 border border-gray-300 flex flex-col min-h-0">
          <h3 className="bg-white px-3 py-1 text-[15px] font-bold border-b border-gray-300 shrink-0">Exam Instructions</h3>
          
          {/* This div is the only part that will scroll */}
          <div className="flex-1 overflow-y-auto p-4 text-[13px] space-y-4">
            
            <div>
              <p className="font-bold underline mb-2">About Question Paper :</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>There are in all 150 Questions for this exam, <span className="font-bold">Physics</span> - 50 Questions (1 mark for each question), <span className="font-bold">Chemistry</span> - 50 Questions (1 mark for each question), <span className="font-bold">Mathematics</span> - 50 Questions (2 mark for each question).</li>
                <li>You will be given 180 minutes to answer all questions.</li>
                <li><span className="font-bold text-black">There is no negative marking system for this test.</span></li>
                <li>Questions will be in two languages (English, Marathi)</li>
                <li>Mode of Examination - Online.</li>
                <li>The test will comprise of multiple choice objective type questions (Four Options)</li>
                <li>Refer Information Broucher of MHT-CET 2026 for detail information.</li>
              </ul>
            </div>

            <div>
              <p className="font-bold underline mb-2">About answering the questions:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>The candidates are requested to follow the instructions carefully. If any candidate does not follow the instructions / rules, it would be treated as a case of use of unfair means.</li>
                <li>To answer a question, candidate must 'Mouse-click' the circle besides the alternative he/she feels appropriate/correct and then Click on any of the navigation buttons. The clicked alternative/option shall be treated as the answer given by the candidate for the question. The corresponding question number in the navigation box will appear in <span className="text-green-600 font-bold">Green</span>.</li>
                <li>You can choose to deselect the already indicated answer by clicking the "Reset Answer" button.</li>
                <li>You may <span className="font-bold text-black">Mark for Review</span> questions which you would want to reconfirm later. Questions Marked for review will appear in <span className="text-purple-600 font-bold">Purple</span> colour in the navigation box.</li>
                <li>In case of power failure or Loss of internet connection, the candidate's responses are saved up to last successful click. When candidates logs in again, test will resume from the same stage.</li>
              </ul>
            </div>

            {/* Legend Table */}
            {/* Navigation Buttons Table - Fixed CET Shapes */}
<div className="mt-6 border border-gray-300 rounded-sm overflow-hidden w-full max-w-md bg-white">
  <div className="bg-[#00aeef] text-white text-center py-1.5 text-[12px] font-bold tracking-wider">
    Navigation Buttons
  </div>
  <table className="w-full text-[12px] border-collapse">
    <tbody className="divide-y divide-gray-200">
      {/* Answered - Green Hexagon/Trapezoid */}
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2.5 font-bold border-r border-gray-200 w-2/3">Answered</td>
        <td className="px-4 py-2.5 flex justify-center">
          <div className="relative w-7 h-6 bg-[#5cb85c] text-white text-[10px] font-bold flex items-center justify-center 
            before:content-[''] before:absolute before:top-0 before:left-0 before:border-t-[4px] before:border-t-white before:border-r-[4px] before:border-r-transparent
            after:content-[''] after:absolute after:bottom-0 after:right-0 after:border-b-[4px] after:border-b-white after:border-l-[4px] after:border-l-transparent">
            0
          </div>
        </td>
      </tr>

      {/* Not Answered - Red Hexagon/Trapezoid (Upside down) */}
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2.5 font-bold border-r border-gray-200">Not Answered</td>
        <td className="px-4 py-2.5 flex justify-center">
          <div className="relative w-7 h-6 bg-[#d9534f] text-white text-[10px] font-bold flex items-center justify-center 
            before:content-[''] before:absolute before:bottom-0 before:left-0 before:border-b-[4px] before:border-b-white before:border-r-[4px] before:border-r-transparent
            after:content-[''] after:absolute after:top-0 after:right-0 after:border-t-[4px] after:border-t-white after:border-l-[4px] after:border-l-transparent">
            0
          </div>
        </td>
      </tr>

      {/* Not Visited - Simple Gray Box */}
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2.5 font-bold border-r border-gray-200">Not Visited</td>
        <td className="px-4 py-2.5 flex justify-center">
          <div className="w-7 h-6 bg-[#eee] border border-gray-400 flex items-center justify-center text-[#555] text-[10px] font-bold rounded-sm">
            0
          </div>
        </td>
      </tr>

      {/* Marked for Review - Purple Circle */}
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2.5 font-bold border-r border-gray-200">Marked for Review</td>
        <td className="px-4 py-2.5 flex justify-center">
          <div className="w-7 h-7 bg-[#8a6d3b] rounded-full border border-gray-400 flex items-center justify-center text-white text-[10px] font-bold">
            0
          </div>
        </td>
      </tr>

      {/* Answered & Marked for Review - Purple Circle + Green Dot */}
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2.5 font-bold border-r border-gray-200 leading-tight">
          Answered & Marked for Review <br/>
          <span className="text-[10px] font-normal text-gray-500">(will be considered for evaluation)</span>
        </td>
        <td className="px-4 py-2.5 flex justify-center">
          <div className="relative w-7 h-7 bg-[#8a6d3b] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            0
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#5cb85c] rounded-full border-2 border-white" />
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

            <div className="pt-4 pb-6">
              <p className="font-bold underline mb-2">About the Preview and Submission:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Exam will be automatically submitted at the end of stipulated time.</li>
                <li>At the End of the session, you should check the summary displayed with regard to the number of questions answered.</li>
                <li>Please note that you will not be permitted to submit your test before the stipulated time.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Fixed Disclaimer Footer */}
      <footer className="p-4 border-t border-gray-300 bg-white shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col items-start gap-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              className="mt-1 w-4 h-4 accent-red-600 border-gray-400 rounded-sm shrink-0"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-[13px] font-bold text-red-600 leading-tight">
              I have read and accept the disclaimer, terms and conditions and understood the instructions given above.
            </span>
          </label>
          
          <div className="w-full flex justify-center">
            <button 
              disabled={!agreed}
              onClick={enterFullscreen}
              className={`px-8 py-2 text-sm font-bold border shadow-sm transition-all ${
                agreed 
                ? 'bg-[#337ab7] border-[#2e6da4] text-white hover:bg-[#286090]' 
                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              I am ready to begin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExamLobby;