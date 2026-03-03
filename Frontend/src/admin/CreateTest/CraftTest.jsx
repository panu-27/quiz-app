import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, Eye, Loader2, Zap,
  Trash2, X, Timer, Target, BookOpen, ChevronDown,
  AlertCircle, Code2, Layers, Hash
} from "lucide-react";

// KaTeX via CDN — loaded once
const ensureKatex = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve) => {
      if (window.katex) return resolve();
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });
    return promise;
  };
})();

function LatexText({ text }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!text || !ref.current) return;
    ensureKatex().then(() => {
      if (!ref.current) return;
      try {
        const html = text.replace(/\$([^$]+)\$/g, (_, expr) => {
          try { return window.katex.renderToString(expr, { throwOnError: false, displayMode: false }); }
          catch { return `$${expr}$`; }
        });
        ref.current.innerHTML = html;
      } catch { ref.current.textContent = text; }
    });
  }, [text]);
  return <span ref={ref} />;
}

const PATTERNS = [
  { val: "PCM",        label: "PCM (CET)"    },
  { val: "PCB",        label: "PCB (CET)"    },
  { val: "JEE MAINS",  label: "JEE MAINS"   },
  { val: "NEET",       label: "NEET"         },
  { val: "SINGLE",     label: "Single Subject"},
];

const SUBJECT_MAP = {
  PCM:         ["Physics", "Chemistry", "Mathematics"],
  PCB:         ["Physics", "Chemistry", "Biology"],
  "JEE MAINS": ["Physics", "Chemistry", "Mathematics"],
  NEET:        ["Physics", "Chemistry", "Biology"],
  SINGLE:      [],
};

