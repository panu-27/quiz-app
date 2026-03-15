import React, { useState, useEffect } from "react";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  FileText, ChevronRight, Trophy, Users, BarChart3,
  Search, Target, Loader2, Bell, Calendar, Clock,
  CheckCircle2, XCircle, TrendingUp, FileDown,
} from "lucide-react";

/* ── helpers ── */
const examBadge = (type = "") => {
  const m = {
    PCM: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe" },
    PCB: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
    JEE: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    NEET: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    OTHER: { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
  };
  return m[type] || m.OTHER;
};
const medalColor = (i) => ["#f59e0b", "#94a3b8", "#cd7c3e"][i] || "#e5e7eb";
const AVATAR_COLORS = ["#ede9fe", "#dbeafe", "#dcfce7", "#fef9c3", "#ffe4e6"];

/* ── subject chip colors — cycles through a palette ── */
const CHIP_PALETTE = [
  { bg: "#f5f3ff", color: "#6d28d9", border: "#ede9fe" },
  { bg: "#eff6ff", color: "#1d4ed8", border: "#dbeafe" },
  { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  { bg: "#fdf2f8", color: "#9d174d", border: "#fbcfe8" },
];
const chipColor = (i) => CHIP_PALETTE[i % CHIP_PALETTE.length];

/* ── jsPDF loader ── */
const loadJsPDF = (() => {
  let promise = null;
  return () => {
    if (promise) return promise;
    promise = new Promise((resolve) => {
      if (window.jspdf) return resolve(window.jspdf);
      const s1 = document.createElement("script");
      s1.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s1.onload = () => {
        const s2 = document.createElement("script");
        s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
        s2.onload = () => resolve(window.jspdf);
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
    return promise;
  };
})();

/* ── PDF generator ── */
async function generatePDF(analytics, selectedTest) {
  const { jsPDF } = await loadJsPDF();
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = 210, PH = 297, M = 18;
  let y = 0;

  const coachingName = analytics.coachingName || "Coaching Class";
  const maxScore = analytics.maxScore || 50;
  const avgScoreRounded = Math.round(analytics.stats.averageScore);
  const purple = [109, 40, 217], dark = [15, 23, 42], muted = [148, 163, 184];
  const white = [255, 255, 255], red = [239, 68, 68], green = [16, 185, 129], amber = [245, 158, 11];

  doc.setFillColor(...purple);
  doc.rect(0, 0, PW, 38, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...white);
  doc.text(coachingName.toUpperCase(), M, 16);
  doc.setFontSize(8); doc.setTextColor(196, 181, 253);
  doc.text("Nexus Assessment Report", M, 22);
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  doc.text(`Generated: ${dateStr}`, PW - M, 16, { align: "right" });
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...white);
  doc.text(analytics.testTitle || "Test Report", M, 33);
  y = 48;

  if (selectedTest) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...muted);
    const meta = [
      selectedTest.startTime && `Date: ${new Date(selectedTest.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
      selectedTest.duration && `Duration: ${selectedTest.duration} min`,
      selectedTest.examType && `Pattern: ${selectedTest.examType}`,
      `Max Marks: ${maxScore}`
    ].filter(Boolean).join("    ·    ");
    doc.text(meta, M, y); y += 8;
  }

  doc.setDrawColor(235, 233, 245); doc.setLineWidth(0.3); doc.line(M, y, PW - M, y); y += 10;

  const stats = [
    { label: "Attended", val: String(analytics.stats.attended), c: purple },
    { label: "Absent", val: String(analytics.stats.absent), c: red },
    { label: "Avg Score", val: `${avgScoreRounded}/${maxScore}`, c: green },
    { label: "Attendance", val: `${analytics.stats.attendancePercentage}`, c: amber },
  ];
  const boxW = (PW - M * 2 - 9) / 4;
  stats.forEach((s, i) => {
    const bx = M + i * (boxW + 3);
    doc.setFillColor(248, 246, 255); doc.roundedRect(bx, y, boxW, 22, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(s.val.length > 5 ? 11 : 14); doc.setTextColor(...s.c);
    doc.text(s.val, bx + boxW / 2, y + 12, { align: "center" });
    doc.setFontSize(7); doc.setTextColor(...muted);
    doc.text(s.label.toUpperCase(), bx + boxW / 2, y + 18, { align: "center" });
  });
  y += 32;

  const top3 = [...(analytics.leaderboard || [])].filter(e => !e.isAbsent).sort((a, b) => b.score - a.score).slice(0, 3);
  if (top3.length) {
    if (y > PH - 60) { doc.addPage(); y = M; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...dark);
    doc.text("Top Performers", M, y); y += 8;
    const podW = (PW - M * 2 - 6) / 3;
    const medalRGB = [[245, 158, 11], [148, 163, 184], [205, 124, 62]];
    top3.forEach((e, i) => {
      const bx = M + i * (podW + 3), isFirst = i === 0;
      doc.setFillColor(...(isFirst ? purple : [249, 250, 251])); doc.roundedRect(bx, y, podW, 30, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...(isFirst ? [196, 181, 253] : medalRGB[i]));
      doc.text(`#${i + 1}`, bx + 5, y + 7);
      doc.setFontSize(9); doc.setTextColor(...(isFirst ? white : dark));
      const name = e.studentId?.name || "—";
      doc.text(doc.getTextWidth(name) > (podW - 10) ? name.slice(0, 12) + "…" : name, bx + 5, y + 16);
      const scoreVal = String(e.score);
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...(isFirst ? [233, 213, 255] : purple));
      doc.text(scoreVal, bx + 5, y + 25);
      doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(...(isFirst ? [196, 181, 253] : muted));
      doc.text(` / ${maxScore}`, bx + 5 + doc.getTextWidth(scoreVal) + 1.5, y + 25.5);
    });
    y += 40;
  }

  if (y > PH - 40) { doc.addPage(); y = M; }
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...dark);
  doc.text("Detailed Results", M, y); y += 4;

  // ── Build subject columns from blockStructure ──
  const subjectCols = [];
  for (const block of (analytics.blockStructure || [])) {
    for (const sec of (block.sections || [])) {
      subjectCols.push(sec.subjectName);
    }
  }

  const tableHead = ["#", "Student Name", "Total", "Time", ...subjectCols];
  const presentRows = (analytics.leaderboard || []).map((e, idx) => {
    const subScores = subjectCols.map(subName => {
      const found = (e.subjectScores || []).find(s => s.subjectName === subName);
      return found ? String(found.score) : "—";
    });
    return [
      idx + 1,
      e.studentId?.name || "—",
      `${e.score} / ${maxScore}`,
      `${(e.timeTaken / 60).toFixed(1)} min`,
      ...subScores,
    ];
  });
  const absentRows = (analytics.absentees || []).map((s, idx) => [
    presentRows.length + idx + 1,
    s.name || "—",
    "ABSENT",
    "—",
    ...subjectCols.map(() => "—"),
  ]);
  const tableBody = [...presentRows, ...absentRows];

  // Dynamic column widths: fixed cols + equal split for subjects
  const fixedW = 10 + 50 + 22 + 18; // #, name, total, time
  const subColW = subjectCols.length > 0
    ? Math.min(20, (PW - M * 2 - fixedW) / subjectCols.length)
    : 0;
  const colStyles = {
    0: { cellWidth: 10 },
    1: { cellWidth: 50 },
    2: { cellWidth: 22, fontStyle: "bold", halign: "center" },
    3: { cellWidth: 18, halign: "center" },
  };
  subjectCols.forEach((_, i) => {
    colStyles[4 + i] = { cellWidth: subColW, halign: "center" };
  });

  doc.autoTable({
    startY: y,
    head: [tableHead],
    body: tableBody,
    margin: { left: M, right: M, bottom: 20 }, theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: purple, textColor: white, fontStyle: "bold", fontSize: 7.5 },
    alternateRowStyles: { fillColor: [250, 249, 255] },
    columnStyles: colStyles,
    didParseCell: (data) => {
      if (data.column.index === 2 && data.cell.raw === "ABSENT")
        data.cell.styles.textColor = red;
    }
  });
  y = doc.lastAutoTable.finalY + 12;

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(...purple); doc.rect(0, PH - 10, PW, 10, "F");
    doc.setFontSize(7); doc.setTextColor(196, 181, 253);
    doc.text(`${coachingName} • Powered by Nexus`, M, PH - 4);
    doc.text(`Page ${i} of ${totalPages}`, PW - M, PH - 4, { align: "right" });
  }
  const fileName = `${analytics.testTitle.replace(/\s+/g, "_")}_Report.pdf`;
  doc.save(fileName);
}

