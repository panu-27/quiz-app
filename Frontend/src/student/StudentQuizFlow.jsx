/**
 * StudentQuizFlow.jsx — v7
 *
 * ROOT ORCHESTRATOR — now thin.
 * All sub-components live in ./quiz/:
 *   quizData.js        → SUBJECTS, CHAPTERS, QUESTIONS
 *   quizStyles.js      → FontLoader, StyleInjector
 *   QuizAtoms.jsx      → DiffBadge, Checkbox, useQuizNav
 *   QuizSidebar.jsx    → desktop left panel
 *   ChooseSubjects.jsx → step 1
 *   SelectChapters.jsx → step 2
 *   TestOverview.jsx   → step 3
 *   TestAttempt.jsx    → full-screen test
 *
 * SKIP STEP 1 BEHAVIOUR:
 *   - From Dashboard quiz cards: navigate to /student/quiz?subj=physics
 *     → initSubj is set → starts at 'chapters' with all chapters pre-selected
 *   - Direct URL /student/quiz (no ?subj): starts at 'subject' (step 1) as normal
 *
 * Zero UI changes from v6.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { SUBJECTS, CHAPTERS } from './quiz/quizData';
import { FontLoader, StyleInjector } from './quiz/quizStyles';
import QuizSidebar from './quiz/QuizSidebar';
import ChooseSubjects from './quiz/ChooseSubjects';
import SelectChapters from './quiz/SelectChapters';
import TestOverview from './quiz/TestOverview';
import StudentHeader from './StudentHeader';

/* ── also re-export TestAttempt so StudentQuizTest can still import it ── */
export { default as TestAttempt } from './quiz/TestAttempt';

/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
export default function StudentQuizFlow() {
    const [searchParams] = useSearchParams();
    const navigate       = useNavigate();

    /* ?subj=physics  →  skip step 1 */
    const urlSubj  = (searchParams.get('subj') || '').toLowerCase();
    const initSubj = SUBJECTS.find(s => s.id === urlSubj || s.name.toLowerCase() === urlSubj)?.id || null;

    const [step,        setStep]      = useState(initSubj ? 'chapters' : 'subject');
    const [subjects,    setSubjects]  = useState(initSubj ? [initSubj] : []);
    const [selChapters, setSelChaps]  = useState([]);
    const [selTopics,   setSelTopics] = useState([]);
    const [questions,   setQuestions] = useState([]);   // populated by API on Begin Test

    /* Pre-select all chapters when arriving via ?subj= shortcut */
    useEffect(() => {
        if (!initSubj) return;
        const allC = (CHAPTERS[initSubj] || []).map(c => c.id);
        setSelChaps(allC);
        const allT = (CHAPTERS[initSubj] || []).flatMap(c => c.topicList.map(t => `${c.id}::${t}`));
        setSelTopics(allT);
    }, []);

    /* Clean up global nav ref on unmount */
    useEffect(() => () => { window.__quizNav = null; }, []);

    /* When flow reaches 'test', hand off to the dedicated full-screen route */
    useEffect(() => {
        if (step === 'test') {
            navigate('/student/quiztest', {
                state: {
                    subjectIds: subjects,
                    chapterIds: selChapters,
                    topicKeys:  selTopics,
                    questions,              // fetched from API in TestOverview
                },
            });
        }
    }, [step]);

    /* ── Chapter toggle ── */
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

    /* ── Select-all chapters for a subject ── */
    const selectAllChapters = subjId => {
        const all   = (CHAPTERS[subjId] || []).map(c => c.id);
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

    const BACK      = { chapters: 'subject', overview: 'chapters', test: 'overview' };
    const MOB_TITLE = { subject: 'Choose Subjects', chapters: 'Select Chapters', overview: 'Overview', test: 'Test' };
    const STEP_IDX  = ['subject', 'chapters', 'overview'].indexOf(step);

    const renderStep = () => {
        switch (step) {
            case 'subject':
                return (
                    <ChooseSubjects
                        onConfirm={ids => { setSubjects(ids); setSelChaps([]); setSelTopics([]); setStep('chapters'); }}
                    />
                );
            case 'chapters':
                return (
                    <SelectChapters
                        subjectIds={subjects}
                        selChapters={selChapters}
                        selTopics={selTopics}
                        onToggleChapter={toggleChapter}
                        onToggleTopic={toggleTopic}
                        onSelectAllChapters={selectAllChapters}
                        onContinue={() => setStep('overview')}
                        onBack={() => setStep('subject')}
                    />
                );
            case 'overview':
                return (
                    <TestOverview
                        subjectIds={subjects}
                        chapterIds={selChapters}
                        selectedTopics={selTopics}
                        onStart={qs => { setQuestions(qs); setStep('test'); }}
                        onBack={() => setStep('chapters')}
                    />
                );
            case 'test':
                return null; // handled by /student/quiztest route
            default:
                return null;
        }
    };

    return (
        <div className="qf-root min-h-screen" style={{ background: '#F8FAFC' }}>
            <FontLoader />
            <StyleInjector />

            {/* ══ DESKTOP ══════════════════════════════════════════════ */}
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

                    <div style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
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
                            {/* Hide back arrow on first step */}
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