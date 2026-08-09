import React, { useState, useEffect, useCallback } from "react";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  BookOpen, HelpCircle, Sigma, Wind, Beaker, Binary, Atom,
  Trash2, FileText, Loader2, Search, RefreshCw,
  Calendar, Users, Layers, AlertTriangle, X,
  FolderOpen, LayoutGrid, List, ArrowLeft, Download,
  ExternalLink, ZoomIn, ChevronRight, UploadCloud, Plus, Check
} from "lucide-react";
import { SUBJECTS as LIB_SUBJECTS, CHAPTERS as LIB_CHAPTERS, CATEGORIES as LIB_CATEGORIES } from "../student/libraryConfig";

const SUBJECTS = [
  { id: "all",       name: "All Subjects", icon: <Layers size={13}/>,  color: "#6d28d9", bg: "#f5f3ff", accent: "#7c3aed" },
  { id: "Physics",   name: "Physics",      icon: <Wind size={13}/>,    color: "#4f46e5", bg: "#eef2ff", accent: "#6366f1" },
  { id: "Chemistry", name: "Chemistry",    icon: <Beaker size={13}/>,  color: "#047857", bg: "#ecfdf5", accent: "#10b981" },
  { id: "Maths",     name: "Maths",        icon: <Binary size={13}/>,  color: "#7c3aed", bg: "#f5f3ff", accent: "#8b5cf6" },
  { id: "Biology",   name: "Biology",      icon: <Atom size={13}/>,    color: "#be185d", bg: "#fdf2f8", accent: "#ec4899" },
];
const SUBJECT_MAP = Object.fromEntries(SUBJECTS.slice(1).map(s => [s.id, s]));

const CATEGORIES = [
  { id: "all",       label: "All Types", icon: <Layers size={12}/> },
  { id: "notes",     label: "Notes",     icon: <BookOpen size={12}/> },
  { id: "pyqs",      label: "PYQs",      icon: <HelpCircle size={12}/> },
  { id: "formulas",  label: "Formulas",  icon: <Sigma size={12}/> },
  { id: "mindmaps",  label: "Mind Maps", icon: <Layers size={12}/> },
  { id: "revision",  label: "Revision",  icon: <Layers size={12}/> },
  { id: "synopsis",  label: "Synopsis",  icon: <Layers size={12}/> },
];