/* ═══════════════════════════════════════════════════════ */
export default function SeeTests() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAn, setLoadingAn] = useState(false);
  const [testSearch, setTestSearch] = useState("");
  const [stuSearch, setStuSearch] = useState("");
  const [downloading, setDownloading] = useState(false);

  const selectTest = async (test) => {
    setSelectedTestId(test._id);
    setSelectedTest(test);
    setLoadingAn(true);
    setAnalytics(null);
    setStuSearch("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${baseURL}/teacher/tests/${test._id}/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      console.log("Fetched analytics for test", test._id, await r.clone().json());
      setAnalytics(await r.json());
    } catch (e) { console.error(e); }
    finally { setLoadingAn(false); }
  };

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(`${baseURL}/teacher/my-tests`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await r.json();
        console.log("Fetched tests:", data);
        const testList = Array.isArray(data) ? data : [];
        setTests(testList);
        if (testList.length > 0) selectTest(testList[0]);
      } catch (e) { console.error(e); }
      finally { setLoadingTests(false); }
    })();
  }, [baseURL]);

  const handleDownload = async () => {
    if (!analytics || downloading) return;
    setDownloading(true);
    try { await generatePDF(analytics, selectedTest); }
    catch (e) { console.error(e); alert("PDF generation failed. Try again."); }
    finally { setDownloading(false); }
  };

  const filtered = tests.filter(t => t.title?.toLowerCase().includes(testSearch.toLowerCase()));
  const allStudents = [
    ...(analytics?.leaderboard || []),
    ...(analytics?.absentees || []).map(s => ({
      _id: s._id,
      studentId: { _id: s._id, name: s.name, email: s.email, profilePic: s.profilePic },
      isAbsent: true,
    })),
  ];
  const filteredStu = allStudents.filter(s =>
    s.studentId?.name?.toLowerCase().includes(stuSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <PageHeader
        title="My Tests"
        subtitle="Select a test to view analytics"
        right={
          analytics ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={handleDownload} disabled={downloading} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: downloading ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#6366f1)",
                color: downloading ? "#7c3aed" : "#fff",
                padding: "6px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                border: "none", cursor: downloading ? "default" : "pointer",
                boxShadow: downloading ? "none" : "0 2px 10px rgba(109,40,217,0.28)",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (!downloading) e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {downloading
                  ? <><Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> Generating…</>
                  : <><FileDown size={13} /> Export PDF</>
                }
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f3ff", color: "#7c3aed", padding: "6px 12px", borderRadius: 9, fontSize: 12, fontWeight: 700, border: "1px solid #ddd6fe" }}>
                <Bell size={11} /> {analytics.stats.attendancePercentage} attendance
              </div>
            </div>
          ) : null
        }
      />

      <div style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        minHeight: 0,
      }} className="page-enter">

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 264, flexShrink: 0, display: "flex", flexDirection: "column",
          borderRight: "1px solid #ede9f6", background: "#fff", minHeight: 0,
        }} >
          <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #f3f0ff", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input
                value={testSearch} onChange={e => setTestSearch(e.target.value)} placeholder="Search tests…"
                style={{ width: "100%", boxSizing: "border-box", paddingLeft: 32, paddingRight: 10, paddingTop: 8, paddingBottom: 8, background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#374151", outline: "none", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            {!loadingTests && (
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500, marginTop: 8, paddingLeft: 2 }}>
                {filtered.length} test{filtered.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "8px" }} className='no-scrollbar'>
            {loadingTests ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <Loader2 size={20} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <FileText size={26} style={{ color: "#e5e7eb", display: "block", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 12, color: "#94a3b8" }}>No tests found</div>
              </div>
            ) : filtered.map(test => {
              const badge = examBadge(test.examType);
              const active = selectedTestId === test._id;
              return (
                <button key={test._id} onClick={() => selectTest(test)} style={{
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
                    <div style={{ fontWeight: 700, fontSize: 12, color: active ? "#fff" : "#0f172a", lineHeight: 1.35, flex: 1 }}>{test.title}</div>
                    <span style={{ fontSize: 8, fontWeight: 800, flexShrink: 0, padding: "2px 7px", borderRadius: 99, background: active ? "rgba(255,255,255,0.18)" : badge.bg, color: active ? "#e9d5ff" : badge.color, border: `1px solid ${active ? "transparent" : badge.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {test.examType}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: active ? "#c4b5fd" : "#94a3b8", fontWeight: 500 }}>
                      <Calendar size={9} />{new Date(test.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: active ? "#c4b5fd" : "#94a3b8", fontWeight: 500 }}>
                      <Clock size={9} />{test.duration} min
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
          {loadingAn ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={22} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading analytics…</span>
            </div>

          ) : analytics ? (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 18px 40px", display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Test header — unchanged */}
              <div style={{
                background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6",
                padding: "16px 20px", flexShrink: 0, position: "relative", overflow: "hidden",
                boxShadow: "0 2px 10px rgba(109,40,217,0.06)",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#7c3aed,#6366f1,#8b5cf6)" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>{analytics.testTitle}</h2>
                    {selectedTest && (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                          <Calendar size={10} style={{ color: "#a78bfa" }} />
                          {new Date(selectedTest.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                          <Clock size={10} style={{ color: "#a78bfa" }} />{selectedTest.duration} min
                        </span>
                        {selectedTest.totalMarks && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                            <TrendingUp size={10} style={{ color: "#a78bfa" }} />Max: {selectedTest.totalMarks}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedTest?.examType && (() => {
                    const badge = examBadge(selectedTest.examType);
                    return (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 99,
                          background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}`,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                        }}>{selectedTest.examType}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>exam pattern</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Stat cards — unchanged */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, flexShrink: 0 }}>
                {[
                  { label: "Attended", val: analytics.stats.attended, icon: <CheckCircle2 size={13} />, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
                  { label: "Absent", val: analytics.stats.absent, icon: <XCircle size={13} />, color: "#ef4444", bg: "#fff1f2", border: "#fecdd3" },
                  { label: "Avg Score", val: analytics.stats.averageScore, icon: <TrendingUp size={13} />, color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
                  { label: "Attendance", val: analytics.stats.attendancePercentage, icon: <Users size={13} />, color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "#fff", borderRadius: 13, border: `1.5px solid ${s.border}`,
                    padding: "13px 15px", display: "flex", flexDirection: "column", gap: 10,
                    boxShadow: `0 2px 8px ${s.color}0d`, transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 18px ${s.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 2px 8px ${s.color}0d`; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</span>
                      <div style={{ width: 27, height: 27, borderRadius: 8, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: "-0.6px", lineHeight: 1 }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* ── LEADERBOARD PODIUM — updated with subject scores ── */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 7 }}>
                  <Trophy size={13} style={{ color: "#f59e0b" }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Leaderboard</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>top performers</span>
                </div>
                <div style={{ padding: "12px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9 }}>
                  {analytics.leaderboard.slice(0, 3).map((e, i) => (
                    <div key={e._id} style={{
                      borderRadius: 13, padding: "13px 14px",
                      background: i === 0 ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "#f9fafb",
                      border: `1.5px solid ${i === 0 ? "#7c3aed" : "#e5e7eb"}`,
                      boxShadow: i === 0 ? "0 4px 16px rgba(124,58,237,0.22)" : "none",
                      display: "flex", flexDirection: "column", gap: 7,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: i === 0 ? "#c4b5fd" : medalColor(i) }}>#{i + 1}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? "#fff" : "#0f172a", lineHeight: 1.25 }}>
                        {e.studentId?.name}
                      </div>
                      {/* Total score */}
                      <div style={{ fontSize: 17, fontWeight: 800, color: i === 0 ? "#e9d5ff" : "#7c3aed", letterSpacing: "-0.3px" }}>
                        {e.score} <span style={{ fontSize: 18, fontWeight: 500, opacity: 0.7 }}>/</span> {analytics.maxScore || selectedTest.totalMarks}                      </div>
                      {/* ── Per-subject scores inside podium card ── */}
                      {e.subjectScores?.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 2 }}>
                          {e.subjectScores.map((s, si) => (
                            <div key={si} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              fontSize: 10, fontWeight: 600,
                              color: i === 0 ? "#c4b5fd" : "#64748b",
                            }}>
                              <span style={{
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                maxWidth: "65%", opacity: i === 0 ? 0.85 : 1,
                              }}>
                                {s.subjectName}
                              </span>
                              <span style={{
                                fontWeight: 800,
                                color: i === 0 ? "#e9d5ff" : "#7c3aed",
                                background: i === 0 ? "rgba(255,255,255,0.12)" : "#f5f3ff",
                                padding: "1px 6px", borderRadius: 5,
                                fontSize: 10,
                              }}>
                                {s.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── ALL SCORES — updated with subject chip rows ── */}
              <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #ede9f6", overflow: "hidden", flexShrink: 0 }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Users size={13} style={{ color: "#7c3aed" }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>All scores</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{(analytics?.leaderboard?.length || 0)} present · <span style={{ color: "#ef4444" }}>{(analytics?.absentees?.length || 0)} absent</span></span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
                    <input
                      value={stuSearch} onChange={e => setStuSearch(e.target.value)} placeholder="Filter student…"
                      style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 11, outline: "none", width: 348, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s" }}
                      onFocus={e => e.target.style.borderColor = "#a78bfa"}
                      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                    />
                  </div>
                </div>

                <div>
                  {filteredStu.map((e, idx) => (
                    <div
                      key={e._id}
                      style={{
                        borderBottom: idx < filteredStu.length - 1 ? "1px solid #f9fafb" : "none",
                        transition: "background 0.12s", cursor: "default",
                      }}
                      onMouseEnter={el => el.currentTarget.style.background = "#faf8ff"}
                      onMouseLeave={el => el.currentTarget.style.background = "transparent"}
                    >
                      {/* ── Main row: avatar + name + total score ── */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 16px 6px",
                        opacity: e.isAbsent ? 0.72 : 1,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {e.studentId?.profilePic ? (
                            <img
                              src={e.studentId.profilePic} alt=""
                              style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: e.isAbsent ? "2px solid #fecdd3" : "2px solid #ede9fe" }}
                            />
                          ) : (
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: e.isAbsent ? "#fff1f2" : AVATAR_COLORS[idx % AVATAR_COLORS.length],
                              color: e.isAbsent ? "#ef4444" : "#7c3aed",
                              display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0,
                              border: e.isAbsent ? "1.5px solid #fecdd3" : "none",
                            }}>
                              {e.studentId?.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: e.isAbsent ? "#94a3b8" : "#0f172a" }}>
                              {e.studentId?.name}
                            </div>
                            {e.isAbsent ? (
                              <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 500 }}>Did not attempt</div>
                            ) : (
                              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                                {(e.timeTaken / 60).toFixed(1)} min&nbsp;·&nbsp;
                                <span style={{ color: "#10b981" }}>{e.totalCorrect}✓</span>
                                {" "}
                                <span style={{ color: "#ef4444" }}>{e.totalWrong}✗</span>
                                {" "}
                                <span style={{ color: "#94a3b8" }}>{e.totalUnattempted}–</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Total score badge */}
                        {e.isAbsent ? (
                          <span style={{
                            fontSize: 11, fontWeight: 800, color: "#ef4444",
                            background: "#fff1f2", padding: "3px 10px",
                            borderRadius: 7, border: "1px solid #fecdd3",
                            flexShrink: 0,
                          }}>ABSENT</span>
                        ) : (
                          <span style={{
                            fontSize: 13, fontWeight: 800, color: "#7c3aed",
                            background: "#f5f3ff", padding: "3px 12px",
                            borderRadius: 7, border: "1px solid #ddd6fe",
                            flexShrink: 0,
                          }}>
                            {e.score}
                          </span>
                        )}
                      </div>

                      {/* ── Per-subject score chips ── */}
                      {!e.isAbsent && e.subjectScores?.length > 0 && (
                        <div style={{
                          paddingLeft: 56, paddingRight: 16, paddingBottom: 10,
                          display: "flex", flexWrap: "wrap", gap: 5,
                        }}>
                          {e.subjectScores.map((s, si) => {
                            const c = chipColor(si);
                            return (
                              <span key={si} style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                fontSize: 10, fontWeight: 600,
                                padding: "3px 9px", borderRadius: 6,
                                background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                              }}>
                                {s.subjectName}:
                                <span style={{ fontWeight: 800, color: c.color }}>{s.score}</span>
                                <span style={{ color: "#10b981", fontWeight: 500, fontSize: 9 }}>
                                  {s.correct}✓
                                </span>
                                {s.wrong > 0 && (
                                  <span style={{ color: "#ef4444", fontWeight: 500, fontSize: 9 }}>
                                    {s.wrong}✗
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Absentees — table format */}
              {analytics.absentees?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #fecdd3", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #fff1f2", display: "flex", alignItems: "center", gap: 7 }}>
                    <Target size={13} style={{ color: "#ef4444" }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>Absentees</span>
                    <span style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecdd3", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{analytics.stats.absent}</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#fff5f5" }}>
                          <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700, color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #fecdd3" }}>#</th>
                          <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700, color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #fecdd3" }}>Student</th>
                          <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 700, color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #fecdd3" }}>Email</th>
                          <th style={{ padding: "8px 16px", textAlign: "center", fontWeight: 700, color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #fecdd3" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.absentees.map((s, idx) => (
                          <tr key={s._id} style={{ borderBottom: idx < analytics.absentees.length - 1 ? "1px solid #fff1f2" : "none", transition: "background 0.1s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fffbfb"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding: "9px 16px", color: "#94a3b8", fontWeight: 600, fontSize: 11 }}>{idx + 1}</td>
                            <td style={{ padding: "9px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                {s.profilePic ? (
                                  <img src={s.profilePic} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid #fecdd3" }} />
                                ) : (
                                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff1f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, border: "1.5px solid #fecdd3" }}>
                                    {s.name?.[0]?.toUpperCase()}
                                  </div>
                                )}
                                <span style={{ fontWeight: 600, color: "#374151", fontSize: 12 }}>{s.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "9px 16px", color: "#94a3b8", fontSize: 11, fontWeight: 400 }}>{s.email}</td>
                            <td style={{ padding: "9px 16px", textAlign: "center" }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: "#ef4444", background: "#fff1f2", padding: "3px 10px", borderRadius: 99, border: "1px solid #fecdd3" }}>ABSENT</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
              <div style={{ width: 58, height: 58, borderRadius: 17, background: "#fff", border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <BarChart3 size={24} style={{ color: "#d1d5db" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Select a test</div>
              <p style={{ fontSize: 12, color: "#94a3b8", maxWidth: 200, lineHeight: 1.7, margin: 0, fontWeight: 400 }}>
                Pick any test from the left panel to view its analytics and leaderboard.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes nexusSpin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}