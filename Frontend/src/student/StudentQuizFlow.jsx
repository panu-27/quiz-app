/**
 * StudentQuizFlow.jsx — v6
 *
 * CHANGES from v5:
 *  - Desktop: full production-grade redesign (sidebar, cards, typography, CTAs)
 *  - Mobile TestAttempt: complete fix — proper dvh layout, no overflow issues,
 *    result screen scrolls correctly, nav footer fixed properly
 *  - Bug fixes:
 *      • Duplicate c3 chapter IDs removed from CHAPTERS.chemistry
 *      • TestAttempt no longer expects QUESTIONS/SUBJECTS/CHAPTERS as props (uses module scope)
 *      • Back button on 'subject' step no longer causes crash (guarded)
 *      • Wrong answer count in result fixed (answeredCount - correct, not double-counting skipped)
 *  - Mobile screens 1, 2, 3: NOT touched
 */



import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    BookOpen, ChevronRight, ChevronDown, ChevronUp, ChevronLeft,
    ArrowLeft, Search, Check, X, Menu, Flag,
    Play, RotateCcw, Clock, Zap, AlertTriangle,
    CheckCircle2, Layers, BarChart2, FileText, Timer, BookMarked, Hash, Info, Target, Home, BarChart3, AlertCircle
} from 'lucide-react';
import StudentHeader from './StudentHeader';

/* ══════════════════════════════════════════════
   FONTS + STYLES
══════════════════════════════════════════════ */
const FontLoader = () => {
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);
    return null;
};

