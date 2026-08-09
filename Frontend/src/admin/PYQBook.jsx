/**
 * PYQBook.jsx — Nexus Admin v2
 * Route: /admin/pyq/:subject
 *
 * Both "Question Paper" and "Answer Key" buttons POST to /pdf/download
 * with the appropriate docType — backend resolves institute name and
 * renders the PDF via Puppeteer.
 *
 * Screen rendering (QuestionCard) is unchanged.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  BookOpen, ChevronRight, ChevronDown, Search, Loader2,
  Maximize2, Minimize2, Tag, Calendar, CheckCircle2,
  FileDown, X, Filter, Play,
} from "lucide-react";

/* ── subject config ── */
const SUBJECT_MAP = {
  "69a6be2794b749c00e88cd23": { label: "Physics",     color: "#2563eb", bg: "#eff6ff",  border: "#bfdbfe" },
  "69a6be2794b749c00e88cd24": { label: "Chemistry",   color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0" },
  "69a6be2794b749c00e88cd25": { label: "Mathematics", color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
  "69a6be2794b749c00e88cd26": { label: "Biology",     color: "#d97706", bg: "#fffbeb",  border: "#fde68a" },
};

const T = { border: "#ede9f6", muted: "#94a3b8", text: "#0f172a", hover: "#faf8ff" };
const LETTERS = ["A", "B", "C", "D", "E"];
const YEAR_OPTIONS = Array.from({ length: 25 }, (_, i) => 2024 - i);

const loadKaTeX = (() => {
  let loaded = false, loading = null;
  return () => {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(resolve => {
      if (!document.querySelector('link[href*="katex"]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
        document.head.appendChild(l);
      }
      if (!document.querySelector('script[src*="katex.min.js"]')) {
        const s1 = document.createElement('script');
        s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
        s1.onload = () => {
          const s2 = document.createElement('script');
          s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
          s2.onload = () => { loaded = true; resolve(); };
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      } else { loaded = true; resolve(); }
    });
    return loading;
  };
})();

const KATEX_OPTS = {
  delimiters: [
    { left: '$$', right: '$$', display: true  },
    { left: '$',  right: '$',  display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true  },
  ],
  throwOnError: false,
};

/* ── MathText ── */
function MathText({ text, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || typeof text === 'undefined') return;
    ref.current.innerHTML = String(text) || '';
    loadKaTeX().then(() => {
      if (!ref.current || !window.renderMathInElement) return;
      window.renderMathInElement(ref.current, KATEX_OPTS);
    });
  }, [text]);
  return <span ref={ref} style={{ ...style, display: 'inline-block', width: '100%', wordBreak: 'break-word' }} />;
}

function getCorrectIdx(q) {
  if (typeof q.correctOption === "number") return q.correctOption;
  if (q.correctAnswer) {
    const ci = LETTERS.indexOf(q.correctAnswer.toUpperCase());
    if (ci !== -1) return ci;
  }
  if (q.answer && q.options) {
    const idx = q.options.findIndex(o => optText(o) === q.answer);
    if (idx !== -1) return idx;
  }
  return -1;
}

function optText(opt) {
  if (!opt) return "";
  if (typeof opt === "string") return opt;
  return opt.text || "";
}

/* ── Skeleton loader ── */
function QuestionSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        height: 3,
        background: "linear-gradient(90deg,#7c3aed 0%,#a78bfa 40%,#7c3aed 60%,#a78bfa 100%)",
        backgroundSize: "200% 100%", borderRadius: 99,
        animation: "ytScan 1.4s ease-in-out infinite", marginBottom: 6,
      }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: "#fff", borderRadius: 11, border: "1.5px solid #ede9f6", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "#f3f0ff", animation: `skelPulse 1.6s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
              <div style={{ width: 55, height: 14, borderRadius: 6, background: "#f3f0ff", animation: `skelPulse 1.6s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }} />
              <div style={{ marginLeft: "auto", width: 32, height: 14, borderRadius: 6, background: "#f3f0ff", animation: "skelPulse 1.6s ease-in-out infinite" }} />
            </div>
            {[1, 2, 3].map(j => (
              <div key={j} style={{ height: 14, borderRadius: 5, background: "#f1f0f9", width: `${100 - j * 10}%`, animation: `skelPulse 1.6s ease-in-out infinite`, animationDelay: `${i * 0.05 + j * 0.03}s` }} />
            ))}
            {[1, 2, 3, 4].map(j => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 9px", borderRadius: 7, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <div style={{ width: 17, height: 17, borderRadius: 4, background: "#e5e7eb", flexShrink: 0, animation: `skelPulse 1.6s ease-in-out infinite`, animationDelay: `${(i + j) * 0.07}s` }} />
                <div style={{ flex: 1, height: 12, borderRadius: 4, background: "#ede9f6", animation: `skelPulse 1.6s ease-in-out infinite`, animationDelay: `${(i + j) * 0.09}s` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════ */
export default function PYQBook() {
  const { subject } = useParams();
  const sub     = SUBJECT_MAP[subject] || Object.values(SUBJECT_MAP)[0];
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const [chapters,         setChapters]         = useState([]);
  const [loadingChapters,  setLoadingChapters]  = useState(true);
  const [chapterError,     setChapterError]     = useState(false);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [chapterTopics,    setChapterTopics]    = useState({});
  const [loadingTopics,    setLoadingTopics]    = useState({});

  const [selectedTopics,   setSelectedTopics]   = useState([]);
  const [topicQuestions,   setTopicQuestions]   = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState({});

  const [chapterSearch,  setChapterSearch]  = useState("");
  const [yearFromDraft,  setYearFromDraft]  = useState(2010);
  const [yearToDraft,    setYearToDraft]    = useState(2024);
  const [yearFrom,       setYearFrom]       = useState(2010);
  const [yearTo,         setYearTo]         = useState(2024);
  const [fullscreen,     setFullscreen]     = useState(false);
  const [downloading,    setDownloading]    = useState(false);
  const [downloadingKey, setDownloadingKey] = useState(false);
  const [applyingChanges, setApplyingChanges] = useState(false);

  const yearRangeChanged = yearFromDraft !== yearFrom || yearToDraft !== yearTo;

  /* ── load chapters ── */
  useEffect(() => {
    setChapters([]); setExpandedChapters(new Set()); setChapterTopics({});
    setSelectedTopics([]); setTopicQuestions({}); setLoadingChapters(true); setChapterError(false);
    (async () => {
      try {
        const r = await fetch(`${baseURL}/pyq/${subject}/chapters`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!r.ok) throw new Error();
        const data = await r.json();
        setChapters(Array.isArray(data) ? data : []);
      } catch { setChapters([]); setChapterError(true); }
      finally { setLoadingChapters(false); }
    })();
  }, [subject]);

  const toggleChapter = async (chapter) => {
    const isOpen = expandedChapters.has(chapter._id);
    setExpandedChapters(prev => isOpen ? new Set() : new Set([chapter._id]));
    if (!isOpen && !chapterTopics[chapter._id]) {
      setLoadingTopics(prev => ({ ...prev, [chapter._id]: true }));
      try {
        const r = await fetch(`${baseURL}/pyq/${subject}/chapters/${chapter._id}/topics`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!r.ok) throw new Error();
        const data = await r.json();
        setChapterTopics(prev => ({ ...prev, [chapter._id]: Array.isArray(data) ? data : [] }));
      } catch { setChapterTopics(prev => ({ ...prev, [chapter._id]: [] })); }
      finally { setLoadingTopics(prev => ({ ...prev, [chapter._id]: false })); }
    }
  };

  const toggleTopic = (topic, chapter) => {
    const isSel = selectedTopics.some(t => t.topicId === topic._id);
    if (isSel) setSelectedTopics(prev => prev.filter(t => t.topicId !== topic._id));
    else setSelectedTopics(prev => [...prev, { topicId: topic._id, topicName: topic.name, chapterId: chapter._id, chapterName: chapter.name }]);
  };

  const selectAllInChapter = (chapter) => {
    const topics  = chapterTopics[chapter._id] || [];
    const newOnes = topics.filter(t => !selectedTopics.some(s => s.topicId === t._id));
    if (!newOnes.length) return;
    setSelectedTopics(prev => [...prev, ...newOnes.map(t => ({ topicId: t._id, topicName: t.name, chapterId: chapter._id, chapterName: chapter.name }))]);
  };

  const clearChapter = (chapter) => {
    const ids = new Set((chapterTopics[chapter._id] || []).map(t => t._id));
    setSelectedTopics(prev => prev.filter(t => !ids.has(t.topicId)));
  };

  const removeTopic = (topicId) => setSelectedTopics(prev => prev.filter(t => t.topicId !== topicId));

  const applyChanges = async () => {
    if (applyingChanges) return;
    setYearFrom(yearFromDraft); setYearTo(yearToDraft);
    if (!selectedTopics.length) return;
    setApplyingChanges(true);
    const patch = {};
    selectedTopics.forEach(s => { patch[s.topicId] = true; });
    setTopicQuestions({}); setLoadingQuestions(patch);
    await Promise.all(selectedTopics.map(async sel => {
      try {
        const r = await fetch(
          `${baseURL}/pyq/${subject}/chapters/${sel.chapterId}/topics/${sel.topicId}/questions`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (!r.ok) throw new Error();
        const data = await r.json();
        setTopicQuestions(prev => ({ ...prev, [sel.topicId]: Array.isArray(data) ? data : [] }));
      } catch { setTopicQuestions(prev => ({ ...prev, [sel.topicId]: [] })); }
      finally   { setLoadingQuestions(prev => ({ ...prev, [sel.topicId]: false })); }
    }));
    setApplyingChanges(false);
  };

  const applyYearRange = () => { setYearFrom(yearFromDraft); setYearTo(yearToDraft); };

  /* ── shared PDF downloader ── */
  const downloadPDF = async (docType, setLoading) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}/pdf/download`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subLabel: sub.label,
          activeChapters,
          selectedTopics,
          topicQuestions,
          yearFrom,
          yearTo,
          docType,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Server error");
      }
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Nexus_PYQ_${sub.label}_${docType === "ANSWER KEY" ? "AnswerKey" : "Questions"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF Error:", e);
      alert("PDF generation failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload    = () => downloadPDF("QUESTION PAPER", setDownloading);
  const handleDownloadKey = () => downloadPDF("ANSWER KEY",     setDownloadingKey);

  const filteredChapters = chapters.filter(c => c.name?.toLowerCase().includes(chapterSearch.toLowerCase()));
  const activeChapters   = chapters.filter(ch => selectedTopics.some(t => t.chapterId === ch._id));
  const totalQs          = Object.values(topicQuestions).flat()
    .filter(q => { const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo); }).length;

  /* ════════════════════════════════════════════ RENDER ════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <PageHeader
        title={`PYQ Book — ${sub.label}`}
        subtitle="Pick chapters & topics from the left to build your question set"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {selectedTopics.length > 0 && (<>
              {/* Answer Key */}
              <button
                onClick={handleDownloadKey} disabled={downloadingKey}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: downloadingKey ? "#f0fdf4" : "#fff",
                  color: "#16a34a", padding: "6px 13px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: "1.5px solid #bbf7d0", cursor: downloadingKey ? "default" : "pointer",
                  boxShadow: downloadingKey ? "none" : "0 2px 8px rgba(22,163,74,0.15)", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!downloadingKey) { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#86efac"; }}}
                onMouseLeave={e => { if (!downloadingKey) { e.currentTarget.style.background = "#fff";    e.currentTarget.style.borderColor = "#bbf7d0"; }}}
              >
                {downloadingKey
                  ? <><Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> Generating…</>
                  : <><FileDown size={13} /> Answer Key</>}
              </button>

              {/* Question Paper */}
              <button
                onClick={handleDownload} disabled={downloading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: downloading ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#6366f1)",
                  color: downloading ? "#7c3aed" : "#fff",
                  padding: "6px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: "none", cursor: downloading ? "default" : "pointer",
                  boxShadow: downloading ? "none" : "0 2px 10px rgba(109,40,217,0.28)", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!downloading) e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {downloading
                  ? <><Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> Generating…</>
                  : <><FileDown size={13} /> Question Paper</>}
              </button>
            </>)}

            <span style={{
              fontSize: 11, fontWeight: 800, padding: "5px 13px", borderRadius: 99,
              background: sub.bg, color: sub.color, border: `1.5px solid ${sub.border}`,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>{sub.label}</span>
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", fontFamily: "'DM Sans', sans-serif", minHeight: 0 }} className="page-enter">

        {/* ══ LEFT PANEL ══ */}
        {!fullscreen && (
          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${T.border}`, background: "#fff", minHeight: 0 }}>

            {/* Year range */}
            <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #f3f0ff", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <Filter size={10} style={{ color: "#a78bfa" }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Year Range</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 5, alignItems: "end", marginBottom: 8 }}>
                {[["From", yearFromDraft, setYearFromDraft, YEAR_OPTIONS.filter(y => y <= yearToDraft)],
                  ["To",   yearToDraft,   setYearToDraft,   YEAR_OPTIONS.filter(y => y >= yearFromDraft)]].map(([label, val, setter, opts], i) => (
                  i === 0 || i === 1 ? (
                    i === 0
                      ? <div key="from">
                          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>From</div>
                          <select value={yearFromDraft} onChange={e => setYearFromDraft(+e.target.value)} style={{ width: "100%", padding: "6px 7px", borderRadius: 7, border: `1.5px solid ${yearRangeChanged ? "#a78bfa" : "#e5e7eb"}`, fontSize: 11, fontWeight: 700, color: "#374151", background: "#fff", outline: "none", cursor: "pointer" }}>
                            {YEAR_OPTIONS.filter(y => y <= yearToDraft).map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      : <div key="to">
                          <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>To</div>
                          <select value={yearToDraft} onChange={e => setYearToDraft(+e.target.value)} style={{ width: "100%", padding: "6px 7px", borderRadius: 7, border: `1.5px solid ${yearRangeChanged ? "#a78bfa" : "#e5e7eb"}`, fontSize: 11, fontWeight: 700, color: "#374151", background: "#fff", outline: "none", cursor: "pointer" }}>
                            {YEAR_OPTIONS.filter(y => y >= yearFromDraft).map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                  ) : null
                ))}
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, paddingBottom: 6 }}>—</span>
              </div>
              <button
                onClick={applyYearRange} disabled={!yearRangeChanged}
                style={{
                  width: "100%", padding: "7px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  background: yearRangeChanged ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "#f3f4f6",
                  color: yearRangeChanged ? "#fff" : "#9ca3af", border: "none",
                  cursor: yearRangeChanged ? "pointer" : "default", transition: "all 0.18s",
                  boxShadow: yearRangeChanged ? "0 2px 8px rgba(109,40,217,0.25)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                {yearRangeChanged ? <><Play size={10} style={{ fill: "#fff" }} /> Apply {yearFromDraft}–{yearToDraft}</> : <>Applied: {yearFrom}–{yearTo}</>}
              </button>
              {selectedTopics.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", padding: "3px 9px", borderRadius: 6, border: "1px solid #ddd6fe", display: "inline-block" }}>
                  {totalQs} Q in range
                </div>
              )}
            </div>

            {/* Search */}
            <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid #f3f0ff", flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none" }} />
                <input
                  value={chapterSearch} onChange={e => setChapterSearch(e.target.value)}
                  placeholder="Search chapters…"
                  style={{ width: "100%", boxSizing: "border-box", paddingLeft: 32, paddingRight: 10, paddingTop: 7, paddingBottom: 7, background: "transparent", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#374151", outline: "none", transition: "border-color 0.15s" }}
                  onFocus={e => (e.target.style.borderColor = "#a78bfa")}
                  onBlur={e  => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              {!loadingChapters && (
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 500, marginTop: 6, paddingLeft: 2 }}>
                  {filteredChapters.length} chapter{filteredChapters.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Chapter list */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "8px" }} className="no-scrollbar">
              {loadingChapters ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                  <Loader2 size={20} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
                </div>
              ) : chapterError ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>⚠️</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Failed to load chapters</div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>Could not reach the server.</div>
                </div>
              ) : filteredChapters.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <BookOpen size={26} style={{ color: "#e5e7eb", display: "block", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>No chapters found</div>
                </div>
              ) : filteredChapters.map((ch, idx) => {
                const isOpen       = expandedChapters.has(ch._id);
                const topics       = chapterTopics[ch._id] || [];
                const isLoadingT   = loadingTopics[ch._id];
                const selectedInCh = selectedTopics.filter(t => t.chapterId === ch._id).length;
                const allSelected  = topics.length > 0 && selectedInCh === topics.length;

                return (
                  <div key={ch._id} style={{ marginBottom: 4 }}>
                    <button
                      onClick={() => toggleChapter(ch)}
                      style={{
                        all: "unset", display: "flex", alignItems: "center", gap: 7,
                        width: "100%", boxSizing: "border-box", padding: "9px 11px",
                        borderRadius: isOpen ? "9px 9px 0 0" : 9, cursor: "pointer",
                        background: selectedInCh > 0 ? "linear-gradient(135deg,#7c3aed,#6366f1)" : isOpen ? "#f5f3ff" : "transparent",
                        border: `1.5px solid ${selectedInCh > 0 ? "#7c3aed" : isOpen ? "#ddd6fe" : "transparent"}`,
                        transition: "all 0.13s",
                      }}
                      onMouseEnter={e => { if (!selectedInCh && !isOpen) e.currentTarget.style.background = T.hover; }}
                      onMouseLeave={e => { if (!selectedInCh && !isOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, flex: 1, lineHeight: 1.3, color: selectedInCh > 0 ? "#fff" : T.text }}>
                        {idx + 1}.&nbsp;{ch.name}
                      </span>
                      {selectedInCh > 0 && <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(255,255,255,0.22)", color: "#e9d5ff", padding: "1px 6px", borderRadius: 99 }}>{selectedInCh}</span>}
                      {isOpen
                        ? <ChevronDown  size={12} style={{ color: selectedInCh > 0 ? "#c4b5fd" : "#94a3b8", flexShrink: 0 }} />
                        : <ChevronRight size={12} style={{ color: selectedInCh > 0 ? "#c4b5fd" : "#94a3b8", flexShrink: 0 }} />}
                    </button>

                    {isOpen && (
                      <div style={{ background: "#faf8ff", border: "1.5px solid #ddd6fe", borderTop: "none", borderRadius: "0 0 9px 9px", padding: "8px 8px 10px" }}>
                        {isLoadingT ? (
                          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                            <Loader2 size={16} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
                          </div>
                        ) : topics.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "10px 4px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 3 }}>No topics found</div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
                              <button
                                onClick={() => allSelected ? clearChapter(ch) : selectAllInChapter(ch)}
                                style={{ all: "unset", cursor: "pointer", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: allSelected ? "#fff1f2" : "#ede9fe", color: allSelected ? "#ef4444" : "#7c3aed", border: `1px solid ${allSelected ? "#fecdd3" : "#ddd6fe"}`, transition: "all 0.12s" }}
                              >
                                {allSelected ? "✕  Clear all" : "✓  Select all"}
                              </button>
                              {selectedInCh > 0 && !allSelected && (
                                <button onClick={() => clearChapter(ch)} style={{ all: "unset", cursor: "pointer", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: "#fff1f2", color: "#ef4444", border: "1px solid #fecdd3" }}>Clear</button>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              {topics.map(topic => {
                                const isSel   = selectedTopics.some(t => t.topicId === topic._id);
                                const isLoadQ = loadingQuestions[topic._id];
                                return (
                                  <button
                                    key={topic._id}
                                    onClick={() => toggleTopic(topic, ch)}
                                    style={{ all: "unset", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", padding: "6px 9px", borderRadius: 7, background: isSel ? "#7c3aed" : "#fff", border: `1.5px solid ${isSel ? "#7c3aed" : "#e5e7eb"}`, transition: "all 0.12s" }}
                                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#f5f3ff"; }}
                                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "#fff"; }}
                                  >
                                    <div style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, background: isSel ? "rgba(255,255,255,0.25)" : "#f3f4f6", border: `1.5px solid ${isSel ? "rgba(255,255,255,0.5)" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {isSel && <div style={{ width: 6, height: 6, borderRadius: 2, background: "#fff" }} />}
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? "#fff" : "#374151", flex: 1, lineHeight: 1.3 }}>{topic.name}</span>
                                    {isLoadQ
                                      ? <Loader2 size={10} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite", flexShrink: 0 }} />
                                      : topic.questionCount != null && <span style={{ fontSize: 9, fontWeight: 700, color: isSel ? "#e9d5ff" : T.muted, flexShrink: 0 }}>{topic.questionCount}q</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Apply Changes */}
            {selectedTopics.length > 0 && (
              <div style={{ padding: "10px 12px", borderTop: "1px solid #f3f0ff", flexShrink: 0 }}>
                <button
                  onClick={applyChanges} disabled={applyingChanges}
                  style={{
                    width: "100%", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 800,
                    background: applyingChanges ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#6366f1)",
                    color: applyingChanges ? "#7c3aed" : "#fff", border: "none",
                    cursor: applyingChanges ? "default" : "pointer", transition: "all 0.18s",
                    boxShadow: applyingChanges ? "none" : "0 3px 12px rgba(109,40,217,0.30)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {applyingChanges
                    ? <><Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> Fetching questions…</>
                    : <>✓&nbsp;&nbsp;Apply Changes · {selectedTopics.length} topic{selectedTopics.length !== 1 ? "s" : ""}</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f4f3fa", minHeight: 0 }}>
          {activeChapters.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
              <div style={{ width: 58, height: 58, borderRadius: 17, background: "#fff", border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <BookOpen size={24} style={{ color: "#d1d5db" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Select topics to begin</div>
              <p style={{ fontSize: 12, color: T.muted, maxWidth: 260, lineHeight: 1.7, margin: 0 }}>
                Expand a chapter on the left, tick the topics you want, then press <strong>Apply Changes</strong> to load questions.
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 20px 40px" }}>
              <div className="fixed z-20 right-8 pt-2">
                <button
                  onClick={() => setFullscreen(f => !f)}
                  style={{ all: "unset", cursor: "pointer", padding: 7, borderRadius: 8, lineHeight: 0, border: "1.5px solid #e5e7eb", color: "#64748b", background: "#fff", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.color = "#7c3aed"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#64748b"; }}
                >
                  {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>

              <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
                {activeChapters.map(ch => {
                  const chTopics = selectedTopics.filter(t => t.chapterId === ch._id);
                  return (
                    <div key={ch._id}>
                      <div style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", borderRadius: 13, padding: "13px 20px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(109,40,217,0.22)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", right: -18, top: -18, width: 75, height: 75, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                        <BookOpen size={15} style={{ color: "#c4b5fd", flexShrink: 0 }} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", flex: 1 }}>{ch.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: 99, color: "#fff" }} className="mr-12">
                          {chTopics.length} topic{chTopics.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div style={{ paddingLeft: 4, display: "flex", flexDirection: "column", gap: 16 }}>
                        {chTopics.map(sel => {
                          const qs = (topicQuestions[sel.topicId] || []).filter(q => { const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo); });
                          const isLoadQ  = loadingQuestions[sel.topicId];
                          const byYear   = qs.reduce((acc, q) => { const yr = q.year || "Unknown"; (acc[yr] = acc[yr] || []).push(q); return acc; }, {});
                          const sortedYrs = Object.keys(byYear).sort((a, b) => b - a);

                          return (
                            <div key={sel.topicId}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fff", borderRadius: 10, border: `1.5px solid ${T.border}`, marginBottom: 10, boxShadow: "0 1px 5px rgba(109,40,217,0.06)" }}>
                                <div style={{ width: 4, height: 18, borderRadius: 3, background: sub.color, flexShrink: 0 }} />
                                <Tag size={11} style={{ color: "#a78bfa" }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", flex: 1 }}>{sel.topicName}</span>
                                {qs.length > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", padding: "2px 9px", borderRadius: 99, border: "1px solid #ddd6fe" }}>{qs.length}&nbsp;Q</span>}
                                <button onClick={() => removeTopic(sel.topicId)} style={{ all: "unset", cursor: "pointer", lineHeight: 0, padding: 4, borderRadius: 6, color: "#d1d5db", transition: "all 0.13s" }}
                                  onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fff1f2"; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "transparent"; }}>
                                  <X size={12} />
                                </button>
                              </div>

                              {isLoadQ ? <QuestionSkeleton /> : qs.length === 0 ? (
                                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${T.border}`, padding: "18px 20px", textAlign: "center" }}>
                                  {topicQuestions[sel.topicId] === undefined
                                    ? <><div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Press Apply Changes to load questions</div><div style={{ fontSize: 11, color: T.muted }}>Select your topics and click the button below.</div></>
                                    : topicQuestions[sel.topicId]?.length === 0
                                    ? <><div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>No questions found</div><div style={{ fontSize: 11, color: T.muted }}>No PYQ questions exist for this topic yet.</div></>
                                    : <><div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>No questions in {yearFrom}–{yearTo}</div><div style={{ fontSize: 11, color: T.muted }}>Try widening the year range.</div></>}
                                </div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                  {sortedYrs.map(year => (
                                    <div key={year}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <Calendar size={11} style={{ color: "#7c3aed", flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed" }}>{year}</span>
                                        <div style={{ flex: 1, height: 1, background: "#ede9fe" }} />
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", background: "#f5f3ff", padding: "1px 7px", borderRadius: 99, border: "1px solid #ddd6fe" }}>{byYear[year].length}&nbsp;Q</span>
                                      </div>
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                                        {byYear[year].map((q, qi) => (
                                          <QuestionCard key={q._id || qi} q={q} qi={qi} correctIdx={getCorrectIdx(q)} sub={sub} year={year} />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes nexusSpin  { to { transform: rotate(360deg); } }
        @keyframes skelPulse  { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes ytScan     { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
    </AdminLayout>
  );
}

/* ── QuestionCard (screen rendering — unchanged) ── */
function QuestionCard({ q, qi, correctIdx, sub, year }) {
  return (
    <div
      style={{ background: "#fff", borderRadius: 11, border: "1.5px solid #ede9f6", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 4px rgba(109,40,217,0.05)", transition: "box-shadow 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(109,40,217,0.10)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(109,40,217,0.05)")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, border: "1px solid #ddd6fe" }}>{qi + 1}</span>
        {q.shift && <span style={{ fontSize: 9, fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "2px 7px", borderRadius: 99, border: "1px solid #c7d2fe" }}>{q.shift}</span>}
        <span style={{ fontSize: 9, fontWeight: 700, marginLeft: "auto", color: sub.color, background: sub.bg, padding: "2px 7px", borderRadius: 99, border: `1px solid ${sub.border}` }}>{year}</span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.7 }}>
        <MathText text={q.question} />
      </div>
      {q.questionImage && <img src={q.questionImage} alt="" style={{ maxWidth: "100%", borderRadius: 7, border: "1px solid #e5e7eb" }} />}

      {q.options?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {q.options.map((opt, oi) => {
            const isC = oi === correctIdx;
            return (
              <div key={oi} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 10px", borderRadius: 8, background: isC ? "#ecfdf5" : "#f9fafb", border: `1px solid ${isC ? "#a7f3d0" : "#e5e7eb"}` }}>
                <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 5, background: isC ? "#10b981" : "#e5e7eb", color: isC ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, marginTop: 1 }}>{LETTERS[oi]}</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, flex: 1, color: isC ? "#047857" : "#374151", fontWeight: isC ? 600 : 400 }}>
                  <MathText text={optText(opt)} />
                  {typeof opt === "object" && opt.image && <img src={opt.image} alt="" style={{ display: "block", maxWidth: "100%", marginTop: 4, borderRadius: 4 }} />}
                </span>
                {isC && <CheckCircle2 size={14} style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }} />}
              </div>
            );
          })}
        </div>
      )}

      {(q.explanation || q.explanationImage) && (
        <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", lineHeight: 1.6, borderTop: "1px dashed #e5e7eb", paddingTop: 8 }}>
          <MathText text={q.explanation} />
          {q.explanationImage && <img src={q.explanationImage} alt="" style={{ display: "block", maxWidth: "100%", marginTop: 6, borderRadius: 6, border: "1px solid #e5e7eb" }} />}
        </div>
      )}
    </div>
  );
}