import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  FileText, PlusCircle, BarChart3, Upload,
  Wind, Beaker, Binary, Atom, CheckCircle2,
  X, Bell, Loader2, BookOpen, HelpCircle,
  Sigma, Trash2, Users, ArrowRight, ChevronDown,
  ChevronRight, Map, RotateCcw, FileQuestion,
  Video, Brain, Repeat, PenLine,
} from "lucide-react";

/* ─── Global styles injected once ───────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; }
  body, .admin-dash * { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes progressShimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes popIn {
    0%   { transform: scale(0.88); opacity: 0; }
    60%  { transform: scale(1.03); }
    100% { transform: scale(1);    opacity: 1; }
  }

  .dash-card {
    background: #fff;
    border-radius: 18px;
    border: 1.5px solid #f1f1f4;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
  }

  .quick-link-btn {
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .quick-link-btn:hover {
    transform: translateY(-2px);
  }

  .subject-btn {
    transition: all 0.15s ease;
  }
  .subject-btn:hover:not(.active) {
    border-color: #c4b5fd !important;
    background: #faf8ff !important;
    transform: translateY(-1px);
  }

  .cat-btn {
    transition: all 0.15s ease;
  }
  .cat-btn:hover:not(.active) {
    border-color: #c4b5fd !important;
    background: #f5f3ff !important;
    color: #7c3aed !important;
  }

  .batch-btn {
    transition: all 0.15s ease;
  }
  .batch-btn:hover:not(.active) {
    border-color: #a78bfa !important;
    background: #f5f3ff !important;
    color: #6d28d9 !important;
  }

  .upload-btn {
    transition: opacity 0.15s, transform 0.15s;
  }
  .upload-btn:hover { opacity: 0.88 !important; transform: translateY(-1px); }
  .upload-btn:active { transform: translateY(0); }

  .dropzone { transition: border-color 0.25s, background 0.25s; }

  .chapter-opt:hover { background: #f5f3ff !important; color: #7c3aed !important; }

  .page-enter { animation: fadeUp 0.3s ease both; }

  .step-pill {
    transition: all 0.2s ease;
  }
`;

/* ─── Config ─────────────────────────────────────────────────────── */
const SUBJECTS = [
  { id: "phy", name: "Physics",   icon: <Wind size={16} />,   color: "#6366f1", bg: "#eef2ff", accent: "#818cf8" },
  { id: "che", name: "Chemistry", icon: <Beaker size={16} />, color: "#059669", bg: "#ecfdf5", accent: "#34d399" },
  { id: "mat", name: "Maths",     icon: <Binary size={16} />, color: "#7c3aed", bg: "#f5f3ff", accent: "#a78bfa" },
  { id: "bio", name: "Biology",   icon: <Atom size={16} />,   color: "#db2777", bg: "#fdf2f8", accent: "#f472b6" },
];

