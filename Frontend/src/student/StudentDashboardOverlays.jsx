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

/* ══════════════════════════════════════════════════
   1.  MOBILE — "Update your profile pic" popup
       Shows once per session if user has no profilePic.
══════════════════════════════════════════════════ */
function ProfilePicPopup({ user, resolveMediaUrl }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only on mobile viewport + no profile pic
    const isMobile = window.innerWidth < 768;
    const hasNoPic = !user?.profilePic;

    if (isMobile && hasNoPic) {
      // Small delay so the page paints first
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, [user]);

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-[2px]"
        style={{ animation: "fadeInBg 0.25s ease" }}
        onClick={dismiss}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[999] bg-amber-50 rounded-t-[2.5rem] px-6 pt-6 pb-24 shadow-2xl"
        style={{ animation: "slideUp 0.35s cubic-bezier(0.34,1.2,0.64,1) both" }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 active:bg-slate-200"
        >
          <X size={16} />
        </button>

        {/* Avatar preview */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E6D6FF] to-[#C4A8FF] flex items-center justify-center border-4 border-white shadow-lg">
              {user?.profilePic ? (
                <img
                  src={resolveMediaUrl(user.profilePic)}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-4xl font-black text-[#7A41F7]">
                  {user?.name?.charAt(0)?.toUpperCase() || "S"}
                </span>
              )}
            </div>
            {/* Camera badge */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#7A41F7] rounded-full flex items-center justify-center border-2 border-white shadow">
              <Camera size={14} className="text-white" />
            </div>
          </div>
          <h3 className="text-[20px] font-black text-slate-900 text-center leading-tight">
            Upload your Profile pic
          </h3>
          <p className="text-[13px] text-slate-400 font-medium text-center mt-1.5 max-w-[280px]">
            Make it easier for others to recognize you.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => { dismiss(); navigate("/student/profile"); }}
          className="w-full py-4 bg-[#7A41F7] text-white rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-purple-200"
        >
          Update Profile Photo <ArrowRight size={16} />
        </button>

        <button
          onClick={dismiss}
          className="w-full mt-3 py-3 text-slate-400 text-[13px] font-semibold"
        >
          Maybe later
        </button>
      </div>

      <style>{`
        @keyframes fadeInBg  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp   { from { transform:translateY(110%) } to { transform:translateY(0) } }
      `}</style>
    </>
  );
}

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
export default function StudentDashboardOverlays({ user, resolveMediaUrl }) {
  return (
    <>
      {/* Mobile-only profile pic nudge */}
      <ProfilePicPopup user={user} resolveMediaUrl={resolveMediaUrl} />
    </>
  );
}