const StyleInjector = () => {
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

/* ══════════════════════════════════════════════
   DATA  — duplicate c3 entries removed
══════════════════════════════════════════════ */
const SUBJECTS = [
    { id: 'physics', name: 'Physics', emoji: '⚛️', chapters: 12, bg: '#EEF2FF', border: '#C7D2FE', accent: '#4F46E5', light: '#EEF2FF' },
    { id: 'chemistry', name: 'Chemistry', emoji: '🧪', chapters: 10, bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C', light: '#FFF7ED' },
    { id: 'biology', name: 'Biology', emoji: '🔬', chapters: 14, bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A', light: '#F0FDF4' },
    { id: 'maths', name: 'Mathematics', emoji: '📐', chapters: 16, bg: '#FDF4FF', border: '#E9D5FF', accent: '#9333EA', light: '#FDF4FF' },
];

const CHAPTERS = {
    chemistry: [
        { id: 'c1', name: 'Basic Concepts of Chemistry', topics: 4, diff: 'Easy', emoji: '🔬', topicList: ['Mole Concept', 'Stoichiometry', 'Empirical & Molecular Formula', 'Atomic Weights'] },
        { id: 'c2', name: 'Structure of Atom', topics: 5, diff: 'Hard', emoji: '⚗️', topicList: ['Bohr Model', 'Quantum Numbers', 'Orbitals', 'Electron Config', 'Periodic Properties'] },
        { id: 'c3', name: 'Classification of Elements', topics: 6, diff: 'Medium', emoji: '🧬', topicList: ['Periodic Table', 'Periodic Trends', 'Valency', 'Oxidation State', 'Noble Gases', 'Isotopes'] },
        { id: 'c4', name: 'Chemical Bonding', topics: 7, diff: 'Hard', emoji: '🔗', topicList: ['Ionic Bond', 'Covalent Bond', 'Metallic Bond', 'VSEPR', 'Hybridisation', 'Polarity', 'Resonance'] },
        { id: 'c5', name: 'States of Matter', topics: 4, diff: 'Easy', emoji: '💧', topicList: ['Solid State', 'Liquid State', 'Gaseous State', 'Plasma'] },
        { id: 'c6', name: 'Thermodynamics', topics: 5, diff: 'Medium', emoji: '⚡', topicList: ['First Law', 'Enthalpy', 'Entropy', 'Gibbs Energy', 'Hess Law'] },
    ],
    physics: [
        { id: 'p1', name: 'Laws of Motion', topics: 4, diff: 'Easy', emoji: '🏃', topicList: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Friction"] },
        { id: 'p2', name: 'Work, Energy & Power', topics: 5, diff: 'Medium', emoji: '⚡', topicList: ['Work Done', 'Kinetic Energy', 'Potential Energy', 'Power', 'Conservation'] },
        { id: 'p3', name: 'Gravitation', topics: 4, diff: 'Medium', emoji: '🌍', topicList: ["Newton's Law of Gravitation", 'Escape Velocity', 'Orbital Motion', 'Satellites'] },
        { id: 'p4', name: 'Thermodynamics', topics: 5, diff: 'Hard', emoji: '🔥', topicList: ['Zeroth Law', 'First Law', 'Second Law', 'Entropy', 'Carnot Engine'] },
        { id: 'p5', name: 'Electrostatics', topics: 6, diff: 'Hard', emoji: '⚡', topicList: ["Coulomb's Law", 'Electric Field', 'Potential', 'Capacitance', 'Gauss Law', 'Dielectrics'] },
    ],
    biology: [
        { id: 'b1', name: 'Cell Biology', topics: 5, diff: 'Easy', emoji: '🔬', topicList: ['Cell Structure', 'Cell Membrane', 'Nucleus', 'Organelles', 'Cell Division'] },
        { id: 'b2', name: 'Genetics', topics: 4, diff: 'Hard', emoji: '🧬', topicList: ["Mendel's Laws", 'DNA Replication', 'Transcription', 'Translation'] },
        { id: 'b3', name: 'Human Physiology', topics: 6, diff: 'Medium', emoji: '🫀', topicList: ['Digestive System', 'Circulatory System', 'Respiratory System', 'Nervous System', 'Endocrine', 'Excretory'] },
    ],
    maths: [
        { id: 'm1', name: 'Calculus', topics: 5, diff: 'Hard', emoji: '∫', topicList: ['Limits', 'Continuity', 'Differentiation', 'Integration', 'Differential Equations'] },
        { id: 'm2', name: 'Algebra', topics: 4, diff: 'Medium', emoji: '🔢', topicList: ['Polynomials', 'Quadratic Equations', 'Sequences', 'Binomial Theorem'] },
        { id: 'm3', name: 'Trigonometry', topics: 4, diff: 'Easy', emoji: '📐', topicList: ['Ratios', 'Identities', 'Inverse Functions', 'Applications'] },
    ],
};

const QUESTIONS = {
    chemistry: [
        { id: 1, subj: 'chemistry', q: 'What is the molar mass of water (H₂O)?', opts: ['16 g/mol', '18 g/mol', '20 g/mol', '22 g/mol'], ans: 1 },
        { id: 2, subj: 'chemistry', q: 'Which element has atomic number 6?', opts: ['Nitrogen', 'Oxygen', 'Carbon', 'Boron'], ans: 2 },
        { id: 3, subj: 'chemistry', q: 'pH of a neutral solution at 25 °C?', opts: ['0', '7', '14', '1'], ans: 1 },
        { id: 4, subj: 'chemistry', q: 'Number of moles in 44 g of CO₂?', opts: ['1 mol', '2 mol', '0.5 mol', '3 mol'], ans: 0 },
        { id: 5, subj: 'chemistry', q: 'Which bond forms between Na and Cl?', opts: ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'], ans: 1 },
        { id: 6, subj: 'chemistry', q: "Avogadro's number is approximately?", opts: ['6.02×10²³', '3.01×10²³', '1.2×10²³', '9.1×10²³'], ans: 0 },
    ],
    physics: [
        { id: 1, subj: 'physics', q: "F = ma is Newton's which law?", opts: ['First', 'Second', 'Third', 'Zeroth'], ans: 1 },
        { id: 2, subj: 'physics', q: 'Speed of light in vacuum?', opts: ['3×10⁸ m/s', '3×10⁶ m/s', '1.5×10⁸ m/s', '9×10⁸ m/s'], ans: 0 },
        { id: 3, subj: 'physics', q: 'SI unit of force?', opts: ['Joule', 'Pascal', 'Newton', 'Watt'], ans: 2 },
        { id: 4, subj: 'physics', q: 'A car travels 200 miles in 4 hours. Average speed?', opts: ['40 Mph', '50 Mph', '60 Mph', '70 Mph'], ans: 1 },
        { id: 5, subj: 'physics', q: 'Work done = ?', opts: ['Force × time', 'Force × distance', 'Mass × velocity', 'Force ÷ distance'], ans: 1 },
        { id: 6, subj: 'physics', q: 'SI unit of energy?', opts: ['Watt', 'Newton', 'Joule', 'Pascal'], ans: 2 },
    ],
    biology: [
        { id: 1, subj: 'biology', q: 'Powerhouse of the cell?', opts: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], ans: 2 },
        { id: 2, subj: 'biology', q: 'DNA stands for?', opts: ['Deoxyribonucleic Acid', 'Diribonucleic Acid', 'Deoxyribose Acid', 'None'], ans: 0 },
        { id: 3, subj: 'biology', q: 'Which organ produces insulin?', opts: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], ans: 2 },
        { id: 4, subj: 'biology', q: 'How many chromosomes do humans have?', opts: ['23', '44', '46', '48'], ans: 2 },
    ],
    maths: [
        { id: 1, subj: 'maths', q: '5 men dig 5 holes in 5 hrs. 100 men dig 100 holes?', opts: ['1 Hour', '2 Hour', '5 Hour', '10 Hour'], ans: 2 },
        { id: 2, subj: 'maths', q: 'Derivative of x²?', opts: ['x', '2x', 'x/2', '2x²'], ans: 1 },
        { id: 3, subj: 'maths', q: 'Value of sin(90°)?', opts: ['0', '0.5', '1', '√2'], ans: 2 },
        { id: 4, subj: 'maths', q: 'What is 15% of 200?', opts: ['20', '25', '30', '35'], ans: 2 },
        { id: 5, subj: 'maths', q: '∫2x dx = ?', opts: ['x² + C', '2x² + C', 'x + C', '2x + C'], ans: 0 },
    ],
};

/* ══════════════════════════════════════════════
   ATOMS
══════════════════════════════════════════════ */
const DIFF_CFG = {
    Easy: { bg: '#ECFDF5', text: '#059669', dot: '#10B981' },
    Medium: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
    Hard: { bg: '#FFF1F2', text: '#E11D48', dot: '#F43F5E' },
};
const DiffBadge = ({ diff }) => {
    const c = DIFF_CFG[diff] || DIFF_CFG.Easy;
    return (
        <span style={{ background: c.bg, color: c.text }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0">
            <span style={{ background: c.dot }} className="w-1.5 h-1.5 rounded-full" />{diff}
        </span>
    );
};
const Checkbox = ({ checked, onChange }) => (
    <button type="button" onClick={e => { e.stopPropagation(); onChange?.(); }}
        style={{ borderColor: checked ? '#4F46E5' : '#D1D5DB', background: checked ? '#4F46E5' : '#fff' }}
        className="w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all">
        {checked && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 10">
            <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>}
    </button>
);

/* ══════════════════════════════════════════════
   DESKTOP SIDEBAR — production-grade redesign
══════════════════════════════════════════════ */
const STEPS = [
    { key: 'subject', label: 'Choose Subjects', sub: 'Pick what to study', icon: <BookOpen size={13} strokeWidth={2.5} /> },
    { key: 'chapters', label: 'Select Chapters', sub: 'Fine-tune your scope', icon: <Layers size={13} strokeWidth={2.5} /> },
    { key: 'overview', label: 'Test Overview', sub: 'Review before you go', icon: <BarChart2 size={13} strokeWidth={2.5} /> },
    { key: 'test', label: 'Attempt Test', sub: 'Focus & perform', icon: <Play size={13} strokeWidth={2.5} /> },
];
/* ══════════════════════════════════════════════
   HOOK
══════════════════════════════════════════════ */
function useQuizNav(step, canAdvance, onAdvance) {
    useEffect(() => {
        window.__quizNav = { step, canAdvance, onAdvance };
        return () => { window.__quizNav = null; };
    }, [step, canAdvance, onAdvance]);
}


const QuizSidebar = ({ step, subjects, chapCount }) => {
    const curIdx = STEPS.findIndex(s => s.key === step);
    const subjObjs = subjects.map(id => SUBJECTS.find(s => s.id === id)).filter(Boolean);

    return (
        <aside style={{
            width: 224,          // ← was 210, now matches library's w-56
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxHeight: '100%',
            overflow: 'hidden auto',
            paddingBottom: 8,
            scrollbarWidth: 'none',
        }}>
            {/* Brand card */}
            <div style={{
                background: 'linear-gradient(145deg, #4338CA 0%, #6D28D9 100%)',
                borderRadius: 16,
                padding: '16px 18px',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
            }}>
                <div style={{ position: 'absolute', right: -12, top: -12, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: 10,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 10,
                    }}>
                        <Zap size={14} color="#fff" />
                    </div>
                    <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 14, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                        Nexus<br />Practice
                    </p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
                        Test Engine
                    </p>
                </div>
            </div>

            {/* Steps card */}
            <div style={{
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #F0F0F4',
                boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                padding: '6px',
                flexShrink: 0,
            }}>
                {STEPS.map((s, i) => {
                    const done = i < curIdx;
                    const active = s.key === step;
                    return (
                        <div key={s.key} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 10px',
                            borderRadius: 10,
                            marginBottom: 2,
                            background: active ? '#EEF2FF' : 'transparent',
                            transition: 'background .15s',
                        }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: done ? '#10B981' : active ? '#4F46E5' : '#F3F4F6',
                                color: done || active ? '#fff' : '#C4C4C4',
                                boxShadow: active ? '0 2px 8px rgba(79,70,229,.35)' : done ? '0 1px 6px rgba(16,185,129,.3)' : 'none',
                                transition: 'all .2s',
                                fontSize: 10, fontWeight: 800,
                            }}>
                                {done
                                    ? <Check size={11} strokeWidth={3} />
                                    : active
                                        ? React.cloneElement(s.icon, { size: 11 })
                                        : <span>{i + 1}</span>
                                }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontSize: 12, fontWeight: 700, lineHeight: 1.2,
                                    color: active ? '#4338CA' : done ? '#D1D5DB' : '#9CA3AF',
                                    transition: 'color .15s',
                                }}>{s.label}</p>
                                <p style={{
                                    fontSize: 10, marginTop: 1,
                                    color: active ? '#818CF8' : '#D1D5DB',
                                    fontWeight: 500,
                                }}>{s.sub}</p>
                            </div>
                            {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4F46E5', flexShrink: 0 }} />}
                        </div>
                    );
                })}
            </div>

            {/* Selection summary */}
            {subjObjs.length > 0 && (
                <div style={{
                    background: '#fff', borderRadius: 14,
                    border: '1px solid #F0F0F4',
                    boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    padding: '14px 14px',
                    flexShrink: 0,
                }}>
                    <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4C4CC', marginBottom: 10 }}>
                        Your selection
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: chapCount > 0 ? 10 : 0 }}>
                        {subjObjs.map(s => (
                            <span key={s.id} style={{
                                background: s.bg, color: s.accent,
                                border: `1.5px solid ${s.border}`,
                                fontSize: 11, fontWeight: 700,
                                padding: '3px 10px', borderRadius: 99,
                                display: 'flex', alignItems: 'center', gap: 5,
                            }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent, display: 'inline-block' }} />
                                {s.name}
                            </span>
                        ))}
                    </div>
                    {chapCount > 0 && (
                        <div style={{ borderTop: '1px solid #F4F4F6', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Layers size={10} color="#4F46E5" />
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5' }}>{chapCount} chapters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tip */}
            <div style={{
                background: '#FFFBEB', border: '1px solid #FEF3C7',
                borderRadius: 12, padding: '10px 12px', flexShrink: 0,
            }}>
                <p style={{ fontSize: 11, color: '#92400E', fontWeight: 600, lineHeight: 1.5 }}>
                    💡 Only selected chapters & topics will appear in your test.
                </p>
            </div>
        </aside>
    );
};


/* ══════════════════════════════════════════════
   SCREEN 1 — Choose Subjects  (MOBILE UNTOUCHED)
══════════════════════════════════════════════ */
const ChooseSubjects = ({ onConfirm }) => {
    const [picked, setPicked] = useState([]);

    const toggle = id => {
        setPicked(p => {
            if (p.includes(id)) return p.filter(x => x !== id);
            if (id === 'maths') return [...p.filter(x => x !== 'biology'), 'maths'];
            if (id === 'biology') return [...p.filter(x => x !== 'maths'), 'biology'];
            return [...p, id];
        });
    };

    useQuizNav('subject', picked.length > 0, () => onConfirm(picked));

    const visible = SUBJECTS.filter(s => {
        if (picked.includes('maths') && s.id === 'biology') return false;
        if (picked.includes('biology') && s.id === 'maths') return false;
        return true;
    });

    const ACCENT_SHADOW = {
        physics: '0 6px 18px -4px rgba(79,70,229,.38)',
        chemistry: '0 6px 18px -4px rgba(234,88,12,.32)',
        biology: '0 6px 18px -4px rgba(22,163,74,.32)',
        maths: '0 6px 18px -4px rgba(147,51,234,.38)',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* ── Desktop heading ── */}
            <div className="hidden md:block" style={{ flexShrink: 0, marginBottom: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                    Step 1 of 3
                </p>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>
                    Choose your subjects
                </h2>
                <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
                    Maths &amp; Biology are mutually exclusive
                </p>
            </div>

            {/* ── Mobile heading (original untouched) ── */}
            <div className="md:hidden mb-6 pt-2">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Step 1 of 3</p>
                <h2 className="text-[26px] font-extrabold text-gray-900 tracking-tight">Choose subjects</h2>
                <p className="text-[13px] text-gray-400 mt-1">Maths &amp; Biology are mutually exclusive</p>
            </div>

            {/* ── Desktop Grid — scrolls inside card ── */}
            <div className="hidden bg-transparent md:grid" style={{
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                flex: 1,
                overflowY: 'auto',
                paddingBottom: 8,
                alignContent: 'start',
            }}>
                {visible.map((subj, i) => {
                    const sel = picked.includes(subj.id);
                    return (
                        <button key={subj.id} onClick={() => toggle(subj.id)}
                            style={{
                                background: sel ? subj.accent : subj.bg,
                                boxShadow: sel ? ACCENT_SHADOW[subj.id] : '0 1px 4px rgba(0,0,0,.05)',
                                border: sel ? 'none' : `1.5px solid ${subj.border}`,
                                borderRadius: 16,
                                padding: '16px',
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: 130,
                                cursor: 'pointer',
                                transition: 'all .2s cubic-bezier(.22,1,.36,1)',
                                transform: sel ? 'translateY(-2px)' : 'translateY(0)',
                                position: 'relative',
                                overflow: 'hidden',
                                outline: 'none',
                                animationDelay: `${i * 50}ms`,
                            }}
                            className="qf-slide-up">

                            {sel && (
                                <div style={{
                                    position: 'absolute', inset: 0, pointerEvents: 'none',
                                    background: 'radial-gradient(circle at 80% 15%, rgba(255,255,255,0.18) 0%, transparent 55%)',
                                }} />
                            )}

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22,
                                    background: sel ? 'rgba(255,255,255,.22)' : subj.border,
                                }}>
                                    {subj.emoji}
                                </div>
                                <div style={{
                                    width: 22, height: 22, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: sel ? 'rgba(255,255,255,.3)' : 'transparent',
                                    border: sel ? 'none' : `2px dashed ${subj.accent}50`,
                                    transition: 'all .2s',
                                }}>
                                    <Check size={11} color={sel ? '#fff' : subj.accent} strokeWidth={3} style={{ opacity: sel ? 1 : 0.4 }} />
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <h5 style={{
                                    fontSize: 15, fontWeight: 700, lineHeight: 1.25,
                                    marginBottom: 6,
                                    color: sel ? '#fff' : '#111827',
                                    transition: 'color .15s',
                                }}>{subj.name}</h5>
                                <span style={{
                                    fontSize: 9, fontWeight: 800,
                                    padding: '3px 8px', borderRadius: 99,
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                    background: sel ? 'rgba(255,255,255,.2)' : '#F3F4F6',
                                    color: sel ? 'rgba(255,255,255,.9)' : '#6B7280',
                                }}>
                                    {subj.chapters} chapters
                                </span>
                            </div>
                        </button>
                    );
                })}

                {visible.length % 2 !== 0 && (
                    <div style={{
                        borderRadius: 16, border: '2px dashed #F3F4F6',
                        background: '#FAFAFA', minHeight: 130,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        opacity: 0.5,
                    }}>
                        <X size={14} color="#D1D5DB" style={{ marginBottom: 6 }} />
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.4 }}>
                            Subject<br />Excluded
                        </p>
                    </div>
                )}
            </div>

            {/* ── Mobile Grid (original untouched) ── */}
            <div className="md:hidden grid grid-cols-2 gap-3 flex-1 overflow-y-auto no-scrollbar pb-24" style={{ alignContent: 'start' }}>
                {visible.map((subj, i) => {
                    const sel = picked.includes(subj.id);
                    return (
                        <button key={subj.id} onClick={() => toggle(subj.id)}
                            style={{ animationDelay: `${i * 50}ms`, background: sel ? subj.accent : subj.bg, boxShadow: sel ? ACCENT_SHADOW[subj.id] : '0 2px 8px rgba(0,0,0,.04)' }}
                            className={`qf-slide-up relative rounded-[24px] p-4 text-left flex flex-col min-h-[145px] transition-all duration-200 active:scale-95 border-none outline-none ${sel ? 'translate-y-[-2px]' : ''}`}>
                            {sel && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />}
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[24px] shadow-sm" style={{ background: sel ? 'rgba(255,255,255,.2)' : subj.border }}>{subj.emoji}</div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${sel ? 'bg-white/30 scale-110' : 'border-2 border-dashed opacity-30'}`} style={{ borderColor: sel ? 'transparent' : subj.accent }}>
                                    <Check size={12} color={sel ? '#fff' : subj.accent} strokeWidth={4} />
                                </div>
                            </div>
                            <div className="mt-auto">
                                <h5 className={`text-[17px] font-bold leading-tight mb-1.5 transition-colors ${sel ? 'text-white' : 'text-gray-900'}`}>{subj.name}</h5>
                                <span className={`inline-block text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${sel ? 'bg-white/20 text-white/90' : 'bg-gray-100 text-gray-500'}`}>{subj.chapters} chapters</span>
                            </div>
                        </button>
                    );
                })}
                {visible.length % 2 !== 0 && (
                    <div className="rounded-[24px] border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center p-4 opacity-50 min-h-[145px]">
                        <X size={16} className="text-gray-300 mb-2" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter text-center leading-tight">Subject<br />Excluded</p>
                    </div>
                )}
            </div>

            {/* ── Desktop CTA — fixed at bottom of card ── */}
            {picked.length > 0 && (
                <div className="hidden md:block" style={{ paddingTop: 14, borderTop: '1px solid #F3F4F6', marginTop: 8, flexShrink: 0 }}>
                    <button className="qf-continue-btn" onClick={() => onConfirm(picked)}>
                        <span className="qf-shimmer" />
                        Continue with {picked.length} subject{picked.length > 1 ? 's' : ''}
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )}

            {/* ── Mobile status (original) ── */}
            <div className="md:hidden z-20 pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-400 text-[11px] font-bold py-3 px-6 rounded-full w-max mx-auto shadow-sm uppercase tracking-widest">
                        Tap Below to pick subjects
                    </div>
                </div>
            </div>
        </div>
    );
};


