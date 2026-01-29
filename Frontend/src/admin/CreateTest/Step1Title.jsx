import { FireIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef } from "react";

export default function Step1Title({
  title,
  setTitle,
  isPyqOnly,
  setIsPyqOnly,
  onNext
}) {
  const inputRef = useRef(null);
  const isValidTitle = title.trim().length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Assessment Identity
        </h2>
        <p className="text-sm text-slate-500">
          Define the core title and global filters for this test.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
            Test Title
          </label>
          <input
            ref={inputRef}
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4
                       text-lg font-bold shadow-inner outline-none
                       focus:bg-white focus:border-indigo-500 transition-all"
            placeholder="e.g., MHT-CET Full Mock 01"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && isValidTitle) onNext();
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsPyqOnly(p => !p)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2
            transition-all ${isPyqOnly ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-slate-50"}`}
        >
          <div className="flex items-center gap-3 text-left">
            <div className={`p-2 rounded-lg ${isPyqOnly ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-400"}`}>
              <FireIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">PYQ Only Mode</p>
              <p className="text-[10px] text-slate-500">Filter syllabus to Previous Year Questions only</p>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-all ${isPyqOnly ? "bg-orange-500" : "bg-slate-300"}`}>
            <div className={`absolute w-3.5 h-3.5 bg-white rounded-full top-0.5 transition-all ${isPyqOnly ? "right-0.5" : "left-0.5"}`} />
          </div>
        </button>
      </div>

      <button
        type="button"
        disabled={!isValidTitle}
        onClick={onNext}
        className="w-full mt-10 bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
      >
        Configure Blueprint →
      </button>
    </div>
  );
}