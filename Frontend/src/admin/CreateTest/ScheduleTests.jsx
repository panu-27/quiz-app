import React, { useState, useEffect, useMemo } from "react";
import AdminLayout, { PageHeader } from "../AdminLayout";
import {
  RefreshCw, Calendar, Clock, Users, Search, FileText,
  Loader2, CheckCircle2, X, AlertCircle, ChevronRight,
  Zap, ToggleLeft, ToggleRight, BookOpen,
} from "lucide-react";

const examBadge = (type = "") => {
  const m = {
    PCM:   { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    PCB:   { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    JEE:   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    NEET:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    OTHER: { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
  };
  return m[type] || m.OTHER;
};

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

/* ── Confirmation modal ── */
function ConfirmModal({ test, scheduled, startDate, startTime, onConfirm, onCancel, submitting, success }) {
  let timeLabel = "immediately";
  if (scheduled && startDate) {
    const d = new Date(`${startDate}T${startTime || "00:00"}`);
    timeLabel = d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, background: "rgba(15,23,42,0.55)",
      backdropFilter: "blur(6px)",
      fontFamily: "'DM Sans', sans-serif",
    }}
      onClick={e => { if (e.target === e.currentTarget && !submitting) onCancel(); }}
    >
      <div style={{
        background: "#fff", width: "100%", maxWidth: 400, borderRadius: 20,
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden",
      }}>
        {/* header */}
        <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #f3f0ff", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#7c3aed,#6366f1,#8b5cf6)" }} />
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
                Confirm Reinitialize
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                Are you sure?
              </h3>
            </div>
            <button onClick={onCancel} disabled={submitting} style={{
              all: "unset", cursor: submitting ? "not-allowed" : "pointer",
              padding: 6, borderRadius: 8, background: "#f3f4f6", lineHeight: 0, flexShrink: 0,
            }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#fee2e2"; }}
              onMouseLeave={e => e.currentTarget.style.background = "#f3f4f6"}
            >
              <X size={15} style={{ color: "#6b7280" }} />
            </button>
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "18px 22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* test name highlight */}
          <div style={{ background: "#f5f3ff", border: "1.5px solid #ede9fe", borderRadius: 11, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Test</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{test?.title}</div>
          </div>

          {/* go live info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: scheduled ? "#fffbeb" : "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {scheduled ? <Calendar size={13} style={{ color: "#d97706" }} /> : <Zap size={13} style={{ color: "#16a34a" }} />}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>
                {scheduled ? "Scheduled to go live" : "Goes live immediately"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, lineHeight: 1.5 }}>
                {scheduled
                  ? <>This test will become active on <strong style={{ color: "#0f172a" }}>{timeLabel}</strong> and close 4 hours after start.</>
                  : <>This test will become <strong style={{ color: "#16a34a" }}>active right now</strong> and close in 4 hours.</>
                }
              </div>
            </div>
          </div>

          {success ? (
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#ecfdf5", border: "1.5px solid #a7f3d0", borderRadius: 11, padding: "11px 14px" }}>
              <CheckCircle2 size={14} style={{ color: "#059669", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#047857" }}>Scheduled successfully!</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <button onClick={onCancel} disabled={submitting} style={{
                flex: 1, padding: "11px", borderRadius: 11, border: "1.5px solid #e5e7eb",
                background: "transparent", color: "#374151", fontSize: 12, fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.13s",
              }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </button>
              <button onClick={onConfirm} disabled={submitting} style={{
                flex: 2, padding: "11px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                borderRadius: 11, border: "none",
                background: submitting ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#6366f1)",
                color: submitting ? "#7c3aed" : "#fff",
                fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: submitting ? "none" : "0 4px 14px rgba(109,40,217,0.3)",
                transition: "all 0.15s",
              }}>
                {submitting
                  ? <><Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> Scheduling…</>
                  : <><Zap size={13} /> {scheduled ? "Confirm & Schedule" : "Go Live Now"}</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
export default function ScheduleTests() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const today   = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [tests,        setTests]        = useState([]);
  const [batches,      setBatches]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState(null);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const [form, setForm] = useState({
    batchIds:  [],
    scheduled: false,
    startDate: "", startTime: "",
    endDate:   "", endTime:   "",
  });

  useEffect(() => {
    (async () => {
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [tRes, bRes] = await Promise.all([
          fetch(`${baseURL}/teacher/get-crafted`, { headers }),
          fetch(`${baseURL}/teacher/my-batches`,  { headers }),
        ]);
        const tData = await tRes.json();
        const bData = await bRes.json();
        const testList = Array.isArray(tData) ? tData : tData.tests || [];
        setBatches(Array.isArray(bData) ? bData : bData.batches || []);
        setTests(testList);
        // auto-select first test so right panel is never empty
        if (testList.length > 0) openPanel(testList[0]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [baseURL]);

  const filtered = tests.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  const openPanel = (test) => {
    setSelectedTest(test);
    setForm({ batchIds: [], scheduled: false, startDate: "", startTime: "", endDate: "", endTime: "" });
    setSuccess(false);
    setError(null);
    setShowConfirm(false);
  };

  const toggleBatch = (id) =>
    setForm(f => ({
      ...f,
      batchIds: f.batchIds.includes(id)
        ? f.batchIds.filter(b => b !== id)
        : [...f.batchIds, id],
    }));

  const handleSubmitClick = () => {
    if (!form.batchIds.length) return setError("Select at least one batch.");
    if (form.scheduled && !form.startDate) return setError("Start date is required when scheduling.");
    setError(null);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    let startTime, endTime;
    if (form.scheduled) {
      startTime = new Date(`${form.startDate}T${form.startTime || "00:00"}`);
      endTime   = form.endDate
        ? new Date(`${form.endDate}T${form.endTime || "23:59"}`)
        : new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
    } else {
      startTime = new Date();
      endTime   = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
    }
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          testId:    selectedTest._id,
          batchIds:  form.batchIds,
          startTime: startTime.toISOString(),
          endTime:   endTime.toISOString(),
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setShowConfirm(false);
          setSuccess(false);
          openPanel(selectedTest);
        }, 1800);
      } else {
        const e = await res.json();
        setError(e.message || "Failed to schedule.");
        setShowConfirm(false);
      }
    } catch {
      setError("Network error. Try again.");
      setShowConfirm(false);
    } finally { setSubmitting(false); }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Reinitialize Test"
        subtitle="Reschedule a crafted test for new batches with a fresh time window"
      />

      <div style={{
        flex: 1, display: "flex", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif", minHeight: 0,
      }} className="page-enter">

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 264, flexShrink: 0, display: "flex", flexDirection: "column",
          borderRight: "1px solid #ede9f6", background: "#fff", minHeight: 0,
        }}>
          <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #f3f0ff", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tests…"
                style={{ width: "100%", boxSizing: "border-box", paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#374151", outline: "none", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e  => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            {!loading && (
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginTop: 8, paddingLeft: 2 }}>
                {filtered.length} test{filtered.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "8px" }}>
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <Loader2 size={20} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <FileText size={26} style={{ color: "#e5e7eb", display: "block", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 12, color: "#94a3b8" }}>No tests found</div>
              </div>
            ) : filtered.map(test => {
              const badge  = examBadge(test.examType);
              const active = selectedTest?._id === test._id;
              return (
                <button key={test._id} onClick={() => openPanel(test)} style={{
                  all: "unset", display: "block", width: "100%", boxSizing: "border-box",
                  padding: "10px 12px", borderRadius: 11, cursor: "pointer", marginBottom: 3,
                  border: `1.5px solid ${active ? "#7c3aed" : "transparent"}`,
                  background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent",
                  transition: "all 0.13s",
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f5f3ff"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: active ? "#fff" : "#0f172a", lineHeight: 1.35, flex: 1 }}>
                      {test.title}
                    </div>
                    <span style={{
                      fontSize: 8, fontWeight: 800, flexShrink: 0, padding: "2px 7px", borderRadius: 99,
                      background: active ? "rgba(255,255,255,0.18)" : badge.bg,
                      color: active ? "#e9d5ff" : badge.color,
                      border: `1px solid ${active ? "transparent" : badge.border}`,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      {test.examType || "Custom"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: active ? "#c4b5fd" : "#94a3b8", fontWeight: 500 }}>
                      <Clock size={9} />{test.duration ?? "—"} min
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: active ? "#c4b5fd" : "#94a3b8", fontWeight: 500 }}>
                      <Calendar size={9} />{fmtDate(test.createdAt)}
                    </span>
                    <ChevronRight size={10} style={{ color: active ? "#c4b5fd" : "#d1d5db", marginLeft: "auto" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", background: "#f4f3fa", minHeight: 0,
        }}>
          {!selectedTest && !loading ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
              <div style={{ width: 58, height: 58, borderRadius: 17, background: "#fff", border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <RefreshCw size={24} style={{ color: "#d1d5db" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Select a test</div>
              <p style={{ fontSize: 12, color: "#94a3b8", maxWidth: 200, lineHeight: 1.7, margin: 0 }}>
                Pick any crafted test from the left panel to reinitialize it.
              </p>
            </div>
          ) : loading ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Loader2 size={22} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 18px 40px", display: "flex", flexDirection: "column", gap: 12 }}>

              {/* ── Test header card ── */}
              <div style={{
                background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6",
                padding: "16px 20px", flexShrink: 0, position: "relative", overflow: "hidden",
                boxShadow: "0 2px 10px rgba(109,40,217,0.06)",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#7c3aed,#6366f1,#8b5cf6)" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>
                      {selectedTest.title}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                        <Clock size={10} style={{ color: "#a78bfa" }} />{selectedTest.duration ?? "—"} min
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                        <Calendar size={10} style={{ color: "#a78bfa" }} />{fmtDate(selectedTest.createdAt)}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                        <BookOpen size={10} style={{ color: "#a78bfa" }} />{selectedTest.mode}
                      </span>
                    </div>
                  </div>
                  {selectedTest.examType && (() => {
                    const badge = examBadge(selectedTest.examType);
                    return (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 99, background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}`, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          {selectedTest.examType}
                        </span>
                        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>exam pattern</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ── Batch selection card ── */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6", overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 10px rgba(109,40,217,0.04)" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 7 }}>
                  <Users size={13} style={{ color: "#7c3aed" }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Assign Batches</span>
                  {form.batchIds.length > 0 && (
                    <span style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                      {form.batchIds.length} selected
                    </span>
                  )}
                </div>
                <div style={{ padding: "12px 16px" }}>
                  {batches.length === 0 ? (
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>No batches found.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {Object.entries(
                        batches.reduce((acc, b) => {
                          const c = b.className || "General Class";
                          if (!acc[c]) acc[c] = [];
                          acc[c].push(b);
                          return acc;
                        }, {})
                      ).map(([cName, classBatches]) => (
                        <div key={cName}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>{cName}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                            {classBatches.map(b => {
                              const sel = form.batchIds.includes(b._id);
                              return (
                                <button key={b._id} onClick={() => toggleBatch(b._id)} style={{
                                  padding: "6px 14px", borderRadius: 9, cursor: "pointer",
                                  fontSize: 11, fontWeight: 700,
                                  border: `1.5px solid ${sel ? "transparent" : "#e5e7eb"}`,
                                  background: sel ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent",
                                  color: sel ? "#fff" : "#6b7280",
                                  boxShadow: sel ? "0 2px 10px rgba(109,40,217,0.25)" : "none",
                                  transition: "all 0.13s",
                                }}
                                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "#f5f3ff"; }}
                                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                                >
                                  {b.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Schedule timing card — ALWAYS VISIBLE, faded when off ── */}
              <div style={{
                background: "#fff", borderRadius: 14,
                border: `1.5px solid ${form.scheduled ? "#ddd6fe" : "#ede9f6"}`,
                overflow: "hidden", flexShrink: 0,
                boxShadow: "0 2px 10px rgba(109,40,217,0.04)",
                transition: "border-color 0.2s",
              }}>
                {/* toggle row */}
                <button onClick={() => setForm(f => ({
                  ...f, scheduled: !f.scheduled,
                  startDate: "", startTime: "", endDate: "", endTime: "",
                }))} style={{
                  all: "unset", width: "100%", boxSizing: "border-box",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", cursor: "pointer",
                  borderBottom: "1px solid #f3f0ff",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: form.scheduled ? "#f5f3ff" : "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                      <Calendar size={14} style={{ color: form.scheduled ? "#7c3aed" : "#94a3b8", transition: "color 0.2s" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.scheduled ? "#5b21b6" : "#374151", transition: "color 0.2s" }}>
                        Schedule for later
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                        {form.scheduled ? "Set a custom start & end time" : "Toggle on to set a custom time"}
                      </div>
                    </div>
                  </div>
                  {form.scheduled
                    ? <ToggleRight size={24} style={{ color: "#7c3aed", flexShrink: 0 }} />
                    : <ToggleLeft  size={24} style={{ color: "#d1d5db", flexShrink: 0 }} />
                  }
                </button>

                {/* date/time pickers — always rendered, faded + pointer-events off when scheduled=false */}
                <div style={{
                  padding: "16px 16px 18px",
                  display: "flex", flexDirection: "column", gap: 14,
                  opacity: form.scheduled ? 1 : 0.35,
                  pointerEvents: form.scheduled ? "auto" : "none",
                  transition: "opacity 0.25s",
                }}>
                  {[
                    { label: "Start time", required: true,  dot: "#10b981", dateKey: "startDate", timeKey: "startTime", minDate: today,                  hint: null },
                    { label: "End time",   required: false, dot: "#a78bfa", dateKey: "endDate",   timeKey: "endTime",   minDate: form.startDate || today, hint: "Optional — defaults to start + 4 hrs" },
                  ].map(({ label, required, dot, dateKey, timeKey, minDate, hint }) => (
                    <div key={dateKey}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                        {required  && <span style={{ fontSize: 10, color: "#ef4444" }}>*</span>}
                        {!required && <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>optional</span>}
                      </div>
                      <div style={{
                        display: "flex", gap: 8,
                        background: "transparent", border: "1.5px solid #e5e7eb",
                        borderRadius: 10, padding: "9px 13px", transition: "border-color 0.15s",
                      }}
                        onFocusCapture={e => { if (form.scheduled) e.currentTarget.style.borderColor = "#a78bfa"; }}
                        onBlurCapture={e  => e.currentTarget.style.borderColor = "#e5e7eb"}
                      >
                        <input type="date" min={minDate} value={form[dateKey]}
                          onChange={e => setForm(f => ({ ...f, [dateKey]: e.target.value }))}
                          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}
                        />
                        <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />
                        <input type="time" value={form[timeKey]}
                          onChange={e => setForm(f => ({ ...f, [timeKey]: e.target.value }))}
                          style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, fontWeight: 600, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}
                        />
                      </div>
                      {hint && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>{hint}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Immediate live notice — shown when scheduled OFF ── */}
              <div style={{
                display: "flex", alignItems: "center", gap: 9,
                background: "#fff", border: "1.5px solid #ede9fe",
                borderRadius: 13, padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(109,40,217,0.05)",
                opacity: form.scheduled ? 0.35 : 1,
                transition: "opacity 0.25s",
                pointerEvents: form.scheduled ? "none" : "auto",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Zap size={13} style={{ color: "#7c3aed" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: "#5b21b6", lineHeight: 1.5 }}>
                  Goes live <strong style={{ fontWeight: 800 }}>immediately</strong> — window closes in 4 hours from now
                </span>
              </div>

              {/* ── Error ── */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#fff1f2", border: "1.5px solid #fecdd3", borderRadius: 13, padding: "12px 16px", flexShrink: 0 }}>
                  <AlertCircle size={13} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#dc2626" }}>{error}</span>
                </div>
              )}

              {/* ── Submit button ── */}
              <div style={{ flexShrink: 0 }}>
                <button onClick={handleSubmitClick} style={{
                  width: "100%", padding: "13px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  border: "none", borderRadius: 13, cursor: "pointer",
                  background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                  color: "#fff", fontSize: 12, fontWeight: 800,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  boxShadow: "0 4px 16px rgba(109,40,217,0.28)",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <Zap size={14} />
                  {form.scheduled ? "Confirm & Schedule" : "Go Live Now"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Confirmation modal ── */}
      {showConfirm && (
        <ConfirmModal
          test={selectedTest}
          scheduled={form.scheduled}
          startDate={form.startDate}
          startTime={form.startTime}
          onConfirm={handleConfirm}
          onCancel={() => { if (!submitting) setShowConfirm(false); }}
          submitting={submitting}
          success={success}
        />
      )}

      <style>{`@keyframes nexusSpin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}