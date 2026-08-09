import React, { useState, useEffect, useRef } from "react";
import AdminLayout, { PageHeader } from "../AdminLayout";
import {
  CheckCircle2, Eye, Loader2, Zap, Trash2,
  Timer, Target, BookOpen, ChevronDown, AlertCircle,
  Code2, Layers, Pencil, Save, ArrowLeft, Users,
  FileText, ChevronRight, ChevronUp, Sparkles, Hash,
  Rocket, Clock,
} from "lucide-react";

/* ══════════════════════════════════════════
   KaTeX
══════════════════════════════════════════ */
const ensureKatex = (() => {
  let p = null;
  return () => {
    if (p) return p;
    p = new Promise(resolve => {
      if (window.katex && window.renderMathInElement) return resolve();
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
      document.head.appendChild(link);
      const fl = document.createElement("link");
      fl.rel = "stylesheet";
      fl.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@400;500;600&display=swap";
      document.head.appendChild(fl);
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
    return p;
  };
})();

const KATEX_OPTS = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$",  right: "$",  display: false },
    { left: "\\(", right: "\\)", display: false },
    { left: "\\[", right: "\\]", display: true },
  ],
  throwOnError: false,
};

function KatexBlock({ html }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = html || "";
    ensureKatex().then(() => {
      if (ref.current) window.renderMathInElement(ref.current, KATEX_OPTS);
    });
  }, [html]);
  return <span ref={ref} />;
}

/* ══════════════════════════════════════════
   Constants / helpers
══════════════════════════════════════════ */
const subjectColor = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("phys")) return { from:"#3b82f6", to:"#6366f1", light:"#eff6ff", border:"#bfdbfe", text:"#1d4ed8", dot:"#3b82f6" };
  if (n.includes("chem")) return { from:"#f59e0b", to:"#ef4444", light:"#fffbeb", border:"#fde68a", text:"#b45309", dot:"#f59e0b" };
  if (n.includes("math")) return { from:"#7c3aed", to:"#a78bfa", light:"#f5f3ff", border:"#ddd6fe", text:"#5b21b6", dot:"#7c3aed" };
  if (n.includes("bio"))  return { from:"#10b981", to:"#34d399", light:"#ecfdf5", border:"#a7f3d0", text:"#047857", dot:"#10b981" };
  return { from:"#6366f1", to:"#8b5cf6", light:"#f5f3ff", border:"#ddd6fe", text:"#4338ca", dot:"#6366f1" };
};

const PATTERNS = [
  { val:"PCM",        label:"PCM (CET)"      },
  { val:"PCB",        label:"PCB (CET)"      },
  { val:"JEE MAINS",  label:"JEE MAINS"      },
  { val:"NEET",       label:"NEET"           },
  { val:"SINGLE",     label:"Single Subject" },
];

const SUBJECT_MAP = {
  PCM:        ["Physics","Chemistry","Mathematics"],
  PCB:        ["Physics","Chemistry","Biology"],
  "JEE MAINS":["Physics","Chemistry","Mathematics"],
  NEET:       ["Physics","Chemistry","Biology"],
  SINGLE:     [],
};

