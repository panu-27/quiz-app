/* ══════════════════════════════════════════════
   QUIZ SIDEBAR — Desktop left panel
   Shows step progress, selected subjects & tips.
   Extracted from StudentQuizFlow — zero UI changes.
══════════════════════════════════════════════ */

import { BookOpen, Layers, BarChart2, Play } from 'lucide-react';
import { SUBJECTS } from './quizData';

const STEPS = [
    { key: 'subject',  label: 'Choose Subjects', sub: 'Pick what to study',      icon: <BookOpen size={13} strokeWidth={2.5} /> },
    { key: 'chapters', label: 'Select Chapters', sub: 'Fine-tune your scope',    icon: <Layers   size={13} strokeWidth={2.5} /> },
    { key: 'overview', label: 'Test Overview',   sub: 'Review before you go',    icon: <BarChart2 size={13} strokeWidth={2.5} /> },
    { key: 'test',     label: 'Attempt Test',    sub: 'Focus & perform',         icon: <Play      size={13} strokeWidth={2.5} /> },
];

const QuizSidebar = ({ step, subjects, chapCount }) => {
    const curIdx   = STEPS.findIndex(s => s.key === step);
    const subjObjs = subjects.map(id => SUBJECTS.find(s => s.id === id)).filter(Boolean);

    return (
        <aside style={{
            width: 224,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxHeight: '100%',
            overflow: 'hidden auto',
            paddingBottom: 8,
        }} className='no-scrollbar'>

            {/* ── Brand card ── */}
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
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 4 }}>
                        Nexus Quiz
                    </div>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        Build Your Test
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
                        Step {Math.max(curIdx + 1, 1)} of {STEPS.length - 1}
                    </div>
                </div>
            </div>

            {/* ── Steps card ── */}
            <div className="qf-sidebar-card" style={{ padding: '8px 0', flexShrink: 0 }}>
                {STEPS.map((s, i) => {
                    const isActive  = s.key === step;
                    const isDone    = i < curIdx;
                    const isFuture  = i > curIdx;
                    return (
                        <div key={s.key} className="qf-step-row" style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 14px',
                            opacity: isFuture ? 0.38 : 1,
                        }}>
                            {/* bullet */}
                            <div style={{
                                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isActive ? '#4F46E5' : isDone ? '#EEF2FF' : '#F5F5F8',
                                color: isActive ? '#fff' : isDone ? '#4F46E5' : '#C4C4CC',
                                boxShadow: isActive ? '0 3px 10px -2px rgba(79,70,229,.45)' : 'none',
                                transition: 'all .2s',
                            }}>
                                {isDone
                                    ? <svg width="12" height="10" fill="none" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    : s.icon
                                }
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 600, color: isActive ? '#111827' : '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {s.label}
                                </div>
                                <div style={{ fontSize: 10, color: '#C4C4CC', fontWeight: 500, marginTop: 1 }}>
                                    {s.sub}
                                </div>
                            </div>
                            {isActive && (
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4F46E5', flexShrink: 0, marginLeft: 'auto' }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Subjects summary card (only once subjects are chosen) ── */}
            {subjObjs.length > 0 && (
                <div className="qf-sidebar-card" style={{ padding: '12px 14px', flexShrink: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#C4C4CC', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                        Your selection
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {subjObjs.map(s => (
                            <div key={s.id} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: s.bg, borderRadius: 9, padding: '6px 10px',
                                border: `1px solid ${s.border}`,
                            }}>
                                <span style={{ fontSize: 14 }}>{s.emoji}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: s.accent }}>{s.name}</span>
                            </div>
                        ))}
                        {chapCount > 0 && (
                            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginTop: 2 }}>
                                {chapCount} chapter{chapCount !== 1 ? 's' : ''} selected
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Tip card ── */}
            <div style={{
                background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A',
                padding: '10px 12px', flexShrink: 0,
            }}>
                <p style={{ fontSize: 11, color: '#92400E', fontWeight: 600, lineHeight: 1.5 }}>
                    💡 Only selected chapters &amp; topics will appear in your test.
                </p>
            </div>
        </aside>
    );
};

export default QuizSidebar;
