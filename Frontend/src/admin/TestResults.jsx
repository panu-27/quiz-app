/**
 * TestResults.jsx  →  /admin/results
 * Dedicated page for viewing test analytics & leaderboards.
 * Separate from SeeTests so both have clean routes in the sidebar.
 */
import React, { useState, useEffect } from "react";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  FileText, ChevronRight, Trophy, Users, BarChart3,
  Search, Target, Loader2, Bell, Calendar, Clock,
} from "lucide-react";

const labelSt = { fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" };
const examBadge = (type = "") => {
  const m = {
    PCM:  { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    PCB:  { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    JEE:  { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    NEET: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    OTHER:{ bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
  };
  return m[type] || m.OTHER;
};

export default function TestResults() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [tests,          setTests]          = useState([]);
  const [loadingTests,   setLoadingTests]   = useState(true);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [analytics,      setAnalytics]      = useState(null);
  const [loadingAn,      setLoadingAn]      = useState(false);
  const [testSearch,     setTestSearch]     = useState("");
  const [stuSearch,      setStuSearch]      = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(`${baseURL}/teacher/my-tests`, { headers: { Authorization: `Bearer ${token}` } });
        setTests(await r.json().then(d => Array.isArray(d) ? d : []));
      } catch (e) { console.error(e); }
      finally { setLoadingTests(false); }
    })();
  }, [baseURL]);

  const selectTest = async test => {
    setSelectedTestId(test._id); setLoadingAn(true); setAnalytics(null);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${baseURL}/teacher/tests/${test._id}/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoadingAn(false); }
  };

  const filtered    = tests.filter(t => t.title?.toLowerCase().includes(testSearch.toLowerCase()));
  const filteredStu = analytics?.leaderboard?.filter(s => s.studentId.name.toLowerCase().includes(stuSearch.toLowerCase())) || [];

  return (
    <AdminLayout>
      <PageHeader
        title="Test Results"
        subtitle="Detailed analytics for every assessment"
        right={
          analytics
            ? <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f3ff", color: "#7c3aed", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "1px solid #ddd6fe" }}>
                <Bell size={11} /> {analytics.stats.attendancePercentage} Attendance
              </div>
            : null
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: 18, gap: 16 }} className="page-enter">
        {/* Left list */}
        <div style={{ width: 290, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={13} />
            <input value={testSearch} onChange={e => setTestSearch(e.target.value)} placeholder="Search tests…"
              style={{ width: "100%", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 10px 9px 32px", fontSize: 12, fontWeight: 500, color: "#374151", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
          {!loadingTests && <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, padding: "0 2px" }}>{filtered.length} test{filtered.length !== 1 ? "s" : ""}</div>}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
            {loadingTests
              ? <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><Loader2 size={20} style={{ color: "#7c3aed", animation: "spin 1s linear infinite" }} /></div>
              : filtered.map(test => {
                  const badge  = examBadge(test.examType);
                  const active = selectedTestId === test._id;
                  return (
                    <button key={test._id} onClick={() => selectTest(test)} style={{
                      all: "unset", textAlign: "left", padding: "13px 15px", borderRadius: 13, cursor: "pointer",
                      border: `1.5px solid ${active ? "#7c3aed" : "#e5e7eb"}`,
                      background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "#fff",
                      boxSizing: "border-box", width: "100%", transition: "all 0.15s",
                      boxShadow: active ? "0 4px 16px rgba(124,58,237,0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: active ? "#fff" : "#0f172a", lineHeight: 1.3 }}>{test.title}</div>
                        <span style={{ fontSize: 9, fontWeight: 800, color: active ? "#c4b5fd" : badge.color, background: active ? "rgba(255,255,255,0.15)" : badge.bg, padding: "2px 6px", borderRadius: 5, textTransform: "uppercase", flexShrink: 0 }}>
                          {test.examType}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 10, color: active ? "#c4b5fd" : "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                          <Calendar size={9} />{new Date(test.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        <ChevronRight size={11} style={{ color: active ? "#c4b5fd" : "#d1d5db", marginLeft: "auto" }} />
                      </div>
                    </button>
                  );
                })
            }
          </div>
        </div>

        {/* Right analytics */}
        <div style={{ flex: 1, background: "#fff", borderRadius: 16, border: "1.5px solid #f0f0f0", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {loadingAn ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={22} style={{ color: "#7c3aed", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading…</span>
            </div>
          ) : analytics ? (
            <>
              <div style={{
                padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
                background: "#fafafa", flexShrink: 0, position: "relative", overflow: "hidden",
              }}>
                {/* Accent stripe */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#7c3aed,#6366f1,#8b5cf6)" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", flex: 1 }}>{analytics.testTitle}</h2>
                  {/* ✅ EXAM TYPE — prominently shown */}
                  {(() => {
                    const t = tests.find(t => t._id === selectedTestId);
                    if (!t?.examType) return null;
                    const badge = examBadge(t.examType);
                    return (
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: "5px 13px", borderRadius: 99,
                        background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}`,
                        letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0,
                      }}>{t.examType}</span>
                    );
                  })()}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "Attended",   val: analytics.stats.attended,             color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
                    { label: "Absent",     val: analytics.stats.absent,               color: "#ef4444", bg: "#fff1f2", border: "#fecdd3" },
                    { label: "Avg Score",  val: analytics.stats.averageScore,         color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
                    { label: "Attendance", val: analytics.stats.attendancePercentage, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, background: s.bg, color: s.color, padding: "6px 12px", borderRadius: 9, border: `1px solid ${s.border}` }}>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{s.val}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <div style={{ ...labelSt, marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}><Trophy size={12} style={{ color: "#f59e0b" }} /> Leaderboard</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                    {analytics.leaderboard.slice(0, 3).map((e, i) => (
                      <div key={e._id} style={{ background: i === 0 ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "#fafafa", border: `1.5px solid ${i === 0 ? "#7c3aed" : "#e5e7eb"}`, borderRadius: 13, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 6, boxShadow: i === 0 ? "0 4px 16px rgba(124,58,237,0.25)" : "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: i === 0 ? "#c4b5fd" : "#9ca3af", textTransform: "uppercase" }}>#{i + 1} {["🏆","🥈","🥉"][i]}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? "#fff" : "#0f172a" }}>{e.studentId.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: i === 0 ? "#e9d5ff" : "#7c3aed" }}>{e.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ ...labelSt, display: "flex", alignItems: "center", gap: 5 }}><Users size={12} style={{ color: "#7c3aed" }} /> All Scores</div>
                    <div style={{ position: "relative" }}>
                      <Search style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} size={12} />
                      <input value={stuSearch} onChange={e => setStuSearch(e.target.value)} placeholder="Filter student…"
                        style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "5px 10px 5px 26px", fontSize: 11, outline: "none", width: 160, fontWeight: 500 }}
                        onFocus={e => e.target.style.borderColor = "#7c3aed"}
                        onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {filteredStu.map((e, idx) => (
                      <div key={e._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: idx % 2 === 0 ? "#fafafa" : "#fff", border: "1px solid #f3f4f6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#ede9fe", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                            {e.studentId.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{e.studentId.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{(e.timeTaken / 60).toFixed(1)}m</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed", minWidth: 40, textAlign: "right", background: "#f5f3ff", padding: "3px 9px", borderRadius: 7 }}>{e.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {analytics.absentees?.length > 0 && (
                  <div style={{ paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
                    <div style={{ ...labelSt, color: "#ef4444", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><Target size={12} /> Absentees ({analytics.stats.absent})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {analytics.absentees.map(s => (
                        <span key={s._id} style={{ padding: "5px 12px", background: "#fff1f2", color: "#ef4444", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "1.5px solid #fecdd3" }}>{s.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <BarChart3 size={26} style={{ color: "#cbd5e1" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Select a test</div>
              <p style={{ fontSize: 12, color: "#94a3b8", maxWidth: 220, lineHeight: 1.7, margin: 0 }}>
                Pick any test from the left to view its analytics.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
