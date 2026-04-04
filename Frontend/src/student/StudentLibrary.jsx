import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon, XMarkIcon,
  ArrowDownTrayIcon, ChevronRightIcon,
  ArrowLeftIcon, InboxIcon, PlayIcon,
} from "@heroicons/react/24/outline";
import { Loader2, Film, FileText, BookOpen, ChevronRight } from 'lucide-react';
import StudentHeader from './StudentHeader';
import api from '../api/axios';
import { SUBJECTS, CHAPTERS, CATEGORIES } from './libraryConfig';

/* ══════════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════════ */
const GlobalCSS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

    .lib-root * { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .inner-scroll-area::-webkit-scrollbar { display: none; }
    .inner-scroll-area { -ms-overflow-style: none; scrollbar-width: none; }

    @keyframes yt-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes slideSheet {
      from { transform: translateY(30px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .sk {
      background: linear-gradient(90deg,#e2e8f0 0%,#f8fafc 50%,#e2e8f0 100%);
      background-size: 200% 100%;
      animation: yt-shimmer 1.5s infinite linear;
      border-radius: 0.75rem;
    }

    .subj-card {
      position: relative; overflow: hidden; border-radius: 22px;
      padding: 20px 18px 18px;
      display: flex; flex-direction: column; align-items: flex-start; gap: 0;
      cursor: pointer; border: none; text-align: left;
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
      animation: scaleIn 0.35s ease both;
    }
    .subj-card:active { transform: scale(0.96) !important; }
    .subj-card:hover  { transform: translateY(-3px); }

    .chap-row {
      width: 100%; display: flex; align-items: center; gap: 14px;
      background: #fff; border: 1.5px solid #f0f0f6;
      border-radius: 16px; padding: 13px 14px;
      cursor: pointer; text-align: left;
      transition: all 0.15s ease;
      animation: fadeUp 0.25s ease both;
    }
    .chap-row:active { transform: scale(0.98); }
    .chap-row:hover  { border-color: #c4b5fd; box-shadow: 0 4px 18px rgba(124,58,237,0.09); }

    .cat-card {
      position: relative; overflow: hidden; border-radius: 18px;
      padding: 18px 16px 16px; display: flex; flex-direction: column;
      align-items: flex-start; gap: 10px; cursor: pointer;
      background: #fff; border: 1.5px solid #f0f0f6;
      transition: all 0.18s ease;
      animation: fadeUp 0.25s ease both;
    }
    .cat-card:active { transform: scale(0.97); }
    .cat-card:hover  { border-color: #c4b5fd; box-shadow: 0 4px 18px rgba(124,58,237,0.08); }

    .res-item {
      background: #fff; border: 1.5px solid #f0f0f6;
      padding: 14px; border-radius: 18px;
      display: flex; align-items: center; gap: 14px;
      cursor: pointer; transition: all 0.15s ease;
      animation: fadeUp 0.2s ease both;
    }
    .res-item:active { transform: scale(0.98); }
    .res-item:hover  { border-color: #c4b5fd; box-shadow: 0 4px 18px rgba(124,58,237,0.08); }

    .crumb-pill {
      flex-shrink: 0; padding: 5px 12px; border-radius: 99px;
      font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
      border: none; cursor: pointer; transition: all 0.15s;
    }

    .desk-res-card {
      background: #fff; border: 1.5px solid #f0f0f6;
      padding: 16px; border-radius: 20px;
      display: flex; align-items: center; gap: 14px;
      cursor: pointer; transition: all 0.18s ease;
    }
    .desk-res-card:hover {
      border-color: #c4b5fd;
      box-shadow: 0 8px 28px rgba(124,58,237,0.1);
      transform: translateY(-1px);
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

const Sk = ({ className = '' }) => <div className={`sk ${className}`} />;

const ResourceSkeleton = () => (
  <div style={{ background: '#fff', border: '1.5px solid #f0f0f6', padding: 16, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
    <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Sk className="h-4 w-2/3" />
      <Sk className="h-3 w-1/3" />
    </div>
    <Sk className="w-8 h-8 rounded-full flex-shrink-0" />
  </div>
);

const _cache = {};
const cacheKey = (sid, cid, cat) => `${sid}|${cid}|${cat}`;

const SUBJ_PALETTES = {
  phy: {
    grad: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 60%, #6366f1 100%)',
    shadow: 'rgba(99,102,241,0.38)',
    deco1: 'rgba(255,255,255,0.10)', deco2: 'rgba(255,255,255,0.06)',
    pill: 'rgba(255,255,255,0.20)', pillTxt: 'rgba(255,255,255,0.90)',
  },
  che: {
    grad: 'linear-gradient(145deg, #059669 0%, #10b981 55%, #0d9488 100%)',
    shadow: 'rgba(16,185,129,0.38)',
    deco1: 'rgba(255,255,255,0.10)', deco2: 'rgba(255,255,255,0.06)',
    pill: 'rgba(255,255,255,0.20)', pillTxt: 'rgba(255,255,255,0.90)',
  },
  mat: {
    grad: 'linear-gradient(145deg, #7c3aed 0%, #9333ea 55%, #a855f7 100%)',
    shadow: 'rgba(147,51,234,0.38)',
    deco1: 'rgba(255,255,255,0.10)', deco2: 'rgba(255,255,255,0.06)',
    pill: 'rgba(255,255,255,0.20)', pillTxt: 'rgba(255,255,255,0.90)',
  },
  bio: {
    grad: 'linear-gradient(145deg, #db2777 0%, #ec4899 55%, #f43f5e 100%)',
    shadow: 'rgba(236,72,153,0.38)',
    deco1: 'rgba(255,255,255,0.10)', deco2: 'rgba(255,255,255,0.06)',
    pill: 'rgba(255,255,255,0.20)', pillTxt: 'rgba(255,255,255,0.90)',
  },
};



/* ══════════════════════════════════════════════════════════════════
   STEP 1 — Subject Grid
══════════════════════════════════════════════════════════════════ */
const SubjectGrid = ({ onSelect }) => (
  <div style={{ padding: '20px 18px 32px' }}>
    <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
      Choose a Subject
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {SUBJECTS.map((sub, idx) => {
        const pal = SUBJ_PALETTES[sub.id] || SUBJ_PALETTES.phy;
        return (
          <button key={sub.id} className="subj-card" onClick={() => onSelect(sub)}
            style={{ background: pal.grad, boxShadow: `0 10px 32px -4px ${pal.shadow}`, animationDelay: `${idx * 0.06}s` }}>
            
            <div style={{ position: 'absolute', right: -18, bottom: -18, width: 80, height: 80, borderRadius: '50%', background: pal.deco1, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 14, bottom: 42, width: 34, height: 34, borderRadius: '50%', background: pal.deco2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: -10, top: -10, width: 44, height: 44, borderRadius: '50%', background: pal.deco1, pointerEvents: 'none' }} />
            <div style={{ fontSize: 34, lineHeight: 1, marginBottom: 14, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' }}>
              {sub.emoji}
            </div>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#fff', margin: 0, position: 'relative', zIndex: 1, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
              {sub.label}
            </p>
            <div style={{ marginTop: 8, padding: '3px 9px', borderRadius: 99, background: pal.pill, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: pal.pillTxt, letterSpacing: '0.03em' }}>
                {CHAPTERS[sub.id].length} chapters
              </span>
            </div>
            <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 1, width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={12} color="#fff" />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   STEP 2 — Chapter list
══════════════════════════════════════════════════════════════════ */
const ChapterList = ({ subject, onSelect }) => {
  const pal = SUBJ_PALETTES[subject.id] || SUBJ_PALETTES.phy;
  return (
    <div style={{ padding: '20px 18px 92px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
        {subject.label} — Select Chapter
      </p>
      {CHAPTERS[subject.id].map((ch, idx) => (
        <button key={ch.id} className="chap-row" onClick={() => onSelect(ch)}
          style={{ animationDelay: `${Math.min(idx * 0.04, 0.3)}s` }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: pal.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', boxShadow: `0 3px 10px ${pal.shadow}`, fontFamily: 'monospace' }}>
            {String(idx + 1).padStart(2, '0')}
          </div>
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13.5, fontWeight: 700, color: '#1e293b', lineHeight: 1.35 }}>
            {ch.label}
          </span>
          <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={14} color="#7c3aed" />
          </div>
        </button>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   STEP 3 — Category Grid
══════════════════════════════════════════════════════════════════ */
const CategoryGrid = ({ subject, chapter, onSelect }) => (
  <div style={{ padding: '20px 18px 32px' }}>
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>{chapter.label}</p>
      <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500 }}>
        {subject.label} · Pick material type
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {CATEGORIES.map((cat, idx) => (
        <button key={cat.id} className="cat-card" onClick={() => onSelect(cat)}
          style={{ animationDelay: `${idx * 0.05}s`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ position: 'absolute', right: -12, bottom: -12, width: 52, height: 52, borderRadius: '50%', background: cat.color, opacity: 0.08, pointerEvents: 'none' }} />
          <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative', zIndex: 1 }}>
            {cat.icon}
          </div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.3, position: 'relative', zIndex: 1 }}>
            {cat.label}
          </p>
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
            <ChevronRight size={13} color="#cbd5e1" />
          </div>
        </button>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   STEP 4 — Resource list
══════════════════════════════════════════════════════════════════ */
const ResourceList = ({ subject, chapter, category, resolveFileUrl }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openingFile, setOpeningFile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);

  const pal = SUBJ_PALETTES[subject.id] || SUBJ_PALETTES.phy;
  const key = cacheKey(subject.id, chapter.id, category.id);

  useEffect(() => {
    if (_cache[key]) { setItems(_cache[key]); setLoading(false); return; }
    setLoading(true); setError(null);
    api.get('/student/my-library', { params: { subjectId: subject.id, chapterId: chapter.id, category: category.id } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : Object.values(data).flat();
        _cache[key] = list; setItems(list);
      })
      .catch(() => setError('Failed to load. Check your connection.'))
      .finally(() => setLoading(false));
  }, [key]);

  const handleOpenFile = item => {
    setOpeningFile(item); setViewerReady(false); setIsDecrypting(true);
    document.body.setAttribute('data-hide-nav', 'true');
    setTimeout(() => { setIsDecrypting(false); setShowViewer(true); }, 1200);
  };

  const handleCloseViewer = () => {
    setShowViewer(false); setOpeningFile(null); setViewerReady(false);
    document.body.removeAttribute('data-hide-nav');
  };

  const handleDownload = async (e, fileUrl, filename) => {
    e.stopPropagation();
    try {
      const fullUrl = resolveFileUrl(fileUrl);
      const res = await api.get(fullUrl, { responseType: 'blob', baseURL: '' });
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = filename || 'document.pdf';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(blobUrl);
    } catch { window.open(resolveFileUrl(fileUrl), '_blank'); }
  };

  if (loading) return (
    <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2, 3].map(i => <ResourceSkeleton key={i} />)}
    </div>
  );
  if (error) return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 28, margin: '0 0 8px' }}>😕</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>{error}</p>
    </div>
  );
  if (!items.length) return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <InboxIcon style={{ width: 48, height: 48, color: '#e2e8f0', margin: '0 auto 12px', display: 'block' }} />
      <p style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>No {category.label} yet</p>
      <p style={{ fontSize: 12, color: '#c4c4cc', marginTop: 4 }}>Your teacher will upload materials here soon.</p>
    </div>
  );

  return (
    <>
      <div style={{ padding: '20px 18px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            {category.label}
          </p>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: 99 }}>
            {items.length} file{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {items.map((item, idx) => (
          <div key={item._id} className="res-item" onClick={() => handleOpenFile(item)}
            style={{ animationDelay: `${Math.min(idx * 0.05, 0.3)}s` }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, background: pal.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${pal.shadow}`, fontSize: 20 }}>
              {category.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: '#7c3aed', background: '#f5f3ff', padding: '2px 7px', borderRadius: 4 }}>
                  {subject.label}
                </span>
                {item.fileSize && (
                  <>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#d1d5db', display: 'inline-block' }} />
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{item.fileSize}</span>
                  </>
                )}
              </div>
            </div>
            <button onClick={e => handleDownload(e, item.fileUrl, item.title)}
              style={{ width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer', background: '#f7f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
              <ArrowDownTrayIcon style={{ width: 15, height: 15, color: '#94a3b8' }} />
            </button>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: pal.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${pal.shadow}` }}>
              <ChevronRightIcon style={{ width: 14, height: 14, color: '#fff', strokeWidth: 2.5 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Decrypting overlay */}
      {isDecrypting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(7,5,20,0.75)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div style={{ position: 'absolute', inset: -2, borderRadius: 20, border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,0.8)', animation: 'spin 0.9s linear infinite' }} />
          </div>
          <p style={{ color: '#fff', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>Decrypting</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}>Securing your access…</p>
        </div>
      )}

      {/* Full-screen viewer */}
      {showViewer && openingFile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: '#fff', display: 'flex', flexDirection: 'column', animation: 'slideSheet 0.25s cubic-bezier(.16,1,.3,1) both' }}>
          <div style={{ height: 56, borderBottom: '1px solid #f1f1f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <button onClick={handleCloseViewer} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', background: '#f7f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <XMarkIcon style={{ width: 18, height: 18, color: '#64748b' }} />
              </button>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {openingFile.title}
                </h3>
                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {subject.label} · {category.label}
                </p>
              </div>
            </div>
            <button onClick={e => handleDownload(e, openingFile.fileUrl, openingFile.title)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: pal.grad, color: '#fff', fontSize: 12, fontWeight: 700, boxShadow: `0 3px 12px ${pal.shadow}` }}>
              <ArrowDownTrayIcon style={{ width: 14, height: 14 }} />
              Download
            </button>
          </div>
          <div style={{ flex: 1, background: '#f4f4f8', position: 'relative', overflow: 'hidden' }}>
            {!viewerReady && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} style={{ color: '#c4b5fd', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            {openingFile.fileUrl ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveFileUrl(openingFile.fileUrl))}&embedded=true`}
                style={{ width: '100%', height: '100%', border: 'none', opacity: viewerReady ? 1 : 0, transition: 'opacity 0.3s' }}
                title="Document Viewer"
                onLoad={() => setViewerReady(true)}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <InboxIcon style={{ width: 40, height: 40, color: '#e2e8f0', marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>Document not found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MOBILE HEADER  (flex-shrink: 0 — never scrolls away)
══════════════════════════════════════════════════════════════════ */
const MobileHeader = ({ selectedSubject, selectedChapter, selectedCategory, onBack, onReset }) => {
  const pal = selectedSubject ? SUBJ_PALETTES[selectedSubject.id] : null;
  const bg = pal ? pal.grad : 'linear-gradient(145deg, #7c3aed 0%, #6366f1 100%)';

  const title = selectedCategory ? selectedCategory.label
    : selectedChapter ? selectedChapter.label
    : selectedSubject ? selectedSubject.label
    : 'Library';

  const subtitle = selectedCategory ? `${selectedSubject.label} · ${selectedChapter.label}`
    : selectedChapter ? `${selectedSubject.label} · Choose material`
    : selectedSubject ? `${CHAPTERS[selectedSubject.id].length} chapters`
    : 'Secure Repository';

  return (
    <div style={{ background: bg, padding: '32px 18px 40px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -20, left: -20, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
    
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 11, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeftIcon style={{ width: 18, height: 18, color: '#fff' }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
            {title}
          </p>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {(selectedSubject || selectedChapter || selectedCategory) && (
        <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, overflowX: 'auto', position: 'relative', zIndex: 1 }}>
          {selectedSubject && (
            <button className="crumb-pill" onClick={() => onReset('subject')} style={{ background: 'rgba(255,255,255,0.20)', color: '#fff' }}>
              {selectedSubject.emoji} {selectedSubject.label}
            </button>
          )}
          {selectedChapter && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>›</span>
              <button className="crumb-pill" onClick={() => onReset('chapter')} style={{ background: 'rgba(255,255,255,0.20)', color: '#fff' }}>
                {selectedChapter.label}
              </button>
            </>
          )}
          {selectedCategory && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>›</span>
              <span className="crumb-pill" style={{ background: 'rgba(255,255,255,0.32)', color: '#fff', cursor: 'default' }}>
                {selectedCategory.icon} {selectedCategory.label}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════ */
export default function StudentLibrary() {
  const navigate = useNavigate();

  const [selectedSubject,  setSelectedSubject]  = useState(null);
  const [selectedChapter,  setSelectedChapter]  = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  /* ── scrollRef: single ref for the one scrollable area on mobile ── */
  const scrollRef = useRef(null);

  /* ── Reset scroll to top on every navigation step ── */
  const resetScroll = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  /* Desktop state */
  const [searchQuery,      setSearchQuery]      = useState('');
  const [activeCategory,   setActiveCategory]   = useState('All');
  const [desktopSubject,   setDesktopSubject]   = useState('All');
  const [activeTab,        setActiveTab]        = useState('resources');
  const [resources,        setResources]        = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [videos,           setVideos]           = useState([]);
  const [videosLoading,    setVideosLoading]    = useState(true);
  const [activeVideo,      setActiveVideo]      = useState(null);
  const [openingFile,      setOpeningFile]      = useState(null);
  const [isDecrypting,     setIsDecrypting]     = useState(false);
  const [showViewer,       setShowViewer]       = useState(false);
  const [viewerReady,      setViewerReady]      = useState(false);

  const resolveFileUrl = fileUrl => {
    const base = window.__API_URL__ || (import.meta.env.VITE_API_BASE_URL || '');
    return `${base.replace(/\/$/, '')}${fileUrl}`;
  };

  const mobileBack = () => {
    resetScroll();
    if (selectedCategory) { setSelectedCategory(null); return; }
    if (selectedChapter)  { setSelectedChapter(null);  return; }
    if (selectedSubject)  { setSelectedSubject(null);  return; }
    navigate('/student');
  };

  const mobileReset = (level) => {
    resetScroll();
    if (level === 'subject') { setSelectedSubject(null); setSelectedChapter(null); setSelectedCategory(null); }
    if (level === 'chapter') { setSelectedChapter(null); setSelectedCategory(null); }
  };

  useEffect(() => {
    setResourcesLoading(true);
    api.get('/student/my-library')
      .then(({ data }) => setResources(data ? Object.values(data).flat() : []))
      .catch(() => setResources([]))
      .finally(() => setResourcesLoading(false));
  }, []);

  useEffect(() => {
    setVideosLoading(true);
    fetch("https://pranavzinjad.in/student/my-videos")
      .then(r => r.json())
      .then(data => setVideos(data?.videos || data || []))
      .catch(() => setVideos([]))
      .finally(() => setVideosLoading(false));
  }, []);

  const SUBJECT_COLORS = {
    Physics:   { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-400' },
    Chemistry: { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-400' },
    Maths:     { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400' },
    Biology:   { bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-400' },
  };

  const categoryIcons = {
    Notes: '/student/notes.svg', PYQs: '/student/pdf.svg',
    Formulas: '/student/formulas.svg', Default: '/student/notes.svg',
  };

  const filteredResources = resources.filter(r => {
    const matchCat  = activeCategory === 'All' || r.category === activeCategory;
    const matchSub  = desktopSubject === 'All'  || r.subject  === desktopSubject;
    const matchSrch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSub && matchSrch;
  });

  const filteredVideos = videos.filter(v => {
    const matchSub  = desktopSubject === 'All' || v.subject === desktopSubject;
    const matchSrch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchSrch;
  });

  const desktopCategories = ['All', 'Notes', 'PYQs', 'Formulas'];
  const desktopSubjects   = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];

  return (
    <div className="lib-root min-h-screen" style={{ background: '#F6F8FC' }}>
      <GlobalCSS />

      {/* ═══════════════════════════════════════
          DESKTOP  (unchanged)
      ═══════════════════════════════════════ */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StudentHeader />
        <div className="flex flex-1 max-w-7xl mx-auto w-full px-8 md:px-8 lg:px-12 2xl:px-20 py-8 gap-7">
          <aside className="w-56 flex-shrink-0 flex flex-col gap-4">
            <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -right-1 -top-4 w-12 h-12 bg-white/5 rounded-full" />
              <BookOpen size={22} className="mb-3 relative z-10 opacity-80" />
              <p className="font-black text-base relative z-10 leading-tight">Nexus<br />Library</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 relative z-10">Secure Repository</p>
            </div>
            <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
              <button onClick={() => setActiveTab('resources')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'resources' ? 'text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`} style={activeTab === 'resources' ? { background: 'linear-gradient(135deg,#7c3aed,#6366f1)' } : {}}>
                <FileText size={16} />Resources
              </button>
              <button onClick={() => setActiveTab('videos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-1 ${activeTab === 'videos' ? 'text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`} style={activeTab === 'videos' ? { background: 'linear-gradient(135deg,#7c3aed,#6366f1)' } : {}}>
                <Film size={16} />Video Lectures
              </button>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject</p>
              <div className="space-y-1">
                {desktopSubjects.map(sub => (
                  <button key={sub} onClick={() => setDesktopSubject(sub)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${desktopSubject === sub ? 'bg-[#F3EBFF] text-[#7A41F7]' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
            {activeTab === 'resources' && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</p>
                <div className="space-y-1">
                  {desktopCategories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeCategory === cat ? 'bg-[#F3EBFF] text-[#7A41F7]' : 'text-slate-500 hover:bg-slate-50'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="flex-1 flex flex-col min-w-0 gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/student')} className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-500 hover:text-[#7A41F7] hover:border-purple-200 transition-all shadow-sm flex-shrink-0">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input type="text" placeholder="Search resources…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:border-[#7A41F7] focus:ring-2 focus:ring-purple-100 shadow-sm transition-all outline-none" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><XMarkIcon className="w-4 h-4" /></button>}
              </div>
            </div>

            {activeTab === 'resources' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Study Resources</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{resourcesLoading ? 'Loading…' : `${filteredResources.length} assets found`}</p>
                  </div>
                </div>
                {resourcesLoading ? (
                  <div className="grid grid-cols-2 gap-4">{Array(6).fill(0).map((_, i) => <ResourceSkeleton key={i} />)}</div>
                ) : filteredResources.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredResources.map(item => {
                      const subColor = SUBJECT_COLORS[item.subject] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-300' };
                      return (
                        <div key={item._id} className="desk-res-card"
                          onClick={() => { setOpeningFile(item); setViewerReady(false); setIsDecrypting(true); setTimeout(() => { setIsDecrypting(false); setShowViewer(true); }, 1200); }}>
                          <div className={`w-12 h-12 ${subColor.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <img src={categoryIcons[item.category] || categoryIcons.Default} alt={item.category} className="w-7 h-7 object-contain" onError={e => { e.target.src = categoryIcons.Default; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-bold text-slate-800 truncate">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-black ${subColor.text} uppercase`}>{item.subject}</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className="text-[10px] font-semibold text-slate-400 uppercase">{item.category}</span>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-[#F3EBFF] text-[#7A41F7] flex items-center justify-center">
                            <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <InboxIcon className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400">No resources found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <h2 className="text-xl font-black text-slate-800 mb-5">Video Lectures</h2>
                {videosLoading ? (
                  <div className="grid grid-cols-3 gap-5">{Array(6).fill(0).map((_, i) => <ResourceSkeleton key={i} />)}</div>
                ) : filteredVideos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-5">
                    {filteredVideos.map(video => {
                      const subColor = SUBJECT_COLORS[video.subject] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-300' };
                      return (
                        <div key={video._id} onClick={() => setActiveVideo(video)}
                          className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-purple-200 hover:shadow-xl transition-all cursor-pointer active:scale-[0.98]">
                          <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                <PlayIcon className="w-5 h-5 text-[#7A41F7] fill-[#7A41F7] translate-x-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{video.duration}</span>
                          </div>
                          <div className="p-4">
                            <h4 className="text-[14px] font-bold text-slate-800 line-clamp-2 group-hover:text-[#7A41F7] transition-colors">{video.title}</h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`inline-flex items-center gap-1.5 ${subColor.bg} ${subColor.text} text-[10px] font-black px-2.5 py-1 rounded-full uppercase`}>
                                <span className={`w-1.5 h-1.5 ${subColor.dot} rounded-full`} />{video.subject}
                              </span>
                              <span className="text-[11px] text-slate-400">{video.views} views</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Film size={40} className="text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400">No videos found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop modals */}
      {activeVideo && (
        <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setActiveVideo(null)}>
          <div className="bg-[#0f0f0f] rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div>
                <p className="text-white font-bold text-sm truncate max-w-lg">{activeVideo?.title}</p>
                <p className="text-white/50 text-xs mt-0.5">{activeVideo?.subject} • {activeVideo?.instructor}</p>
              </div>
              <button onClick={() => setActiveVideo(null)} className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${activeVideo?.youtubeId}?autoplay=1`} title={activeVideo?.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      )}

      {isDecrypting && (
        <div className="hidden md:flex fixed inset-0 z-[2000] bg-black/70 flex-col items-center justify-center backdrop-blur-sm">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-t-white/80 border-white/10 animate-spin" />
          </div>
          <p className="text-white text-xs font-black uppercase tracking-[0.2em]">Decrypting</p>
        </div>
      )}

      {showViewer && openingFile && (
        <div className="hidden md:flex fixed inset-0 z-[3000] bg-white flex-col animate-in fade-in duration-200">
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-5 shrink-0 bg-white shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => { setShowViewer(false); setOpeningFile(null); setViewerReady(false); }} className="p-2 hover:bg-slate-100 rounded-xl">
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
              <div className="truncate">
                <h3 className="text-[14px] font-bold text-slate-900 truncate">{openingFile.title}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight mt-0.5">{openingFile.subject} · {openingFile.category}</p>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); window.open(resolveFileUrl(openingFile.fileUrl), '_blank'); }}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-purple-200"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)' }}>
              <ArrowDownTrayIcon className="w-4 h-4" />Download
            </button>
          </div>
          <div className="flex-1 bg-slate-100 relative overflow-hidden">
            {!viewerReady && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}
            <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveFileUrl(openingFile.fileUrl))}&embedded=true`}
              className={`w-full h-full border-none transition-opacity duration-500 ${viewerReady ? 'opacity-100' : 'opacity-0'}`}
              title="Document Viewer" onLoad={() => setViewerReady(true)} />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          MOBILE — SelectChapters-style scroll:

          • Outer wrapper: display:flex, flexDirection:column, height:100vh, overflow:hidden
          • MobileHeader: flexShrink:0 — always visible, never scrolls
          • White card: flex:1, overflowY:auto — the ONE scroll container, nothing else
          • Content inside card scrolls naturally, no lock/unlock magic needed
      ═══════════════════════════════════════ */}
      <div
        className="md:hidden"
        style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f4f4f8' }}
      >
        {/* Header — pinned, never scrolls */}
        <MobileHeader
          selectedSubject={selectedSubject}
          selectedChapter={selectedChapter}
          selectedCategory={selectedCategory}
          onBack={mobileBack}
          onReset={mobileReset}
        />

        {/* White card — this is the ONLY scroll container */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: '28px 28px 0 0',
            marginTop: -16,
            position: 'relative',
            zIndex: 10,
            boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',   // clip the border-radius
          }}
        >
          {/* Drag handle */}
          <div style={{ padding: '10px 0 2px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
          </div>

          {/* Scrollable content — exactly like SelectChapters' flex-1 overflow-y:auto div */}
          <div
            ref={scrollRef}
            className="inner-scroll-area"
            style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
          >
            {!selectedSubject && (
              <SubjectGrid onSelect={sub => { resetScroll(); setSelectedSubject(sub); }} />
            )}
            {selectedSubject && !selectedChapter && (
              <ChapterList subject={selectedSubject} onSelect={ch => { resetScroll(); setSelectedChapter(ch); }} />
            )}
            {selectedSubject && selectedChapter && !selectedCategory && (
              <CategoryGrid subject={selectedSubject} chapter={selectedChapter} onSelect={cat => { resetScroll(); setSelectedCategory(cat); }} />
            )}
            {selectedSubject && selectedChapter && selectedCategory && (
              <ResourceList
                subject={selectedSubject}
                chapter={selectedChapter}
                category={selectedCategory}
                resolveFileUrl={resolveFileUrl}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}