/* ══════════════════════════════════════════════
   SCREEN 2 — Select Chapters  (MOBILE UNTOUCHED)
══════════════════════════════════════════════ */
const SelectChapters = ({ subjectIds, selChapters, selTopics, onToggleChapter, onToggleTopic, onSelectAllChapters, onContinue, onBack }) => {
    const [q, setQ] = useState('');
    const [expanded, setExpanded] = useState({});
    const [activeSubj, setActiveSubj] = useState(subjectIds[0]);

    const canAdvance = selChapters.length > 0;
    useQuizNav('chapters', canAdvance, onContinue);

    const chapters = (CHAPTERS[activeSubj] || []).filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
    const subj = SUBJECTS.find(s => s.id === activeSubj);
    const allSel = (CHAPTERS[activeSubj] || []).every(c => selChapters.includes(c.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* ── DESKTOP STATIC HEADER ── */}
            <div className="hidden md:block" style={{ flexShrink: 0 }}>
                <div style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                        Step 2 of 3
                    </p>
                    <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>
                        Select chapters
                    </h2>
                    <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
                        Expand a chapter to fine-tune topics
                    </p>
                    
                </div>

                {/* Subject tabs */}
                

                {/* Search + All toggle */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#C4C4C4', width: 13, height: 13, pointerEvents: 'none' }} />
                        <input value={q} onChange={e => setQ(e.target.value)}
                            placeholder="Search chapters…"
                            style={{
                                width: '100%', background: '#F5F6F8',
                                border: '1.5px solid transparent', outline: 'none',
                                borderRadius: 9, padding: '8px 12px 8px 30px',
                                fontSize: 12, fontWeight: 500, color: '#374151',
                                transition: 'all .15s', boxSizing: 'border-box',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#C7D2FE'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F6F8'; }}
                        />
                    </div>
                    <button onClick={() => onSelectAllChapters(activeSubj)}
                        style={{
                            background: allSel ? '#EEF2FF' : '#F3F4F6',
                            color: allSel ? '#4F46E5' : '#6B7280',
                            border: 'none', borderRadius: 9,
                            padding: '0 14px', fontSize: 12, fontWeight: 800,
                            flexShrink: 0, cursor: 'pointer', transition: 'all .15s',
                        }}>
                        {allSel ? '✓ All' : 'All'}
                    </button>
                </div>

                {/* Counter pills */}
                <div style={{ marginBottom: 10, minHeight: 24, display: 'flex', alignItems: 'center' }}>
                    {selChapters.length > 0 ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ background: '#4F46E5', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99 }}>
                                {selChapters.length} chapters
                            </span>
                            <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>
                                {selTopics.length} topics
                            </span>
                        </div>
                    ) : (
                        <p style={{ fontSize: 12, color: '#D1D5DB', fontWeight: 500 }}>No chapters selected yet</p>
                    )}
                </div>
            </div>

            {/* ── MOBILE STATIC HEADER (original untouched) ── */}
            <div style={{ flexShrink: 0 }} className="md:hidden">
                <div className="mb-4">
                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-1">Step 2 of 3</p>
                    <h2 className="qf-display text-[22px] font-bold text-gray-900 tracking-tight">Select Chapters</h2>
                </div>

                {subjectIds.length > 1 && (
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, flexShrink: 0 }} className="no-scrollbar">
                        {subjectIds.map(sid => {
                            const s = SUBJECTS.find(x => x.id === sid);
                            const cnt = (CHAPTERS[sid] || []).filter(c => selChapters.includes(c.id)).length;
                            const isAct = activeSubj === sid;
                            return (
                                <button key={sid} onClick={() => setActiveSubj(sid)}
                                    style={{
                                        background: isAct ? s.accent : '#F3F4F6', color: isAct ? '#fff' : '#6B7280',
                                        boxShadow: isAct ? `0 4px 14px -3px ${s.accent}66` : 'none',
                                        border: 'none', flexShrink: 0, padding: '8px 14px', borderRadius: 11,
                                        fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7,
                                        transition: 'all .2s cubic-bezier(.22,1,.36,1)', cursor: 'pointer',
                                    }}>
                                    {s?.name}
                                    {cnt > 0 && (
                                        <span style={{ background: isAct ? 'rgba(255,255,255,.25)' : '#E5E7EB', color: isAct ? '#fff' : '#6B7280', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100 }}>{cnt}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#C4C4C4', width: 14, height: 14, pointerEvents: 'none' }} />
                        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search chapters…"
                            style={{ width: '100%', background: '#F5F6F8', border: '1.5px solid transparent', outline: 'none', borderRadius: 11, padding: '10px 12px 10px 34px', fontSize: 13, fontWeight: 500, color: '#374151', transition: 'all .15s', boxSizing: 'border-box' }}
                            onFocus={e => { e.target.style.borderColor = '#C7D2FE'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F6F8'; }} />
                    </div>
                    <button onClick={() => onSelectAllChapters(activeSubj)}
                        style={{ background: allSel ? '#EEF2FF' : '#F3F4F6', color: allSel ? '#4F46E5' : '#6B7280', border: 'none', borderRadius: 11, padding: '0 16px', fontSize: 12, fontWeight: 800, flexShrink: 0, cursor: 'pointer', transition: 'all .15s' }}>
                        {allSel ? '✓ All' : 'All'}
                    </button>
                </div>

                <div style={{ marginBottom: 10, minHeight: 26, display: 'flex', alignItems: 'center' }}>
                    {selChapters.length > 0 ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                            <span style={{ background: '#4F46E5', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 100 }}>{selChapters.length} chapters</span>
                            <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100 }}>{selTopics.length} topics</span>
                        </div>
                    ) : (
                        <p style={{ fontSize: 12, color: '#D1D5DB', fontWeight: 500 }}>No chapters selected yet</p>
                    )}
                </div>
            </div>

            {/* ── SCROLLABLE CHAPTER LIST (shared, works for both) ── */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }} className="no-scrollbar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 80 }}>
                    {chapters.map((chap, i) => {
                        const sel = selChapters.includes(chap.id);
                        const isExp = expanded[chap.id];
                        const selT = chap.topicList.filter(t => selTopics.includes(`${chap.id}::${t}`)).length;
                        const allT = selT === chap.topicList.length;

                        return (
                            <div key={chap.id}
                                style={{
                                    animationDelay: `${i * 30}ms`,
                                    border: `1.5px solid ${sel ? '#A5B4FC' : '#F0F0F2'}`,
                                    background: sel ? '#FAFAFE' : '#fff',
                                    boxShadow: sel ? '0 2px 10px -2px rgba(79,70,229,.12)' : '0 1px 3px rgba(0,0,0,.04)',
                                    borderRadius: 13, overflow: 'hidden',
                                    transition: 'all .18s ease', flexShrink: 0,
                                }}
                                className="qf-anim">

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', cursor: 'pointer' }}
                                    onClick={() => onToggleChapter(chap.id, activeSubj)}>

                                    <Checkbox checked={sel} onChange={() => onToggleChapter(chap.id, activeSubj)} />

                                    <div style={{
                                        background: sel ? '#4F46E5' : '#F0F0F2',
                                        color: sel ? '#fff' : '#ADADAD',
                                        width: 26, height: 26, borderRadius: 7,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 800, flexShrink: 0,
                                        transition: 'all .18s',
                                    }}>
                                        {i + 1}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: 13, fontWeight: 700,
                                            color: sel ? '#312E81' : '#1F2937',
                                            lineHeight: 1.3, marginBottom: 3,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            transition: 'color .15s',
                                        }}>{chap.name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{chap.topics} topics</span>
                                            <DiffBadge diff={chap.diff} />
                                            {sel && (
                                                <span style={{
                                                    fontSize: 10, fontWeight: 800,
                                                    color: allT ? '#059669' : '#D97706',
                                                    background: allT ? '#ECFDF5' : '#FFFBEB',
                                                    padding: '1px 6px', borderRadius: 5,
                                                }}>
                                                    {allT ? '✓ ALL' : `${selT}/${chap.topicList.length}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {sel && (
                                        <button
                                            onClick={e => { e.stopPropagation(); setExpanded(p => ({ ...p, [chap.id]: !p[chap.id] })); }}
                                            style={{
                                                background: isExp ? '#EEF2FF' : '#F5F5F7',
                                                color: isExp ? '#4F46E5' : '#9CA3AF',
                                                width: 26, height: 26, borderRadius: 7,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, border: 'none', cursor: 'pointer', transition: 'all .18s',
                                            }}>
                                            {isExp ? <ChevronUp size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
                                        </button>
                                    )}
                                </div>

                                {sel && isExp && (
                                    <div style={{ background: '#F4F6FF', borderTop: '1px solid #E8EDFF', padding: '10px 13px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <p style={{ fontSize: 9, fontWeight: 800, color: '#A5B4FC', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Topics</p>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const keys = chap.topicList.map(t => `${chap.id}::${t}`);
                                                    const allIn = keys.every(k => selTopics.includes(k));
                                                    keys.forEach(k => { if (allIn ? selTopics.includes(k) : !selTopics.includes(k)) onToggleTopic(k); });
                                                }}
                                                style={{ fontSize: 11, fontWeight: 700, color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                {chap.topicList.every(t => selTopics.includes(`${chap.id}::${t}`)) ? 'Deselect all' : 'Select all'}
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                            {chap.topicList.map(topic => {
                                                const key = `${chap.id}::${topic}`;
                                                const isTSel = selTopics.includes(key);
                                                return (
                                                    <label key={key} onClick={e => e.stopPropagation()}
                                                        style={{
                                                            background: isTSel ? '#fff' : 'transparent',
                                                            border: `1.5px solid ${isTSel ? '#C7D2FE' : '#E8EAED'}`,
                                                            borderRadius: 9, padding: '8px 11px',
                                                            display: 'flex', alignItems: 'center', gap: 9,
                                                            cursor: 'pointer', transition: 'all .15s',
                                                            boxShadow: isTSel ? '0 1px 4px rgba(79,70,229,.07)' : 'none',
                                                        }}>
                                                        <Checkbox checked={isTSel} onChange={() => onToggleTopic(key)} />
                                                        <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: isTSel ? '#312E81' : '#6B7280', lineHeight: 1.35 }}>
                                                            {topic}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {chapters.length === 0 && q && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Search size={16} color="#D1D5DB" />
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>No chapters match</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Desktop CTA — pinned at bottom ── */}
            {selChapters.length > 0 && (
                <div className="hidden md:block" style={{ paddingTop: 12, borderTop: '1px solid #F3F4F6', marginTop: 4, flexShrink: 0 }}>
                    <button className="qf-continue-btn" onClick={onContinue}>
                        <span className="qf-shimmer" />
                        Review Test Overview <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
};


/* ══════════════════════════════════════════════
   SCREEN 3 — Test Overview  (MOBILE UNTOUCHED)
══════════════════════════════════════════════ */
const TestOverview = ({ subjectIds, chapterIds, selectedTopics, onStart, onBack }) => {
    const subjObjs = subjectIds.map(id => SUBJECTS.find(s => s.id === id)).filter(Boolean);
    const totalQs = subjectIds.reduce((a, sid) => a + Math.min((QUESTIONS[sid] || []).length, 6), 0);
    const mins = Math.max(15, totalQs * 2);

    useQuizNav('overview', true, onStart);

    const stats = [
        { icon: <FileText size={14} />, label: 'Questions', value: totalQs, color: '#4F46E5', bg: '#EEF2FF', iconBg: '#C7D2FE' },
        { icon: <Timer size={14} />, label: 'Duration', value: `${mins} min`, color: '#B45309', bg: '#FFFBEB', iconBg: '#FDE68A' },
        { icon: <BookMarked size={14} />, label: 'Chapters', value: chapterIds.length, color: '#047857', bg: '#ECFDF5', iconBg: '#A7F3D0' },
        { icon: <Hash size={14} />, label: 'Topics', value: selectedTopics.length, color: '#6D28D9', bg: '#F5F3FF', iconBg: '#DDD6FE' },
    ];

    const rules = [
        { icon: <BookOpen size={13} />, text: 'Navigate freely between questions at any time.' },
        { icon: <Info size={13} />, text: 'Answers are only revealed after you submit.' },
        { icon: <Flag size={13} />, text: 'Flag questions to revisit before submitting.' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* ── Desktop heading ── */}
            <div className="hidden md:block" style={{ flexShrink: 0, marginBottom: 18 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
                    Step 3 of 3
                </p>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>
                    Test Overview
                </h2>
                <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
                    Review your selection before you begin
                </p>
            </div>

            {/* ── Mobile heading (original untouched) ── */}
            <div className="mb-6 md:hidden" style={{ flexShrink: 0 }}>
                <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-1">Step 3 of 3</p>
                <h2 className="qf-display text-[24px] font-bold text-gray-900 tracking-tight">Test Overview</h2>
                <p className="text-[13px] text-gray-400 mt-1">Review your selection before you begin</p>
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="no-scrollbar">
                <div style={{ paddingBottom: 16 }}>

                    {/* Subject pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {subjObjs.map(s => (
                            <span key={s.id} style={{
                                background: s.bg, color: s.accent,
                                border: `1.5px solid ${s.border}`,
                                fontSize: 12, fontWeight: 700,
                                padding: '4px 12px', borderRadius: 99,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <span style={{ fontSize: 13 }}>{s.emoji}</span>
                                {s.name}
                            </span>
                        ))}
                    </div>

                    {/* Stats 2×2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        {stats.map(s => (
                            <div key={s.label} style={{
                                background: s.bg, borderRadius: 14,
                                padding: '14px 16px',
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <div style={{
                                    background: s.iconBg, color: s.color,
                                    width: 34, height: 34, borderRadius: 9,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <p style={{
                                        fontFamily: "'Bricolage Grotesque', sans-serif",
                                        color: s.color, fontSize: 22, fontWeight: 700,
                                        lineHeight: 1, letterSpacing: '-0.02em',
                                    }}>
                                        {s.value}
                                    </p>
                                    <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginTop: 2 }}>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Instructions card */}
                    <div style={{
                        background: '#fff', borderRadius: 14,
                        border: '1px solid #F0F0F4',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                    }}>
                        <div style={{
                            padding: '10px 16px',
                            background: '#FAFAFA',
                            borderBottom: '1px solid #F0F0F4',
                        }}>
                            <p style={{ fontSize: 10, fontWeight: 800, color: '#C4C4CC', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                                Test Instructions
                            </p>
                        </div>
                        <div>
                            {rules.map((r, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '12px 16px',
                                    borderBottom: i < rules.length - 1 ? '1px solid #F8F8FA' : 'none',
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 9,
                                        background: '#EEF2FF', color: '#4F46E5',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {React.cloneElement(r.icon, { size: 14, strokeWidth: 2.5 })}
                                    </div>
                                    <p style={{ fontSize: 12, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>
                                        {r.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Desktop CTA — always visible ── */}
            <div className="hidden md:block" style={{ paddingTop: 14, borderTop: '1px solid #F3F4F6', flexShrink: 0, marginTop: 8 }}>
                <button className="qf-continue-btn" onClick={onStart}>
                    <span className="qf-shimmer" />
                    <Play size={14} strokeWidth={2.5} style={{ fill: 'white' }} /> Begin Test
                </button>
            </div>

            {/* ── Mobile hint (original untouched) ── */}
            <div className="md:hidden shrink-0 pt-2 pb-1 text-center">
                <p className="text-[12px] text-gray-400 font-medium">All set · tap ✓ to begin</p>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════
   SCREEN 4 — Test Attempt  (MOBILE FIXED)
   Bugs fixed:
   - No longer receives QUESTIONS/SUBJECTS/CHAPTERS as props
   - Result view: wrong count = answeredCount - correct (not double-subtracted)
   - Layout uses height:100dvh + flex properly on mobile
   - Footer is sticky within the component (not fixed to viewport, which broke desktop)
   - QPanel renders inside a portal-style overlay correctly
══════════════════════════════════════════════ */


const TestAttempt = ({ subjectIds, onFinish }) => {
    const pool = useRef(
        subjectIds.flatMap(sid =>
            (QUESTIONS[sid] || []).slice(0, 6).map(q => ({ ...q, subj: sid }))
        ).map((q, i) => ({ ...q, globalIdx: i }))
    ).current;

    const [cur, setCur] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flags, setFlags] = useState({});
    const [panelOpen, setPanelOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(pool.length * 120);
    const [questionKey, setQuestionKey] = useState(0);
    const [animDir, setAnimDir] = useState(1);
    const timerRef = useRef(null);

    useEffect(() => {
        if (submitted) return;
        timerRef.current = setInterval(() => setTimeLeft(t => {
            if (t <= 1) { clearInterval(timerRef.current); setSubmitted(true); return 0; }
            return t - 1;
        }), 1000);
        return () => clearInterval(timerRef.current);
    }, [submitted]);

    const navigate = (next) => {
        setAnimDir(next > cur ? 1 : -1);
        setQuestionKey(k => k + 1);
        setCur(next);
    };

    const q = pool[cur];
    const sel = answers[cur];
    const isFlagged = flags[cur];
    const answeredCount = Object.keys(answers).length;
    const flagCount = Object.values(flags).filter(Boolean).length;
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const ss = String(timeLeft % 60).padStart(2, '0');
    const timeWarn = timeLeft < 300;
    const timeCritical = timeLeft < 60;

    const handleSubmit = () => {
        if (window.confirm("Submit your exam now?")) {
            clearInterval(timerRef.current);
            setSubmitted(true);
        }
    };

    const STYLES = `
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

        /* ── RESPONSIVE: mobile hides sidebar, desktop hides mobile-only elements ── */
        @media(max-width:767px){
            .desktop-only { display:none !important; }
        }
        @media(min-width:768px){
            .mobile-only { display:none !important; }
        }
    `;

    /* ─── RESULTS (unchanged) ─── */
    if (submitted) {
        const correct = pool.filter((item, i) => answers[i] === item.ans).length;
        const unanswered = pool.length - Object.keys(answers).length;
        const score = Math.round((correct / pool.length) * 100);
        const grade = score >= 90 ? { label: 'Outstanding', icon: '🏆', color: '#10b981' }
            : score >= 75 ? { label: 'Excellent', icon: '🎯', color: '#6366f1' }
                : score >= 60 ? { label: 'Good Work', icon: '👍', color: '#f59e0b' }
                    : { label: 'Keep Going', icon: '💪', color: '#ef4444' };

        return (
            <div style={{ position: 'fixed', inset: 0, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', background: '#f8fafc', color: '#1e293b' }}>
                {/* ── TOP NAV ── */}
                <header style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#fff', borderBottom: '1px solid #e2e8f0', zIndex: 30 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>Q</div>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Performance Report</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RotateCcw size={14} /> Retry
                        </button>
                        <button onClick={onFinish} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            Finish
                        </button>
                    </div>
                </header>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }} className="main-layout">
                    {/* ── COMPACT SIDEBAR ── */}
                    <aside style={{ width: 280, background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: 24, gap: 32, overflowY: 'auto' }}>

                        {/* Compact Score Section */}
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Overview</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ position: 'relative', width: 64, height: 64 }}>
                                    <svg width="64" height="64" viewBox="0 0 64 64">
                                        <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                        <circle cx="32" cy="32" r="28" fill="none" stroke={grade.color} strokeWidth="6" strokeDasharray="176" strokeDashoffset={176 - (176 * score / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{score}%</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 700 }}>{grade.label}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{correct} of {pool.length} correct</div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                { label: 'Correct', val: correct, color: '#10b981', bg: '#ecfdf5' },
                                { label: 'Wrong', val: pool.length - correct - unanswered, color: '#ef4444', bg: '#fef2f2' },
                                { label: 'Skipped', val: unanswered, color: '#f59e0b', bg: '#fffbeb' },
                                { label: 'Total', val: pool.length, color: '#6366f1', bg: '#eef2ff' },
                            ].map(s => (
                                <div key={s.label} style={{ padding: '12px', borderRadius: 12, background: s.bg, border: `1px solid ${s.color}20` }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: s.color, opacity: 0.8, textTransform: 'uppercase' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>


                    </aside>

                    {/* ── REVIEW CONTENT ── */}
                    <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        <div style={{ maxWidth: 800, margin: '0 auto' }}>
                            <div style={{ marginBottom: 32 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Question Review</h2>
                                <p style={{ color: '#64748b', fontSize: 14 }}>Walk through your answers and find areas to improve.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {pool.map((item, i) => {
                                    const userAns = answers[i];
                                    const isCorrect = userAns === item.ans;
                                    return (
                                        <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Q{i + 1}</span>
                                                    <span style={{ height: 4, width: 4, borderRadius: '50%', background: '#cbd5e1' }} />
                                                    <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: '#475569' }}>
                                                        {SUBJECTS.find(x => x.id === item.subj)?.name}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: isCorrect ? '#10b981' : userAns === undefined ? '#f59e0b' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {isCorrect ? 'Correct' : userAns === undefined ? 'Skipped' : 'Incorrect'}
                                                </div>
                                            </div>

                                            <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.6, marginBottom: 20 }}>{item.q}</p>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
                                                {item.opts.map((opt, oi) => {
                                                    const isRight = oi === item.ans;
                                                    const isUser = oi === userAns;
                                                    return (
                                                        <div key={oi} style={{
                                                            padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10,
                                                            border: '1px solid',
                                                            borderColor: isRight ? '#10b981' : isUser ? '#ef4444' : '#f1f5f9',
                                                            background: isRight ? '#f0fdf4' : isUser ? '#fef2f2' : '#f8fafc',
                                                            color: isRight ? '#065f46' : isUser ? '#991b1b' : '#64748b'
                                                        }}>
                                                            <div style={{
                                                                width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                                background: isRight ? '#10b981' : isUser ? '#ef4444' : '#e2e8f0',
                                                                color: '#fff'
                                                            }}>
                                                                {isRight ? <Check size={12} /> : isUser ? <X size={12} /> : null}
                                                            </div>
                                                            {opt}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>

                <style>{`
                @media (max-width: 900px) {
                    .main-layout { flex-direction: column !important; overflow-y: auto !important; }
                    aside { width: 100% !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; }
                    main { padding: 20px !important; }
                }
            `}</style>
            </div>
        );
    }
    /* ─── RIGHT SIDEBAR NAV PANEL ─── */
    const NavPanel = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>Question Navigator</span>
                <button onClick={() => setPanelOpen(false)} className="mobile-only" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 4, borderRadius: 4 }}><X size={14} /></button>
            </div>

            {/* Stats row */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, flexShrink: 0 }}>
                {[
                    { label: 'Answered', val: answeredCount, color: '#6366f1', bg: '#eef2ff' },
                    { label: 'Flagged', val: flagCount, color: '#d97706', bg: '#fffbeb' },
                    { label: 'Left', val: pool.length - answeredCount, color: '#6b7280', bg: '#f9fafb' },
                ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 6, padding: '6px 8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
                {[{ bg: '#6366f1', label: 'Answered' }, { bg: '#fef3c7', border: '#f59e0b', label: 'Flagged' }, { bg: '#f9fafb', label: 'Pending' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: l.bg, border: `1px solid ${l.border || '#e5e7eb'}` }} />
                        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{l.label}</span>
                    </div>
                ))}
            </div>

            {/* Question grid */}
            <div className="side-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {subjectIds.map(sid => {
                        const subPool = pool.filter(p => p.subj === sid);
                        const done = subPool.filter(p => answers[p.globalIdx] !== undefined).length;
                        return (
                            <div key={sid}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {SUBJECTS.find(x => x.id === sid)?.name}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{done}/{subPool.length}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>
                                    {subPool.map(item => {
                                        const isCur = cur === item.globalIdx;
                                        const isDone = answers[item.globalIdx] !== undefined;
                                        const isFlg = flags[item.globalIdx];
                                        return (
                                            <button key={item.globalIdx}
                                                className={`qmap-btn${isDone && !isFlg ? ' done' : ''}${isFlg ? ' flagged' : ''}${isCur ? ' current' : ''}`}
                                                onClick={() => { navigate(item.globalIdx); setPanelOpen(false); }}>
                                                {item.globalIdx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submit button */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', background: '#fafafa', flexShrink: 0 }}>
                <button onClick={handleSubmit} style={{
                    width: '100%', height: 36, borderRadius: 7, border: 'none',
                    background: '#059669', color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: "'Plus Jakarta Sans'",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'background 0.15s'
                }} onMouseOver={e => e.currentTarget.style.background = '#047857'}
                    onMouseOut={e => e.currentTarget.style.background = '#059669'}>
                    Submit Exam <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );

    /* ─── MAIN TEST UI ─── */
    return (
        <div style={{ position: 'fixed', inset: 0, background: '#f9fafb', fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{STYLES}</style>

            {/* ── TOP BAR ── */}
            <header style={{
                height: 52, background: '#fff', borderBottom: '1px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', flexShrink: 0, zIndex: 30
            }}>
                {/* Left: branding */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>Q</span>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', lineHeight: 1 }}>Practice Exam</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1, marginTop: 1 }}>{pool.length} questions</div>
                    </div>
                </div>

                {/* Center: progress (desktop only) */}
                <div className="desktop-only" style={{ flex: 1, maxWidth: 340, margin: '0 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 4, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: '#6366f1', width: `${(answeredCount / pool.length) * 100}%`, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', whiteSpace: 'nowrap' }}>{answeredCount}/{pool.length} answered</span>
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Timer */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
                        borderRadius: 6, border: `1px solid ${timeCritical ? '#fca5a5' : timeWarn ? '#fcd34d' : '#e5e7eb'}`,
                        background: timeCritical ? '#fef2f2' : timeWarn ? '#fffbeb' : '#f9fafb'
                    }}>
                        <Clock size={13} style={{ color: timeCritical ? '#dc2626' : timeWarn ? '#d97706' : '#9ca3af' }} />
                        <span style={{
                            fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums',
                            color: timeCritical ? '#dc2626' : timeWarn ? '#d97706' : '#374151'
                        }} className={timeCritical ? 'timer-crit' : ''}>{mm}:{ss}</span>
                    </div>

                    {/* Flag */}
                    <button onClick={() => setFlags(f => ({ ...f, [cur]: !f[cur] }))} style={{
                        height: 34, padding: '0 10px', borderRadius: 6, cursor: 'pointer',
                        border: `1px solid ${isFlagged ? '#f59e0b' : '#e5e7eb'}`,
                        background: isFlagged ? '#fef3c7' : '#fff',
                        color: isFlagged ? '#92400e' : '#9ca3af',
                        display: 'flex', alignItems: 'center', gap: 5,
                        transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans'"
                    }}>
                        <Flag size={13} fill={isFlagged ? '#f59e0b' : 'none'} strokeWidth={1.8} />
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{isFlagged ? 'Flagged' : 'Flag'}</span>
                    </button>

                    {/* Mobile hamburger */}
                    <button onClick={() => setPanelOpen(true)} className="mobile-only" style={{
                        height: 34, width: 34, borderRadius: 6, border: '1px solid #e5e7eb',
                        background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280'
                    }}><Menu size={15} /></button>
                </div>
            </header>

            {/* ── BODY: Question LEFT, Sidebar RIGHT ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* ── MAIN QUESTION AREA (left, full width on mobile) ── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    <main className="main-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 12px 6px 18px' }}>
                        {/* Subject + Q label row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: '#6366f1',
                                background: '#eef2ff', padding: '3px 10px', borderRadius: 99,
                                border: '1px solid #c7d2fe'
                            }}>Question {cur + 1} <span style={{ color: '#a5b4fc' }}>of {pool.length}</span></span>

                            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                                — {SUBJECTS.find(x => x.id === q.subj)?.name}
                            </span>

                            {isFlagged && (
                                <span style={{
                                    fontSize: 11, fontWeight: 600, color: '#92400e',
                                    background: '#fef3c7', padding: '3px 8px', borderRadius: 99,
                                    border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: 4
                                }}><Flag size={10} fill="#f59e0b" /> Flagged</span>
                            )}
                        </div>

                        {/* Question + Options */}
                        <div key={questionKey} className={animDir > 0 ? 'q-enter-r' : 'q-enter-l'} style={{ maxWidth: 680 }}>
                            <p style={{
                                fontSize: 15, fontWeight: 600, color: '#111827',
                                lineHeight: 1.65, marginBottom: 22, letterSpacing: '-0.01em'
                            }}>
                                {q.q}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {q.opts.map((opt, i) => {
                                    const isSelected = sel === i;
                                    return (
                                        <div key={i} className="opt-row" style={{ animationDelay: `${i * 0.05}s` }}>
                                            <button className={`opt-btn${isSelected ? ' sel' : ''}`}
                                                onClick={() => setAnswers(a => ({ ...a, [cur]: i }))}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isSelected ? '#6366f1' : '#f3f4f6',
                                                    color: isSelected ? '#fff' : '#6b7280',
                                                    fontSize: 11, fontWeight: 700, transition: 'all 0.15s'
                                                }}>
                                                    {isSelected ? <Check size={14} /> : String.fromCharCode(65 + i)}
                                                </div>
                                                <span style={{
                                                    flex: 1, fontSize: 13, fontWeight: isSelected ? 600 : 500,
                                                    color: isSelected ? '#4338ca' : '#374151', lineHeight: 1.5,
                                                    transition: 'color 0.15s'
                                                }}>{opt}</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>

                    {/* ── FOOTER NAV (inside left column, aligns with question) ── */}
                    <footer style={{
                        background: '#fff', borderTop: '1px solid #e5e7eb',
                        padding: '10px 32px', flexShrink: 0, zIndex: 10
                    }}>
                        <div style={{ maxWidth: 680, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button className="nav-prev" disabled={cur === 0}
                                onClick={() => navigate(cur - 1)}
                                style={{ width: 84 }}>
                                <ChevronLeft size={15} /> Back
                            </button>

                            {/* Dot indicators */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, overflow: 'hidden', padding: '0 8px' }}>
                                {pool.length <= 30 ? pool.map((_, i) => (
                                    <div key={i} onClick={() => navigate(i)} style={{
                                        width: i === cur ? 18 : 6, height: 6, borderRadius: 99, cursor: 'pointer', flexShrink: 0,
                                        background: i === cur ? '#6366f1' : answers[i] !== undefined ? '#a5b4fc' : flags[i] ? '#fcd34d' : '#e5e7eb',
                                        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'
                                    }} />
                                )) : (
                                    <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{cur + 1} / {pool.length}</span>
                                )}
                            </div>

                            {cur + 1 < pool.length ? (
                                <button className="nav-next" onClick={() => navigate(cur + 1)} style={{ minWidth: 84 }}>
                                    Next <ChevronRight size={15} />
                                </button>
                            ) : (
                                <button className="nav-next submit" onClick={handleSubmit} style={{ minWidth: 100 }}>
                                    Submit <ChevronRight size={15} />
                                </button>
                            )}
                        </div>
                    </footer>
                </div>

                {/* ── RIGHT SIDEBAR (desktop only) ── */}
                <aside className="desktop-only" style={{
                    width: 248, background: '#fff', borderLeft: '1px solid #e5e7eb',
                    display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden'
                }}>
                    <NavPanel />
                </aside>
            </div>

            {/* ── MOBILE DRAWER (unchanged) ── */}
            {panelOpen && (
                <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div onClick={() => setPanelOpen(false)} style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)'
                    }} />
                    <div style={{
                        position: 'relative', marginLeft: 'auto',
                        width: 'min(88vw,300px)', height: '100%',
                        background: '#fff', borderLeft: '1px solid #e5e7eb', overflowY: 'auto',
                        animation: 'fadeSlideRight 0.22s ease'
                    }}>
                        <NavPanel />
                    </div>
                </div>
            )}
        </div>
    );
};
/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
export { TestAttempt };

export default function StudentQuizFlow() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const urlSubj = (searchParams.get('subj') || '').toLowerCase();
    const initSubj = SUBJECTS.find(s => s.id === urlSubj || s.name.toLowerCase() === urlSubj)?.id || null;

    const [step, setStep] = useState(initSubj ? 'chapters' : 'subject');
    const [subjects, setSubjects] = useState(initSubj ? [initSubj] : []);
    const [selChapters, setSelChaps] = useState([]);
    const [selTopics, setSelTopics] = useState([]);

    useEffect(() => {
        if (!initSubj) return;
        const allC = (CHAPTERS[initSubj] || []).map(c => c.id);
        setSelChaps(allC);
        const allT = (CHAPTERS[initSubj] || []).flatMap(c => c.topicList.map(t => `${c.id}::${t}`));
        setSelTopics(allT);
    }, []);

    useEffect(() => () => { window.__quizNav = null; }, []);

    // When quiz flow reaches 'test' step, hand off to the dedicated full-screen route
    useEffect(() => {
        if (step === 'test') {
            navigate('/student/quiztest', { state: { subjectIds: subjects } });
        }
    }, [step]);

    const toggleChapter = (chapId, subjId) => {
        const chap = (CHAPTERS[subjId] || []).find(c => c.id === chapId);
        if (!chap) return;
        if (selChapters.includes(chapId)) {
            setSelChaps(p => p.filter(x => x !== chapId));
            setSelTopics(p => p.filter(k => !k.startsWith(chapId + '::')));
        } else {
            setSelChaps(p => [...p, chapId]);
            const newT = chap.topicList.map(t => `${chapId}::${t}`);
            setSelTopics(p => [...p, ...newT.filter(k => !p.includes(k))]);
        }
    };

    const selectAllChapters = subjId => {
        const all = (CHAPTERS[subjId] || []).map(c => c.id);
        const allIn = all.every(id => selChapters.includes(id));
        if (allIn) {
            setSelChaps(p => p.filter(id => !all.includes(id)));
            const keys = all.flatMap(id => (CHAPTERS[subjId] || []).find(c => c.id === id)?.topicList.map(t => `${id}::${t}`) || []);
            setSelTopics(p => p.filter(k => !keys.includes(k)));
        } else {
            const missing = all.filter(id => !selChapters.includes(id));
            setSelChaps(p => [...p, ...missing]);
            const newT = missing.flatMap(id => (CHAPTERS[subjId] || []).find(c => c.id === id)?.topicList.map(t => `${id}::${t}`) || []);
            setSelTopics(p => [...p, ...newT.filter(k => !p.includes(k))]);
        }
    };

    const toggleTopic = key => setSelTopics(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);

    const BACK = { chapters: 'subject', overview: 'chapters', test: 'overview' };
    const MOB_TITLE = { subject: 'Choose Subjects', chapters: 'Select Chapters', overview: 'Overview', test: 'Test' };
    const STEP_IDX = ['subject', 'chapters', 'overview'].indexOf(step);

    const renderStep = () => {
        switch (step) {
            case 'subject': return <ChooseSubjects onConfirm={ids => { setSubjects(ids); setSelChaps([]); setSelTopics([]); setStep('chapters'); }} />;
            case 'chapters': return <SelectChapters subjectIds={subjects} selChapters={selChapters} selTopics={selTopics} onToggleChapter={toggleChapter} onToggleTopic={toggleTopic} onSelectAllChapters={selectAllChapters} onContinue={() => setStep('overview')} onBack={() => setStep('subject')} />;
            case 'overview': return <TestOverview subjectIds={subjects} chapterIds={selChapters} selectedTopics={selTopics} onStart={() => setStep('test')} onBack={() => setStep('chapters')} />;
            case 'test': return null; // handled by /student/quiztest route
            default: return null;
        }
    };

    return (
        <div className="qf-root min-h-screen">
            <FontLoader /><StyleInjector />




            <div className="hidden md:flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
                <StudentHeader />
                <div
                    className="px-8 lg:px-12 2xl:px-20"
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        maxWidth: 1280,
                        margin: '0 auto',
                        width: '100%',
                        paddingTop: 32,
                        paddingBottom: 32,
                        gap: 28,
                        alignItems: 'flex-start',
                    }}
                >
                    {step !== 'test' && (
                        <QuizSidebar step={step} subjects={subjects} chapCount={selChapters.length} />
                    )}

                    <div 
                    className='bg-transparent'
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        borderRadius: 20,
                        overflow: 'hidden',
                    }}>
                        {step !== 'subject' && step !== 'test' && (
                            <div style={{ padding: '14px 24px 0', flexShrink: 0 }}>
                                <button onClick={() => setStep(BACK[step] || 'subject')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        color: '#9CA3AF', fontSize: 12, fontWeight: 600,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '6px 10px', borderRadius: 8,
                                        transition: 'all .15s',
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.color = '#4F46E5'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF'; }}>
                                    <ArrowLeft size={13} /> Back
                                </button>
                            </div>
                        )}
                        <div style={{ flex: 1, overflow: 'hidden', padding: step === 'test' ? 0 : '16px 24px 0' }}>
                            {renderStep()}
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ MOBILE ═══════════════════════════════════════════════ */}
            <div className="md:hidden min-h-screen flex flex-col">

                {/* Indigo header — hidden during test */}
                {step !== 'test' && (
                    <div style={{ background: '#4F46E5' }} className="pt-5 pb-16 px-5 relative overflow-hidden shrink-0">
                        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
                        <div className="absolute left-0 bottom-0 w-20 h-20 bg-white/5 rounded-full" />
                        <div className="flex items-center gap-3 relative z-10">
                            {/* BUG FIX: guard so back on 'subject' doesn't crash — hide arrow on first step */}
                            {step !== 'subject' && (
                                <button onClick={() => setStep(BACK[step] || 'subject')}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-[10px] text-white transition-colors">
                                    <ArrowLeft size={16} />
                                </button>
                            )}
                            <div>
                                <h1 className="qf-display text-white font-bold text-[18px]">{MOB_TITLE[step]}</h1>
                                <p className="text-white/50 text-[10px] font-medium uppercase tracking-widest mt-0.5">
                                    Nexus Test{STEP_IDX >= 0 ? ` · Step ${STEP_IDX + 1}/3` : ''}
                                </p>
                            </div>
                        </div>
                        {STEP_IDX >= 0 && (
                            <div className="flex items-center gap-1.5 mt-4 relative z-10">
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{ background: i <= STEP_IDX ? '#fff' : 'rgba(255,255,255,.25)' }}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === STEP_IDX ? 'w-8' : 'w-3'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* White content card */}
                <div className={`bg-white flex-1 flex flex-col overflow-hidden
                    ${step !== 'test' ? 'rounded-t-[28px] -mt-10 relative z-10' : ''}`}>
                    <div className="flex-1 overflow-hidden px-5 pt-6 pb-0 flex flex-col min-h-0">
                        {renderStep()}
                    </div>
                </div>
            </div>
        </div>
    );
}