import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Lock, ChevronRight, BookOpen, X,
  Atom, FlaskConical, Calculator, Dna, Loader2,
  FileText, Trophy, MessageCircle, ChevronDown, ArrowLeft,
  Phone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import { SUBJECTS, CHAPTERS } from "./libraryConfig";
import CounsellorModal from "../components/CounsellorModal";

/* ─── Constants ─────────────────────────────────────────── */
const STATUS_BAR_H = 28.5;
const BOTTOM_NAV_H = 72;

/* ─── Subject metadata ───────────────────────────────────── */
const SUBJ_META = {
  phy: { label: "PHYSICS",   color: "#F59E0B", icon: <Atom size={13} /> },
  che: { label: "CHEMISTRY", color: "#10B981", icon: <FlaskConical size={13} /> },
  mat: { label: "MATHS",     color: "#6366F1", icon: <Calculator size={13} /> },
  bio: { label: "BIOLOGY",   color: "#EC4899", icon: <Dna size={13} /> },
};

const ALL_TOPICS = Object.entries(CHAPTERS).flatMap(([subjId, chs]) =>
  chs.map((ch, i) => ({
    id: ch.id,
    name: ch.label,
    subjId,
    subjLabel: SUBJ_META[subjId]?.label || subjId.toUpperCase(),
    subjColor: SUBJ_META[subjId]?.color || "#7A41F7",
    subjIcon: SUBJ_META[subjId]?.icon,
    chaptersCount: chs.length,
  }))
);

const FILTER_TABS = ["All", "Physics", "Chemistry", "Maths", "Biology"];
const SUBJ_ID_MAP = { Physics: "phy", Chemistry: "che", Maths: "mat", Biology: "bio" };