const CHAPTERS = {
  phy: [
    { id: "phy-01", label: "Rotational Dynamics" },
    { id: "phy-02", label: "Mechanical Properties of Fluids" },
    { id: "phy-03", label: "Kinetic Theory of Gases & Radiation" },
    { id: "phy-04", label: "Thermodynamics" },
    { id: "phy-05", label: "Oscillations" },
    { id: "phy-06", label: "Superposition of Waves" },
    { id: "phy-07", label: "Wave Optics" },
    { id: "phy-08", label: "Electrostatics" },
    { id: "phy-09", label: "Current Electricity" },
    { id: "phy-10", label: "Magnetic Fields" },
    { id: "phy-11", label: "Electromagnetic Induction" },
    { id: "phy-12", label: "Electrons & Photons" },
    { id: "phy-13", label: "Atoms, Molecules & Nuclei" },
    { id: "phy-14", label: "Semiconductors" },
    { id: "phy-15", label: "Communication Systems" },
  ],
  che: [
    { id: "che-01", label: "Solid State" },
    { id: "che-02", label: "Solutions & Colligative Properties" },
    { id: "che-03", label: "Chemical Thermodynamics" },
    { id: "che-04", label: "Electrochemistry" },
    { id: "che-05", label: "Chemical Kinetics" },
    { id: "che-06", label: "p-Block Elements" },
    { id: "che-07", label: "d & f Block Elements" },
    { id: "che-08", label: "Coordination Compounds" },
    { id: "che-09", label: "Halogen Derivatives" },
    { id: "che-10", label: "Alcohols, Phenols & Ethers" },
    { id: "che-11", label: "Aldehydes & Ketones" },
    { id: "che-12", label: "Carboxylic Acids & Derivatives" },
    { id: "che-13", label: "Amines" },
    { id: "che-14", label: "Biomolecules" },
    { id: "che-15", label: "Polymers & Chemistry in Everyday Life" },
  ],
  mat: [
    { id: "mat-01", label: "Mathematical Logic" },
    { id: "mat-02", label: "Matrices" },
    { id: "mat-03", label: "Trigonometric Functions" },
    { id: "mat-04", label: "Pair of Straight Lines" },
    { id: "mat-05", label: "Vectors" },
    { id: "mat-06", label: "Line & Plane (3D)" },
    { id: "mat-07", label: "Linear Programming" },
    { id: "mat-08", label: "Continuity & Differentiability" },
    { id: "mat-09", label: "Applications of Derivatives" },
    { id: "mat-10", label: "Integration" },
    { id: "mat-11", label: "Definite Integrals & Applications" },
    { id: "mat-12", label: "Differential Equations" },
    { id: "mat-13", label: "Probability Distribution" },
    { id: "mat-14", label: "Binomial Distribution" },
  ],
  bio: [
    { id: "bio-01", label: "Reproduction in Plants" },
    { id: "bio-02", label: "Reproduction in Animals" },
    { id: "bio-03", label: "Inheritance & Variation" },
    { id: "bio-04", label: "Molecular Basis of Inheritance" },
    { id: "bio-05", label: "Origin & Evolution" },
    { id: "bio-06", label: "Human Health & Disease" },
    { id: "bio-07", label: "Animal Husbandry & Plant Breeding" },
    { id: "bio-08", label: "Microbes in Human Welfare" },
    { id: "bio-09", label: "Biotechnology" },
    { id: "bio-10", label: "Organisms & Populations" },
    { id: "bio-11", label: "Ecosystems" },
    { id: "bio-12", label: "Biodiversity & Conservation" },
    { id: "bio-13", label: "Environmental Issues" },
  ],
};

const CATEGORIES = [
  { id: "notes",    label: "Notes",           icon: <BookOpen size={12} /> },
  { id: "pyqs",     label: "PYQ's",           icon: <HelpCircle size={12} /> },
  { id: "boards",   label: "Board Papers",    icon: <FileQuestion size={12} /> },
  { id: "formulas", label: "Formulas",        icon: <Sigma size={12} /> },
  { id: "mindmaps", label: "Mind Maps",       icon: <Brain size={12} /> },
  { id: "revision", label: "Revision",        icon: <Repeat size={12} /> },
  { id: "practice", label: "Practice Sheets", icon: <PenLine size={12} /> },
];

