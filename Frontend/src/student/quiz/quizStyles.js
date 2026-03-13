/* ══════════════════════════════════════════════
   QUIZ STYLES — FontLoader + StyleInjector
   Extracted from StudentQuizFlow for modularity.
══════════════════════════════════════════════ */

import { useEffect } from 'react';

export const FontLoader = () => {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);
    return null;
};

export const StyleInjector = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
      .qf-root { font-family: 'DM Sans', sans-serif; }
      .qf-display { font-family: 'Bricolage Grotesque', sans-serif; }
      @keyframes qf-fadein  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      @keyframes qf-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      @keyframes qf-slide-up    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes qf-slide-right { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
      @keyframes qf-slide-left  { from{opacity:0;transform:translateX(18px)}  to{opacity:1;transform:translateX(0)} }
      .qf-anim        { animation: qf-fadein 0.32s ease both; }
      .qf-slide-up    { animation: qf-slide-up 0.38s cubic-bezier(.22,1,.36,1) both; }
      .qf-slide-right { animation: qf-slide-right 0.28s cubic-bezier(.22,1,.36,1) both; }
      .qf-slide-left  { animation: qf-slide-left 0.28s cubic-bezier(.22,1,.36,1) both; }
      .qf-subj-card { transition: all .22s cubic-bezier(.22,1,.36,1); }
      .qf-subj-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px -4px rgba(0,0,0,.11); }
      .qf-subj-card.sel { transform: translateY(-2px); }
      .qf-opt:hover:not(.sel) { border-color:#4F46E5!important; background:#F5F3FF!important; }
      .qf-opt { transition: all .15s ease; }
      .qf-btn { transition: all .18s ease; }
      .qf-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px -4px rgba(79,70,229,.45); }
      .qf-btn:active { transform:translateY(0); }
      .qf-chap-row { transition: background .15s; }
      .qf-chap-row:hover { background: #FAFAFE; }
      .no-scrollbar::-webkit-scrollbar { display:none; }
      .no-scrollbar { scrollbar-width:none; }
      .qf-shimmer { position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);animation:qf-shimmer 2.5s infinite; }

      /* ── Desktop sidebar & card polish ── */
      .qf-sidebar-card {
        background: #fff;
        border-radius: 18px;
        border: 1px solid #F0F0F4;
        box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.03);
      }
      .qf-step-row { transition: background .15s, box-shadow .15s; }
      .qf-step-row:hover { background: #F8F8FF; }
      .qf-desk-content {
        background: #fff;
        border-radius: 24px;
        border: 1px solid #EBEBEF;
        box-shadow: 0 1px 4px rgba(0,0,0,.04), 0 8px 32px rgba(0,0,0,.04);
      }
      .qf-continue-btn {
        background: linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%);
        border-radius: 14px;
        color: #fff;
        font-weight: 700;
        font-size: 15px;
        padding: 14px 24px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        position: relative;
        overflow: hidden;
        border: none;
        cursor: pointer;
        transition: all .18s ease;
        box-shadow: 0 4px 16px rgba(79,70,229,.35);
      }
      .qf-continue-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 28px rgba(79,70,229,.45);
      }
      .qf-continue-btn:active { transform: translateY(0); }
      .qf-continue-btn:disabled {
        background: #F0F0F4;
        color: #C4C4C4;
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
      }
    `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);
    return null;
};

/* ── TestAttempt inline styles string (injected via <style> tag) ── */
export const TEST_ATTEMPT_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; }

    @keyframes fadeSlideRight { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
    @keyframes fadeSlideLeft  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
    @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes growBar  { from{width:0} to{width:var(--w)} }
    @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.2} }
    @keyframes popIn    { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }

    .q-enter-r { animation: fadeSlideRight 0.25s ease both; }
    .q-enter-l { animation: fadeSlideLeft  0.25s ease both; }
    .opt-row   { animation: fadeUp 0.2s ease both; }

    .opt-btn {
        width:100%; display:flex; align-items:center; gap:12px;
        padding:10px 14px; border-radius:8px; cursor:pointer; text-align:left;
        border:1.5px solid #e5e7eb; background:#fff;
        transition:border-color 0.15s, background 0.15s, box-shadow 0.15s;
        font-family:'Plus Jakarta Sans',sans-serif;
    }
    .opt-btn:hover { border-color:#6366f1; background:#f5f3ff; }
    .opt-btn.sel   { border-color:#6366f1; background:#eef2ff; box-shadow:0 0 0 3px #6366f115; }

    .qmap-btn {
        width:100%; aspect-ratio:1; border-radius:6px; border:1.5px solid #e5e7eb;
        background:#f9fafb; color:#6b7280; font-size:11px; font-weight:700;
        cursor:pointer; transition:all 0.12s; font-family:'Plus Jakarta Sans',sans-serif;
        display:flex; align-items:center; justify-content:center;
    }
    .qmap-btn:hover { border-color:#6366f1; color:#6366f1; }
    .qmap-btn.done  { background:#6366f1; border-color:#6366f1; color:#fff; }
    .qmap-btn.flagged { background:#fef3c7; border-color:#f59e0b; color:#92400e; }
    .qmap-btn.current { outline:2px solid #6366f1; outline-offset:2px; }

    .nav-prev, .nav-next {
        display:flex; align-items:center; justify-content:center; gap:6px;
        height:36px; border-radius:7px; font-size:13px; font-weight:600;
        cursor:pointer; transition:all 0.15s; font-family:'Plus Jakarta Sans',sans-serif;
        border:1.5px solid #e5e7eb; background:#fff; color:#374151;
    }
    .nav-prev:hover { background:#f3f4f6; }
    .nav-prev:disabled { opacity:0.35; cursor:not-allowed; }
    .nav-next { background:#6366f1; border-color:#6366f1; color:#fff; padding:0 18px; }
    .nav-next:hover { background:#4f46e5; }
    .nav-next.submit { background:#059669; border-color:#059669; }
    .nav-next.submit:hover { background:#047857; }

    .main-scroll::-webkit-scrollbar { width:4px; }
    .main-scroll::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:4px; }
    .side-scroll::-webkit-scrollbar { width:3px; }
    .side-scroll::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:3px; }

    .timer-crit { animation: blink 0.8s step-end infinite; }
    .pop-in { animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
    .fade-up { animation: fadeUp 0.35s ease both; }
    .result-bar { animation: growBar 1s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }

    .review-opt {
        padding:8px 12px; border-radius:6px; font-size:12px; font-weight:500;
        display:flex; align-items:center; gap:8px; border:1.5px solid #e5e7eb; color:#9ca3af;
    }
    .review-opt.correct { background:#f0fdf4; border-color:#86efac; color:#166534; }
    .review-opt.wrong   { background:#fef2f2; border-color:#fca5a5; color:#991b1b; }

    @media(max-width:767px){
        .desktop-only { display:none !important; }
    }
    @media(min-width:768px){
        .mobile-only { display:none !important; }
    }
    @media (max-width: 900px) {
        .main-layout { flex-direction: column !important; overflow-y: auto !important; }
        aside { width: 100% !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; }
        main { padding: 20px !important; }
    }
`;
