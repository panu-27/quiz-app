/* ══════════════════════════════════════════════
   SCREEN 2 — Select Chapters  (MOBILE UNTOUCHED)
   Extracted from StudentQuizFlow — zero UI changes.
══════════════════════════════════════════════ */

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { SUBJECTS, CHAPTERS } from './quizData';
import { DiffBadge, Checkbox, useQuizNav } from './QuizAtoms';

const SelectChapters = ({ subjectIds, selChapters, selTopics, onToggleChapter, onToggleTopic, onSelectAllChapters, onContinue, onBack }) => {
    const [q, setQ]           = useState('');
    const [expanded, setExpanded] = useState({});
    const [activeSubj, setActiveSubj] = useState(subjectIds[0]);

    const canAdvance = selChapters.length > 0;
    useQuizNav('chapters', canAdvance, onContinue);

    const chapters = (CHAPTERS[activeSubj] || []).filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
    const subj     = SUBJECTS.find(s => s.id === activeSubj);
    const allSel   = (CHAPTERS[activeSubj] || []).every(c => selChapters.includes(c.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column'}} className='h-[96vh]'>

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
                {subjectIds.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, flexShrink: 0 }}
                        className="no-scrollbar">
                        {subjectIds.map(sid => {
                            const s      = SUBJECTS.find(x => x.id === sid);
                            const cnt    = (CHAPTERS[sid] || []).filter(c => selChapters.includes(c.id)).length;
                            const isAct  = activeSubj === sid;
                            return (
                                <button key={sid} onClick={() => setActiveSubj(sid)}
                                    style={{
                                        background: isAct ? s.accent : '#F3F4F6',
                                        color: isAct ? '#fff' : '#6B7280',
                                        boxShadow: isAct ? `0 3px 10px -2px ${s.accent}55` : 'none',
                                        border: 'none', flexShrink: 0,
                                        padding: '7px 14px', borderRadius: 9,
                                        fontSize: 12, fontWeight: 700,
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        transition: 'all .18s', cursor: 'pointer',
                                    }}>
                                    {s?.name}
                                    {cnt > 0 && (
                                        <span style={{
                                            background: isAct ? 'rgba(255,255,255,.25)' : '#E5E7EB',
                                            color: isAct ? '#fff' : '#6B7280',
                                            fontSize: 10, fontWeight: 800,
                                            padding: '1px 6px', borderRadius: 99,
                                        }}>{cnt}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

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
                            const s     = SUBJECTS.find(x => x.id === sid);
                            const cnt   = (CHAPTERS[sid] || []).filter(c => selChapters.includes(c.id)).length;
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

            {/* ── SCROLLABLE CHAPTER LIST (shared desktop + mobile) ── */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden'}} className=" max-h-[75vh] no-scrollbar">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 80 }}>
                    {chapters.map((chap, i) => {
                        const sel  = selChapters.includes(chap.id);
                        const isExp = expanded[chap.id];
                        const selT  = chap.topicList.filter(t => selTopics.includes(`${chap.id}::${t}`)).length;
                        const allT  = selT === chap.topicList.length;

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
                                                const key   = `${chap.id}::${topic}`;
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

export default SelectChapters;
