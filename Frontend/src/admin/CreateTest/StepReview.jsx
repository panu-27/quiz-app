import { CheckCircleIcon, FireIcon, BeakerIcon, VariableIcon, BugAntIcon } from "@heroicons/react/24/outline";

export default function StepReview({
  title,
  phyChem = { physicsQ: 0, chemistryQ: 0, time: 0 }, // Default values to prevent crash
  mbConfig = { questions: 0, time: 0 },
  mathBioType = "maths",
  onBack,
  onPublish
}) {
  // Safe calculation of totals
  const totalQs = (phyChem?.physicsQ || 0) + (phyChem?.chemistryQ || 0) + (mbConfig?.questions || 0);
  const totalTime = (phyChem?.time || 0) + (mbConfig?.time || 0);

  const canPublish = title?.trim().length > 0 && totalQs > 0;

  return (
    <div className="p-10 text-center animate-in zoom-in duration-500">
      {/* SUCCESS ICON */}
      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <CheckCircleIcon className="w-10 h-10" />
      </div>

      <h2 className="text-3xl font-black mb-1 tracking-tighter text-slate-900">
        Review Blueprint
      </h2>
      <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest font-bold">
        Verify your path configuration
      </p>

      {/* SUMMARY CARD */}
      <div className="max-w-md mx-auto bg-slate-900 rounded-[2.5rem] p-8 text-left text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
          <FireIcon className="w-24 h-24" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* TEST TITLE */}
          <div className="border-b border-white/10 pb-4">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
              Assessment Identity
            </p>
            <h3 className="text-xl font-bold truncate tracking-tight">
              {title || "Untitled Test"}
            </h3>
          </div>

          {/* MODULES LIST */}
          <div className="space-y-3">
            {/* MODULE 1: PHY & CHEM */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <BeakerIcon className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase">Module 01</p>
                  <p className="font-bold text-xs uppercase tracking-tighter">Physics + Chemistry</p>
                </div>
              </div>
              <div className="text-right font-black text-indigo-400 text-sm">
                {(phyChem?.physicsQ || 0) + (phyChem?.chemistryQ || 0)} Qs • {phyChem?.time}m
              </div>
            </div>

            {/* MODULE 2: MATH OR BIO */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                {mathBioType === "maths" ? (
                  <VariableIcon className="w-5 h-5 text-blue-400" />
                ) : (
                  <BugAntIcon className="w-5 h-5 text-rose-400" />
                )}
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase">Module 02</p>
                  <p className="font-bold text-xs uppercase tracking-tighter">{mathBioType}</p>
                </div>
              </div>
              <div className={`text-right font-black text-sm ${mathBioType === 'maths' ? 'text-blue-400' : 'text-rose-400'}`}>
                {mbConfig?.questions || 0} Qs • {mbConfig?.time || 0}m
              </div>
            </div>
          </div>

          {/* GRAND TOTAL */}
          <div className="pt-6 flex justify-between items-end border-t border-white/10">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Grand Total</p>
              <p className="text-4xl font-black tracking-tighter">{totalQs} Qs</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {totalTime} minutes duration
              </p>
            </div>
            <div className="bg-indigo-600 text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-tighter shadow-lg shadow-indigo-900/50">
              Ready to Sync
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-10 flex justify-center gap-6 items-center">
        <button
          type="button"
          onClick={onBack}
          className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          Go Back
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={!canPublish}
          className={`px-12 py-4 rounded-[2rem] font-black text-base shadow-xl transition-all ${
            canPublish
              ? "bg-indigo-600 text-white shadow-indigo-100 hover:scale-105 active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Publish Assessment 🚀
        </button>
      </div>
    </div>
  );
}