const QUICK_LINKS = [
  { title: "My Tests",    desc: "View & manage sessions",  icon: <FileText size={20} />,   path: "/admin/tests",       color: "#6366f1", bg: "linear-gradient(135deg,#eef2ff,#e0e7ff)" },
  { title: "Create Test", desc: "AI-powered & manual",     icon: <PlusCircle size={20} />, path: "/admin/pdf",         color: "#7c3aed", bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)" },
  { title: "Performance", desc: "Grades & analytics",      icon: <BarChart3 size={20} />,  path: "/admin/performance", color: "#059669", bg: "linear-gradient(135deg,#ecfdf5,#d1fae5)" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── StepBar ────────────────────────────────────────────────────── */
const steps = ["Subject", "Chapter", "Category", "File & Deploy"];

const StepBar = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", padding: "20px 24px 4px", gap: 0 }}>
    {steps.map((s, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="step-pill" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? "#7c3aed" : active ? "#7c3aed" : "#f1f1f4",
              color: done || active ? "#fff" : "#9ca3af",
              border: `2.5px solid ${done || active ? "#7c3aed" : "#e5e7eb"}`,
              boxShadow: active ? "0 0 0 4px #ede9fe" : "none",
              transition: "all 0.25s",
            }}>
              {done ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              color: done || active ? "#7c3aed" : "#c4c4cc",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
            }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2.5, margin: "0 6px", marginBottom: 22, borderRadius: 99,
              background: done ? "#7c3aed" : "#f1f1f4",
              transition: "background 0.35s ease",
              overflow: "hidden",
              position: "relative",
            }}>
              {done && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, #7c3aed, #6366f1)",
                }} />
              )}
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─── Chapter dropdown ──────────────────────────────────────────── */
const ChapterSelect = ({ subjectId, value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const chapters = CHAPTERS[subjectId] || [];
  const selected = chapters.find(c => c.id === value);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          all: "unset", width: "100%", boxSizing: "border-box",
          padding: "11px 14px", borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
          border: `2px solid ${value ? "#7c3aed" : "#e8e8ee"}`,
          background: value ? "#faf8ff" : "#fafafa",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 13, fontWeight: 600,
          color: value ? "#5b21b6" : "#b0b0be",
          opacity: disabled ? 0.45 : 1,
          transition: "all 0.15s",
          boxShadow: value ? "0 0 0 3px #ede9fe" : "none",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected
            ? <><span style={{ color: "#a78bfa", fontFamily: "'DM Mono', monospace", fontSize: 11, marginRight: 6 }}>{selected.id.split("-")[1]}</span>{selected.label}</>
            : "Select chapter…"}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0, color: value ? "#7c3aed" : "#c4c4cc", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
          background: "#fff", border: "1.5px solid #ede9fe", borderRadius: 14,
          boxShadow: "0 12px 40px rgba(124,58,237,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          maxHeight: 256, overflowY: "auto",
          animation: "fadeUp 0.15s ease both",
        }}>
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              className="chapter-opt"
              onClick={() => { onChange(ch.id); setOpen(false); }}
              style={{
                all: "unset", width: "100%", boxSizing: "border-box",
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500,
                background: value === ch.id ? "#f5f3ff" : "transparent",
                color: value === ch.id ? "#7c3aed" : "#374151",
                borderBottom: idx < chapters.length - 1 ? "1px solid #f7f7fb" : "none",
                transition: "background 0.12s, color 0.12s",
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: value === ch.id ? "#7c3aed" : "#f1f1f4",
                color: value === ch.id ? "#fff" : "#a0a0b0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, fontFamily: "'DM Mono', monospace",
              }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.label}</span>
              {value === ch.id && <CheckCircle2 size={14} style={{ color: "#7c3aed", flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Section label ─────────────────────────────────────────────── */
const SectionLabel = ({ number, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <div style={{
      width: 20, height: 20, borderRadius: 6, background: "#7c3aed",
      color: "#fff", fontSize: 10, fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>{number}</div>
    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.07em", textTransform: "uppercase" }}>{children}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const baseURL   = import.meta.env.VITE_API_BASE_URL;

  const [subjectId,  setSubjectId]  = useState(null);
  const [chapterId,  setChapterId]  = useState(null);
  const [category,   setCategory]   = useState(null);
  const [batchIds,   setBatchIds]   = useState([]);
  const [file,       setFile]       = useState(null);
  const [status,     setStatus]     = useState("idle");
  const [progress,   setProgress]   = useState(0);
  const [batches,    setBatches]    = useState([]);
  const [batchLoad,  setBatchLoad]  = useState(true);
  const [toast,      setToast]      = useState(null);
  const fileRef = useRef(null);

  const step = !subjectId ? 0 : !chapterId ? 1 : !category ? 2 : 3;

  useEffect(() => {
    /* Inject CSS once */
    if (!document.getElementById("admin-dash-css")) {
      const tag = document.createElement("style");
      tag.id = "admin-dash-css";
      tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
    api.get("/teacher/my-batches")
      .then(r => setBatches(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setBatchLoad(false));
  }, []);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleBatch = id =>
    setBatchIds(p => p.includes(id) ? p.filter(b => b !== id) : [...p, id]);

  const pickFile = () => {
    if (!subjectId) return notify("Select a subject first", "error");
    if (!chapterId) return notify("Select a chapter first", "error");
    if (!category)  return notify("Select a category first", "error");
    fileRef.current.click();
  };

  const onFileChange = e => {
    const f = e.target.files[0];
    if (f) { setFile(f); setStatus("staged"); }
  };

  const upload = async () => {
    if (!file || !subjectId || !chapterId || !category) return;
    if (!batchIds.length) return notify("Select at least one batch", "error");

    setStatus("uploading"); setProgress(0);

    const fd = new FormData();
    fd.append("file",      file);
    fd.append("subjectId", subjectId);
    fd.append("chapterId", chapterId);
    fd.append("category",  category);
    fd.append("batchIds",  JSON.stringify(batchIds));

    const iv = setInterval(() => setProgress(p => p >= 93 ? 93 : p + 4), 180);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/upload-material`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(100);
        setTimeout(() => { setStatus("success"); notify(`${file.name} deployed successfully!`); }, 400);
      } else throw new Error(data.message || "Upload failed");
    } catch (err) {
      notify(err.message || "Network error", "error");
      reset();
    } finally {
      clearInterval(iv);
    }
  };

  const reset = () => {
    setFile(null); setBatchIds([]); setStatus("idle"); setProgress(0);
    setSubjectId(null); setChapterId(null); setCategory(null);
  };

  const canUpload = subjectId && chapterId && category;

  /* ── Crumb ── */
  const SelectionCrumb = () => {
    if (!subjectId) return null;
    const sub = SUBJECTS.find(s => s.id === subjectId);
    const ch  = chapterId ? CHAPTERS[subjectId]?.find(c => c.id === chapterId) : null;
    const cat = category  ? CATEGORIES.find(c => c.id === category) : null;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "4px 24px 0" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, background: sub.bg, color: sub.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, border: `1px solid ${sub.color}22` }}>
          {sub.icon} {sub.name}
        </span>
        {ch && <>
          <ChevronRight size={12} style={{ color: "#d1d5db" }} />
          <span style={{ fontSize: 11, fontWeight: 600, background: "#f5f3ff", color: "#7c3aed", padding: "4px 10px", borderRadius: 99, border: "1px solid #ddd6fe" }}>
            {ch.label}
          </span>
        </>}
        {cat && <>
          <ChevronRight size={12} style={{ color: "#d1d5db" }} />
          <span style={{ fontSize: 11, fontWeight: 600, background: "#f0fdf4", color: "#059669", padding: "4px 10px", borderRadius: 99, border: "1px solid #a7f3d0" }}>
            {cat.label}
          </span>
        </>}
        <button
          onClick={reset}
          style={{ all: "unset", cursor: "pointer", marginLeft: 2, display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#94a3b8", padding: "4px 8px", borderRadius: 99, border: "1px solid #e5e7eb" }}
        >
          <RotateCcw size={10} /> Reset
        </button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <style>{GLOBAL_CSS}</style>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(" ")[0] || "Admin"} 👋`}
        subtitle="Here's your admin overview"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "6px 14px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px #bbf7d0", animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Sync</span>
          </div>
        }
      />

      <div className="page-enter admin-dash" style={{ flex: 1, overflowY: "auto", padding: "24px clamp(16px,3vw,28px) 56px", background: "#fafafa" }}>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          {QUICK_LINKS.map((q, i) => (
            <button
              key={i}
              onClick={() => navigate(q.path)}
              className="dash-card quick-link-btn"
              style={{
                all: "unset", padding: "18px 20px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
                borderRadius: 18, border: "1.5px solid #f1f1f4",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${q.color}20`; e.currentTarget.style.borderColor = q.color + "30"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)"; e.currentTarget.style.borderColor = "#f1f1f4"; }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 13, background: q.bg,
                color: q.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {q.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{q.title}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{q.desc}</div>
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: "#f8f8fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ArrowRight size={13} style={{ color: "#c4c4cc" }} />
              </div>
            </button>
          ))}
        </div>

        {/* ── Upload panel ── */}
        <div className="dash-card" style={{ overflow: "visible" }}>

          {/* Panel header */}
          <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #f7f7fb", display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(to right, #faf8ff, #fff)", borderRadius: "18px 18px 0 0" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#6366f1)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(124,58,237,0.32)",
            }}>
              <Upload size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Deploy Study Material</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 1 }}>Upload PDFs to student vaults — follow the steps below</div>
            </div>
            {(status === "staged" || status === "success") && (
              <button onClick={reset} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#94a3b8", padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fafafa" }}>
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Step bar */}
          <StepBar current={step} />

          {/* Breadcrumb */}
          <SelectionCrumb />

          {/* Two-col body */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", marginTop: 18 }}>

            {/* LEFT col */}
            <div style={{ padding: "4px 24px 26px", borderRight: "1.5px solid #f7f7fb", display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Step 1 — Subject */}
              <div>
                <SectionLabel number="1">Subject</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SUBJECTS.map(s => (
                    <button
                      key={s.id}
                      className={`subject-btn${subjectId === s.id ? " active" : ""}`}
                      onClick={() => {
                        if (status !== "idle" && status !== "staged") return;
                        setSubjectId(s.id);
                        if (subjectId !== s.id) { setChapterId(null); setCategory(null); }
                      }}
                      style={{
                        all: "unset", padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                        border: `2px solid ${subjectId === s.id ? s.color : "#e8e8ee"}`,
                        background: subjectId === s.id ? s.bg : "#fafafa",
                        display: "flex", alignItems: "center", gap: 9,
                        boxShadow: subjectId === s.id ? `0 0 0 3px ${s.color}18, 0 2px 8px ${s.color}14` : "none",
                        opacity: status === "uploading" ? 0.55 : 1,
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: subjectId === s.id ? s.color : "#f1f1f4",
                        color: subjectId === s.id ? "#fff" : "#a0a0b0",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        transition: "all 0.15s",
                      }}>
                        {s.icon}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: subjectId === s.id ? s.color : "#4b5563" }}>
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 — Chapter */}
              <div style={{ opacity: subjectId ? 1 : 0.38, transition: "opacity 0.25s", pointerEvents: subjectId ? "auto" : "none" }}>
                <SectionLabel number="2">Chapter</SectionLabel>
                <ChapterSelect
                  subjectId={subjectId}
                  value={chapterId}
                  onChange={id => { setChapterId(id); setCategory(null); }}
                  disabled={!subjectId || status === "uploading"}
                />
              </div>

              {/* Step 3 — Category */}
              <div style={{ opacity: chapterId ? 1 : 0.38, transition: "opacity 0.25s", pointerEvents: chapterId ? "auto" : "none" }}>
                <SectionLabel number="3">Category</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      className={`cat-btn${category === c.id ? " active" : ""}`}
                      onClick={() => status !== "uploading" && setCategory(c.id)}
                      style={{
                        all: "unset", display: "flex", alignItems: "center", gap: 5,
                        padding: "6px 12px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        background: category === c.id ? "#7c3aed" : "#f7f7fb",
                        color:      category === c.id ? "#fff"    : "#64748b",
                        border:     `1.5px solid ${category === c.id ? "#7c3aed" : "#e8e8ee"}`,
                        boxShadow:  category === c.id ? "0 3px 10px rgba(124,58,237,0.28)" : "none",
                      }}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4 — Batches */}
              <div style={{ opacity: category ? 1 : 0.38, transition: "opacity 0.25s", pointerEvents: category ? "auto" : "none" }}>
                <SectionLabel number="4">
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={11} /> Batches</span>
                </SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {batchLoad
                    ? <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />Loading batches…
                      </span>
                    : batches.length === 0
                      ? <span style={{ fontSize: 12, color: "#c4c4cc", fontWeight: 500 }}>No batches found</span>
                      : batches.map(b => (
                          <button
                            key={b._id}
                            className={`batch-btn${batchIds.includes(b._id) ? " active" : ""}`}
                            onClick={() => (status === "idle" || status === "staged") && toggleBatch(b._id)}
                            style={{
                              all: "unset", padding: "6px 13px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                              background: batchIds.includes(b._id) ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "#f7f7fb",
                              color:      batchIds.includes(b._id) ? "#fff" : "#64748b",
                              border:     `1.5px solid ${batchIds.includes(b._id) ? "transparent" : "#e8e8ee"}`,
                              boxShadow:  batchIds.includes(b._id) ? "0 3px 10px rgba(124,58,237,0.28)" : "none",
                            }}
                          >
                            {batchIds.includes(b._id) && <span style={{ marginRight: 4, fontSize: 10 }}>✓</span>}
                            {b.name}
                          </button>
                        ))
                  }
                </div>
              </div>
            </div>

            {/* RIGHT col — dropzone */}
            <div style={{ padding: "4px 24px 26px", display: "flex", flexDirection: "column" }}>
              <SectionLabel number="5">Upload File</SectionLabel>
              <input type="file" ref={fileRef} onChange={onFileChange} style={{ display: "none" }} accept=".pdf" />

              <div
                className="dropzone"
                style={{
                  flex: 1, minHeight: 260, borderRadius: 16,
                  border: `2px dashed ${
                    status === "success"  ? "#22c55e"
                    : status === "staged" ? "#7c3aed"
                    : canUpload           ? "#c4b5fd"
                    : "#e8e8ee"
                  }`,
                  background: status === "success" ? "#f0fdf4"
                    : status === "staged"           ? "#faf8ff"
                    : canUpload                     ? "#fdfcff"
                    : "#fafafa",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "32px 24px", textAlign: "center",
                  opacity: canUpload || status === "success" ? 1 : 0.5,
                  pointerEvents: canUpload || status === "success" ? "auto" : "none",
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 60, height: 60, borderRadius: 16, marginBottom: 16,
                  background: status === "success"   ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : status === "uploading"          ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                    : status === "staged"             ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                    : "#f1f1f4",
                  color: (status === "success" || status === "staged" || status === "uploading") ? "#fff" : "#b0b0be",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: status === "staged"     ? "0 8px 24px rgba(124,58,237,0.32)"
                    : status === "success"            ? "0 8px 24px rgba(34,197,94,0.28)"
                    : status === "uploading"          ? "0 8px 24px rgba(124,58,237,0.28)"
                    : "none",
                  transition: "all 0.28s",
                  animation: status === "success" ? "popIn 0.35s ease both" : "none",
                }}>
                  {status === "success"   ? <CheckCircle2 size={26} />
                   : status === "uploading" ? <Loader2 size={26} style={{ animation: "spin 1s linear infinite" }} />
                   : status === "staged"   ? <FileText size={26} />
                   : <Upload size={26} />}
                </div>

                <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", marginBottom: 4, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {status === "success" ? "🎉 Deployed!" : file ? file.name : "Choose a PDF file"}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 22, fontWeight: 500 }}>
                  {status === "success"
                    ? "File is now live in student vault"
                    : status === "staged"
                    ? `Ready to deploy · ${batchIds.length} batch${batchIds.length !== 1 ? "es" : ""} selected`
                    : canUpload
                    ? "PDF only · max 20 MB"
                    : "Complete all steps above first"}
                </div>

                {status === "uploading" ? (
                  <div style={{ width: "100%", maxWidth: 260 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 10 }}>
                      <span>Uploading…</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{progress}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#ede9fe", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 99,
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #7c3aed, #6366f1, #a78bfa)",
                        backgroundSize: "200% 100%",
                        animation: "progressShimmer 1.5s linear infinite",
                        transition: "width 0.35s ease",
                      }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: "100%", maxWidth: 260, display: "flex", flexDirection: "column", gap: 9 }}>
                    <button
                      className="upload-btn"
                      onClick={() => status === "staged" ? upload() : status === "success" ? reset() : pickFile()}
                      style={{
                        all: "unset", width: "100%", padding: "12px", borderRadius: 11, cursor: "pointer",
                        fontWeight: 800, fontSize: 13, textAlign: "center", boxSizing: "border-box",
                        background: status === "success"
                          ? "linear-gradient(135deg,#22c55e,#16a34a)"
                          : "linear-gradient(135deg,#7c3aed,#6366f1)",
                        color: "#fff",
                        boxShadow: status === "success"
                          ? "0 4px 18px rgba(34,197,94,0.34)"
                          : "0 4px 18px rgba(124,58,237,0.36)",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {status === "success" ? "✦ Deploy Another" : status === "staged" ? "🚀 Start Deployment" : "Choose File"}
                    </button>
                    {status === "staged" && (
                      <button
                        onClick={reset}
                        style={{ all: "unset", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", gap: 5, justifyContent: "center", fontSize: 12, fontWeight: 600, padding: "6px", borderRadius: 8, transition: "color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#64748b"}
                        onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                      >
                        <Trash2 size={12} /> Discard file
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Hint text */}
              {!canUpload && (
                <p style={{ textAlign: "center", fontSize: 11, color: "#c4c4cc", fontWeight: 500, marginTop: 14, marginBottom: 0 }}>
                  Select subject → chapter → category to unlock upload
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 999, minWidth: 290, maxWidth: 400,
          animation: "slideIn 0.22s cubic-bezier(.34,1.3,.64,1) both",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderRadius: 16,
            boxShadow: toast.type === "error"
              ? "0 10px 40px rgba(190,18,60,0.14), 0 2px 8px rgba(0,0,0,0.06)"
              : "0 10px 40px rgba(124,58,237,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            background: toast.type === "error" ? "#fff" : "#fff",
            border: `1.5px solid ${toast.type === "error" ? "#fecdd3" : "#ddd6fe"}`,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              background: toast.type === "error" ? "#fff1f2" : "#f5f3ff",
            }}>
              {toast.type === "error"
                ? <X size={15} style={{ color: "#be123c" }} />
                : <CheckCircle2 size={15} style={{ color: "#7c3aed" }} />}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: toast.type === "error" ? "#be123c" : "#1e1b4b", flex: 1, lineHeight: 1.4 }}>
              {toast.msg}
            </span>
            <button onClick={() => setToast(null)} style={{ all: "unset", cursor: "pointer", color: "#c4c4cc", lineHeight: 0, padding: 2 }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}