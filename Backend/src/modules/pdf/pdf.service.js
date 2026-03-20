import { extractText } from "unpdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ─── PDF text extractor ────────────────────────────────────────── */
export const extractQuestionsFromPDF = async (buffer, subject) => {
  const uint8Array = new Uint8Array(buffer);
  const { text } = await extractText(uint8Array, {
    mergePages: true,
    normalizeWhitespace: true,
  });

  if (!text || text.length < 100)
    throw new Error("PDF text extraction failed or too short");

  const SAFE_TEXT = text.slice(0, 15000);

  const prompt = `
You are an exam question extractor specialized in academic and scientific content.
TASK: Convert the given text into MCQ questions with full LaTeX support.
STRICT RULES: Return ONLY valid JSON array — no markdown, no explanation.
LATEX RULES: Use $...$ for inline math, $$...$$ for display math. Use LaTeX for all math symbols.
SCHEMA:
[{ "questionText":"string","options":[{"text":"string","isImageOption":false},{"text":"string","isImageOption":false},{"text":"string","isImageOption":false},{"text":"string","isImageOption":false}],"correctAnswer":0,"explanation":"string" }]
SUBJECT: ${subject}
TEXT: ${SAFE_TEXT}`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    const clean = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error("Not an array");
    const sanitized = parsed
      .filter(q => q.questionText && Array.isArray(q.options) && q.options.length >= 2)
      .map(q => ({
        questionText: q.questionText.trim(),
        options: q.options.map(opt =>
          typeof opt === "string"
            ? { text: opt.trim(), isImageOption: false, image: null }
            : { text: (opt.text || "").trim(), isImageOption: false, image: null }
        ),
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
        explanation: q.explanation || "",
      }));
    if (!sanitized.length) throw new Error("No valid questions found");
    return sanitized;
  } catch (err) {
    console.error("Gemini raw response:", responseText);
    throw new Error("Failed to parse Gemini response: " + err.message);
  }
};

