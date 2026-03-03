import React from 'react';
import { FileUp, Database, ChevronRight, Layout, Sparkles, PenLine, RefreshCw } from 'lucide-react';

export default function MethodSelection({ onSelect }) {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 bg-[#f0ebf8]">
      {/* HEADER SECTION */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-purple-100 shadow-sm mb-4">
          <Sparkles size={14} className="text-[#673ab7]" />
          <span className="text-[10px] font-bold text-[#673ab7] uppercase tracking-wider">Content Creation Engine</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">How would you like to build your test?</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Choose a method to start adding questions. You can upload your own files or use our smart question bank.
        </p>
      </div>

      {/* 4-column grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl">

        {/* OPTION 1: PDF DIGITIZER */}
        <button
          onClick={() => onSelect('pdf')}
          className="group relative bg-white border border-slate-200 p-7 rounded-2xl text-left transition-all hover:border-[#673ab7] hover:shadow-xl active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-purple-50 text-[#673ab7] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#673ab7] group-hover:text-white transition-colors">
            <FileUp size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-2">Upload PDF Paper</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Digitize your existing PDF segments. Our AI extracts text, options, and diagrams automatically.
          </p>
          <div className="flex items-center text-[#673ab7] text-[10px] font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
            Get Started <ChevronRight size={12} />
          </div>
        </button>

        {/* OPTION 2: SMART BANK */}
        <button
          onClick={() => onSelect('dynamic')}
          className="group relative bg-white border border-slate-200 p-7 rounded-2xl text-left transition-all hover:border-blue-400 hover:shadow-xl active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Database size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-2">Use Question Bank</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Pick chapters and difficulty. We'll generate a balanced paper from our curated database instantly.
          </p>
          <div className="flex items-center text-blue-600 text-[10px] font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
            Get Started <ChevronRight size={12} />
          </div>
        </button>

        {/* OPTION 3: CRAFT TEST (JSON) */}
        <button
          onClick={() => onSelect('craft')}
          className="group relative bg-white border border-slate-200 p-7 rounded-2xl text-left transition-all hover:border-emerald-500 hover:shadow-xl active:scale-[0.98]"
        >
          <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
            New
          </span>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <PenLine size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-2">Craft Test Manually</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Paste your questions as JSON with full LaTeX support. Live preview renders math and options instantly.
          </p>
          <div className="flex items-center text-emerald-600 text-[10px] font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
            Get Started <ChevronRight size={12} />
          </div>
        </button>

        {/* OPTION 4: REINITIALIZE */}
        <button
          onClick={() => onSelect('schedule')}
          className="group relative bg-white border border-slate-200 p-7 rounded-2xl text-left transition-all hover:border-orange-400 hover:shadow-xl active:scale-[0.98]"
        >
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-orange-500 group-hover:text-white transition-colors">
            <RefreshCw size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-2">Reinitialize a Test</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Reschedule a predefined test for new batches. Set a fresh date, time window, and go live instantly.
          </p>
          <div className="flex items-center text-orange-500 text-[10px] font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
            Get Started <ChevronRight size={12} />
          </div>
        </button>

      </div>

      {/* FOOTER TIP */}
      <div className="mt-10 flex items-center gap-2 text-slate-400">
        <Layout size={14} />
        <p className="text-[11px] font-medium uppercase tracking-tight">Standard Exam Format: PCM / PCB / SINGLE</p>
      </div>
    </div>
  );
}