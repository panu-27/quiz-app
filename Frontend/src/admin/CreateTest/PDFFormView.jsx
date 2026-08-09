import React, { useState, useEffect, useRef, useMemo } from "react";
import AdminLayout, { PageHeader } from "../AdminLayout";
import {
  FileText, CheckCircle2, Eye, Loader2, Calendar, Zap,
  Trash2, Timer, Target, BookOpen, ChevronDown, Upload,
  Sparkles, ArrowLeft, ChevronRight, ChevronUp, Hash,
  Users, AlertCircle, X,
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
      const link = document.createElement("link"); link.rel="stylesheet"; link.href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"; document.head.appendChild(link);
      const fl   = document.createElement("link"); fl.rel="stylesheet"; fl.href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@400;500;600&display=swap"; document.head.appendChild(fl);
      const s1   = document.createElement("script"); s1.src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
      s1.onload  = () => { const s2=document.createElement("script"); s2.src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"; s2.onload=resolve; document.head.appendChild(s2); };
      document.head.appendChild(s1);
    });
    return p;
  };
})();

const KATEX_OPTS = {
  delimiters:[{ left:"$$",right:"$$",display:true },{ left:"$",right:"$",display:false },{ left:"\\(",right:"\\)",display:false },{ left:"\\[",right:"\\]",display:true }],
  throwOnError:false,
};

function KatexBlock({ html }) {
  const ref = useRef(null);
  useEffect(() => { if(!ref.current) return; ref.current.innerHTML=html||""; ensureKatex().then(()=>{ if(ref.current) window.renderMathInElement(ref.current,KATEX_OPTS); }); }, [html]);
  return <span ref={ref}/>;
}

/* ══════════════════════════════════════════
   helpers
══════════════════════════════════════════ */
const subjectColor = (name="") => {
  const n = name.toLowerCase();
  if (n.includes("phys")) return { from:"#3b82f6",to:"#6366f1",light:"#eff6ff",border:"#bfdbfe",text:"#1d4ed8",dot:"#3b82f6" };
  if (n.includes("chem")) return { from:"#f59e0b",to:"#ef4444",light:"#fffbeb",border:"#fde68a",text:"#b45309",dot:"#f59e0b" };
  if (n.includes("math")) return { from:"#7c3aed",to:"#a78bfa",light:"#f5f3ff",border:"#ddd6fe",text:"#5b21b6",dot:"#7c3aed" };
  if (n.includes("bio"))  return { from:"#10b981",to:"#34d399",light:"#ecfdf5",border:"#a7f3d0",text:"#047857",dot:"#10b981" };
  return { from:"#6366f1",to:"#8b5cf6",light:"#f5f3ff",border:"#ddd6fe",text:"#4338ca",dot:"#6366f1" };
};

const PATTERNS = [
  { val:"PCM",        label:"PCM (CET)"      },
  { val:"PCB",        label:"PCB (CET)"      },
  { val:"JEE MAINS",  label:"JEE MAINS"      },
  { val:"NEET",       label:"NEET"           },
  { val:"SINGLE",     label:"Single Subject" },
];

const examBadge = (val) => {
  const m = { PCM:{ bg:"#f5f3ff",color:"#5b21b6",border:"#ddd6fe" },PCB:{ bg:"#ecfdf5",color:"#047857",border:"#a7f3d0" },"JEE MAINS":{ bg:"#eff6ff",color:"#1d4ed8",border:"#bfdbfe" },NEET:{ bg:"#fffbeb",color:"#b45309",border:"#fde68a" },SINGLE:{ bg:"#f9fafb",color:"#6b7280",border:"#e5e7eb" } };
  return m[val]||m.SINGLE;
};

const OPT = ["A","B","C","D","E"];

