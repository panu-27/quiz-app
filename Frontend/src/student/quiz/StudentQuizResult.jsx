import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight,
  ChevronLeft, RotateCcw, Home, Filter, BookOpen, BarChart3, HelpCircle, X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useBackButton from '../../hooks/useBackButton';

const STATUS_BAR_H = 28.5;

// ============= KaTeX LOADER =============
const loadKaTeX = (() => {
  let loaded = false, loading = null;
  return () => {
    if (loaded) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(resolve => {
      if (!document.querySelector('link[href*="katex"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
        document.head.appendChild(link);
      }
      if (!document.querySelector('script[src*="katex.min.js"]')) {
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js';
          script2.onload = () => { loaded = true; resolve(); };
          document.head.appendChild(script2);
        };
        document.head.appendChild(script1);
      } else { loaded = true; resolve(); }
    });
    return loading;
  };
})();

const KATEX_OPTS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false }
  ],
  throwOnError: false,
};

const KaTeXSpan = ({ html }) => {
  const spanRef = useRef(null);
  useEffect(() => {
    if (!spanRef.current || !html) return;
    spanRef.current.innerHTML = html || '';
    loadKaTeX().then(() => {
      if (!spanRef.current || !window.renderMathInElement) return;
      window.renderMathInElement(spanRef.current, KATEX_OPTS);
    });
  }, [html]);
  return <span ref={spanRef} />;
};

