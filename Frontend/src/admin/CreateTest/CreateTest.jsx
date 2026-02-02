import React, { useState } from 'react';
import MethodSelection from "./shared/MethodSelection";
import PDFFormView from "./PDFFormView";
import CustomFormView from "./CustomFormView";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AdminHeader from '../AdminHeader';
import { useAuth } from '../../context/AuthContext';

export default function CreateTest() {
  const { user, logout } = useAuth(); // Get auth data for the header
  const [mode, setMode] = useState(null); 

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#f0ebf8]">
        {/* Pass props so the header isn't empty */}
        <AdminHeader userName={user?.name} onLogout={logout} />
        <MethodSelection onSelect={(val) => setMode(val)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8] pb-20">
      {/* MAIN NAV HEADER */}
      <AdminHeader userName={user?.name} onLogout={logout} />
      
      {/* SECONDARY SUB-HEADER (The Mode Indicator) */}
      {/* Note: I removed 'sticky' here so it flows naturally below the main header */}
      {/* <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMode(null)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-[#673ab7] uppercase tracking-widest leading-none mb-1">
              Test Creator
            </p>
            <h1 className="font-bold text-slate-800 text-sm leading-none">
              {mode === 'pdf' ? "PDF Extraction Mode" : "Question Bank Mode"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Auto-Save Active</span>
        </div>
      </div> */}

      {/* FORM CONTENT */}
      <div className="max-w-4xl mx-auto pt-6 px-4">
        {mode === 'pdf' ? <PDFFormView /> : <CustomFormView />}
      </div>
      
      <p className="text-center text-slate-400 text-[10px] font-medium mt-10 uppercase tracking-widest">
        Powered by AI Content Engine v2.0
      </p>
    </div>
  );
}