import React, { useState, useEffect, useCallback } from "react";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  BookOpen, HelpCircle, Sigma, Wind, Beaker, Binary, Atom,
  Trash2, FileText, Loader2, Search, RefreshCw,
  Calendar, Users, Layers, AlertTriangle, X,
  FolderOpen, LayoutGrid, List, ArrowLeft, Download,
  ExternalLink, ZoomIn, ChevronRight, UploadCloud, Plus, Check,
  GraduationCap
} from "lucide-react";
import PdfViewerPage from "../student/PdfViewerPage";
import { SUBJECTS as LIB_SUBJECTS, CHAPTERS as LIB_CHAPTERS, CATEGORIES as LIB_CATEGORIES } from "../student/libraryConfig";

const SUBJECTS = [
  { id: "all", name: "All Subjects", icon: <Layers size={13} />, color: "#6d28d9", bg: "#f5f3ff", accent: "#7c3aed" },
  { id: "Physics", name: "Physics", icon: <Wind size={13} />, color: "#4f46e5", bg: "#eef2ff", accent: "#6366f1" },
  { id: "Chemistry", name: "Chemistry", icon: <Beaker size={13} />, color: "#047857", bg: "#ecfdf5", accent: "#10b981" },
  { id: "Maths", name: "Maths", icon: <Binary size={13} />, color: "#7c3aed", bg: "#f5f3ff", accent: "#8b5cf6" },
  { id: "Biology", name: "Biology", icon: <Atom size={13} />, color: "#be185d", bg: "#fdf2f8", accent: "#ec4899" },
];
const SUBJECT_MAP = Object.fromEntries(SUBJECTS.slice(1).map(s => [s.id, s]));

const CATEGORIES = [
  { id: "all", label: "All Types", icon: <Layers size={12} /> },
  { id: "notes", label: "Notes", icon: <BookOpen size={12} /> },
  { id: "pyqs", label: "PYQs", icon: <HelpCircle size={12} /> },
  { id: "formulas", label: "Formulas", icon: <Sigma size={12} /> },
  { id: "mindmaps", label: "Mind Maps", icon: <Layers size={12} /> },
  { id: "revision", label: "Revision", icon: <Layers size={12} /> },
  { id: "synopsis", label: "Synopsis", icon: <Layers size={12} /> },
];

