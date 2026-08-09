import React, { useEffect, useState, useMemo } from "react";
import AdminLayout, { PageHeader } from "../AdminLayout";
import {
  ChevronRight, Clock, Target, Users, Zap, CheckCircle2, ChevronDown,
  Loader2, BookOpen, Search, X, Plus, Layout, Calendar, XCircle, Check,
  FileText, AlertCircle, ArrowLeft, Settings2,
} from "lucide-react";

/* ── constants ── */
const PATTERNS = [
  { val:"PCM",        label:"PCM (CET)"      },
  { val:"PCB",        label:"PCB (CET)"      },
  { val:"JEE MAINS",  label:"JEE MAINS"      },
  { val:"NEET",       label:"NEET"           },
  { val:"SINGLE",     label:"Single Subject" },
];

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

const subjectColor = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("phys")) return { from:"#3b82f6", to:"#6366f1", light:"#eff6ff", border:"#bfdbfe", text:"#1d4ed8", dot:"#3b82f6" };
  if (n.includes("chem")) return { from:"#f59e0b", to:"#ef4444", light:"#fffbeb", border:"#fde68a", text:"#b45309", dot:"#f59e0b" };
  if (n.includes("math")) return { from:"#7c3aed", to:"#a78bfa", light:"#f5f3ff", border:"#ddd6fe", text:"#5b21b6", dot:"#7c3aed" };
  if (n.includes("bio"))  return { from:"#10b981", to:"#34d399", light:"#ecfdf5", border:"#a7f3d0", text:"#047857", dot:"#10b981" };
  return { from:"#6366f1", to:"#8b5cf6", light:"#f5f3ff", border:"#ddd6fe", text:"#4338ca", dot:"#6366f1" };
};

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

/* ── empty / error states ── */
function EmptyState({ icon, title, msg }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"56px 24px", textAlign:"center" }}>
      <div style={{ width:52, height:52, borderRadius:15, background:"#f5f3ff", border:"1.5px solid #ddd6fe", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:13 }}>
        {React.cloneElement(icon, { size:22, style:{ color:"#a78bfa" } })}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:5 }}>{title}</div>
      <p style={{ fontSize:11, color:"#94a3b8", maxWidth:240, lineHeight:1.7, margin:0 }}>{msg}</p>
    </div>
  );
}

