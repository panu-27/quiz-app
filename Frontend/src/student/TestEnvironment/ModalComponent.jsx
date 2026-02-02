import React from 'react';
import { useNavigate } from 'react-router-dom';

const ModalComponent = ({ data }) => {
  const navigate = useNavigate();
  if (!data) return null;

  const { type, title, message, onConfirm, onCancel } = data;

  // CET/JEE exams usually don't use rounded corners; they use sharp or slightly rounded (2px)
  // They also use specific "Action" colors: #337ab7 (Blue) or #5cb85c (Green)
  const isDanger = type === 'warning' || type === 'critical' || type === 'error';

  const handleExitApp = () => {
    if (window.electron?.forceExit) {
      window.electron.forceExit();
    } else {
      alert("Exit functionality is only available on the Desktop App.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/70 backdrop-none p-4">
      {/* Container: Changed to sharp corners and thicker borders like TCS iON interfaces */}
      <div className="bg-white border-t-4 border-indigo-600 w-full max-w-md shadow-xl text-left flex flex-col overflow-hidden">
        
        {/* Header Bar: Standard Gray Header */}
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-tight">
            {title || "System Message"}
          </h2>
          <span className="text-[10px] text-gray-400 font-mono">ID: {Math.floor(Math.random() * 90000)}</span>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Standard Warning Icon for JEE */}
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <span className="text-xl font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 leading-normal">
                {message}
              </p>
              <p className="text-[11px] text-gray-500 mt-2 italic">
                Please contact the invigilator if you face any technical issues.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Standard JEE/CET Button placement */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
          {type === 'confirm' && (
            <button 
              onClick={onCancel} 
              className="px-4 py-1.5 text-xs font-bold uppercase bg-white border border-gray-400 text-gray-700 hover:bg-gray-100 shadow-sm"
            >
              No
            </button>
          )}

          <button 
            onClick={onConfirm} 
            className={`px-6 py-1.5 text-xs font-bold uppercase text-white shadow-sm transition-all ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#337ab7] hover:bg-[#286090]'
            }`}
          >
            {type === 'confirm' ? 'Yes' : 'OK'}
          </button>
        </div>

        {/* Footer Links: Standard small utility links */}
        <div className="bg-white px-4 py-2 flex justify-between items-center border-t border-gray-100">
           <button 
            onClick={() => navigate('/student')}
            className="text-[10px] font-bold text-blue-600 underline hover:text-blue-800"
          >
            Return to Dashboard
          </button>
          
          <button 
            onClick={handleExitApp}
            className="hidden md:block text-[10px] font-bold text-red-500 hover:text-red-700"
          >
            Exit Exam
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalComponent;