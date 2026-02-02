import React from 'react';
import { FileUp, Database, ChevronRight, Layout, Sparkles } from 'lucide-react';

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

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* OPTION 1: PDF DIGITIZER */}
        <button 
          onClick={() => onSelect('pdf')}
          className="group relative bg-white border border-slate-200 p-8 rounded-2xl text-left transition-all hover:border-[#673ab7] hover:shadow-xl active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-purple-50 text-[#673ab7] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#673ab7] group-hover:text-white transition-colors">
            <FileUp size={28} />
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">Upload PDF Paper</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Digitize your existing PDF segments. Our AI extracts text, options, and diagrams automatically.
          </p>

          <div className="flex items-center text-[#673ab7] text-xs font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
            Get Started <ChevronRight size={14} />
          </div>
        </button>

        {/* OPTION 2: SMART BANK */}
        <button 
          onClick={() => onSelect('dynamic')}
          className="group relative bg-white border border-slate-200 p-8 rounded-2xl text-left transition-all hover:border-[#673ab7] hover:shadow-xl active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Database size={28} />
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">Use Question Bank</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Pick chapters and difficulty. We'll generate a balanced paper from our curated database instantly.
          </p>

          <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
            Get Started <ChevronRight size={14} />
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