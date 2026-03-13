/* ══════════════════════════════════════════════
   QUIZ ATOMS — small shared primitives
   DiffBadge, Checkbox, useQuizNav hook
══════════════════════════════════════════════ */

import { useEffect } from 'react';

/* ── Difficulty badge colours ── */
const DIFF_CFG = {
    Easy:   { bg: '#ECFDF5', text: '#059669', dot: '#10B981' },
    Medium: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
    Hard:   { bg: '#FFF1F2', text: '#E11D48', dot: '#F43F5E' },
};

export const DiffBadge = ({ diff }) => {
    const c = DIFF_CFG[diff] || DIFF_CFG.Easy;
    return (
        <span style={{ background: c.bg, color: c.text }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0">
            <span style={{ background: c.dot }} className="w-1.5 h-1.5 rounded-full" />{diff}
        </span>
    );
};

/* ── Checkbox ── */
export const Checkbox = ({ checked, onChange }) => (
    <button type="button" onClick={e => { e.stopPropagation(); onChange?.(); }}
        style={{ borderColor: checked ? '#4F46E5' : '#D1D5DB', background: checked ? '#4F46E5' : '#fff' }}
        className="w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-all">
        {checked && (
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 10">
                <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )}
    </button>
);

/* ── Sidebar navigation hook (used by each step to expose nav state globally) ── */
export function useQuizNav(step, canAdvance, onAdvance) {
    useEffect(() => {
        window.__quizNav = { step, canAdvance, onAdvance };
        return () => { window.__quizNav = null; };
    }, [step, canAdvance, onAdvance]);
}
