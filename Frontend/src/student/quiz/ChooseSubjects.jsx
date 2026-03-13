/* ══════════════════════════════════════════════
   SCREEN 1 — Choose Subjects  (MOBILE UNTOUCHED)
   Extracted from StudentQuizFlow — zero UI changes.
══════════════════════════════════════════════ */

import { useState } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import { SUBJECTS } from './quizData';
import { useQuizNav } from './QuizAtoms';

const ACCENT_SHADOW = {
    physics:   '0 6px 18px -4px rgba(79,70,229,.38)',
    chemistry: '0 6px 18px -4px rgba(234,88,12,.32)',
    biology:   '0 6px 18px -4px rgba(22,163,74,.32)',
    maths:     '0 6px 18px -4px rgba(147,51,234,.38)',
};

const ChooseSubjects = ({ onConfirm }) => {
    const [picked, setPicked] = useState([]);

    const toggle = id => {
        setPicked(p => {
            if (p.includes(id)) return p.filter(x => x !== id);
            if (id === 'maths')   return [...p.filter(x => x !== 'biology'), 'maths'];
            if (id === 'biology') return [...p.filter(x => x !== 'maths'),   'biology'];
            return [...p, id];
        });
    };

    useQuizNav('subject', picked.length > 0, () => onConfirm(picked));

    const visible = SUBJECTS.filter(s => {
        if (picked.includes('maths')   && s.id === 'biology') return false;
        if (picked.includes('biology') && s.id === 'maths')   return false;
        return true;
    });

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

{/* /* ── Desktop Grid ── */ }
<div className="hidden md:grid" style={{
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 8,
    alignContent: 'start',
}}>
    {SUBJECTS.map((subj, i) => {
        const isSel = picked.includes(subj.id);
        
        // Logic to determine if this specific card should be hidden/excluded
        const isExcluded = (picked.includes('maths') && subj.id === 'biology') || 
                           (picked.includes('biology') && subj.id === 'maths');

        // If excluded, show the placeholder in this exact grid slot
        if (isExcluded) {
            return (
                <div key={`excluded-${subj.id}`} style={{
                    borderRadius: 16, border: '2px dashed #F3F4F6',
                    background: '#FAFAFA', minHeight: 130,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    opacity: 0.5,
                }}>
                    <X size={14} color="#D1D5DB" style={{ marginBottom: 6 }} />
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.4 }}>
                        {subj.name}<br />Excluded
                    </p>
                </div>
            );
        }

        // Otherwise, render the normal subject button
        return (
            <button key={subj.id} onClick={() => toggle(subj.id)}
                style={{
                    background: isSel ? subj.accent : subj.bg,
                    boxShadow: isSel ? ACCENT_SHADOW[subj.id] : '0 1px 4px rgba(0,0,0,.05)',
                    border: isSel ? 'none' : `1.5px solid ${subj.border}`,
                    borderRadius: 16,
                    padding: '16px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 130,
                    cursor: 'pointer',
                    transition: 'all .2s cubic-bezier(.22,1,.36,1)',
                    transform: isSel ? 'translateY(-2px)' : 'translateY(0)',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none',
                    animationDelay: `${i * 50}ms`,
                }}
                className="qf-slide-up">

                {isSel && (
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
                        background: isSel ? 'rgba(255,255,255,.22)' : subj.border,
                    }}>
                        {subj.emoji}
                    </div>
                    <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isSel ? 'rgba(255,255,255,.3)' : 'transparent',
                        border: isSel ? 'none' : `2px dashed ${subj.accent}50`,
                        transition: 'all .2s',
                    }}>
                        <Check size={11} color={isSel ? '#fff' : subj.accent} strokeWidth={3} style={{ opacity: isSel ? 1 : 0.4 }} />
                    </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <h5 style={{
                        fontSize: 15, fontWeight: 700, lineHeight: 1.25,
                        marginBottom: 6,
                        color: isSel ? '#fff' : '#111827',
                        transition: 'color .15s',
                    }}>{subj.name}</h5>
                    <span style={{
                        fontSize: 9, fontWeight: 800,
                        padding: '3px 8px', borderRadius: 99,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        background: isSel ? 'rgba(255,255,255,.2)' : '#F3F4F6',
                        color: isSel ? 'rgba(255,255,255,.9)' : '#6B7280',
                    }}>
                        {subj.chapters} chapters
                    </span>
                </div>
            </button>
        );
    })}
</div>

            {/* ── Mobile Grid (original untouched) ── */}
{/* ── Mobile Grid (Updated for Static Slots) ── */}
<div className="md:hidden grid grid-cols-2 gap-3 flex-1 overflow-y-auto no-scrollbar pb-24 -mt-4 pt-4" style={{ alignContent: 'start' }}>
    {SUBJECTS.map((subj, i) => {
        const sel = picked.includes(subj.id);
        
        // Check if this specific card slot should show the "Excluded" state
        const isExcluded = (picked.includes('maths') && subj.id === 'biology') || 
                           (picked.includes('biology') && subj.id === 'maths');

        if (isExcluded) {
            return (
                <div key={`excl-mob-${subj.id}`} 
                     className="rounded-[24px] border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center p-4 opacity-50 min-h-[145px]">
                    <X size={16} className="text-gray-300 mb-2" />
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter text-center leading-tight">
                        {subj.name}<br />Excluded
                    </p>
                </div>
            );
        }

        return (
            <button key={subj.id} onClick={() => toggle(subj.id)}
                style={{ 
                    animationDelay: `${i * 50}ms`, 
                    background: sel ? subj.accent : subj.bg, 
                    boxShadow: sel ? ACCENT_SHADOW[subj.id] : '0 2px 8px rgba(0,0,0,.04)' 
                }}
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
</div>

            {/* ── Desktop CTA ── */}
            {picked.length > 0 && (
                <div className="hidden md:block" style={{ paddingTop: 14, borderTop: '1px solid #F3F4F6', marginTop: 8, flexShrink: 0 }}>
                    <button className="qf-continue-btn" onClick={() => onConfirm(picked)}>
                        <span className="qf-shimmer" />
                        Continue with {picked.length} subject{picked.length > 1 ? 's' : ''}
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )}

        </div>
    );
};

export default ChooseSubjects;
