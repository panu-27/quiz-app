import React, { useState, useEffect } from "react";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  TrendingUp, TrendingDown, Users, FileText, BarChart3,
  AlertCircle, BookOpen, Loader2, Star, Search,
  CheckCircle2, XCircle, Minus, Zap, Filter,
  ArrowUp, ArrowDown, ChevronRight, Target, WifiOff,
  RefreshCw, Calendar, Clock,
} from "lucide-react";

/* ── helpers ── */
const examBadge = (type = "") => {
  const m = {
    PCM:   { bg:"#f5f3ff", color:"#7c3aed", border:"#ddd6fe" },
    PCB:   { bg:"#ecfdf5", color:"#059669", border:"#a7f3d0" },
    JEE:   { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
    NEET:  { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
    OTHER: { bg:"#f9fafb", color:"#6b7280", border:"#e5e7eb" },
  };
  return m[type] || m.OTHER;
};

const AVATAR_COLORS = ["#ede9fe","#dbeafe","#dcfce7","#fef9c3","#ffe4e6"];

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day:"numeric", month:"short" }) : "—";

const riskColors = {
  HIGH:   { text:"#ef4444", bg:"#fff1f2", border:"#fecdd3" },
  MEDIUM: { text:"#f59e0b", bg:"#fffbeb", border:"#fde68a" },
  SAFE:   { text:"#10b981", bg:"#ecfdf5", border:"#a7f3d0" },
};

const trendMeta = {
  rising:     { color:"#10b981", label:"Rising",          icon:<ArrowUp size={10}/> },
  falling:    { color:"#ef4444", label:"Falling",         icon:<ArrowDown size={10}/> },
  volatile:   { color:"#f59e0b", label:"Volatile",        icon:<Zap size={10}/> },
  consistent: { color:"#6366f1", label:"Consistent",      icon:<Minus size={10}/> },
  new:        { color:"#94a3b8", label:"New",             icon:<Star size={10}/> },
  absent:     { color:"#ef4444", label:"Never attempted", icon:<XCircle size={10}/> },
};

/* ── YT-style shimmer skeleton ── */
function Shimmer({ w = "100%", h = 14, r = 8, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "ytShimmer 1.4s ease-in-out infinite",
      flexShrink: 0,
      ...style,
    }} />
  );
}