const CAT_META = {
  notes: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  pyqs: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  formulas: { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  mindmaps: { color: "#8B5CF6", bg: "#f5f3ff", border: "#ddd6fe" },
  revision: { color: "#EC4899", bg: "#fdf2f8", border: "#fbcfe8" },
  synopsis: { color: "#F43F5E", bg: "#fff1f2", border: "#fecdd3" },
  Notes: { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" }, // legacy fallback
  PYQs: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }, // legacy fallback
  Formulas: { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" }, // legacy fallback
};

const getSubjectMeta = (m) => {
  const sName = m?.subject || m?.subjectId || "Subject";
  const sKey = Object.keys(SUBJECT_MAP).find(k => k.toLowerCase() === sName.toLowerCase()) ||
               (sName.toLowerCase().startsWith("phy") ? "Physics" :
                sName.toLowerCase().startsWith("chem") ? "Chemistry" :
                sName.toLowerCase().startsWith("math") ? "Maths" :
                sName.toLowerCase().startsWith("bio") ? "Biology" : null);
  return SUBJECT_MAP[sKey] || {
    name: sName,
    color: "#6d28d9",
    bg: "#f5f3ff",
    accent: "#7c3aed",
    icon: <BookOpen size={13} />
  };
};

const getCategoryMeta = (cat) => {
  const cKey = (cat || "notes").toLowerCase();
  return CAT_META[cKey] || CAT_META.notes || { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" };
};

const groupBatchesByClass = (batchList = []) => {
  const grouped = {};
  (batchList || []).forEach(b => {
    if (!b) return;
    const cName = (typeof b === "object" && b.className) ? b.className : "General Class";
    const bName = (typeof b === "object" && b.name) ? b.name : (typeof b === "string" ? b : "Batch");
    if (!grouped[cName]) grouped[cName] = [];
    if (!grouped[cName].includes(bName)) grouped[cName].push(bName);
  });
  return grouped;
};

function DeleteModal({ item, onConfirm, onCancel, deleting }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "26px 28px", maxWidth: 380, width: "100%", boxShadow: "0 30px 70px rgba(0,0,0,0.2)", border: "1.5px solid #f0f0f0", animation: "modalIn 0.2s ease", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, border: "1.5px solid #fecdd3" }}>
          <AlertTriangle size={22} style={{ color: "#ef4444" }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Delete material?</div>
        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65, margin: "0 0 22px" }}>
          <strong style={{ color: "#0f172a" }}>{item?.title || "This file"}</strong> will be permanently removed from all batches.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} disabled={deleting} style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "1.5px solid #e5e7eb", background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", background: deleting ? "#fca5a5" : "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}>
            {deleting ? <Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> : <Trash2 size={13} />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

const isFreeBatch = (b) => {
  if (!b) return false;
  const n = (b.name || "").trim().toUpperCase();
  return n === "FREE" || n === "FREE BATCH" || b.isFree === true;
};

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

  const currentClassBatches = classBatchesMap[targetClass] || [];
  const freeBatch = currentClassBatches.find(isFreeBatch);
  const regularBatches = currentClassBatches.filter(b => !isFreeBatch(b));

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

  const handleToggleFree = () => {
    if (uploading) return;
    const nextFree = !isFree;
    setIsFree(nextFree);
    if (freeBatch) {
      if (nextFree) {
        if (!selectedBatches.includes(freeBatch._id)) {
          setSelectedBatches(prev => [...prev, freeBatch._id]);
        }
      } else {
        setSelectedBatches(prev => prev.filter(id => id !== freeBatch._id));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Please select a PDF file.");
    if (!chapterId) return setError("Please select a chapter.");

    let finalBatchIds = [...selectedBatches];
    if (isFree && freeBatch && !finalBatchIds.includes(freeBatch._id)) {
      finalBatchIds.push(freeBatch._id);
    }

    if (finalBatchIds.length === 0) {
      return setError("Please select at least one batch, or make for everyone free.");
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);
    formData.append("chapterId", chapterId);
    formData.append("category", category);
    formData.append("isFree", isFree);
    formData.append("batchIds", JSON.stringify(finalBatchIds));

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
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "30px", width: "100%", maxWidth: 480, boxShadow: "0 40px 80px rgba(0,0,0,0.2)", border: "1.5px solid #f0f0f0", animation: "modalIn 0.2s ease", fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
              <UploadCloud size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Upload Material</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Share PDFs with your batches</div>
            </div>
          </div>
          <button onClick={onClose} disabled={uploading} style={{ all: "unset", cursor: uploading ? "not-allowed" : "pointer", padding: 6, borderRadius: 8, background: "#f8fafc", color: "#64748b", border: "1px solid #e5e7eb" }}><X size={16} /></button>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fef2f2", color: "#ef4444", fontSize: 12, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, border: "1px solid #fecdd3", flexShrink: 0 }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, overflowY: "auto", paddingRight: 6 }} className="nexus-no-scroll">

          {/* File Picker */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>File</div>
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1.5px dashed #c4b5fd", borderRadius: 16, padding: "24px", cursor: "pointer", background: file ? "#f5f3ff" : "#faf8ff", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
              onMouseLeave={e => e.currentTarget.style.background = file ? "#f5f3ff" : "#faf8ff"}
            >
              <input type="file" accept=".pdf" onChange={handleFile} style={{ display: "none" }} disabled={uploading} />
              {file ? (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", textAlign: "center", wordBreak: "break-all" }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </>
              ) : (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#e9d5ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <UploadCloud size={20} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", textAlign: "center" }}>Click to select a PDF</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}>Max size: 50MB</div>
                </>
              )}
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Target Class */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Target Class</div>
              <select value={targetClass} onChange={e => {
                const nextClass = e.target.value;
                setTargetClass(nextClass);
                const nextFreeBatch = (classBatchesMap[nextClass] || []).find(isFreeBatch);
                if (isFree && nextFreeBatch) {
                  setSelectedBatches([nextFreeBatch._id]);
                } else {
                  setSelectedBatches([]);
                }
              }} disabled={uploading} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#0f172a", outline: "none", appearance: "none" }}>
                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Category</div>
              <select value={category} onChange={e => setCategory(e.target.value)} disabled={uploading} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#0f172a", outline: "none", appearance: "none" }}>
                {LIB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Subject */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Subject</div>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} disabled={uploading || loadingSyllabus || currentSubjects.length === 0} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#0f172a", outline: "none", appearance: "none" }}>
                {loadingSyllabus ? <option>Loading...</option> : currentSubjects.length === 0 ? <option>No Subjects</option> : currentSubjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Chapter</div>
              <select value={chapterId} onChange={e => setChapterId(e.target.value)} disabled={uploading || loadingSyllabus || currentChapters.length === 0} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#f8fafc", fontSize: 13, fontWeight: 600, color: "#0f172a", outline: "none", appearance: "none" }}>
                {loadingSyllabus ? <option>Loading...</option> : currentChapters.length === 0 ? <option>No Chapters</option> : currentChapters.map(ch => <option key={ch.name} value={ch.name}>{ch.name}</option>)}
              </select>
            </div>
          </div>

          {/* Batches */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Target Batches for {targetClass}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Regular Batches Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(() => {
                  const availableBatches = regularBatches.filter(b =>
                    !subjectId || (b.allocatedSubjects && b.allocatedSubjects.includes(subjectId))
                  );

                  if (availableBatches.length === 0) {
                    return <div style={{ fontSize: 12, color: "#94a3b8", padding: "4px 0", gridColumn: "1 / -1" }}>No regular batches found in this class with the selected subject.</div>;
                  }

                  return availableBatches.map(b => {
                    const isSelected = selectedBatches.includes(b._id);
                    return (
                      <label key={b._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px", borderRadius: 10, border: `1.5px solid ${isSelected ? "#7c3aed" : "#e5e7eb"}`, background: isSelected ? "#faf5ff" : "#f8fafc", cursor: uploading ? "not-allowed" : "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { if (!isSelected && !uploading) e.currentTarget.style.borderColor = "#c4b5fd"; }}
                        onMouseLeave={e => { if (!isSelected && !uploading) e.currentTarget.style.borderColor = "#e5e7eb"; }}
                      >
                        <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${isSelected ? "#7c3aed" : "#cbd5e1"}`, background: isSelected ? "#7c3aed" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isSelected && <Check size={12} color="#fff" />}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#7c3aed" : "#374151" }}>{b.name}</span>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleBatch(b._id)} style={{ display: "none" }} disabled={uploading} />
                      </label>
                    );
                  });
                })()}
              </div>

              {/* Free Batch portrayed as dedicated "Make for everyone free" card */}
              <div
                onClick={handleToggleFree}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${isFree ? "#10b981" : "#e2e8f0"}`,
                  background: isFree ? "#ecfdf5" : "#f8fafc",
                  cursor: uploading ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: isFree ? "0 2px 8px rgba(16, 185, 129, 0.12)" : "none"
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: `1.5px solid ${isFree ? "#10b981" : "#cbd5e1"}`,
                  background: isFree ? "#10b981" : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.15s"
                }}>
                  {isFree && <Check size={13} color="#fff" strokeWidth={3} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isFree ? "#065f46" : "#1e293b" }}>
                      Make for everyone free
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: isFree ? "#d1fae5" : "#e2e8f0", color: isFree ? "#047857" : "#64748b", textTransform: "uppercase" }}>
                      Free Batch
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: isFree ? "#047857" : "#64748b", marginTop: 2 }}>
                    {isFree 
                      ? "✓ Free batch selected — all students (including unapproved) have access"
                      : "Include all students across this class without requiring a paid batch"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 8, flexShrink: 0 }}>
            <button type="submit" disabled={uploading} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: uploading ? "#c4b5fd" : "linear-gradient(135deg,#7c3aed,#6366f1)", color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: uploading ? "not-allowed" : "pointer", transition: "opacity 0.15s", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }}>
              {uploading ? <Loader2 size={16} style={{ animation: "nexusSpin 1s linear infinite" }} /> : <UploadCloud size={16} />}
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

  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState("all");
  const [activeCat, setActiveCat] = useState("all");
  const [activeBatch, setActiveBatch] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${baseURL}/teacher/study-materials`, { headers: { Authorization: `Bearer ${token}` } });
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
        const r = await fetch(`${baseURL}/teacher/my-batches`, { headers: { Authorization: `Bearer ${token}` } });
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
      const r = await fetch(`${baseURL}/teacher/study-material/${deleteTarget._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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
    const q = search.toLowerCase();
    const batchIds = (m.batchIds || m.batches || []).map(b => (b._id || b).toString());
    return (
      (m.title || "").toLowerCase().includes(q) &&
      (activeSub === "all" || m.subject === activeSub) &&
      (activeCat === "all" || m.category === activeCat) &&
      (activeBatch === "all" || batchIds.includes(activeBatch) || m.isFree)
    );
  });

  const counts = {
    Notes: materials.filter(m => m.category === "Notes").length,
    PYQs: materials.filter(m => m.category === "PYQs").length,
    Formulas: materials.filter(m => m.category === "Formulas").length,
  };

  /* shared left-nav button style */
  const navBtn = (active) => ({
    all: "unset", display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", boxSizing: "border-box",
    padding: "9px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 2,
    border: `1.5px solid ${active ? "#7c3aed" : "transparent"}`,
    background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent",
    transition: "all 0.13s",
  });
  const navHover = (active) => ({
    enter: e => { if (!active) e.currentTarget.style.background = "#f5f3ff"; },
    leave: e => { if (!active) e.currentTarget.style.background = "transparent"; },
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Study Material"
        subtitle="Browse and manage uploaded resources"
        right={
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchMaterials} disabled={loading} style={{ all: "unset", cursor: loading ? "not-allowed" : "pointer", width: 34, height: 34, borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: loading ? "#d1d5db" : "#64748b", transition: "all 0.15s" }}>
              <RefreshCw size={14} style={loading ? { animation: "nexusSpin 1s linear infinite" } : {}} />
            </button>
            <button onClick={() => setIsUploadOpen(true)} style={{ all: "unset", cursor: "pointer", padding: "0 16px", height: 34, borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#6366f1)", border: "none", display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 10px rgba(109,40,217,0.2)" }}>
              <Plus size={14} /> Upload Material
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", fontFamily: "'DM Sans',sans-serif", minHeight: 0 }} className="page-enter">

        {/* ══ LEFT PANEL ══ */}
        <div style={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid #ede9f6", background: "#fff", minHeight: 0 }}>

          {/* search */}
          <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #f3f0ff", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
                style={{ width: "100%", boxSizing: "border-box", paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#374151", outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            {!loading && <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginTop: 8, paddingLeft: 2 }}>{displayed.length} file{displayed.length !== 1 ? "s" : ""}</div>}
          </div>

          {/* nav — no scrollbar */}
          <div className="nexus-no-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "8px" }}>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 6px 6px" }}>Subjects</div>
            {SUBJECTS.map(s => {
              const active = activeSub === s.id;
              const hv = navHover(active);
              return (
                <button key={s.id} onClick={() => setActiveSub(s.id)} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: active ? "#e9d5ff" : s.color }}>{s.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : "#374151" }}>{s.name}</span>
                  </div>
                  <ChevronRight size={10} style={{ color: active ? "#c4b5fd" : "#d1d5db" }} />
                </button>
              );
            })}

            <div style={{ height: 1, background: "#f3f0ff", margin: "10px 4px" }} />

            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 6px 6px" }}>Categories</div>
            {CATEGORIES.map(c => {
              const active = activeCat === c.id;
              const hv = navHover(active);
              return (
                <button key={c.id} onClick={() => setActiveCat(c.id)} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: active ? "#e9d5ff" : "#7c3aed" }}>{c.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : "#374151" }}>{c.label}</span>
                  </div>
                  <ChevronRight size={10} style={{ color: active ? "#c4b5fd" : "#d1d5db" }} />
                </button>
              );
            })}

            {/* ── BATCHES ── */}
            {batches.length > 0 && (
              <>
                <div style={{ height: 1, background: "#f3f0ff", margin: "10px 4px" }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 6px 6px" }}>Batches</div>

                {/* All Batches row */}
                {(() => {
                  const active = activeBatch === "all";
                  const hv = navHover(active);
                  return (
                    <button onClick={() => setActiveBatch("all")} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: active ? "#e9d5ff" : "#7c3aed" }}><Users size={12} /></span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: active ? "#fff" : "#374151" }}>All Batches</span>
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
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", padding: "2px 6px 4px" }}>{cName}</div>
                    {classBatches.map(b => {
                      const active = activeBatch === b._id;
                      const hv = navHover(active);
                      return (
                        <button key={b._id} onClick={() => setActiveBatch(b._id)} style={navBtn(active)} onMouseEnter={hv.enter} onMouseLeave={hv.leave}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: active ? "rgba(255,255,255,0.18)" : "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: active ? "#e9d5ff" : "#7c3aed" }}>
                              {b.name?.[0]?.toUpperCase() || "B"}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: active ? "#fff" : "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{b.name}</span>
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
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f4f3fa", minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 18px 40px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* stat cards + view toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
              {[
                { label: "Total", val: materials.length, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
                { label: "Notes", val: counts.Notes, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
                { label: "PYQs", val: counts.PYQs, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
                { label: "Formulas", val: counts.Formulas, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 13, border: `1.5px solid ${s.border}`, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 4, boxShadow: `0 2px 8px ${s.color}0d`, minWidth: 80, transition: "transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: "-0.5px", lineHeight: 1 }}>{s.val}</span>
                </div>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", background: "#ede9f6", borderRadius: 10, padding: "3px", gap: 2 }}>
                {[["grid", <LayoutGrid size={13} />], ["list", <List size={13} />]].map(([mode, icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)} style={{ all: "unset", width: 30, height: 30, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === mode ? "#fff" : "transparent", color: viewMode === mode ? "#7c3aed" : "#94a3b8", boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.09)" : "none", transition: "all 0.13s" }}>{icon}</button>
                ))}
              </div>
            </div>

            {/* content */}
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                <Loader2 size={22} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
              </div>

            ) : displayed.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 24px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", border: "2px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 24px rgba(109,40,217,0.1)" }}>
                  <FolderOpen size={26} style={{ color: "#7c3aed", opacity: 0.75 }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                  {search || activeSub !== "all" || activeCat !== "all" || activeBatch !== "all" ? "No matches found" : "No materials yet"}
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", maxWidth: 200, lineHeight: 1.7, margin: 0 }}>
                  {search || activeSub !== "all" || activeCat !== "all" || activeBatch !== "all" ? "Try adjusting your filters." : "Upload materials from the dashboard."}
                </p>
              </div>

            ) : viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 14 }}>
                {displayed.map(m => {
                  const sub = getSubjectMeta(m);
                  const cat = getCategoryMeta(m.category);
                  const batchList = m.batchIds || m.batches || [];
                  const groupedBatches = groupBatchesByClass(batchList);
                  const classEntries = Object.entries(groupedBatches);
                  const chapterName = m.chapterId || m.chapter || "";

                  return (
                    <div key={m._id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(109,40,217,0.04)", transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(109,40,217,0.1)"; e.currentTarget.style.borderColor = "#ddd6fe"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(109,40,217,0.04)"; e.currentTarget.style.borderColor = "#ede9f6"; }}
                    >
                      <div style={{ height: 3, background: `linear-gradient(90deg,${sub.accent},${sub.accent}88)` }} />
                      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                        {/* Top: Icon + Title + Tags + Actions */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 0, flex: 1 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: sub.bg, display: "flex", alignItems: "center", justifyContent: "center", color: sub.color, flexShrink: 0, marginTop: 1 }}>
                              <FileText size={16} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", wordBreak: "break-word", lineHeight: 1.35 }} title={m.title}>
                                {m.title || "Untitled"}
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 5 }}>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: sub.bg, color: sub.color, border: `1px solid ${sub.color}28` }}>
                                  {sub.name}
                                </span>
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                                  {m.category || "Notes"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <button onClick={() => toggleFreeStatus(m._id, m.isFree)} style={{ all: "unset", cursor: "pointer", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700, background: m.isFree ? "#ecfdf5" : "#f1f5f9", color: m.isFree ? "#059669" : "#64748b", border: `1.5px solid ${m.isFree ? "#a7f3d0" : "#e2e8f0"}`, transition: "all 0.13s" }}>
                              {m.isFree ? "Free" : "Locked"}
                            </button>
                            <button onClick={() => setDeleteTarget(m)} style={{ all: "unset", cursor: "pointer", width: 28, height: 28, borderRadius: 8, background: "#fff1f2", border: "1.5px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0, transition: "background 0.13s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                              onMouseLeave={e => e.currentTarget.style.background = "#fff1f2"}
                            ><Trash2 size={12} /></button>
                          </div>
                        </div>

                        {/* Chapter Name Banner */}
                        {chapterName && (
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 11, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 9px" }}>
                            <BookOpen size={13} style={{ color: "#7c3aed", flexShrink: 0, marginTop: 2 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", display: "block" }}>Chapter</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", wordBreak: "break-word" }}>{chapterName}</span>
                            </div>
                          </div>
                        )}

                        {/* Grouped Classes & Batches Section (Takes as much space as needed) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#faf8ff", border: "1px solid #ede9fe", borderRadius: 10, padding: "9px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Assigned Classes & Batches
                            </span>
                            {m.isFree && (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                                Free Access
                              </span>
                            )}
                          </div>

                          {classEntries.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {classEntries.map(([cName, bNames]) => (
                                <div key={cName} style={{ display: "flex", flexDirection: "column", gap: 4, background: "#ffffff", border: "1px solid #e9d5ff", borderRadius: 7, padding: "6px 8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 800, color: "#6d28d9" }}>
                                    <GraduationCap size={12} style={{ color: "#7c3aed", flexShrink: 0 }} />
                                    <span>{cName}</span>
                                  </div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                    {bNames.map((bn, bi) => (
                                      <span key={bi} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: "#f5f3ff", color: "#5b21b6", border: "1px solid #ddd6fe" }}>
                                        {bn}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: 10, color: m.isFree ? "#059669" : "#94a3b8", fontStyle: "italic" }}>
                              {m.isFree ? "Accessible to all students" : "No specific batch assigned"}
                            </span>
                          )}
                        </div>

                        {/* Date & Meta */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Calendar size={10} />{m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </span>
                          {m.fileSize && <span>· {m.fileSize}</span>}
                        </div>

                        {/* View PDF Button */}
                        {m.fileUrl && (
                          <button onClick={() => setPreviewItem(m)} style={{ all: "unset", marginTop: "auto", padding: "9px 0", borderRadius: 9, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#ffffff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", boxShadow: "0 2px 8px rgba(124, 58, 237, 0.2)", transition: "transform 0.12s, box-shadow 0.12s" }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 5px 14px rgba(124, 58, 237, 0.3)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.2)"; }}
                          ><ZoomIn size={13} /> View PDF</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            ) : (
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 16px", background: "#faf8ff", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ width: 36, flexShrink: 0 }} />
                  <div style={{ flex: 1.5, minWidth: 200, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Title & Chapter</div>
                  <div style={{ width: 85, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Subject</div>
                  <div style={{ width: 80, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Category</div>
                  <div style={{ flex: 2, minWidth: 240, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Classes & Batches</div>
                  <div style={{ width: 80, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Status</div>
                  <div style={{ width: 125, fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Actions</div>
                </div>
                {displayed.map((m, idx) => {
                  const sub = getSubjectMeta(m);
                  const cat = getCategoryMeta(m.category);
                  const batchList = m.batchIds || m.batches || [];
                  const groupedBatches = groupBatchesByClass(batchList);
                  const classEntries = Object.entries(groupedBatches);
                  const chapterName = m.chapterId || m.chapter || "";

                  return (
                    <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderBottom: idx < displayed.length - 1 ? "1px solid #f9fafb" : "none", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#faf8ff"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: sub.bg, display: "flex", alignItems: "center", justifyContent: "center", color: sub.color, flexShrink: 0 }}>
                        <FileText size={15} />
                      </div>
                      
                      {/* Title & Chapter Column */}
                      <div style={{ flex: 1.5, minWidth: 200 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", wordBreak: "break-word" }}>{m.title || "Untitled"}</div>
                        {chapterName && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 3, fontSize: 10, fontWeight: 600, color: "#5b21b6", background: "#f5f3ff", border: "1px solid #ddd6fe", padding: "1px 7px", borderRadius: 5 }}>
                            <BookOpen size={10} style={{ color: "#7c3aed" }} />
                            <span>{chapterName}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginTop: 2 }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}{m.fileSize ? ` · ${m.fileSize}` : ""}
                        </div>
                      </div>

                      {/* Subject */}
                      <span style={{ width: 85, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: sub.bg, color: sub.color, border: `1px solid ${sub.color}28`, flexShrink: 0, textAlign: "center" }}>
                        {sub.name}
                      </span>

                      {/* Category */}
                      <span style={{ width: 80, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`, flexShrink: 0, textAlign: "center" }}>
                        {m.category || "Notes"}
                      </span>

                      {/* Classes & Batches Grouped Column */}
                      <div style={{ flex: 2, minWidth: 240, display: "flex", flexDirection: "column", gap: 5 }}>
                        {m.isFree && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", width: "fit-content" }}>
                            Free for all
                          </span>
                        )}
                        {classEntries.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {classEntries.map(([cName, bNames]) => (
                              <div key={cName} style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", background: "#faf5ff", border: "1px solid #ede9fe", borderRadius: 6, padding: "3px 7px" }}>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 800, color: "#6d28d9", textTransform: "uppercase" }}>
                                  <GraduationCap size={11} /> {cName}:
                                </span>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                  {bNames.map((bn, bi) => (
                                    <span key={bi} style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "#ffffff", color: "#4c1d95", border: "1px solid #ddd6fe" }}>
                                      {bn}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 10, color: m.isFree ? "#059669" : "#94a3b8", fontStyle: "italic" }}>
                            {m.isFree ? "Accessible to all" : "—"}
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div style={{ width: 80, flexShrink: 0 }}>
                        <button onClick={() => toggleFreeStatus(m._id, m.isFree)} style={{ all: "unset", cursor: "pointer", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700, background: m.isFree ? "#ecfdf5" : "#f1f5f9", color: m.isFree ? "#059669" : "#64748b", border: `1.5px solid ${m.isFree ? "#a7f3d0" : "#e2e8f0"}`, transition: "all 0.12s" }}>
                          {m.isFree ? "Free" : "Locked"}
                        </button>
                      </div>

                      {/* Actions */}
                      <div style={{ width: 125, display: "flex", gap: 6, flexShrink: 0 }}>
                        {m.fileUrl && (
                          <button onClick={() => setPreviewItem(m)} style={{ all: "unset", cursor: "pointer", padding: "5px 10px", borderRadius: 8, border: "1px solid #7c3aed", background: "#7c3aed", color: "#ffffff", fontWeight: 700, fontSize: 10, display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 6px rgba(124, 58, 237, 0.2)", transition: "all 0.12s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#6d28d9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.transform = "translateY(0)"; }}
                          ><ZoomIn size={11} /> View PDF</button>
                        )}
                        <button onClick={() => setDeleteTarget(m)} style={{ all: "unset", cursor: "pointer", width: 28, height: 28, borderRadius: 8, border: "1.5px solid #fecdd3", background: "#fff1f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                          onMouseLeave={e => e.currentTarget.style.background = "#fff1f2"}
                        ><Trash2 size={11} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {deleteTarget && <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} deleting={deleting} />}
      {previewItem && (
        <PdfViewerPage
          pdfUrl={previewItem.fileUrl}
          title={previewItem.title}
          onClose={() => setPreviewItem(null)}
        />
      )}
      {isUploadOpen && <UploadModal batches={batches} onClose={() => setIsUploadOpen(false)} onUploadSuccess={fetchMaterials} baseURL={baseURL} />}

      <style>{`
        @keyframes nexusSpin { to { transform:rotate(360deg); } }
        @keyframes modalIn   { from{opacity:0;transform:scale(0.98)} to{opacity:1;transform:scale(1)} }
        .nexus-no-scroll::-webkit-scrollbar { display:none; }
        .nexus-no-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </AdminLayout>
  );
}