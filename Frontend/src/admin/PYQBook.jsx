/**
 * PYQBook.jsx — Nexus Admin v2
 * Route: /admin/pyq/:subject
 * Left : year-range filter → chapter accordions → topic checkboxes
 * Right: book-style 2-col layout, chapter heading → topic heading → questions by year
 *
 * FIXES:
 * - Added missing loadJsPDF() helper
 * - Larger question font sizes for readability
 * - Apply button for year range (no live re-fetch)
 * - YouTube-style skeleton loader for questions
 * - PDF generation bugs fixed (font setting before splitLines, etc.)
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import AdminLayout, { PageHeader } from "./AdminLayout";
import {
  BookOpen, ChevronRight, ChevronDown, Search, Loader2,
  Maximize2, Minimize2, Tag, Calendar, CheckCircle2,
  FileDown, X, Filter, Eye, Play,
} from "lucide-react";

/* ── subject config — keyed by real MongoDB Subject._id ── */
const SUBJECT_MAP = {
  "69a6be2794b749c00e88cd23": { label: "Physics",     color: "#2563eb", bg: "#eff6ff",  border: "#bfdbfe" },
  "69a6be2794b749c00e88cd24": { label: "Chemistry",   color: "#059669", bg: "#ecfdf5",  border: "#a7f3d0" },
  "69a6be2794b749c00e88cd25": { label: "Mathematics", color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
  "69a6be2794b749c00e88cd26": { label: "Biology",     color: "#d97706", bg: "#fffbeb",  border: "#fde68a" },
};

const T = {
  border: "#ede9f6",
  muted:  "#94a3b8",
  text:   "#0f172a",
  hover:  "#faf8ff",
};

const LETTERS = ["A", "B", "C", "D", "E"];
const YEAR_OPTIONS = Array.from({ length: 25 }, (_, i) => 2024 - i);


/* ── correct-index helper ── */
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

/* ── optText: schema stores options as {text, image} objects ── */
function optText(opt) {
  if (!opt) return "";
  if (typeof opt === "string") return opt;
  return opt.text || "";
}

/* ═══════════════════════════════════════════════════════════════════
   jsPDF LOADER — FIXED (was missing entirely in original)
═══════════════════════════════════════════════════════════════════ */
let _jsPDFCache = null;
async function loadJsPDF() {
  if (_jsPDFCache) return _jsPDFCache;
  // Try to import from installed package first
  try {
    const mod = await import("jspdf");
    _jsPDFCache = { jsPDF: mod.jsPDF || mod.default };
    return _jsPDFCache;
  } catch {
    // Fallback: load from CDN
    await new Promise((resolve, reject) => {
      if (window.jspdf) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    _jsPDFCache = { jsPDF: window.jspdf?.jsPDF };
    return _jsPDFCache;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   COLOUR PALETTE
═══════════════════════════════════════════════════════════════════ */
const PDF = {
  PAGE:     [255, 255, 255],
  INK:      [16,  16,  30 ],
  INK2:     [55,  55,  75 ],
  MUTED:    [120, 120, 140],
  HAIR:     [210, 207, 225],
  PUR:      [80,  40,  180],
  PURLT:    [243, 240, 255],
  PURMD:    [196, 181, 253],
  GRN:      [15,  118,  65],
  GRNLT:    [220, 252, 231],
  COV_BG:   [12,  8,   32 ],
  COV_BG2:  [30,  14,  72 ],
  COV_BG3:  [55,  22, 138 ],
};

/* ── safe text: sanitise unicode that Helvetica can't render ── */
function safeText(str) {
  if (!str) return "";
  return String(str)
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "--")
    .replace(/\u2026/g, "...")
    .replace(/\u00D7/g, "x")
    .replace(/\u00F7/g, "/")
    .replace(/\u00B2/g, "2")
    .replace(/\u00B0/g, " deg")
    .replace(/\u03B8/g, "theta")
    .replace(/\u221A/g, "sqrt")
    .replace(/\u222B/g, "integral")
    .replace(/\u2212/g, "-")
    .replace(/[^\x00-\x7E\u00A0-\u00FF]/g, "?");
}

/* ── splitLines: ALWAYS set font/size BEFORE calling this ── */
function splitLines(doc, text, maxW) {
  return doc.splitTextToSize(safeText(text), maxW);
}

/* ─────────────────────────────────────────────────────────────────
   COVER PAGE
───────────────────────────────────────────────────────────────── */
function drawCover(doc, PW, PH, ML, MR, subLabel, yearFrom, yearTo,
                   chCount, topicCount, qCount, docType) {
  doc.setFillColor(...PDF.COV_BG);  doc.rect(0, 0, PW, PH, "F");
  doc.setFillColor(...PDF.COV_BG2); doc.roundedRect(-25, -25, 150, 150, 75, 75, "F");
  doc.setFillColor(...PDF.COV_BG3); doc.roundedRect(65, 145, 180, 180, 90, 90, "F");

  doc.setDrawColor(110, 65, 210); doc.setLineWidth(0.5);
  doc.line(ML, 96, PW - MR, 96);

  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
  doc.setTextColor(150, 120, 230);
  doc.text("NEXUS  \xB7  PREVIOUS YEAR QUESTIONS", PW / 2, 89, { align: "center" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(40);
  doc.setTextColor(255, 255, 255);
  doc.text(safeText(subLabel).toUpperCase(), PW / 2, 124, { align: "center" });

  doc.setFillColor(...PDF.PUR);
  doc.roundedRect(ML, 133, PW - ML - MR, 14, 2.5, 2.5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(docType, PW / 2, 143, { align: "center" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  doc.setTextColor(190, 170, 255);
  doc.text(`${yearFrom}  -  ${yearTo}`, PW / 2, 158, { align: "center" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.setTextColor(140, 120, 200);
  doc.text(
    `${chCount} Chapter${chCount !== 1 ? "s" : ""}   .   ${topicCount} Topic${topicCount !== 1 ? "s" : ""}   .   ${qCount} Questions`,
    PW / 2, 170, { align: "center" }
  );

  doc.setFillColor(20, 10, 50); doc.rect(0, PH - 18, PW, 18, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
  doc.setTextColor(180, 155, 225);
  doc.text("NEXUS ASSESSMENT PLATFORM", ML, PH - 7);
  const d = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.setTextColor(110, 88, 165);
  doc.text(`Generated ${d}`, PW - MR, PH - 7, { align: "right" });
}

/* ─────────────────────────────────────────────────────────────────
   RUNNING HEADER
───────────────────────────────────────────────────────────────── */
function drawHeader(doc, PW, ML, MR, left, right) {
  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
  doc.setTextColor(...PDF.MUTED);
  if (left)  doc.text(safeText(left).toUpperCase(),  ML,      10);
  if (right) doc.text(safeText(right).toUpperCase(), PW - MR, 10, { align: "right" });
  doc.setDrawColor(...PDF.HAIR); doc.setLineWidth(0.18);
  doc.line(ML, 12, PW - MR, 12);
}

/* ─────────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────────── */
function drawFooter(doc, PW, ML, MR, PH, MB, pageNum, footerLabel) {
  doc.setDrawColor(...PDF.HAIR); doc.setLineWidth(0.18);
  doc.line(ML, PH - MB, PW - MR, PH - MB);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7);
  doc.setTextColor(...PDF.MUTED);
  doc.text(safeText(footerLabel), ML, PH - MB + 5);
  doc.text(String(pageNum),       PW / 2, PH - MB + 5, { align: "center" });
}

/* ─────────────────────────────────────────────────────────────────
   CHAPTER OPENER PAGE
───────────────────────────────────────────────────────────────── */
function drawChapterPage(doc, PW, PH, ML, MR, TW, ch, chNum, subLabel, yearFrom, yearTo, footerLabel, pageNum) {
  doc.setFillColor(...PDF.PUR); doc.rect(0, 0, PW, 3, "F");

  doc.setFont("helvetica", "bold"); doc.setFontSize(8);
  doc.setTextColor(...PDF.MUTED);
  doc.text(`CHAPTER  ${chNum}`, ML, 38);

  doc.setDrawColor(...PDF.PUR); doc.setLineWidth(1.2);
  doc.line(ML, 41, ML + 30, 41);

  doc.setFont("helvetica", "bold"); doc.setFontSize(28);
  doc.setTextColor(...PDF.INK);
  const nl = splitLines(doc, ch.name, TW);
  doc.text(nl, ML, 54);

  const ruleY = 54 + nl.length * 12 + 3;
  doc.setDrawColor(...PDF.HAIR); doc.setLineWidth(0.25);
  doc.line(ML, ruleY, ML + TW, ruleY);

  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.setTextColor(...PDF.INK2);
  doc.text(`${safeText(subLabel)}   .   ${yearFrom}-${yearTo}`, ML, ruleY + 10);

  drawFooter(doc, PW, ML, MR, PH, 14, pageNum, footerLabel);
}

/* ─────────────────────────────────────────────────────────────────
   TOPIC BANNER
───────────────────────────────────────────────────────────────── */
function drawTopicBanner(doc, ML, TW, y, name) {
  doc.setFillColor(...PDF.PURLT);
  doc.roundedRect(ML, y, TW, 10, 1.5, 1.5, "F");
  doc.setFillColor(...PDF.PUR);
  doc.roundedRect(ML, y, 4, 10, 1, 1, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
  doc.setTextColor(...PDF.PUR);
  doc.text(safeText(name), ML + 8, y + 7.2);
}

/* ─────────────────────────────────────────────────────────────────
   YEAR DIVIDER ROW
───────────────────────────────────────────────────────────────── */
function drawYearRow(doc, ML, TW, y, yr, count) {
  doc.setFillColor(...PDF.PUR);
  doc.roundedRect(ML, y, 22, 6.5, 1.2, 1.2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(String(yr), ML + 11, y + 4.8, { align: "center" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(7);
  doc.setTextColor(...PDF.MUTED);
  doc.text(`${count} Q`, ML + 25, y + 4.8);

  doc.setDrawColor(...PDF.HAIR); doc.setLineWidth(0.15);
  doc.line(ML + 36, y + 3, ML + TW, y + 3);
}

/* ═══════════════════════════════════════════════════════════════════
   QUESTION PAPER PDF
═══════════════════════════════════════════════════════════════════ */
async function generatePDF({ subLabel, activeChapters, selectedTopics, topicQuestions, yearFrom, yearTo }) {
  const { jsPDF } = await loadJsPDF();
  if (!jsPDF) throw new Error("jsPDF not available");

  const PW = 210, PH = 297;
  const ML = 22, MR = 22, MT = 18, MB = 16;
  const TW = PW - ML - MR;
  const MAX_Y = PH - MB - 10;
  const FOOTER_LABEL = `${safeText(subLabel)}  .  PYQ ${yearFrom}-${yearTo}`;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const totalQs = Object.values(topicQuestions).flat()
    .filter(q => { const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo); }).length;

  let pageNum = 1;
  let curCh = "", curTopic = "";

  drawCover(doc, PW, PH, ML, MR, subLabel, yearFrom, yearTo,
    activeChapters.length, selectedTopics.length, totalQs, "QUESTION PAPER");

  let y = MT;

  const footer = () => drawFooter(doc, PW, ML, MR, PH, MB, pageNum, FOOTER_LABEL);
  const header = () => drawHeader(doc, PW, ML, MR, curCh, curTopic);

  function newPage() {
    footer();
    doc.addPage(); pageNum++;
    y = MT + 6;
    header();
  }

  function ensureSpace(h) {
    if (y + h > MAX_Y) newPage();
  }

  function chapterOpener(ch, n) {
    footer();
    doc.addPage(); pageNum++;
    curCh = ch.name; curTopic = "";
    drawChapterPage(doc, PW, PH, ML, MR, TW, ch, n, subLabel, yearFrom, yearTo, FOOTER_LABEL, pageNum);
    doc.addPage(); pageNum++;
    y = MT + 6;
    header();
  }

  function topicBlock(name) {
    curTopic = name;
    ensureSpace(20);
    if (y > MT + 8) y += 5;
    drawTopicBanner(doc, ML, TW, y, name);
    y += 16;
  }

  function yearRow(yr, cnt) {
    ensureSpace(14);
    drawYearRow(doc, ML, TW, y, yr, cnt);
    y += 12;
  }

  /* ── writeLine: place a single text line, page-break if needed ── */
  function writeLine(textFn, lineH) {
    if (y + lineH > MAX_Y) newPage();
    textFn();
    y += lineH;
  }

  function question(q, n) {
    const QL  = 6.5;
    const OL  = 6.0;
    const TOP = 5.5;

    // ── question text ──
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
    const qLines = splitLines(doc, `${n}. ${q.question}`, TW - 4);
    qLines.forEach(line => {
      writeLine(() => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
        doc.setTextColor(...PDF.INK);
        doc.text(line, ML + 1, y + TOP);
      }, QL);
    });
    y += 2;

    // ── options ──
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const optLines = (q.options || []).map(o => splitLines(doc, optText(o), TW - 18));
    const allShort = optLines.every(ol => ol.length === 1);

    if (allShort && (q.options || []).length === 4) {
      [[0, 1], [2, 3]].forEach(([a, b]) => {
        writeLine(() => {
          [a, b].forEach((oi, col) => {
            if (oi >= (q.options || []).length) return;
            const ox = ML + 1 + col * (TW / 2 + 2);
            doc.setFont("helvetica", "bold"); doc.setFontSize(8);
            doc.setTextColor(...PDF.MUTED);
            doc.text(`(${LETTERS[oi]})`, ox, y + 4.5);
            doc.setFont("helvetica", "normal"); doc.setFontSize(10);
            doc.setTextColor(...PDF.INK);
            doc.text(optLines[oi][0], ox + 11, y + 4.5);
          });
        }, 8);
      });
    } else {
      (q.options || []).forEach((opt, oi) => {
        const ol = optLines[oi];
        ol.forEach((line, li) => {
          writeLine(() => {
            if (li === 0) {
              doc.setFont("helvetica", "bold"); doc.setFontSize(8);
              doc.setTextColor(...PDF.MUTED);
              doc.text(`(${LETTERS[oi]})`, ML + 2, y + 4);
            }
            doc.setFont("helvetica", "normal"); doc.setFontSize(10);
            doc.setTextColor(...PDF.INK);
            doc.text(line, ML + 13, y + 4);
          }, OL);
        });
        y += 1.5;
      });
    }

    // ── separator rule ──
    if (y + 6 > MAX_Y) newPage();
    doc.setDrawColor(...PDF.HAIR); doc.setLineWidth(0.12);
    doc.line(ML, y + 2, ML + TW, y + 2);
    y += 8;
  }

  doc.addPage(); pageNum++;
  header();

  let chNum = 0, qNum = 1;
  for (const ch of activeChapters) {
    const chTopics = selectedTopics.filter(t => t.chapterId === ch._id);
    if (!chTopics.length) continue;
    chNum++;
    chapterOpener(ch, chNum);

    for (const sel of chTopics) {
      const qs = (topicQuestions[sel.topicId] || []).filter(q => {
        const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo);
      });
      if (!qs.length) continue;
      topicBlock(sel.topicName);

      const byYear = qs.reduce((acc, q) => {
        const yr = q.year || "Unknown"; (acc[yr] = acc[yr] || []).push(q); return acc;
      }, {});
      Object.keys(byYear).sort((a, b) => b - a).forEach(yr => {
        yearRow(yr, byYear[yr].length);
        byYear[yr].forEach(q => question(q, qNum++));
      });
    }
  }
  footer();

  doc.save(`PYQ_${safeText(subLabel)}_Questions_${yearFrom}-${yearTo}.pdf`);
}

/* ═══════════════════════════════════════════════════════════════════
   ANSWER KEY PDF
═══════════════════════════════════════════════════════════════════ */
async function generateAnswerKeyPDF({ subLabel, activeChapters, selectedTopics, topicQuestions, yearFrom, yearTo }) {
  const { jsPDF } = await loadJsPDF();
  if (!jsPDF) throw new Error("jsPDF not available");

  const PW = 210, PH = 297;
  const ML = 22, MR = 22, MT = 18, MB = 16;
  const TW = PW - ML - MR;
  const MAX_Y = PH - MB - 10;
  const FOOTER_LABEL = `${safeText(subLabel)}  .  Answer Key ${yearFrom}-${yearTo}`;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const totalQs = Object.values(topicQuestions).flat()
    .filter(q => { const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo); }).length;

  let pageNum = 1;
  let curCh = "", curTopic = "";

  drawCover(doc, PW, PH, ML, MR, subLabel, yearFrom, yearTo,
    activeChapters.length, selectedTopics.length, totalQs, "ANSWER KEY");

  let y = MT;
  const footer = () => drawFooter(doc, PW, ML, MR, PH, MB, pageNum, FOOTER_LABEL);
  const header = () => drawHeader(doc, PW, ML, MR, curCh, curTopic);

  function newPage() { footer(); doc.addPage(); pageNum++; y = MT + 6; header(); }
  function ensureSpace(h) { if (y + h > MAX_Y) newPage(); }

  function chapterOpener(ch, n) {
    footer(); doc.addPage(); pageNum++;
    curCh = ch.name; curTopic = "";
    drawChapterPage(doc, PW, PH, ML, MR, TW, ch, n, subLabel, yearFrom, yearTo, FOOTER_LABEL, pageNum);
    doc.addPage(); pageNum++;
    y = MT + 6; header();
  }

  function topicBlock(name) {
    curTopic = name; ensureSpace(20);
    if (y > MT + 8) y += 5;
    drawTopicBanner(doc, ML, TW, y, name);
    y += 16;
  }

  function yearRow(yr, cnt) {
    ensureSpace(14);
    drawYearRow(doc, ML, TW, y, yr, cnt);
    y += 12;
  }

  function answerRow(q, n) {
    const ci          = getCorrectIdx(q);
    const letter      = ci >= 0 ? LETTERS[ci] : "?";
    const correctText = (ci >= 0 && q.options?.[ci]) ? optText(q.options[ci]) : "";

    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    const cLines = correctText ? splitLines(doc, correctText, TW - 34) : [];
    doc.setFont("helvetica", "italic"); doc.setFontSize(8.2);
    const eLines = q.explanation ? splitLines(doc, q.explanation, TW - 34) : [];

    const CL = 5.2;
    const EL = 4.8;
    const BADGE_H = 10;

    const totalH = Math.max(BADGE_H, cLines.length * CL + eLines.length * EL + BADGE_H);
    if (n % 2 === 0 && y + totalH <= MAX_Y) {
      doc.setFillColor(248, 247, 254);
      doc.rect(ML, y - 1, TW, totalH + 1, "F");
    }

    if (y + BADGE_H > MAX_Y) newPage();

    doc.setFillColor(...PDF.PURMD);
    doc.rect(ML, y, 1.5, BADGE_H - 1, "F");

    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.setTextColor(...PDF.MUTED);
    doc.text(`Q${n}`, ML + 4, y + 6);

    doc.setFillColor(...PDF.GRN);
    doc.circle(ML + 18, y + 4.8, 3.6, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(letter, ML + 18, y + 5.7, { align: "center" });

    y += BADGE_H;

    cLines.forEach(line => {
      if (y + CL > MAX_Y) newPage();
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.setTextColor(...PDF.GRN);
      doc.text(line, ML + 26, y + 4);
      y += CL;
    });

    eLines.forEach(line => {
      if (y + EL > MAX_Y) newPage();
      doc.setFont("helvetica", "italic"); doc.setFontSize(8.2);
      doc.setTextColor(...PDF.INK2);
      doc.text(line, ML + 26, y + 4);
      y += EL;
    });

    if (y + 4 > MAX_Y) newPage();
    doc.setDrawColor(...PDF.HAIR); doc.setLineWidth(0.1);
    doc.line(ML, y + 1, ML + TW, y + 1);
    y += 5;
  }

  doc.addPage(); pageNum++; header();

  let chNum = 0, qNum = 1;
  for (const ch of activeChapters) {
    const chTopics = selectedTopics.filter(t => t.chapterId === ch._id);
    if (!chTopics.length) continue;
    chNum++;
    chapterOpener(ch, chNum);

    for (const sel of chTopics) {
      const qs = (topicQuestions[sel.topicId] || []).filter(q => {
        const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo);
      });
      if (!qs.length) continue;
      topicBlock(sel.topicName);

      const byYear = qs.reduce((acc, q) => {
        const yr = q.year || "Unknown"; (acc[yr] = acc[yr] || []).push(q); return acc;
      }, {});
      Object.keys(byYear).sort((a, b) => b - a).forEach(yr => {
        yearRow(yr, byYear[yr].length);
        byYear[yr].forEach(q => answerRow(q, qNum++));
      });
    }
  }
  footer();

  doc.save(`PYQ_${safeText(subLabel)}_AnswerKey_${yearFrom}-${yearTo}.pdf`);
}

/* ═══════════════════════════════════════════════════════════════════
   YOUTUBE-STYLE SKELETON LOADER
═══════════════════════════════════════════════════════════════════ */
function QuestionSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Top bar (YouTube red progress bar style) */}
      <div style={{
        height: 3,
        background: "linear-gradient(90deg, #7c3aed 0%, #a78bfa 40%, #7c3aed 60%, #a78bfa 100%)",
        backgroundSize: "200% 100%",
        borderRadius: 99,
        animation: "ytScan 1.4s ease-in-out infinite",
        marginBottom: 6,
      }} />

      {/* 2-col skeleton cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: 11,
            border: "1.5px solid #ede9f6",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            {/* header row */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "#f3f0ff", animation: "skelPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
              <div style={{ width: 55, height: 14, borderRadius: 6, background: "#f3f0ff", animation: "skelPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
              <div style={{ marginLeft: "auto", width: 32, height: 14, borderRadius: 6, background: "#f3f0ff", animation: "skelPulse 1.6s ease-in-out infinite" }} />
            </div>
            {/* question text lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 14, borderRadius: 5, background: "#f1f0f9", animation: "skelPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.05}s` }} />
              <div style={{ height: 14, borderRadius: 5, background: "#f1f0f9", width: "85%", animation: "skelPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.08}s` }} />
              <div style={{ height: 14, borderRadius: 5, background: "#f1f0f9", width: "70%", animation: "skelPulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.12}s` }} />
            </div>
            {/* option rows */}
            {[1, 2, 3, 4].map(j => (
              <div key={j} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 9px", borderRadius: 7,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}>
                <div style={{ width: 17, height: 17, borderRadius: 4, background: "#e5e7eb", flexShrink: 0, animation: "skelPulse 1.6s ease-in-out infinite", animationDelay: `${(i + j) * 0.07}s` }} />
                <div style={{ flex: 1, height: 12, borderRadius: 4, background: "#ede9f6", animation: "skelPulse 1.6s ease-in-out infinite", animationDelay: `${(i + j) * 0.09}s` }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function PYQBook() {
  // subject here is the MongoDB _id string of the Subject document
  // React Router path should be: /admin/pyq/:subject
  // where :subject = the Subject._id from your DB
  // SUBJECT_MAP maps known subject _ids to display config.
  // During development it falls back to 'phy' config if id not found.
  const { subject } = useParams();
  const sub = SUBJECT_MAP[subject] || Object.values(SUBJECT_MAP)[0];
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

  const [chapterSearch, setChapterSearch] = useState("");

  // Year range: draft values (shown in selects) vs applied values (used for filtering/PDF)
  const [yearFromDraft, setYearFromDraft] = useState(2010);
  const [yearToDraft,   setYearToDraft]   = useState(2024);
  const [yearFrom,      setYearFrom]      = useState(2010);
  const [yearTo,        setYearTo]        = useState(2024);
  const yearRangeChanged = yearFromDraft !== yearFrom || yearToDraft !== yearTo;

  const [fullscreen,    setFullscreen]    = useState(false);
  const [downloading,   setDownloading]   = useState(false);
  const [downloadingKey, setDownloadingKey] = useState(false);

  /* fetch chapters */
  useEffect(() => {
    setChapters([]); setExpandedChapters(new Set());
    setChapterTopics({}); setSelectedTopics([]);
    setTopicQuestions({}); setLoadingChapters(true); setChapterError(false);
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(`${baseURL}/pyq/${subject}/chapters`, {  // subject = subjectId
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error();
        const data = await r.json();
        const list = Array.isArray(data) ? data : [];
        setChapters(list);
      } catch {
        setChapters([]);
        setChapterError(true);
      } finally {
        setLoadingChapters(false);
      }
    })();
  }, [subject]);

  /* toggle accordion — only one chapter open at a time */
  const toggleChapter = async (chapter) => {
    const isOpen = expandedChapters.has(chapter._id);
    setExpandedChapters(prev => {
      // If already open → close it. Otherwise open only this one (clear all others).
      if (isOpen) return new Set();
      return new Set([chapter._id]);
    });
    if (!isOpen && !chapterTopics[chapter._id]) {
      setLoadingTopics(prev => ({ ...prev, [chapter._id]: true }));
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(
          `${baseURL}/pyq/${subject}/chapters/${chapter._id}/topics`,  // subject = subjectId
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!r.ok) throw new Error();
        const data = await r.json();
        const list = Array.isArray(data) ? data : [];
        setChapterTopics(prev => ({
          ...prev,
          [chapter._id]: list,
        }));
      } catch {
        setChapterTopics(prev => ({
          ...prev,
          [chapter._id]: [],
        }));
      } finally {
        setLoadingTopics(prev => ({ ...prev, [chapter._id]: false }));
      }
    }
  };

  /* fetch questions for one topic */
  const fetchTopicQs = useCallback(async (topic, chapter) => {
    setLoadingQuestions(prev => ({ ...prev, [topic._id]: true }));
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(
        `${baseURL}/pyq/${subject}/chapters/${chapter._id}/topics/${topic._id}/questions`,  // subject = subjectId
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!r.ok) throw new Error();
      const data = await r.json();
      const list = Array.isArray(data) ? data : [];
      setTopicQuestions(prev => ({ ...prev, [topic._id]: list }));
    } catch {
      setTopicQuestions(prev => ({ ...prev, [topic._id]: [] }));
    } finally {
      setLoadingQuestions(prev => ({ ...prev, [topic._id]: false }));
    }
  }, [subject, baseURL]);

  /* toggle single topic */
  const toggleTopic = (topic, chapter) => {
    const isSel = selectedTopics.some(t => t.topicId === topic._id);
    if (isSel) {
      setSelectedTopics(prev => prev.filter(t => t.topicId !== topic._id));
    } else {
      setSelectedTopics(prev => [...prev, {
        topicId: topic._id, topicName: topic.name,
        chapterId: chapter._id, chapterName: chapter.name,
      }]);
      // Questions fetched on explicit Apply Changes
    }
  };

  /* select all in chapter */
  const selectAllInChapter = (chapter) => {
    const topics  = chapterTopics[chapter._id] || [];
    const newOnes = topics.filter(t => !selectedTopics.some(s => s.topicId === t._id));
    if (!newOnes.length) return;
    setSelectedTopics(prev => [...prev, ...newOnes.map(t => ({
      topicId: t._id, topicName: t.name,
      chapterId: chapter._id, chapterName: chapter.name,
    }))]);
    // Questions fetched on explicit Apply Changes
  };

  /* clear chapter selections */
  const clearChapter = (chapter) => {
    const ids = new Set((chapterTopics[chapter._id] || []).map(t => t._id));
    setSelectedTopics(prev => prev.filter(t => !ids.has(t.topicId)));
  };

  /* remove single topic from right */
  const removeTopic = (topicId) => setSelectedTopics(prev => prev.filter(t => t.topicId !== topicId));

  /* apply all changes: year range + fetch questions for all selected topics */
  const [applyingChanges, setApplyingChanges] = useState(false);

  const applyChanges = async () => {
    if (applyingChanges) return;
    // commit year range
    setYearFrom(yearFromDraft);
    setYearTo(yearToDraft);
    if (!selectedTopics.length) return;
    setApplyingChanges(true);
    // clear old questions + mark ALL selected topics as loading
    const loadingPatch = {};
    selectedTopics.forEach(sel => { loadingPatch[sel.topicId] = true; });
    setTopicQuestions({});
    setLoadingQuestions(loadingPatch);
    // fetch ALL selected topics fresh in parallel
    await Promise.all(selectedTopics.map(async sel => {
      try {
        const token = localStorage.getItem("token");
        const r = await fetch(
          `${baseURL}/pyq/${subject}/chapters/${sel.chapterId}/topics/${sel.topicId}/questions`,  // subject = subjectId
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!r.ok) throw new Error();
        const data = await r.json();
        const list = Array.isArray(data) ? data : [];
        setTopicQuestions(prev => ({ ...prev, [sel.topicId]: list }));
      } catch {
        setTopicQuestions(prev => ({ ...prev, [sel.topicId]: [] }));
      } finally {
        setLoadingQuestions(prev => ({ ...prev, [sel.topicId]: false }));
      }
    }));
    setApplyingChanges(false);
  };

  /* apply year range (kept for the small inline Apply button) */
  const applyYearRange = () => {
    setYearFrom(yearFromDraft);
    setYearTo(yearToDraft);
  };

  /* derived */
  const filteredChapters = chapters.filter(c =>
    c.name?.toLowerCase().includes(chapterSearch.toLowerCase())
  );
  const activeChapters = chapters.filter(ch => selectedTopics.some(t => t.chapterId === ch._id));
  const totalQs = Object.values(topicQuestions).flat()
    .filter(q => { const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo); }).length;

  const args = { subLabel: sub.label, activeChapters, selectedTopics, topicQuestions, yearFrom, yearTo };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try { await generatePDF(args); }
    catch (e) { console.error(e); alert("PDF generation failed: " + e.message); }
    finally { setDownloading(false); }
  };

  const handleDownloadKey = async () => {
    if (downloadingKey) return;
    setDownloadingKey(true);
    try { await generateAnswerKeyPDF(args); }
    catch (e) { console.error(e); alert("Answer key generation failed: " + e.message); }
    finally { setDownloadingKey(false); }
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <AdminLayout>
      <PageHeader
        title={`PYQ Book — ${sub.label}`}
        subtitle="Pick chapters & topics from the left to build your question set"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {selectedTopics.length > 0 && (<>
              {/* Answer Key button */}
              <button
                onClick={handleDownloadKey} disabled={downloadingKey}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: downloadingKey ? "#f0fdf4" : "#fff",
                  color: "#16a34a",
                  padding: "6px 13px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: "1.5px solid #bbf7d0",
                  cursor: downloadingKey ? "default" : "pointer",
                  boxShadow: downloadingKey ? "none" : "0 2px 8px rgba(22,163,74,0.15)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!downloadingKey) { e.currentTarget.style.background="#f0fdf4"; e.currentTarget.style.borderColor="#86efac"; } }}
                onMouseLeave={e => { if (!downloadingKey) { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#bbf7d0"; } }}
              >
                {downloadingKey
                  ? <><Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> Generating…</>
                  : <><FileDown size={13} /> Answer Key</>}
              </button>
              {/* Questions button */}
              <button
                onClick={handleDownload} disabled={downloading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: downloading ? "#f5f3ff" : "linear-gradient(135deg,#7c3aed,#6366f1)",
                  color: downloading ? "#7c3aed" : "#fff",
                  padding: "6px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: "none", cursor: downloading ? "default" : "pointer",
                  boxShadow: downloading ? "none" : "0 2px 10px rgba(109,40,217,0.28)",
                  transition: "all 0.15s",
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
            }}>
              {sub.label}
            </span>
          </div>
        }
      />

      <div style={{
        flex: 1, display: "flex", overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif", minHeight: 0,
      }} className="page-enter">

        {/* ══════════ LEFT PANEL ══════════ */}
        {!fullscreen && (
          <div style={{
            width: 280, flexShrink: 0, display: "flex", flexDirection: "column",
            borderRight: `1px solid ${T.border}`, background: "#fff", minHeight: 0,
          }}>

            {/* Year range — with Apply button */}
            <div style={{ padding: "12px 12px 10px", borderBottom: "1px solid #f3f0ff", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <Filter size={10} style={{ color: "#a78bfa" }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Year Range
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 5, alignItems: "end", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>From</div>
                  <select value={yearFromDraft} onChange={e => setYearFromDraft(+e.target.value)} style={{
                    width: "100%", padding: "6px 7px", borderRadius: 7,
                    border: `1.5px solid ${yearRangeChanged ? "#a78bfa" : "#e5e7eb"}`, fontSize: 11, fontWeight: 700,
                    color: "#374151", background: "#fff", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  }}>
                    {YEAR_OPTIONS.filter(y => y <= yearToDraft).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, paddingBottom: 6 }}>—</span>
                <div>
                  <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>To</div>
                  <select value={yearToDraft} onChange={e => setYearToDraft(+e.target.value)} style={{
                    width: "100%", padding: "6px 7px", borderRadius: 7,
                    border: `1.5px solid ${yearRangeChanged ? "#a78bfa" : "#e5e7eb"}`, fontSize: 11, fontWeight: 700,
                    color: "#374151", background: "#fff", outline: "none",
                    fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                  }}>
                    {YEAR_OPTIONS.filter(y => y >= yearFromDraft).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Apply button */}
              <button
                onClick={applyYearRange}
                disabled={!yearRangeChanged}
                style={{
                  width: "100%", padding: "7px", borderRadius: 8,
                  fontSize: 11, fontWeight: 700,
                  background: yearRangeChanged
                    ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                    : "#f3f4f6",
                  color: yearRangeChanged ? "#fff" : "#9ca3af",
                  border: "none",
                  cursor: yearRangeChanged ? "pointer" : "default",
                  transition: "all 0.18s",
                  boxShadow: yearRangeChanged ? "0 2px 8px rgba(109,40,217,0.25)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
                onMouseEnter={e => { if (yearRangeChanged) e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {yearRangeChanged ? (
                  <><Play size={10} style={{ fill: "#fff" }} /> Apply {yearFromDraft}–{yearToDraft}</>
                ) : (
                  <>Applied: {yearFrom}–{yearTo}</>
                )}
              </button>

              {selectedTopics.length > 0 && (
                <div style={{
                  marginTop: 8, fontSize: 10, fontWeight: 600,
                  color: "#7c3aed", background: "#f5f3ff",
                  padding: "3px 9px", borderRadius: 6, border: "1px solid #ddd6fe",
                  display: "inline-block",
                }}>
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
                  style={{
                    width: "100%", boxSizing: "border-box",
                    paddingLeft: 32, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                    background: "transparent", border: "1.5px solid #e5e7eb",
                    borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#374151",
                    outline: "none", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "#a78bfa")}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              {!loadingChapters && (
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 500, marginTop: 6, paddingLeft: 2 }}>
                  {filteredChapters.length} chapter{filteredChapters.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Chapter accordions */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "8px" }} className="no-scrollbar">
              {loadingChapters ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                  <Loader2 size={20} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
                </div>
              ) : chapterError ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>⚠️</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Failed to load chapters</div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>Could not reach the server.<br />Check your connection and try again.</div>
                </div>
              ) : filteredChapters.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <BookOpen size={26} style={{ color: "#e5e7eb", display: "block", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>No chapters found</div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
                    No PYQ chapters exist for this subject yet.<br />
                    Add questions via the question bank first.
                  </div>
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
                        width: "100%", boxSizing: "border-box",
                        padding: "9px 11px",
                        borderRadius: isOpen ? "9px 9px 0 0" : 9,
                        cursor: "pointer",
                        background: selectedInCh > 0
                          ? "linear-gradient(135deg,#7c3aed,#6366f1)"
                          : isOpen ? "#f5f3ff" : "transparent",
                        border: `1.5px solid ${selectedInCh > 0 ? "#7c3aed" : isOpen ? "#ddd6fe" : "transparent"}`,
                        transition: "all 0.13s",
                      }}
                      onMouseEnter={e => { if (!selectedInCh && !isOpen) e.currentTarget.style.background = T.hover; }}
                      onMouseLeave={e => { if (!selectedInCh && !isOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{
                        fontSize: 11, fontWeight: 700, flex: 1, lineHeight: 1.3,
                        color: selectedInCh > 0 ? "#fff" : T.text,
                      }}>
                        {idx + 1}.&nbsp;{ch.name}
                      </span>
                      {selectedInCh > 0 && (
                        <span style={{
                          fontSize: 9, fontWeight: 800,
                          background: "rgba(255,255,255,0.22)",
                          color: "#e9d5ff", padding: "1px 6px", borderRadius: 99,
                        }}>
                          {selectedInCh}
                        </span>
                      )}
                      {isOpen
                        ? <ChevronDown size={12} style={{ color: selectedInCh > 0 ? "#c4b5fd" : "#94a3b8", flexShrink: 0 }} />
                        : <ChevronRight size={12} style={{ color: selectedInCh > 0 ? "#c4b5fd" : "#94a3b8", flexShrink: 0 }} />}
                    </button>

                    {isOpen && (
                      <div style={{
                        background: "#faf8ff",
                        border: "1.5px solid #ddd6fe", borderTop: "none",
                        borderRadius: "0 0 9px 9px", padding: "8px 8px 10px",
                      }}>
                        {isLoadingT ? (
                          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                            <Loader2 size={16} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite" }} />
                          </div>
                        ) : topics.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "10px 4px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 3 }}>No topics found</div>
                            <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.5 }}>No PYQ topics exist under this chapter yet.</div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
                              <button
                                onClick={() => allSelected ? clearChapter(ch) : selectAllInChapter(ch)}
                                style={{
                                  all: "unset", cursor: "pointer",
                                  fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                                  background: allSelected ? "#fff1f2" : "#ede9fe",
                                  color: allSelected ? "#ef4444" : "#7c3aed",
                                  border: `1px solid ${allSelected ? "#fecdd3" : "#ddd6fe"}`,
                                  transition: "all 0.12s",
                                }}
                              >
                                {allSelected ? "\u2715  Clear all" : "\u2713  Select all"}
                              </button>
                              {selectedInCh > 0 && !allSelected && (
                                <button
                                  onClick={() => clearChapter(ch)}
                                  style={{
                                    all: "unset", cursor: "pointer",
                                    fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                                    background: "#fff1f2", color: "#ef4444",
                                    border: "1px solid #fecdd3",
                                  }}
                                >
                                  Clear
                                </button>
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
                                    style={{
                                      all: "unset", display: "flex", alignItems: "center", gap: 7,
                                      cursor: "pointer", padding: "6px 9px", borderRadius: 7,
                                      background: isSel ? "#7c3aed" : "#fff",
                                      border: `1.5px solid ${isSel ? "#7c3aed" : "#e5e7eb"}`,
                                      transition: "all 0.12s",
                                    }}
                                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#f5f3ff"; }}
                                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "#fff"; }}
                                  >
                                    <div style={{
                                      width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                                      background: isSel ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                                      border: `1.5px solid ${isSel ? "rgba(255,255,255,0.5)" : "#d1d5db"}`,
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                      {isSel && <div style={{ width: 6, height: 6, borderRadius: 2, background: "#fff" }} />}
                                    </div>
                                    <span style={{
                                      fontSize: 11, fontWeight: isSel ? 700 : 500,
                                      color: isSel ? "#fff" : "#374151", flex: 1, lineHeight: 1.3,
                                    }}>
                                      {topic.name}
                                    </span>
                                    {isLoadQ
                                      ? <Loader2 size={10} style={{ color: "#a78bfa", animation: "nexusSpin 1s linear infinite", flexShrink: 0 }} />
                                      : topic.questionCount != null && (
                                        <span style={{ fontSize: 9, fontWeight: 700, color: isSel ? "#e9d5ff" : T.muted, flexShrink: 0 }}>
                                          {topic.questionCount}q
                                        </span>
                                      )
                                    }
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

            {/* ── Apply Changes button ── */}
            {selectedTopics.length > 0 && (
              <div style={{ padding: "10px 12px", borderTop: "1px solid #f3f0ff", flexShrink: 0 }}>
                <button
                  onClick={applyChanges}
                  disabled={applyingChanges}
                  style={{
                    width: "100%", padding: "9px", borderRadius: 9,
                    fontSize: 12, fontWeight: 800,
                    background: applyingChanges
                      ? "#f5f3ff"
                      : "linear-gradient(135deg, #7c3aed, #6366f1)",
                    color: applyingChanges ? "#7c3aed" : "#fff",
                    border: "none",
                    cursor: applyingChanges ? "default" : "pointer",
                    transition: "all 0.18s",
                    boxShadow: applyingChanges ? "none" : "0 3px 12px rgba(109,40,217,0.30)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={e => { if (!applyingChanges) e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  {applyingChanges ? (
                    <><Loader2 size={13} style={{ animation: "nexusSpin 1s linear infinite" }} /> Fetching questions…</>
                  ) : (
                    <>&#10003;&nbsp;&nbsp;Apply Changes &middot; {selectedTopics.length} topic{selectedTopics.length !== 1 ? "s" : ""}</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════ RIGHT PANEL — BOOK ══════════ */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", background: "#f4f3fa", minHeight: 0,
        }}>
          {activeChapters.length === 0 ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center",
            }}>
              <div style={{
                width: 58, height: 58, borderRadius: 17, background: "#fff",
                border: "1.5px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}>
                <BookOpen size={24} style={{ color: "#d1d5db" }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                Select topics to begin
              </div>
              <p style={{ fontSize: 12, color: T.muted, maxWidth: 260, lineHeight: 1.7, margin: 0 }}>
                Expand a chapter on the left, tick the topics you want, then press <strong>Apply Changes</strong> to load questions.
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 20px 40px" }}>

              {/* fullscreen toggle */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <button
                  onClick={() => setFullscreen(f => !f)}
                  style={{
                    all: "unset", cursor: "pointer", padding: 7, borderRadius: 8, lineHeight: 0,
                    border: "1.5px solid #e5e7eb", color: "#64748b", background: "#fff",
                    transition: "all 0.15s",
                  }}
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

                      {/* ═══ Chapter heading ═══ */}
                      <div style={{
                        background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                        borderRadius: 13, padding: "13px 20px", marginBottom: 14,
                        display: "flex", alignItems: "center", gap: 10,
                        boxShadow: "0 4px 16px rgba(109,40,217,0.22)",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{
                          position: "absolute", right: -18, top: -18, width: 75, height: 75,
                          borderRadius: "50%", background: "rgba(255,255,255,0.07)",
                        }} />
                        <BookOpen size={15} style={{ color: "#c4b5fd", flexShrink: 0 }} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", flex: 1 }}>
                          {ch.name}
                        </span>
                        <span style={{
                          fontSize: 10, color: "#c4b5fd", fontWeight: 600,
                          background: "rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: 99,
                        }}>
                          {chTopics.length} topic{chTopics.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* ── Topics ── */}
                      <div style={{ paddingLeft: 4, display: "flex", flexDirection: "column", gap: 16 }}>
                        {chTopics.map(sel => {
                          const qs = (topicQuestions[sel.topicId] || []).filter(q => {
                            const yr = parseInt(q.year);
                            return !q.year || (yr >= yearFrom && yr <= yearTo);
                          });
                          const isLoadQ = loadingQuestions[sel.topicId];
                          const byYear  = qs.reduce((acc, q) => {
                            const yr = q.year || "Unknown";
                            (acc[yr] = acc[yr] || []).push(q); return acc;
                          }, {});
                          const sortedYears = Object.keys(byYear).sort((a, b) => b - a);

                          return (
                            <div key={sel.topicId}>
                              {/* ─── Topic heading ─── */}
                              <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 16px", background: "#fff",
                                borderRadius: 10, border: `1.5px solid ${T.border}`,
                                marginBottom: 10,
                                boxShadow: "0 1px 5px rgba(109,40,217,0.06)",
                              }}>
                                <div style={{
                                  width: 4, height: 18, borderRadius: 3,
                                  background: sub.color, flexShrink: 0,
                                }} />
                                <Tag size={11} style={{ color: "#a78bfa" }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", flex: 1 }}>
                                  {sel.topicName}
                                </span>
                                {qs.length > 0 && (
                                  <span style={{
                                    fontSize: 11, fontWeight: 700, color: "#7c3aed",
                                    background: "#f5f3ff", padding: "2px 9px",
                                    borderRadius: 99, border: "1px solid #ddd6fe",
                                  }}>
                                    {qs.length}&nbsp;Q
                                  </span>
                                )}
                                <button
                                  onClick={() => removeTopic(sel.topicId)}
                                  title="Remove topic"
                                  style={{
                                    all: "unset", cursor: "pointer", lineHeight: 0,
                                    padding: 4, borderRadius: 6, color: "#d1d5db", transition: "all 0.13s",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fff1f2"; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.background = "transparent"; }}
                                >
                                  <X size={12} />
                                </button>
                              </div>

                              {/* ── YouTube-style skeleton OR questions ── */}
                              {isLoadQ ? (
                                <QuestionSkeleton />
                              ) : qs.length === 0 ? (
                                <div style={{
                                  background: "#fff", borderRadius: 10, border: `1px solid ${T.border}`,
                                  padding: "18px 20px", textAlign: "center",
                                }}>
                                  {topicQuestions[sel.topicId] === undefined ? (
                                    <>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
                                        Press Apply Changes to load questions
                                      </div>
                                      <div style={{ fontSize: 11, color: T.muted }}>
                                        Select your topics and click the button below.
                                      </div>
                                    </>
                                  ) : topicQuestions[sel.topicId]?.length === 0 ? (
                                    <>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
                                        No questions found
                                      </div>
                                      <div style={{ fontSize: 11, color: T.muted }}>
                                        No PYQ questions exist for this topic yet, or none match the {yearFrom}–{yearTo} range.
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 4 }}>
                                        No questions in {yearFrom}–{yearTo}
                                      </div>
                                      <div style={{ fontSize: 11, color: T.muted }}>
                                        Try widening the year range and pressing Apply Changes again.
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                  {sortedYears.map(year => (
                                    <div key={year}>
                                      {/* Year divider */}
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <Calendar size={11} style={{ color: "#7c3aed", flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed" }}>{year}</span>
                                        <div style={{ flex: 1, height: 1, background: "#ede9fe" }} />
                                        <span style={{
                                          fontSize: 10, fontWeight: 700, color: "#a78bfa",
                                          background: "#f5f3ff", padding: "1px 7px",
                                          borderRadius: 99, border: "1px solid #ddd6fe",
                                        }}>
                                          {byYear[year].length}&nbsp;Q
                                        </span>
                                      </div>
                                      {/* 2-col question grid */}
                                      <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: 10,
                                      }}>
                                        {byYear[year].map((q, qi) => (
                                          <QuestionCard
                                            key={q._id || qi}
                                            q={q} qi={qi}
                                            correctIdx={getCorrectIdx(q)}
                                            sub={sub} year={year}
                                          />
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
        @keyframes nexusSpin { to { transform: rotate(360deg); } }

        @keyframes skelPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        @keyframes ytScan {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </AdminLayout>
  );
}

/* ── Question card — improved font sizes ── */
function QuestionCard({ q, qi, correctIdx, sub, year }) {
  return (
    <div
      style={{
        background: "#fff", borderRadius: 11,
        border: "1.5px solid #ede9f6",
        padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
        boxShadow: "0 1px 4px rgba(109,40,217,0.05)", transition: "box-shadow 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(109,40,217,0.10)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(109,40,217,0.05)")}
    >
      {/* top row: number + shift + year */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: "#f5f3ff", color: "#7c3aed",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 800, border: "1px solid #ddd6fe",
        }}>
          {qi + 1}
        </span>
        {q.shift && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#6366f1",
            background: "#eef2ff", padding: "2px 7px",
            borderRadius: 99, border: "1px solid #c7d2fe",
          }}>
            {q.shift}
          </span>
        )}
        <span style={{
          fontSize: 9, fontWeight: 700, marginLeft: "auto",
          color: sub.color, background: sub.bg,
          padding: "2px 7px", borderRadius: 99, border: `1px solid ${sub.border}`,
        }}>
          {year}
        </span>
      </div>

      {/* question text — increased to 14px */}
      <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.7 }}>
        {q.question}
      </div>
      {q.questionImage && (
        <img src={q.questionImage} alt="Question diagram" style={{
          maxWidth: "100%", borderRadius: 7, border: "1px solid #e5e7eb",
        }} />
      )}

      {/* options — increased to 13px */}
      {q.options?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {q.options.map((opt, oi) => {
            const isC = oi === correctIdx;
            const text = optText(opt);
            const img  = typeof opt === "object" ? opt.image : null;
            return (
              <div key={oi} style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                padding: "7px 10px", borderRadius: 8,
                background: isC ? "#ecfdf5" : "#f9fafb",
                border: `1px solid ${isC ? "#a7f3d0" : "#e5e7eb"}`,
              }}>
                <span style={{
                  flexShrink: 0, width: 20, height: 20, borderRadius: 5,
                  background: isC ? "#10b981" : "#e5e7eb",
                  color: isC ? "#fff" : "#64748b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, marginTop: 1,
                }}>
                  {LETTERS[oi]}
                </span>
                <span style={{
                  fontSize: 13, lineHeight: 1.5, flex: 1,
                  color: isC ? "#047857" : "#374151",
                  fontWeight: isC ? 600 : 400,
                }}>
                  {text}
                  {img && <img src={img} alt="" style={{ display: "block", maxWidth: "100%", marginTop: 4, borderRadius: 4 }} />}
                </span>
                {isC && <CheckCircle2 size={14} style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* explanation — increased to 12px */}
      {(q.explanation || q.explanationImage) && (
        <div style={{
          fontSize: 12, color: "#64748b", fontStyle: "italic",
          lineHeight: 1.6, borderTop: "1px dashed #e5e7eb", paddingTop: 8,
        }}>
          {q.explanation}
          {q.explanationImage && (
            <img src={q.explanationImage} alt="Explanation diagram" style={{
              display: "block", maxWidth: "100%", marginTop: 6, borderRadius: 6,
              border: "1px solid #e5e7eb",
            }} />
          )}
        </div>
      )}
    </div>
  );
}