/* mimics the full page layout while loading */
function PageSkeleton() {
  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0, fontFamily:"'DM Sans',sans-serif" }}>
      {/* left panel skeleton */}
      <div style={{ width:230, flexShrink:0, borderRight:"1px solid #ede9f6", background:"#fff", padding:12, display:"flex", flexDirection:"column", gap:10 }}>
        <Shimmer h={36} r={9} />
        <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px" }}>
              <Shimmer w={16} h={16} r={4} />
              <Shimmer w={`${55 + i * 8}%`} h={12} />
            </div>
          ))}
        </div>
      </div>

      {/* right panel skeleton */}
      <div style={{ flex:1, padding:"16px 20px", display:"flex", flexDirection:"column", gap:16, background:"#f8fafc", overflowY:"auto" }}>
        {/* stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", padding:14, display:"flex", flexDirection:"column", gap:10 }}>
              <Shimmer h={10} w="55%" />
              <Shimmer h={28} w="40%" r={6} />
            </div>
          ))}
        </div>

        {/* main content blocks — mimic test trend rows */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", gap:10 }}>
            <Shimmer h={14} w={140} />
          </div>
          {[90,75,60,82,50].map((w, i) => (
            <div key={i} style={{ padding:"18px 20px", borderBottom: i < 4 ? "1px solid #f8fafc" : "none", display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Shimmer h={12} w={`${w + 40}px`} />
                  <Shimmer h={18} w={48} r={99} />
                </div>
                <Shimmer h={12} w={60} />
              </div>
              {/* mini bar */}
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <Shimmer h={6} w={`${w}%`} r={99} />
                <Shimmer h={6} w={`${100 - w}%`} r={99} style={{ opacity:0.3 }} />
              </div>
              {/* bottom meta */}
              <div style={{ display:"flex", gap:16 }}>
                <Shimmer h={10} w={70} />
                <Shimmer h={10} w={60} />
                <Shimmer h={10} w={50} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── error state ── */
function ErrorState({ onRetry }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:40, textAlign:"center", background:"#f8fafc" }}>
      <div style={{ width:60, height:60, borderRadius:18, background:"#fff1f2", border:"1.5px solid #fecdd3", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <WifiOff size={26} style={{ color:"#ef4444" }} />
      </div>
      <div>
        <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", marginBottom:6 }}>Couldn't load analytics</div>
        <p style={{ fontSize:12, color:"#94a3b8", maxWidth:240, lineHeight:1.7, margin:0 }}>
          Something went wrong fetching your data. Try again in a moment.
        </p>
      </div>
      <button onClick={onRetry} style={{ all:"unset", cursor:"pointer", display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#6366f1)", color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 4px 12px rgba(109,40,217,0.28)" }}>
        <RefreshCw size={13}/> Try Again
      </button>
    </div>
  );
}

function Sparkline({ data, color = "#7c3aed" }) {
  if (!data || data.length < 2) return null;
  const W = 52, H = 20;
  const min = Math.min(...data, 0), max = Math.max(...data, 1);
  const norm = (v) => H - ((v - min) / (max - min + 0.001)) * H;
  const step = W / (data.length - 1);
  const pts  = data.map((v, i) => `${i * step},${norm(v)}`).join(" ");
  return (
    <svg width={W} height={H} style={{ overflow:"visible", flexShrink:0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length-1)*step} cy={norm(data[data.length-1])} r="2.5" fill={color} />
    </svg>
  );
}

function Bar({ val, max, color = "#7c3aed", height = 5 }) {
  const w = max > 0 ? Math.min(100, Math.round((val / max) * 100)) : 0;
  return (
    <div style={{ width:"100%", height, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
      <div style={{ width:`${w}%`, height:"100%", background:color, borderRadius:99, transition:"width 0.7s ease" }} />
    </div>
  );
}

const insightStyle = {
  positive: { bg:"#f0fdf4", border:"#bbf7d0", icon:<TrendingUp size={14} style={{ color:"#16a34a" }}/> },
  warning:  { bg:"#fffbeb", border:"#fde68a", icon:<AlertCircle size={14} style={{ color:"#d97706" }}/> },
  danger:   { bg:"#fff1f2", border:"#fecdd3", icon:<AlertCircle size={14} style={{ color:"#ef4444" }}/> },
};

function InsightCard({ type, text }) {
  const s = insightStyle[type] || insightStyle.warning;
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:12, padding:"12px 14px" }}>
      <div style={{ flexShrink:0, marginTop:1 }}>{s.icon}</div>
      <span style={{ fontSize:12, fontWeight:500, color:"#0f172a", lineHeight:1.55 }}>{text}</span>
    </div>
  );
}

/* ── Test Trends premium card ── */
function TrendCard({ t, rank }) {
  const badge    = examBadge(t.examType);
  const barColor = t.avgPct >= 60 ? "#10b981" : t.avgPct >= 40 ? "#f59e0b" : "#ef4444";
  const attColor = t.attendanceRate >= 75 ? "#10b981" : t.attendanceRate >= 50 ? "#f59e0b" : "#ef4444";
  const isGood   = t.avgPct >= 60;

  return (
    <div style={{
      background:"#fff", borderRadius:16, border:"1.5px solid #e9e8f0",
      overflow:"hidden",
      boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
      transition:"box-shadow 0.18s, transform 0.18s, border-color 0.18s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 28px rgba(109,40,217,0.1)"; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor="#ddd6fe"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)";  e.currentTarget.style.transform="translateY(0)";  e.currentTarget.style.borderColor="#e9e8f0"; }}
    >
      {/* color accent stripe */}
      <div style={{ height:3, background:`linear-gradient(90deg,${barColor},${barColor}66)` }} />

      <div style={{ padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* header row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:800, color:"#0f172a", lineHeight:1.3, marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {t.title}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:99, background:badge.bg, color:badge.color, border:`1px solid ${badge.border}`, textTransform:"uppercase", letterSpacing:"0.06em" }}>{t.examType}</span>
              {t.date && (
                <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:10, color:"#94a3b8", fontWeight:500 }}>
                  <Calendar size={9}/>{fmtDate(t.date)}
                </span>
              )}
            </div>
          </div>
          {/* avg score big badge */}
          <div style={{
            flexShrink:0, padding:"8px 14px", borderRadius:12,
            background: isGood ? "#ecfdf5" : t.avgPct >= 40 ? "#fffbeb" : "#fff1f2",
            border: `1.5px solid ${isGood ? "#a7f3d0" : t.avgPct >= 40 ? "#fde68a" : "#fecdd3"}`,
            textAlign:"center",
          }}>
            <div style={{ fontSize:18, fontWeight:900, color:barColor, letterSpacing:"-0.4px", lineHeight:1 }}>{t.avgPct}%</div>
            <div style={{ fontSize:8.5, color:barColor, opacity:0.7, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>avg</div>
          </div>
        </div>

        {/* progress bar */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:9.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>Class Performance</span>
            <span style={{ fontSize:9.5, fontWeight:800, color:barColor }}>{t.avgPct} / 100</span>
          </div>
          <div style={{ height:7, background:"#f1f5f9", borderRadius:99, overflow:"hidden", position:"relative" }}>
            <div style={{ width:`${t.avgPct}%`, height:"100%", background:`linear-gradient(90deg,${barColor},${barColor}cc)`, borderRadius:99, transition:"width 0.8s ease" }} />
          </div>
        </div>

        {/* stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { label:"Attended",   val:t.attended,            icon:<Users size={10}/>,      color:"#7c3aed"  },
            { label:"Eligible",   val:t.eligible,            icon:<FileText size={10}/>,   color:"#0ea5e9"  },
            { label:"Attendance", val:`${t.attendanceRate}%`, icon:<CheckCircle2 size={10}/>, color:attColor },
          ].map((m, i) => (
            <div key={i} style={{ background:"#f8f7ff", borderRadius:9, padding:"8px 10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:3 }}>
                <span style={{ color:m.color, opacity:0.8 }}>{m.icon}</span>
                <span style={{ fontSize:8.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>{m.label}</span>
              </div>
              <div style={{ fontSize:14, fontWeight:800, color:m.color, letterSpacing:"-0.3px" }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* attendance micro-bar */}
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:9.5, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>Attendance</span>
            <span style={{ fontSize:9.5, fontWeight:800, color:attColor }}>{t.attendanceRate}%</span>
          </div>
          <div style={{ height:5, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
            <div style={{ width:`${t.attendanceRate}%`, height:"100%", background:`linear-gradient(90deg,${attColor},${attColor}cc)`, borderRadius:99, transition:"width 0.8s ease" }} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Performance() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [tab,     setTab]     = useState("insights");
  const [search,  setSearch]  = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchData = async () => {
    setLoading(true); setError(false);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`${baseURL}/teacher/performance-overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Server error");
      setData(await r.json());
    } catch (e) { console.error(e); setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [baseURL]);
  useEffect(() => { setActiveFilter("ALL"); }, [tab]);

  /* ── loading: YT-style skeleton ── */
  if (loading) {
    return (
      <AdminLayout>
        <PageHeader title="Performance" subtitle="Batch intelligence across all tests" />
        <PageSkeleton />
        <style>{`@keyframes ytShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      </AdminLayout>
    );
  }

  /* ── error ── */
  if (error) {
    return (
      <AdminLayout>
        <PageHeader title="Performance" subtitle="Batch intelligence across all tests" />
        <ErrorState onRetry={fetchData} />
      </AdminLayout>
    );
  }

  if (!data || data.summary?.totalTests === 0) {
    return (
      <AdminLayout>
        <PageHeader title="Performance" subtitle="Batch intelligence across all tests" />
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center", background:"#f4f3fa" }}>
          <div style={{ width:58, height:58, borderRadius:17, background:"#fff", border:"1.5px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
            <BarChart3 size={24} style={{ color:"#d1d5db" }} />
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:"#374151", marginBottom:6 }}>No tests yet</div>
          <p style={{ fontSize:12, color:"#94a3b8", maxWidth:220, lineHeight:1.7, margin:0 }}>Schedule and conduct tests to unlock performance analytics.</p>
        </div>
      </AdminLayout>
    );
  }

  const { summary, insights, testTrend, studentRisk, subjectHealth } = data;
  const highRisk   = studentRisk.filter(s => s.riskLevel === "HIGH");
  const dangerCount = insights.filter(i => i.type === "danger").length;

  const q = search.toLowerCase();
  const filteredInsights  = insights.filter(i => i.text.toLowerCase().includes(q));
  const filteredTrends    = testTrend.filter(t => t.title.toLowerCase().includes(q) && (activeFilter === "ALL" || t.examType === activeFilter));
  const filteredStudents  = studentRisk.filter(s => s.name.toLowerCase().includes(q) && (activeFilter === "ALL" || s.riskLevel === activeFilter || s.trend === activeFilter.toLowerCase()));
  const filteredSubjects  = subjectHealth.filter(s => s.subjectName.toLowerCase().includes(q));

  const navItems = [
    { id:"insights", label:"Insights",    icon:<Zap size={13}/>,        badge: dangerCount },
    { id:"trends",   label:"Test Trends", icon:<TrendingUp size={13}/>, badge: 0 },
    { id:"students", label:"Students",    icon:<Users size={13}/>,      badge: highRisk.length },
    { id:"subjects", label:"Subjects",    icon:<BookOpen size={13}/>,   badge: 0 },
  ];

  const getFiltersForTab = () => {
    if (tab === "students") return [
      { id:"ALL",     label:"All"         },
      { id:"HIGH",    label:"High Risk"   },
      { id:"MEDIUM",  label:"Medium Risk" },
      { id:"RISING",  label:"Rising"      },
      { id:"FALLING", label:"Falling"     },
    ];
    if (tab === "trends") return [
      { id:"ALL",  label:"All Exams" },
      { id:"JEE",  label:"JEE"       },
      { id:"NEET", label:"NEET"      },
      { id:"PCM",  label:"PCM"       },
    ];
    return [];
  };

  const trajectoryColor = summary.batchTrajectory === "improving" ? "#10b981" : summary.batchTrajectory === "declining" ? "#ef4444" : "#6366f1";
  const statCards = [
    { label:"Tests",      val:summary.totalTests,        color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", icon:<FileText size={13}/> },
    { label:"Students",   val:summary.totalStudents,     color:"#0ea5e9", bg:"#f0f9ff", border:"#bae6fd", icon:<Users size={13}/> },
    { label:"Attendance", val:summary.overallAttendance, color:"#10b981", bg:"#ecfdf5", border:"#a7f3d0", icon:<CheckCircle2 size={13}/> },
    { label:"Trajectory", val:summary.batchTrajectory === "improving" ? `↑ ${summary.trajectoryPct}%` : `↓ ${Math.abs(summary.trajectoryPct)}%`, color:trajectoryColor, bg:`${trajectoryColor}15`, border:`${trajectoryColor}40`, icon:<TrendingUp size={13}/> },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Performance" subtitle="Batch intelligence and student tracking" />

      <div style={{ flex:1, display:"flex", overflow:"hidden", fontFamily:"'DM Sans', sans-serif", minHeight:0 }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{ width:230, flexShrink:0, display:"flex", flexDirection:"column", borderRight:"1px solid #ede9f6", background:"#fff" }}>
          <div style={{ padding:"12px", borderBottom:"1px solid #f3f0ff" }}>
            <div style={{ position:"relative" }}>
              <Search size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                style={{ width:"100%", boxSizing:"border-box", padding:"8px 10px 8px 32px", background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:12, outline:"none" }} />
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"8px" }}>
            <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", padding:"0 12px 8px", letterSpacing:"0.05em" }}>Analysis</div>
            {navItems.map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)} style={{
                  all:"unset", display:"flex", alignItems:"center", justifyContent:"space-between",
                  width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:11, cursor:"pointer", marginBottom:2,
                  background: active ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "transparent",
                  color: active ? "#fff" : "#475569", transition:"0.15s"
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                    <span style={{ fontSize:12, fontWeight:700 }}>{item.label}</span>
                  </div>
                  {item.badge > 0 && <span style={{ background: active ? "rgba(255,255,255,0.2)" : "#ef4444", color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:99 }}>{item.badge}</span>}
                </button>
              );
            })}

            {getFiltersForTab().length > 0 && (
              <>
                <div style={{ height:1, background:"#f1f5f9", margin:"12px 8px" }} />
                <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", textTransform:"uppercase", padding:"0 12px 8px", letterSpacing:"0.05em" }}>Quick Filters</div>
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {getFiltersForTab().map(f => (
                    <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
                      all:"unset", display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer",
                      color: activeFilter === f.id ? "#7c3aed" : "#64748b",
                      background: activeFilter === f.id ? "#f5f3ff" : "transparent"
                    }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background: activeFilter === f.id ? "#7c3aed" : "#cbd5e1" }} />
                      {f.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#f8fafc", overflowY:"auto", padding:"16px 20px 40px" }}>

          {/* Stats Bar */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:12, marginBottom:20 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background:"#fff", padding:"14px", borderRadius:16, border:`1px solid ${s.border}`, boxShadow:"0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", color:"#94a3b8", marginBottom:8 }}>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase" }}>{s.label}</span>
                  {s.icon}
                </div>
                <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

            {tab === "insights" && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {filteredInsights.map((ins, i) => <InsightCard key={i} type={ins.type} text={ins.text} />)}
              </div>
            )}

            {/* ── TEST TRENDS — premium card grid ── */}
            {tab === "trends" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {/* header row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#0f172a" }}>Performance History</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{filteredTrends.length} test{filteredTrends.length !== 1 ? "s" : ""} · sorted by date</div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ padding:"5px 12px", borderRadius:8, background:"#f5f3ff", border:"1px solid #ddd6fe", fontSize:11, fontWeight:700, color:"#7c3aed", display:"flex", alignItems:"center", gap:5 }}>
                      <TrendingUp size={11}/> {Math.round(filteredTrends.reduce((a,t)=>a+t.avgPct,0)/(filteredTrends.length||1))}% overall avg
                    </div>
                  </div>
                </div>

                {filteredTrends.length === 0 ? (
                  <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #e9e8f0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", textAlign:"center" }}>
                    <BarChart3 size={28} style={{ color:"#d1d5db", marginBottom:12 }} />
                    <div style={{ fontSize:13, fontWeight:700, color:"#374151" }}>No tests match this filter</div>
                  </div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
                    {filteredTrends.map((t, i) => <TrendCard key={t.testId} t={t} rank={i+1} />)}
                  </div>
                )}
              </div>
            )}

            {tab === "students" && (
              <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", overflow:"hidden" }}>
                <div style={{ padding:"16px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:800, fontSize:14 }}>Student Roster</span>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{filteredStudents.length} Results</span>
                </div>
                {filteredStudents.map((s, idx) => {
                  const rc = riskColors[s.riskLevel] || riskColors.SAFE;
                  const tc = trendMeta[s.trend] || trendMeta.consistent;
                  return (
                    <div key={s.studentId} style={{ padding:"12px 16px", borderBottom:"1px solid #f8fafc", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:AVATAR_COLORS[idx%5], display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#6366f1", fontSize:12, overflow:"hidden", flexShrink:0 }}>
                          {s.profilePic ? (
                            <img src={s.profilePic} alt={s.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.style.display="none"; e.target.parentElement.innerText=s.name[0]; }} />
                          ) : s.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700 }}>{s.name}</div>
                          <div style={{ fontSize:10, color:"#94a3b8" }}>{s.reason}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:15 }}>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:12, fontWeight:800, color:"#1e293b" }}>{s.avgPct}%</div>
                          <div style={{ fontSize:9, fontWeight:700, color:rc.text, textTransform:"uppercase" }}>{s.riskLevel}</div>
                        </div>
                        <div style={{ color:tc.color }}>{tc.icon}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "subjects" && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:15 }}>
                {filteredSubjects.map((s, i) => {
                  const probColor = s.problem === "conceptual_gap" ? "#ef4444" : "#f59e0b";
                  return (
                    <div key={s.subjectName} style={{ background:"#fff", borderRadius:20, border:"1.5px solid #e2e8f0", padding:"20px", position:"relative", overflow:"hidden" }}>
                      <div style={{ position:"absolute", top:0, left:0, width:"100%", height:4, background:probColor }} />
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:15 }}>
                        <div>
                          <h4 style={{ margin:0, fontSize:16, fontWeight:800, color:"#1e293b" }}>{s.subjectName}</h4>
                          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:4 }}>
                            <Target size={12} style={{ color:probColor }} />
                            <span style={{ fontSize:10, fontWeight:700, color:probColor, textTransform:"uppercase" }}>{s.problem.replace("_", " ")}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:22, fontWeight:900, color:"#1e293b" }}>{s.accuracy}%</div>
                          <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8" }}>ACCURACY</div>
                        </div>
                      </div>
                      <div style={{ background:"#f8fafc", borderRadius:12, padding:"12px", display:"flex", justifyContent:"space-between", marginBottom:15 }}>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>Correct</div>
                          <div style={{ fontSize:14, fontWeight:800, color:"#10b981" }}>{s.totalCorrect}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>Wrong</div>
                          <div style={{ fontSize:14, fontWeight:800, color:"#ef4444" }}>{s.totalWrong}</div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>Skipped</div>
                          <div style={{ fontSize:14, fontWeight:800, color:"#94a3b8" }}>{s.totalSkipped}</div>
                        </div>
                      </div>
                      <p style={{ margin:0, fontSize:11, color:"#64748b", lineHeight:1.5 }}>
                        <b>Observation:</b> {s.problem === "conceptual_gap" ? "High skip rate suggests students aren't grasping fundamentals." : "Students are attempting but failing; focus on repetition and drills."}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes nexusSpin  { to { transform:rotate(360deg); } }
        @keyframes ytShimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </AdminLayout>
  );
}