export default function CustomFormView() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const today   = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [configTree,       setConfigTree]       = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [createdTestId,    setCreatedTestId]    = useState(null);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [isLoading,        setIsLoading]        = useState(true);
  const [fetchError,       setFetchError]       = useState(null);
  const [activeSubjectId,  setActiveSubjectId]  = useState(null);  // "cards" | subjectDbId → chapter panel
  const [searchQuery,      setSearchQuery]      = useState("");
  const [showSchedule,     setShowSchedule]     = useState(false);
  const [openDifficulty,   setOpenDifficulty]   = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const [formData, setFormData] = useState({
    title:"", selectedBatchIds:[], pattern:"PCM", time:180,
    distribution:"Single Set", selectedSingleSubject:"",
    scheduleDate:"", scheduleTime:"", endTimeDate:"", endTimeTime:"",
    subjects:[],
  });

  /* ── fetch ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      try {
        const [tR, bR] = await Promise.all([
          fetch(`${baseURL}/bankQuestion/config-tree`, { headers:{ Authorization:`Bearer ${token}` } }),
          fetch(`${baseURL}/teacher/my-batches`,       { headers:{ Authorization:`Bearer ${token}` } }),
        ]);
        if (!tR.ok || !bR.ok) throw new Error("Failed to load data");
        const tD = await tR.json(); const bD = await bR.json();
        setConfigTree(tD);
        setAvailableBatches(Array.isArray(bD) ? bD : bD.batches || []);
        if (tD.length > 0) handlePatternChange("PCM", tD);
      } catch(e) { setFetchError(e.message); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const handlePatternChange = (pattern, currentTree = configTree, singleSubName = null) => {
    const map = {
      PCM:["Physics","Chemistry","Mathematics"], PCB:["Physics","Chemistry","Biology"],
      "JEE MAINS":["Physics","Chemistry","Mathematics"], NEET:["Physics","Chemistry","Biology"],
      SINGLE:[singleSubName || formData.selectedSingleSubject || currentTree[0]?.subjectName],
    };
    const subjects = (map[pattern]||["Physics"]).map(name => {
      const m = currentTree.find(s => s.subjectName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(s.subjectName.toLowerCase()));
      return { dbId:m?._id, name:m?.subjectName||name, qCount:(pattern==="PCB"&&/bio/i.test(name))?100:50, difficulty:"Med", chapters:[] };
    });
    setFormData(prev => ({ ...prev, pattern, subjects, selectedSingleSubject:subjects[0]?.name }));
    setActiveDropdownId(null);
  };

  const buildBlocks = () => {
    const active = formData.subjects.filter(s => s.chapters.length > 0);
    const total  = Number(formData.time);
    if (["PCM","PCB"].includes(formData.pattern)) {
      const pc  = active.filter(s=>["Physics","Chemistry"].includes(s.name)).map(s=>({ subject:s.dbId, subjectName:s.name, numQuestions:Number(s.qCount), difficulty:s.difficulty, topics:s.chapters.flatMap(c=>c.topics) }));
      const maj = active.filter(s=>["Mathematics","Biology"].includes(s.name)).map(s=>({ subject:s.dbId, subjectName:s.name, numQuestions:Number(s.qCount), difficulty:s.difficulty, topics:s.chapters.flatMap(c=>c.topics) }));
      const blocks=[];
      if (pc.length)  blocks.push({ blockName:"Block 1: Physics & Chemistry", duration:Math.floor(total/2), sections:pc });
      if (maj.length) blocks.push({ blockName:`Block 2: ${maj[0].name}`, duration:Math.ceil(total/2), sections:maj });
      return blocks;
    }
    return [{ blockName:formData.pattern==="SINGLE"?`${active[0]?.name} Test`:"Full Session", duration:total, sections:active.map(s=>({ subject:s.dbId, subjectName:s.name, numQuestions:Number(s.qCount), difficulty:s.difficulty, topics:s.chapters.flatMap(c=>c.topics) })) }];
  };

  const toggleChapter = (subjectDbId, chapter, forceState) => {
    setFormData(prev => ({ ...prev, subjects:prev.subjects.map(sub => {
      if (sub.dbId !== subjectDbId) return sub;
      const exists = sub.chapters.find(c => c.chapterId===chapter.chapterId);
      const remove = forceState===false||(forceState===undefined&&exists);
      return { ...sub, chapters:remove ? sub.chapters.filter(c=>c.chapterId!==chapter.chapterId) : [...sub.chapters,{ chapterId:chapter.chapterId, chapterName:chapter.chapterName, topics:chapter.topics.map(t=>t._id), open:true }] };
    })}));
  };

  const toggleTopic = (subjectDbId, chapterId, topicId) => {
    setFormData(prev => ({ ...prev, subjects:prev.subjects.map(sub => {
      if (sub.dbId !== subjectDbId) return sub;
      return { ...sub, chapters:sub.chapters.map(ch => { if(ch.chapterId!==chapterId) return ch; const has=ch.topics.includes(topicId); return { ...ch, topics:has?ch.topics.filter(t=>t!==topicId):[...ch.topics,topicId] }; }) };
    })}));
  };

  const handleSave = async () => {
    if (!formData.title)                   return alert("Title required");
    if (!formData.selectedBatchIds.length) return alert("Select at least one batch");
    setIsSubmitting(true);
    const blocks   = buildBlocks();
    const typeMap  = { PCM:"PCM", PCB:"PCB", "JEE MAINS":"JEE", NEET:"NEET", SINGLE:"OTHER" };
    const now      = new Date();
    const startTime = formData.scheduleDate ? new Date(`${formData.scheduleDate}T${formData.scheduleTime||"00:00"}`) : now;
    const endTime   = formData.endTimeDate  ? new Date(`${formData.endTimeDate}T${formData.endTimeTime||"23:59"}`) : new Date(startTime.getTime()+(Number(formData.time)+60)*60000);
    const isComp   = ["JEE MAINS","NEET"].includes(formData.pattern);
    const markingScheme = { isNegativeMarking:isComp, defaultCorrect:isComp?4:2, defaultNegative:isComp?1:0, subjectWise:formData.subjects.map(s=>{ let c=2,n=0; if(isComp){c=4;n=1;} else if(["PCM","PCB"].includes(formData.pattern)){c=/math/i.test(s.name)?2:1;} return { subjectId:s.dbId, correctMarks:c, negativeMarks:n }; }) };
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/create-custom-test`, { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body:JSON.stringify({ title:formData.title, batchIds:formData.selectedBatchIds, duration:Number(formData.time), examType:typeMap[formData.pattern]||"OTHER", mode:"CUSTOM", markingScheme, metadata:{ distribution:formData.distribution }, startTime:startTime.toISOString(), endTime:endTime.toISOString(), blocks }) });
      const data  = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save blueprint");
      setCreatedTestId(data._id);
      alert("Blueprint Saved!");
    } catch(e) { alert(e.message); }
    finally { setIsSubmitting(false); }
  };

  const handleGenerate = async () => {
    if (!createdTestId) return alert("Save blueprint first");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/tests/${createdTestId}/generate`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
      if (!res.ok) { const e=await res.json(); throw new Error(e.message||"Generation failed"); }
      alert("Questions Generated Successfully!");
    } catch(e) { alert(e.message); }
    finally { setIsSubmitting(false); }
  };

  const activeSubjectData = useMemo(() => configTree.find(s => s._id===activeSubjectId), [activeSubjectId,configTree]);
  const filteredChapters  = useMemo(() => {
    if (!activeSubjectData) return [];
    return activeSubjectData.chapters.filter(ch => ch.chapterName.toLowerCase().includes(searchQuery.toLowerCase()) || ch.topics.some(t=>t.name.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [activeSubjectData,searchQuery]);

  const badge       = examBadge(formData.pattern);
  const canGenerate = !!createdTestId;
  const activeSub   = formData.subjects.find(s => s.dbId===activeSubjectId);

  /* ── loading / error ── */
  if (isLoading) return (
    <AdminLayout>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Loader2 size={26} style={{ color:"#a78bfa", animation:"nexusSpin 1s linear infinite" }}/>
      </div>
      <style>{`@keyframes nexusSpin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );

  if (fetchError) return (
    <AdminLayout>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"#fff1f2", border:"1.5px solid #fecdd3", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <AlertCircle size={24} style={{ color:"#ef4444" }}/>
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:"#374151" }}>Failed to load</div>
        <div style={{ fontSize:12, color:"#94a3b8" }}>{fetchError}</div>
        <button onClick={() => window.location.reload()} style={{ padding:"8px 18px", borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", border:"none", fontWeight:700, fontSize:12, cursor:"pointer" }}>Retry</button>
      </div>
      <style>{`@keyframes nexusSpin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Question Bank Test"
        subtitle="Select chapters and topics · generate questions automatically"
        right={
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={handleSave} disabled={isSubmitting||!!createdTestId}
              style={{ display:"flex", alignItems:"center", gap:6, background:createdTestId?"#ecfdf5":(isSubmitting?"#fff7ed":"linear-gradient(135deg,#f59e0b,#f97316)"), color:createdTestId?"#047857":(isSubmitting?"#b45309":"#fff"), padding:"6px 14px", borderRadius:9, fontSize:12, fontWeight:700, border:"none", cursor:createdTestId?"default":"pointer", boxShadow:createdTestId?"none":(isSubmitting?"none":"0 2px 10px rgba(245,158,11,0.28)"), transition:"all 0.15s" }}
              onMouseEnter={e => { if(!createdTestId&&!isSubmitting) e.currentTarget.style.opacity="0.88"; }} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
              {createdTestId ? <><CheckCircle2 size={13}/> Saved</> : isSubmitting ? <><Loader2 size={13} style={{ animation:"nexusSpin 1s linear infinite" }}/> Saving…</> : <><Layout size={13}/> Save Blueprint</>}
            </button>
            <button onClick={handleGenerate} disabled={isSubmitting||!canGenerate}
              style={{ display:"flex", alignItems:"center", gap:6, background:canGenerate?(isSubmitting?"#f5f3ff":"linear-gradient(135deg,#3b82f6,#7c3aed)"):"#f3f4f6", color:canGenerate?(isSubmitting?"#7c3aed":"#fff"):"#94a3b8", padding:"6px 14px", borderRadius:9, fontSize:12, fontWeight:700, border:"none", cursor:canGenerate&&!isSubmitting?"pointer":"not-allowed", boxShadow:canGenerate&&!isSubmitting?"0 2px 10px rgba(109,40,217,0.28)":"none", transition:"all 0.15s" }}
              onMouseEnter={e => { if(canGenerate&&!isSubmitting) e.currentTarget.style.opacity="0.88"; }} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
              {isSubmitting&&canGenerate ? <><Loader2 size={13} style={{ animation:"nexusSpin 1s linear infinite" }}/> Generating…</> : <><Zap size={13}/> Generate Test</>}
            </button>
          </div>
        }
      />

      <div style={{ flex:1, display:"flex", overflow:"hidden", background:"#f4f3fa", minHeight:0, fontFamily:"'DM Sans',sans-serif" }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{ width:252, flexShrink:0, display:"flex", flexDirection:"column", borderRight:"1px solid #ede9f6", background:"#fff", minHeight:0 }}>
          <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"11px", display:"flex", flexDirection:"column", gap:13 }}>

            {/* title */}
            <div>
              <SLabel icon={<FileText size={9}/>} label="Test Title" />
              <input value={formData.title} onChange={e => setFormData({ ...formData, title:e.target.value })} placeholder="e.g. PCM Chapter Test"
                style={{ width:"100%", boxSizing:"border-box", padding:"8px 11px", background:"transparent", border:`1.5px solid ${formData.title?"#7c3aed":"#e5e7eb"}`, borderRadius:9, fontSize:12, fontWeight:700, color:"#0f172a", outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor="#a78bfa"} onBlur={e => e.target.style.borderColor=formData.title?"#7c3aed":"#e5e7eb"} />
            </div>

            <div style={{ height:1, background:"linear-gradient(90deg,transparent,#ede9f6,transparent)" }} />

            {/* duration */}
            <div>
              <SLabel icon={<Clock size={9}/>} label="Duration" />
              <div style={{ display:"flex", alignItems:"center", gap:7, background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:9, padding:"7px 11px" }}>
                <input type="number" value={formData.time} onWheel={e=>e.target.blur()} onChange={e=>setFormData({...formData,time:e.target.value})} className="no-spinner"
                  style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:13, fontWeight:800, color:"#5b21b6", fontFamily:"'DM Sans',sans-serif", width:40 }} />
                <span style={{ fontSize:9, fontWeight:700, color:"#a78bfa", textTransform:"uppercase" }}>min</span>
              </div>
            </div>

            {/* pattern */}
            <div>
              <SLabel icon={<Target size={9}/>} label="Exam Pattern" />
              <div style={{ position:"relative" }}>
                <button onClick={() => setActiveDropdownId(activeDropdownId==="pattern"?null:"pattern")}
                  style={{ all:"unset", width:"100%", boxSizing:"border-box", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 11px", borderRadius:9, cursor:"pointer", background:badge.bg, border:`1.5px solid ${badge.border}` }}>
                  <span style={{ fontSize:12, fontWeight:700, color:badge.color }}>{PATTERNS.find(p=>p.val===formData.pattern)?.label}</span>
                  <ChevronDown size={12} style={{ color:badge.color, transform:activeDropdownId==="pattern"?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
                </button>
                {activeDropdownId==="pattern" && (
                  <><div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={() => setActiveDropdownId(null)} />
                  <div style={{ position:"absolute", left:0, top:"calc(100% + 4px)", width:"100%", background:"#fff", border:"1.5px solid #ede9fe", borderRadius:11, boxShadow:"0 10px 36px rgba(109,40,217,0.14)", zIndex:20, overflow:"hidden" }}>
                    <div style={{ padding:"7px 11px 5px", borderBottom:"1px solid #f3f0ff" }}><span style={{ fontSize:8.5, fontWeight:800, color:"#a78bfa", textTransform:"uppercase", letterSpacing:"0.1em" }}>Select pattern</span></div>
                    <div style={{ padding:4 }}>
                      {PATTERNS.map(opt => { const sel=formData.pattern===opt.val; const ob=examBadge(opt.val); return (
                        <button key={opt.val} onClick={() => handlePatternChange(opt.val)}
                          style={{ all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:sel?700:500, background:sel?ob.bg:"transparent", color:sel?ob.color:"#374151", transition:"all 0.1s" }}
                          onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background="#f5f3ff"; }} onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background="transparent"; }}>
                          {opt.label}{sel && <CheckCircle2 size={11} style={{ color:ob.color }}/>}
                        </button>); })}
                    </div>
                  </div></>
                )}
              </div>
              {formData.pattern==="SINGLE" && (
                <div style={{ position:"relative", marginTop:6 }}>
                  <button onClick={() => setActiveDropdownId(activeDropdownId==="subject"?null:"subject")}
                    style={{ all:"unset", width:"100%", boxSizing:"border-box", display:"flex", alignItems:"center", gap:7, background:"#faf5ff", border:"1.5px solid #ddd6fe", borderRadius:9, padding:"7px 11px", cursor:"pointer" }}>
                    <BookOpen size={11} style={{ color:"#7c3aed" }}/><span style={{ fontSize:11, fontWeight:600, color:"#5b21b6", flex:1 }}>{formData.selectedSingleSubject||"Select subject"}</span><ChevronDown size={11} style={{ color:"#a78bfa" }}/>
                  </button>
                  {activeDropdownId==="subject" && (
                    <><div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={() => setActiveDropdownId(null)} />
                    <div style={{ position:"absolute", left:0, top:"calc(100% + 4px)", width:"100%", background:"#fff", border:"1.5px solid #ede9fe", borderRadius:11, boxShadow:"0 8px 24px rgba(109,40,217,0.11)", zIndex:20, padding:4, maxHeight:200, overflowY:"auto" }}>
                      {configTree.map(s => { const sel=formData.selectedSingleSubject===s.subjectName; return (
                        <button key={s._id} onClick={() => { setFormData(prev=>({...prev,selectedSingleSubject:s.subjectName})); handlePatternChange("SINGLE",configTree,s.subjectName); }}
                          style={{ all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:sel?700:500, background:sel?"#7c3aed":"transparent", color:sel?"#fff":"#374151" }}>
                          {s.subjectName}{sel && <CheckCircle2 size={11}/>}
                        </button>); })}
                    </div></>
                  )}
                </div>
              )}
            </div>

            {/* batches */}
            <div>
              <SLabel icon={<Users size={9}/>} label="Assign Batches" />
              {availableBatches.length === 0 ? (
                <div style={{ fontSize:11, color:"#94a3b8", padding:"6px 0" }}>No batches found.</div>
              ) : (
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
                        {classBatches.map(batch => { const sel=formData.selectedBatchIds.includes(batch._id); return (
                          <button key={batch._id}
                            onClick={() => setFormData({ ...formData, selectedBatchIds:sel?formData.selectedBatchIds.filter(id=>id!==batch._id):[...formData.selectedBatchIds,batch._id] })}
                            style={{ padding:"4px 10px", borderRadius:7, cursor:"pointer", fontSize:10.5, fontWeight:600, border:"1.5px solid", background:sel?"linear-gradient(135deg,#7c3aed,#6366f1)":"transparent", borderColor:sel?"transparent":"#e5e7eb", color:sel?"#fff":"#6b7280", boxShadow:sel?"0 2px 8px rgba(109,40,217,0.2)":"none", transition:"all 0.13s" }}>
                            {batch.name}
                          </button>); })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* schedule */}
            <div>
              <SLabel icon={<Calendar size={9}/>} label="Schedule"
                action={<button onClick={() => setShowSchedule(!showSchedule)} style={{ all:"unset", fontSize:9.5, fontWeight:700, cursor:"pointer", color:showSchedule?"#c2410c":"#7c3aed", background:showSchedule?"#fff7ed":"#f5f3ff", border:`1px solid ${showSchedule?"#fed7aa":"#ede9fe"}`, padding:"2px 8px", borderRadius:5 }}>{showSchedule?"Hide":"Set"}</button>}
              />
              {showSchedule ? (
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[{ label:"Start",color:"#10b981",pulse:false,dk:"scheduleDate",tk:"scheduleTime",min:today },{ label:"End",color:"#a78bfa",pulse:true,dk:"endTimeDate",tk:"endTimeTime",min:formData.scheduleDate||today }].map(({ label,color,pulse,dk,tk,min }) => (
                    <div key={dk}>
                      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:color, animation:pulse?"nexusPulse 1.5s infinite":"none" }} />
                        <span style={{ fontSize:8.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>{label} time</span>
                        {label==="End" && <span style={{ fontSize:8.5, color:"#c4b5fd" }}>optional</span>}
                      </div>
                      <div style={{ display:"flex", gap:5, background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:8, padding:"6px 10px" }} onFocusCapture={e=>e.currentTarget.style.borderColor="#a78bfa"} onBlurCapture={e=>e.currentTarget.style.borderColor="#e5e7eb"}>
                        <input type="date" min={min} onChange={e=>setFormData({...formData,[dk]:e.target.value})} style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:10, fontWeight:500, color:"#374151", fontFamily:"'DM Sans',sans-serif" }} />
                        <div style={{ width:1, background:"#e5e7eb", alignSelf:"stretch" }} />
                        <input type="time" onChange={e=>setFormData({...formData,[tk]:e.target.value})} style={{ background:"transparent", border:"none", outline:"none", fontSize:10, fontWeight:500, color:"#374151", fontFamily:"'DM Sans',sans-serif" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize:11, color:"#94a3b8", lineHeight:1.5 }}>Not set — goes live <span style={{ color:"#5b21b6", fontWeight:600 }}>immediately</span>.</div>}
            </div>

          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>

          {/* right header */}
          <div style={{ padding:"10px 16px", background:"#fff", borderBottom:"1px solid #ede9f6", flexShrink:0, display:"flex", alignItems:"center", gap:9 }}>
            {activeSubjectId && (
              <button onClick={() => { setActiveSubjectId(null); setSearchQuery(""); }} style={{ all:"unset", cursor:"pointer", display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:8, background:"#f5f3ff", color:"#7c3aed", fontSize:11, fontWeight:700, border:"1.5px solid #ddd6fe", transition:"background 0.13s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#ede9fe"} onMouseLeave={e=>e.currentTarget.style.background="#f5f3ff"}>
                <ArrowLeft size={12}/> Back to Subjects
              </button>
            )}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#0f172a" }}>
                {activeSubjectId && activeSubjectData ? `${activeSubjectData.subjectName} — Select Chapters` : "Subjects"}
              </div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>
                {activeSubjectId && activeSubjectData ? `${activeSubjectData.chapters.length} chapters available` : "Select chapters and topics for each subject"}
              </div>
            </div>
            {activeSubjectId && activeSubjectData && (
              <>
                <button onClick={() => { const allCh=activeSubjectData.chapters; const sub=formData.subjects.find(s=>s.dbId===activeSubjectId); const isAll=sub?.chapters.length===allCh.length; setFormData(prev=>({...prev,subjects:prev.subjects.map(s=>{ if(s.dbId!==activeSubjectId) return s; return {...s,chapters:!isAll?allCh.map(ch=>({chapterId:ch.chapterId,chapterName:ch.chapterName,topics:ch.topics.map(t=>t._id),open:false})):[]}; })})); }}
                  style={{ padding:"5px 11px", borderRadius:8, cursor:"pointer", border:"1.5px solid", fontSize:10.5, fontWeight:700, display:"flex", alignItems:"center", gap:5, background:activeSub?.chapters.length===activeSubjectData?.chapters.length?"#fff1f2":"linear-gradient(135deg,#7c3aed,#6366f1)", borderColor:activeSub?.chapters.length===activeSubjectData?.chapters.length?"#fecdd3":"transparent", color:activeSub?.chapters.length===activeSubjectData?.chapters.length?"#ef4444":"#fff" }}>
                  {activeSub?.chapters.length===activeSubjectData?.chapters.length ? <><XCircle size={11}/> Deselect All</> : <><CheckCircle2 size={11}/> Select All</>}
                </button>
                <div style={{ position:"relative" }}>
                  <Search size={11} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
                  <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search chapters…"
                    style={{ paddingLeft:26, paddingRight:9, paddingTop:6, paddingBottom:6, background:"transparent", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:11, outline:"none", fontFamily:"'DM Sans',sans-serif", width:170, transition:"border-color 0.15s" }}
                    onFocus={e=>e.target.style.borderColor="#a78bfa"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
                  {searchQuery && <button onClick={()=>setSearchQuery("")} style={{ all:"unset", position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"#94a3b8" }}><X size={10}/></button>}
                </div>
              </>
            )}
          </div>

          {/* content */}
          <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"14px 16px 32px", background:"#f4f3fa" }}>

            {!activeSubjectId ? (
              /* ── subject cards ── */
              configTree.length === 0 ? (
                <EmptyState icon={<FileText size={22}/>} title="No Question Bank" msg="Ask your administrator to add subjects and chapters first." />
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(248px,1fr))", gap:11 }}>
                  {formData.subjects.map(sub => {
                    const ac           = subjectColor(sub.name);
                    const selectedCount = sub.chapters.reduce((acc,c)=>acc+c.topics.length, 0);
                    const hasSel        = selectedCount > 0;
                    return (
                      <div key={sub.dbId} style={{ background:"#fff", borderRadius:13, border:`1.5px solid ${hasSel?ac.border:"#ede9f6"}`, overflow:"hidden", boxShadow:hasSel?`0 4px 14px ${ac.dot}14`:"0 1px 5px rgba(109,40,217,0.03)", transition:"all 0.2s" }}>
                        <div style={{ height:2.5, background:hasSel?`linear-gradient(90deg,${ac.from},${ac.to})`:"linear-gradient(90deg,#ede9f6,#f3f0ff)" }} />
                        <div style={{ padding:"11px 13px", borderBottom:"1px solid #f5f5f5", display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:30, height:30, borderRadius:8, background:hasSel?`linear-gradient(135deg,${ac.from},${ac.to})`:ac.light, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <BookOpen size={13} style={{ color:hasSel?"#fff":ac.dot }}/>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:11, fontWeight:800, color:"#0f172a", textTransform:"uppercase", letterSpacing:"0.05em" }}>{sub.name}</div>
                            <div style={{ fontSize:9, color:"#94a3b8", fontWeight:500, marginTop:1 }}>{hasSel?`${selectedCount} topics selected`:"No chapters selected"}</div>
                          </div>
                          {hasSel && <CheckCircle2 size={13} style={{ color:"#10b981", flexShrink:0 }}/>}
                        </div>
                        <div style={{ padding:"10px 13px", display:"flex", flexDirection:"column", gap:8 }}>
                          <div style={{ display:"flex", gap:7 }}>
                            {/* Q count */}
                            <div style={{ flex:1, display:"flex", alignItems:"center", gap:5, background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:8, padding:"6px 10px" }}>
                              <span style={{ fontSize:10, fontWeight:700, color:"#a78bfa" }}>Q</span>
                              <input type="number" value={sub.qCount} onWheel={e=>e.target.blur()} onChange={e=>setFormData({...formData,subjects:formData.subjects.map(s=>s.dbId===sub.dbId?{...s,qCount:e.target.value}:s)})}
                                style={{ width:32, background:"transparent", border:"none", outline:"none", fontSize:12, fontWeight:800, color:"#5b21b6", fontFamily:"'DM Sans',sans-serif" }} className="no-spinner" />
                              <span style={{ fontSize:8.5, fontWeight:700, color:"#c4b5fd", textTransform:"uppercase" }}>Qs</span>
                            </div>
                            {/* difficulty */}
                            <div style={{ position:"relative" }}>
                              <button onClick={()=>setOpenDifficulty(openDifficulty===sub.dbId?null:sub.dbId)} style={{ height:"100%", display:"flex", alignItems:"center", gap:5, background:"#f8f7ff", border:"1.5px solid #ede9fe", borderRadius:8, padding:"0 10px", cursor:"pointer", minWidth:70 }}>
                                <span style={{ fontSize:11, fontWeight:700, color:"#5b21b6" }}>{sub.difficulty}</span>
                                <ChevronDown size={10} style={{ color:"#a78bfa", transform:openDifficulty===sub.dbId?"rotate(180deg)":"none", transition:"transform 0.2s" }}/>
                              </button>
                              {openDifficulty===sub.dbId && (
                                <><div style={{ position:"fixed", inset:0, zIndex:10 }} onClick={()=>setOpenDifficulty(null)}/>
                                <div style={{ position:"absolute", right:0, top:"calc(100% + 4px)", background:"#fff", border:"1.5px solid #ede9fe", borderRadius:10, boxShadow:"0 8px 24px rgba(109,40,217,0.11)", zIndex:20, padding:4, minWidth:84 }}>
                                  {["Easy","Med","Hard"].map(lvl => (
                                    <button key={lvl} onClick={()=>{ setFormData({...formData,subjects:formData.subjects.map(s=>s.dbId===sub.dbId?{...s,difficulty:lvl}:s)}); setOpenDifficulty(null); }}
                                      style={{ all:"unset", display:"block", width:"100%", boxSizing:"border-box", padding:"6px 10px", borderRadius:7, fontSize:10.5, fontWeight:sub.difficulty===lvl?700:500, cursor:"pointer", color:sub.difficulty===lvl?"#7c3aed":"#374151", background:sub.difficulty===lvl?"#f5f3ff":"transparent" }}
                                      onMouseEnter={e=>{ if(sub.difficulty!==lvl) e.currentTarget.style.background="#f8f7ff"; }} onMouseLeave={e=>{ if(sub.difficulty!==lvl) e.currentTarget.style.background="transparent"; }}>
                                      {lvl}
                                    </button>
                                  ))}
                                </div></>
                              )}
                            </div>
                          </div>
                          <button onClick={()=>{ setActiveSubjectId(sub.dbId); setSearchQuery(""); }} style={{ padding:"9px", borderRadius:10, cursor:"pointer", border:`1.5px solid ${hasSel?ac.border:"#e5e7eb"}`, background:hasSel?ac.light:"#fafafa", color:hasSel?ac.text:"#6b7280", fontSize:10.5, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.15s" }}
                            onMouseEnter={e=>{ e.currentTarget.style.background=ac.light; e.currentTarget.style.borderColor=ac.border; }} onMouseLeave={e=>{ if(!hasSel){ e.currentTarget.style.background="#fafafa"; e.currentTarget.style.borderColor="#e5e7eb"; } }}>
                            {hasSel ? <><Settings2 size={12}/> {sub.chapters.length} chapters · Edit</> : <><Plus size={12}/> Select Chapters</>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* ── chapter selector ── */
              <div style={{ display:"flex", flexDirection:"column", gap:7, maxWidth:820 }}>
                {filteredChapters.length === 0 ? (
                  <EmptyState icon={<BookOpen size={22}/>} title="No Chapters" msg={searchQuery ? "No chapters match your search." : "This subject has no chapters yet."} />
                ) : filteredChapters.map(ch => {
                  const sub      = formData.subjects.find(s => s.dbId===activeSubjectId);
                  const sel      = sub?.chapters.find(c => c.chapterId===ch.chapterId);
                  const hasTopic = ch.topics && ch.topics.length > 0;
                  return (
                    <div key={ch.chapterId} style={{ background:"#fff", border:`1.5px solid ${sel?"#ddd6fe":hasTopic?"#ede9f6":"#f3f4f6"}`, borderRadius:12, overflow:"hidden", opacity:hasTopic?1:0.6 }}>
                      <div style={{ display:"flex", alignItems:"center" }}>
                        <div onClick={()=>{ if(hasTopic) toggleChapter(activeSubjectId,ch,!sel); }} style={{ flex:1, display:"flex", alignItems:"center", gap:10, padding:"10px 14px", cursor:hasTopic?"pointer":"not-allowed", background:sel?"#faf5ff":"#fff", transition:"background 0.1s" }}
                          onMouseEnter={e=>{ if(!sel&&hasTopic) e.currentTarget.style.background="#f9fafb"; }} onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background=sel?"#faf5ff":"#fff"; }}>
                          <div style={{ width:27, height:27, borderRadius:7, background:sel?"#7c3aed":hasTopic?"#f3f4f6":"#f9fafb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            {sel ? <Check size={12} color="#fff" strokeWidth={3}/> : <Plus size={12} color={hasTopic?"#9ca3af":"#d1d5db"}/>}
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:sel?"#5b21b6":hasTopic?"#374151":"#9ca3af", textTransform:"uppercase", letterSpacing:"0.03em" }}>{ch.chapterName}</div>
                            <div style={{ fontSize:9.5, fontWeight:500, marginTop:1 }}>
                              {hasTopic ? <span style={{ color:sel?"#a78bfa":"#94a3b8" }}>{sel?`${sel.topics.length}/${ch.topics.length} topics`:`${ch.topics.length} topics`}</span>
                              : <span style={{ color:"#ef4444", fontWeight:600, fontSize:8.5, textTransform:"uppercase" }}>No topics</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={e=>{ e.stopPropagation(); if(!sel||!hasTopic) return; setFormData(prev=>({...prev,subjects:prev.subjects.map(s=>{ if(s.dbId!==activeSubjectId) return s; return {...s,chapters:s.chapters.map(c=>c.chapterId===ch.chapterId?{...c,open:!c.open}:c)}; })})); }}
                          style={{ padding:"10px 13px", background:"transparent", border:"none", borderLeft:"1px solid #f3f4f6", cursor:(sel&&hasTopic)?"pointer":"not-allowed", color:sel?"#94a3b8":"#d1d5db", opacity:(sel&&hasTopic)?1:0.4 }}>
                          <ChevronDown size={13} style={{ transform:sel?.open?"rotate(180deg)":"none", transition:"transform 0.2s", color:sel?.open?"#7c3aed":undefined }}/>
                        </button>
                      </div>
                      {sel?.open && hasTopic && (
                        <div style={{ padding:"8px 13px 11px", background:"#faf5ff", borderTop:"1px solid #ede9fe" }}>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
                            {ch.topics.map(t => {
                              const active = sel.topics.includes(t._id);
                              return (
                                <div key={t._id} onClick={()=>toggleTopic(activeSubjectId,ch.chapterId,t._id)} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 9px", background:active?"#fff":"#faf5ff", border:`1px solid ${active?"#ddd6fe":"transparent"}`, borderRadius:8, cursor:"pointer", transition:"all 0.1s" }}>
                                  <div style={{ width:14, height:14, borderRadius:4, background:active?"#7c3aed":"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                                    {active && <Check size={8} color="#fff" strokeWidth={4}/>}
                                  </div>
                                  <span style={{ fontSize:10, fontWeight:active?700:500, color:active?"#5b21b6":"#6b7280", lineHeight:1.3 }}>{t.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredChapters.length > 0 && (
                  <div style={{ paddingTop:6 }}>
                    <button onClick={()=>{ setActiveSubjectId(null); setSearchQuery(""); }} style={{ padding:"10px 20px", background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", border:"none", borderRadius:11, fontSize:11, fontWeight:800, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.06em", boxShadow:"0 4px 12px rgba(109,40,217,0.26)", display:"flex", alignItems:"center", gap:7 }}>
                      <CheckCircle2 size={13}/> Finalize — Back to Subjects
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes nexusSpin{to{transform:rotate(360deg)}}
        @keyframes nexusPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .no-spinner::-webkit-outer-spin-button,.no-spinner::-webkit-inner-spin-button{-webkit-appearance:none}
        .no-spinner{-moz-appearance:textfield}
      `}</style>
    </AdminLayout>
  );
}