function SLabel({ icon, label, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <div style={{ width:18, height:18, borderRadius:4, background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {React.cloneElement(icon, { size:9, style:{ color:"#7c3aed" } })}
        </div>
        <span style={{ fontSize:9.5, fontWeight:800, color:"#374151", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
      </div>
      {action}
    </div>
  );
}

/* ══════════════════════════════════════════
   Single question card in preview
══════════════════════════════════════════ */
function QuestionCard({ q, qi, total, ac }) {
  const [showExp, setShowExp] = useState(false);
  const text = q.questionText || q.text || "";
  return (
    <div style={{ background:"#fff", borderRadius:13, border:"1.5px solid #e9e8f0", overflow:"hidden", boxShadow:"0 1px 6px rgba(0,0,0,0.04)", transition:"box-shadow 0.2s, border-color 0.2s, transform 0.2s" }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 6px 20px ${ac.dot}18`; e.currentTarget.style.borderColor=ac.border; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 6px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor="#e9e8f0"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      {/* header */}
      <div style={{ background:`linear-gradient(135deg,${ac.light},#f8f7ff)`, borderBottom:`1px solid ${ac.border}`, padding:"9px 15px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:`linear-gradient(135deg,${ac.from},${ac.to})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 2px 6px ${ac.dot}40` }}>
            <span style={{ fontSize:11, fontWeight:900, color:"#fff" }}>{qi+1}</span>
          </div>
          <span style={{ fontSize:9, fontWeight:800, color:ac.text, textTransform:"uppercase", letterSpacing:"0.1em" }}>Q{qi+1} <span style={{ opacity:0.4, fontWeight:500 }}>/ {total}</span></span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, background:"#ecfdf5", border:"1px solid #6ee7b7", padding:"3px 7px", borderRadius:99 }}>
          <CheckCircle2 size={9} style={{ color:"#059669" }}/>
          <span style={{ fontSize:9, fontWeight:800, color:"#047857" }}>Ans: {OPT[q.correctAnswer] ?? q.correctAnswer}</span>
        </div>
      </div>
      {/* body */}
      <div style={{ padding:"12px 15px 14px" }}>
        <div style={{ fontSize:13.5, fontWeight:500, color:"#0f172a", lineHeight:1.85, fontFamily:"Lora,serif", marginBottom:11 }}>
          <KatexBlock html={text}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {(q.options||[]).map((opt,oi) => {
            const correct = q.correctAnswer===oi;
            const optText = typeof opt==="string" ? opt : opt?.text ?? "";
            return (
              <div key={oi} style={{ padding:"8px 10px", borderRadius:10, border:`1.5px solid ${correct?"#6ee7b7":"#efefef"}`, background:correct?"linear-gradient(135deg,#f0fdf4,#dcfce7)":"#fafafa", display:"flex", alignItems:"flex-start", gap:7 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:correct?"linear-gradient(135deg,#10b981,#059669)":"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:correct?"#fff":"#9ca3af", flexShrink:0, marginTop:1 }}>{OPT[oi]}</div>
                <span style={{ fontSize:11.5, lineHeight:1.65, flex:1, fontFamily:"Source Sans 3,sans-serif", fontWeight:correct?600:400, color:correct?"#065f46":"#374151" }}>
                  <KatexBlock html={optText}/>
                </span>
                {correct && <CheckCircle2 size={11} style={{ color:"#10b981", flexShrink:0, marginTop:2 }}/>}
              </div>
            );
          })}
        </div>
        {q.explanation && (
          <div style={{ marginTop:10 }}>
            <button onClick={()=>setShowExp(v=>!v)} style={{ all:"unset", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700, color:"#92400e", padding:"4px 9px", borderRadius:7, background:"#fffbeb", border:"1px solid #fde68a" }}>
              <Sparkles size={9} style={{ color:"#f59e0b" }}/> Explanation {showExp?<ChevronUp size={9}/>:<ChevronRight size={9}/>}
            </button>
            {showExp && (
              <div style={{ marginTop:6, padding:"10px 12px", background:"linear-gradient(135deg,#fffbeb,#fef9c3)", border:"1.5px solid #fde68a", borderRadius:9, fontSize:12, color:"#78350f", lineHeight:1.8, fontFamily:"Source Sans 3,sans-serif" }}>
                <KatexBlock html={q.explanation}/>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Preview Panel (right panel swap)
══════════════════════════════════════════ */
function PreviewPanel({ subject, questions, onBack }) {
  const ac      = subjectColor(subject);
  const withExp = questions.filter(q=>q.explanation);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
      {/* top bar */}
      <div style={{ padding:"9px 16px", background:"#fff", borderBottom:"1px solid #ede9f6", flexShrink:0, display:"flex", alignItems:"center", gap:9 }}>
        <button onClick={onBack} style={{ all:"unset", cursor:"pointer", display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:8, background:"#f5f3ff", color:"#7c3aed", fontSize:11, fontWeight:700, border:"1.5px solid #ddd6fe", transition:"background 0.13s", flexShrink:0 }}
          onMouseEnter={e=>e.currentTarget.style.background="#ede9fe"} onMouseLeave={e=>e.currentTarget.style.background="#f5f3ff"}>
          <ArrowLeft size={12}/> Back
        </button>
        <div style={{ padding:"3px 10px", borderRadius:99, background:`linear-gradient(135deg,${ac.from},${ac.to})`, boxShadow:`0 2px 7px ${ac.dot}36`, flexShrink:0 }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#fff", letterSpacing:"0.06em" }}>{subject}</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12, fontWeight:800, color:"#0f172a" }}>Extraction Preview</div>
          <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>{questions.length} questions · {withExp.length} with explanations</div>
        </div>
        {/* stats */}
        <div style={{ display:"flex", alignItems:"center", gap:11, flexShrink:0 }}>
          {[
            { icon:<Hash size={10}/>,        label:"Total", val:questions.length,   color:ac.text   },
            { icon:<CheckCircle2 size={10}/>, label:"Keyed", val:questions.filter(q=>q.correctAnswer!==undefined).length, color:"#047857" },
            { icon:<Sparkles size={10}/>,     label:"Hints", val:withExp.length,     color:"#b45309" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:3 }}>
              <span style={{ color:s.color, opacity:0.7 }}>{s.icon}</span>
              <span style={{ fontSize:11, fontWeight:800, color:s.color }}>{s.val}</span>
              <span style={{ fontSize:10, color:"#94a3b8" }}>{s.label}</span>
              {i<2 && <div style={{ width:1, height:11, background:"#e2e8f0", marginLeft:3 }}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"14px 18px 36px", background:"#f4f3fa" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:780, margin:"0 auto" }}>
          {questions.map((q,qi) => (
            <QuestionCard key={qi} q={q} qi={qi} total={questions.length} ac={ac}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main
══════════════════════════════════════════ */
export default function PDFFormView() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const today   = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [availableBatches, setAvailableBatches] = useState([]);
  const [configTree,       setConfigTree]       = useState([]);
  const [batchesLoading,   setBatchesLoading]   = useState(true);
  const [fetchError,       setFetchError]       = useState(null);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [showSchedule,     setShowSchedule]     = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  // right panel: "cards" | "preview"
  const [rightView,        setRightView]        = useState("cards");
  const [previewData,      setPreviewData]      = useState({ subject:"", questions:[] });

  const [testData, setTestData] = useState({
    title:"", pattern:"PCM", duration:180, selectedBatchIds:[],
    scheduleDate:"", scheduleTime:"", endTimeDate:"", endTimeTime:"",
    selectedSingleSubject:"", subjects:[],
  });

  /* ── fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const [bR, tR] = await Promise.all([
          fetch(`${baseURL}/teacher/my-batches`,       { headers:{ Authorization:`Bearer ${token}` } }),
          fetch(`${baseURL}/bankQuestion/config-tree`, { headers:{ Authorization:`Bearer ${token}` } }),
        ]);
        if (!bR.ok || !tR.ok) throw new Error("Failed to load data");
        const bD = await bR.json(); const tD = await tR.json();
        setAvailableBatches(Array.isArray(bD) ? bD : bD.batches||[]);
        setConfigTree(tD);
        if (tD.length > 0) initSubjects("PCM", tD);
      } catch(e) { setFetchError(e.message); }
      finally { setBatchesLoading(false); }
    })();
  }, [baseURL]);

  const initSubjects = (pattern, currentTree=configTree, singleSubName=null) => {
    const map = {
      PCM:["Physics","Chemistry","Mathematics"], PCB:["Physics","Chemistry","Biology"],
      "JEE MAINS":["Physics","Chemistry","Mathematics"], NEET:["Physics","Chemistry","Biology"],
      SINGLE:[singleSubName||testData.selectedSingleSubject||currentTree[0]?.subjectName],
    };
    const newSubjects = (map[pattern]||["Physics"]).map(name => {
      const matched = currentTree.find(s => s.subjectName.toLowerCase().includes(name.toLowerCase()));
      return { id:matched?._id||Math.random(), name:matched?.subjectName||name, file:null, synced:false, questions:[], loading:false, count:0 };
    });
    setTestData(prev => ({ ...prev, pattern, subjects:newSubjects, selectedSingleSubject:pattern==="SINGLE"?(singleSubName||prev.selectedSingleSubject||currentTree[0]?.subjectName):prev.selectedSingleSubject }));
    setActiveDropdownId(null);
    setRightView("cards");
  };

  /* ── PDF extraction ── */
  const handleSyncPDF = async (idx) => {
    const sub = testData.subjects[idx];
    if (!sub.file) return alert("Upload PDF first");
    setTestData(prev => ({ ...prev, subjects:prev.subjects.map((s,i)=>i===idx?{...s,loading:true}:s) }));
    const fd = new FormData();
    fd.append("file", sub.file); fd.append("subject", sub.name);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/pdf/extract`, { method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd });
      if (!res.ok) { const e=await res.json(); throw new Error(e.message||"Extraction failed"); }
      const data  = await res.json();
      if (!data.questions || !data.questions.length) throw new Error("No questions returned from extraction");
      setTestData(prev => ({ ...prev, subjects:prev.subjects.map((s,i)=>i===idx?{...s,questions:data.questions,count:data.questions.length,synced:true,loading:false}:s) }));
      setPreviewData({ subject:sub.name, questions:data.questions });
      setRightView("preview");
    } catch(e) {
      alert(e.message);
      setTestData(prev => ({ ...prev, subjects:prev.subjects.map((s,i)=>i===idx?{...s,loading:false}:s) }));
    }
  };

  /* ── section mapper — handles plain string options ── */
  const mapToSection = sub => ({
    subject: sub.id, subjectName: sub.name, numQuestions: sub.count,
    questions: sub.questions.map(q => ({
      questionText: q.questionText || q.text,
      options: (q.options||[]).map(opt => typeof opt==="string" ? { text:opt, image:null, isImageOption:false } : opt),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation||"",
    })),
  });

  /* ── publish ── */
  const handleCreateTest = async () => {
    if (!testData.title)                   return alert("Please enter a test title");
    if (!testData.selectedBatchIds.length) return alert("Select at least one batch");
    if (!testData.subjects.every(s=>s.synced)) return alert("Extract questions from all PDFs first");
    setIsSubmitting(true);
    const typeMap   = { PCM:"PCM", PCB:"PCB", "JEE MAINS":"JEE", NEET:"NEET", SINGLE:"OTHER" };
    const now       = new Date();
    const startTime = testData.scheduleDate ? new Date(`${testData.scheduleDate}T${testData.scheduleTime||"00:00"}`) : now;
    const endTime   = testData.endTimeDate  ? new Date(`${testData.endTimeDate}T${testData.endTimeTime||"23:59"}`) : new Date(startTime.getTime()+(Number(testData.duration)+60)*60000);
    const total     = parseInt(testData.duration);
    let blocks = [];
    if (testData.pattern==="PCM")      blocks=[{ blockName:"Physics & Chemistry", duration:total/2, sections:testData.subjects.filter(s=>/phys|chem/i.test(s.name)).map(mapToSection) },{ blockName:"Mathematics", duration:total/2, sections:testData.subjects.filter(s=>/math/i.test(s.name)).map(mapToSection) }];
    else if (testData.pattern==="PCB") blocks=[{ blockName:"Physics & Chemistry", duration:total/2, sections:testData.subjects.filter(s=>/phys|chem/i.test(s.name)).map(mapToSection) },{ blockName:"Biology", duration:total/2, sections:testData.subjects.filter(s=>/bio/i.test(s.name)).map(mapToSection) }];
    else                               blocks=[{ blockName:"Session 1", duration:total, sections:testData.subjects.map(mapToSection) }];
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/create-test`, { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body:JSON.stringify({ title:testData.title, batchIds:testData.selectedBatchIds, examType:typeMap[testData.pattern]||"OTHER", duration:total, startTime:startTime.toISOString(), endTime:endTime.toISOString(), metadata:{ distribution:"Single Set" }, blocks }) });
      if (res.ok) alert("Assessment Published Successfully!");
      else { const e=await res.json(); throw new Error(e.message||"Publish failed"); }
    } catch(e) { alert(e.message); }
    finally { setIsSubmitting(false); }
  };

  const allSynced  = testData.subjects.length>0 && testData.subjects.every(s=>s.synced);
  const syncedCount = testData.subjects.filter(s=>s.synced).length;
  const badge      = examBadge(testData.pattern);
  const canPublish = allSynced && testData.selectedBatchIds.length>0 && testData.title.trim().length>0;

  /* ── error screen ── */
  if (fetchError) return (
    <AdminLayout>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"#fff1f2", border:"1.5px solid #fecdd3", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <AlertCircle size={24} style={{ color:"#ef4444" }}/>
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:"#374151" }}>Failed to load</div>
        <div style={{ fontSize:12, color:"#94a3b8" }}>{fetchError}</div>
        <button onClick={()=>window.location.reload()} style={{ padding:"8px 18px", borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", border:"none", fontWeight:700, fontSize:12, cursor:"pointer" }}>Retry</button>
      </div>
      <style>{`@keyframes nexusSpin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Upload PDF Test"
        subtitle="Upload a PDF per subject · extract questions · publish"
        right={
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, background:allSynced?"#ecfdf5":"#f5f3ff", border:`1.5px solid ${allSynced?"#a7f3d0":"#ddd6fe"}`, padding:"5px 10px", borderRadius:8, fontSize:11, fontWeight:700, color:allSynced?"#047857":"#7c3aed" }}>
              {allSynced ? <><CheckCircle2 size={11}/> All Ready</> : <><span style={{ fontSize:10, opacity:0.75 }}>{syncedCount}/{testData.subjects.length}</span> PDFs</>}
            </div>
            <button onClick={handleCreateTest} disabled={isSubmitting||!canPublish}
              style={{ display:"flex", alignItems:"center", gap:5, background:canPublish?(isSubmitting?"#f5f3ff":"linear-gradient(135deg,#4f46e5,#7c3aed)"):"#f3f4f6", color:canPublish?(isSubmitting?"#7c3aed":"#fff"):"#94a3b8", padding:"7px 15px", borderRadius:9, fontSize:12, fontWeight:800, border:"none", cursor:canPublish&&!isSubmitting?"pointer":"not-allowed", boxShadow:canPublish&&!isSubmitting?"0 2px 10px rgba(79,70,229,0.28)":"none", textTransform:"uppercase", letterSpacing:"0.06em", transition:"all 0.15s" }}
              onMouseEnter={e=>{ if(canPublish&&!isSubmitting) e.currentTarget.style.opacity="0.88"; }} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              {isSubmitting ? <><Loader2 size={12} style={{ animation:"nexusSpin 1s linear infinite" }}/> Publishing…</> : <><Zap size={12}/> Publish</>}
            </button>
          </div>
        }
      />

      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0, fontFamily:"'DM Sans',sans-serif" }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{ width:252, flexShrink:0, display:"flex", flexDirection:"column", borderRight:"1px solid #ede9f6", background:"#fff", minHeight:0 }}>
          <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"11px", display:"flex", flexDirection:"column", gap:13 }}>

            <div>
              <SLabel icon={<FileText size={9}/>} label="Test Title"/>
              <input value={testData.title} onChange={e=>setTestData({...testData,title:e.target.value})} placeholder="e.g. PCM Full Test — Set 3"
                style={{ width:"100%", boxSizing:"border-box", padding:"8px 11px", background:"transparent", border:`1.5px solid ${testData.title?"#7c3aed":"#e5e7eb"}`, borderRadius:9, fontSize:12, fontWeight:700, color:"#0f172a", outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                onFocus={e=>e.target.style.borderColor="#a78bfa"} onBlur={e=>e.target.style.borderColor=testData.title?"#7c3aed":"#e5e7eb"}/>
            </div>

            <div style={{ height:1, background:"linear-gradient(90deg,transparent,#ede9f6,transparent)" }}/>

            <div>
              <SLabel icon={<Timer size={9}/>} label="Duration"/>
              <div style={{ display:"flex", alignItems:"center", gap:7, background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:9, padding:"7px 11px" }}>
                <input type="number" value={testData.duration} onWheel={e=>e.target.blur()} onChange={e=>setTestData({...testData,duration:e.target.value})} className="no-spinner"
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:800, color:"#5b21b6", fontFamily:"'DM Sans',sans-serif", width:40 }}/>
                <span style={{ fontSize:9, fontWeight:700, color:"#a78bfa", textTransform:"uppercase" }}>min</span>
              </div>
            </div>

            <div>
              <SLabel icon={<Target size={9}/>} label="Exam Pattern"/>
              <div style={{ position:"relative" }}>
                <button onClick={()=>setActiveDropdownId(activeDropdownId==="pattern"?null:"pattern")}
                  style={{ all:"unset", width:"100%", boxSizing:"border-box", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 11px", borderRadius:9, cursor:"pointer", background:badge.bg, border:`1.5px solid ${badge.border}` }}>
                  <span style={{ fontSize:12, fontWeight:700, color:badge.color }}>{PATTERNS.find(p=>p.val===testData.pattern)?.label}</span>
                  <ChevronDown size={12} style={{ color:badge.color, transform:activeDropdownId==="pattern"?"rotate(180deg)":"none", transition:"transform 0.2s" }}/>
                </button>
                {activeDropdownId==="pattern" && (
                  <><div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={()=>setActiveDropdownId(null)}/>
                  <div style={{ position:"absolute", left:0, top:"calc(100% + 4px)", width:"100%", background:"#fff", border:"1.5px solid #ede9fe", borderRadius:11, boxShadow:"0 10px 36px rgba(109,40,217,0.14)", zIndex:20, overflow:"hidden" }}>
                    <div style={{ padding:"7px 11px 5px", borderBottom:"1px solid #f3f0ff" }}><span style={{ fontSize:8.5, fontWeight:800, color:"#a78bfa", textTransform:"uppercase", letterSpacing:"0.1em" }}>Select pattern</span></div>
                    <div style={{ padding:4 }}>
                      {PATTERNS.map(opt=>{ const sel=testData.pattern===opt.val; const ob=examBadge(opt.val); return (
                        <button key={opt.val} onClick={()=>initSubjects(opt.val)}
                          style={{ all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:sel?700:500, background:sel?ob.bg:"transparent", color:sel?ob.color:"#374151", transition:"all 0.1s" }}
                          onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background="#f5f3ff"; }} onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}>
                          {opt.label}{sel && <CheckCircle2 size={11} style={{ color:ob.color }}/>}
                        </button>); })}
                    </div>
                  </div></>
                )}
              </div>
              {testData.pattern==="SINGLE" && (
                <div style={{ position:"relative", marginTop:6 }}>
                  <button onClick={()=>setActiveDropdownId(activeDropdownId==="subject"?null:"subject")}
                    style={{ all:"unset", width:"100%", boxSizing:"border-box", display:"flex", alignItems:"center", gap:7, background:"#faf5ff", border:"1.5px solid #ddd6fe", borderRadius:9, padding:"7px 11px", cursor:"pointer" }}>
                    <BookOpen size={11} style={{ color:"#7c3aed" }}/><span style={{ fontSize:11, fontWeight:600, color:"#5b21b6", flex:1 }}>{testData.selectedSingleSubject||"Select subject"}</span><ChevronDown size={11} style={{ color:"#a78bfa" }}/>
                  </button>
                  {activeDropdownId==="subject" && (
                    <><div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={()=>setActiveDropdownId(null)}/>
                    <div style={{ position:"absolute", left:0, top:"calc(100% + 4px)", width:"100%", background:"#fff", border:"1.5px solid #ede9fe", borderRadius:11, boxShadow:"0 8px 24px rgba(109,40,217,0.11)", zIndex:20, padding:4, maxHeight:200, overflowY:"auto" }}>
                      {configTree.map(s=>{ const sel=testData.selectedSingleSubject===s.subjectName; return (
                        <button key={s._id} onClick={()=>{ setTestData(prev=>({...prev,selectedSingleSubject:s.subjectName})); initSubjects("SINGLE",configTree,s.subjectName); setActiveDropdownId(null); }}
                          style={{ all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:sel?700:500, background:sel?"#7c3aed":"transparent", color:sel?"#fff":"#374151" }}>
                          {s.subjectName}{sel && <CheckCircle2 size={11}/>}
                        </button>); })}
                    </div></>
                  )}
                </div>
              )}
            </div>

            <div>
              <SLabel icon={<Users size={9}/>} label="Assign Batches"/>
              {batchesLoading ? <div style={{ display:"flex", justifyContent:"center", padding:10 }}><Loader2 size={16} style={{ color:"#a78bfa", animation:"nexusSpin 1s linear infinite" }}/></div>
              : availableBatches.length===0 ? <div style={{ fontSize:11, color:"#94a3b8" }}>No batches found.</div>
              : (
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
                        {classBatches.map(batch=>{ const sel=testData.selectedBatchIds.includes(batch._id); return (
                          <button key={batch._id}
                            onClick={()=>setTestData({...testData,selectedBatchIds:sel?testData.selectedBatchIds.filter(id=>id!==batch._id):[...testData.selectedBatchIds,batch._id]})}
                            style={{ padding:"4px 10px", borderRadius:7, cursor:"pointer", fontSize:10.5, fontWeight:600, border:"1.5px solid", background:sel?"linear-gradient(135deg,#7c3aed,#6366f1)":"transparent", borderColor:sel?"transparent":"#e5e7eb", color:sel?"#fff":"#6b7280", boxShadow:sel?"0 2px 8px rgba(109,40,217,0.2)":"none", transition:"all 0.13s" }}>
                            {batch.name}
                          </button>); })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SLabel icon={<Calendar size={9}/>} label="Schedule"
                action={<button onClick={()=>setShowSchedule(!showSchedule)} style={{ all:"unset", fontSize:9.5, fontWeight:700, cursor:"pointer", color:showSchedule?"#c2410c":"#7c3aed", background:showSchedule?"#fff7ed":"#f5f3ff", border:`1px solid ${showSchedule?"#fed7aa":"#ede9fe"}`, padding:"2px 8px", borderRadius:5 }}>{showSchedule?"Hide":"Set"}</button>}
              />
              {showSchedule ? (
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[{ label:"Start",color:"#10b981",pulse:false,dk:"scheduleDate",tk:"scheduleTime",min:today },{ label:"End",color:"#a78bfa",pulse:true,dk:"endTimeDate",tk:"endTimeTime",min:testData.scheduleDate||today }].map(({ label,color,pulse,dk,tk,min }) => (
                    <div key={dk}>
                      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:color, animation:pulse?"nexusPulse 1.5s infinite":"none" }}/>
                        <span style={{ fontSize:8.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label} time</span>
                        {label==="End" && <span style={{ fontSize:8.5, color:"#c4b5fd" }}>optional</span>}
                      </div>
                      <div style={{ display:"flex", gap:5, background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:8, padding:"6px 10px" }} onFocusCapture={e=>e.currentTarget.style.borderColor="#a78bfa"} onBlurCapture={e=>e.currentTarget.style.borderColor="#e5e7eb"}>
                        <input type="date" min={min} onChange={e=>setTestData({...testData,[dk]:e.target.value})} style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:10, fontWeight:500, color:"#374151", fontFamily:"'DM Sans',sans-serif" }}/>
                        <div style={{ width:1, background:"#e5e7eb", alignSelf:"stretch" }}/>
                        <input type="time" onChange={e=>setTestData({...testData,[tk]:e.target.value})} style={{ background:"transparent", border:"none", outline:"none", fontSize:10, fontWeight:500, color:"#374151", fontFamily:"'DM Sans',sans-serif" }}/>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.5 }}>Not set — goes live <span style={{ color:"#5b21b6", fontWeight:600 }}>immediately</span>.</div>}
            </div>

            {/* progress */}
            <div style={{ borderRadius:10, border:`1.5px solid ${allSynced?"#a7f3d0":"#ede9fe"}`, background:allSynced?"#ecfdf5":"#f8f7ff", padding:"10px 11px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:allSynced?0:6 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:allSynced?"linear-gradient(135deg,#10b981,#059669)":"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {allSynced ? <CheckCircle2 size={11} color="#fff"/> : <span style={{ fontSize:9, fontWeight:800, color:"#6b7280" }}>{syncedCount}/{testData.subjects.length}</span>}
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:allSynced?"#047857":"#374151" }}>{allSynced?"All PDFs ready ✓":`${syncedCount} of ${testData.subjects.length} ready`}</span>
              </div>
              {!allSynced && testData.subjects.map(s=>(
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:s.synced?"#10b981":"#d1d5db", flexShrink:0 }}/>
                  <span style={{ fontSize:10, color:s.synced?"#047857":"#94a3b8", fontWeight:s.synced?600:400 }}>{s.name}</span>
                  {s.synced && <span style={{ fontSize:9.5, color:"#10b981", marginLeft:"auto", fontWeight:700 }}>{s.count}q</span>}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        {rightView==="preview" ? (
          <PreviewPanel subject={previewData.subject} questions={previewData.questions} onBack={()=>setRightView("cards")}/>
        ) : (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f4f3fa", minHeight:0 }}>
            <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"13px 15px 34px", display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(248px,1fr))", gap:10 }}>
                {testData.subjects.map((sub,idx) => {
                  const ac     = subjectColor(sub.name);
                  const synced = sub.synced;
                  return (
                    <div key={sub.id} style={{ background:"#fff", borderRadius:13, border:`1.5px solid ${synced?ac.border:"#ede9f6"}`, overflow:"hidden", boxShadow:synced?`0 3px 12px ${ac.dot}14`:"0 1px 5px rgba(109,40,217,0.03)", transition:"all 0.2s" }}>
                      <div style={{ height:2.5, background:synced?`linear-gradient(90deg,${ac.from},${ac.to})`:"linear-gradient(90deg,#ede9f6,#f3f0ff)" }}/>
                      <div style={{ padding:"10px 12px", borderBottom:"1px solid #f5f5f5", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:30, height:30, borderRadius:8, background:synced?`linear-gradient(135deg,${ac.from},${ac.to})`:ac.light, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <FileText size={13} style={{ color:synced?"#fff":ac.dot }}/>
                          </div>
                          <div>
                            <div style={{ fontSize:11, fontWeight:800, color:"#0f172a", textTransform:"uppercase", letterSpacing:"0.05em" }}>{sub.name}</div>
                            <div style={{ fontSize:9, color:synced?"#059669":"#94a3b8", fontWeight:500, marginTop:1 }}>{synced?`${sub.count} Qs ready`:"Awaiting PDF"}</div>
                          </div>
                        </div>
                        {synced && (
                          <button onClick={()=>{ setPreviewData({ subject:sub.name, questions:sub.questions }); setRightView("preview"); }}
                            style={{ all:"unset", cursor:"pointer", padding:"4px 9px", borderRadius:7, background:`linear-gradient(135deg,${ac.from},${ac.to})`, color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", gap:3, boxShadow:`0 2px 7px ${ac.dot}36`, transition:"opacity 0.13s" }}
                            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                            <Eye size={10}/> Preview
                          </button>
                        )}
                      </div>
                      <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
                        {!sub.file ? (
                          <label htmlFor={`pdf-${idx}`} style={{ minHeight:90, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:7, border:`2px dashed ${ac.border}`, borderRadius:11, cursor:"pointer", background:ac.light, transition:"all 0.15s" }}
                            onMouseEnter={e=>{ e.currentTarget.style.borderColor=ac.dot; e.currentTarget.style.transform="scale(1.01)"; }}
                            onMouseLeave={e=>{ e.currentTarget.style.borderColor=ac.border; e.currentTarget.style.transform="scale(1)"; }}>
                            <div style={{ width:32, height:32, borderRadius:9, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 2px 8px ${ac.dot}28` }}>
                              <Upload size={14} style={{ color:ac.dot }}/>
                            </div>
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontSize:11, fontWeight:700, color:ac.text }}>Attach PDF</div>
                              <div style={{ fontSize:9, color:"#94a3b8", marginTop:1 }}>Click to browse</div>
                            </div>
                            <input type="file" id={`pdf-${idx}`} style={{ display:"none" }} accept=".pdf"
                              onChange={e=>{ const up=testData.subjects.map((s,i)=>i===idx?{...s,file:e.target.files[0]}:s); setTestData({...testData,subjects:up}); }}/>
                          </label>
                        ) : (
                          <>
                            <div style={{ display:"flex", alignItems:"center", gap:8, background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:9, padding:"7px 10px" }}>
                              <div style={{ width:24, height:24, borderRadius:6, background:"linear-gradient(135deg,#7c3aed,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                <FileText size={11} style={{ color:"#fff" }}/>
                              </div>
                              <span style={{ fontSize:10, fontWeight:600, color:"#374151", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub.file.name}</span>
                              <button onClick={()=>{ const up=testData.subjects.map((s,i)=>i===idx?{...s,file:null,synced:false,questions:[],count:0}:s); setTestData({...testData,subjects:up}); if(previewData.subject===sub.name) setRightView("cards"); }}
                                style={{ all:"unset", cursor:"pointer", color:"#d1d5db", lineHeight:0 }}
                                onMouseEnter={e=>e.currentTarget.style.color="#ef4444"} onMouseLeave={e=>e.currentTarget.style.color="#d1d5db"}>
                                <Trash2 size={12}/>
                              </button>
                            </div>
                            {!synced ? (
                              <button onClick={()=>handleSyncPDF(idx)} disabled={sub.loading}
                                style={{ padding:"9px", borderRadius:10, cursor:sub.loading?"not-allowed":"pointer", border:"none", background:sub.loading?"#f3f4f6":`linear-gradient(135deg,${ac.from},${ac.to})`, color:sub.loading?"#94a3b8":"#fff", fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:sub.loading?"none":`0 3px 10px ${ac.dot}38`, transition:"all 0.15s" }}
                                onMouseEnter={e=>{ if(!sub.loading) e.currentTarget.style.opacity="0.88"; }} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                                {sub.loading ? <><Loader2 size={12} style={{ animation:"nexusSpin 1s linear infinite" }}/> Extracting…</> : "Extract Questions"}
                              </button>
                            ) : (
                              <div style={{ display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#ecfdf5,#d1fae5)", border:"1.5px solid #6ee7b7", borderRadius:10, padding:"9px 11px" }}>
                                <CheckCircle2 size={13} style={{ color:"#059669", flexShrink:0 }}/>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontSize:11, fontWeight:800, color:"#047857" }}>{sub.count} questions ready</div>
                                  <div style={{ fontSize:9.5, color:"#059669", marginTop:1 }}>Click Preview to review →</div>
                                </div>
                              </div>
                            )}
                          </>
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

      <style>{`
        @keyframes nexusSpin{to{transform:rotate(360deg)}}
        @keyframes nexusPulse{0%,100%{opacity:1}50%{opacity:0.35}}
        .no-spinner::-webkit-outer-spin-button,.no-spinner::-webkit-inner-spin-button{-webkit-appearance:none}
        .no-spinner{-moz-appearance:textfield}
        .katex{font-size:1.05em!important}.katex-display{margin:5px 0!important}
      `}</style>
    </AdminLayout>
  );
}