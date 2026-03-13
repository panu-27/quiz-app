/* ══════════════════════════════════════════════
   SCREEN 3 — Test Overview  (MOBILE UNTOUCHED)
   Extracted from StudentQuizFlow — zero UI changes.
══════════════════════════════════════════════ */

import React, { useState } from 'react';
import { Play, FileText, Timer, BookMarked, Hash, BookOpen, Info, Flag } from 'lucide-react';
import { SUBJECTS, QUESTIONS } from './quizData';
import { useQuizNav } from './QuizAtoms';
import { fetchQuizQuestions } from './quizApi';

const TestOverview = ({ subjectIds, chapterIds, selectedTopics, onStart, onBack }) => {
    const [loading, setLoading] = useState(false);

    const subjObjs = subjectIds.map(id => SUBJECTS.find(s => s.id === id)).filter(Boolean);
    const totalQs  = subjectIds.reduce((a, sid) => a + Math.min((QUESTIONS[sid] || []).length, 6), 0);
    const mins     = Math.max(15, totalQs * 2);

    const handleBeginTest = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const questions = await fetchQuizQuestions({
                subjectIds,
                chapterIds,
                topicKeys: selectedTopics,  // already "chapId::topicName" keys
            });
            onStart(questions);             // pass fetched questions up to StudentQuizFlow
        } catch (err) {
            console.error('[TestOverview] Failed to fetch questions:', err);
            setLoading(false);
        }
    };

    useQuizNav('overview', !loading, handleBeginTest);

    const stats = [
        { icon: <FileText size={14} />,   label: 'Questions', value: totalQs,          color: '#4F46E5', bg: '#EEF2FF', iconBg: '#C7D2FE' },
        { icon: <Timer size={14} />,      label: 'Duration',  value: `${mins} min`,    color: '#B45309', bg: '#FFFBEB', iconBg: '#FDE68A' },
        { icon: <BookMarked size={14} />, label: 'Chapters',  value: chapterIds.length, color: '#047857', bg: '#ECFDF5', iconBg: '#A7F3D0' },
        { icon: <Hash size={14} />,       label: 'Topics',    value: selectedTopics.length, color: '#6D28D9', bg: '#F5F3FF', iconBg: '#DDD6FE' },
    ];

    const rules = [
        { icon: <BookOpen size={13} />, text: 'Navigate freely between questions at any time.' },
        { icon: <Info size={13} />,     text: 'Answers are only revealed after you submit.' },
        { icon: <Flag size={13} />,     text: 'Flag questions to revisit before submitting.' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className='h-[96vh]'>

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
            <div style={{ flex: 1, overflowY: 'auto'}} className="h-[75vh] no-scrollbar">
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

            {/* ── Desktop CTA ── */}
            <div className="hidden md:block" style={{ paddingTop: 14, borderTop: '1px solid #F3F4F6', flexShrink: 0, marginTop: 8 }}>
                <button className="qf-continue-btn" onClick={handleBeginTest} disabled={loading}>
                    <span className="qf-shimmer" />
                    <Play size={14} strokeWidth={2.5} style={{ fill: 'white' }} />
                    {loading ? 'Preparing test…' : 'Begin Test'}
                </button>
            </div>


        </div>
    );
};

export default TestOverview;