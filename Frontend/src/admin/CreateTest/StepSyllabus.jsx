import { PlusCircleIcon, TrashIcon, BeakerIcon } from "@heroicons/react/24/outline";
import api from "../../api/axios";

export default function StepSyllabus({
  subId, subName, difficulty = { easy: 0, medium: 0, hard: 0 }, setDifficulty,
  chapters, topics, setTopics, selectedChapters, setSelectedChapters,
  selectedTopics, setSelectedTopics, customQuestions, setCustomQuestions,
  activeCustomizingId, setActiveCustomizingId, onBack, onNext
}) {
  const currentChapters = chapters[subId] || [];
  const totalPercent = (difficulty?.easy || 0) + (difficulty?.medium || 0) + (difficulty?.hard || 0);
  const isPercentValid = totalPercent === 100;

  const handleDiffChange = (level, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    if (setDifficulty) setDifficulty(prev => ({ ...prev, [level]: num }));
  };

  const handleToggleChapter = async (chapId) => {
    const isSelected = selectedChapters.includes(chapId);
    if (isSelected) {
      setSelectedChapters(prev => prev.filter(id => id !== chapId));
      const chapTopics = topics[chapId] || [];
      const ids = chapTopics.map(t => t._id);
      setSelectedTopics(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedChapters(prev => [...prev, chapId]);
      if (!topics[chapId]) {
        const res = await api.get(`/topics/chapter/${chapId}`);
        setTopics(prev => ({ ...prev, [chapId]: res.data }));
        setSelectedTopics(prev => [...new Set([...prev, ...res.data.map(t => t._id)])]);
      }
    }
  };

  const addQ = () => {
    const newQ = { id: crypto.randomUUID(), question: "", options: ["", "", "", ""], correctOption: 0 };
    setCustomQuestions(prev => ({ ...prev, [subId]: [...(prev[subId] || []), newQ] }));
  };

  const updateQ = (qId, field, value, optIdx = null) => {
    setCustomQuestions(prev => ({
      ...prev, [subId]: (prev[subId] || []).map(q => {
        if (q.id !== qId) return q;
        if (optIdx !== null) {
          const opts = [...q.options]; opts[optIdx] = value;
          return { ...q, options: opts };
        }
        return { ...q, [field]: value };
      })
    }));
  };

  if (!subId) return <div className="p-20 text-center font-black uppercase text-slate-400">Subject Sync Error...</div>;

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <BeakerIcon className="w-6 h-6 text-indigo-500" /> {subName} Syllabus
          </h2>
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">{currentChapters.length} Chapters Found</p>
        </div>

        <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${isPercentValid ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
          {['easy', 'medium', 'hard'].map(level => (
            <div key={level} className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-slate-400 mb-1 ml-1">{level} %</span>
              <input type="number" value={difficulty[level] || 0} onChange={e => handleDiffChange(level, e.target.value)}
                className="w-12 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none" />
            </div>
          ))}
          <div className="text-center min-w-[40px] border-l pl-3">
            <span className="text-[8px] font-black uppercase text-slate-400 block">Total</span>
            <span className={`text-xs font-black ${isPercentValid ? 'text-emerald-600' : 'text-rose-600'}`}>{totalPercent}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {currentChapters.map(chap => (
          <div key={chap._id} className={`p-4 rounded-2xl border transition-all ${activeCustomizingId === chap._id ? "border-indigo-400 bg-indigo-50/20 shadow-sm" : "border-slate-100 bg-slate-50"}`}>
            <div className="flex justify-between items-center">
              <label className="flex items-center text-xs font-bold text-slate-700 cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4 rounded text-indigo-600" checked={selectedChapters.includes(chap._id)} onChange={() => handleToggleChapter(chap._id)} />
                {chap.name}
              </label>
              <button onClick={() => setActiveCustomizingId(activeCustomizingId === chap._id ? null : chap._id)} disabled={!selectedChapters.includes(chap._id)}
                className="text-[9px] font-black uppercase text-indigo-600 bg-white px-2 py-1 rounded-lg border hover:bg-slate-50 disabled:opacity-30">
                {activeCustomizingId === chap._id ? "Close" : "Topics"}
              </button>
            </div>
            {activeCustomizingId === chap._id && topics[chap._id] && (
              <div className="mt-3 pt-3 border-t border-indigo-100 grid gap-1.5 animate-in slide-in-from-top-1">
                {topics[chap._id].map(t => (
                  <label key={t._id} className="text-[10px] text-slate-500 flex items-center gap-2 cursor-pointer hover:text-indigo-600">
                    <input type="checkbox" checked={selectedTopics.includes(t._id)} onChange={() => setSelectedTopics(p => p.includes(t._id) ? p.filter(id => id !== t._id) : [...p, t._id])} className="rounded text-indigo-500" />
                    {t.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Manual Injection</h3>
          <button onClick={addQ} className="bg-white text-slate-900 px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">
            <PlusCircleIcon className="w-4 h-4" /> Add Question
          </button>
        </div>
        <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar-dark">
          {(customQuestions[subId] || []).map((q, idx) => (
            <div key={q.id} className="bg-white/5 p-6 rounded-3xl border border-white/10 relative">
              <button onClick={() => setCustomQuestions(prev => ({ ...prev, [subId]: prev[subId].filter(item => item.id !== q.id) }))} className="absolute top-6 right-6 text-white/20 hover:text-rose-400">
                <TrashIcon className="w-5 h-5" />
              </button>
              <input className="w-full bg-transparent border-b border-white/10 font-bold mb-6 outline-none pb-2 text-base focus:border-indigo-400 transition-colors" placeholder={`Question ${idx + 1}`} value={q.question} onChange={e => updateQ(q.id, "question", e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${q.correctOption === i ? 'bg-indigo-500/20 border-indigo-500' : 'bg-white/5 border-transparent border'}`}>
                    <input type="radio" name={`correct-${q.id}`} checked={q.correctOption === i} onChange={() => updateQ(q.id, "correctOption", i)} className="w-4 h-4 accent-indigo-400" />
                    <input className="bg-transparent text-xs w-full outline-none" placeholder={`Option ${i + 1}`} value={opt} onChange={e => updateQ(q.id, "options", e.target.value, i)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
        <button onClick={onBack} className="text-xs font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">← Back</button>
        <button onClick={onNext} disabled={!isPercentValid || selectedChapters.length === 0}
          className={`px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${isPercentValid && selectedChapters.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          Next Module →
        </button>
      </div>
    </div>
  );
}