const subjectAccent = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("phys")) return { bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-500",    text: "text-blue-700",    badge: "bg-blue-100 text-blue-700"    };
  if (n.includes("chem")) return { bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700"   };
  if (n.includes("math")) return { bg: "bg-violet-50",  border: "border-violet-200",  dot: "bg-violet-500",  text: "text-violet-700",  badge: "bg-violet-100 text-violet-700"  };
  if (n.includes("bio"))  return { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" };
  return { bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400", text: "text-slate-700", badge: "bg-slate-100 text-slate-600" };
};

export default function CraftTest() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [availableBatches, setAvailableBatches] = useState([]);
  const [configTree,       setConfigTree]       = useState([]);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [previewSubIdx,    setPreviewSubIdx]    = useState(null);
  const [activeDropdown,   setActiveDropdown]   = useState(null);

  const [testData, setTestData] = useState({
    title:                 "",
    pattern:               "PCM",
    duration:              180,
    selectedBatchIds:      [],
    selectedSingleSubject: "",
    subjects:              [],
  });

  /* ── fetch batches + config tree ── */
  useEffect(() => {
    const load = async () => {
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [bRes, tRes] = await Promise.all([
          fetch(`${baseURL}/teacher/my-batches`,       { headers }),
          fetch(`${baseURL}/bankQuestion/config-tree`, { headers }),
        ]);
        const bData = await bRes.json();
        const tData = await tRes.json();
        setAvailableBatches(Array.isArray(bData) ? bData : bData.batches || []);
        setConfigTree(tData);
        if (tData.length > 0) initSubjects("PCM", tData);
      } catch (e) { console.error(e); }
    };
    load();
  }, [baseURL]);

  /* ── subject initialiser ── */
  const initSubjects = (pattern, tree = configTree, singleName = null) => {
    const names = pattern === "SINGLE"
      ? [singleName || testData.selectedSingleSubject || tree[0]?.subjectName]
      : SUBJECT_MAP[pattern] || ["Physics"];

    const subjects = names.map(name => {
      const matched = tree.find(s => s.subjectName.toLowerCase().includes(name.toLowerCase()));
      return {
        id:        matched?._id || Math.random().toString(36),
        name:      matched?.subjectName || name,
        jsonRaw:   "",
        jsonError: null,
        questions: [],
        synced:    false,
      };
    });

    setTestData(prev => ({
      ...prev,
      pattern,
      subjects,
      selectedSingleSubject: pattern === "SINGLE"
        ? (singleName || prev.selectedSingleSubject || tree[0]?.subjectName)
        : prev.selectedSingleSubject,
    }));
  };

  /* ── JSON validation & parse ── */
  const handleJsonInput = (idx, raw) => {
    const updated = testData.subjects.map((s, i) => {
      if (i !== idx) return s;
      if (!raw.trim()) return { ...s, jsonRaw: raw, jsonError: null, questions: [], synced: false };
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Must be a JSON array");
        parsed.forEach((q, qi) => {
          if (!q.questionText && !q.text)                               throw new Error(`Q${qi + 1}: missing questionText`);
          if (!Array.isArray(q.options) || q.options.length < 2)       throw new Error(`Q${qi + 1}: options must be array of ≥2`);
          if (q.correctAnswer === undefined || q.correctAnswer === null) throw new Error(`Q${qi + 1}: missing correctAnswer (0-indexed)`);
        });
        return { ...s, jsonRaw: raw, jsonError: null, questions: parsed, synced: true };
      } catch (e) {
        return { ...s, jsonRaw: raw, jsonError: e.message, questions: [], synced: false };
      }
    });
    setTestData({ ...testData, subjects: updated });
  };

  const clearSubject = (idx) => {
    const updated = testData.subjects.map((s, i) =>
      i === idx ? { ...s, jsonRaw: "", jsonError: null, questions: [], synced: false } : s
    );
    setTestData({ ...testData, subjects: updated });
    if (previewSubIdx === idx) setPreviewSubIdx(null);
  };

  /* ── section mapper ── */
  const mapToSection = (sub) => ({
    subject:      sub.id,
    subjectName:  sub.name,
    numQuestions: sub.questions.length,
    questions: sub.questions.map(q => ({
      questionText: q.questionText || q.text,
      options: q.options.map(opt =>
        typeof opt === "string" ? { text: opt, image: null, isImageOption: false } : opt
      ),
      correctAnswer: q.correctAnswer,
      explanation:   q.explanation || "",
    })),
  });

  /* ── publish ── */
  const handlePublish = async () => {
    if (!testData.title)                   return alert("Please enter a test title");
    if (!testData.selectedBatchIds.length) return alert("Select at least one batch");

    setIsSubmitting(true);

    const typeMap   = { PCM: "PCM", PCB: "PCB", "JEE MAINS": "JEE", NEET: "NEET", SINGLE: "OTHER" };
    const total     = parseInt(testData.duration);

    // Auto times: now → now + 4 hours
    const startTime = new Date();
    const endTime   = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);

    let blocks = [];
    if (testData.pattern === "PCM") {
      blocks = [
        { blockName: "Physics & Chemistry", duration: total / 2, sections: testData.subjects.filter(s => /phys|chem/i.test(s.name)).map(mapToSection) },
        { blockName: "Mathematics",         duration: total / 2, sections: testData.subjects.filter(s => /math/i.test(s.name)).map(mapToSection) },
      ];
    } else if (testData.pattern === "PCB") {
      blocks = [
        { blockName: "Physics & Chemistry", duration: total / 2, sections: testData.subjects.filter(s => /phys|chem/i.test(s.name)).map(mapToSection) },
        { blockName: "Biology",             duration: total / 2, sections: testData.subjects.filter(s => /bio/i.test(s.name)).map(mapToSection) },
      ];
    } else {
      blocks = [{ blockName: "Session 1", duration: total, sections: testData.subjects.map(mapToSection) }];
    }

    const payload = {
      title:     testData.title,
      batchIds:  testData.selectedBatchIds,
      examType:  typeMap[testData.pattern] || "OTHER",
      duration:  total,
      startTime: startTime.toISOString(),
      endTime:   endTime.toISOString(),
      metadata:  { distribution: "Single Set" },
      blocks,
    };

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/craft-test`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Assessment Published Successfully!");
      } else {
        const e = await res.json();
        alert(e.message || "Failed to publish");
      }
    } catch {
      alert("Network Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allSynced  = testData.subjects.length > 0 && testData.subjects.every(s => s.synced);
  const previewSub = previewSubIdx !== null ? testData.subjects[previewSubIdx] : null;

  return (
    <div className="min-h-screen bg-[#F8F7FF] font-sans w-full overflow-x-hidden pb-28">

      {/* ═══════ HEADER ═══════ */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 px-4 py-4 w-full shadow-sm">
        <div className="max-w-[1920px] mx-auto space-y-3 px-2">

          <input
            placeholder="Untitled Exam..."
            value={testData.title}
            onChange={e => setTestData({ ...testData, title: e.target.value })}
            className="text-2xl md:text-4xl font-black bg-transparent border-none outline-none placeholder:text-slate-200 w-full tracking-tighter text-slate-900 uppercase"
          />

          <div className="flex flex-wrap items-center gap-2">

            {/* Duration */}
            <div className="bg-white shadow-sm px-3 py-2 rounded-2xl flex items-center gap-2 border border-slate-100">
              <Timer size={15} className="text-orange-500 shrink-0" />
              <input
                type="number"
                value={testData.duration}
                onWheel={e => e.target.blur()}
                onChange={e => setTestData({ ...testData, duration: e.target.value })}
                className="bg-transparent font-black w-9 outline-none text-xs text-slate-800 no-spinner"
              />
              <span className="text-[9px] font-black text-slate-400 uppercase">MIN</span>
            </div>

            {/* Pattern dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "pattern" ? null : "pattern")}
                className="bg-white shadow-sm px-3 py-2 rounded-2xl flex items-center gap-2 border border-slate-100 min-w-[130px] hover:border-violet-200 transition-all"
              >
                <Target size={15} className="text-violet-500 shrink-0" />
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Pattern</span>
                  <span className="text-[10px] font-black text-slate-800 uppercase">
                    {PATTERNS.find(p => p.val === testData.pattern)?.label}
                  </span>
                </div>
                <ChevronDown size={11} strokeWidth={3} className={`text-slate-400 transition-transform ${activeDropdown === "pattern" ? "rotate-180 text-violet-500" : ""}`} />
              </button>

              {activeDropdown === "pattern" && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exam Pattern</span>
                    </div>
                    <div className="p-1">
                      {PATTERNS.map(opt => {
                        const sel = testData.pattern === opt.val;
                        return (
                          <button key={opt.val}
                            onClick={() => { initSubjects(opt.val); setActiveDropdown(null); }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-between transition-all
                              ${sel ? "bg-violet-600 text-white shadow" : "text-slate-600 hover:bg-slate-50 hover:text-violet-600"}`}>
                            {opt.label}
                            {sel && <CheckCircle2 size={11} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Single subject picker */}
            {testData.pattern === "SINGLE" && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "subject" ? null : "subject")}
                  className="bg-violet-50 border border-violet-200 px-3 py-2 rounded-2xl flex items-center gap-2 min-w-[140px] hover:border-violet-400 transition-all"
                >
                  <BookOpen size={15} className="text-violet-500 shrink-0" />
                  <div className="flex flex-col flex-1 text-left">
                    <span className="text-[7px] font-black text-violet-400 uppercase tracking-widest leading-none mb-0.5">Subject</span>
                    <span className="text-[10px] font-black text-violet-800 uppercase truncate max-w-[90px]">
                      {testData.selectedSingleSubject || "Select"}
                    </span>
                  </div>
                  <ChevronDown size={11} strokeWidth={3} className={`text-violet-400 transition-transform ${activeDropdown === "subject" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "subject" && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden">
                      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Choose Subject</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {configTree.map(s => {
                          const sel = testData.selectedSingleSubject === s.subjectName;
                          return (
                            <button key={s._id}
                              onClick={() => { initSubjects("SINGLE", configTree, s.subjectName); setActiveDropdown(null); }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center justify-between transition-all
                                ${sel ? "bg-violet-600 text-white shadow" : "text-slate-600 hover:bg-slate-50 hover:text-violet-600"}`}>
                              <span className="truncate">{s.subjectName}</span>
                              {sel && <CheckCircle2 size={11} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Batch pills */}
            <div className="flex flex-wrap gap-1.5 items-center md:ml-auto">
              {availableBatches.map(b => {
                const sel = testData.selectedBatchIds.includes(b._id);
                return (
                  <button key={b._id}
                    onClick={() => setTestData({
                      ...testData,
                      selectedBatchIds: sel
                        ? testData.selectedBatchIds.filter(id => id !== b._id)
                        : [...testData.selectedBatchIds, b._id],
                    })}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border
                      ${sel
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-transparent text-white shadow-lg"
                        : "bg-white text-slate-400 border-slate-100 hover:border-violet-200"}`}>
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ MAIN SPLIT VIEW ═══════ */}
      <div className={`max-w-[1920px] mx-auto p-4 md:p-6 ${previewSub ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"}`}>

        {/* Subject cards */}
        {testData.subjects.map((sub, idx) => {
          const ac     = subjectAccent(sub.name);
          const synced = sub.synced;
          const active = previewSubIdx === idx;

          return (
            <div key={sub.id}
              className={`bg-white rounded-[2rem] border-2 flex flex-col transition-all duration-200 overflow-hidden
                ${active ? `${ac.border} shadow-2xl` : "border-slate-100 hover:border-slate-200 hover:shadow-md"}`}>

              {/* Card header */}
              <div className={`px-5 pt-5 pb-4 flex items-center justify-between ${active ? ac.bg : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${synced ? ac.dot : "bg-slate-200"}`} />
                  <div>
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">{sub.name}</h3>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${synced ? ac.text : "text-slate-300"}`}>
                      {synced ? `${sub.questions.length} Questions Ready` : "Paste JSON Below"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {synced && (
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${ac.badge}`}>
                      ✓ {sub.questions.length}Q
                    </span>
                  )}
                  {synced && (
                    <button
                      onClick={() => setPreviewSubIdx(previewSubIdx === idx ? null : idx)}
                      className={`p-2 rounded-xl transition-all
                        ${active ? `${ac.bg} ${ac.text} shadow-inner` : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                      <Eye size={14} />
                    </button>
                  )}
                  {sub.jsonRaw && (
                    <button onClick={() => clearSubject(idx)} className="p-2 bg-slate-50 text-slate-300 hover:text-rose-400 rounded-xl transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* JSON input */}
              <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Code2 size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <pre className="text-[8px] text-slate-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`[{
  "questionText": "...",  // supports $latex$
  "options": ["A","B","C","D"],
  "correctAnswer": 0,     // 0-indexed
  "explanation": "..."    // optional
}]`}
                  </pre>
                </div>

                <textarea
                  value={sub.jsonRaw}
                  onChange={e => handleJsonInput(idx, e.target.value)}
                  placeholder={`[\n  {\n    "questionText": "Find $x$ if $x^2=4$",\n    "options": ["1","2","3","4"],\n    "correctAnswer": 1\n  }\n]`}
                  className={`w-full h-52 text-[10px] font-mono leading-relaxed bg-slate-50 border-2 rounded-xl p-3 outline-none resize-none transition-all placeholder:text-slate-300
                    ${sub.jsonError
                      ? "border-rose-200 focus:border-rose-400 bg-rose-50/30"
                      : synced
                        ? ac.border
                        : "border-slate-100 focus:border-violet-200"}`}
                />

                {sub.jsonError && (
                  <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
                    <AlertCircle size={12} className="text-rose-500 mt-0.5 shrink-0" />
                    <p className="text-[9px] font-bold text-rose-600 font-mono">{sub.jsonError}</p>
                  </div>
                )}

                {synced && (
                  <div className={`flex items-center gap-2 ${ac.bg} ${ac.border} border rounded-xl px-3 py-2`}>
                    <CheckCircle2 size={12} className={ac.text} />
                    <span className={`text-[9px] font-black uppercase ${ac.text}`}>
                      {sub.questions.length} questions parsed — click eye to preview
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Preview panel */}
        {previewSub && (
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 flex flex-col overflow-hidden shadow-xl sticky top-[100px] max-h-[calc(100vh-140px)]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live Preview</p>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{previewSub.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${subjectAccent(previewSub.name).badge}`}>
                  <Hash size={9} className="inline mr-0.5" />{previewSub.questions.length}
                </span>
                <button onClick={() => setPreviewSubIdx(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              {previewSub.questions.map((q, qi) => {
                const opts = q.options || [];
                const ac   = subjectAccent(previewSub.name);
                return (
                  <div key={qi} className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`shrink-0 w-6 h-6 rounded-lg ${ac.badge} flex items-center justify-center text-[8px] font-black`}>
                          {qi + 1}
                        </span>
                        <p className="text-[12px] font-semibold text-slate-800 leading-relaxed">
                          <LatexText text={q.questionText || q.text} />
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 grid grid-cols-1 gap-1.5">
                      {opts.map((opt, oi) => {
                        const optText = typeof opt === "string" ? opt : opt.text;
                        const correct = q.correctAnswer === oi;
                        return (
                          <div key={oi}
                            className={`px-3 py-2 rounded-xl text-[10px] font-semibold flex items-center gap-2 border transition-all
                              ${correct ? `${ac.bg} ${ac.border} ${ac.text}` : "bg-white border-slate-100 text-slate-500"}`}>
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black shrink-0
                              ${correct ? `${ac.dot} text-white` : "bg-slate-100 text-slate-400"}`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <LatexText text={optText} />
                            {correct && <CheckCircle2 size={10} className={`ml-auto shrink-0 ${ac.text}`} />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mx-4 mb-4 px-3 py-2 bg-white border border-slate-100 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Explanation</p>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          <LatexText text={q.explanation} />
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ═══════ FOOTER ACTION BAR ═══════ */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-6 z-40">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex gap-2">
          <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] bg-slate-50 text-slate-400">
            <Layers size={15} />
            <span className="text-[10px] font-black uppercase">
              {testData.subjects.filter(s => s.synced).length}/{testData.subjects.length} Ready
            </span>
          </div>
          <button
            onClick={handlePublish}
            disabled={isSubmitting || !allSynced || !testData.selectedBatchIds.length}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 text-white
              ${!allSynced || !testData.selectedBatchIds.length
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-200 hover:brightness-105"}`}>
            {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <Zap size={15} />}
            Publish Test
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;0,800;0,900;1,400&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinner { -moz-appearance: textfield; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDE9FE; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .katex { font-size: 1em; }
      `}} />
    </div>
  );
}