const examBadge = (val) => {
  const m = {
    PCM:        { bg:"#f5f3ff", color:"#5b21b6", border:"#ddd6fe" },
    PCB:        { bg:"#ecfdf5", color:"#047857", border:"#a7f3d0" },
    "JEE MAINS":{ bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe" },
    NEET:       { bg:"#fffbeb", color:"#b45309", border:"#fde68a" },
    SINGLE:     { bg:"#f9fafb", color:"#6b7280", border:"#e5e7eb" },
  };
  return m[val] || m.SINGLE;
};

const OPT = ["A","B","C","D","E"];

const normalizeQuestion = (q, qi) => {
  if (!q.questionText && !q.text) throw new Error(`Q${qi+1}: missing questionText`);
  if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Q${qi+1}: options must be array ≥2`);
  if (q.correctAnswer === undefined || typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer >= q.options.length)
    throw new Error(`Q${qi+1}: correctAnswer must be valid 0-indexed number`);
  return {
    questionText: q.questionText || q.text,
    questionImage: q.questionImage ?? null,
    options: q.options.map((opt, oi) => {
      if (typeof opt !== "object" || !opt || Array.isArray(opt) || opt.text === undefined)
        throw new Error(`Q${qi+1} opt${oi+1}: must be {"text":"...","image":null}`);
      return { text: opt.text, image: opt.image ?? null };
    }),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || "",
  };
};

/* ══════════════════════════════════════════
   SLabel
══════════════════════════════════════════ */
function SLabel({ icon, label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
      <div style={{ width:17, height:17, borderRadius:4, background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {React.cloneElement(icon, { size:9, style:{ color:"#7c3aed" } })}
      </div>
      <span style={{ fontSize:9, fontWeight:800, color:"#374151", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
    </div>
  );
}

const SCHEMA_HINT = `[
  {
    "questionText": "Find $x$ if $x^2 = 4$",
    "questionImage": null,
    "options": [
      { "text": "±2", "image": null },
      { "text": "2",  "image": null }
    ],
    "correctAnswer": 0,
    "explanation": "Taking square root: $x = \\\\pm 2$"
  }
]`;

/* ══════════════════════════════════════════
   Publish Confirmation Modal
══════════════════════════════════════════ */
function PublishModal({ testData, subjects, onConfirm, onCancel, isSubmitting }) {
  const totalQ = subjects.reduce((acc, s) => acc + s.questions.length, 0);
  const badge  = examBadge(testData.pattern);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div style={{
        background:"#fff", borderRadius:22, maxWidth:420, width:"100%",
        boxShadow:"0 30px 80px rgba(0,0,0,0.22)",
        border:"1.5px solid #ede9f6",
        animation:"modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        overflow:"hidden",
      }}>
        <div style={{ height:4, background:"linear-gradient(90deg,#7c3aed,#6366f1,#3b82f6)" }} />
        <div style={{ padding:"24px 26px 26px" }}>
          {/* icon */}
          <div style={{
            width:50, height:50, borderRadius:15, marginBottom:16,
            background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",
            border:"1.5px solid #ddd6fe",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 6px 18px rgba(109,40,217,0.15)",
          }}>
            <Rocket size={22} style={{ color:"#7c3aed" }} />
          </div>

          <div style={{ fontSize:16, fontWeight:800, color:"#0f172a", marginBottom:4 }}>Ready to publish?</div>
          <div style={{ fontSize:12, color:"#64748b", marginBottom:20, lineHeight:1.6 }}>
            Review before sending this test live to students.
          </div>

          {/* summary */}
          <div style={{ background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:13, padding:"13px 15px", marginBottom:20, display:"flex", flexDirection:"column", gap:9 }}>
            {/* title row */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <FileText size={13} style={{ color:"#fff" }} />
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:800, color:"#0f172a" }}>{testData.title}</div>
                <div style={{ fontSize:9.5, color:"#94a3b8", fontWeight:500, marginTop:1 }}>Test Title</div>
              </div>
            </div>

            <div style={{ height:1, background:"#ede9fe" }} />

            {/* meta grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
              {[
                { icon:<Target size={10}/>,   label:"Pattern",   val: <span style={{ fontSize:9.5, fontWeight:800, padding:"2px 7px", borderRadius:5, background:badge.bg, color:badge.color, border:`1px solid ${badge.border}` }}>{testData.pattern}</span> },
                { icon:<Hash size={10}/>,     label:"Questions",  val:`${totalQ} total` },
                { icon:<Clock size={10}/>,    label:"Duration",   val:`${testData.duration} min` },
                { icon:<Users size={10}/>,    label:"Batches",    val:`${testData.selectedBatchIds.length} selected` },
              ].map((m,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:"#fff", border:"1px solid #ede9fe", display:"flex", alignItems:"center", justifyContent:"center", color:"#7c3aed", flexShrink:0 }}>
                    {m.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:8.5, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>{m.label}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#0f172a", marginTop:1 }}>{m.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height:1, background:"#ede9fe" }} />

            {/* subjects */}
            {subjects.map(s => {
              const ac = subjectColor(s.name);
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:`linear-gradient(135deg,${ac.from},${ac.to})`, flexShrink:0 }} />
                  <span style={{ fontSize:11, fontWeight:600, color:"#374151", flex:1 }}>{s.name}</span>
                  <span style={{ fontSize:11, fontWeight:800, color:ac.text }}>{s.questions.length}q</span>
                </div>
              );
            })}
          </div>

          <div style={{ display:"flex", gap:9 }}>
            <button onClick={onCancel} disabled={isSubmitting} style={{
              flex:1, padding:"10px 0", borderRadius:11, border:"1.5px solid #e5e7eb",
              background:"#fff", color:"#64748b", fontWeight:700, fontSize:12,
              cursor:"pointer", fontFamily:"inherit", transition:"background 0.13s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#f8f7ff"}
              onMouseLeave={e => e.currentTarget.style.background="#fff"}
            >
              Review Again
            </button>
            <button onClick={onConfirm} disabled={isSubmitting} style={{
              flex:2, padding:"10px 0", borderRadius:11, border:"none",
              background: isSubmitting ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#6366f1)",
              color: isSubmitting ? "#7c3aed" : "#fff",
              fontWeight:800, fontSize:12, cursor: isSubmitting ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              fontFamily:"inherit",
              boxShadow: isSubmitting ? "none" : "0 4px 14px rgba(109,40,217,0.3)",
              transition:"all 0.15s",
            }}>
              {isSubmitting
                ? <><Loader2 size={13} style={{ animation:"nexusSpin 1s linear infinite" }}/> Publishing…</>
                : <><Rocket size={13}/> Confirm & Publish</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Success Screen
══════════════════════════════════════════ */
function SuccessScreen({ testData, subjects, onReset }) {
  const totalQ = subjects.reduce((acc, s) => acc + s.questions.length, 0);
  const [count, setCount] = useState(6);

  useEffect(() => {
    const iv = setInterval(() => setCount(c => { 
      if (c <= 1) { onReset(); return 0; } 
      return c - 1; 
    }), 1000);
    return () => clearInterval(iv);
  }, [onReset]);

  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f8fafc", padding: 24, fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: 28, maxWidth: 380, width: "100%",
        boxShadow: "0 20px 50px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
        textAlign: "center", padding: "40px 32px", position: "relative",
        animation: "successPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}>
        {/* Minimal Progress Ring Decor */}
        <div style={{ 
          width: 80, height: 80, borderRadius: "50%", background: "#f0fdf4",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", border: "4px solid #dcfce7"
        }}>
          <CheckCircle2 size={32} style={{ color: "#16a34a" }} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
          Test Published
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 28px", lineHeight: 1.5 }}>
          <span style={{ color: "#7c3aed", fontWeight: 700 }}>{testData.title}</span> is now active for {testData.selectedBatchIds.length} batch{testData.selectedBatchIds.length !== 1 ? "es" : ""}.
        </p>

        {/* Stats Row */}
        <div style={{ 
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", 
          gap: 12, marginBottom: 32, borderTop: "1px solid #f1f5f9", 
          borderBottom: "1px solid #f1f5f9", padding: "16px 0" 
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{totalQ}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Questions</div>
          </div>
          <div style={{ borderLeft: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{testData.duration}m</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Time</div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{testData.selectedBatchIds.length}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Batches</div>
          </div>
        </div>

        <button onClick={onReset} style={{
          width: "100%", padding: "14px 0", borderRadius: 14,
          background: "#1e293b", color: "#fff", border: "none", 
          fontWeight: 700, fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "transform 0.2s"
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <Zap size={15} fill="currentColor"/> Create Another
        </button>

        <div style={{ 
          marginTop: 20, fontSize: 11, color: "#cbd5e1", 
          fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 
        }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#cbd5e1" }} />
          Auto-reset in {count}s
        </div>

        <style>{`
          @keyframes successPop {
            from { opacity: 0; transform: scale(0.9) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   QuestionCard
══════════════════════════════════════════ */
function QuestionCard({ q, qi, total, ac, onEdit }) {
  const [showExp, setShowExp] = useState(false);

  return (
    <div style={{
      background:"#fff", borderRadius:13,
      border:"1.5px solid #e9e8f0",
      overflow:"hidden",
      boxShadow:"0 1px 6px rgba(0,0,0,0.04)",
      transition:"box-shadow 0.2s, border-color 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 6px 20px ${ac.dot}18`; e.currentTarget.style.borderColor=ac.border; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 1px 6px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor="#e9e8f0"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      {/* header */}
      <div style={{
        background:`linear-gradient(135deg,${ac.light},${ac.light}88,#f8f7ff)`,
        borderBottom:`1px solid ${ac.border}`,
        padding:"9px 15px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:26, height:26, borderRadius:7,
            background:`linear-gradient(135deg,${ac.from},${ac.to})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, boxShadow:`0 2px 6px ${ac.dot}40`,
          }}>
            <span style={{ fontSize:11, fontWeight:900, color:"#fff" }}>{qi+1}</span>
          </div>
          <span style={{ fontSize:9, fontWeight:800, color:ac.text, textTransform:"uppercase", letterSpacing:"0.1em" }}>
            Q{qi+1} <span style={{ opacity:0.4, fontWeight:500 }}>/ {total}</span>
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:3, background:"#ecfdf5", border:"1px solid #6ee7b7", padding:"3px 7px", borderRadius:99 }}>
            <CheckCircle2 size={9} style={{ color:"#059669" }} />
            <span style={{ fontSize:9, fontWeight:800, color:"#047857" }}>{OPT[q.correctAnswer] ?? q.correctAnswer}</span>
          </div>
          <button onClick={() => onEdit(qi)} style={{
            all:"unset", cursor:"pointer",
            display:"flex", alignItems:"center", gap:4,
            padding:"4px 9px", borderRadius:7,
            background:`${ac.dot}12`, color:ac.dot,
            fontSize:10, fontWeight:700,
            border:`1.5px solid ${ac.border}`,
            transition:"all 0.13s",
          }}
            onMouseEnter={e => e.currentTarget.style.background=ac.light}
            onMouseLeave={e => e.currentTarget.style.background=`${ac.dot}12`}
          >
            <Pencil size={10} /> Edit
          </button>
        </div>
      </div>

      {/* body */}
      <div style={{ padding:"13px 15px 15px" }}>
        <div style={{
          fontSize:13, fontWeight:500, color:"#0f172a",
          lineHeight:1.85, fontFamily:"Lora, serif",
          marginBottom:12, letterSpacing:"0.01em",
        }}>
          <KatexBlock html={q.questionText || ""} />
        </div>

        {/* options */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {q.options.map((opt, oi) => {
            const correct = q.correctAnswer === oi;
            return (
              <div key={oi} style={{
                padding:"8px 10px", borderRadius:10,
                border:`1.5px solid ${correct ? "#6ee7b7" : "#efefef"}`,
                background: correct ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "#fafafa",
                display:"flex", alignItems:"flex-start", gap:7,
                boxShadow: correct ? "0 2px 6px rgba(16,185,129,0.11)" : "none",
              }}>
                <div style={{
                  width:20, height:20, borderRadius:"50%",
                  background: correct ? "linear-gradient(135deg,#10b981,#059669)" : "#f0f0f0",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:9.5, fontWeight:800,
                  color: correct ? "#fff" : "#9ca3af",
                  flexShrink:0, marginTop:1,
                  boxShadow: correct ? "0 2px 5px rgba(16,185,129,0.34)" : "none",
                }}>
                  {OPT[oi]}
                </div>
                <span style={{
                  fontSize:11.5, lineHeight:1.65, flex:1,
                  fontFamily:"Source Sans 3, sans-serif",
                  fontWeight: correct ? 600 : 400,
                  color: correct ? "#065f46" : "#374151",
                }}>
                  <KatexBlock html={opt.text || ""} />
                </span>
                {correct && <CheckCircle2 size={11} style={{ color:"#10b981", flexShrink:0, marginTop:2 }} />}
              </div>
            );
          })}
        </div>

        {/* explanation */}
        {q.explanation && (
          <div style={{ marginTop:11 }}>
            <button onClick={() => setShowExp(v => !v)} style={{
              all:"unset", cursor:"pointer",
              display:"inline-flex", alignItems:"center", gap:5,
              fontSize:10, fontWeight:700, color:"#92400e",
              padding:"4px 9px", borderRadius:7,
              background:"#fffbeb", border:"1px solid #fde68a",
              transition:"background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#fef3c7"}
              onMouseLeave={e => e.currentTarget.style.background="#fffbeb"}
            >
              <Sparkles size={9} style={{ color:"#f59e0b" }} />
              Explanation
              {showExp ? <ChevronUp size={9}/> : <ChevronRight size={9}/>}
            </button>
            {showExp && (
              <div style={{
                marginTop:6, padding:"10px 13px",
                background:"linear-gradient(135deg,#fffbeb,#fef9c3)",
                border:"1.5px solid #fde68a", borderRadius:9,
                fontSize:12, color:"#78350f",
                lineHeight:1.8, fontFamily:"Source Sans 3, sans-serif",
              }}>
                <KatexBlock html={q.explanation} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   EditPanel
══════════════════════════════════════════ */
function EditPanel({ qi, draft, error, onChange, onSave, onCancel, ac }) {
  return (
    <div style={{ background:"#fff", borderRadius:13, border:`1.5px solid ${ac.border}`, overflow:"hidden", boxShadow:`0 4px 16px ${ac.dot}16` }}>
      <div style={{ padding:"9px 15px", background:`linear-gradient(135deg,${ac.light},#fafafa)`, borderBottom:`1px solid ${ac.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:27, height:27, borderRadius:7, background:`linear-gradient(135deg,${ac.from},${ac.to})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Pencil size={11} style={{ color:"#fff" }} />
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:"#0f172a" }}>Editing Q{qi+1}</div>
            <div style={{ fontSize:9.5, color:"#94a3b8", marginTop:1 }}>Edit JSON then click Apply</div>
          </div>
        </div>
        <button onClick={onCancel} style={{ all:"unset", cursor:"pointer", fontSize:10.5, fontWeight:700, color:"#64748b", padding:"4px 9px", borderRadius:7, background:"#f1f5f9", border:"1.5px solid #e5e7eb" }}>Cancel</button>
      </div>
      <div style={{ padding:"13px 15px 15px", display:"flex", flexDirection:"column", gap:8 }}>
        <textarea value={draft} onChange={e => onChange(e.target.value)} style={{ width:"100%", boxSizing:"border-box", minHeight:190, background: error ? "#fff8f8" : "#fafbff", border:`1.5px solid ${error ? "#fca5a5" : "#ddd6fe"}`, borderRadius:10, padding:11, fontSize:10, fontFamily:"monospace", lineHeight:1.8, outline:"none", resize:"vertical", color:"#374151" }} />
        {error && (
          <div style={{ display:"flex", gap:6, background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"8px 10px" }}>
            <AlertCircle size={11} style={{ color:"#ef4444", flexShrink:0, marginTop:1 }} />
            <span style={{ fontSize:10, color:"#ef4444", fontFamily:"monospace", lineHeight:1.6 }}>{error}</span>
          </div>
        )}
        <button onClick={onSave} style={{ padding:"8px 16px", background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", border:"none", borderRadius:9, fontSize:11, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:"0 3px 10px rgba(109,40,217,0.24)", alignSelf:"flex-start", transition:"opacity 0.13s" }}
          onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity="1"}
        >
          <Save size={11} /> Apply Changes
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PreviewPanel
══════════════════════════════════════════ */
function PreviewPanel({ sub, questions, setQuestions, onBack, onSyncBack }) {
  const ac = subjectColor(sub.name);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editDraft,  setEditDraft]  = useState("");
  const [editError,  setEditError]  = useState(null);
  const withExp = questions.filter(q => q.explanation);

  const startEdit = (qi) => { setEditDraft(JSON.stringify([questions[qi]], null, 2)); setEditError(null); setEditingIdx(qi); };
  const saveEdit  = () => {
    try {
      const parsed = JSON.parse(editDraft);
      if (!Array.isArray(parsed) || parsed.length !== 1) throw new Error("Must be a JSON array with exactly one question");
      const norm    = normalizeQuestion(parsed[0], editingIdx);
      const updated = questions.map((q, i) => i === editingIdx ? norm : q);
      setQuestions(updated);
      onSyncBack(updated);
      setEditingIdx(null); setEditDraft(""); setEditError(null);
    } catch(e) { setEditError(e.message); }
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
      {/* top bar */}
      <div style={{ padding:"8px 15px", background:"#fff", borderBottom:"1px solid #ede9f6", flexShrink:0, display:"flex", alignItems:"center", gap:9 }}>
        <button onClick={onBack} style={{ all:"unset", cursor:"pointer", display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, background:"#f5f3ff", color:"#7c3aed", fontSize:11, fontWeight:700, border:"1.5px solid #ddd6fe", transition:"background 0.13s", flexShrink:0 }}
          onMouseEnter={e => e.currentTarget.style.background="#ede9fe"}
          onMouseLeave={e => e.currentTarget.style.background="#f5f3ff"}
        >
          <ArrowLeft size={11} /> Back
        </button>
        <div style={{ padding:"3px 10px", borderRadius:99, background:`linear-gradient(135deg,${ac.from},${ac.to})`, boxShadow:`0 2px 7px ${ac.dot}36`, flexShrink:0 }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#fff", letterSpacing:"0.06em" }}>{sub.name}</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:800, color:"#0f172a" }}>Question Preview</div>
          <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{questions.length} questions · {withExp.length} with explanations</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:11, flexShrink:0 }}>
          {[
            { icon:<Hash size={10}/>,        label:"Total", val:questions.length,                                        color:ac.text  },
            { icon:<CheckCircle2 size={10}/>, label:"Keyed", val:questions.filter(q=>q.correctAnswer!==undefined).length, color:"#047857" },
            { icon:<Sparkles size={10}/>,     label:"Hints", val:withExp.length,                                          color:"#b45309" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ color:s.color, opacity:0.7 }}>{s.icon}</span>
              <span style={{ fontSize:11, fontWeight:800, color:s.color }}>{s.val}</span>
              <span style={{ fontSize:10, color:"#94a3b8" }}>{s.label}</span>
              {i < 2 && <div style={{ width:1, height:11, background:"#e2e8f0", marginLeft:3 }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"14px 18px 36px", background:"#f4f3fa" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:11, maxWidth:800, margin:"0 auto" }}>
          {questions.map((q, qi) => (
            editingIdx === qi ? (
              <EditPanel key={qi} qi={qi} draft={editDraft} error={editError} onChange={setEditDraft} onSave={saveEdit} onCancel={() => { setEditingIdx(null); setEditError(null); }} ac={ac} />
            ) : (
              <QuestionCard key={qi} q={q} qi={qi} total={questions.length} ac={ac} onEdit={startEdit} />
            )
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main
══════════════════════════════════════════ */
export default function CraftTest() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [availableBatches, setAvailableBatches] = useState([]);
  const [configTree,       setConfigTree]       = useState([]);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [activeDropdown,   setActiveDropdown]   = useState(null);
  const [rightView,        setRightView]        = useState("cards");
  const [previewSubIdx,    setPreviewSubIdx]    = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);

  const [testData, setTestData] = useState({
    title:"", pattern:"PCM", duration:180,
    selectedBatchIds:[], selectedSingleSubject:"", subjects:[],
  });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const h = { Authorization:`Bearer ${token}` };
        const [bR, tR] = await Promise.all([
          fetch(`${baseURL}/teacher/my-batches`,       { headers:h }),
          fetch(`${baseURL}/bankQuestion/config-tree`, { headers:h }),
        ]);
        const bD = await bR.json(); const tD = await tR.json();
        setAvailableBatches(Array.isArray(bD) ? bD : bD.batches || []);
        setConfigTree(tD);
        if (tD.length > 0) initSubjects("PCM", tD);
      } catch(e) { console.error(e); }
    })();
  }, [baseURL]);

  const initSubjects = (pattern, tree = configTree, singleName = null) => {
    const names = pattern === "SINGLE"
      ? [singleName || testData.selectedSingleSubject || tree[0]?.subjectName]
      : SUBJECT_MAP[pattern] || ["Physics"];
    const subjects = names.map(name => {
      const m = tree.find(s => s.subjectName.toLowerCase().includes(name.toLowerCase()));
      return { id: m?._id || Math.random().toString(36), name: m?.subjectName || name, jsonRaw:"", jsonError:null, questions:[], synced:false };
    });
    setTestData(prev => ({ ...prev, pattern, subjects, selectedSingleSubject: pattern === "SINGLE" ? (singleName || prev.selectedSingleSubject || tree[0]?.subjectName) : prev.selectedSingleSubject }));
    setRightView("cards"); setPreviewSubIdx(null);
  };

  const handleJsonInput = (idx, raw) => {
    const updated = testData.subjects.map((s, i) => {
      if (i !== idx) return s;
      if (!raw.trim()) return { ...s, jsonRaw:raw, jsonError:null, questions:[], synced:false };
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Must be a JSON array [ ... ]");
        return { ...s, jsonRaw:raw, jsonError:null, questions:parsed.map((q,qi)=>normalizeQuestion(q,qi)), synced:true };
      } catch(e) { return { ...s, jsonRaw:raw, jsonError:e.message, questions:[], synced:false }; }
    });
    setTestData({ ...testData, subjects:updated });
  };

  const openPreview   = (idx) => { setPreviewSubIdx(idx); setPreviewQuestions([...testData.subjects[idx].questions]); setRightView("preview"); };
  const syncEditedBack = (idx, updatedQs) => { setTestData(prev => ({ ...prev, subjects: prev.subjects.map((s, i) => i === idx ? { ...s, questions: updatedQs, jsonRaw: JSON.stringify(updatedQs, null, 2) } : s) })); };
  const clearSubject   = (idx) => { setTestData({ ...testData, subjects: testData.subjects.map((s,i) => i===idx ? { ...s, jsonRaw:"", jsonError:null, questions:[], synced:false } : s) }); if (previewSubIdx === idx) { setRightView("cards"); setPreviewSubIdx(null); } };
  const mapToSection   = sub => ({ subject: sub.id, subjectName: sub.name, numQuestions: sub.questions.length, questions: sub.questions });

  const doPublish = async () => {
    setIsSubmitting(true);
    const typeMap = { PCM:"PCM", PCB:"PCB", "JEE MAINS":"JEE", NEET:"NEET", SINGLE:"OTHER" };
    const total = parseInt(testData.duration);
    const startTime = new Date();
    const endTime   = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
    let blocks = [];
    if (testData.pattern === "PCM")      blocks = [{ blockName:"Physics & Chemistry", duration:total/2, sections:testData.subjects.filter(s=>/phys|chem/i.test(s.name)).map(mapToSection) }, { blockName:"Mathematics", duration:total/2, sections:testData.subjects.filter(s=>/math/i.test(s.name)).map(mapToSection) }];
    else if (testData.pattern === "PCB") blocks = [{ blockName:"Physics & Chemistry", duration:total/2, sections:testData.subjects.filter(s=>/phys|chem/i.test(s.name)).map(mapToSection) }, { blockName:"Biology", duration:total/2, sections:testData.subjects.filter(s=>/bio/i.test(s.name)).map(mapToSection) }];
    else                                 blocks = [{ blockName:"Session 1", duration:total, sections:testData.subjects.map(mapToSection) }];
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseURL}/teacher/craft-test`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ title:testData.title, batchIds:testData.selectedBatchIds, examType:typeMap[testData.pattern]||"OTHER", duration:total, startTime:startTime.toISOString(), endTime:endTime.toISOString(), metadata:{ distribution:"Single Set" }, blocks }),
      });
      if (res.ok) { setShowPublishModal(false); setShowSuccess(true); }
      else { const e = await res.json(); alert(e.message || "Failed to publish"); setShowPublishModal(false); }
    } catch { alert("Network Error"); setShowPublishModal(false); }
    finally { setIsSubmitting(false); }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setTestData({ title:"", pattern:"PCM", duration:180, selectedBatchIds:[], selectedSingleSubject:"", subjects:[] });
    setRightView("cards"); setPreviewSubIdx(null);
    if (configTree.length > 0) initSubjects("PCM", configTree);
  };

  const allSynced  = testData.subjects.length > 0 && testData.subjects.every(s => s.synced);
  const syncedCount = testData.subjects.filter(s => s.synced).length;
  const badge      = examBadge(testData.pattern);
  const canPublish = allSynced && testData.selectedBatchIds.length > 0 && testData.title.trim().length > 0;

  return (
    <AdminLayout>
      <PageHeader
        title="Craft Test"
        subtitle="Paste JSON · preview · publish"
        right={
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, background:allSynced?"#ecfdf5":"#f5f3ff", border:`1.5px solid ${allSynced?"#a7f3d0":"#ddd6fe"}`, padding:"5px 10px", borderRadius:8, fontSize:11, fontWeight:700, color:allSynced?"#047857":"#7c3aed" }}>
              {allSynced ? <><CheckCircle2 size={11}/> All Ready</> : <><span style={{ fontSize:10, opacity:0.75 }}>{syncedCount}/{testData.subjects.length}</span> Synced</>}
            </div>
            <button
              onClick={() => {
                if (!testData.title)                   return alert("Please enter a test title");
                if (!testData.selectedBatchIds.length) return alert("Select at least one batch");
                if (!allSynced)                        return alert("Validate JSON for all subjects first");
                setShowPublishModal(true);
              }}
              disabled={isSubmitting}
              style={{ display:"flex", alignItems:"center", gap:5, background:canPublish?(isSubmitting?"#f5f3ff":"linear-gradient(135deg,#3b82f6,#7c3aed)"):"#f3f4f6", color:canPublish?(isSubmitting?"#7c3aed":"#fff"):"#94a3b8", padding:"7px 15px", borderRadius:9, fontSize:12, fontWeight:800, border:"none", cursor:canPublish&&!isSubmitting?"pointer":"not-allowed", boxShadow:canPublish&&!isSubmitting?"0 2px 10px rgba(109,40,217,0.26)":"none", textTransform:"uppercase", letterSpacing:"0.06em", transition:"all 0.15s" }}
              onMouseEnter={e => { if(canPublish&&!isSubmitting) e.currentTarget.style.opacity="0.88"; }}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              {isSubmitting ? <><Loader2 size={12} style={{ animation:"nexusSpin 1s linear infinite" }}/> Publishing…</> : <><Zap size={12}/> Publish</>}
            </button>
          </div>
        }
      />

      {showSuccess ? (
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0, fontFamily:"'DM Sans',sans-serif" }}>
          <SuccessScreen testData={testData} subjects={testData.subjects} onReset={handleReset} />
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0, fontFamily:"'DM Sans',sans-serif" }}>

          {/* LEFT PANEL */}
          <div style={{ width:242, flexShrink:0, display:"flex", flexDirection:"column", borderRight:"1px solid #ede9f6", background:"#fff", minHeight:0 }}>
            <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"10px", display:"flex", flexDirection:"column", gap:11 }}>

              <div>
                <SLabel icon={<FileText size={9}/>} label="Test Title" />
                <input value={testData.title} onChange={e => setTestData({ ...testData, title:e.target.value })} placeholder="e.g. PCM Drill — Set 1"
                  style={{ width:"100%", boxSizing:"border-box", padding:"7px 10px", background:"transparent", border:`1.5px solid ${testData.title?"#7c3aed":"#e5e7eb"}`, borderRadius:9, fontSize:12, fontWeight:700, color:"#0f172a", outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                  onFocus={e => e.target.style.borderColor="#a78bfa"}
                  onBlur={e  => e.target.style.borderColor=testData.title?"#7c3aed":"#e5e7eb"}
                />
              </div>

              <div style={{ height:1, background:"linear-gradient(90deg,transparent,#ede9f6,transparent)" }} />

              <div>
                <SLabel icon={<Timer size={9}/>} label="Duration" />
                <div style={{ display:"flex", alignItems:"center", gap:6, background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:8, padding:"6px 10px" }}>
                  <input type="number" value={testData.duration} onWheel={e=>e.target.blur()} onChange={e=>setTestData({...testData,duration:e.target.value})} className="no-spinner"
                    style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:800, color:"#5b21b6", fontFamily:"'DM Sans',sans-serif", width:40 }} />
                  <span style={{ fontSize:9, fontWeight:700, color:"#a78bfa", textTransform:"uppercase" }}>min</span>
                </div>
              </div>

              <div>
                <SLabel icon={<Target size={9}/>} label="Exam Pattern" />
                <div style={{ position:"relative" }}>
                  <button onClick={() => setActiveDropdown(activeDropdown==="pattern"?null:"pattern")}
                    style={{ all:"unset", width:"100%", boxSizing:"border-box", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderRadius:8, cursor:"pointer", background:badge.bg, border:`1.5px solid ${badge.border}` }}>
                    <span style={{ fontSize:11, fontWeight:700, color:badge.color }}>{PATTERNS.find(p=>p.val===testData.pattern)?.label}</span>
                    <ChevronDown size={11} style={{ color:badge.color, transform:activeDropdown==="pattern"?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
                  </button>
                  {activeDropdown==="pattern" && (
                    <>
                      <div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={() => setActiveDropdown(null)} />
                      <div style={{ position:"absolute", left:0, top:"calc(100% + 4px)", width:"100%", background:"#fff", border:"1.5px solid #ede9fe", borderRadius:10, boxShadow:"0 10px 34px rgba(109,40,217,0.13)", zIndex:20, overflow:"hidden" }}>
                        <div style={{ padding:"5px 10px 4px", borderBottom:"1px solid #f3f0ff" }}><span style={{ fontSize:8.5, fontWeight:800, color:"#a78bfa", textTransform:"uppercase", letterSpacing:"0.1em" }}>Select pattern</span></div>
                        <div style={{ padding:4 }}>
                          {PATTERNS.map(opt => { const sel=testData.pattern===opt.val; const ob=examBadge(opt.val); return (
                            <button key={opt.val} onClick={() => { initSubjects(opt.val); setActiveDropdown(null); }}
                              style={{ all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:sel?700:500, background:sel?ob.bg:"transparent", color:sel?ob.color:"#374151", transition:"all 0.1s" }}
                              onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background="#f5f3ff"; }} onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}>
                              {opt.label}{sel && <CheckCircle2 size={11} style={{ color:ob.color }}/>}
                            </button>); })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {testData.pattern==="SINGLE" && (
                  <div style={{ position:"relative", marginTop:5 }}>
                    <button onClick={() => setActiveDropdown(activeDropdown==="subject"?null:"subject")}
                      style={{ all:"unset", width:"100%", boxSizing:"border-box", display:"flex", alignItems:"center", gap:6, background:"#faf5ff", border:"1.5px solid #ddd6fe", borderRadius:8, padding:"7px 10px", cursor:"pointer" }}>
                      <BookOpen size={10} style={{ color:"#7c3aed" }}/><span style={{ fontSize:11, fontWeight:600, color:"#5b21b6", flex:1 }}>{testData.selectedSingleSubject||"Select subject"}</span><ChevronDown size={10} style={{ color:"#a78bfa" }}/>
                    </button>
                    {activeDropdown==="subject" && (
                      <>
                        <div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={() => setActiveDropdown(null)} />
                        <div style={{ position:"absolute", left:0, top:"calc(100% + 4px)", width:"100%", background:"#fff", border:"1.5px solid #ede9fe", borderRadius:10, boxShadow:"0 8px 24px rgba(109,40,217,0.11)", zIndex:20, padding:4, maxHeight:190, overflowY:"auto" }}>
                          {configTree.map(s => { const sel=testData.selectedSingleSubject===s.subjectName; return (
                            <button key={s._id} onClick={() => { initSubjects("SINGLE",configTree,s.subjectName); setActiveDropdown(null); }}
                              style={{ all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", boxSizing:"border-box", padding:"6px 9px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:sel?700:500, background:sel?"#7c3aed":"transparent", color:sel?"#fff":"#374151" }}>
                              {s.subjectName}{sel && <CheckCircle2 size={10}/>}
                            </button>); })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <SLabel icon={<Users size={9}/>} label="Assign Batches" />
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {Object.entries(
                    availableBatches.reduce((acc, b) => {
                      const c = b.className || "General Class";
                      if (!acc[c]) acc[c] = [];
                      acc[c].push(b);
                      return acc;
                    }, {})
                  ).map(([cName, classBatches]) => (
                    <div key={cName}>
                      <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", marginBottom:4 }}>{cName}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {classBatches.map(batch => { const sel=testData.selectedBatchIds.includes(batch._id); return (
                          <button key={batch._id}
                            onClick={() => setTestData({ ...testData, selectedBatchIds:sel?testData.selectedBatchIds.filter(id=>id!==batch._id):[...testData.selectedBatchIds,batch._id] })}
                            style={{ padding:"4px 10px", borderRadius:7, cursor:"pointer", fontSize:10.5, fontWeight:600, border:"1.5px solid", background:sel?"linear-gradient(135deg,#7c3aed,#6366f1)":"transparent", borderColor:sel?"transparent":"#e5e7eb", color:sel?"#fff":"#6b7280", boxShadow:sel?"0 2px 7px rgba(109,40,217,0.2)":"none", transition:"all 0.13s" }}>
                            {batch.name}
                          </button>); })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderRadius:10, border:`1.5px solid ${allSynced?"#a7f3d0":"#ede9fe"}`, background:allSynced?"#ecfdf5":"#f8f7ff", padding:"10px 11px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:allSynced?0:6 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:allSynced?"linear-gradient(135deg,#10b981,#059669)":"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {allSynced ? <CheckCircle2 size={11} color="#fff"/> : <span style={{ fontSize:9, fontWeight:800, color:"#6b7280" }}>{syncedCount}/{testData.subjects.length}</span>}
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:allSynced?"#047857":"#374151" }}>
                    {allSynced ? "All subjects ready ✓" : `${syncedCount} of ${testData.subjects.length} ready`}
                  </span>
                </div>
                {!allSynced && testData.subjects.map(s => (
                  <div key={s.id} style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:s.synced?"#10b981":s.jsonError?"#ef4444":"#d1d5db", flexShrink:0 }} />
                    <span style={{ fontSize:10, color:s.synced?"#047857":s.jsonError?"#ef4444":"#94a3b8", fontWeight:s.synced?600:400 }}>{s.name}</span>
                    {s.synced && <span style={{ fontSize:9.5, color:"#10b981", marginLeft:"auto", fontWeight:700 }}>{s.questions.length}q</span>}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT PANEL */}
          {rightView === "preview" && previewSubIdx !== null ? (
            <PreviewPanel
              sub={testData.subjects[previewSubIdx]}
              questions={previewQuestions}
              setQuestions={setPreviewQuestions}
              onBack={() => { setRightView("cards"); setPreviewSubIdx(null); }}
              onSyncBack={(updatedQs) => syncEditedBack(previewSubIdx, updatedQs)}
            />
          ) : (
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f4f3fa", minHeight:0 }}>
              <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"13px 15px 34px", display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:10 }}>
                  {testData.subjects.map((sub, idx) => {
                    const ac     = subjectColor(sub.name);
                    const synced = sub.synced;
                    return (
                      <div key={sub.id} style={{ background:"#fff", borderRadius:12, border:`1.5px solid ${synced?ac.border:sub.jsonError?"#fecdd3":"#ede9f6"}`, overflow:"hidden", boxShadow:synced?`0 3px 12px ${ac.dot}14`:sub.jsonError?"0 2px 7px rgba(239,68,68,0.06)":"0 1px 5px rgba(109,40,217,0.03)", transition:"all 0.2s" }}>
                        <div style={{ height:2.5, background:synced?`linear-gradient(90deg,${ac.from},${ac.to})`:sub.jsonError?"linear-gradient(90deg,#ef4444,#f87171)":"linear-gradient(90deg,#ede9f6,#f3f0ff)" }} />
                        <div style={{ padding:"9px 12px", borderBottom:"1px solid #f5f5f5", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:8, background:synced?`linear-gradient(135deg,${ac.from},${ac.to})`:sub.jsonError?"#fff1f2":ac.light, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              {sub.jsonError ? <AlertCircle size={12} style={{ color:"#ef4444" }}/> : <Layers size={12} style={{ color:synced?"#fff":ac.dot }}/>}
                            </div>
                            <div>
                              <div style={{ fontSize:11, fontWeight:800, color:"#0f172a", textTransform:"uppercase", letterSpacing:"0.05em" }}>{sub.name}</div>
                              <div style={{ fontSize:9, color:synced?"#059669":sub.jsonError?"#ef4444":"#94a3b8", fontWeight:500, marginTop:1 }}>
                                {synced ? `${sub.questions.length} questions ready` : sub.jsonError ? "JSON error" : "Paste JSON below"}
                              </div>
                            </div>
                          </div>
                          <div style={{ display:"flex", gap:5 }}>
                            {synced && (
                              <button onClick={() => openPreview(idx)} style={{ all:"unset", cursor:"pointer", padding:"4px 9px", borderRadius:7, background:`linear-gradient(135deg,${ac.from},${ac.to})`, color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", gap:3, boxShadow:`0 2px 7px ${ac.dot}36`, transition:"opacity 0.13s" }}
                                onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                                onMouseLeave={e => e.currentTarget.style.opacity="1"}
                              >
                                <Eye size={9}/> Preview
                              </button>
                            )}
                            {sub.jsonRaw && (
                              <button onClick={() => clearSubject(idx)} style={{ all:"unset", cursor:"pointer", width:25, height:25, borderRadius:7, background:sub.jsonError?"#fff1f2":"#f5f3ff", border:`1.5px solid ${sub.jsonError?"#fecdd3":"#ddd6fe"}`, display:"flex", alignItems:"center", justifyContent:"center", color:sub.jsonError?"#ef4444":"#7c3aed" }}>
                                <Trash2 size={11}/>
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
                          <details style={{ background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:8, overflow:"hidden" }}>
                            <summary style={{ padding:"5px 9px", cursor:"pointer", fontSize:9.5, fontWeight:700, color:"#7c3aed", listStyle:"none", display:"flex", alignItems:"center", gap:5 }}>
                              <Code2 size={10}/> Schema
                            </summary>
                            <pre style={{ margin:0, padding:"7px 11px", fontSize:8, color:"#6b7280", fontFamily:"monospace", lineHeight:1.8, background:"#faf5ff", borderTop:"1px solid #ede9fe", overflowX:"auto", whiteSpace:"pre-wrap" }}>{SCHEMA_HINT}</pre>
                          </details>
                          <textarea
                            value={sub.jsonRaw}
                            onChange={e => handleJsonInput(idx, e.target.value)}
                            placeholder={`[\n  {\n    "questionText": "...",\n    "options": [...],\n    "correctAnswer": 0\n  }\n]`}
                            style={{ width:"100%", boxSizing:"border-box", minHeight:160, resize:"vertical", background:sub.jsonError?"#fff8f8":synced?ac.light:"#fafbff", border:`1.5px solid ${sub.jsonError?"#fca5a5":synced?ac.border:"#e5e7eb"}`, borderRadius:9, padding:9, fontSize:9.5, fontFamily:"monospace", lineHeight:1.8, outline:"none", color:"#374151", transition:"border-color 0.15s" }}
                            onFocus={e => { if(!sub.jsonError&&!synced) e.target.style.borderColor="#a78bfa"; }}
                            onBlur={e  => { if(!sub.jsonError&&!synced) e.target.style.borderColor="#e5e7eb"; }}
                          />
                          {sub.jsonError && (
                            <div style={{ display:"flex", gap:6, background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:8, padding:"6px 9px" }}>
                              <AlertCircle size={11} style={{ color:"#ef4444", flexShrink:0, marginTop:1 }}/>
                              <p style={{ margin:0, fontSize:9.5, color:"#ef4444", fontFamily:"monospace", lineHeight:1.6 }}>{sub.jsonError}</p>
                            </div>
                          )}
                          {synced && (
                            <div style={{ display:"flex", alignItems:"center", gap:5, background:ac.light, border:`1.5px solid ${ac.border}`, borderRadius:8, padding:"6px 9px" }}>
                              <CheckCircle2 size={10} style={{ color:ac.dot }}/>
                              <span style={{ fontSize:10.5, fontWeight:700, color:ac.text, flex:1 }}>{sub.questions.length} questions parsed</span>
                              <button onClick={() => openPreview(idx)} style={{ all:"unset", cursor:"pointer", fontSize:10.5, fontWeight:700, color:ac.dot, display:"flex", alignItems:"center", gap:3 }}>
                                Preview <ChevronRight size={10}/>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showPublishModal && (
        <PublishModal testData={testData} subjects={testData.subjects} onConfirm={doPublish} onCancel={() => !isSubmitting && setShowPublishModal(false)} isSubmitting={isSubmitting} />
      )}

      <style>{`
        @keyframes nexusSpin { to { transform:rotate(360deg); } }
        @keyframes modalPop  { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
        @keyframes successIn { from{opacity:0;transform:scale(0.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes bounceIn  { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        .no-spinner::-webkit-outer-spin-button,.no-spinner::-webkit-inner-spin-button{-webkit-appearance:none}
        .no-spinner{-moz-appearance:textfield}
        .katex{font-size:1em!important}.katex-display{margin:4px 0!important}
        details summary::-webkit-details-marker{display:none}
      `}</style>
    </AdminLayout>
  );
}