export default function StudentQuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isReviewMode = searchParams.get('review') === 'true';

  // Load result data from location.state or sessionStorage fallback
  const resultData = useMemo(() => {
    if (location.state?.result) {
      return location.state.result;
    }
    try {
      const saved = sessionStorage.getItem('latest_quiz_result');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    loadKaTeX();
  }, []);

  // Redirect if no result data available
  useEffect(() => {
    if (!resultData) {
      navigate('/student/quiz', { replace: true });
    }
  }, [resultData, navigate]);

  // Review mode filter & current question index
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'subjects' | 'review'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'correct' | 'wrong' | 'skipped'
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [curReviewIdx, setCurReviewIdx] = useState(0);

  // Sync tab with ?review=true param
  useEffect(() => {
    if (isReviewMode) {
      setActiveTab('review');
    } else if (activeTab === 'review') {
      setActiveTab('overview');
    }
  }, [isReviewMode]);

  const handleBack = () => {
    if (isReviewMode) {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/student/quiztest/result', { replace: true });
      }
      return true;
    }
    navigate('/student/quiz', { replace: true });
    return true;
  };

  useBackButton(handleBack);

  if (!resultData) return null;

  const {
    examTitle = 'Practice Quiz',
    totalScore = 0,
    maxScore = 0,
    accuracy = 0,
    totalCorrect = 0,
    totalWrong = 0,
    totalSkipped = 0,
    timeTakenSeconds = 0,
    blockResults = [],
    questions = [],
    answers = {}
  } = resultData;

  const mm = Math.floor(timeTakenSeconds / 60);
  const ss = timeTakenSeconds % 60;
  const timeFormatted = `${mm}m ${ss}s`;

  // Filtered review questions
  const filteredQuestions = questions.filter(q => {
    const ua = answers[q.globalIdx];
    const isCorrect = ua !== undefined && ua === q.correctAnswer;
    const isWrong = ua !== undefined && ua !== q.correctAnswer;
    const isSkipped = ua === undefined;

    if (selectedSubject !== 'all' && q.subjectName !== selectedSubject) {
      return false;
    }
    if (filterType === 'correct') return isCorrect;
    if (filterType === 'wrong') return isWrong;
    if (filterType === 'skipped') return isSkipped;
    return true;
  });

  const allSubjects = [...new Set(questions.map(q => q.subjectName).filter(Boolean))];
  const curQ = filteredQuestions[curReviewIdx] || filteredQuestions[0];

  const BLOCK_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#0E131F] text-white' : 'bg-[#F8FAFF] text-[#1E293B]'
      }`}
      style={{ paddingTop: STATUS_BAR_H }}
    >
      {/* ── STICKY TOP HEADER ── */}
      <header
        className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md ${
          isDark ? 'bg-[#0E131F]/90 border-[#1E293B]' : 'bg-[#F8FAFF]/90 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
              isDark ? 'bg-[#161C26] text-white hover:bg-[#202938]' : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[16px] font-bold tracking-tight leading-tight">
              {isReviewMode ? 'Detailed Answers Review' : 'Quiz Analysis Report'}
            </h1>
            <p className={`text-[12px] truncate max-w-[220px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {examTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isReviewMode && (
            <button
              onClick={() => navigate('/student/quiztest/result?review=true')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <BookOpen size={14} /> Review
            </button>
          )}
          <button
            onClick={() => navigate('/student/quiz', { replace: true })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              isDark ? 'bg-[#1E293B] text-slate-300 hover:bg-[#2A3441]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Exit
          </button>
        </div>
      </header>

      {/* ── MODE TABS ── */}
      <div className={`px-4 pt-3 pb-1 border-b flex gap-2 ${isDark ? 'border-[#1E293B] bg-[#121824]' : 'border-slate-100 bg-white'}`}>
        <button
          onClick={() => {
            if (isReviewMode) navigate('/student/quiztest/result');
            setActiveTab('overview');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            !isReviewMode && activeTab === 'overview'
              ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-500/20'
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          <BarChart3 size={15} /> Overview
        </button>

        <button
          onClick={() => {
            if (isReviewMode) navigate('/student/quiztest/result');
            setActiveTab('subjects');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            !isReviewMode && activeTab === 'subjects'
              ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-500/20'
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          <Filter size={15} /> Subjects
        </button>

        <button
          onClick={() => {
            navigate('/student/quiztest/result?review=true');
            setActiveTab('review');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            isReviewMode
              ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-500/20'
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          <BookOpen size={15} /> Question Review ({questions.length})
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-6 pb-28">
        {!isReviewMode && activeTab === 'overview' && (
          <div className="space-y-6 max-w-xl mx-auto">
            {/* HERO SCORE CARD */}
            <div
              className={`rounded-2xl p-6 relative overflow-hidden border ${
                isDark
                  ? 'bg-gradient-to-br from-[#1E293B] to-[#121824] border-slate-800'
                  : 'bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border-blue-100 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider uppercase text-[#3B82F6]">
                  Performance Summary
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={13} /> Completed
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold tracking-tight text-[#3B82F6]">
                  {totalScore}
                </span>
                <span className={`text-base font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  / {maxScore} pts
                </span>
              </div>

              {/* Progress Bar */}
              <div className={`h-2.5 w-full rounded-full overflow-hidden mt-3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                  style={{ width: `${maxScore > 0 ? Math.min(100, Math.max(0, (totalScore / maxScore) * 100)) : 0}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-xs font-medium text-slate-400">
                <span>Score Ratio: {maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0}%</span>
                <span>Time: {timeFormatted}</span>
              </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-2 gap-3">
              {/* Accuracy */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-1">Accuracy</p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{accuracy}%</p>
              </div>

              {/* Time Spent */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500 mb-1">Time Taken</p>
                <div className="flex items-center gap-1.5">
                  <Clock size={18} className="text-blue-500" />
                  <p className="text-xl font-bold">{timeFormatted}</p>
                </div>
              </div>

              {/* Correct */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-1">Correct</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">✓ {totalCorrect}</p>
              </div>

              {/* Incorrect */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1">Incorrect</p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400">✗ {totalWrong}</p>
              </div>

              {/* Skipped */}
              <div className={`p-4 rounded-xl border col-span-2 ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Unattempted / Skipped</p>
                    <p className="text-xl font-black text-slate-500 dark:text-slate-400">— {totalSkipped} questions</p>
                  </div>
                  <button
                    onClick={() => {
                      setFilterType('skipped');
                      navigate('/student/quiztest/result?review=true');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 transition-all"
                  >
                    View Skipped
                  </button>
                </div>
              </div>
            </div>

            {/* SUBJECT BREAKDOWN PREVIEW */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Subject Breakdown
                </h3>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className="text-xs font-bold text-[#3B82F6] hover:underline"
                >
                  View Details →
                </button>
              </div>

              <div className="space-y-3">
                {blockResults.map((br, bIdx) => {
                  const accent = BLOCK_COLORS[bIdx % BLOCK_COLORS.length];
                  return (
                    <div
                      key={br.blockName || bIdx}
                      className={`p-4 rounded-xl border transition-all ${
                        isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
                          <span className="font-bold text-sm">{br.blockName}</span>
                          <span className="text-xs text-slate-400">({br.blockTotal}Q)</span>
                        </div>
                        <span className="text-sm font-black" style={{ color: accent }}>
                          {br.blockScore} pts
                        </span>
                      </div>

                      <div className="flex gap-4 text-xs font-bold text-slate-500">
                        <span className="text-emerald-500">✓ {br.blockCorrect}</span>
                        <span className="text-rose-500">✗ {br.blockWrong}</span>
                        <span className="text-slate-400">— {br.blockSkipped}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── SUBJECTS TAB ── */}
        {!isReviewMode && activeTab === 'subjects' && (
          <div className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-base font-bold">Subject-Wise Breakdown</h2>
            <div className="space-y-4">
              {blockResults.flatMap(b => b.subjectResults || []).map((sr, sIdx) => {
                const maxSubjectMarks = sr.total * (sr.marks?.correct || 2);
                const percent = maxSubjectMarks > 0 ? Math.round((sr.score / maxSubjectMarks) * 100) : 0;
                return (
                  <div
                    key={sr.subj || sIdx}
                    className={`p-5 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base">{sr.subj}</h4>
                        <span className="text-xs text-slate-400">
                          Marking Scheme: +{sr.marks?.correct || 2}/0
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-[#3B82F6]">{sr.score}</span>
                        <span className="text-xs text-slate-400 font-semibold"> / {maxSubjectMarks} pts</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div
                        className="h-full rounded-full bg-[#3B82F6]"
                        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1 text-xs">
                      <div className="flex gap-3 font-bold">
                        <span className="text-emerald-500">✓ {sr.correct} Correct</span>
                        <span className="text-rose-500">✗ {sr.wrong} Wrong</span>
                        <span className="text-slate-400">— {sr.skipped} Skipped</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedSubject(sr.subj);
                          setFilterType('all');
                          navigate('/student/quiztest/result?review=true');
                        }}
                        className="text-xs font-bold text-[#3B82F6] hover:underline"
                      >
                        Review Subject →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DETAILED REVIEW MODE ── */}
        {isReviewMode && (
          <div className="space-y-5 max-w-xl mx-auto">
            {/* Filter pills & subject selector */}
            <div className="flex flex-col gap-3">
              {/* Subject dropdown / pills */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => { setSelectedSubject('all'); setCurReviewIdx(0); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSubject === 'all'
                      ? 'bg-[#3B82F6] text-white'
                      : (isDark ? 'bg-[#161C26] text-slate-400' : 'bg-white text-slate-600 shadow-sm')
                  }`}
                >
                  All Subjects
                </button>
                {allSubjects.map(subj => (
                  <button
                    key={subj}
                    onClick={() => { setSelectedSubject(subj); setCurReviewIdx(0); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSubject === subj
                        ? 'bg-[#3B82F6] text-white'
                        : (isDark ? 'bg-[#161C26] text-slate-400' : 'bg-white text-slate-600 shadow-sm')
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              {/* Status filter: All / Correct / Wrong / Skipped */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: `All (${questions.length})` },
                  { id: 'correct', label: `✓ Correct (${totalCorrect})` },
                  { id: 'wrong', label: `✗ Wrong (${totalWrong})` },
                  { id: 'skipped', label: `— Skipped (${totalSkipped})` }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setFilterType(f.id); setCurReviewIdx(0); }}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition-all ${
                      filterType === f.id
                        ? 'bg-[#3B82F6] text-white'
                        : (isDark ? 'bg-[#161C26] text-slate-400' : 'bg-white text-slate-600 border border-slate-100')
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Quick-Jumper Grid */}
            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Question Navigator</span>
                <span>{curReviewIdx + 1} of {filteredQuestions.length}</span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {filteredQuestions.map((q, idx) => {
                  const ua = answers[q.globalIdx];
                  const isCorrect = ua !== undefined && ua === q.correctAnswer;
                  const isWrong = ua !== undefined && ua !== q.correctAnswer;
                  const isCur = idx === curReviewIdx;

                  let bgClass = isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500';
                  if (isCorrect) bgClass = 'bg-emerald-500 text-white';
                  else if (isWrong) bgClass = 'bg-rose-500 text-white';

                  return (
                    <button
                      key={q.globalIdx}
                      onClick={() => setCurReviewIdx(idx)}
                      className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${bgClass} ${
                        isCur ? 'ring-2 ring-offset-2 ring-[#3B82F6]' : 'hover:opacity-90'
                      }`}
                    >
                      {q.localIdx || idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Question Detail Card */}
            {curQ ? (
              <div className={`p-5 rounded-2xl border space-y-5 ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-100 shadow-sm'}`}>
                {/* Header row */}
                <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm uppercase text-[#3B82F6]">
                      Q{curQ.localIdx || curReviewIdx + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {curQ.subjectName}
                    </span>
                    {curQ.year && (
                      <span className="text-[11px] text-slate-400">
                        {curQ.year} {curQ.shift ? `· ${curQ.shift}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Status tag */}
                  {answers[curQ.globalIdx] === undefined ? (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      Skipped
                    </span>
                  ) : answers[curQ.globalIdx] === curQ.correctAnswer ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={13} /> Correct
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                      <XCircle size={13} /> Incorrect
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div className="text-[15px] leading-relaxed font-medium">
                  <KaTeXSpan html={curQ.questionText} />
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {curQ.options.map((opt, oIdx) => {
                    const isUserChoice = answers[curQ.globalIdx] === oIdx;
                    const isCorrectAnswer = curQ.correctAnswer === oIdx;

                    let optStyle = isDark
                      ? 'bg-[#1E293B] border-slate-700 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700';

                    if (isCorrectAnswer) {
                      optStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      optStyle = 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-bold';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-[14px] transition-all ${optStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold border opacity-80">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span><KaTeXSpan html={typeof opt === 'string' ? opt : opt.text} /></span>
                        </div>

                        {isCorrectAnswer && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={14} /> Correct
                          </span>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <XCircle size={14} /> Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {curQ.explanation && (
                  <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#121824] border-slate-800' : 'bg-blue-50/40 border-blue-100'}`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#3B82F6]">
                      <HelpCircle size={14} /> Explanation & Solution
                    </div>
                    <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <KaTeXSpan html={curQ.explanation} />
                    </div>
                  </div>
                )}

                {/* Next / Prev question buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    disabled={curReviewIdx === 0}
                    onClick={() => setCurReviewIdx(prev => Math.max(0, prev - 1))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      curReviewIdx === 0
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:opacity-90'
                    }`}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <button
                    disabled={curReviewIdx === filteredQuestions.length - 1}
                    onClick={() => setCurReviewIdx(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      curReviewIdx === filteredQuestions.length - 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : 'bg-[#3B82F6] text-white hover:bg-blue-600'
                    }`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center py-10 text-sm text-slate-400">
                No questions match the selected filter.
              </p>
            )}
          </div>
        )}
      </main>

      {/* ── FIXED BOTTOM ACTIONS DOCK ── */}
      <footer
        className={`fixed bottom-0 left-0 right-0 p-4 border-t flex gap-3 backdrop-blur-md z-40 ${
          isDark ? 'bg-[#0E131F]/95 border-[#1E293B]' : 'bg-white/95 border-slate-200'
        }`}
      >
        {!isReviewMode ? (
          <>
            <button
              onClick={() => navigate('/student/quiztest/result?review=true')}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[#3B82F6] text-white hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
            >
              <BookOpen size={16} /> Review Answers
            </button>
            <button
              onClick={() => navigate('/student/quiz', { replace: true })}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                isDark ? 'bg-[#1E293B] text-white hover:bg-[#2A3441]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw size={16} /> Practice Again
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/student/quiztest/result', { replace: true });
                }
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                isDark ? 'bg-[#1E293B] text-white hover:bg-[#2A3441]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart3 size={16} /> Back to Overview
            </button>
            <button
              onClick={() => navigate('/student/quiz', { replace: true })}
              className="py-3 px-5 rounded-xl font-bold text-sm bg-[#3B82F6] text-white hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
            >
              <RotateCcw size={16} /> Retake Quiz
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