const CAT_META = {
  notes:    { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  pyqs:     { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  formulas: { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  mindmaps: { color: "#8B5CF6", bg: "#f5f3ff", border: "#ddd6fe" },
  revision: { color: "#EC4899", bg: "#fdf2f8", border: "#fbcfe8" },
  synopsis: { color: "#F43F5E", bg: "#fff1f2", border: "#fecdd3" },
  Notes:    { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" }, // legacy fallback
  PYQs:     { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }, // legacy fallback
  Formulas: { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" }, // legacy fallback
};

function DeleteModal({ item, onConfirm, onCancel, deleting }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"26px 28px", maxWidth:380, width:"100%", boxShadow:"0 30px 70px rgba(0,0,0,0.2)", border:"1.5px solid #f0f0f0", animation:"modalIn 0.2s ease", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:48, height:48, borderRadius:13, background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, border:"1.5px solid #fecdd3" }}>
          <AlertTriangle size={22} style={{ color:"#ef4444" }} />
        </div>
        <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", marginBottom:6 }}>Delete material?</div>
        <p style={{ fontSize:12, color:"#64748b", lineHeight:1.65, margin:"0 0 22px" }}>
          <strong style={{ color:"#0f172a" }}>{item?.title || "This file"}</strong> will be permanently removed from all batches.
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onCancel} disabled={deleting} style={{ flex:1, padding:"10px 0", borderRadius:11, border:"1.5px solid #e5e7eb", background:"#fff", color:"#64748b", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{ flex:1, padding:"10px 0", borderRadius:11, border:"none", background:deleting?"#fca5a5":"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", fontWeight:700, fontSize:12, cursor:deleting?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"inherit" }}>
            {deleting ? <Loader2 size={13} style={{ animation:"nexusSpin 1s linear infinite" }}/> : <Trash2 size={13}/>}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ item, onClose }) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [loadError,     setLoadError]     = useState(false);
  const sub       = SUBJECT_MAP[item.subject] || SUBJECTS[1];
  const cat       = CAT_META[item.category]   || CAT_META.Notes;
  const date      = item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(item.fileUrl)}&embedded=true`;

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", flexDirection:"column", background:"#0f172a", fontFamily:"'DM Sans',sans-serif", animation:"modalIn 0.18s ease" }}>
      <div style={{ height:56, background:"#fff", borderBottom:"1px solid #ede9f6", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0, boxShadow:"0 2px 8px rgba(109,40,217,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1 }}>
          <button onClick={onClose} style={{ all:"unset", cursor:"pointer", display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:9, background:"#f5f3ff", color:"#7c3aed", fontSize:12, fontWeight:700, border:"1.5px solid #ddd6fe", flexShrink:0, transition:"background 0.13s" }}
            onMouseEnter={e => e.currentTarget.style.background="#ede9fe"}
            onMouseLeave={e => e.currentTarget.style.background="#f5f3ff"}
          ><ArrowLeft size={13}/> Back</button>
          <div style={{ width:1, height:24, background:"#ede9f6", flexShrink:0 }} />
          <div style={{ width:32, height:32, borderRadius:9, background:sub.bg, display:"flex", alignItems:"center", justifyContent:"center", color:sub.color, flexShrink:0 }}><FileText size={14}/></div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title || "Untitled"}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
              <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:5, background:sub.bg, color:sub.color, border:`1px solid ${sub.color}28` }}>{sub.name}</span>
              <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:5, background:cat.bg, color:cat.color, border:`1px solid ${cat.border}` }}>{item.category}</span>
              <span style={{ fontSize:10, color:"#94a3b8", fontWeight:500 }}>{date}</span>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <a href={item.fileUrl} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"transparent", color:"#64748b", fontSize:12, fontWeight:700, textDecoration:"none", transition:"all 0.13s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#7c3aed"; e.currentTarget.style.color="#7c3aed"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#64748b"; }}
          ><ExternalLink size={12}/> Open</a>
          <a href={item.fileUrl} download style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", fontSize:12, fontWeight:700, textDecoration:"none", boxShadow:"0 2px 10px rgba(109,40,217,0.28)", transition:"opacity 0.13s" }}
            onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity="1"}
          ><Download size={12}/> Download</a>
          <button onClick={onClose} style={{ all:"unset", cursor:"pointer", width:32, height:32, borderRadius:8, background:"#f8fafc", border:"1.5px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", transition:"all 0.13s" }}
            onMouseEnter={e => { e.currentTarget.style.background="#fff1f2"; e.currentTarget.style.borderColor="#fecdd3"; e.currentTarget.style.color="#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="#64748b"; }}
          ><X size={14}/></button>
        </div>
      </div>

      <div style={{ flex:1, position:"relative", background:"#1e293b", minHeight:0 }}>
        {iframeLoading && !loadError && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, zIndex:10 }}>
            <Loader2 size={24} style={{ color:"#a78bfa", animation:"nexusSpin 1s linear infinite" }} />
            <div style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>Loading preview…</div>
          </div>
        )}
        {loadError ? (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, padding:40, textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:15, background:"rgba(239,68,68,0.1)", border:"1.5px solid rgba(239,68,68,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <AlertTriangle size={24} style={{ color:"#ef4444" }} />
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:6 }}>Preview unavailable</div>
              <div style={{ fontSize:12, color:"#64748b", maxWidth:260, lineHeight:1.6 }}>This file couldn't be previewed inline. Open or download it directly.</div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <a href={item.fileUrl} target="_blank" rel="noreferrer" style={{ padding:"9px 18px", borderRadius:10, border:"1.5px solid rgba(255,255,255,0.12)", background:"transparent", color:"#e2e8f0", fontWeight:700, fontSize:12, display:"flex", alignItems:"center", gap:6, textDecoration:"none" }}><ExternalLink size={12}/> Open</a>
              <a href={item.fileUrl} download style={{ padding:"9px 18px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", fontWeight:700, fontSize:12, display:"flex", alignItems:"center", gap:6, textDecoration:"none" }}><Download size={12}/> Download</a>
            </div>
          </div>
        ) : (
          <iframe src={viewerUrl} title={item.title || "Document Preview"} style={{ width:"100%", height:"100%", border:"none", opacity:iframeLoading?0:1, transition:"opacity 0.3s ease" }} onLoad={() => setIframeLoading(false)} onError={() => { setIframeLoading(false); setLoadError(true); }} />
        )}
      </div>

      {!iframeLoading && !loadError && (
        <div style={{ height:34, background:"#0f172a", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", paddingLeft:20, paddingRight:20, gap:20, flexShrink:0 }}>
          <span style={{ fontSize:10, color:"#475569", fontWeight:500 }}>{item.title}</span>
          {item.fileSize && <span style={{ fontSize:10, color:"#475569", fontWeight:500 }}>{item.fileSize}</span>}
          <span style={{ fontSize:10, color:"#334155", fontWeight:500, marginLeft:"auto" }}>Press <kbd style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:4, padding:"1px 5px", fontSize:9, color:"#94a3b8" }}>Esc</kbd> to close</span>
        </div>
      )}
    </div>
  );
}

function UploadModal({ batches, onClose, onUploadSuccess, baseURL }) {
  // 1. Group batches by class
  const classBatchesMap = batches.reduce((acc, b) => {
    const c = b.className || "General Class";
    if (!acc[c]) acc[c] = [];
    acc[c].push(b);
    return acc;
  }, {});
  const uniqueClasses = Object.keys(classBatchesMap);

  const [targetClass, setTargetClass] = useState(uniqueClasses[0] || "");
  const [syllabus, setSyllabus] = useState(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);

  const [file, setFile] = useState(null);
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [category, setCategory] = useState("notes");
  const [isFree, setIsFree] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Fetch syllabus when targetClass changes
  useEffect(() => {
    if (!targetClass) return;
    const fetchSyllabus = async () => {
      setLoadingSyllabus(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/teacher/syllabus/${targetClass}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setSyllabus(data);
        if (data && data.subjects && data.subjects.length > 0) {
          setSubjectId(data.subjects[0].name);
          setChapterId(data.subjects[0].chapters[0]?.name || "");
        } else {
          setSubjectId("");
          setChapterId("");
        }
      } catch (err) {
        console.error("Failed to fetch syllabus:", err);
      } finally {
        setLoadingSyllabus(false);
      }
    };
    fetchSyllabus();
  }, [targetClass, baseURL]);

  // Handle subject change
  useEffect(() => {
    if (syllabus && syllabus.subjects) {
      const sub = syllabus.subjects.find(s => s.name === subjectId);
      if (sub && sub.chapters && sub.chapters.length > 0) {
        setChapterId(sub.chapters[0].name);
      } else {
        setChapterId("");
      }
    }
  }, [subjectId, syllabus]);


  const handleFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const toggleBatch = (id) => {
    if (selectedBatches.includes(id)) {
      setSelectedBatches(selectedBatches.filter(b => b !== id));
    } else {
      setSelectedBatches([...selectedBatches, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file.");
    if (!chapterId) return setError("Please select a chapter.");
    if (selectedBatches.length === 0) return setError("Please select at least one batch.");

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);
    formData.append("chapterId", chapterId);
    formData.append("category", category);
    formData.append("isFree", isFree);
    formData.append("batchIds", JSON.stringify(selectedBatches));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseURL}/teacher/upload-material`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const currentSubjects = syllabus?.subjects || [];
  const currentChapters = currentSubjects.find(s => s.name === subjectId)?.chapters || [];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:24, padding:"30px", width:"100%", maxWidth:480, boxShadow:"0 40px 80px rgba(0,0,0,0.2)", border:"1.5px solid #f0f0f0", animation:"modalIn 0.2s ease", fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", maxHeight:"90vh" }}>
        
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#7c3aed" }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>Upload Material</div>
              <div style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>Share PDFs with your batches</div>
            </div>
          </div>
          <button onClick={onClose} disabled={uploading} style={{ all:"unset", cursor:uploading?"not-allowed":"pointer", padding:6, borderRadius:8, background:"#f8fafc", color:"#64748b", border:"1px solid #e5e7eb" }}><X size={16}/></button>
        </div>

        {error && (
          <div style={{ padding:"10px 14px", borderRadius:10, background:"#fef2f2", color:"#ef4444", fontSize:12, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8, border:"1px solid #fecdd3", flexShrink:0 }}>
            <AlertTriangle size={14}/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18, flex:1, overflowY:"auto", paddingRight:6 }} className="nexus-no-scroll">
          
          {/* File Picker */}
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>File</div>
            <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", border:"1.5px dashed #c4b5fd", borderRadius:16, padding:"24px", cursor:"pointer", background: file ? "#f5f3ff" : "#faf8ff", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="#f5f3ff"}
              onMouseLeave={e => e.currentTarget.style.background=file ? "#f5f3ff" : "#faf8ff"}
            >
              <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"none" }} disabled={uploading} />
              {file ? (
                <>
                  <div style={{ width:40, height:40, borderRadius:12, background:"#7c3aed", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                    <FileText size={20}/>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#7c3aed", textAlign:"center", wordBreak:"break-all" }}>{file.name}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:500, marginTop:4 }}>{(file.size/1024/1024).toFixed(2)} MB</div>
                </>
              ) : (
                <>
                  <div style={{ width:40, height:40, borderRadius:12, background:"#e9d5ff", color:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                    <UploadCloud size={20}/>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#7c3aed", textAlign:"center" }}>Click to select a PDF</div>
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:500, marginTop:4 }}>Max size: 50MB</div>
                </>
              )}
            </label>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Target Class */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Target Class</div>
              <select value={targetClass} onChange={e => { setTargetClass(e.target.value); setSelectedBatches([]); }} disabled={uploading} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#f8fafc", fontSize:13, fontWeight:600, color:"#0f172a", outline:"none", appearance:"none" }}>
                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Category</div>
              <select value={category} onChange={e => setCategory(e.target.value)} disabled={uploading} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#f8fafc", fontSize:13, fontWeight:600, color:"#0f172a", outline:"none", appearance:"none" }}>
                {LIB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Subject */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Subject</div>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} disabled={uploading || loadingSyllabus || currentSubjects.length === 0} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#f8fafc", fontSize:13, fontWeight:600, color:"#0f172a", outline:"none", appearance:"none" }}>
                {loadingSyllabus ? <option>Loading...</option> : currentSubjects.length === 0 ? <option>No Subjects</option> : currentSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Chapter</div>
              <select value={chapterId} onChange={e => setChapterId(e.target.value)} disabled={uploading || loadingSyllabus || currentChapters.length === 0} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#f8fafc", fontSize:13, fontWeight:600, color:"#0f172a", outline:"none", appearance:"none" }}>
                {loadingSyllabus ? <option>Loading...</option> : currentChapters.length === 0 ? <option>No Chapters</option> : currentChapters.map(ch => <option key={ch.name} value={ch.name}>{ch.name}</option>)}
              </select>
            </div>
          </div>

          {/* Batches */}
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>Target Batches for {targetClass}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {(() => {
                  const availableBatches = (classBatchesMap[targetClass] || []).filter(b => 
                    !subjectId || (b.allocatedSubjects && b.allocatedSubjects.includes(subjectId))
                  );
                  
                  if (availableBatches.length === 0) {
                    return <div style={{ fontSize:12, color:"#94a3b8", padding:"8px 0", gridColumn:"1 / -1" }}>No batches found in this class with the selected subject allocated.</div>;
                  }

                  return availableBatches.map(b => {
                    const isSelected = selectedBatches.includes(b._id);
                    return (
                      <label key={b._id} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px", borderRadius:10, border:`1.5px solid ${isSelected ? "#7c3aed" : "#e5e7eb"}`, background:isSelected?"#faf5ff":"#f8fafc", cursor:uploading?"not-allowed":"pointer", transition:"all 0.15s" }}
                        onMouseEnter={e => { if(!isSelected && !uploading) e.currentTarget.style.borderColor="#c4b5fd"; }}
                        onMouseLeave={e => { if(!isSelected && !uploading) e.currentTarget.style.borderColor="#e5e7eb"; }}
                      >
                        <div style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${isSelected?"#7c3aed":"#cbd5e1"}`, background:isSelected?"#7c3aed":"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {isSelected && <Check size={12} color="#fff" />}
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color:isSelected?"#7c3aed":"#374151" }}>{b.name}</span>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleBatch(b._id)} style={{ display:"none" }} disabled={uploading}/>
                      </label>
                    )
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Free Material Toggle */}
          <div>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:uploading?"not-allowed":"pointer" }}>
              <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} disabled={uploading} style={{ width: 16, height: 16, cursor:"inherit" }} />
              <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Free for all students (even unapproved)</span>
            </label>
          </div>

          <div style={{ paddingTop:8, flexShrink:0 }}>
            <button type="submit" disabled={uploading} style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background:uploading?"#c4b5fd":"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:uploading?"not-allowed":"pointer", transition:"opacity 0.15s", boxShadow:"0 4px 12px rgba(124,58,237,0.25)" }}>
              {uploading ? <Loader2 size={16} style={{ animation:"nexusSpin 1s linear infinite" }}/> : <UploadCloud size={16}/>}
              {uploading ? "Uploading..." : "Upload Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function StudyMaterialPage() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [materials,    setMaterials]    = useState([]);
  const [batches,      setBatches]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [activeSub,    setActiveSub]    = useState("all");
  const [activeCat,    setActiveCat]    = useState("all");
  const [activeBatch,  setActiveBatch]  = useState("all");
  const [viewMode,     setViewMode]     = useState("grid");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [previewItem,  setPreviewItem]  = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const r    = await fetch(`${baseURL}/teacher/study-materials`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setMaterials(Array.isArray(data) ? data : data.materials || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [baseURL]);

  useEffect(() => {
    fetchMaterials();
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const r    = await fetch(`${baseURL}/teacher/my-batches`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        setBatches(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    })();
  }, [fetchMaterials]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const r    = await fetch(`${baseURL}/teacher/study-material/${deleteTarget._id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) setMaterials(p => p.filter(m => m._id !== deleteTarget._id));
      else { const d = await r.json(); throw new Error(d.message || "Delete failed"); }
    } catch (e) { console.error(e); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const toggleFreeStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${baseURL}/teacher/study-material/${id}/toggle-free`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        setMaterials(p => p.map(m => (m._id === id ? { ...m, isFree: !currentStatus } : m)));
      }
    } catch (e) { console.error(e); }
  };

  const displayed = materials.filter(m => {
    const q        = search.toLowerCase();
    const batchIds = (m.batchIds || m.batches || []).map(b => (b._id || b).toString());
    return (
      (m.title || "").toLowerCase().includes(q) &&
      (activeSub   === "all" || m.subject  === activeSub) &&
      (activeCat   === "all" || m.category === activeCat) &&
      (activeBatch === "all" || batchIds.includes(activeBatch))
    );
  });

  const counts = {
    Notes:    materials.filter(m => m.category === "Notes").length,
    PYQs:     materials.filter(m => m.category === "PYQs").length,
    Formulas: materials.filter(m => m.category === "Formulas").length,
  };

  /* shared left-nav button style */
  const navBtn = (active) => ({
    all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between",
    width:"100%", boxSizing:"border-box",
    padding:"9px 12px", borderRadius:10, cursor:"pointer", marginBottom:2,
    border:`1.5px solid ${active ? "#7c3aed" : "transparent"}`,
    background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent",
    transition:"all 0.13s",
  });
  const navHover = (active) => ({
    enter: e => { if (!active) e.currentTarget.style.background="#f5f3ff"; },
    leave: e => { if (!active) e.currentTarget.style.background="transparent"; },
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Study Material"
        subtitle="Browse and manage uploaded resources"
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchMaterials} disabled={loading} style={{ all:"unset", cursor:loading?"not-allowed":"pointer", width:34, height:34, borderRadius:9, border:"1.5px solid #e5e7eb", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", color:loading?"#d1d5db":"#64748b", transition:"all 0.15s" }}>
              <RefreshCw size={14} style={loading ? { animation:"nexusSpin 1s linear infinite" } : {}} />
            </button>
            <button onClick={() => setIsUploadOpen(true)} style={{ all:"unset", cursor:"pointer", padding:"0 16px", height:34, borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#6366f1)", border:"none", display:"flex", alignItems:"center", gap:6, color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 2px 10px rgba(109,40,217,0.2)" }}>
              <Plus size={14}/> Upload Material
            </button>
          </div>
        }
      />

      <div style={{ flex:1, display:"flex", overflow:"hidden", fontFamily:"'DM Sans',sans-serif", minHeight:0 }} className="page-enter">

        {/* ══ LEFT PANEL ══ */}
        <div style={{ width:230, flexShrink:0, display:"flex", flexDirection:"column", borderRight:"1px solid #ede9f6", background:"#fff", minHeight:0 }}>

          {/* search */}
          <div style={{ padding:"12px 12px 10px", borderBottom:"1px solid #f3f0ff", flexShrink:0 }}>
            <div style={{ position:"relative" }}>
              <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
                style={{ width:"100%", boxSizing:"border-box", paddingLeft:32, paddingRight:10, paddingTop:8, paddingBottom:8, background:"transparent", border:"1.5px solid #e5e7eb", borderRadius:9, fontSize:12, fontWeight:500, color:"#374151", outline:"none", fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor="#a78bfa"}
                onBlur={e  => e.target.style.borderColor="#e5e7eb"}
              />
            </div>
            {!loading && <div style={{ fontSize:10, color:"#94a3b8", fontWeight:500, marginTop:8, paddingLeft:2 }}>{displayed.length} file{displayed.length !== 1 ? "s" : ""}</div>}
          </div>

          {/* nav — no scrollbar */}
          <div className="nexus-no-scroll" style={{ flex:1, overflowY:"auto", minHeight:0, padding:"8px" }}>

            <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", padding:"8px 6px 6px" }}>Subjects</div>
            {SUBJECTS.map(s => {
              const active = activeSub === s.id;
              const hv     = navHover(active);
              return (
                <button key={s.id} onClick={() => setActiveSub(s.id)} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color: active ? "#e9d5ff" : s.color }}>{s.icon}</span>
                    <span style={{ fontSize:12, fontWeight:700, color: active ? "#fff" : "#374151" }}>{s.name}</span>
                  </div>
                  <ChevronRight size={10} style={{ color: active ? "#c4b5fd" : "#d1d5db" }} />
                </button>
              );
            })}

            <div style={{ height:1, background:"#f3f0ff", margin:"10px 4px" }} />

            <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", padding:"4px 6px 6px" }}>Categories</div>
            {CATEGORIES.map(c => {
              const active = activeCat === c.id;
              const hv     = navHover(active);
              return (
                <button key={c.id} onClick={() => setActiveCat(c.id)} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color: active ? "#e9d5ff" : "#7c3aed" }}>{c.icon}</span>
                    <span style={{ fontSize:12, fontWeight:700, color: active ? "#fff" : "#374151" }}>{c.label}</span>
                  </div>
                  <ChevronRight size={10} style={{ color: active ? "#c4b5fd" : "#d1d5db" }} />
                </button>
              );
            })}

            {/* ── BATCHES ── */}
            {batches.length > 0 && (
              <>
                <div style={{ height:1, background:"#f3f0ff", margin:"10px 4px" }} />
                <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", padding:"4px 6px 6px" }}>Batches</div>

                {/* All Batches row */}
                {(() => {
                  const active = activeBatch === "all";
                  const hv     = navHover(active);
                  return (
                    <button onClick={() => setActiveBatch("all")} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ color: active ? "#e9d5ff" : "#7c3aed" }}><Users size={12}/></span>
                        <span style={{ fontSize:12, fontWeight:700, color: active ? "#fff" : "#374151" }}>All Batches</span>
                      </div>
                      <ChevronRight size={10} style={{ color: active ? "#c4b5fd" : "#d1d5db" }} />
                    </button>
                  );
                })()}

                {Object.entries(
                  batches.reduce((acc, b) => {
                    const c = b.className || "General Class";
                    if (!acc[c]) acc[c] = [];
                    acc[c].push(b);
                    return acc;
                  }, {})
                ).map(([cName, classBatches]) => (
                  <div key={cName} style={{ marginTop: 8 }}>
                    <div style={{ fontSize:9, fontWeight:800, color:"#a78bfa", textTransform:"uppercase", padding:"2px 6px 4px" }}>{cName}</div>
                    {classBatches.map(b => {
                      const active = activeBatch === b._id;
                      const hv     = navHover(active);
                      return (
                        <button key={b._id} onClick={() => setActiveBatch(b._id)} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:18, height:18, borderRadius:5, flexShrink:0, background: active ? "rgba(255,255,255,0.18)" : "#f5f3ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:800, color: active ? "#e9d5ff" : "#7c3aed" }}>
                              {b.name?.[0]?.toUpperCase() || "B"}
                            </div>
                            <span style={{ fontSize:12, fontWeight:600, color: active ? "#fff" : "#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{b.name}</span>
                          </div>
                          <ChevronRight size={10} style={{ color: active ? "#c4b5fd" : "#d1d5db" }} />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </>
            )}

          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f4f3fa", minHeight:0 }}>
          <div style={{ flex:1, overflowY:"auto", minHeight:0, padding:"16px 18px 40px", display:"flex", flexDirection:"column", gap:12 }}>

            {/* stat cards + view toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, flexWrap:"wrap" }}>
              {[
                { label:"Total",    val:materials.length, color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
                { label:"Notes",    val:counts.Notes,     color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
                { label:"PYQs",     val:counts.PYQs,      color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
                { label:"Formulas", val:counts.Formulas,  color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
              ].map(s => (
                <div key={s.label} style={{ background:"#fff", borderRadius:13, border:`1.5px solid ${s.border}`, padding:"10px 14px", display:"flex", flexDirection:"column", gap:4, boxShadow:`0 2px 8px ${s.color}0d`, minWidth:80, transition:"transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
                >
                  <span style={{ fontSize:9, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</span>
                  <span style={{ fontSize:20, fontWeight:800, color:s.color, letterSpacing:"-0.5px", lineHeight:1 }}>{s.val}</span>
                </div>
              ))}
              <div style={{ marginLeft:"auto", display:"flex", background:"#ede9f6", borderRadius:10, padding:"3px", gap:2 }}>
                {[["grid",<LayoutGrid size={13}/>],["list",<List size={13}/>]].map(([mode,icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{ all:"unset", width:30, height:30, borderRadius:7, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", background:viewMode===mode?"#fff":"transparent", color:viewMode===mode?"#7c3aed":"#94a3b8", boxShadow:viewMode===mode?"0 1px 4px rgba(0,0,0,0.09)":"none", transition:"all 0.13s" }}>{icon}</button>
                ))}
              </div>
            </div>

            {/* content */}
            {loading ? (
              <div style={{ display:"flex", justifyContent:"center", padding:48 }}>
                <Loader2 size={22} style={{ color:"#a78bfa", animation:"nexusSpin 1s linear infinite" }} />
              </div>

            ) : displayed.length === 0 ? (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ede9f6", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"56px 24px", textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", border:"2px solid #ddd6fe", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, boxShadow:"0 8px 24px rgba(109,40,217,0.1)" }}>
                  <FolderOpen size={26} style={{ color:"#7c3aed", opacity:0.75 }} />
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:"#374151", marginBottom:6 }}>
                  {search || activeSub !== "all" || activeCat !== "all" || activeBatch !== "all" ? "No matches found" : "No materials yet"}
                </div>
                <p style={{ fontSize:12, color:"#94a3b8", maxWidth:200, lineHeight:1.7, margin:0 }}>
                  {search || activeSub !== "all" || activeCat !== "all" || activeBatch !== "all" ? "Try adjusting your filters." : "Upload materials from the dashboard."}
                </p>
              </div>

            ) : viewMode === "grid" ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
                {displayed.map(m => {
                  const sub      = SUBJECT_MAP[m.subject] || SUBJECTS[1];
                  const cat      = CAT_META[m.category]   || CAT_META.Notes;
                  const batchList = m.batchIds || m.batches || [];
                  return (
                    <div key={m._id} style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ede9f6", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 2px 8px rgba(109,40,217,0.04)", transition:"transform 0.15s, box-shadow 0.15s, border-color 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(109,40,217,0.1)"; e.currentTarget.style.borderColor="#ddd6fe"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";   e.currentTarget.style.boxShadow="0 2px 8px rgba(109,40,217,0.04)"; e.currentTarget.style.borderColor="#ede9f6"; }}
                    >
                      <div style={{ height:3, background:`linear-gradient(90deg,${sub.accent},${sub.accent}88)` }} />
                      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:12, flex:1 }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                            <div style={{ width:38, height:38, borderRadius:10, background:sub.bg, display:"flex", alignItems:"center", justifyContent:"center", color:sub.color, flexShrink:0 }}><FileText size={16}/></div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:700, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title || "Untitled"}</div>
                              <div style={{ display:"flex", gap:5, marginTop:4 }}>
                                <span style={{ fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:5, background:sub.bg, color:sub.color, border:`1px solid ${sub.color}28` }}>{sub.name}</span>
                                <span style={{ fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:5, background:cat.bg, color:cat.color, border:`1px solid ${cat.border}` }}>{m.category}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <button onClick={() => toggleFreeStatus(m._id, m.isFree)} style={{ all:"unset", cursor:"pointer", padding:"4px 8px", borderRadius:8, fontSize:10, fontWeight:700, background: m.isFree ? "#ecfdf5" : "#f1f5f9", color: m.isFree ? "#059669" : "#64748b", border: `1.5px solid ${m.isFree ? "#a7f3d0" : "#e2e8f0"}`, transition:"all 0.13s" }}>
                              {m.isFree ? "Free" : "Locked"}
                            </button>
                            <button onClick={() => setDeleteTarget(m)} style={{ all:"unset", cursor:"pointer", width:28, height:28, borderRadius:8, background:"#fff1f2", border:"1.5px solid #fecdd3", display:"flex", alignItems:"center", justifyContent:"center", color:"#ef4444", flexShrink:0, transition:"background 0.13s" }}
                              onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
                              onMouseLeave={e => e.currentTarget.style.background="#fff1f2"}
                            ><Trash2 size={12}/></button>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                          <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, color:"#94a3b8", fontWeight:500 }}>
                            <Calendar size={9}/>{m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "—"}
                          </span>
                          {batchList.length > 0 && (
                            <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, color:"#94a3b8", fontWeight:500 }}>
                              <Users size={9}/>{batchList.length} batch{batchList.length!==1?"es":""}
                            </span>
                          )}
                        </div>
                        {batchList.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                            {batchList.slice(0,3).map((b,i) => <span key={i} style={{ fontSize:9, fontWeight:600, padding:"2px 7px", borderRadius:99, background:"#f8f7ff", color:"#7c3aed", border:"1px solid #ede9fe" }}>{b.name||b}</span>)}
                            {batchList.length > 3 && <span style={{ fontSize:9, fontWeight:600, padding:"2px 7px", borderRadius:99, background:"#f1f5f9", color:"#64748b", border:"1px solid #e2e8f0" }}>+{batchList.length-3}</span>}
                          </div>
                        )}
                        {m.fileUrl && (
                          <button onClick={() => setPreviewItem(m)} style={{ all:"unset", marginTop:"auto", padding:"8px 0", borderRadius:10, border:"1.5px solid #ddd6fe", background:"#faf5ff", color:"#7c3aed", fontWeight:700, fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", gap:5, cursor:"pointer", transition:"background 0.13s" }}
                            onMouseEnter={e => e.currentTarget.style.background="#ede9fe"}
                            onMouseLeave={e => e.currentTarget.style.background="#faf5ff"}
                          ><ZoomIn size={12}/> Preview</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : (
              <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #ede9f6", overflow:"hidden", flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, padding:"9px 16px", background:"#faf8ff", borderBottom:"1px solid #f0f0f0" }}>
                  <div style={{ width:36, flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Title</div>
                  <div style={{ width:72, fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Subject</div>
                  <div style={{ width:64, fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Category</div>
                  <div style={{ width:80, fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Batches</div>
                  <div style={{ width:88, fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Actions</div>
                </div>
                {displayed.map((m, idx) => {
                  const sub      = SUBJECT_MAP[m.subject] || SUBJECTS[1];
                  const cat      = CAT_META[m.category]   || CAT_META.Notes;
                  const batchList = m.batchIds || m.batches || [];
                  return (
                    <div key={m._id} style={{ display:"flex", alignItems:"center", gap:16, padding:"10px 16px", borderBottom: idx < displayed.length-1 ? "1px solid #f9fafb":"none", transition:"background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background="#faf8ff"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      <div style={{ width:36, height:36, borderRadius:10, background:sub.bg, display:"flex", alignItems:"center", justifyContent:"center", color:sub.color, flexShrink:0 }}><FileText size={14}/></div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"#0f172a", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title || "Untitled"}</div>
                        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:500, marginTop:1 }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—"}{m.fileSize ? ` · ${m.fileSize}` : ""}
                        </div>
                      </div>
                      <span style={{ width:72, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:sub.bg, color:sub.color, border:`1px solid ${sub.color}28`, flexShrink:0, textAlign:"center" }}>{sub.name}</span>
                      <span style={{ width:64, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, background:cat.bg, color:cat.color, border:`1px solid ${cat.border}`, flexShrink:0, textAlign:"center" }}>{m.category}</span>
                      <div style={{ width:80, display:"flex", gap:3, flexShrink:0, flexWrap:"wrap" }}>
                        {batchList.slice(0,2).map((b,i) => <span key={i} style={{ fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:99, background:"#f5f3ff", color:"#7c3aed", border:"1px solid #ede9fe" }}>{b.name||b}</span>)}
                        {batchList.length > 2 && <span style={{ fontSize:9, color:"#94a3b8" }}>+{batchList.length-2}</span>}
                        {batchList.length === 0 && <span style={{ fontSize:10, color:"#cbd5e1" }}>—</span>}
                      </div>
                      <div style={{ width:120, display:"flex", gap:6, flexShrink:0 }}>
                        <button onClick={() => toggleFreeStatus(m._id, m.isFree)} style={{ all:"unset", cursor:"pointer", padding:"5px 10px", borderRadius:8, fontSize:10, fontWeight:700, background: m.isFree ? "#ecfdf5" : "#f1f5f9", color: m.isFree ? "#059669" : "#64748b", border: `1.5px solid ${m.isFree ? "#a7f3d0" : "#e2e8f0"}`, transition:"all 0.12s" }}>
                          {m.isFree ? "Free" : "Locked"}
                        </button>
                        {m.fileUrl && (
                          <button onClick={() => setPreviewItem(m)} style={{ all:"unset", cursor:"pointer", padding:"5px 10px", borderRadius:8, border:"1.5px solid #ddd6fe", background:"#faf5ff", color:"#7c3aed", fontWeight:700, fontSize:10, display:"flex", alignItems:"center", gap:4, transition:"background 0.12s" }}
                            onMouseEnter={e => e.currentTarget.style.background="#ede9fe"}
                            onMouseLeave={e => e.currentTarget.style.background="#faf5ff"}
                          ><ZoomIn size={10}/> View</button>
                        )}
                        <button onClick={() => setDeleteTarget(m)} style={{ all:"unset", cursor:"pointer", width:28, height:28, borderRadius:8, border:"1.5px solid #fecdd3", background:"#fff1f2", color:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
                          onMouseLeave={e => e.currentTarget.style.background="#fff1f2"}
                        ><Trash2 size={11}/></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {deleteTarget && <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} deleting={deleting}/>}
      {previewItem  && <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)}/>}
      {isUploadOpen && <UploadModal batches={batches} onClose={() => setIsUploadOpen(false)} onUploadSuccess={fetchMaterials} baseURL={baseURL}/>}

      <style>{`
        @keyframes nexusSpin { to { transform:rotate(360deg); } }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
        .nexus-no-scroll::-webkit-scrollbar { display:none; }
        .nexus-no-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </AdminLayout>
  );
}