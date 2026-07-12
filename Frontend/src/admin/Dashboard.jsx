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

/* ─── Config ─────────────────────────────────────────────────────── */
const SUBJECTS = [
  { id: "phy", name: "Physics",   icon: <Wind size={16} />,   color: "text-indigo-500",   bg: "bg-indigo-50",   border: "border-indigo-100", activeBorder: "border-indigo-500", shadow: "shadow-indigo-500/10" },
  { id: "che", name: "Chemistry", icon: <Beaker size={16} />, color: "text-emerald-600",  bg: "bg-emerald-50",  border: "border-emerald-100", activeBorder: "border-emerald-500", shadow: "shadow-emerald-500/10" },
  { id: "mat", name: "Maths",     icon: <Binary size={16} />, color: "text-violet-600",   bg: "bg-violet-50",   border: "border-violet-100", activeBorder: "border-violet-500", shadow: "shadow-violet-500/10" },
  { id: "bio", name: "Biology",   icon: <Atom size={16} />,   color: "text-pink-600",     bg: "bg-pink-50",     border: "border-pink-100", activeBorder: "border-pink-500", shadow: "shadow-pink-500/10" },
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
  { title: "My Tests",    desc: "View & manage sessions",  icon: <FileText size={20} />,   path: "/admin/tests",       color: "text-indigo-600", bg: "bg-indigo-50", hover: "hover:shadow-indigo-500/20 hover:border-indigo-200" },
  { title: "Create Test", desc: "AI-powered & manual",     icon: <PlusCircle size={20} />, path: "/admin/pdf",         color: "text-violet-600", bg: "bg-violet-50", hover: "hover:shadow-violet-500/20 hover:border-violet-200" },
  { title: "Performance", desc: "Grades & analytics",      icon: <BarChart3 size={20} />,  path: "/admin/performance", color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:shadow-emerald-500/20 hover:border-emerald-200" },
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
  <div className="flex items-center px-6 pt-5 pb-1 gap-0 overflow-x-auto no-scrollbar">
    {steps.map((s, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5 transition-all duration-200">
            <div className={`
              w-8 h-8 rounded-full text-[11px] font-extrabold flex items-center justify-center transition-all duration-300
              ${done ? 'bg-violet-600 text-white border-2 border-violet-600' : 
                active ? 'bg-violet-600 text-white border-2 border-violet-600 shadow-[0_0_0_4px_#ede9fe]' : 
                'bg-slate-100 text-slate-400 border-2 border-slate-200'}
            `}>
              {done ? "✓" : i + 1}
            </div>
            <span className={`
              text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-colors duration-200
              ${done || active ? 'text-violet-600' : 'text-slate-300'}
            `}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`
              flex-1 h-[3px] mx-2 mb-5 rounded-full relative overflow-hidden transition-colors duration-300 min-w-[30px]
              ${done ? 'bg-violet-600' : 'bg-slate-100'}
            `}>
              {done && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-500" />
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
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 rounded-xl flex items-center justify-between text-[13px] font-semibold transition-all duration-150
          border-2 ${value ? 'border-violet-600 bg-violet-50 text-violet-800 shadow-[0_0_0_3px_#ede9fe]' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-violet-300 hover:bg-violet-50/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="truncate">
          {selected
            ? <><span className="text-violet-400 font-mono text-[11px] mr-2">{selected.id.split("-")[1]}</span>{selected.label}</>
            : "Select chapter…"}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${value ? 'text-violet-600' : 'text-slate-300'} ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-violet-100 rounded-xl shadow-[0_12px_40px_rgba(124,58,237,0.12),0_2px_8px_rgba(0,0,0,0.06)] max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => { onChange(ch.id); setOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3.5 py-2 cursor-pointer text-[13px] font-medium transition-colors
                ${value === ch.id ? 'bg-violet-50 text-violet-700' : 'bg-transparent text-slate-700 hover:bg-violet-50/50 hover:text-violet-600'}
                ${idx < chapters.length - 1 ? 'border-b border-slate-50' : ''}
              `}
            >
              <span className={`
                w-5 h-5 rounded-md shrink-0 flex items-center justify-center text-[10px] font-extrabold font-mono
                ${value === ch.id ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate text-left">{ch.label}</span>
              {value === ch.id && <CheckCircle2 size={14} className="text-violet-600 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Section label ─────────────────────────────────────────────── */
const SectionLabel = ({ number, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-5 h-5 rounded-md bg-violet-600 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
      {number}
    </div>
    <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase flex items-center gap-1.5">{children}</span>
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
      <div className="flex items-center gap-1.5 flex-wrap px-6 pt-1">
        <span className={`flex items-center gap-1.5 ${sub.bg} ${sub.color} text-[11px] font-bold px-2.5 py-1 rounded-full border ${sub.border}`}>
          {sub.icon} {sub.name}
        </span>
        {ch && <>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-[11px] font-semibold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full border border-violet-200">
            {ch.label}
          </span>
        </>}
        {cat && <>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
            {cat.label}
          </span>
        </>}
        <button
          onClick={reset}
          className="ml-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={10} /> Reset
        </button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(" ")[0] || "Admin"} 👋`}
        subtitle="Here's your admin overview"
        right={
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_#bbf7d0] animate-pulse" />
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-widest">Live Sync</span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 pb-20">

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {QUICK_LINKS.map((q, i) => (
            <button
              key={i}
              onClick={() => navigate(q.path)}
              className={`
                group text-left p-5 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200
                flex items-center gap-4 ${q.hover} hover:-translate-y-0.5
              `}
            >
              <div className={`w-12 h-12 rounded-xl ${q.bg} ${q.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                {q.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{q.title}</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{q.desc}</div>
              </div>
              <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-violet-50 transition-colors">
                <ArrowRight size={14} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {/* ── Upload panel ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-visible">

          {/* Panel header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-4 bg-gradient-to-r from-violet-50/50 to-transparent rounded-t-3xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/30">
              <Upload size={18} />
            </div>
            <div className="flex-1">
              <div className="text-base font-extrabold text-slate-900 tracking-tight">Deploy Study Material</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Upload PDFs to student vaults — follow the steps below</div>
            </div>
            {(status === "staged" || status === "success") && (
              <button 
                onClick={reset} 
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Step bar */}
          <StepBar current={step} />

          {/* Breadcrumb */}
          <SelectionCrumb />

          {/* Two-col body */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] mt-4">

            {/* LEFT col */}
            <div className="px-6 py-6 lg:border-r border-slate-100 flex flex-col gap-6">

              {/* Step 1 — Subject */}
              <div>
                <SectionLabel number="1">Subject</SectionLabel>
                <div className="grid grid-cols-2 gap-2.5">
                  {SUBJECTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (status !== "idle" && status !== "staged") return;
                        setSubjectId(s.id);
                        if (subjectId !== s.id) { setChapterId(null); setCategory(null); }
                      }}
                      className={`
                        p-2.5 rounded-xl flex items-center gap-2.5 transition-all duration-200 border-2 text-left
                        ${subjectId === s.id 
                          ? `${s.bg} ${s.activeBorder} ${s.shadow} shadow-md` 
                          : `bg-slate-50 border-slate-200 hover:border-violet-300 hover:bg-violet-50/30`
                        }
                        ${status === "uploading" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${subjectId === s.id ? `bg-white ${s.color} shadow-sm` : "bg-slate-200 text-slate-500"}
                      `}>
                        {s.icon}
                      </div>
                      <span className={`text-[13px] font-bold ${subjectId === s.id ? s.color : "text-slate-600"}`}>
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2 — Chapter */}
              <div className={`transition-opacity duration-300 ${subjectId ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <SectionLabel number="2">Chapter</SectionLabel>
                <ChapterSelect
                  subjectId={subjectId}
                  value={chapterId}
                  onChange={id => { setChapterId(id); setCategory(null); }}
                  disabled={!subjectId || status === "uploading"}
                />
              </div>

              {/* Step 3 — Category */}
              <div className={`transition-opacity duration-300 ${chapterId ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <SectionLabel number="3">Category</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      onClick={() => status !== "uploading" && setCategory(c.id)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border-2
                        ${category === c.id 
                          ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/30' 
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50'}
                      `}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4 — Batches */}
              <div className={`transition-opacity duration-300 ${category ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <SectionLabel number="4">
                  <span className="flex items-center gap-1.5"><Users size={12} /> Batches</span>
                </SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {batchLoad
                    ? <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                        <Loader2 size={14} className="animate-spin" /> Loading batches…
                      </span>
                    : batches.length === 0
                      ? <span className="text-xs text-slate-400 font-medium">No batches found</span>
                      : batches.map(b => (
                          <button
                            key={b._id}
                            onClick={() => (status === "idle" || status === "staged") && toggleBatch(b._id)}
                            className={`
                              flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border-2
                              ${batchIds.includes(b._id)
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'}
                            `}
                          >
                            {batchIds.includes(b._id) && <span className="mr-1.5 text-[10px]">✓</span>}
                            {b.name}
                          </button>
                        ))
                  }
                </div>
              </div>
            </div>

            {/* RIGHT col — dropzone */}
            <div className="p-6 flex flex-col h-full lg:min-h-[400px]">
              <SectionLabel number="5">Upload File</SectionLabel>
              <input type="file" ref={fileRef} onChange={onFileChange} className="hidden" accept=".pdf" />

              <div
                className={`
                  flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all duration-300
                  ${status === "success"  ? "border-emerald-500 bg-emerald-50"
                  : status === "staged"   ? "border-violet-500 bg-violet-50/50"
                  : canUpload             ? "border-violet-300 bg-white hover:border-violet-500 hover:bg-violet-50/30"
                  : "border-slate-200 bg-slate-50"}
                  ${canUpload || status === "success" ? "opacity-100" : "opacity-50 pointer-events-none"}
                `}
              >
                {/* Icon circle */}
                <div className={`
                  w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-all duration-300
                  ${status === "success"   ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                  : status === "uploading" ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                  : status === "staged"    ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                  : "bg-slate-100 text-slate-400"}
                `}>
                  {status === "success"   ? <CheckCircle2 size={28} />
                   : status === "uploading" ? <Loader2 size={28} className="animate-spin" />
                   : status === "staged"   ? <FileText size={28} />
                   : <Upload size={28} />}
                </div>

                <div className="font-extrabold text-[15px] text-slate-900 mb-1 max-w-[220px] truncate">
                  {status === "success" ? "🎉 Deployed!" : file ? file.name : "Choose a PDF file"}
                </div>
                <div className="text-xs text-slate-500 mb-6 font-medium">
                  {status === "success"
                    ? "File is now live in student vault"
                    : status === "staged"
                    ? `Ready to deploy · ${batchIds.length} batch${batchIds.length !== 1 ? "es" : ""} selected`
                    : canUpload
                    ? "PDF only · max 20 MB"
                    : "Complete all steps above first"}
                </div>

                {status === "uploading" ? (
                  <div className="w-full max-w-[260px]">
                    <div className="flex justify-between text-xs font-bold text-violet-700 mb-2">
                      <span>Uploading…</span><span className="font-mono">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-violet-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 rounded-full relative overflow-hidden" style={{ width: `${progress}%` }}>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[240px] flex flex-col gap-2.5">
                    <button
                      onClick={() => status === "staged" ? upload() : status === "success" ? reset() : pickFile()}
                      className={`
                        w-full py-3 px-4 rounded-xl font-bold text-[13px] text-center transition-transform hover:-translate-y-0.5 active:translate-y-0
                        ${status === "success"
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30"
                          : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30"}
                      `}
                    >
                      {status === "success" ? "✦ Deploy Another" : status === "staged" ? "🚀 Start Deployment" : "Choose File"}
                    </button>
                    {status === "staged" && (
                      <button
                        onClick={reset}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 p-2 transition-colors rounded-lg hover:bg-slate-100"
                      >
                        <Trash2 size={14} /> Discard file
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Hint text */}
              {!canUpload && (
                <p className="text-center text-[11px] text-slate-400 font-semibold mt-4 mb-0">
                  Select subject → chapter → category to unlock upload
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[290px] max-w-[400px]">
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl shadow-slate-200/50 bg-white border-2
            ${toast.type === "error" ? "border-rose-200" : "border-violet-200"}
          `}>
            <div className={`
              w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              ${toast.type === "error" ? "bg-rose-50 text-rose-500" : "bg-violet-50 text-violet-600"}
            `}>
              {toast.type === "error"
                ? <X size={16} />
                : <CheckCircle2 size={16} />}
            </div>
            <span className={`text-[13px] font-bold flex-1 leading-snug ${toast.type === "error" ? "text-rose-600" : "text-slate-800"}`}>
              {toast.msg}
            </span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}