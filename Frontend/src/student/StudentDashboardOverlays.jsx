/**
 * StudentDashboardOverlays.jsx
 * ─────────────────────────────────────────────────────────────
 * Drop-in overlays for StudentDashboard. Zero changes to existing file.
 *
 * USAGE in StudentDashboard.jsx:
 *
 *   import StudentDashboardOverlays from "./StudentDashboardOverlays";
 *
 *   // Inside the JSX, just before the closing </div> of the root:
 *   <StudentDashboardOverlays user={user} resolveMediaUrl={resolveMediaUrl} />
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Camera, ArrowRight, TrendingUp, CheckCircle2, Clock } from "lucide-react";

/* ProfilePicPopup removed per user request for better UX */

/* ══════════════════════════════════════════════════
   2.  DESKTOP — Fake stats bar (replaces API stats)
       Hard-coded numbers, no network call.
══════════════════════════════════════════════════ */
const FAKE_STATS = [
  {
    label: "Tests Attempted",
    value: 24,
    icon: <TrendingUp size={22} className="text-[#7A41F7]" />,
    bg: "bg-[#F3EBFF]",
    iconBg: "bg-[#E6D6FF]",
    sub: "All time",
  },
  {
    label: "Scheduled Tests",
    value: 3,
    icon: <Clock size={22} className="text-orange-500" />,
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    sub: "Live now",
  },
  {
    label: "Tests Completed",
    value: 18,
    icon: <CheckCircle2 size={22} className="text-emerald-500" />,
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    sub: "All time",
  },
];

export function FakeStatsBar() {
  return (
    <div className="grid grid-cols-3 gap-5 mb-8">
      {FAKE_STATS.map((s, i) => (
        <div key={i} className={`${s.bg} rounded-2xl p-5 flex items-center gap-4`}>
          <div className={`${s.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
            {s.icon}
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{s.value}</p>
            <p className="text-[13px] font-semibold text-slate-500">{s.label}</p>
            <p className="text-[11px] text-slate-400">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DEFAULT EXPORT — bundle both into one component
   so the dashboard only needs a single import line.
══════════════════════════════════════════════════ */
export default function StudentDashboardOverlays() {
  return null;
}