import React, { useState, useEffect } from 'react';
import {
    Database, ListChecks, Zap, CheckCircle2,
    BookOpen, Target, Clock, GraduationCap, LayoutGrid, Users, Calendar, Loader2
} from 'lucide-react';


export default function CustomFormView() {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const [formData, setFormData] = useState({
        title: "",
        pattern: "JEE MAINS",
        time: 180,
        distribution: "Single Set",
        selectedSingleSubject: "Physics", 
        selectedBatchIds: [],
        scheduleDate: "",
        scheduleTime: "",
        endTimeDate: "",
        endTimeTime: "",
        subjects: [
            { id: 'p', name: "Physics", qCount: 30, difficulty: "Med", chapters: [] },
            { id: 'c', name: "Chemistry", qCount: 30, difficulty: "Med", chapters: [] },
            { id: 'm', name: "Math", qCount: 30, difficulty: "Hard", chapters: [] }
        ]
    });

    const [availableBatches, setAvailableBatches] = useState([]);
    const [batchesLoading, setBatchesLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- NEW STATE FOR TWO-STEP FLOW ---
    const [createdTestId, setCreatedTestId] = useState(null);

    const syllabusData = {
        "Physics": { "Class 11th": ["Units & Measurement", "Kinematics", "Laws of Motion"], "Class 12th": ["Electrostatics", "Current Electricity", "Optics"] },
        "Chemistry": { "Class 11th": ["Basic Concepts", "Structure of Atom"], "Class 12th": ["Solutions", "Electrochemistry"] },
        "Math": { "Class 11th": ["Sets & Functions", "Trigonometry"], "Class 12th": ["Calculus", "Vectors"] },
        "Biology": { "Class 11th": ["Diversity", "Cell Structure"], "Class 12th": ["Reproduction", "Genetics"] }
    };

    /* ---------- FETCH BATCHES ---------- */
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${baseURL}/teacher/my-batches`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setAvailableBatches(Array.isArray(data) ? data : data.batches || []);
            } catch (err) {
                console.error("Batch fetch error:", err);
            } finally {
                setBatchesLoading(false);
            }
        };
        fetchBatches();
    }, []);

    /* ---------- STEP 1: CREATE TEST CONFIG ---------- */
    const handleSaveConfig = async () => {
        if (formData.selectedBatchIds.length === 0) return alert("Select at least one batch");
        if (!formData.title) return alert("Please enter a test title");

        setIsSubmitting(true);

        const startTime = formData.scheduleDate 
            ? new Date(`${formData.scheduleDate}T${formData.scheduleTime || '00:00'}`).toISOString() 
            : new Date().toISOString();

        const endTime = formData.endTimeDate 
            ? new Date(`${formData.endTimeDate}T${formData.endTimeTime || '23:59'}`).toISOString() 
            : "2030-01-01T00:00:00Z";

        const payload = {
            title: formData.title,
            batchIds: formData.selectedBatchIds,
            duration: parseInt(formData.time),
            startTime,
            endTime,
            configuration: formData.subjects.map(sub => ({
                subject: sub.name,
                questions: parseInt(sub.qCount),
                difficulty: sub.difficulty,
                chapters: sub.chapters
            })),
            metadata: {
                distribution: formData.distribution,
                pattern: formData.pattern
            }
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseURL}/teacher/create-custom-test`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok) {
                setCreatedTestId(result._id); // We got the ID! Unlocks Step 2
                alert("Configuration Saved! Now click 'Generate Questions' to finish.");
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) {
            alert("Network error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------- STEP 2: GENERATE QUESTIONS ---------- */
    const handleGenerateQuestions = async () => {
        if (!createdTestId) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${baseURL}/teacher/tests/${createdTestId}/generate`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const result = await res.json();
            if (res.ok) {
                alert("Questions Generated Successfully!");
                // Optionally redirect here
            } else {
                alert("Generation Error: " + result.message);
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (Keep handlePatternChange, toggleChapter, selectAllInClass exactly as they are)
    const handlePatternChange = (patternName) => {
        let newSubjects = [];
        if (patternName === "JEE MAINS" || patternName === "PCM") {
            newSubjects = [
                { id: 'p', name: "Physics", qCount: 30, difficulty: "Med", chapters: [] },
                { id: 'c', name: "Chemistry", qCount: 30, difficulty: "Med", chapters: [] },
                { id: 'm', name: "Math", qCount: 30, difficulty: "Hard", chapters: [] }
            ];
        } else if (patternName === "NEET" || patternName === "PCB") {
            newSubjects = [
                { id: 'p', name: "Physics", qCount: 45, difficulty: "Med", chapters: [] },
                { id: 'c', name: "Chemistry", qCount: 45, difficulty: "Med", chapters: [] },
                { id: 'b', name: "Biology", qCount: 90, difficulty: "Med", chapters: [] }
            ];
        } else if (patternName === "Single Subject") {
            newSubjects = [{ id: 's1', name: formData.selectedSingleSubject, qCount: 30, difficulty: "Med", chapters: [] }];
        }
        setFormData(prev => ({ ...prev, pattern: patternName, subjects: newSubjects }));
    };

    const handleSingleSubjectTypeChange = (subName) => {
        setFormData(prev => ({
            ...prev,
            selectedSingleSubject: subName,
            subjects: [{ id: 's1', name: subName, qCount: 30, difficulty: "Med", chapters: [] }]
        }));
    };

    const toggleChapter = (subjectId, chapter) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.map(sub => {
                if (sub.id === subjectId) {
                    const isSelected = sub.chapters.includes(chapter);
                    return { ...sub, chapters: isSelected ? sub.chapters.filter(c => c !== chapter) : [...sub.chapters, chapter] };
                }
                return sub;
            })
        }));
    };

    const selectAllInClass = (subjectId, subName, className) => {
        const classChapters = syllabusData[subName][className];
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.map(sub => {
                if (sub.id === subjectId) {
                    const otherChapters = sub.chapters.filter(c => !classChapters.includes(c));
                    const isClassFullySelected = classChapters.every(c => sub.chapters.includes(c));
                    return { ...sub, chapters: isClassFullySelected ? otherChapters : [...otherChapters, ...classChapters] };
                }
                return sub;
            })
        }));
    };

    const totalQuestions = formData.subjects.reduce((acc, sub) => acc + Number(sub.qCount || 0), 0);

    return (
        <div className="space-y-6 pb-40 max-w-5xl mx-auto px-4 pt-10">

            {/* HEADER CONFIG (Keep as is) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#673ab7]" />
                <input className="w-full text-4xl font-bold border-none outline-none mb-6" placeholder="Untitled Mock Test" onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                        <Clock size={16} className="text-slate-400" />
                        <input type="number" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="bg-transparent font-bold w-12 outline-none text-[#673ab7]" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Mins</span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                        <Target size={16} className="text-slate-400" />
                        <select className="bg-transparent font-bold outline-none text-[#673ab7] text-sm flex-1" value={formData.pattern} onChange={(e) => handlePatternChange(e.target.value)}>
                            <option value="JEE MAINS">JEE MAINS</option>
                            <option value="NEET">NEET</option>
                            <option value="PCM">PCM</option>
                            <option value="PCB">PCB</option>
                            <option value="Single Subject">Single Subject</option>
                        </select>
                        {formData.pattern === "Single Subject" && (
                            <select 
                                className="bg-white px-2 py-1 rounded-lg border border-slate-200 font-black text-[10px] text-slate-600 outline-none" 
                                value={formData.selectedSingleSubject} 
                                onChange={(e) => handleSingleSubjectTypeChange(e.target.value)}
                            >
                                {Object.keys(syllabusData).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        )}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                        <LayoutGrid size={16} className="text-slate-400" />
                        <select className="bg-transparent font-bold outline-none text-[#673ab7] text-sm flex-1" value={formData.distribution} onChange={(e) => setFormData({ ...formData, distribution: e.target.value })}>
                            <option value="Single Set">Single Set</option>
                            <option value="4 Sets">4 Sets</option>
                            <option value="Unique Every Student">Unique per Student</option>
                        </select>
                    </div>
                </div>

                {/* Batches & Timing (Keep as is) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-50">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Users size={14}/> Target Batches</label>
                        <div className="flex flex-wrap gap-2">
                            {batchesLoading ? <Loader2 className="animate-spin text-slate-300" /> : availableBatches.map(batch => (
                                <button key={batch._id} 
                                    onClick={() => {
                                        const ids = formData.selectedBatchIds.includes(batch._id) 
                                            ? formData.selectedBatchIds.filter(id => id !== batch._id) 
                                            : [...formData.selectedBatchIds, batch._id];
                                        setFormData({...formData, selectedBatchIds: ids});
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all ${formData.selectedBatchIds.includes(batch._id) ? 'bg-[#673ab7] border-[#673ab7] text-white' : 'bg-white text-slate-500 border-slate-200'}`}
                                >
                                    {batch.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-purple-600 uppercase">Start Time</label>
                            <div className="flex flex-col gap-1">
                                <input type="date" className="p-2 rounded-lg border text-xs font-bold outline-none" onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}/>
                                <input type="time" className="p-2 rounded-lg border text-xs font-bold outline-none" onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-red-500 uppercase">Expiry</label>
                            <div className="flex flex-col gap-1">
                                <input type="date" className="p-2 rounded-lg border text-xs font-bold outline-none" onChange={(e) => setFormData({...formData, endTimeDate: e.target.value})}/>
                                <input type="time" className="p-2 rounded-lg border text-xs font-bold outline-none" onChange={(e) => setFormData({...formData, endTimeTime: e.target.value})}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUBJECT CARD AREA (Keep as is) */}
            <div className="space-y-6">
                {formData.subjects.map((sub) => (
                    <div key={sub.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <BookOpen size={18} className="text-[#673ab7]" />
                                <h3 className="font-bold text-slate-800 uppercase">{sub.name} Configuration</h3>
                            </div>
                        </div>
                        <div className="p-8 grid lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-7 space-y-8">
                                {Object.entries(syllabusData[sub.name] || {}).map(([className, chapters]) => (
                                    <div key={className} className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><GraduationCap size={14} /> {className}</label>
                                            <button onClick={() => selectAllInClass(sub.id, sub.name, className)} className="text-[9px] font-bold text-[#673ab7] bg-purple-50 px-2 py-1 rounded-md">SELECT ALL</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {chapters.map(ch => (
                                                <div key={ch} onClick={() => toggleChapter(sub.id, ch)} className={`p-3 rounded-xl border text-[11px] font-bold cursor-pointer flex justify-between items-center transition-all ${sub.chapters.includes(ch) ? 'bg-purple-50 border-purple-200 text-[#673ab7]' : 'bg-white border-slate-100 text-slate-500'}`}>
                                                    {ch} {sub.chapters.includes(ch) && <CheckCircle2 size={14} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-5 space-y-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Difficulty</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Easy', 'Med', 'Hard'].map((level) => (
                                            <button key={level} onClick={() => setFormData(prev => ({ ...prev, subjects: prev.subjects.map(s => s.id === sub.id ? { ...s, difficulty: level } : s) }))} className={`py-3 text-[10px] font-black rounded-xl border ${sub.difficulty === level ? 'bg-[#673ab7] text-white' : 'bg-white text-slate-400'}`}>{level}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Total Questions for {sub.name}</label>
                                    <input type="number" value={sub.qCount} onChange={(e) => setFormData(prev => ({ ...prev, subjects: prev.subjects.map(s => s.id === sub.id ? { ...s, qCount: e.target.value } : s) }))} className="w-full bg-white p-4 rounded-2xl border border-slate-200 font-bold text-2xl outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* UPDATED STICKY FOOTER WITH TWO BUTTONS */}
{/* THE ULTRA-SLIM SIDE-BY-SIDE ACTION BAR */}
<div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
    <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end sm:items-center sm:gap-3">
            
            {/* Step 1: Save */}
            <button
                onClick={handleSaveConfig}
                disabled={isSubmitting || createdTestId !== null}
                className={`px-3 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-tight flex items-center justify-center gap-2 transition-all active:scale-95 border ${
                    createdTestId
                    ? 'bg-slate-50 text-slate-400 border-slate-100'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400 shadow-sm'
                }`}
            >
                {createdTestId ? <CheckCircle2 size={14} className="text-emerald-500" /> : isSubmitting ? <Loader2 className="animate-spin" size={14} /> : null}
                {createdTestId ? "Saved" : "1. Save"}
            </button>

            {/* Step 2: Generate */}
            <button
                onClick={handleGenerateQuestions}
                disabled={isSubmitting || !createdTestId}
                className={`px-3 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-tight flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                    !createdTestId
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100'
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-200/40'
                }`}
            >
                {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} className={createdTestId ? 'fill-current' : ''} />}
                2. Generate
            </button>
        </div>
    </div>
</div>
        </div>
    );
}