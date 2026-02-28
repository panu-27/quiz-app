import React, { useEffect, useState, useMemo } from "react";
import {
    ChevronRight, Clock, Target, Users, Zap, CheckCircle2, ChevronDown,
    Loader2, BookOpen, Hash, Search, X, Settings2, Plus, Layout, Calendar, XCircle, Check,
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
    const [openDifficulty, setOpenDifficulty] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

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
        <div className="min-h-screen bg-[#FDFDFF] pb-32 font-sans w-full sm:px-24 overflow-x-hidden">
            {/* FULL WIDTH HEADER */}
            <div className="sticky top-0 z-30 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl">
                <div className="mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
                    <div className="space-y-8">
                        {/* --- TITLE SECTION --- */}
                        <div className="relative group">
                            <input
                                placeholder="Untitled Mock Test..."
                                className="w-full bg-transparent text-3xl font-black uppercase tracking-tight text-slate-900 outline-none placeholder:text-slate-200 md:text-4xl transition-all focus:placeholder:text-slate-100"
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <div className="absolute -bottom-2 left-0 h-1 w-20 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                            {/* --- CONTROLS GROUP --- */}
                            {/* Mobile: 2-column grid | Desktop: Flex row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap items-center gap-3">

                                {/* Duration Card */}
                                <div className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-orange-200 hover:shadow-md h-[72px]">
                                    <div className="hidden sm:block rounded-xl bg-orange-50 p-2 text-orange-500 group-hover:scale-110 transition-transform">
                                        <Clock size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={formData.time}
                                                className="w-10 bg-transparent text-base font-black text-slate-800 outline-none no-spinner"
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                onWheel={(e) => e.target.blur()}
                                            />
                                            <span className="text-[9px] font-black text-slate-500">MIN</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pattern Card */}
                                <div className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:border-violet-200 hover:shadow-md h-[72px]">
                                    <div className="hidden sm:block rounded-xl bg-violet-50 p-2 text-violet-500 group-hover:scale-110 transition-transform">
                                        <Target size={20} />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0 md:min-w-20">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pattern</span>
                                        {/* EXAM PATTERN SELECTOR */}
                                        <div className="relative inline-block">
                                            {/* Trigger Button */}
                                            <button
                                                type="button"
                                                onClick={() => setActiveDropdownId(activeDropdownId === 'pattern-selector' ? null : 'pattern-selector')}
                                                className="flex items-center gap-2 bg-transparent text-[11px] font-black uppercase text-slate-800 outline-none transition-all hover:text-violet-600 group"
                                            >
                                                <span className="truncate">
                                                    {formData.pattern || "Select Pattern"}
                                                </span>
                                                <ChevronDown
                                                    size={12}
                                                    strokeWidth={4}
                                                    className={`transition-transform duration-300 ${activeDropdownId === 'pattern-selector' ? 'rotate-180 text-violet-500' : 'text-slate-400'}`}
                                                />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdownId === 'pattern-selector' && (
                                                <>
                                                    {/* Backdrop to close on outside click */}
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />

                                                    <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Exam Pattern</span>
                                                        </div>

                                                        <div className="p-1">
                                                            {[
                                                                { val: "PCM", label: "PCM (CET)" },
                                                                { val: "PCB", label: "PCB (CET)" },
                                                                { val: "JEE MAINS", label: "JEE MAINS" },
                                                                { val: "NEET", label: "NEET" },
                                                                { val: "SINGLE", label: "SINGLE SUBJECT" }
                                                            ].map((opt) => {
                                                                const isSelected = formData.pattern === opt.val;
                                                                return (
                                                                    <button
                                                                        key={opt.val}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handlePatternChange(opt.val);
                                                                            setActiveDropdownId(null);
                                                                        }}
                                                                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between
                                    ${isSelected
                                                                                ? 'bg-violet-600 text-white shadow-md shadow-violet-100'
                                                                                : 'text-slate-600 hover:bg-slate-50 hover:text-violet-600'
                                                                            }`}
                                                                    >
                                                                        <span>{opt.label}</span>
                                                                        {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule Toggle */}
                                <button
                                    onClick={() => setShowSchedule(!showSchedule)}
                                    className={`flex items-center gap-3 rounded-2xl border p-3 transition-all shadow-sm h-[72px] ${showSchedule
                                        ? "border-orange-200 bg-orange-50 text-orange-600 ring-2 ring-orange-100"
                                        : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:border-slate-200"
                                        }`}
                                >
                                    <Calendar size={20} className={showSchedule ? "text-orange-600" : "text-slate-400"} />
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">Timing</span>
                                        <span className="text-[11px] font-black uppercase">{showSchedule ? "Hide" : "Set"}</span>
                                    </div>
                                </button>

                                {/* Single Subject Picker (Conditional) */}
                                {formData.pattern === "SINGLE" ? (
                                    <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-3 shadow-sm animate-in zoom-in-95 duration-300 h-[72px]">
                                        <div className="hidden sm:block text-violet-600">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400">Target</span>
                                            {/* CUSTOM SUBJECT SELECTOR */}
                                            <div className="relative inline-block">
                                                {/* Trigger Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveDropdownId(activeDropdownId === 'subject-selector' ? null : 'subject-selector')}
                                                    className="flex items-center gap-2 bg-transparent text-[11px] font-black uppercase text-violet-800 outline-none transition-all hover:opacity-70 group"
                                                >
                                                    <span className="truncate max-w-[120px]">
                                                        {formData.selectedSingleSubject || "Select Subject"}
                                                    </span>
                                                    <ChevronDown
                                                        size={12}
                                                        strokeWidth={4}
                                                        className={`transition-transform duration-300 ${activeDropdownId === 'subject-selector' ? 'rotate-180' : ''}`}
                                                    />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdownId === 'subject-selector' && (
                                                    <>
                                                        {/* Click-outside backdrop */}
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)} />

                                                        <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Choose Subject</span>
                                                            </div>

                                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                                {configTree.map((s) => {
                                                                    const isSelected = formData.selectedSingleSubject === s.subjectName;
                                                                    return (
                                                                        <button
                                                                            key={s._id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFormData((prev) => ({ ...prev, selectedSingleSubject: s.subjectName }));
                                                                                handlePatternChange("SINGLE", configTree, s.subjectName);
                                                                                setActiveDropdownId(null); // Close after selection
                                                                            }}
                                                                            className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase transition-all flex items-center justify-between
                                    ${isSelected
                                                                                    ? 'bg-violet-50 text-violet-700'
                                                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-violet-600'
                                                                                }`}
                                                                        >
                                                                            <span className="truncate">{s.subjectName}</span>
                                                                            {isSelected && (
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Spacer to keep the 2x2 grid balanced when Pattern isn't SINGLE on mobile */
                                    <div className="hidden md:hidden" />
                                )}
                            </div>

                            {/* --- BATCH SELECTOR --- */}
                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                {availableBatches.map((batch) => {
                                    const isSelected = formData.selectedBatchIds.includes(batch._id);
                                    return (
                                        <button
                                            key={batch._id}
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    selectedBatchIds: isSelected
                                                        ? formData.selectedBatchIds.filter((id) => id !== batch._id)
                                                        : [...formData.selectedBatchIds, batch._id],
                                                })
                                            }
                                            className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 border ${isSelected
                                                ? "bg-slate-900 border-slate-900 text-white shadow-lg lg:-translate-y-0.5"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-violet-400 hover:text-violet-600"
                                                }`}
                                        >
                                            {batch.name}
                                            {isSelected && (
                                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- EXPANDABLE SCHEDULE SECTION --- */}
                        {showSchedule && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/80 rounded-[2rem] border border-slate-200/60 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 ml-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Test Start Window</label>
                                    </div>
                                    <div className="flex gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-inner focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                                        <input type="date" min={today} className="flex-1 bg-transparent px-2 text-xs font-bold outline-none cursor-pointer" onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })} />
                                        <div className="w-[1px] bg-slate-100 h-6" />
                                        <input type="time" className="bg-transparent px-2 text-xs font-bold outline-none cursor-pointer" onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 ml-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Deadline (End Window)</label>
                                    </div>
                                    <div className="flex gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-inner focus-within:ring-2 focus-within:ring-rose-100 transition-all">
                                        <input type="date" min={formData.scheduleDate || today} className="flex-1 bg-transparent px-2 text-xs font-bold outline-none cursor-pointer" onChange={(e) => setFormData({ ...formData, endTimeDate: e.target.value })} />
                                        <div className="w-[1px] bg-slate-100 h-6" />
                                        <input type="time" className="bg-transparent px-2 text-xs font-bold outline-none cursor-pointer" onChange={(e) => setFormData({ ...formData, endTimeTime: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SUBJECT GRID */}
            <div className="w-full mx-auto p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                    <h1>Q</h1>
                                    <input type="number" value={sub.qCount} onWheel={e => e.target.blur()} onChange={e => setFormData({ ...formData, subjects: formData.subjects.map(s => s.dbId === sub.dbId ? { ...s, qCount: e.target.value } : s) })} className="w-10 bg-transparent font-black text-sm outline-none text-slate-700 text-center no-spinner" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between mb-8 bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Complexity</span>
                                {/* CUSTOM SELECT COMPONENT */}
                                <div className="relative">
                                    {/* The Trigger Button */}
                                    <button
                                        onClick={() => setOpenDifficulty(openDifficulty === sub.dbId ? null : sub.dbId)}
                                        className="flex items-center justify-between gap-3 text-[10px] md:text-[11px] font-black uppercase text-violet-600 bg-white border border-slate-100 rounded-xl pl-4 pr-3 py-2 outline-none cursor-pointer hover:border-violet-200 shadow-sm transition-all min-w-[100px]"
                                    >
                                        <span>{sub.difficulty}</span>
                                        <ChevronDown
                                            size={12}
                                            strokeWidth={3}
                                            className={`transition-transform duration-300 ${openDifficulty === sub.dbId ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* The Custom Dropdown Menu */}
                                    {openDifficulty === sub.dbId && (
                                        <>
                                            {/* Invisible backdrop to close on click outside */}
                                            <div className="fixed inset-0 z-10" onClick={() => setOpenDifficulty(null)} />

                                            <div className="absolute right-0 mt-2 w-26 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                {['Easy', 'Med', 'Hard'].map((lvl) => (
                                                    <button
                                                        key={lvl}
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                subjects: formData.subjects.map(s => s.dbId === sub.dbId ? { ...s, difficulty: lvl } : s)
                                                            });
                                                            setOpenDifficulty(null);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase transition-colors flex items-center justify-between
                                                            ${sub.difficulty === lvl
                                                                ? 'bg-violet-50 text-violet-600'
                                                                : 'text-slate-500 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {lvl}
                                                        {sub.difficulty === lvl && <div className="w-1 h-1 rounded-full bg-violet-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-12 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setActiveSubjectId(null)} />

                    {/* CONTAINER: Max-width 6xl for side-by-side desktop */}
                    <div className="relative bg-white w-full h-full md:h-[85vh] md:max-w-6xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">

                        {/* HEADER */}
                        <div className="px-5 py-5 md:px-8 md:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                                    <BookOpen size={20} className="md:w-5 md:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter truncate leading-none">
                                        {activeSubjectData?.subjectName}
                                    </h2>
                                    <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 italic">Syllabus Blueprint</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveSubjectId(null)} className="p-2 text-slate-400 cursor-pointer hover:text-rose-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* BODY WRAPPER */}
                        <div className="flex flex-1 min-h-0 overflow-hidden">

                            {/* LEFT SIDE: Browse */}
                            <div className="flex-1 flex flex-col min-w-0 border-r border-slate-100">

                                {/* SEARCH & SELECT ALL ROW */}
                                <div className="px-4 md:px-8 py-3 md:py-4 bg-slate-50/50 border-b border-slate-100 shrink-0 flex items-center gap-3">
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500" size={14} />
                                        <input
                                            placeholder="Search chapters..."
                                            className="w-full bg-white border border-slate-200 rounded-xl md:rounded-lg pl-9 pr-3 py-2 md:py-2 text-[11px] md:text-xs font-bold text-slate-700 outline-none focus:border-violet-500 transition-all"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* FIXED SELECT ALL BUTTON: Logic now handles batch updates */}
                                    <button
                                        onClick={() => {
                                            const allCh = activeSubjectData.chapters;
                                            const sub = formData.subjects.find(s => s.dbId === activeSubjectId);
                                            const isAll = sub.chapters.length === allCh.length;

                                            // Logic: If not all selected, select all. If all selected, clear all.
                                            setFormData(prev => ({
                                                ...prev,
                                                subjects: prev.subjects.map(s => {
                                                    if (s.dbId !== activeSubjectId) return s;
                                                    return {
                                                        ...s,
                                                        chapters: !isAll ? allCh.map(ch => ({
                                                            chapterId: ch.chapterId,
                                                            topics: ch.topics.map(t => t._id),
                                                            open: false
                                                        })) : []
                                                    };
                                                })
                                            }));
                                        }}
                                        className={`h-9 md:h-10 px-4 rounded-xl md:rounded-lg border font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${formData.subjects.find(s => s.dbId === activeSubjectId).chapters.length === activeSubjectData.chapters.length
                                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                                            : 'bg-violet-600 text-white shadow-md'
                                            }`}
                                    >
                                        {formData.subjects.find(s => s.dbId === activeSubjectId).chapters.length === activeSubjectData.chapters.length
                                            ? <><XCircle size={14} /> Deselect All</>
                                            : <><CheckCircle2 size={14} /> Select All</>
                                        }
                                    </button>
                                </div>

                                {/* MAIN LIST */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 custom-scrollbar bg-slate-50/30">
                                    {filteredChapters.map(ch => {
                                        const sub = formData.subjects.find(s => s.dbId === activeSubjectId);
                                        const sel = sub.chapters.find(c => c.chapterId === ch.chapterId);
                                        return (
                                            <div key={ch.chapterId} className={`bg-white border transition-all rounded-xl overflow-x-hidden ${sel ? 'border-violet-200 shadow-sm' : 'border-slate-100'}`}>
                                                <div className="flex items-center">
                                                    <div className={`flex-1 min-w-0 flex items-center gap-3 p-3.5 cursor-pointer ${sel ? 'bg-violet-50/10' : 'hover:bg-slate-50'}`} onClick={() => toggleChapter(activeSubjectId, ch, !sel)}>
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${sel ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                                            {sel ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`text-xs font-black uppercase tracking-tight truncate ${sel ? 'text-violet-900' : 'text-slate-600'}`}>{ch.chapterName}</h4>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{sel ? `${sel.topics.length}/${ch.topics.length} Selected` : `${ch.topics.length} Topics`}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); if (!sel) return; setFormData(prev => ({ ...prev, subjects: prev.subjects.map(s => { if (s.dbId !== activeSubjectId) return s; return { ...s, chapters: s.chapters.map(c => c.chapterId === ch.chapterId ? { ...c, open: !c.open } : c) }; }) })); }} className={`p-4 border-l border-slate-100 transition-all ${!sel ? 'opacity-5 cursor-not-allowed' : 'hover:bg-violet-50 text-slate-400'}`}>
                                                        <ChevronRight size={16} className={`transition-transform duration-300 ${sel?.open ? 'rotate-90 text-violet-500' : ''}`} />
                                                    </button>
                                                </div>
                                                {sel?.open && (
                                                    <div className="p-3 bg-slate-50/30 border-t border-slate-100">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                            {ch.topics.map(t => {
                                                                const active = sel.topics.includes(t._id);
                                                                return (
                                                                    <label key={t._id} className={`relative flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${active ? 'bg-white border-violet-100 shadow-sm' : 'bg-white border-transparent'}`}>
                                                                        <input type="checkbox" className="sr-only" checked={active} onChange={() => toggleTopic(activeSubjectId, ch.chapterId, t._id)} />
                                                                        <div className={`flex items-center justify-center shrink-0 w-4 h-4 rounded ${active ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                                            {active ? <Check size={10} strokeWidth={4} /> : <div className="w-1 h-1 rounded-full bg-slate-400" />}
                                                                        </div>
                                                                        <span className="text-[10px] font-bold uppercase truncate text-slate-700">{t.name}</span>
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
                            </div>

                            {/* RIGHT SIDE: Selection Summary */}
                            <div className="hidden md:flex w-80 bg-slate-50 flex-col shrink-0">
                                <div className="p-5 border-b border-slate-200 bg-white">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-violet-600" /> Selections
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                                    {formData.subjects.find(s => s.dbId === activeSubjectId).chapters.map(selCh => {
                                        const chapterData = activeSubjectData.chapters.find(c => c.chapterId === selCh.chapterId);
                                        return (
                                            <div key={selCh.chapterId} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black text-violet-600 uppercase truncate pr-2">{chapterData?.chapterName}</span>
                                                    <button onClick={() => toggleChapter(activeSubjectId, chapterData, false)} className="text-slate-300 hover:text-rose-500"><XCircle size={14} /></button>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {selCh.topics.map(tId => {
                                                        const topic = chapterData?.topics.find(t => t._id === tId);
                                                        return (
                                                            <div key={tId} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-bold text-slate-500">
                                                                <span>{topic?.name}</span>
                                                                <button onClick={() => toggleTopic(activeSubjectId, selCh.chapterId, tId)} className="hover:text-rose-500"><X size={8} /></button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* FINALIZE BUTTON (DESKTOP) */}
                                <div className="p-5 bg-white border-t border-slate-200">
                                    <button
                                        onClick={() => setActiveSubjectId(null)}
                                        className="w-full py-3.5 bg-slate-950 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all hover:bg-violet-600"
                                    >
                                        Finalize Syllabus
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* MOBILE FOOTER */}
                        <div className="md:hidden p-4 bg-white border-t border-slate-100 shrink-0">
                            <button onClick={() => setActiveSubjectId(null)} className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                Finalize Syllabus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STICKY FOOTER */}
            <div className="fixed bottom-0 left-0 w-full px-4 pb-6 z-40">
                <div
                    className="
      max-w-2xl mx-auto
      bg-white/80 backdrop-blur-xl
      border border-slate-200/60
      rounded-[2rem]
      p-1.5
      shadow-[0_20px_50px_rgba(0,0,0,0.1)]
      flex gap-2
    "
                >
                    {/* SAVE BLUEPRINT */}
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting || !!createdTestId}
                        className={`
        flex-1 flex items-center justify-center gap-2
        py-3 rounded-[1.6rem]
        font-black uppercase text-[10px] tracking-widest
        transition-all active:scale-95
        ${createdTestId
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 hover:brightness-105"
                            }
      `}
                    >
                        {createdTestId ? (
                            <CheckCircle2 size={16} />
                        ) : isSubmitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <Layout size={16} />
                        )}
                        {createdTestId ? "Blueprint Saved" : "Save Blueprint"}
                    </button>

                    {/* GENERATE TEST */}
                    <button
                        onClick={handleGenerate}
                        disabled={isSubmitting || !createdTestId}
                        className={`
        flex-1 flex items-center justify-center gap-2
        py-3 rounded-[1.6rem]
        font-black uppercase text-[10px] tracking-widest
        transition-all active:scale-95
        ${!createdTestId
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-200 hover:brightness-105"
                            }
      `}
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <Zap size={16} />
                        )}
                        Generate Test
                    </button>
                </div>
            </div>


            <style dangerouslySetInnerHTML={{
                __html: `
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