/* ═══════════════════════════════════════════════════════════════════
   generatePuppeteerPDF
   
   - Cover: full bleed dark page, large typography, feels like a real
     book cover — zero content-page chrome on it
   - Chapter headings: compact, typographic, not oversized
   - Questions: 9.5pt body text, tight but readable
   - Content margins: 14mm each side (wide usable area)
   - Answer key: question (italic/muted) + green answer block + explanation
   - Question paper: question + options only, no answer shown
═══════════════════════════════════════════════════════════════════ */
export async function generatePuppeteerPDF(payload) {
  const { default: puppeteer } = await import("puppeteer");

  const {
    subLabel       = "Subject",
    activeChapters = [],
    selectedTopics = [],
    topicQuestions = {},
    yearFrom       = 2010,
    yearTo         = 2024,
    docType        = "QUESTION PAPER",
    instituteName  = "Nexus",
  } = payload;

  const LETTERS     = ["A", "B", "C", "D", "E"];
  const isAnswerKey = docType === "ANSWER KEY";

  const optText = opt => {
    if (!opt) return "";
    if (typeof opt === "string") return opt;
    return opt.text || "";
  };

  const getCorrectIdx = q => {
    if (typeof q.correctOption === "number") return q.correctOption;
    if (typeof q.correctAnswer === "number") return q.correctAnswer;
    if (q.correctAnswer) {
      const ci = LETTERS.indexOf(String(q.correctAnswer).toUpperCase());
      if (ci !== -1) return ci;
    }
    return -1;
  };

  /* ── Build question body HTML ─────────────────────────────────── */
  let bodyHTML   = "";

  for (const ch of activeChapters) {
    const chTopics = selectedTopics.filter(t => t.chapterId === ch._id);
    if (!chTopics.length) continue;

    let chQNum = 1; // reset to 1 for every chapter

    bodyHTML += `<div class="ch-block">
      <p class="ch-super">Chapter</p>
      <h2 class="ch-name">${ch.name}</h2>
    </div>`;

    for (const sel of chTopics) {
      const qs = (topicQuestions[sel.topicId] || []).filter(q => {
        const yr = parseInt(q.year);
        return !q.year || (yr >= yearFrom && yr <= yearTo);
      });
      if (!qs.length) continue;

      bodyHTML += `<div class="topic-row">
        <span class="topic-line"></span>
        <span class="topic-name">${sel.topicName}</span>
        <span class="topic-line"></span>
      </div>`;

      const byYear = qs.reduce((acc, q) => {
        const yr = q.year || "Unknown";
        (acc[yr] = acc[yr] || []).push(q);
        return acc;
      }, {});

      for (const yr of Object.keys(byYear).sort((a, b) => b - a)) {
        const qList = byYear[yr];

        bodyHTML += `<div class="yr-row">
          <span class="yr-pill">${yr}</span>
          <span class="yr-n">${qList.length}&nbsp;Q</span>
        </div>`;

        for (const q of qList) {
          const correctIdx = getCorrectIdx(q);
          const qText      = q.question || q.questionText || "";
          const opts       = (q.options || []).map(optText);
          const allShort   = opts.length === 4 && opts.every(t => t.length <= 42);

          let optsHTML;
          if (allShort) {
            optsHTML = `<table class="og"><tr>
              <td class="oc"><b class="ol">(${LETTERS[0]})</b><span class="ot">${opts[0]}</span></td>
              <td class="oc"><b class="ol">(${LETTERS[1]})</b><span class="ot">${opts[1]}</span></td>
            </tr><tr>
              <td class="oc"><b class="ol">(${LETTERS[2]})</b><span class="ot">${opts[2]}</span></td>
              <td class="oc"><b class="ol">(${LETTERS[3]})</b><span class="ot">${opts[3]}</span></td>
            </tr></table>`;
          } else {
            optsHTML = `<div class="os">${
              opts.map((t, i) => `<div class="or"><b class="ol">(${LETTERS[i]})</b><span class="ot">${t}</span></div>`).join("")
            }</div>`;
          }

          if (isAnswerKey) {
            const letter      = correctIdx >= 0 ? LETTERS[correctIdx] : "?";
            const correctText = correctIdx >= 0 && q.options?.[correctIdx]
              ? optText(q.options[correctIdx]) : "";

            bodyHTML += `<div class="qw ak">
              <div class="ql">
                <span class="qn">${chQNum}.</span>
                <div class="qb">
                  <span class="qt ak-qt">${qText}</span>
                  ${q.questionImage ? `<img src="${q.questionImage}" class="qi"/>` : ""}
                  ${optsHTML}
                  <div class="ak-box">
                    <span class="ak-dot">${letter}</span>
                    <span class="ak-ans">${correctText}</span>
                    ${q.shift ? `<span class="ak-shift">${q.shift}</span>` : ""}
                  </div>
                  ${q.explanation ? `<div class="ak-exp">&#9658;&nbsp;${q.explanation}</div>` : ""}
                </div>
              </div>
            </div>`;
          } else {
            bodyHTML += `<div class="qw">
              <div class="ql">
                <span class="qn">${chQNum}.</span>
                <div class="qb">
                  <span class="qt">${qText}</span>
                  ${q.questionImage ? `<img src="${q.questionImage}" class="qi"/>` : ""}
                  ${optsHTML}
                </div>
              </div>
            </div>`;
          }

          chQNum++;
        }
      }
    }
  }

  /* total across all chapters — for cover stats */
  const totalQs = Object.values(topicQuestions).flat()
    .filter(q => { const yr = parseInt(q.year); return !q.year || (yr >= yearFrom && yr <= yearTo); }).length;
  const today   = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  /* ── Full HTML ────────────────────────────────────────────────── */
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${instituteName} · ${subLabel} · ${docType}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"/>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body,{
    delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],
    throwOnError:false
  })"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:9.5pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:'Inter',-apple-system,sans-serif;color:#111827;background:#fff;line-height:1.5}


@page {
  margin-top: 14mm;
  margin-bottom: 12mm;
}

@page :first {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* ═══════════════════════════════════════
   COVER — full bleed, no header/footer chrome
   feels like opening a book
═══════════════════════════════════════ */
/* ═══════════════════════════════════════
   LIGHT BLUE GEOMETRIC COVER (ARRANGED)
═══════════════════════════════════════ */
.cover {
  width: 210mm;
  height: 297mm;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  page-break-after: always;
}

/* Background Shapes */
.cv-bg-split {
  position: absolute;
  top: 0; right: 0;
  width: 100%; height: 55%;
  background: #dbeafe; /* Light Blue */
  clip-path: polygon(100% 0, 100% 100%, 0 40%, 0 0);
  z-index: 1;
}

.cv-accent-tri {
  position: absolute;
  top: 0; left: 0;
  width: 60%; height: 45%;
  background: #1e40af; /* Deep Blue */
  clip-path: polygon(0 0, 100% 0, 0 100%);
  z-index: 2;
}

.cv-circle {
  position: absolute;
  bottom: -50px; right: -50px;
  width: 280px; height: 280px;
  background: #60a5fa; /* Sky Blue */
  border-radius: 50%;
  z-index: 1;
}

.cv-circle-large {
  position: absolute;
  bottom: 120px; left: -80px;
  width: 350px; height: 350px;
  background: #eff6ff; /* Pale Blue */
  border-radius: 50%;
  z-index: 1;
}

/* Layout Containers */
.cv-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 25mm 20mm;
  position: relative;
  z-index: 10;
}

/* Top Section - Pushed to the right */
.cv-top-section {
  text-align: right;
  color: #ffffff;
  margin-bottom: 40px;
}

.cv-series-label {
  font-size: 9pt;
  font-weight: 800; /* Increased weight */
  letter-spacing: 3px;
  color: #ffffff; /* Solid white */
  text-shadow: 0 1px 2px rgba(0,0,0,0.2); /* Added for punchy visibility */
  text-transform: uppercase;
}

.cv-year-large {
  font-size: 72pt;
  font-weight: 900;
  line-height: 0.9;
  margin-right: -4px;
}

.cv-year-suffix {
  font-size: 18pt;
  vertical-align: super;
  margin-left: 2px;
}

/* Middle Section - Centered Vertically */
.cv-main-title-box {
  margin-top: auto;
  margin-bottom: auto;
}

.cv-brand-line {
  width: 60px;
  height: 4px;
  background: #1e40af;
  margin-bottom: 20px;
}

.cv-institute-tag {
  font-size: 14pt;
  font-weight: 700;
  color: #1e40af;
  letter-spacing: 1px;
  display: block;
}

.cv-subject-title {
  font-size: 64pt;
  font-weight: 900;
  color: #0f172a; /* Near black blue */
  line-height: 1;
  margin: 10px 0 20px;
  text-transform: uppercase;
  letter-spacing: -2px;
}

.cv-doc-type-pill {
  display: inline-block;
  background: #1e40af;
  color: #ffffff;
  padding: 6px 18px;
  font-size: 11pt;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 2px;
}

/* Bottom Section */
.cv-bottom-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid #e2e8f0;
  padding-top: 30px;
}

.cv-stats-row {
  display: flex;
  gap: 40px;
}

.cv-stat-item {
  display: flex;
  flex-direction: column;
}

.cv-stat-lab {
  font-size: 8pt;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.cv-stat-val {
  font-size: 24pt;
  font-weight: 900;
  color: #0f172a;
}

.cv-date-box {
  text-align: right;
}

.cv-date-label {
  font-size: 7pt;
  font-weight: 800; /* Heavier weight for readability */
  color: #334155; /* Dark Slate Blue instead of light gray */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.cv-date-val {
  font-size: 10pt;
  font-weight: 700;
  color: #1e40af; /* Keep the branding blue for the actual date */
}

/* ═══════════════════════════════════════
   CONTENT PAGES
═══════════════════════════════════════ */
.content{padding:6mm 0 14mm}

/* Chapter — compact typographic style */
.ch-block{
  page-break-before:always;
  padding-bottom:10px;
  margin-bottom:14px;
  border-bottom:2px solid #111827;
}
.ch-block:first-child{page-break-before:auto}

.ch-super{
  font-size:6pt;
  font-weight:700;
  color:#6d28d9;
  letter-spacing:.24em;
  text-transform:uppercase;
  margin-bottom:3px;
}
.ch-name{
  font-size:14pt;
  font-weight:800;
  color:#111827;
  letter-spacing:-.3px;
  line-height:1.1;
  text-transform:uppercase;
}

/* Topic — centered rule */
.topic-row{
  display:flex;align-items:center;gap:9px;
  margin:14px 0 8px;
  page-break-inside:avoid;
}
.topic-line{flex:1;height:1px;background:#e5e7eb}
.topic-name{
  font-size:7.5pt;
  font-weight:700;
  color:#374151;
  text-transform:uppercase;
  letter-spacing:.14em;
  white-space:nowrap;
  padding:0 3px;
}

/* Year row */
.yr-row{
  display:flex;align-items:center;gap:7px;
  margin:8px 0 5px;
  page-break-inside:avoid;
}
.yr-pill{
  font-size:7pt;font-weight:800;color:#fff;
  background:#6d28d9;padding:2px 8px;border-radius:3px;
  flex-shrink:0;
}
.yr-n{font-size:6.5pt;color:#94a3b8}
.yr-row::after{content:'';flex:1;height:1px;background:#ede9fe}

/* Question */
.qw{
  padding:6px 0 6px;
  border-bottom:1px solid #f3f4f6;
  page-break-inside:avoid;
}
.ql{display:flex;gap:8px;align-items:flex-start}
.qn{
  font-size:9.5pt;font-weight:700;color:#374151;
  flex-shrink:0;width:24px;text-align:right;line-height:1.55;
}
.qb{flex:1;display:flex;flex-direction:column}
.qt{
  font-size:9.5pt;font-weight:400;color:#111827;
  line-height:1.6;display:block;margin-bottom:6px;
}
.qi{
  display:block;max-width:320px;max-height:130px;
  object-fit:contain;border-radius:4px;
  border:1px solid #e5e7eb;margin-bottom:6px;
}

/* Options — 2-col table */
.og{width:100%;border-collapse:collapse;margin-bottom:1px}
.oc{
  padding:2px 10px 2px 0;vertical-align:top;
  width:50%;font-size:9pt;color:#374151;line-height:1.45;
}
.ol{font-weight:700;color:#374151;margin-right:4px;white-space:nowrap;font-style:normal}
.ot{font-size:9pt}

/* Options — stacked */
.os{display:flex;flex-direction:column;gap:2px;margin-bottom:1px}
.or{display:flex;gap:7px;align-items:flex-start;padding:2px 0}
.or .ol{flex-shrink:0;font-weight:700;color:#374151;width:24px}
.or .ot{font-size:9pt;color:#374151;line-height:1.45}

/* ═══════════════════════════════════════
   ANSWER KEY
═══════════════════════════════════════ */
.ak .qt.ak-qt{color:#6b7280;font-style:italic;font-size:9pt}

.ak-box{
  display:flex;align-items:center;gap:8px;
  margin-top:6px;padding:6px 11px;
  background:#f0fdf4;border:1.5px solid #6ee7b7;border-radius:5px;
}
.ak-dot{
  width:24px;height:24px;border-radius:50%;
  background:#10b981;color:#fff;
  font-size:10pt;font-weight:900;
  display:inline-flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.ak-ans{
  font-size:9.5pt;font-weight:700;color:#065f46;flex:1;line-height:1.45;
}
.ak-shift{
  font-size:6.5pt;font-weight:700;color:#6366f1;
  background:#eef2ff;padding:1px 6px;border-radius:99px;border:1px solid #c7d2fe;flex-shrink:0;
}
.ak-exp{
  font-size:8.5pt;font-style:italic;color:#64748b;line-height:1.55;
  margin-top:5px;padding:6px 9px;
  background:#f8fafc;border-left:3px solid #a7f3d0;border-radius:0 4px 4px 0;
}

/* KaTeX */
.katex{font-size:1em}
.katex-display{margin:4px 0;overflow-x:auto}

@media print{
  .cover{page-break-after:always}
  .ch-block{page-break-before:always}
  .ch-block:first-child{page-break-before:auto}
  .qw,.topic-row,.yr-row{page-break-inside:avoid}
}
</style>
</head>
<body>

<!-- ════════════════════════════════
     COVER PAGE
     Full bleed — no running header/footer
════════════════════════════════ -->
<div class="cover">
  <div class="cv-bg-split"></div>
  <div class="cv-accent-tri"></div>
  <div class="cv-circle-large"></div>
  <div class="cv-circle"></div>

  <div class="cv-body">
    <div class="cv-top-section">
      <div class="cv-series-label">PYQ SERIES</div>
      <div class="cv-year-large">2026<span class="cv-year-suffix">TH</span></div>
    </div>

    <div class="cv-main-title-box">
      <div class="cv-brand-line"></div>
      <span class="cv-institute-tag">${instituteName}</span>
      <h1 class="cv-subject-title">${subLabel}</h1>
      <div class="cv-doc-type-pill">${docType}</div>
    </div>

    <div class="cv-bottom-info">
      <div class="cv-stats-row">
        <div class="cv-stat-item">
          <span class="cv-stat-lab">Chapters</span>
          <span class="cv-stat-val">${activeChapters.length}</span>
        </div>
        <div class="cv-stat-item">
          <span class="cv-stat-lab">Questions</span>
          <span class="cv-stat-val">${totalQs}</span>
        </div>
      </div>
      
      <div class="cv-date-box">
        <div class="cv-date-label">GENERATED ON</div>
        <div class="cv-date-val">${today}</div>
      </div>
    </div>
  </div>
</div>

<!-- ════════════════════════════════
     CONTENT PAGES
════════════════════════════════ -->
<div class="content">
  ${bodyHTML}
</div>

</body>
</html>`;

  /* ── Puppeteer ────────────────────────────────────────────────── */
const browser = await puppeteer.launch({
    headless: "new",
    // 1. ADD THIS LINE (Verify path with 'which chromium-browser' on VPS)
    executablePath: '/usr/bin/chromium-browser', 
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Fixes shared memory issues on VPS
      "--disable-gpu"
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    try {
      await page.waitForFunction(
        () => document.querySelectorAll(".katex").length > 0 || !document.body.textContent.includes("$"),
        { timeout: 8000 }
      );
    } catch { /* proceed */ }
    await new Promise(r => setTimeout(r, 700));

    /* Running header shown on content pages (page 2 onwards).
       Puppeteer injects header/footer on every page including the cover,
       so we make the cover 297mm tall and give it its own top/bottom margin
       via the cover div itself — we zero out top/bottom for page 1 using
       a trick: set small margins and rely on the cover div filling the page. */
const headerHTML = `
<div style="
  font-family: Inter, sans-serif;
  font-size: 6.5pt;
  font-weight: 800;
  color: #ffffff; 
  mix-blend-mode: difference;
  letter-spacing: .08em;
  text-transform: uppercase;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 14mm;
  margin-top: 2mm;
  /* We remove the border-bottom here because blend-modes don't 
     always play well with thin lines over complex backgrounds */
">
  <span>${instituteName.toUpperCase()}&nbsp;·&nbsp;${subLabel.toUpperCase()}&nbsp;·&nbsp;${docType}</span>
  <span>${yearFrom}–${yearTo}</span>
</div>`;

    const footerHTML = `<div style="font-family:Inter,sans-serif;font-size:6.5pt;color:#94a3b8;width:100%;text-align:center;padding:0 14mm;">
      <span class="pageNumber"></span>
    </div>`;

    const buffer = await page.pdf({
      format:              "A4",
      printBackground:     true,
      displayHeaderFooter: true,
      headerTemplate:      headerHTML,
      footerTemplate:      footerHTML,
      margin: { top: "14mm", right: "14mm", bottom: "12mm", left: "14mm" },
    });

    return buffer;
  } finally {
    await browser.close();
  }
}