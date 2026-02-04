import React, { useEffect, useState, useMemo } from "react";
import {
    ChevronRight, Clock, Target, Users, Zap, CheckCircle2,
    Loader2, BookOpen, Hash, Search, X, Settings2, Plus, Layout, Calendar
} from "lucide-react";

export default function CustomCreateTest() {
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    /* ---------------- STATE ---------------- */
    const [configTree, setConfigTree] = useState([]);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [createdTestId, setCreatedTestId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSubjectId, setActiveSubjectId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSchedule, setShowSchedule] = useState(false);

    const [formData, setFormData] = useState({
        title: "", selectedBatchIds: [], pattern: "PCM", time: 180,
        distribution: "Single Set", selectedSingleSubject: "",
        scheduleDate: "", scheduleTime: "", endTimeDate: "", endTimeTime: "",
        subjects: []
    });

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    /* ---------------- INITIAL SYNC ---------------- */
    useEffect(() => {
        const token = localStorage.getItem("token");
        const init = async () => {
            try {
                const [treeRes, batchRes] = await Promise.all([
                    fetch(`${baseURL}/bankQuestion/config-tree`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${baseURL}/teacher/my-batches`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                const treeData = await treeRes.json();
                const batchData = await batchRes.json();
                setConfigTree(treeData);
                setAvailableBatches(Array.isArray(batchData) ? batchData : batchData.batches || []);
                if (treeData.length > 0) handlePatternChange("PCM", treeData);
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        init();
    }, []);

    const handlePatternChange = (pattern, currentTree = configTree, singleSubName = null) => {
        const map = {
            "PCM": ["Physics", "Chemistry", "Mathematics"],
            "PCB": ["Physics", "Chemistry", "Biology"],
            "JEE MAINS": ["Physics", "Chemistry", "Mathematics"],
            "NEET": ["Physics", "Chemistry", "Biology"],
            "SINGLE": [singleSubName || formData.selectedSingleSubject || (currentTree[0]?.subjectName)]
        };
        const targetNames = map[pattern] || ["Physics"];
        const subjects = targetNames.map((name) => {
            const matched = currentTree.find(s => s.subjectName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(s.subjectName.toLowerCase()));
            return { dbId: matched?._id, name: matched?.subjectName || name, qCount: (pattern === "PCB" && (name === "Biology" || name === "Bio")) ? 100 : 50, difficulty: "Med", chapters: [] };
        });
        setFormData(prev => ({ ...prev, pattern, subjects, selectedSingleSubject: subjects[0]?.name }));
    };

    const buildBlocks = () => {
        const activeSubjects = formData.subjects.filter(s => s.chapters.length > 0);
        const totalTime = Number(formData.time);
        if (["PCM", "PCB"].includes(formData.pattern)) {
            const blocks = [];
            const pcSections = activeSubjects.filter(s => ["Physics", "Chemistry"].includes(s.name)).map(s => ({ subject: s.dbId, subjectName: s.name, numQuestions: Number(s.qCount), difficulty: s.difficulty, topics: s.chapters.flatMap(c => c.topics) }));
            const majorSections = activeSubjects.filter(s => ["Mathematics", "Biology"].includes(s.name)).map(s => ({ subject: s.dbId, subjectName: s.name, numQuestions: Number(s.qCount), difficulty: s.difficulty, topics: s.chapters.flatMap(c => c.topics) }));
            if (pcSections.length) blocks.push({ blockName: "Block 1: Physics & Chemistry", duration: Math.floor(totalTime / 2), sections: pcSections });
            if (majorSections.length) blocks.push({ blockName: `Block 2: ${majorSections[0].name}`, duration: Math.ceil(totalTime / 2), sections: majorSections });
            return blocks;
        }
        return [{ blockName: formData.pattern === "SINGLE" ? `${activeSubjects[0]?.name} Test` : "Full Session", duration: totalTime, sections: activeSubjects.map(s => ({ subject: s.dbId, subjectName: s.name, numQuestions: Number(s.qCount), difficulty: s.difficulty, topics: s.chapters.flatMap(c => c.topics) })) }];
    };

    const toggleChapter = (subjectDbId, chapter, forceState) => {
        setFormData(prev => ({
            ...prev, subjects: prev.subjects.map(sub => {
                if (sub.dbId !== subjectDbId) return sub;
                const exists = sub.chapters.find(c => c.chapterId === chapter.chapterId);
                const shouldRemove = forceState === false || (forceState === undefined && exists);
                return { ...sub, chapters: shouldRemove ? sub.chapters.filter(c => c.chapterId !== chapter.chapterId) : [...sub.chapters, { chapterId: chapter.chapterId, chapterName: chapter.chapterName, topics: chapter.topics.map(t => t._id), open: true }] };
            })
        }));
    };

    const toggleTopic = (subjectDbId, chapterId, topicId) => {
        setFormData(prev => ({
            ...prev, subjects: prev.subjects.map(sub => {
                if (sub.dbId !== subjectDbId) return sub;
                return { ...sub, chapters: sub.chapters.map(ch => { if (ch.chapterId !== chapterId) return ch; const exists = ch.topics.includes(topicId); return { ...ch, topics: exists ? ch.topics.filter(t => t !== topicId) : [...ch.topics, topicId] }; }) };
            })
        }));
    };

    const handleSave = async () => {
        if (!formData.title || formData.selectedBatchIds.length === 0) return alert("Title & Batch required");
        setIsSubmitting(true);

        const blocks = buildBlocks();
        const typeMap = { "PCM": "PCM", "PCB": "PCB", "JEE MAINS": "JEE", "NEET": "NEET", "SINGLE": "OTHER" };

        // --- SMART TIME LOGIC ---
        const now = new Date();
        const startTime = formData.scheduleDate 
            ? new Date(`${formData.scheduleDate}T${formData.scheduleTime || '00:00'}`) 
            : now;

        let endTime;
        if (formData.endTimeDate) {
            endTime = new Date(`${formData.endTimeDate}T${formData.endTimeTime || '23:59'}`);
        } else {
            const bufferMinutes = Number(formData.time) + 60;
            endTime = new Date(startTime.getTime() + bufferMinutes * 60000);
        }

        // --- MARKING SCHEME LOGIC ---
        const isCompetitive = ["JEE MAINS", "NEET"].includes(formData.pattern);
        const markingScheme = {
            isNegativeMarking: isCompetitive,
            defaultCorrect: isCompetitive ? 4 : 2, 
            defaultNegative: isCompetitive ? 1 : 0,
            subjectWise: formData.subjects.map(s => {
                let correct = 2; 
                let negative = 0;
                if (isCompetitive) {
                    correct = 4; negative = 1;
                } else if (["PCM", "PCB"].includes(formData.pattern)) {
                    correct = (s.name === "Mathematics" || s.name === "Math") ? 2 : 1;
                    negative = 0;
                }
                return { subjectId: s.dbId, correctMarks: correct, negativeMarks: negative };
            })
        };

        const payload = { 
            title: formData.title, 
            batchIds: formData.selectedBatchIds, 
            duration: Number(formData.time), 
            examType: typeMap[formData.pattern] || "OTHER", 
            mode: "CUSTOM", 
            markingScheme,
            metadata: { distribution: formData.distribution }, 
            startTime: startTime.toISOString(), 
            endTime: endTime.toISOString(), 
            blocks 
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseURL}/teacher/create-custom-test`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setCreatedTestId(data._id);
            alert("Blueprint Saved!");
        } catch (err) { alert(err.message); }
        finally { setIsSubmitting(false); }
    };

    const handleGenerate = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            await fetch(`${baseURL}/teacher/tests/${createdTestId}/generate`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            alert("Questions Generated Successfully!");
        } catch (err) { alert("Failed"); }
        finally { setIsSubmitting(false); }
    };

    const activeSubjectData = useMemo(() => configTree.find(s => s._id === activeSubjectId), [activeSubjectId, configTree]);
    const filteredChapters = useMemo(() => {
        if (!activeSubjectData) return [];
        return activeSubjectData.chapters.filter(ch => ch.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) || ch.topics.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())));
    }, [activeSubjectData, searchQuery]);

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-violet-600" /></div>;

    return (
        <div className="min-h-screen bg-[#FDFDFF] pb-32 font-sans w-full overflow-x-hidden">
            {/* FULL WIDTH HEADER */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-4 py-6 md:py-8 w-full">
                <div className="w-full max-w-[1920px] mx-auto space-y-6 px-2">
                    <input
                        placeholder="Untitled Mock Test..."
                        className="text-3xl md:text-5xl font-black bg-transparent border-none outline-none placeholder:text-slate-200 w-full tracking-tighter text-slate-900 uppercase"
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-white shadow-sm px-4 py-3 rounded-2xl flex items-center gap-3 border border-slate-100 min-w-[120px]">
                            <Clock size={20} className="text-orange-500" />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-400 uppercase">Duration</span>
                                <div className="flex items-center gap-1">
                                    <input type="number" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="bg-transparent font-black w-10 outline-none text-sm text-slate-800" />
                                    <span className="text-[10px] font-black">MIN</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-sm px-4 py-3 rounded-2xl flex items-center gap-3 border border-slate-100 min-w-[140px]">
                            <Target size={20} className="text-violet-500" />
                            <div className="flex flex-col flex-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pattern</span>
                                <select className="bg-transparent font-black outline-none text-xs uppercase cursor-pointer text-slate-800" value={formData.pattern} onChange={e => handlePatternChange(e.target.value)}>
                                    <option value="PCM">PCM (CET)</option><option value="PCB">PCB (CET)</option><option value="JEE MAINS">JEE MAINS</option><option value="NEET">NEET</option><option value="SINGLE">SINGLE</option>
                                </select>
                            </div>
                        </div>

                        <button onClick={() => setShowSchedule(!showSchedule)} className={`px-4 py-3 rounded-2xl flex items-center gap-3 border transition-all shadow-sm ${showSchedule ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
                            <Calendar size={20} />
                            <div className="flex flex-col items-start">
                                <span className="text-[8px] font-black uppercase leading-none mb-1">Timing</span>
                                <span className="text-[10px] font-black uppercase">{showSchedule ? 'Close' : 'Schedule'}</span>
                            </div>
                        </button>

                        {formData.pattern === "SINGLE" && (
                            <div className="bg-violet-50 px-4 py-3 rounded-2xl flex items-center gap-3 border border-violet-100 min-w-[160px] animate-in zoom-in-95 duration-300">
                                <BookOpen size={20} className="text-violet-600" />
                                <div className="flex flex-col flex-1">
                                    <span className="text-[8px] font-black text-violet-400 uppercase">Target</span>
                                    <select className="bg-transparent font-black outline-none text-xs uppercase cursor-pointer text-violet-800"
                                        value={formData.selectedSingleSubject}
                                        onChange={e => {
                                            setFormData(prev => ({ ...prev, selectedSingleSubject: e.target.value }));
                                            handlePatternChange("SINGLE", configTree, e.target.value);
                                        }}>
                                        {configTree.map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 items-center md:ml-auto">
                            {availableBatches.map(batch => {
                                const isSelected = formData.selectedBatchIds.includes(batch._id);
                                return (
                                    <button key={batch._id} onClick={() => setFormData({ ...formData, selectedBatchIds: isSelected ? formData.selectedBatchIds.filter(id => id !== batch._id) : [...formData.selectedBatchIds, batch._id] })}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${isSelected ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-transparent text-white shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-violet-200'}`}
                                    >{batch.name}</button>
                                );
                            })}
                        </div>
                    </div>

                    {showSchedule && (
                        <div className="flex flex-wrap gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Test Start window</label>
                                <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                                    <input type="date" min={today} className="bg-transparent p-1 px-3 rounded-lg text-xs font-black outline-none" onChange={e => setFormData({ ...formData, scheduleDate: e.target.value })} />
                                    <input type="time" className="bg-transparent p-1 px-3 border-l text-xs font-black outline-none" onChange={e => setFormData({ ...formData, scheduleTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Test End window (Deadline)</label>
                                <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                                    <input type="date" min={formData.scheduleDate || today} className="bg-transparent p-1 px-3 rounded-lg text-xs font-black outline-none" onChange={e => setFormData({ ...formData, endTimeDate: e.target.value })} />
                                    <input type="time" className="bg-transparent p-1 px-3 border-l text-xs font-black outline-none" onChange={e => setFormData({ ...formData, endTimeTime: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SUBJECT GRID */}
            <div className="w-full max-w-[1920px] mx-auto p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {formData.subjects.map((sub) => {
                    const selectedCount = sub.chapters.reduce((acc, c) => acc + c.topics.length, 0);
                    const hasSelection = selectedCount > 0;
                    return (
                        <div key={sub.dbId} className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 transition-all hover:shadow-xl hover:border-violet-200 relative flex flex-col">
                            <div className={`absolute left-0 top-10 bottom-10 w-1 rounded-r-full transition-all ${hasSelection ? 'bg-emerald-500' : 'bg-transparent'}`} />
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${hasSelection ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}><BookOpen size={24} /></div>
                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{sub.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedCount} Selected</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                                    <Hash size={14} className="text-orange-400" />
                                    <input type="number" value={sub.qCount} onWheel={e => e.target.blur()} onChange={e => setFormData({ ...formData, subjects: formData.subjects.map(s => s.dbId === sub.dbId ? { ...s, qCount: e.target.value } : s) })} className="w-10 bg-transparent font-black text-sm outline-none text-slate-700 text-center no-spinner" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mb-8 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Complexity</span>
                                <select value={sub.difficulty} onChange={e => setFormData({ ...formData, subjects: formData.subjects.map(s => s.dbId === sub.dbId ? { ...s, difficulty: e.target.value } : s) })} className="text-[11px] font-black uppercase text-violet-600 bg-white border border-slate-100 rounded-xl px-4 py-2 outline-none cursor-pointer hover:border-violet-200 shadow-sm">
                                    <option value="Easy">Easy</option><option value="Med">Med</option><option value="Hard">Hard</option>
                                </select>
                            </div>
                            <button onClick={() => setActiveSubjectId(sub.dbId)} className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-md">
                                <Settings2 size={16} /> Edit Syllabus
                            </button>
                            {hasSelection && <div className="absolute top-4 right-4"><CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" /></div>}
                        </div>
                    );
                })}
            </div>

            {/* SYLLABUS MODAL */}
            {activeSubjectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setActiveSubjectId(null)} />
                    <div className="relative bg-white w-full h-full md:h-[90vh] md:max-w-5xl md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                        <div className="px-8 py-6 md:px-12 md:py-10 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl"><BookOpen size={28} /></div>
                                <div><h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{activeSubjectData?.subjectName}</h2><p className="text-[11px] font-black text-slate-300 uppercase tracking-widest mt-2 italic">Define Blueprint Syllabus</p></div>
                            </div>
                            <button onClick={() => setActiveSubjectId(null)} className="p-4 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-90"><X size={28} /></button>
                        </div>
                        <div className="px-8 py-5 md:px-12 md:py-6 bg-slate-50/50 border-b border-slate-100 shrink-0 flex gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={20} />
                                <input placeholder="Quick search modules..." className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-sm font-semibold text-slate-700 outline-none focus:border-violet-500 shadow-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            </div>
                            <button onClick={() => {
                                const allCh = activeSubjectData.chapters;
                                const sub = formData.subjects.find(s => s.dbId === activeSubjectId);
                                const isAll = sub.chapters.length === allCh.length;
                                allCh.forEach(ch => toggleChapter(activeSubjectId, ch, !isAll));
                            }} className={`px-8 border rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-sm ${formData.subjects.find(s => s.dbId === activeSubjectId).chapters.length === activeSubjectData.chapters.length ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                {formData.subjects.find(s => s.dbId === activeSubjectId).chapters.length === activeSubjectData.chapters.length ? 'Deselect all' : 'Select all'}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-3 custom-scrollbar bg-slate-50/30">
                            {filteredChapters.map(ch => {
                                const sub = formData.subjects.find(s => s.dbId === activeSubjectId);
                                const sel = sub.chapters.find(c => c.chapterId === ch.chapterId);
                                return (
                                    <div key={ch.chapterId} className={`bg-white border transition-all rounded-[2rem] overflow-hidden ${sel ? 'border-violet-200 shadow-md ring-1 ring-violet-50' : 'border-slate-200 shadow-sm'}`}>
                                        <div className="flex items-center">
                                            <div className={`flex-1 flex items-center gap-5 p-5 md:p-6 cursor-pointer transition-colors ${sel ? 'bg-violet-50/20' : 'hover:bg-slate-50'}`} onClick={() => toggleChapter(activeSubjectId, ch, !sel)}>
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${sel ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 border border-slate-200'}`}>{sel ? <CheckCircle2 size={18} /> : <Plus size={18} />}</div>
                                                <div className="flex-1"><h4 className={`text-[15px] font-black uppercase tracking-tight ${sel ? 'text-violet-900' : 'text-slate-600'}`}>{ch.chapterName}</h4><p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{sel ? `${sel.topics.length}/${ch.topics.length} Modules Selected` : `${ch.topics.length} Total Topics`}</p></div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); if (!sel) return; setFormData(prev => ({ ...prev, subjects: prev.subjects.map(s => { if (s.dbId !== activeSubjectId) return s; return { ...s, chapters: s.chapters.map(c => c.chapterId === ch.chapterId ? { ...c, open: !c.open } : c) }; }) })); }} className={`p-6 border-l border-slate-100 transition-all ${!sel ? 'opacity-5 cursor-not-allowed' : 'hover:bg-violet-50 text-slate-400'}`}>
                                                <ChevronRight size={22} className={`transition-transform duration-300 ${sel?.open ? 'rotate-90 text-violet-500' : ''}`} />
                                            </button>
                                        </div>
                                        {sel?.open && (
                                            <div className="p-6 md:p-10 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {ch.topics.map(t => {
                                                        const active = sel.topics.includes(t._id);
                                                        return (
                                                            <label key={t._id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${active ? 'bg-white border-violet-200 text-violet-700 shadow-sm' : 'bg-white border-slate-200 opacity-60 text-slate-500 hover:opacity-100'}`}>
                                                                <input type="checkbox" className="w-5 h-5 rounded-lg accent-violet-600" checked={active} onChange={() => toggleTopic(activeSubjectId, ch.chapterId, t._id)} />
                                                                <span className="text-[11px] font-black uppercase tracking-tight truncate">{t.name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-8 bg-white border-t border-slate-100 shrink-0"><button onClick={() => setActiveSubjectId(null)} className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all hover:bg-violet-600">Finalize Subject Syllabus</button></div>
                    </div>
                </div>
            )}

            {/* STICKY FOOTER */}
            <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-8">
                <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-[3rem] p-1.5 shadow-[0_40px_80px_rgba(0,0,0,0.15)] flex gap-2">
                    <button onClick={handleSave} disabled={isSubmitting || !!createdTestId}
                        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2.8rem] font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-xl ${createdTestId ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200 hover:brightness-110'}`}
                    >
                        {createdTestId ? <CheckCircle2 size={18} /> : isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Layout size={18} />}
                        {createdTestId ? "blueprint saved" : "1. save blueprint"}
                    </button>
                    <button onClick={handleGenerate} disabled={isSubmitting || !createdTestId}
                        className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2.8rem] font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 text-white ${!createdTestId ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-blue-200 hover:brightness-110'}`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                        2. generate test
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDE9FE; border-radius: 20px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                .no-spinner { -moz-appearance: textfield; }
            `}} />
        </div>
    );
}