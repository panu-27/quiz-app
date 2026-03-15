import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  FileText, PlusCircle, BarChart3, Upload,
  Wind, Beaker, Binary, Atom, CheckCircle2,
  X, Bell, Loader2, BookOpen, HelpCircle,
  Sigma, Trash2, Users, ArrowRight,
} from "lucide-react";

const SUBJECTS = [
  { id: "phy", name: "Physics",   icon: <Wind size={16} />,   color: "#6366f1", bg: "#eef2ff" },
  { id: "che", name: "Chemistry", icon: <Beaker size={16} />, color: "#10b981", bg: "#ecfdf5" },
  { id: "mat", name: "Maths",     icon: <Binary size={16} />, color: "#8b5cf6", bg: "#f5f3ff" },
  { id: "bio", name: "Biology",   icon: <Atom size={16} />,   color: "#ec4899", bg: "#fdf2f8" },
];

const RESOURCE_TYPES = [
  { id: "Notes",    label: "Notes",    icon: <BookOpen size={12} /> },
  { id: "PYQs",     label: "PYQs",     icon: <HelpCircle size={12} /> },
  { id: "Formulas", label: "Formulas", icon: <Sigma size={12} /> },
];

const QUICK_LINKS = [
  { title: "My Tests",      desc: "View & manage sessions",    icon: <FileText size={18} />,   path: "/admin/tests",       color: "#6366f1", bg: "#eef2ff" },
  { title: "Create Test",   desc: "AI-powered & manual",       icon: <PlusCircle size={18} />, path: "/admin/pdf",         color: "#7c3aed", bg: "#f5f3ff" },
  { title: "Performance",   desc: "Grades & analytics",        icon: <BarChart3 size={18} />,  path: "/admin/performance", color: "#10b981", bg: "#ecfdf5" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseURL  = import.meta.env.VITE_API_BASE_URL;

  const [subject,    setSubject]    = useState(null);
  const [resType,    setResType]    = useState("Notes");
  const [status,     setStatus]     = useState("idle"); // idle | staged | uploading | success
  const [progress,   setProgress]   = useState(0);
  const [file,       setFile]       = useState(null);
  const [batchIds,   setBatchIds]   = useState([]);
  const [batches,    setBatches]    = useState([]);
  const [batchLoad,  setBatchLoad]  = useState(true);
  const [toast,      setToast]      = useState(null);
  const fileRef = useRef(null);

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
    if (!subject) return notify("Select a subject first", "error");
    fileRef.current.click();
  };

  const onFileChange = e => {
    const f = e.target.files[0];
    if (f) { setFile(f); setStatus("staged"); }
  };

  const upload = async () => {
    if (!file || !subject) return;
    if (!batchIds.length) return notify("Select at least one batch", "error");
    setStatus("uploading"); setProgress(0);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("subjectId", subject);
    fd.append("category", resType);
    fd.append("batchIds", JSON.stringify(batchIds));
    const iv = setInterval(() => setProgress(p => p >= 95 ? 95 : p + 5), 150);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/upload-material`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setProgress(100);
        setTimeout(() => { setStatus("success"); notify(`${file.name} deployed!`); }, 400);
      } else throw new Error(data.message || "Upload failed");
    } catch (err) { notify(err.message || "Network error", "error"); reset(); }
    finally { clearInterval(iv); }
  };

  const reset = () => { setFile(null); setBatchIds([]); setStatus("idle"); setProgress(0); };

  /* ── styles ── */
  const S = {
    card: { background: "#fff", borderRadius: 16, border: "1.5px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
    label: { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" },
  };

  return (
    <AdminLayout>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(" ")[0] || "Admin"} 👋`}
        subtitle="Here's your admin overview"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "5px 12px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px #bbf7d0" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Sync</span>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "24px clamp(16px,3vw,28px) 48px" }} className="page-enter">

        {/* ── Quick links ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          {QUICK_LINKS.map((q, i) => (
            <button key={i} onClick={() => navigate(q.path)} style={{
              all: "unset", ...S.card, padding: "18px 20px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 14,
              transition: "all 0.18s",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${q.color}18`; e.currentTarget.style.borderColor = q.color + "40"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: q.bg, color: q.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {q.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{q.title}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{q.desc}</div>
              </div>
              <ArrowRight size={14} style={{ color: "#d1d5db", marginLeft: "auto", flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* ── Upload panel ── */}
        <div style={{ ...S.card, overflow: "hidden" }}>
          {/* Panel header */}
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Upload size={16} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Deploy Study Material</div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Upload PDFs to student vaults</div>
              </div>
            </div>
            {/* Resource type pills */}
            <div style={{ display: "flex", gap: 6 }}>
              {RESOURCE_TYPES.map(r => (
                <button key={r.id} onClick={() => setResType(r.id)} style={{
                  all: "unset", display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: resType === r.id ? "#7c3aed" : "#f9fafb",
                  color:      resType === r.id ? "#fff"    : "#64748b",
                  border:     `1.5px solid ${resType === r.id ? "#7c3aed" : "#e5e7eb"}`,
                  boxShadow:  resType === r.id ? "0 2px 8px rgba(124,58,237,0.22)" : "none",
                  transition: "all 0.15s",
                }}>
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Two-col body */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>

            {/* Left: subject + batches */}
            <div style={{ padding: 22, borderRight: "1px solid #f5f5f5" }}>
              <div style={{ marginBottom: 22 }}>
                <div style={{ ...S.label, marginBottom: 10 }}>Subject</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SUBJECTS.map(s => (
                    <button key={s.id} onClick={() => status === "idle" && setSubject(s.id)} style={{
                      all: "unset", padding: "10px 12px", borderRadius: 11, cursor: "pointer",
                      border: `2px solid ${subject === s.id ? s.color : "#e5e7eb"}`,
                      background: subject === s.id ? s.bg : "#fafafa",
                      display: "flex", alignItems: "center", gap: 9, transition: "all 0.15s",
                      boxShadow: subject === s.id ? `0 0 0 3px ${s.color}15` : "none",
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {s.icon}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: subject === s.id ? s.color : "#374151" }}>{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ ...S.label, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={11} /> Batches
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {batchLoad
                    ? <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />Loading…</span>
                    : batches.length === 0
                      ? <span style={{ fontSize: 12, color: "#d1d5db" }}>No batches found</span>
                      : batches.map(b => (
                          <button key={b._id} onClick={() => (status === "idle" || status === "staged") && toggleBatch(b._id)} style={{
                            all: "unset", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            background: batchIds.includes(b._id) ? "#7c3aed" : "#fff",
                            color:      batchIds.includes(b._id) ? "#fff"    : "#64748b",
                            border:     `1.5px solid ${batchIds.includes(b._id) ? "#7c3aed" : "#e5e7eb"}`,
                            boxShadow:  batchIds.includes(b._id) ? "0 2px 8px rgba(124,58,237,0.22)" : "none",
                            transition: "all 0.15s",
                          }}>{b.name}</button>
                        ))
                  }
                </div>
              </div>
            </div>

            {/* Right: dropzone */}
            <div style={{ padding: 22, display: "flex", flexDirection: "column" }}>
              <div style={{ ...S.label, marginBottom: 10 }}>Upload File</div>
              <input type="file" ref={fileRef} onChange={onFileChange} style={{ display: "none" }} accept=".pdf" />

              <div style={{
                flex: 1, minHeight: 200, borderRadius: 14, transition: "all 0.25s",
                border: `2px dashed ${status === "success" ? "#22c55e" : status === "staged" ? "#7c3aed" : "#e5e7eb"}`,
                background: status === "success" ? "#f0fdf4" : status === "staged" ? "#faf5ff" : "#fafafa",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "24px 20px", textAlign: "center",
              }}>
                {/* Icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 14,
                  background: status === "success" ? "#22c55e" : status === "staged" ? "#7c3aed" : "#f3f4f6",
                  color: (status === "success" || status === "staged") ? "#fff" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: status === "staged" ? "0 6px 20px rgba(124,58,237,0.3)" : status === "success" ? "0 6px 20px rgba(34,197,94,0.28)" : "none",
                  transition: "all 0.25s",
                }}>
                  {status === "success"  ? <CheckCircle2 size={22} />
                    : status === "uploading" ? <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                    : status === "staged"   ? <FileText size={22} />
                    : <Upload size={22} />}
                </div>

                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 4, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {status === "success" ? "Deployed!" : file ? file.name : "Select a PDF"}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 18, fontWeight: 500 }}>
                  {status === "success"  ? "Available in student vault"
                    : status === "staged" ? `Ready · ${batchIds.length} batch${batchIds.length !== 1 ? "es" : ""}`
                    : "PDF only · max 20 MB"}
                </div>

                {status === "uploading" ? (
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 8 }}>
                      <span>Uploading…</span><span>{progress}%</span>
                    </div>
                    <div style={{ width: "100%", height: 5, background: "#ede9fe", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#6366f1)", borderRadius: 99, width: `${progress}%`, transition: "width 0.3s" }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                    <button onClick={() => status === "staged" ? upload() : status === "success" ? reset() : pickFile()} style={{
                      all: "unset", width: "100%", padding: 11, borderRadius: 10, cursor: "pointer",
                      fontWeight: 700, fontSize: 13, textAlign: "center",
                      background: status === "success" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#7c3aed,#6366f1)",
                      color: "#fff", boxSizing: "border-box",
                      boxShadow: status === "success" ? "0 4px 14px rgba(34,197,94,0.3)" : "0 4px 16px rgba(124,58,237,0.35)",
                      transition: "opacity 0.15s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      {status === "success" ? "+ Deploy Another" : status === "staged" ? "🚀 Start Deployment" : "Choose File"}
                    </button>
                    {status === "staged" && (
                      <button onClick={reset} style={{ all: "unset", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                        <Trash2 size={11} /> Discard
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 200, minWidth: 280, maxWidth: 380 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)", border: "1.5px solid",
            background: toast.type === "error" ? "#fff1f2" : "#fff",
            borderColor: toast.type === "error" ? "#fecdd3" : "#e5e7eb",
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: toast.type === "error" ? "#fecdd3" : "#ede9fe", flexShrink: 0 }}>
              <Bell size={14} style={{ color: toast.type === "error" ? "#be123c" : "#7c3aed" }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: toast.type === "error" ? "#be123c" : "#0f172a", flex: 1 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ all: "unset", cursor: "pointer", color: "#94a3b8", lineHeight: 0 }}><X size={13} /></button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}