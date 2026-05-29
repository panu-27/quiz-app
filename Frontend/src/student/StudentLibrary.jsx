import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import {
  MagnifyingGlassIcon, XMarkIcon,
  ArrowDownTrayIcon, ChevronRightIcon,
  ArrowLeftIcon, InboxIcon, PlayIcon,
} from "@heroicons/react/24/outline";
import {
  Loader2, Film, FileText, BookOpen, ChevronRight, BarChart2,
  Atom, FlaskConical, Calculator, Dna, ArrowRight, ArrowLeft,
  Phone, Lock, Trophy, MessageCircle, ChevronDown, Search, X
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import StudentHeader from './StudentHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import { SUBJECTS, CHAPTERS, CATEGORIES } from './libraryConfig';
import { PYQ_SUBJECTS } from './pyqData';

const STATUS_BAR_H = 43.5;
const BOTTOM_NAV_H = 70;

const GlobalCSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');

    .lib-root * { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; box-sizing: border-box; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    @keyframes yt-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideSheet {
      from { transform: translateY(30px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.7; }
      50%       { opacity: 0.3; }
    }

    .sk {
      background: linear-gradient(90deg,#1e293b 0%,#2c354a 50%,#1e293b 100%);
      background-size: 200% 100%;
      animation: yt-shimmer 1.5s infinite linear;
      border-radius: 0.75rem;
    }
    .sk-purple {
      background: linear-gradient(90deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.28) 50%,rgba(255,255,255,0.08) 100%);
      background-size: 200% 100%;
      animation: yt-shimmer 1.5s infinite linear;
      border-radius: 0.75rem;
    }

    .chap-row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 14px;
      background: #121A28;
      border: 1.5px solid #1e293b;
      border-radius: 20px;
      padding: 15px 16px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      animation: fadeUp 0.22s ease both;
    }
    .chap-row:active { transform: scale(0.98); }
    .chap-row:hover  { border-color: #7A41F7; }

    .cat-card {
      position: relative; overflow: hidden; border-radius: 20px;
      padding: 20px 16px 18px; display: flex; flex-direction: column;
      align-items: flex-start; gap: 10px; cursor: pointer;
      background: #121A28; border: 1.5px solid #1e293b;
      transition: all 0.18s ease;
      animation: fadeUp 0.25s ease both;
    }
    .cat-card:active { transform: scale(0.97); }
    .cat-card:hover  { border-color: #7A41F7; }

    .res-item {
      background: #121A28; border: 1.5px solid #1e293b;
      padding: 14px; border-radius: 18px;
      display: flex; align-items: center; gap: 14px;
      cursor: pointer; transition: all 0.15s ease;
      animation: fadeUp 0.2s ease both;
    }
    .res-item:active { transform: scale(0.98); }
    .res-item:hover  { border-color: #7A41F7; }

    .desk-res-card {
      background: #fff; border: 1.5px solid #f0f0f6;
      padding: 16px; border-radius: 20px;
      display: flex; align-items: center; gap: 14px;
      cursor: pointer; transition: all 0.18s ease;
    }
    .desk-res-card:hover {
      border-color: #c4b5fd;
      transform: translateY(-1px);
    }

    .pyq-card {
      min-width: 200px;
      border-radius: 20px;
      padding: 18px 16px 16px;
      cursor: pointer;
      transition: all 0.18s ease;
      animation: fadeUp 0.25s ease both;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .pyq-card:active { transform: scale(0.97); }

    .mob-shell {
      position: fixed;
      top: ${STATUS_BAR_H}px;
      left: 0;
      right: 0;
      bottom: ${BOTTOM_NAV_H}px;
      display: flex;
      flex-direction: column;
      background: #0B101A;
      z-index: 50;
    }

    .mob-scroll {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    .mob-scroll::-webkit-scrollbar { display: none; }
    .mob-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const Sk = ({ className = '', style = {} }) => <div className={`sk ${className}`} style={style} />;
const SkPurple = ({ className = '', style = {} }) => <div className={`sk-purple ${className}`} style={style} />;

const ResourceSkeleton = () => (
  <div style={{ background: '#fff', border: '1.5px solid #f0f0f6', padding: 16, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
    <Sk className="flex-shrink-0" style={{ width: 48, height: 48, borderRadius: 12 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Sk style={{ height: 14, width: '65%', borderRadius: 8 }} />
      <Sk style={{ height: 11, width: '35%', borderRadius: 8 }} />
    </div>
    <Sk style={{ width: 32, height: 32, borderRadius: 10 }} />
  </div>
);

/* Top-rank skeleton — exact match to dashboard */
const TopRankMobileSkeleton = () => (
  <div className="relative bg-[#7A41F7] rounded-[2rem] p-5 overflow-hidden min-h-[80px]">
    <div className="flex items-center gap-4">
      <SkPurple style={{ width: 32, height: 32, borderRadius: '50%' }} />
      <SkPurple style={{ width: 56, height: 56, borderRadius: '50%' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkPurple style={{ height: 14, width: 128, borderRadius: 8 }} />
        <SkPurple style={{ height: 11, width: 80, borderRadius: 8 }} />
      </div>
    </div>
  </div>
);

const _cache = { topRank: null };
const cacheKey = (sid, cid, cat) => `${sid}|${cid}|${cat}`;
const SUBJ_META = {
  phy: { label: "PHYSICS", color: "#F59E0B", icon: <Atom size={13} /> },
  che: { label: "CHEMISTRY", color: "#10B981", icon: <FlaskConical size={13} /> },
  mat: { label: "MATHS", color: "#6366F1", icon: <Calculator size={13} /> },
  bio: { label: "BIOLOGY", color: "#EC4899", icon: <Dna size={13} /> },
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
  const { theme } = useTheme();
  const locked = isApproved ? index === 0 : index !== 0;
  const isOpening = openingId === item._id;

  return (
    <button
      disabled={locked}
      onClick={() => !locked && onOpen(item)}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all active:scale-[0.98] text-left ${locked
        ? (theme === 'light'
          ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
          : "opacity-50 cursor-not-allowed border-[#1e293b] bg-[#0B121C]")
        : (theme === 'light'
          ? "border-slate-200/80 bg-white hover:border-purple-200"
          : "border-[#1e293b] bg-[#121A28]")
        }`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'light' ? 'bg-slate-100' : 'bg-[#1e293b]'
        }`}>
        {locked ? (
          <Lock size={16} className="text-slate-400 dark:text-slate-500" />
        ) : (
          <FileText size={16} className="text-[#7A41F7] dark:text-[#9B6AF9]" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold truncate ${locked
          ? "text-slate-400 dark:text-slate-500"
          : (theme === 'light' ? "text-slate-800" : "text-white")
          }`}>
          {item.title}
        </p>
        <p className={`text-[11px] mt-0.5 font-medium ${locked
          ? (theme === 'light' ? "text-slate-400" : "text-slate-600")
          : "text-slate-500"
          }`}>
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
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'light' ? 'bg-[#7A41F7]/10' : 'bg-[#7A41F7]/20'
          }`}>
          <ChevronRight size={15} className="text-[#7A41F7]" />
        </div>
      ) : (
        <Lock size={14} className="text-slate-400 dark:text-slate-600 flex-shrink-0" />
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
      <p className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-1">Decrypting</p>
      <p className="text-white/40 text-[11px]">Securing your access…</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PDF VIEWER (full-screen)
══════════════════════════════════════════════════════════ */
function PdfViewer({ file, onClose, resolveFileUrl }) {
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);
  return (
    <div
      className={`fixed inset-0 z-[8000] flex flex-col transition-colors ${theme === 'light' ? 'bg-[#F4F7FC]' : 'bg-[#0B101A]'
        }`}
      style={{ animation: "slideInRight 0.28s cubic-bezier(.16,1,.3,1) both" }}
    >
      {/* Toolbar */}
      <div className={`h-14 flex items-center gap-3 px-4 border-b flex-shrink-0 ${theme === 'light' ? 'bg-white border-slate-200' : 'border-[#1e293b]'
        }`}>
        <button
          onClick={onClose}
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-[#1e293b] text-slate-300'
            }`}
        >
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-[13px] font-bold truncate ${theme === 'light' ? 'text-slate-800' : 'text-white'
            }`}>{file.title}</p>
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
            <p className="text-slate-500 text-sm font-bold">Document not found</p>
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
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/student/my-library", {
        params: { subjectId: topic.subjId, chapterId: topic.id },
      })
      .then(({ data }) => {
        let list = Array.isArray(data) ? data : Object.values(data).flat();
        if (list.length === 0) {
          list = [
            {
              _id: 'mock-1',
              title: `${topic.name} - Comprehensive Notes`,
              subjectId: topic.subjId,
              subject: topic.subjLabel,
              category: 'notes',
              chapterId: topic.id,
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileSize: '2.4 MB'
            },
            {
              _id: 'mock-2',
              title: `${topic.name} - PYQs 2019-2023`,
              subjectId: topic.subjId,
              subject: topic.subjLabel,
              category: 'pyqs',
              chapterId: topic.id,
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileSize: '4.1 MB'
            }
          ];
        }
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [topic.id, topic.subjId]);

  const handleOpen = (item) => {
    setOpeningId(item._id);
    setDecrypting(true);
    document.body.setAttribute('data-hide-nav', 'true');
    setTimeout(() => {
      setDecrypting(false);
      setOpeningId(null);
      setViewerFile(item);
    }, 1100);
  };

  const handleCloseViewer = () => {
    setViewerFile(null);
    document.body.removeAttribute('data-hide-nav');
  };

  const { theme } = useTheme();

  const CATEGORY_TABS = ["All", "Notes", "PYQs", "Formulas"];
  const CATEGORY_MAP = {
    Notes: "notes",
    PYQs: "pyqs",
    Formulas: "formulas",
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory === "All") return true;
    const targetCategory = CATEGORY_MAP[activeCategory];
    return item.category?.toLowerCase() === targetCategory;
  });

  return (
    <div
      className="fixed inset-0 z-[600] flex flex-col transition-all duration-300"
      style={{
        animation: "slideInRight 0.28s cubic-bezier(.16,1,.3,1) both",
        background: theme === 'light'
          ? 'linear-gradient(180deg, #EBF1FC 0%, #F4F7FC 100%)'
          : 'linear-gradient(180deg, #0E2E5D 0%, #07152B 35%, #0B101A 100%)',
        paddingBottom: isApproved ? 0 : 96,
      }}
    >
      {/* Header (Matching Screenshot) */}
      <div
        className="flex-shrink-0 px-4 pb-4"
        style={{ paddingTop: STATUS_BAR_H + 10 }}
      >
        {/* Back Arrow */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-start text-white/90 active:scale-95 transition-all"
        >
          <ArrowLeft size={22} className={theme === 'light' ? 'text-slate-800' : 'text-white'} />
        </button>

        {/* Chapter Title */}
        <h2 className={`text-[24px] font-bold tracking-tight leading-snug mt-3 ${theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
          {topic.name}
        </h2>

        {/* Horizontal Category Tab Selector (below chapter name) */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-white/10 dark:border-white/5 mt-5 pb-1">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`pb-2 text-[14px] font-bold relative whitespace-nowrap transition-all ${isActive
                  ? (theme === 'light' ? 'text-blue-600' : 'text-blue-400')
                  : (theme === 'light' ? 'text-slate-500' : 'text-slate-400')
                  }`}
              >
                {tab}
                {isActive && (
                  <span className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full ${theme === 'light' ? 'bg-blue-600' : 'bg-blue-400'
                    }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content (Rounded Panel list of PDFs) */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {loading ? (
          <div
            className="rounded-[24px] border p-2 space-y-3"
            style={{
              background: theme === 'light' ? '#FFFFFF' : '#111827',
              borderColor: theme === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.06)',
            }}
          >
            {Array(4).fill(0).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl"
                style={{
                  background: theme === 'light' ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)',
                  animation: "pulse 1.5s ease-in-out infinite",
                  opacity: 0.7 - i * 0.1
                }}
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <FileText size={48} className="text-slate-400/80 mb-4" />
            <p className="text-slate-400 text-sm font-bold">No assets found</p>
            <p className="text-slate-500 text-[12px] mt-1">There are no materials in this category yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, idx) => {
              const originalIdx = items.findIndex((x) => x._id === item._id);
              const locked = isApproved ? originalIdx === 0 : originalIdx !== 0;
              const isOpening = decrypting && openingId === item._id;

              return (
                <button
                  key={item._id}
                  disabled={locked}
                  onClick={() => !locked && handleOpen(item)}
                  className="w-full flex items-center justify-between py-5 px-6 text-left active:scale-[0.98] transition-all disabled:opacity-50 border rounded-lg"
                  style={{
                    background: theme === 'light' ? '#FFFFFF' : '#111827',
                    borderColor: theme === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.06)',
                    boxShadow: theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.02)' : 'none',
                  }}
                >
                  <span className={`text-[15px] font-semibold line-clamp-3 flex-1 pr-4 leading-tight ${locked
                    ? 'text-slate-400 dark:text-slate-550'
                    : (theme === 'light' ? 'text-slate-800' : 'text-white')
                    }`}>
                    {idx + 1}. {item.title}
                  </span>

                  <div className="flex-shrink-0 flex items-center justify-center">
                    {isOpening ? (
                      <Loader2 size={16} className="text-blue-500 animate-spin" />
                    ) : locked ? (
                      <Lock size={15} className="text-slate-400 dark:text-slate-600" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Decrypting Overlay */}
      {decrypting && <DecryptOverlay />}

      {/* PDF Document Viewer Modal */}
      {viewerFile && (
        <PdfViewer
          file={viewerFile}
          onClose={handleCloseViewer}
          resolveFileUrl={resolveFileUrl}
        />
      )}

      {/* Join Prime Banner sitting at a height from the bottom (Full Width) */}
      {!isApproved && (
        <div
          className="absolute bottom-4 left-0 right-0 px-4 py-4 flex items-center justify-between border-t border-b z-[450]"
          style={{
            background: 'linear-gradient(135deg, #7A41F7 0%, #6330E3 100%)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <p className="text-white font-bold text-[13px]">5 free questions available</p>
            <p className="text-white/60 text-[11px]">Get unlimited access with Prime.</p>
          </div>
          <button className="bg-white text-[#7A41F7] font-bold text-[12px] px-4 py-2.5 rounded-md active:scale-95 transition-all flex-shrink-0">
            Join Prime
          </button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TOPIC ROW
══════════════════════════════════════════════════════════ */
function TopicRow({ topic, onPress, resources = [] }) {
  const { theme } = useTheme();
  // Filter resources matching the current topic (chapterId)
  const pdfCount = resources.filter(
    (res) => res.chapterId === topic.id || (res.chapterId && res.chapterId.toString() === topic.id.toString())
  ).length;

  return (
    <button
      onClick={onPress}
      className="w-full flex flex-col items-start rounded-[20px] p-5 mb-3 border text-left active:scale-[0.98] transition-all"
      style={{
        background: theme === 'light' ? '#FFFFFF' : '#111827',
        borderColor: theme === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.06)',
        boxShadow: theme === 'light'
          ? '0 4px 20px rgba(15, 23, 42, 0.04)'
          : '0 10px 30px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Subject Name label in orange/amber style */}
      <span
        className="text-[11px] font-black tracking-wider uppercase mb-1.5"
        style={{ color: topic.subjColor || '#F59E0B' }}
      >
        {topic.subjLabel}
      </span>

      {/* Chapter/Topic Title */}
      <h4
        className={`text-[17px] font-bold tracking-tight leading-snug mb-3 ${theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}
      >
        {topic.name}
      </h4>

      {/* Pill: showing number of pdfs uploaded */}
      <div
        className="inline-flex items-center px-3 py-1 rounded-full border"
        style={{
          background: theme === 'light' ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
          borderColor: theme === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <span
          className={`text-[11px] font-semibold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
        >
          {pdfCount} {pdfCount === 1 ? 'PDF' : 'PDFs'} uploaded
        </span>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════ */
export default function StudentLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const { chapterId } = useParams();
  const selectedTopic = chapterId ? ALL_TOPICS.find(t => t.id === chapterId) : null;

  /* ── Stage navigation ── */
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  /* ── QBank Mobile States ── */
  const [search, setSearch] = useState("");
  const [activeSubj, setActiveSubj] = useState("All");
  const scrollRef = useRef(null);

  // Counsellor Modal
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

  const isApproved = !!user?.isApproved;

  /* ── Top-rank (exact same as dashboard) ── */
  const [topRankName, setTopRankName] = useState(_cache.topRank?.name ?? 'Brandon Matrovs');
  const [topRankPic, setTopRankPic] = useState(_cache.topRank?.pic ?? null);
  const [rankLoading, setRankLoading] = useState(_cache.topRank === null);

  useEffect(() => {
    if (_cache.topRank !== null) {
      setTopRankName(_cache.topRank.name);
      setTopRankPic(_cache.topRank.pic);
      setRankLoading(false);
    } else {
      (async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await api.get('/leaderboard/stats/top-one', { headers: { Authorization: `Bearer ${token}` } });
          const name = res.data?.name || res.data?.studentName || res.data?.student?.name;
          const pic = res.data?.avatar || res.data?.student?.avatar;
          _cache.topRank = { name: name || 'Brandon Matrovs', pic: pic || null };
          if (name) setTopRankName(name);
          if (pic) setTopRankPic(pic);
        } catch { _cache.topRank = { name: 'Brandon Matrovs', pic: null }; }
        finally { setRankLoading(false); }
      })();
    }
  }, []);

  /* ── Quiz cards data (exact same as dashboard) ── */
  const quizzes = [
    { name: 'Physics Quiz', color: 'bg-[#EBF3FF]', badge: 'bg-[#D1E5FF]', tag: 'Physics', icon: <Atom size={18} />, chapters: 28, pyq: '1.2k', subj: 'physics' },
    { name: 'Chemistry Quiz', color: 'bg-[#FFF4EB]', badge: 'bg-[#FFE9D6]', tag: 'Chemistry', icon: <FlaskConical size={18} />, chapters: 28, pyq: '1.3k+', subj: 'chemistry' },
    { name: 'Math Quiz', color: 'bg-[#F3EBFF]', badge: 'bg-[#E6D6FF]', tag: 'Math', icon: <Calculator size={18} />, chapters: 25, pyq: '1.5k+', subj: 'maths' },
    { name: 'Biology Quiz', color: 'bg-[#EBFDEB]', badge: 'bg-[#D6F7D6]', tag: 'Biology', icon: <Dna size={18} />, chapters: 27, pyq: '1.8k+', subj: 'biology' },
  ];

  const handleSelectSubject = sub => { setSelectedSubject(sub); setSelectedChapter(null); setSelectedCategory(null); };
  const handleSelectChapter = ch => { setSelectedChapter(ch); setSelectedCategory(null); };
  const handleSelectCategory = cat => { setSelectedCategory(cat); };

  const mobileBack = () => {
    if (selectedCategory) { setSelectedCategory(null); return; }
    if (selectedChapter) { setSelectedChapter(null); return; }
    if (selectedSubject) { setSelectedSubject(null); return; }
    navigate('/student');
  };

  const resolveMediaUrl = url => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = window.__API_URL__ ? window.__API_URL__.replace(/\/api$/, '') : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    return `${base}${url}`;
  };

  const resolveFileUrl = fileUrl => {
    if (!fileUrl) return '';
    const base = window.__API_URL__ || (import.meta.env.VITE_API_BASE_URL || '');
    return `${base.replace(/\/$/, '')}${fileUrl}`;
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = '/'; };

  /* ── Desktop state (UNCHANGED) ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [desktopSubject, setDesktopSubject] = useState('All');
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [deskOpenFile, setDeskOpenFile] = useState(null);
  const [deskDecrypting, setDeskDecrypting] = useState(false);
  const [deskShowViewer, setDeskShowViewer] = useState(false);
  const [deskViewerReady, setDeskViewerReady] = useState(false);

  useEffect(() => {
    setResourcesLoading(true);
    api.get('/student/my-library')
      .then(({ data }) => {
        let fetched = data ? Object.values(data).flat() : [];
        if (fetched.length === 0) {
          fetched = [
            {
              _id: 'mock-1',
              title: 'Motion in 1D - Comprehensive Notes',
              subjectId: 'phy',
              subject: 'Physics',
              category: 'notes',
              chapterId: 'phy-01',
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileSize: '2.4 MB'
            },
            {
              _id: 'mock-2',
              title: 'Thermodynamics - PYQs 2019-2023',
              subjectId: 'phy',
              subject: 'Physics',
              category: 'pyqs',
              chapterId: 'phy-02',
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileSize: '4.1 MB'
            }
          ];
        }
        setResources(fetched);
      })
      .catch(() => setResources([]))
      .finally(() => setResourcesLoading(false));
  }, []);


  const SUBJECT_COLORS = {
    Physics: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
    Chemistry: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
    Maths: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400' },
    Biology: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-400' },
  };
  const categoryIcons = { Notes: '/student/notes.svg', PYQs: '/student/pdf.svg', Formulas: '/student/formulas.svg', Default: '/student/notes.svg' };

  const filteredResources = resources.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const matchSub = desktopSubject === 'All' || r.subject === desktopSubject;
    const matchSrch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSub && matchSrch;
  });

  const desktopCategories = ['All', 'Notes', 'PYQs', 'Formulas'];
  const desktopSubjects = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];
  const mobileStage = selectedCategory ? 4 : selectedChapter ? 3 : selectedSubject ? 2 : 1;

  /* ── Top-rank content (exact same as dashboard) ── */
  const TopRankContent = () => (
    <div className="flex items-center gap-2 relative z-10">
      <div className="w-7 h-7 text-xs rounded-full border-2 border-white/40 flex items-center justify-center text-white font-bold flex-shrink-0 -ml-3">#1</div>
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-pink-200 border-2 border-white/20 overflow-hidden">
          <img src={topRankPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(topRankName)}`} alt="Top student" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="text-white min-w-0 flex-1 pr-12">
        <p className="text-[15px] font-bold truncate">{topRankName}</p>
        <p className="text-[12px] opacity-70 font-medium">Top of the week 🏆</p>
      </div>
    </div>
  );

  // Sticky header logic removed in favor of native CSS sticky positioning

  const filteredTopics = ALL_TOPICS.filter((t) => {
    const matchSubj =
      activeSubj === "All" ||
      (SUBJ_ID_MAP[activeSubj] && t.subjId === SUBJ_ID_MAP[activeSubj]);
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchSubj && matchSearch;
  });

  return (
    <div className="lib-root" style={{ background: '#F6F8FC' }}>
      <GlobalCSS />

      {/* ═══════════════════════════════════════════════════
          DESKTOP  (UNCHANGED)
      ═══════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StudentHeader />
        <div className="flex flex-1 max-w-7xl mx-auto w-full px-8 md:px-8 lg:px-12 2xl:px-20 py-8 gap-7">
          <aside className="w-56 flex-shrink-0 flex flex-col gap-4">
            <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -right-1 -top-4 w-12 h-12 bg-white/5 rounded-full" />
              <BookOpen size={22} className="mb-3 relative z-10 opacity-80" />
              <p className="font-black text-base relative z-10 leading-tight">Class<br />Library</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 relative z-10">Secure Repository</p>
            </div>
            <div className="bg-white rounded-2xl p-2 border border-slate-100">
              <button onClick={() => setActiveTab('resources')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'resources' ? 'text-white' : 'text-slate-500 hover:bg-slate-50'}`} style={activeTab === 'resources' ? { background: 'linear-gradient(135deg,#7c3aed,#6366f1)' } : {}}><FileText size={16} />Resources</button>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject</p>
              <div className="space-y-1">{desktopSubjects.map(sub => <button key={sub} onClick={() => setDesktopSubject(sub)} className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${desktopSubject === sub ? 'bg-[#F3EBFF] text-[#7A41F7]' : 'text-slate-500 hover:bg-slate-50'}`}>{sub}</button>)}</div>
            </div>
            {activeTab === 'resources' && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</p>
                <div className="space-y-1">{desktopCategories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeCategory === cat ? 'bg-[#F3EBFF] text-[#7A41F7]' : 'text-slate-500 hover:bg-slate-50'}`}>{cat}</button>)}</div>
              </div>
            )}
          </aside>

          <div className="flex-1 flex flex-col min-w-0 gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/student')} className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-500 hover:text-[#7A41F7] hover:border-purple-200 transition-all flex-shrink-0"><ArrowLeftIcon className="w-5 h-5" /></button>
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" placeholder="Search resources…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:border-[#7A41F7] focus:ring-2 focus:ring-purple-100 transition-all outline-none" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><XMarkIcon className="w-4 h-4" /></button>}
              </div>
            </div>
            {activeTab === 'resources' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div><h2 className="text-xl font-black text-slate-800">Study Resources</h2><p className="text-sm text-slate-400 mt-0.5">{resourcesLoading ? 'Loading…' : `${filteredResources.length} assets found`}</p></div>
                </div>
                {resourcesLoading ? (
                  <div className="grid grid-cols-2 gap-4">{Array(6).fill(0).map((_, i) => <ResourceSkeleton key={i} />)}</div>
                ) : filteredResources.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredResources.map(item => {
                      const subColor = SUBJECT_COLORS[item.subject] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-300' };
                      return (
                        <div key={item._id} className="desk-res-card" onClick={() => { setDeskOpenFile(item); setDeskViewerReady(false); setDeskDecrypting(true); setTimeout(() => { setDeskDecrypting(false); setDeskShowViewer(true); }, 1200); }}>
                          <div className={`w-12 h-12 ${subColor.bg} rounded-xl flex items-center justify-center shrink-0`}><img src={categoryIcons[item.category] || categoryIcons.Default} alt={item.category} className="w-7 h-7 object-contain" onError={e => { e.target.src = categoryIcons.Default; }} /></div>
                          <div className="flex-1 min-w-0"><h4 className="text-[14px] font-bold text-slate-800 truncate">{item.title}</h4><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] font-black ${subColor.text} uppercase`}>{item.subject}</span><span className="w-1 h-1 bg-slate-200 rounded-full" /><span className="text-[10px] font-semibold text-slate-400 uppercase">{item.category}</span></div></div>
                          <div className="w-8 h-8 rounded-xl bg-[#F3EBFF] text-[#7A41F7] flex items-center justify-center"><ChevronRightIcon className="w-4 h-4 stroke-[2.5]" /></div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200"><InboxIcon className="w-12 h-12 text-slate-200 mb-4" /><p className="text-sm font-bold text-slate-400">No resources found</p></div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Desktop modals */}
      {deskDecrypting && (
        <div className="hidden md:flex fixed inset-0 z-[2000] bg-black/70 flex-col items-center justify-center backdrop-blur-sm">
          <div className="relative mb-5"><div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center"><svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg></div><div className="absolute inset-0 rounded-2xl border-2 border-t-white/80 border-white/10 animate-spin" /></div>
          <p className="text-white text-xs font-black uppercase tracking-[0.2em]">Decrypting</p>
        </div>
      )}
      {deskShowViewer && deskOpenFile && (
        <div className="hidden md:flex fixed inset-0 z-[3000] bg-white flex-col animate-in fade-in duration-200">
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-5 shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0"><button onClick={() => { setDeskShowViewer(false); setDeskOpenFile(null); setDeskViewerReady(false); }} className="p-2 hover:bg-slate-100 rounded-xl"><XMarkIcon className="w-5 h-5 text-slate-500" /></button><div className="truncate"><h3 className="text-[14px] font-bold text-slate-900 truncate">{deskOpenFile.title}</h3><p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight mt-0.5">{deskOpenFile.subject} · {deskOpenFile.category}</p></div></div>
            <button onClick={() => { if (deskOpenFile.fileUrl) window.open(resolveFileUrl(deskOpenFile.fileUrl), '_blank'); }} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95" style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}><ArrowDownTrayIcon className="w-4 h-4" />Download</button>
          </div>
          <div className="flex-1 bg-slate-100 relative overflow-hidden">
            {!deskViewerReady && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}
            {deskOpenFile.fileUrl ? <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveFileUrl(deskOpenFile.fileUrl))}&embedded=true`} className={`w-full h-full border-none transition-opacity duration-500 ${deskViewerReady ? 'opacity-100' : 'opacity-0'}`} title="Document Viewer" onLoad={() => setDeskViewerReady(true)} /> : <div className="flex flex-col items-center justify-center h-full"><InboxIcon className="w-10 h-10 text-slate-200 mb-3" /><p className="text-sm font-bold text-slate-400">Document not found</p></div>}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          MOBILE
      ═══════════════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* ── MAIN SCROLL AREA ── */}
        <div
          className="no-scrollbar"
          style={{
            minHeight: "100vh",
            paddingTop: STATUS_BAR_H,
            paddingBottom: BOTTOM_NAV_H + (isApproved ? 0 : 64),
            background: theme === 'dark' ? '#0B101A' : '#F4F7FC',
          }}
        >
          {/* ── HERO SECTION ────────────────────────────────────── */}
          <div className="px-4 pt-4">
            {/* Goal + counsellor row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">CURRENT GOAL</p>
                <button className={`flex items-center gap-1 font-black text-[18px] ${theme === 'light' ? 'text-slate-800' : 'text-white'
                  }`}>
                  {localStorage.getItem("selectedGoal") || "IIT JEE"}
                  <ChevronDown size={16} className="text-slate-400 dark:text-slate-500 mt-0.5" />
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowCounsellorModal(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 border rounded-full shadow-sm active:scale-95 transition-all text-xs font-bold ${theme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#121A28] border-[#1e293b] text-white/70'
                    }`}
                >
                  <Phone size={12} className="fill-transparent" /> Talk to counsellor
                </button>
                <button onClick={() => navigate('/student/profile')} className="w-8 h-8 rounded-full overflow-hidden border-2 shadow-md border-white/30 active:scale-95 transition-all outline-none flex-shrink-0">
                  {user?.profilePic ? (
                    <img src={resolveMediaUrl(user.profilePic)} className="w-full h-full object-cover" alt="me" />
                  ) : (
                    <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* ── 2-card hero ── */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* PYQ Book */}
              <div
                className={`rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all border min-h-[120px] ${theme === 'light'
                  ? 'bg-[#EBF3FF] border-[#D1E5FF]'
                  : 'bg-[#0D1C3A] border-[#162545]'
                  }`}
                onClick={() => navigate("/student/pyq")}
              >
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-blue-500/10" />
                <div className="absolute right-2 bottom-0">
                  <div className="text-[40px] opacity-20">🏆</div>
                </div>
                <Trophy size={18} className="text-blue-500 dark:text-blue-400 mb-2 relative z-10" />
                <p className={`font-bold text-[14px] leading-tight relative z-10 ${theme === 'light' ? 'text-blue-900' : 'text-white'
                  }`}>PYQ Book</p>
                <p className={`text-[11px] mt-1 leading-relaxed relative z-10 ${theme === 'light' ? 'text-blue-800/80' : 'text-slate-400'
                  }`}>
                  Practice previous year questions!
                </p>
              </div>

              {/* Give Quiz */}
              <div
                className={`rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all border min-h-[120px] ${theme === 'light'
                  ? 'bg-[#EBFDEB] border-[#D6F7D6]'
                  : 'bg-[#0A1C16] border-[#12302A]'
                  }`}
                onClick={() => navigate("/student/quiz")}
              >
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10" />
                <div className="absolute right-2 bottom-0">
                  <div className="text-[40px] opacity-20">🤓</div>
                </div>
                <MessageCircle size={18} className="text-emerald-500 dark:text-emerald-400 mb-2 relative z-10" />
                <p className={`font-bold text-[14px] leading-tight relative z-10 ${theme === 'light' ? 'text-emerald-950' : 'text-white'
                  }`}>Give Quiz</p>
                <p className={`text-[11px] mt-1 leading-relaxed relative z-10 ${theme === 'light' ? 'text-emerald-800/80' : 'text-slate-400'
                  }`}>
                  Test your speed and accuracy!
                </p>
              </div>
            </div>

            {/* ── PYQ Banner ── */}
            <div
              className={`rounded-2xl p-4 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all mb-5 border ${theme === 'light' ? 'border-transparent' : 'border-[#1e293b]'
                }`}
              style={{
                background: theme === 'light'
                  ? 'linear-gradient(135deg, #7A41F7 0%, #9B6AF9 100%)'
                  : 'linear-gradient(135deg, #1a1f3a 0%, #232a4a 100%)'
              }}
              onClick={() => navigate("/student/pyq/papers")}
            >
              {/* Big book icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                <BookOpen size={80} className="text-blue-300" />
              </div>
              <p className="text-[17px] font-black text-white mb-3 relative z-10">
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
          <div>
            {/* Sticky Wrapper for Title, Search & Filters */}
            <div className={`sticky top-[43.5px] z-30 px-4 pt-2 pb-3.5 flex flex-col gap-3 transition-colors duration-300 ${theme === 'light' ? 'bg-[#F4F7FC]' : 'bg-[#0B101A]'
              }`}>
              {/* Section title */}
              <h2 className={`text-[18px] font-black ${theme === 'light' ? 'text-slate-800' : 'text-white'
                }`}>
                Target Coachings Study Material
              </h2>

              {/* Search + icons row */}
              <div className="flex items-center gap-2.5">
                <div className="relative group transition-all duration-300 ease-out flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 transition-colors group-focus-within:text-[#25D3A4]" size={18} />
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full py-3.5 pl-11 pr-10 rounded-xl text-sm font-semibold outline-none transition-all duration-300 border border-transparent
                      ${theme === 'light'
                        ? 'bg-white text-slate-800 placeholder-slate-500 focus:border-[#25D3A4]/30 focus:ring-4 focus:ring-[#25D3A4]/10 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
                        : 'bg-white/10 text-white placeholder-white/60 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400'
                      }
                    `}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                      <X size={16} className="text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
                <button className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all shrink-0
                  ${theme === 'light' ? 'bg-white text-slate-500 hover:bg-slate-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  <span className="text-[12px] font-bold">Aあ</span>
                </button>
                <button
                  onClick={() => navigate("/student/personal")}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-95 transition-all shrink-0
                  ${theme === 'light' ? 'bg-white text-slate-500 hover:bg-slate-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                >
                  <Trophy size={18} />
                </button>
              </div>

              {/* Filter tabs */}
              <div className={`flex gap-1 overflow-x-auto no-scrollbar border-b pb-2 ${theme === 'light' ? 'border-slate-200' : 'border-[#1e293b]'
                }`}>
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubj(tab)}
                    className={`flex-shrink-0 px-4 py-1 text-[13px] font-bold transition-all ${activeSubj === tab
                      ? "text-[#7A41F7] border-b-2 border-[#7A41F7]"
                      : "text-slate-500"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic list wrapper */}
            <div className="px-4 mt-2">
              {filteredTopics.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <Search size={40} className="text-slate-700 mb-4" />
                  <p className="text-slate-500 text-sm font-bold">No topics found</p>
                  <p className="text-slate-600 text-xs mt-1">Try a different search or subject</p>
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <TopicRow key={topic.id} topic={topic} onPress={() => navigate(`/student/library/chapter/${topic.id}`)} resources={resources} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM CTA (unapproved only) ───────────────────────
        {!isApproved && (
          <div
            className="fixed left-0 right-0 z-[400] px-3"
            style={{ bottom: BOTTOM_NAV_H + 8 }}
          >
            <div className="rounded-2xl bg-gradient-to-r from-[#7A41F7] to-[#6330E3] flex items-center justify-between px-4 py-3.5 border border-purple-600/30">
              <div>
                <p className="text-white font-bold text-[13px]">5 free questions available</p>
                <p className="text-white/60 text-[11px]">Get unlimited access with Prime.</p>
              </div>
              <button className="bg-white text-[#7A41F7] font-bold text-[12px] px-4 py-2 rounded-xl flex-shrink-0">
                Join Prime
              </button>
            </div>
          </div>
        )} */}

        {/* ── TOPIC FULL-SCREEN VIEW ── */}
        {selectedTopic && (
          <TopicFullScreen
            topic={selectedTopic}
            isApproved={isApproved}
            onBack={() => navigate('/student/library')}
            resolveFileUrl={resolveFileUrl}
          />
        )}

        {/* Counsellor Bottom Sheet Modal */}
        {showCounsellorModal && (
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center"
            onClick={() => setShowCounsellorModal(false)}
          >
            <div className="absolute inset-0 bg-black/65" style={{ backdropFilter: 'blur(3px)' }} />
            <div
              className={`relative w-full max-w-md overflow-hidden ${theme === 'dark' ? 'bg-[#111827]' : 'bg-white'}`}
              style={{ borderRadius: '12px 12px 0 0' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-center pt-4 pb-3">
                <div className={`w-10 h-1 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-300'}`} />
              </div>
              <div className="px-6 pt-8 pb-2">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <h2 className={`font-black leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: 19 }}>
                      Need help with your subscription?
                    </h2>
                    <p className={`text-[12px] mt-2 leading-relaxed ${theme === 'dark' ? 'text-white/55' : 'text-slate-500'}`}>
                      Talk to our experts who will guide you with all you need to crack it.
                    </p>
                  </div>
                  <div className={`w-[68px] h-[68px] rounded-full overflow-hidden flex-shrink-0 border-2 ${theme === 'dark' ? 'border-white/10 bg-[#1F2937]' : 'border-slate-200 bg-slate-100'}`}>
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=counsellorF&backgroundColor=b6e3f4&clothingColor=3c4f5c"
                      className="w-full h-full object-cover"
                      alt="Expert"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 pt-6 pb-3">
                <a
                  href="tel:+918585858585"
                  className={`w-full flex items-center justify-center gap-3 active:scale-95 transition-transform ${theme === 'dark' ? 'bg-white text-[#111827]' : 'bg-[#1EBA9B] text-white shadow-md'}`}
                  style={{ borderRadius: 8, padding: '14px 24px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="font-bold" style={{ fontSize: 15 }}>+91 8585858585</span>
                </a>
              </div>
              <div className="px-6 pb-12">
                <button
                  onClick={() => setShowCounsellorModal(false)}
                  className={`w-full flex items-center justify-center gap-1.5 py-4 font-bold tracking-widest active:opacity-70 transition-opacity ${theme === 'dark' ? 'text-white' : 'text-[#1EBA9B]'}`}
                  style={{ fontSize: 11.5, letterSpacing: '0.08em' }}
                >
                  GET A CALL FROM US <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

