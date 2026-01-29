import { BeakerIcon, VariableIcon, BugAntIcon } from "@heroicons/react/24/outline";

export default function Step2Blueprint({
  mathBioType, setMathBioType, phyChem, setPhyChem, mbConfig, setMbConfig, onBack, onNext
}) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  return (
    <div className="p-8 animate-in slide-in-from-right-4">
      <h2 className="text-2xl font-black mb-6 tracking-tight">Path & Blueprint</h2>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {["maths", "biology"].map((type) => (
          <button
            key={type}
            onClick={() => {
              setMathBioType(type);
              setMbConfig(p => ({ ...p, questions: type === "biology" ? 100 : 50 }));
            }}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
              mathBioType === type ? "border-indigo-600 bg-indigo-50 shadow-lg" : "border-slate-100 bg-white"
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mathBioType === type ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>
              {type === "maths" ? <VariableIcon className="w-6 h-6"/> : <BugAntIcon className="w-6 h-6" />}
            </div>
            <span className="font-black uppercase text-xs tracking-widest">{type}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-4">Module 01: Physics & Chemistry</span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">Phy Qs</label>
              <input type="number" className="w-full p-2 bg-white border rounded-xl font-bold" value={phyChem.physicsQ} onChange={e => setPhyChem(p => ({...p, physicsQ: clamp(+e.target.value, 0, 50)}))} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">Chem Qs</label>
              <input type="number" className="w-full p-2 bg-white border rounded-xl font-bold" value={phyChem.chemistryQ} onChange={e => setPhyChem(p => ({...p, chemistryQ: clamp(+e.target.value, 0, 50)}))} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-indigo-500 block mb-1 uppercase tracking-widest">Time (m)</label>
              <input type="number" className="w-full p-2 bg-white border-2 border-indigo-500 rounded-xl font-bold text-indigo-600" value={phyChem.time} onChange={e => setPhyChem(p => ({...p, time: clamp(+e.target.value, 10, 90)}))} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border ${mathBioType === 'maths' ? 'bg-blue-50 border-blue-100' : 'bg-rose-50 border-rose-100'}`}>
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-4">Module 02: {mathBioType}</span>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">Questions</label>
              <input type="number" className="w-full p-2 bg-white border rounded-xl font-bold" value={mbConfig.questions} onChange={e => setMbConfig(p => ({...p, questions: clamp(+e.target.value, 0, 100)}))} />
            </div>
            <div>
              <label className="text-[9px] font-bold text-indigo-500 block mb-1 uppercase tracking-widest">Time (m)</label>
              <input type="number" className="w-full p-2 bg-white border-2 border-indigo-500 rounded-xl font-bold text-indigo-600" value={mbConfig.time} onChange={e => setMbConfig(p => ({...p, time: clamp(+e.target.value, 10, 90)}))} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="text-xs font-bold text-slate-400 uppercase">Back</button>
        <button onClick={onNext} className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Next Step →</button>
      </div>
    </div>
  );
}