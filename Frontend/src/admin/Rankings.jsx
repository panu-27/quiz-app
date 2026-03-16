import React, { useState, useEffect } from "react";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  Trophy, Users, Search, Loader2, MapPin, Percent, Zap,
  LayoutGrid, ChevronRight, Award, TrendingUp
} from "lucide-react";

/* ── UI Constants ── */
const AVATAR_COLORS = ["#ede9fe", "#dbeafe", "#dcfce7", "#fef9c3", "#ffe4e6"];
const CHIP_PALETTE = [
  { bg: "#f5f3ff", color: "#6d28d9", border: "#ede9fe" },
  { bg: "#eff6ff", color: "#1d4ed8", border: "#dbeafe" },
  { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
];
const chipColor = (i) => CHIP_PALETTE[i % CHIP_PALETTE.length];

const medalStyle = (rank) => {
  const n = parseInt(rank);
  if (n === 1) return { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", glow: "rgba(245,158,11,0.22)" };
  if (n === 2) return { color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", glow: "rgba(148,163,184,0.18)" };
  if (n === 3) return { color: "#cd7c3e", bg: "#fff7ed", border: "#fed7aa", glow: "rgba(205,124,62,0.18)" };
  return { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", glow: "transparent" };
};

const rankLabel = (rank) => {
  if (!rank || rank === "N/A") return "N/A";
  const n = parseInt(String(rank));
  if (isNaN(n)) return String(rank);
  const sfx = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (sfx[(v - 20) % 10] || sfx[v] || sfx[0]);
};

/* ── Shimmer base ── */
const Shimmer = ({ w = "100%", h = 14, r = 8, style = {} }) => (
  <div className="shimmer" style={{ width: w, height: h, borderRadius: r, background: "#e2e8f0", flexShrink: 0, ...style }} />
);

/* ── YouTube-style skeleton loader ── */
function SkeletonLoader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Podium skeleton */}
      <div>
        <Shimmer w={120} h={11} r={6} style={{ marginBottom: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              borderRadius: 16,
              border: "1.5px solid #f1f5f9",
              overflow: "hidden",
              background: "#fff",
              transform: i === 1 ? "translateY(-8px)" : "none",
            }}>
              <div style={{ padding: "24px 20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <Shimmer w={i === 1 ? 90 : 74} h={i === 1 ? 90 : 74} r="50%" />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: "100%" }}>
                  <Shimmer w="60%" h={13} r={6} />
                  <Shimmer w="40%" h={10} r={6} />
                </div>
              </div>
              <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <Shimmer w={36} h={9} r={4} />
                  <Shimmer w={48} h={18} r={6} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <Shimmer w={36} h={9} r={4} />
                  <Shimmer w={36} h={13} r={6} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List skeleton */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ede9f6", overflow: "hidden" }}>
        {/* header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f0ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Shimmer w={130} h={14} r={6} />
          <Shimmer w={90} h={11} r={6} />
        </div>
        {/* column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 100px", padding: "10px 20px", background: "#fcfaff", borderBottom: "1px solid #f3f0ff", gap: 0 }}>
          {[50, 80, 70, 50].map((w, i) => (
            <Shimmer key={i} w={w} h={10} r={5} />
          ))}
        </div>
        {/* rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "60px 1fr 120px 100px",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "1px solid #f8faff",
            gap: 0,
          }}>
            <Shimmer w={28} h={13} r={6} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Shimmer w={34} h={34} r="50%" />
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <Shimmer w={90 + (i % 3) * 20} h={13} r={6} />
                <Shimmer w={55} h={10} r={5} />
              </div>
            </div>
            <Shimmer w={48} h={11} r={6} />
            <Shimmer w={40} h={13} r={6} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Inline Stats Dropdown ── */
function StatsDropdown({ student }) {
  const stats = student?.stats || {};

  const statCards = [
    { label: "State Rank",  val: stats.stateRank,                                       icon: <MapPin size={12} />,  color: "#7c3aed", border: "#ddd6fe" },
    { label: "Percentile",  val: stats.percentile != null ? `${stats.percentile}%` : "N/A", icon: <Percent size={12} />, color: "#0891b2", border: "#a5f3fc" },
    { label: "Inst. Rank",  val: rankLabel(stats.instRank ?? null),                      icon: <Trophy size={12} />,  color: "#f59e0b", border: "#fde68a" },
    { label: "Accuracy",    val: stats.accuracy   != null ? `${stats.accuracy}%`   : "N/A", icon: <Zap size={12} />,    color: "#10b981", border: "#a7f3d0" },
  ];

  return (
    <div style={{ padding: "14px 20px 16px 72px", background: "linear-gradient(to bottom, #faf8ff, #ffffff)", borderTop: "1px dashed #ede9f6", animation: "dropIn 0.18s ease-out" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ borderRadius: 12, border: `1.5px solid ${s.border}`, padding: "12px 14px", background: "#fff", boxShadow: `0 2px 8px ${s.color}10` }}>
            <div style={{ color: s.color, display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: s.color, letterSpacing: "-0.5px" }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CROWN_ICONS = ["🥇", "🥈", "🥉"];

function PodiumCard({ student, rank, isExpanded, onToggle }) {
  const isFirst = rank === 1;
  const stats = student?.stats || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div
        onClick={onToggle}
        style={{
          cursor: "pointer",
          padding: "16px",
          background: isFirst ? "#7c3aed" : "#fff",
          borderRadius: 16,
          border: isFirst ? "none" : "1px solid #e2e8f0",
          boxShadow: isFirst ? "0 10px 25px rgba(124,58,237,0.3)" : "none",
          transition: "all 0.2s ease",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: isFirst ? "rgba(255,255,255,0.7)" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Rank #{rank}
          </span>
          <span style={{ fontSize: 16 }}>{CROWN_ICONS[rank - 1]}</span>
        </div>

        <div style={{ fontSize: 15, fontWeight: 800, color: isFirst ? "#fff" : "#1e293b", marginBottom: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {student.name}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: isFirst ? "#fff" : "#7c3aed", letterSpacing: "-0.5px" }}>{student.points}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: isFirst ? "rgba(255,255,255,0.6)" : "#94a3b8", textTransform: "uppercase" }}>PTS</span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: "16px", marginTop: 8, background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9", animation: "dropIn 0.2s ease-out", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Accuracy",   val: `${stats.accuracy ?? 0}%`,                              color: "#10b981", percent: stats.accuracy },
            { label: "Percentile", val: stats.percentile ? `${stats.percentile}%` : "N/A",       color: "#0891b2", percent: stats.percentile },
            { label: "State Rank", val: rankLabel(stats.stateRank),                              color: "#7c3aed", percent: 40 },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{s.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1e293b" }}>{s.val}</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${s.percent || 0}%`, height: "100%", background: s.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function Rankings() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const [allEntries, setAllEntries] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeBatch, setActiveBatch] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [libRes, batchRes] = await Promise.all([
          fetch(`${baseURL}/leaderboard/stats/all`, { headers }),
          fetch(`${baseURL}/teacher/my-batches2`, { headers })
        ]);
        setAllEntries(await libRes.json());
        setBatches(await batchRes.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [baseURL]);

  const teacherStudentIds = React.useMemo(() => {
    const ids = new Set();
    batches.forEach(b => b.students?.forEach(s => ids.add((s._id || s).toString())));
    return ids;
  }, [batches]);

  const enriched = React.useMemo(() =>
    allEntries.map(e => {
      const sid = (e.studentId || e.id || e._id)?.toString();
      const batch = batches.find(b => b.students?.some(s => (s._id || s).toString() === sid));
      return { ...e, batchId: batch?._id, batchName: batch?.name };
    }), [allEntries, batches]);

  const visible = enriched.filter(e => {
    const sid = (e.studentId || e.id || e._id)?.toString();
    if (batches.length > 0 && !teacherStudentIds.has(sid)) return false;
    if (activeBatch !== "all" && e.batchId !== activeBatch) return false;
    if (search && !e.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const top3 = visible.slice(0, 3);
  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <AdminLayout>
      <PageHeader
        title="Rankings"
        subtitle="Weekly intelligence leaderboard"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f3ff", color: "#7c3aed", padding: "6px 12px", borderRadius: 9, fontSize: 12, fontWeight: 700, border: "1px solid #ddd6fe" }}>
            <Award size={13} /> {visible.length} Active Students
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", minHeight: 0 }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid #ede9f6", background: "#fff", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 16, borderBottom: "1px solid #f3f0ff" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                placeholder="Search student..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 12, outline: "none", fontWeight: 500, boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "8px 12px", letterSpacing: "0.05em" }}>Filters</div>
            <button
              onClick={() => setActiveBatch("all")}
              style={{ all: "unset", display: "flex", alignItems: "center", gap: 10, width: "calc(100% - 24px)", padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: activeBatch === "all" ? "#f5f3ff" : "transparent", color: activeBatch === "all" ? "#7c3aed" : "#64748b", fontWeight: activeBatch === "all" ? 700 : 500, fontSize: 13, marginBottom: 4 }}
            >
              <LayoutGrid size={15} /> All Students
            </button>
            {batches.map((b, i) => (
              <button
                key={b._id}
                onClick={() => setActiveBatch(b._id)}
                style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "space-between", width: "calc(100% - 24px)", padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: activeBatch === b._id ? chipColor(i).bg : "transparent", color: activeBatch === b._id ? chipColor(i).color : "#64748b", fontWeight: activeBatch === b._id ? 700 : 500, fontSize: 13, marginBottom: 2 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Users size={15} /> {b.name}
                </div>
                <ChevronRight size={12} style={{ opacity: 0.5 }} />
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, background: "#f8faff", overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <SkeletonLoader />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {top3.length > 0 && activeBatch === "all" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
                    🏆 Top Performers
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "end" }}>
                    {[
                      top3[1] ? { s: top3[1], r: 2 } : null,
                      top3[0] ? { s: top3[0], r: 1 } : null,
                      top3[2] ? { s: top3[2], r: 3 } : null,
                    ].map((item, i) =>
                      item ? (
                        <PodiumCard
                          key={item.s._id || i}
                          student={item.s}
                          rank={item.r}
                          isExpanded={expandedId === `podium-${item.s._id}`}
                          onToggle={() => toggle(`podium-${item.s._id}`)}
                        />
                      ) : <div key={i} />
                    )}
                  </div>
                </div>
              )}

              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ede9f6", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f0ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>Class Standings</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>WEEKLY RESET</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 100px", padding: "10px 20px", background: "#fcfaff", borderBottom: "1px solid #f3f0ff" }}>
                  {["Rank", "Student", "Performance", "Points"].map(h => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>

                {visible.map((e, idx) => {
                  const rankNum = parseInt(e.rank);
                  const medal = medalStyle(rankNum);
                  const uid = (e.studentId || e._id || idx).toString();
                  const isOpen = expandedId === uid;

                  return (
                    <React.Fragment key={uid}>
                      <div
                        onClick={() => toggle(uid)}
                        onMouseEnter={ev => { if (!isOpen) ev.currentTarget.style.background = "#faf8ff"; }}
                        onMouseLeave={ev => { if (!isOpen) ev.currentTarget.style.background = "transparent"; }}
                        style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 100px", alignItems: "center", padding: "14px 20px", borderBottom: isOpen ? "none" : "1px solid #f8faff", cursor: "pointer", transition: "background 0.15s", background: isOpen ? "#faf8ff" : "transparent" }}
                      >
                        <div style={{ fontWeight: 900, color: rankNum <= 3 ? medal.color : "#94a3b8" }}>#{e.rank}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: AVATAR_COLORS[idx % 5], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#7c3aed", border: isOpen ? "2px solid #c4b5fd" : "2px solid transparent", overflow: "hidden", flexShrink: 0, transition: "border 0.15s" }}>
                            {e.avatar ? <img src={e.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : e.name?.[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                              {e.name}{e.current && <span style={{ color: "#7c3aed", fontWeight: 700 }}> (You)</span>}
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.batchName || "N/A"}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981", fontSize: 11, fontWeight: 700 }}>
                          <TrendingUp size={12} /> {e.stats?.accuracy ?? 0}%
                        </div>
                        <div style={{ fontWeight: 800, color: "#7c3aed" }}>{e.points}</div>
                      </div>

                      {isOpen && (
                        <div style={{ borderBottom: "1px solid #ede9f6" }}>
                          <StatsDropdown student={e} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ── YouTube-style shimmer sweep ── */
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
}