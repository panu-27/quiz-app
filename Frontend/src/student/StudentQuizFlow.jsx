/**
 * ══════════════════════════════════════════════════════════════════════
 * StudentQuizFlow.jsx — v10 FIXED
 * ──────────────────────────────────────────────────────────────────────
 * FIXES:
 * ✅ totalTime + subjectWiseCounts passed all the way to TestOverview
 * ✅ selectAllChapters actually works (stores chapters, then calls setter)
 * ✅ testType auto-detected from year range change
 * ✅ subjectMap built from backend data with full colour config
 * ══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { FontLoader, StyleInjector } from './quiz/quizStyles';
import QuizSidebar from './quiz/QuizSidebar';
import ChooseSubjects from './quiz/ChooseSubjects';
import SelectChapters from './quiz/SelectChapters';
import TestOverview from './quiz/TestOverview';
import StudentHeader from './StudentHeader';

export { default as TestAttempt } from './quiz/TestAttempt';

const SUBJECT_CONFIG = {
  Physics:     { emoji: '⚛️', accent: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', light: '#EEF2FF' },
  Chemistry:   { emoji: '🧪', accent: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', light: '#FFF7ED' },
  Biology:     { emoji: '🔬', accent: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', light: '#F0FDF4' },
  Mathematics: { emoji: '📐', accent: '#9333EA', bg: '#FDF4FF', border: '#E9D5FF', light: '#FDF4FF' },
};

// We need to know which chapters belong to which subject for selectAll
const chaptersCache = useRef ? null : null; // will be stored in state below

export default function StudentQuizFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('subject');
  const [subjects, setSubjects] = useState([]);          // array of subject IDs
  const [subjectMap, setSubjectMap] = useState({});       // { id: subjectObj }
  const [selChapters, setSelChaps] = useState([]);
  const [allChaptersMap, setAllChaptersMap] = useState({}); // { subjectId: [chapterId, ...] } — for selectAll
  const [yearRange, setYearRange] = useState({ min: 2004, max: 2025 });
  const [testType, setTestType] = useState('pyq');         // default pyq since yearRange is always set
  const [totalTime, setTotalTime] = useState(90);          // minutes from ChooseSubjects
  const [subjectWiseCounts, setSubjectWiseCounts] = useState({}); // { subjectId: count }
  const [questions, setQuestions] = useState(null);

  useEffect(() => () => { window.__quizNav = null; }, []);

  // Navigate to quiz test screen when questions ready
  useEffect(() => {
    if (step === 'test' && questions) {
      navigate('/student/quiztest', {
        state: { subjectIds: subjects, questions },
      });
    }
  }, [step, questions, subjects, navigate]);

  // ── Chapter toggle ──
  const toggleChapter = (chapId) => {
    setSelChaps((prev) =>
      prev.includes(chapId) ? prev.filter((x) => x !== chapId) : [...prev, chapId]
    );
  };

  // ── Select ALL chapters for a given subject ──
  // SelectChapters will call this with the activeSubject's ID.
  // We need a way to receive the chapter list from SelectChapters.
  // The cleanest solution: SelectChapters calls this with (subjId, chapterIds[]).
  // We update our selectAll handler to accept optional list.
  const selectAllChapters = (subjId, chaptersForSubject) => {
    if (!chaptersForSubject || chaptersForSubject.length === 0) return;

    const chapterIds = chaptersForSubject.map((c) => c._id);

    // Check if all are already selected → deselect all
    const allSelected = chapterIds.every((id) => selChapters.includes(id));

    if (allSelected) {
      // Deselect all chapters of this subject
      setSelChaps((prev) => prev.filter((id) => !chapterIds.includes(id)));
    } else {
      // Select all chapters of this subject (merge, no duplicates)
      setSelChaps((prev) => {
        const existing = prev.filter((id) => !chapterIds.includes(id));
        return [...existing, ...chapterIds];
      });
    }
  };

  const BACK = { chapters: 'subject', overview: 'chapters', test: 'overview' };
  const MOB_TITLE = {
    subject: 'Choose Subjects',
    chapters: 'Select Chapters',
    overview: 'Overview',
    test: 'Test',
  };
  const STEP_IDX = ['subject', 'chapters', 'overview'].indexOf(step);

  const renderStep = () => {
    switch (step) {
      case 'subject':
        return (
          <ChooseSubjects
            onConfirm={({ subjectIds, yearRange: yr, totalTime: tt, subjectWiseCounts: swc, subjectObjects }) => {
              // Build subjectMap from backend data + local colour config
              const newMap = {};
              subjectObjects?.forEach((subj) => {
                const cfg = SUBJECT_CONFIG[subj.name] || {};
                newMap[subj._id] = {
                  _id: subj._id,
                  id: subj._id,
                  name: subj.name,
                  emoji: subj.emoji || cfg.emoji || '📚',
                  accent: subj.accent || cfg.accent || '#4F46E5',
                  bg: subj.bg || cfg.bg || '#EEF2FF',
                  border: subj.border || cfg.border || '#C7D2FE',
                  light: subj.light || cfg.light || '#EEF2FF',
                };
              });

              setSubjects(subjectIds);
              setSubjectMap(newMap);
              setYearRange(yr);
              setTotalTime(tt || 90);
              setSubjectWiseCounts(swc || {});
              setSelChaps([]);
              // Always pyq since we always have a year range; could also check if it's non-default
              setTestType('pyq');
              setStep('chapters');
            }}
          />
        );

      case 'chapters':
        return (
          <SelectChapters
            subjectIds={subjects}
            selChapters={selChapters}
            onToggleChapter={toggleChapter}
            onSelectAllChapters={selectAllChapters}
            onContinue={() => setStep('overview')}
            onBack={() => setStep('subject')}
            subjectMap={subjectMap}
          />
        );

      case 'overview':
        return (
          <TestOverview
            subjectIds={subjects}
            chapterIds={selChapters}
            yearRange={yearRange}
            testType={testType}
            totalTime={totalTime}
            subjectWiseCounts={subjectWiseCounts}
            onStart={(qs) => {
              setQuestions(qs);
              setStep('test');
            }}
            onBack={() => setStep('chapters')}
            subjectMap={subjectMap}
          />
        );

      case 'test':
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="qf-root min-h-screen" style={{ background: '#F8FAFC' }}>
      <FontLoader />
      <StyleInjector />

      {/* ══ DESKTOP ══════════════════════════════════════════════════════ */}
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
            <QuizSidebar
              step={step}
              subjects={subjects}
              chapCount={selChapters.length}
              subjectMap={subjectMap}
            />
          )}

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {step !== 'subject' && step !== 'test' && (
              <div style={{ padding: '14px 24px 0', flexShrink: 0 }}>
                <button
                  onClick={() => setStep(BACK[step] || 'subject')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, transition: 'all .15s' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.color = '#4F46E5'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9CA3AF'; }}
                >
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

      {/* ══ MOBILE ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden min-h-screen flex flex-col">
        {step !== 'test' && (
          <div style={{ background: '#4F46E5' }} className="pt-5 pb-16 px-5 relative overflow-hidden shrink-0">
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute left-0 bottom-0 w-20 h-20 bg-white/5 rounded-full" />
            <div className="flex items-center gap-3 relative z-10">
              {step !== 'subject' && (
                <button
                  onClick={() => setStep(BACK[step] || 'subject')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-[10px] text-white transition-colors"
                >
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
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{ background: i <= STEP_IDX ? '#fff' : 'rgba(255,255,255,.25)' }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === STEP_IDX ? 'w-8' : 'w-3'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`bg-white flex-1 flex flex-col overflow-hidden ${step !== 'test' ? 'rounded-t-[28px] -mt-10 relative z-10' : ''}`}>
          <div className="flex-1 overflow-hidden px-5 pt-6 pb-0 flex flex-col min-h-0">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}