/* ══════════════════════════════════════════════════════════
   PDF ITEM (with lock logic)
══════════════════════════════════════════════════════════ */
function PdfItem({ item, index, isApproved, onOpen, openingId }) {
  // unapproved → first open, rest locked
  // approved   → first locked, rest open
  const locked = isApproved ? index === 0 : index !== 0;
  const isOpening = openingId === item._id;

  return (
    <button
      disabled={locked}
      onClick={() => !locked && onOpen(item)}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all active:scale-[0.98] text-left ${
        locked
          ? "opacity-50 cursor-not-allowed border-[#1E2535] bg-[#10151F]"
          : "border-[#1E2535] bg-[#141B27]"
      }`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#1E2535] flex items-center justify-center flex-shrink-0">
        {locked ? (
          <Lock size={16} className="text-slate-500" />
        ) : (
          <FileText size={16} className="text-[#7A41F7]" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold truncate ${locked ? "text-slate-500" : "text-white"}`}>
          {item.title}
        </p>
        <p className={`text-[11px] mt-0.5 font-medium ${locked ? "text-slate-600" : "text-slate-500"}`}>
          {locked
            ? isApproved
              ? "Locked by institute"
              : "Upgrade to unlock"
            : "Tap to open PDF"}
        </p>
      </div>

      {/* Right indicator */}
      {isOpening ? (
        <Loader2 size={16} className="text-[#7A41F7] animate-spin flex-shrink-0" />
      ) : !locked ? (
        <div className="w-8 h-8 rounded-xl bg-[#7A41F7]/20 flex items-center justify-center flex-shrink-0">
          <ChevronRight size={15} className="text-[#7A41F7]" />
        </div>
      ) : (
        <Lock size={14} className="text-slate-600 flex-shrink-0" />
      )}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   DECRYPT OVERLAY
══════════════════════════════════════════════════════════ */
function DecryptOverlay() {
  return (
    <div className="fixed inset-0 z-[9000] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
          <Lock size={28} className="text-white" />
        </div>
        <div
          className="absolute inset-[-2px] rounded-2xl border-2 border-transparent"
          style={{
            borderTopColor: "rgba(255,255,255,0.8)",
            borderLeftColor: "rgba(255,255,255,0.2)",
            animation: "spin 0.9s linear infinite",
          }}
        />
      </div>
      <p className="text-white text-[11px] font-bold uppercase tracking-[0.2em] mb-1">Decrypting</p>
      <p className="text-white/40 text-[11px]">Securing your access…</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PDF VIEWER (full-screen)
══════════════════════════════════════════════════════════ */
function PdfViewer({ file, onClose, resolveFileUrl }) {
  const [ready, setReady] = useState(false);
  return (
    <div
      className="fixed inset-0 z-[8000] bg-[#0B1320] flex flex-col"
      style={{ animation: "slideInRight 0.28s cubic-bezier(.16,1,.3,1) both" }}
    >
      {/* Toolbar */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-[#1E2535] flex-shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-[#1E2535] flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft size={17} className="text-slate-300" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-white truncate">{file.title}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={36} className="text-[#7A41F7] animate-spin" />
          </div>
        )}
        {file.fileUrl ? (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(
              resolveFileUrl(file.fileUrl)
            )}&embedded=true`}
            className="w-full h-full border-none"
            style={{ opacity: ready ? 1 : 0, transition: "opacity 0.4s" }}
            title="Document"
            onLoad={() => setReady(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText size={48} className="text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm font-semibold">Document not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOPIC FULL-SCREEN VIEW
══════════════════════════════════════════════════════════ */
function TopicFullScreen({ topic, isApproved, onBack, resolveFileUrl }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get("/student/my-library", {
        params: { subjectId: topic.subjId, chapterId: topic.id, category: "notes" },
      })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : Object.values(data).flat();
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [topic.id, topic.subjId]);

  const handleOpen = (item) => {
    setOpeningId(item._id);
    setDecrypting(true);
    setTimeout(() => {
      setDecrypting(false);
      setOpeningId(null);
      setViewerFile(item);
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-[600] bg-[#0B1320] flex flex-col"
      style={{ animation: "slideInRight 0.28s cubic-bezier(.16,1,.3,1) both" }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 border-b border-[#1E2535]"
        style={{ paddingTop: STATUS_BAR_H }}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#1E2535] flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={17} className="text-slate-300" />
          </button>
          <div className="min-w-0 flex-1">
            {/* Subject pill */}
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-1"
              style={{ background: `${topic.subjColor}22`, color: topic.subjColor }}
            >
              {topic.subjIcon} {topic.subjLabel}
            </div>
            <h2 className="text-[16px] font-semibold text-white leading-tight truncate">{topic.name}</h2>
          </div>
        </div>

        {/* Access badge */}
        <div className="px-4 pb-3">
          {isApproved ? (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-900/30 border border-emerald-800/40 rounded-2xl">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold">✓</span>
              </div>
              <p className="text-[12px] text-emerald-400 font-semibold">
                Approved — first PDF locked by institute, all others open
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-900/30 border border amber-800/40 rounded-2xl" style={{ borderColor: "rgba(217, 119, 6, 0.4)" }}>
              <Lock size={13} className="text-amber-400 flex-shrink-0" />
              <p className="text-[12px] text-amber-400 font-semibold">
                Preview mode — only first PDF available free
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PDF List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div
              key={i}
              className="h-[68px] rounded-2xl bg-[#141B27] border border-[#1E2535]"
              style={{ animation: "pulse 1.5s ease-in-out infinite", opacity: 0.7 - i * 0.1 }}
            />
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <FileText size={48} className="text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm font-semibold">No PDFs uploaded yet</p>
            <p className="text-slate-600 text-[12px] mt-1">Your teacher will add materials soon</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <PdfItem
              key={item._id}
              item={item}
              index={idx}
              isApproved={isApproved}
              onOpen={handleOpen}
              openingId={decrypting ? openingId : null}
            />
          ))
        )}
      </div>

      {decrypting && <DecryptOverlay />}
      {viewerFile && (
        <PdfViewer
          file={viewerFile}
          onClose={() => setViewerFile(null)}
          resolveFileUrl={resolveFileUrl}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOPIC ROW
══════════════════════════════════════════════════════════ */
function TopicRow({ topic, onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-4 px-4 py-4 bg-[#141B27] border border-[#1E2535] rounded-2xl active:scale-[0.98] transition-transform text-left mb-2"
    >
      {/* Subject pill */}
      <div
        className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
        style={{ background: `${topic.subjColor}22`, color: topic.subjColor }}
      >
        {topic.subjLabel}
      </div>

      {/* Name + chapters */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white leading-tight">{topic.name}</p>
        <div className="mt-1">
          <span className="inline-block px-2 py-0.5 rounded-full bg-[#1E2535] text-[11px] text-slate-400 font-medium">
            {topic.chaptersCount} Chapters
          </span>
        </div>
      </div>

      <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN QBANK PAGE
══════════════════════════════════════════════════════════ */
export default function QBank() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [activeSubj, setActiveSubj] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [headerStuck, setHeaderStuck] = useState(false);
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);

  useEffect(() => {
    if (showCounsellorModal) {
      document.body.setAttribute('data-hide-nav', 'true');
    } else {
      document.body.removeAttribute('data-hide-nav');
    }
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, [showCounsellorModal]);

  // Ref to the "Topic wise QBanks" title element
  const qbankSectionRef = useRef(null);
  const scrollRef = useRef(null);

  const isApproved = !!user?.isApproved;

  const resolveFileUrl = (fileUrl) => {
    if (!fileUrl) return "";
    const base = window.__API_URL__ || (import.meta.env.VITE_API_BASE_URL || "");
    return `${base.replace(/\/$/, "")}${fileUrl}`;
  };

  // Sticky header logic: observe when the section title goes offscreen upward
  useEffect(() => {
    const el = qbankSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When section title is NOT intersecting (scrolled past it), stick the header
        setHeaderStuck(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${STATUS_BAR_H}px 0px 0px 0px`,
        threshold: 0,
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filteredTopics = ALL_TOPICS.filter((t) => {
    const matchSubj =
      activeSubj === "All" ||
      (SUBJ_ID_MAP[activeSubj] && t.subjId === SUBJ_ID_MAP[activeSubj]);
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchSubj && matchSearch;
  });

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 0.3; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── STICKY FLOATING HEADER (appears when scrolled past section title) ── */}
      <div
        className="fixed left-0 right-0 z-[500] bg-[#0B1320] border-b border-[#1E2535] transition-all duration-200"
        style={{
          top: STATUS_BAR_H,
          opacity: headerStuck ? 1 : 0,
          pointerEvents: headerStuck ? "auto" : "none",
          transform: headerStuck ? "translateY(0)" : "translateY(-8px)",
        }}
      >
        <div className="px-4 pt-3 pb-2">
          {/* Search row */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#141B27] border border-[#1E2535] rounded-2xl py-2 pl-9 pr-4 text-[13px] text-white placeholder:text-slate-500 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={13} className="text-slate-500" />
                </button>
              )}
            </div>
            <button className="w-9 h-9 bg-[#141B27] border border-[#1E2535] rounded-xl flex items-center justify-center">
              <span className="text-slate-400 text-[11px] font-semibold">Aあ</span>
            </button>
            <button
              className="w-9 h-9 bg-[#141B27] border border-[#1E2535] rounded-xl flex items-center justify-center"
              onClick={() => navigate("/student/personal")}
            >
              <Trophy size={15} className="text-slate-400" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubj(tab)}
                className={`flex-shrink-0 px-4 py-1.5 text-[12px] font-semibold transition-all ${
                  activeSubj === tab
                    ? "text-[#7A41F7] border-b-2 border-[#7A41F7]"
                    : "text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN SCROLL AREA ── */}
      <div
        className="overflow-y-auto no-scrollbar"
        style={{
          minHeight: "100vh",
          paddingTop: STATUS_BAR_H,
          paddingBottom: BOTTOM_NAV_H + (isApproved ? 0 : 64),
          background: "#0B1320",
        }}
      >
        {/* ── HERO SECTION ────────────────────────────────────── */}
        <div className="px-4 pt-4">
          {/* Goal + counsellor row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-medium leading-tight mb-0.5 text-slate-500">Current goal</p>
              <button className="flex items-center gap-1 cursor-pointer">
                <span className="font-bold text-[17px] font-display tracking-tight text-white">
                  {localStorage.getItem("selectedGoal") || "Select Goal"}
                </span>
                <ChevronDown size={18} className="text-white" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCounsellorModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-colors border bg-[#1A1F2E] border-slate-800 text-white hover:bg-white/10"
              >
                <Phone size={14} className="fill-white text-white" strokeWidth={0} />
                <span className="text-xs font-bold tracking-wide">Talk to counsellor</span>
              </button>
              <button onClick={() => navigate('/student/profile')} className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent active:scale-95 transition-all outline-none">
                {user?.profilePic ? (
                  <img src={user.profilePic} className="w-full h-full object-cover" alt="me" />
                ) : (
                  <div className="w-full h-full bg-[#7A41F7] flex items-center justify-center text-white font-bold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* ── 2-card hero ── */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Compete */}
            <div
              className="bg-[#0D1C3A] rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform border border-[#162545] min-h-[120px]"
              onClick={() => navigate("/student/personal")}
            >
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-blue-500/10" />
              <div className="absolute right-2 bottom-0">
                <div className="text-[40px] opacity-20">🏆</div>
              </div>
              <Trophy size={18} className="text-blue-400 mb-2 relative z-10" />
              <p className="text-white font-semibold text-[14px] leading-tight relative z-10">Compete</p>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed relative z-10">
                See where you rank among peers!
              </p>
            </div>

            {/* Ask a Doubt */}
            <div className="bg-[#0A1C16] rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform border border-[#12302A] min-h-[120px]">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10" />
              <div className="absolute right-2 bottom-0">
                <div className="text-[40px] opacity-20">🤓</div>
              </div>
              <MessageCircle size={18} className="text-emerald-400 mb-2 relative z-10" />
              <p className="text-white font-semibold text-[14px] leading-tight relative z-10">Ask a Doubt</p>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed relative z-10">
                Upload image &amp; get instant answers!
              </p>
            </div>
          </div>

          {/* ── PYQ Banner ── */}
          <div
            className="rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform mb-5 border border-[#1E2535]"
            style={{ background: "linear-gradient(135deg, #1a1f3a 0%, #232a4a 100%)" }}
            onClick={() => navigate("/student/library")}
          >
            {/* Big book icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
              <BookOpen size={80} className="text-blue-300" />
            </div>
            <p className="text-[17px] font-bold text-white mb-3 relative z-10">
              Previous Year Question Papers
              <span className="text-blue-400 ml-1">✦</span>
            </p>
            <div className="flex items-center gap-2 relative z-10">
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[12px] font-semibold border border-white/10">
                956+ questions
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-[12px] font-semibold border border-white/10">
                1979 - 2024
              </span>
              <span className="text-blue-300 text-[18px]">✦</span>
            </div>
          </div>
        </div>

        {/* ── TOPIC WISE QBANKS SECTION ──────────────────────── */}
        <div className="px-4">
          {/* Section title — this is the sentinel we observe */}
          <h2 ref={qbankSectionRef} className="text-[18px] font-bold text-white mb-3">
            Topic wise QBanks
          </h2>

          {/* Search + icons row (inline, before sticky kicks in) */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#141B27] border border-[#1E2535] rounded-2xl py-2.5 pl-9 pr-4 text-[13px] text-white placeholder:text-slate-500 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={13} className="text-slate-500" />
                </button>
              )}
            </div>
            <button className="w-10 h-10 bg-[#141B27] border border-[#1E2535] rounded-xl flex items-center justify-center">
              <span className="text-slate-400 text-[12px] font-semibold">Aあ</span>
            </button>
            <button
              className="w-10 h-10 bg-[#141B27] border border-[#1E2535] rounded-xl flex items-center justify-center"
              onClick={() => navigate("/student/personal")}
            >
              <Trophy size={16} className="text-slate-400" />
            </button>
          </div>

          {/* Filter tabs (inline) */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-[#1E2535] mb-4">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubj(tab)}
                className={`flex-shrink-0 px-4 pb-2 pt-1 text-[13px] font-semibold transition-all ${
                  activeSubj === tab
                    ? "text-[#7A41F7] border-b-2 border-[#7A41F7]"
                    : "text-slate-500"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Topic list */}
          {filteredTopics.length === 0 ? (
            <div className="flex flex-col items-center py-20">
              <Search size={40} className="text-slate-700 mb-4" />
              <p className="text-slate-500 text-sm font-semibold">No topics found</p>
              <p className="text-slate-600 text-xs mt-1">Try a different search or subject</p>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} onPress={() => setSelectedTopic(topic)} />
            ))
          )}
        </div>
      </div>

      {/* ── BOTTOM CTA (unapproved only) ─────────────────────── */}
      {!isApproved && (
        <div
          className="fixed left-0 right-0 z-[400] px-3"
          style={{ bottom: BOTTOM_NAV_H + 8 }}
        >
          <div className="rounded-2xl bg-gradient-to-r from-[#7A41F7] to-[#6330E3] flex items-center justify-between px-4 py-3.5 shadow-2xl shadow-purple-900/50">
            <div>
              <p className="text-white font-semibold text-[13px]">5 free questions available</p>
              <p className="text-white/60 text-[11px]">Get unlimited access with Prime.</p>
            </div>
            <button className="bg-white text-[#7A41F7] font-semibold text-[12px] px-4 py-2 rounded-xl flex-shrink-0">
              Join Prime
            </button>
          </div>
        </div>
      )}

      {/* ── TOPIC FULL-SCREEN VIEW ── */}
      {selectedTopic && (
        <TopicFullScreen
          topic={selectedTopic}
          isApproved={isApproved}
          onBack={() => setSelectedTopic(null)}
          resolveFileUrl={resolveFileUrl}
        />
      )}

      {/* Counsellor Bottom Sheet Modal */}
      <CounsellorModal
        isOpen={showCounsellorModal}
        onClose={() => setShowCounsellorModal(false)}
        title="Need help with your subscription?"
      />
    </>
  );
}
