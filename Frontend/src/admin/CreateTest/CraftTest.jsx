import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2, Eye, Loader2, Zap, Trash2, X,
  Timer, Target, BookOpen, ChevronDown, AlertCircle,
  Code2, Layers, Pencil, Save, RotateCcw
} from "lucide-react";

// ── KaTeX + auto-render — loaded once ────────────────────────────────────────
const ensureKatex = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve) => {
      if (window.katex && window.renderMathInElement) return resolve();

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      document.head.appendChild(link);

      // Lora + Source Sans for the preview modal
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@400;600&display=swap";
      document.head.appendChild(fontLink);

      const s1 = document.createElement("script");
      s1.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
      s1.onload = () => {
        const s2 = document.createElement("script");
        s2.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js";
        s2.onload = resolve;
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
    return promise;
  };
})();

const KATEX_OPTS = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$",  right: "$",  display: false },
  ],
  throwOnError: false,
};

// Renders KaTeX into a DOM element after fonts/scripts load
function KatexBlock({ html, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = html || "";
    ensureKatex().then(() => {
      if (!ref.current) return;
      window.renderMathInElement(ref.current, KATEX_OPTS);
    });
  }, [html]);
  return <span ref={ref} className={className} />;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PATTERNS = [
  { val: "PCM",       label: "PCM (CET)"     },
  { val: "PCB",       label: "PCB (CET)"     },
  { val: "JEE MAINS", label: "JEE MAINS"    },
  { val: "NEET",      label: "NEET"          },
  { val: "SINGLE",    label: "Single Subject" },
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

// ── Schema normaliser ─────────────────────────────────────────────────────────
const normalizeQuestion = (q, qi) => {
  if (!q.questionText && !q.text)
    throw new Error(`Q${qi + 1}: missing questionText`);
  if (!Array.isArray(q.options) || q.options.length < 2)
    throw new Error(`Q${qi + 1}: options must be an array of ≥2`);
  if (q.correctAnswer === undefined || q.correctAnswer === null)
    throw new Error(`Q${qi + 1}: missing correctAnswer (0-indexed)`);
  if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer >= q.options.length)
    throw new Error(`Q${qi + 1}: correctAnswer must be a valid 0-indexed number`);
  const normalizedOptions = q.options.map((opt, oi) => {
    if (typeof opt !== "object" || opt === null || Array.isArray(opt))
      throw new Error(`Q${qi + 1} option ${oi + 1}: must be { "text": "...", "image": null }`);
    if (opt.text === undefined)
      throw new Error(`Q${qi + 1} option ${oi + 1}: missing "text" field`);
    return { text: opt.text, image: opt.image ?? null };
  });
  return {
    questionText:  q.questionText || q.text,
    questionImage: q.questionImage ?? null,
    options:       normalizedOptions,
    correctAnswer: q.correctAnswer,
    explanation:   q.explanation || "",
  };
};

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW MODAL — full-screen, parchment aesthetic, editable per question
// ════════════════════════════════════════════════════════════════════════════
function PreviewModal({ subject, onClose, onSaveQuestions }) {
  // Local copy of questions so edits don't touch live data until Save
  const [questions, setQuestions] = useState(() =>
    subject.questions.map(q => ({ ...q, options: q.options.map(o => ({ ...o })) }))
  );
  const [editingIdx, setEditingIdx] = useState(null); // which question is being edited
  const [editDraft,  setEditDraft]  = useState(null);  // draft JSON string for that question
  const [editError,  setEditError]  = useState(null);
  const [dirty, setDirty] = useState(false);

  // Open a question for editing — draft is pretty-printed JSON of that one question
  const openEdit = (qi) => {
    setEditDraft(JSON.stringify([questions[qi]], null, 2));
    setEditError(null);
    setEditingIdx(qi);
  };

  const cancelEdit = () => { setEditingIdx(null); setEditDraft(null); setEditError(null); };

  const saveEdit = () => {
    try {
      const parsed = JSON.parse(editDraft);
      if (!Array.isArray(parsed) || parsed.length !== 1) throw new Error("Must be a JSON array with exactly one question");
      const norm = normalizeQuestion(parsed[0], editingIdx);
      const updated = questions.map((q, i) => i === editingIdx ? norm : q);
      setQuestions(updated);
      setDirty(true);
      cancelEdit();
    } catch (e) {
      setEditError(e.message);
    }
  };

  const saveAll = () => {
    onSaveQuestions(questions);
    setDirty(false);
    onClose();
  };

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      {/* Modal window */}
      <div
        className="relative flex flex-col mx-auto my-6 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: "min(820px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
          background: "#f0ebe3",
          backgroundImage: "radial-gradient(circle at 15% 20%, rgba(180,160,120,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(100,130,100,0.08) 0%, transparent 50%)",
        }}
      >
        {/* ── Modal header ── */}
        <div style={{ borderBottom: "2px solid #b8a882", background: "rgba(250,246,236,0.95)" }}
          className="flex items-center justify-between px-8 py-5 shrink-0">
          <div>
            <p style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: 11, color: "#7a6a4f", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Preview — {subject.name}
            </p>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "1.5rem", fontWeight: 600, color: "#1a1209", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {questions.length} Questions
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {dirty && (
              <button onClick={saveAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110 active:scale-95"
                style={{ background: "linear-gradient(135deg, #2e6e2e, #4a9a4a)", boxShadow: "0 4px 12px rgba(46,110,46,0.3)" }}>
                <Save size={14} />
                Save & Close
              </button>
            )}
            {!dirty && (
              <button onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "#ede5d0", color: "#4a3a18" }}>
                <X size={14} />
                Close
              </button>
            )}
            {dirty && (
              <button onClick={onClose}
                className="p-2 rounded-xl transition-all hover:opacity-70"
                style={{ background: "#ede5d0", color: "#7a6a4f" }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable questions list ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          style={{ fontFamily: "'Source Sans 3', sans-serif", scrollbarWidth: "thin", scrollbarColor: "#b8a882 transparent" }}>

          {questions.map((q, qi) => (
            <div key={qi}
              style={{ background: "#fffdf7", border: "1px solid #ddd5c0", borderRadius: 12, overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)", transition: "box-shadow 0.2s" }}>

              {/* Question header */}
              <div style={{ background: "#faf6ec", borderBottom: "1px solid #ede5d0", padding: "18px 22px 14px" }}
                className="flex items-start gap-4">
                {/* Number bubble */}
                <div style={{ width: 34, height: 34, background: "#3d2e10", color: "#f5e8c0", borderRadius: "50%",
                  fontFamily: "'Lora', serif", fontSize: "0.85rem", fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  {qi + 1}
                </div>

                {/* Question text */}
                <div className="flex-1 min-w-0">
                  {editingIdx === qi ? (
                    /* ── EDIT MODE ── */
                    <div className="space-y-2">
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#8a6a10", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Edit Question JSON
                      </p>
                      <textarea
                        value={editDraft}
                        onChange={e => { setEditDraft(e.target.value); setEditError(null); }}
                        rows={14}
                        style={{ width: "100%", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6,
                          background: "#fdf8ee", border: `1.5px solid ${editError ? "#e05a5a" : "#b8a882"}`,
                          borderRadius: 8, padding: "10px 12px", outline: "none", resize: "vertical",
                          color: "#2c2416" }}
                      />
                      {editError && (
                        <p style={{ fontSize: 11, color: "#c0392b", background: "#fde8e8", border: "1px solid #f5b7b7",
                          borderRadius: 6, padding: "6px 10px", fontFamily: "monospace" }}>
                          {editError}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button onClick={saveEdit}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                            background: "#3d2e10", color: "#f5e8c0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                            border: "none", cursor: "pointer" }}>
                          <Save size={12} /> Apply
                        </button>
                        <button onClick={cancelEdit}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                            background: "#ede5d0", color: "#7a6a4f", borderRadius: 8, fontSize: 12, fontWeight: 600,
                            border: "none", cursor: "pointer" }}>
                          <RotateCcw size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── VIEW MODE ── */
                    <div style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", lineHeight: 1.65, color: "#1a1209" }}>
                      <KatexBlock html={q.questionText} />
                      {q.questionImage && (
                        <img src={q.questionImage} alt="" style={{ display: "block", maxWidth: 280, marginTop: 12,
                          borderRadius: 8, border: "1px solid #ddd5c0" }} />
                      )}
                    </div>
                  )}
                </div>

                {/* Edit button */}
                {editingIdx !== qi && (
                  <button onClick={() => openEdit(qi)}
                    style={{ padding: "6px 10px", background: "#ede5d0", border: "1px solid #c8b890",
                      borderRadius: 8, color: "#7a6a4f", cursor: "pointer", display: "flex",
                      alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, flexShrink: 0,
                      marginTop: 2, whiteSpace: "nowrap" }}>
                    <Pencil size={11} /> Edit
                  </button>
                )}
              </div>

              {/* Options — only shown in view mode */}
              {editingIdx !== qi && (
                <div style={{ padding: "14px 22px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {q.options.map((opt, oi) => {
                    const correct = q.correctAnswer === oi;
                    return (
                      <div key={oi} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                        background: correct ? "#e8f4e8" : "#f5f0e6",
                        border: `1.5px solid ${correct ? "#5a9a5a" : "transparent"}`,
                        borderRadius: 8, fontSize: "0.97rem", lineHeight: 1.5,
                      }}>
                        <span style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: "0.9rem",
                          color: correct ? "#2e6e2e" : "#7a6a4f", minWidth: 20 }}>
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        <span style={{ flex: 1, color: correct ? "#1a3a1a" : "#2c2416" }}>
                          <KatexBlock html={opt.text} />
                          {opt.image && (
                            <img src={opt.image} alt="" style={{ maxWidth: 180, maxHeight: 130,
                              objectFit: "contain", borderRadius: 6, display: "block", marginTop: 4 }} />
                          )}
                        </span>
                        {correct && (
                          <span style={{ display: "inline-block", padding: "2px 8px", background: "#2e6e2e",
                            color: "#fff", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700,
                            letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              {editingIdx !== qi && q.explanation && (
                <div style={{ margin: "0 22px 18px", padding: "12px 16px", background: "#fdf8ee",
                  borderLeft: "3px solid #b8972a", borderRadius: "0 8px 8px 0",
                  fontSize: "0.93rem", lineHeight: 1.6, color: "#4a3a18" }}>
                  <strong style={{ color: "#8a6a10", fontFamily: "'Lora', serif", fontWeight: 600 }}>Explanation: </strong>
                  <KatexBlock html={q.explanation} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Modal footer ── */}
        <div style={{ borderTop: "1px solid #ddd5c0", background: "rgba(250,246,236,0.95)", padding: "14px 24px" }}
          className="flex items-center justify-between shrink-0">
          <p style={{ fontSize: 12, color: "#7a6a4f", fontFamily: "'Source Sans 3', sans-serif" }}>
            {dirty ? "⚠ Unsaved changes — click Save & Close to apply" : `${questions.length} questions · read-only preview`}
          </p>
          {dirty ? (
            <button onClick={saveAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #2e6e2e, #4a9a4a)" }}>
              <Save size={14} /> Save & Close
            </button>
          ) : (
            <button onClick={onClose}
              style={{ padding: "8px 20px", background: "#3d2e10", color: "#f5e8c0", borderRadius: 8,
                fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>
              Close Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function CraftTest() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [availableBatches, setAvailableBatches] = useState([]);
  const [configTree,       setConfigTree]       = useState([]);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [previewSubIdx,    setPreviewSubIdx]    = useState(null);  // opens modal
  const [activeDropdown,   setActiveDropdown]   = useState(null);

  const [testData, setTestData] = useState({
    title: "", pattern: "PCM", duration: 180,
    selectedBatchIds: [], selectedSingleSubject: "", subjects: [],
  });

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

  const initSubjects = (pattern, tree = configTree, singleName = null) => {
    const names = pattern === "SINGLE"
      ? [singleName || testData.selectedSingleSubject || tree[0]?.subjectName]
      : SUBJECT_MAP[pattern] || ["Physics"];
    const subjects = names.map(name => {
      const matched = tree.find(s => s.subjectName.toLowerCase().includes(name.toLowerCase()));
      return { id: matched?._id || Math.random().toString(36), name: matched?.subjectName || name,
               jsonRaw: "", jsonError: null, questions: [], synced: false };
    });
    setTestData(prev => ({
      ...prev, pattern, subjects,
      selectedSingleSubject: pattern === "SINGLE"
        ? (singleName || prev.selectedSingleSubject || tree[0]?.subjectName)
        : prev.selectedSingleSubject,
    }));
  };

  const handleJsonInput = (idx, raw) => {
    const updated = testData.subjects.map((s, i) => {
      if (i !== idx) return s;
      if (!raw.trim()) return { ...s, jsonRaw: raw, jsonError: null, questions: [], synced: false };
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Must be a JSON array [ ... ]");
        const normalized = parsed.map((q, qi) => normalizeQuestion(q, qi));
        return { ...s, jsonRaw: raw, jsonError: null, questions: normalized, synced: true };
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

  // Called when user saves edits inside the modal
  const handleModalSave = useCallback((subIdx, updatedQuestions) => {
    const updatedRaw = JSON.stringify(updatedQuestions, null, 2);
    const updated = testData.subjects.map((s, i) =>
      i === subIdx ? { ...s, questions: updatedQuestions, jsonRaw: updatedRaw, synced: true } : s
    );
    setTestData(prev => ({ ...prev, subjects: updated }));
  }, [testData.subjects]);

  const mapToSection = (sub) => ({
    subject: sub.id, subjectName: sub.name,
    numQuestions: sub.questions.length, questions: sub.questions,
  });

  const handlePublish = async () => {
    if (!testData.title)                   return alert("Please enter a test title");
    if (!testData.selectedBatchIds.length) return alert("Select at least one batch");
    setIsSubmitting(true);
    const typeMap = { PCM: "PCM", PCB: "PCB", "JEE MAINS": "JEE", NEET: "NEET", SINGLE: "OTHER" };
    const total   = parseInt(testData.duration);
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
    const payload = { title: testData.title, batchIds: testData.selectedBatchIds,
      examType: typeMap[testData.pattern] || "OTHER", duration: total,
      startTime: startTime.toISOString(), endTime: endTime.toISOString(),
      metadata: { distribution: "Single Set" }, blocks };
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/craft-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) { alert("Assessment Published Successfully!"); }
      else { const e = await res.json(); alert(e.message || "Failed to publish"); }
    } catch { alert("Network Error"); }
    finally { setIsSubmitting(false); }
  };

  const allSynced  = testData.subjects.length > 0 && testData.subjects.every(s => s.synced);
  const previewSub = previewSubIdx !== null ? testData.subjects[previewSubIdx] : null;

  return (
    <div className="min-h-screen bg-[#F8F7FF] font-sans w-full overflow-x-hidden pb-28">

      {/* ═══ HEADER ═══ */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 px-4 py-4 w-full shadow-sm">
        <div className="max-w-[1920px] mx-auto space-y-3 px-2">
          <input placeholder="Untitled Exam..."
            value={testData.title}
            onChange={e => setTestData({ ...testData, title: e.target.value })}
            className="text-2xl md:text-4xl font-black bg-transparent border-none outline-none placeholder:text-slate-200 w-full tracking-tighter text-slate-900 uppercase" />

          <div className="flex flex-wrap items-center gap-2">
            {/* Duration */}
            <div className="bg-white shadow-sm px-3 py-2 rounded-2xl flex items-center gap-2 border border-slate-100">
              <Timer size={15} className="text-orange-500 shrink-0" />
              <input type="number" value={testData.duration} onWheel={e => e.target.blur()}
                onChange={e => setTestData({ ...testData, duration: e.target.value })}
                className="bg-transparent font-black w-9 outline-none text-xs text-slate-800 no-spinner" />
              <span className="text-[9px] font-black text-slate-400 uppercase">MIN</span>
            </div>

            {/* Pattern */}
            <div className="relative">
              <button onClick={() => setActiveDropdown(activeDropdown === "pattern" ? null : "pattern")}
                className="bg-white shadow-sm px-3 py-2 rounded-2xl flex items-center gap-2 border border-slate-100 min-w-[130px] hover:border-violet-200 transition-all">
                <Target size={15} className="text-violet-500 shrink-0" />
                <div className="flex flex-col flex-1 text-left">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Pattern</span>
                  <span className="text-[10px] font-black text-slate-800 uppercase">{PATTERNS.find(p => p.val === testData.pattern)?.label}</span>
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
                          <button key={opt.val} onClick={() => { initSubjects(opt.val); setActiveDropdown(null); }}
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
                <button onClick={() => setActiveDropdown(activeDropdown === "subject" ? null : "subject")}
                  className="bg-violet-50 border border-violet-200 px-3 py-2 rounded-2xl flex items-center gap-2 min-w-[140px] hover:border-violet-400 transition-all">
                  <BookOpen size={15} className="text-violet-500 shrink-0" />
                  <div className="flex flex-col flex-1 text-left">
                    <span className="text-[7px] font-black text-violet-400 uppercase tracking-widest leading-none mb-0.5">Subject</span>
                    <span className="text-[10px] font-black text-violet-800 uppercase truncate max-w-[90px]">{testData.selectedSingleSubject || "Select"}</span>
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
                      <div className="max-h-60 overflow-y-auto p-1">
                        {configTree.map(s => {
                          const sel = testData.selectedSingleSubject === s.subjectName;
                          return (
                            <button key={s._id} onClick={() => { initSubjects("SINGLE", configTree, s.subjectName); setActiveDropdown(null); }}
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
                    onClick={() => setTestData({ ...testData, selectedBatchIds: sel ? testData.selectedBatchIds.filter(id => id !== b._id) : [...testData.selectedBatchIds, b._id] })}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border
                      ${sel ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-transparent text-white shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:border-violet-200"}`}>
                    {b.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SUBJECT CARDS GRID ═══ */}
      <div className="max-w-[1920px] mx-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {testData.subjects.map((sub, idx) => {
          const ac     = subjectAccent(sub.name);
          const synced = sub.synced;
          return (
            <div key={sub.id}
              className={`bg-white rounded-[2rem] border-2 flex flex-col transition-all duration-200 overflow-hidden border-slate-100 hover:border-slate-200 hover:shadow-md`}>

              <div className="px-5 pt-5 pb-4 flex items-center justify-between">
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
                    <button onClick={() => setPreviewSubIdx(idx)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all"
                      title="Full preview">
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

              <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Code2 size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <pre className="text-[8px] text-slate-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`[{
  "questionText": "...",        // supports $latex$
  "questionImage": null,        // optional image URL
  "options": [
    { "text": "A", "image": null },
    { "text": "B", "image": null },
    { "text": "C", "image": null },
    { "text": "D", "image": null }
  ],
  "correctAnswer": 0,           // 0-indexed
  "explanation": "..."          // optional
}]`}
                  </pre>
                </div>

                <textarea value={sub.jsonRaw} onChange={e => handleJsonInput(idx, e.target.value)}
                  placeholder={`[\n  {\n    "questionText": "Find $x$ if $x^2=4$",\n    "questionImage": null,\n    "options": [\n      { "text": "1", "image": null },\n      { "text": "2", "image": null },\n      { "text": "-2", "image": null },\n      { "text": "±2", "image": null }\n    ],\n    "correctAnswer": 3,\n    "explanation": "$x = \\\\pm 2$"\n  }\n]`}
                  className={`w-full h-52 text-[10px] font-mono leading-relaxed bg-slate-50 border-2 rounded-xl p-3 outline-none resize-none transition-all placeholder:text-slate-300
                    ${sub.jsonError ? "border-rose-200 focus:border-rose-400 bg-rose-50/30" : synced ? ac.border : "border-slate-100 focus:border-violet-200"}`}
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
                      {sub.questions.length} questions — click <Eye size={9} className="inline" /> to preview & edit
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-6 z-40">
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex gap-2">
          <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] bg-slate-50 text-slate-400">
            <Layers size={15} />
            <span className="text-[10px] font-black uppercase">{testData.subjects.filter(s => s.synced).length}/{testData.subjects.length} Ready</span>
          </div>
          <button onClick={handlePublish}
            disabled={isSubmitting || !allSynced || !testData.selectedBatchIds.length}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 text-white
              ${!allSynced || !testData.selectedBatchIds.length ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-200 hover:brightness-105"}`}>
            {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : <Zap size={15} />}
            Publish Test
          </button>
        </div>
      </div>

      {/* ═══ FULL-SCREEN PREVIEW MODAL ═══ */}
      {previewSub && previewSubIdx !== null && (
        <PreviewModal
          subject={previewSub}
          onClose={() => setPreviewSubIdx(null)}
          onSaveQuestions={(updated) => {
            handleModalSave(previewSubIdx, updated);
            setPreviewSubIdx(null);
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,700;0,800;0,900;1,400&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinner { -moz-appearance: textfield; }
        .katex { font-size: 1em; }
        .katex-display { margin: 10px 0; }
      `}} />
    </div>
  );
}