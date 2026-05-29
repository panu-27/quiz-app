import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, CheckCircle2, AlertTriangle, X, Search, Calendar, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios.js';
import { QuestionItem } from './PYQExplorer';
import { YEAR_OPTIONS } from './pyqData';

const STATUS_BAR_H = 43.5;
const DOT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444', '#06B6D4'];
const REPORT_REASONS = [
    { key: 'blurry_image',         label: 'Blurry / Missing Image' },
    { key: 'incorrect_question',   label: 'Incorrect Question Text' },
    { key: 'incorrect_options',    label: 'Incorrect / Missing Options' },
    { key: 'wrong_correct_option', label: 'Wrong Correct Answer Marked' },
    { key: 'improper_explanation', label: 'Improper / Missing Explanation' },
    { key: 'ui_error',             label: 'UI / Display Error' },
];

export default function PYQBookmarks() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';
    const isApproved = !!user?.isApproved;
    const PRIME_BANNER_H = 60;

    const goal = localStorage.getItem("selectedGoal") || "MHT CET";

    const [bookmarks, setBookmarks] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pyq_bookmarks') || '[]');
        } catch {
            return [];
        }
    });
    const [activeSubjectFilter, setActiveSubjectFilter] = useState(null);
    const [searchBookmarks, setSearchBookmarks] = useState('');
    // Filter bookmarks by subject and search query
    const filteredBookmarks = (activeSubjectFilter ? bookmarks.filter(b => {
        const subjectName = b.subject || b.subjectName || '';
        const subjectId = b.subjectId || '';
        return subjectName.toLowerCase() === activeSubjectFilter.toLowerCase() || subjectId === activeSubjectFilter;
    }) : bookmarks).filter(b => {
        if (!searchBookmarks.trim()) return true;
        const query = searchBookmarks.toLowerCase();
        const text = (b.question || b.questionText || '').toLowerCase();
        return text.includes(query);
    });

    const [doneQuestions, setDoneQuestions] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pyq_done') || '[]');
        } catch {
            return [];
        }
    });

    const [openQuestionId, setOpenQuestionId] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState([]);
    const [activeChapter, setActiveChapter] = useState(null);
    const [filterYear, setFilterYear] = useState('All');
    const [yearPickerOpen, setYearPickerOpen] = useState(false);
    const [viewMode, setViewMode] = useState('all');
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [topicOpenQId, setTopicOpenQId] = useState(null);
    const [reportTarget, setReportTarget] = useState(null);
    const [reportDone, setReportDone] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);

    useEffect(() => {
        localStorage.setItem('pyq_bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('pyq_done', JSON.stringify(doneQuestions));
    }, [doneQuestions]);

    const handleToggleBookmark = (question) => {
        setBookmarks(prev => {
            const exists = prev.some(b => b._id === question._id);
            if (exists) {
                return prev.filter(b => b._id !== question._id);
            } else {
                return [...prev, question];
            }
        });
    };

    const handleToggleDone = (question) => {
        setDoneQuestions(prev => {
            const qId = question._id;
            const cId = question.chapterId;
            const exists = prev.some(item => item.questionId === qId);
            if (exists) {
                return prev.filter(item => item.questionId !== qId);
            } else {
                return [...prev, { questionId: qId, chapterId: cId }];
            }
        });
    };

    const handleReport = async (reasonKey) => {
        if (!reportTarget) return;
        try {
            await api.post('/quiz/question-report', { questionId: reportTarget._id, reason: reasonKey });
            setReportDone(true);
            setTimeout(() => { setReportTarget(null); setReportDone(false); setSelectedReason(null); }, 1600);
        } catch { setReportTarget(null); setSelectedReason(null); }
    };

    return (
        <div
            className="fixed inset-0 z-[600] flex flex-col transition-all duration-300"
            style={{
                background: activeChapter
                    ? (theme === 'light' ? '#F8FAFC' : '#0B101A')
                    : (theme === 'light' ? '#F8FAFF' : '#0E131F'),
            }}
        >
            {!activeChapter ? (
                <>
                    {/* Header */}
                    <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`} style={{ paddingTop: STATUS_BAR_H + 8 }}>
                        <div className="flex items-center justify-between">
                            {/* Left: back button + title */}
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigate(-1)} className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    <ArrowLeft size={24} />
                                </button>
                                <h1 className={`text-[17px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Bookmarks</h1>
                            </div>
                            {/* Right: bookmark & progress icons */}
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigate('/student/pyq/bookmarks')} className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${isDark ? 'border-[#2A3441] bg-[#161C26] text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                                </button>
                                <button onClick={() => navigate('/student/pyq/progress')} className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all ${isDark ? 'border-[#2A3441] bg-[#161C26] text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                                    <BarChart2 size={18} />
                                </button>
                            </div>
                        </div>
                        {/* Search */}
                        <div className="relative">
                            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} size={18} />
                            <input
                                type="text"
                                placeholder="Search bookmarks..."
                                value={searchBookmarks}
                                onChange={e => setSearchBookmarks(e.target.value)}
                                className={`w-full py-3 pl-10 pr-4 rounded-[12px] text-[14px] focus:outline-none transition-colors ${isDark ? 'bg-[#161C26] border border-[#2A3441] text-white placeholder-[#475569]' : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400'}`}
                            />
                        </div>
                    </div>

                    {/* Subject Filter Tabs */}
                    <div className={`flex gap-1 overflow-x-auto w-full px-5 py-2 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'} [&::-webkit-scrollbar]:hidden`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {['All','Physics','Chemistry','Math','Biology'].map((sub) => (
                            <button
                                key={sub}
                                onClick={() => setActiveSubjectFilter(sub === 'All' ? null : sub)}
                                className={`flex-1 min-w-[80px] text-center text-sm font-medium transition-colors ${
                                    (activeSubjectFilter === null && sub === 'All') || activeSubjectFilter === sub
                                        ? (isDark ? 'text-[#93C5FD] border-b-2 border-[#93C5FD]' : 'text-[#3B82F6] border-b-2 border-[#3B82F6]')
                                        : (isDark ? 'text-gray-400' : 'text-gray-600')}`}
                                style={{ paddingBottom: 2 }}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                /* Header when chapter is active */
                <div
                    className="flex-shrink-0 sticky top-0 z-20 flex flex-col gap-3"
                    style={{
                        background: theme === 'light' ? '#F8FAFC' : '#0B101A',
                        paddingTop: STATUS_BAR_H + 8,
                        paddingBottom: 12,
                        borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #1F2937',
                    }}
                >
                    <div className="flex items-center justify-between px-4 gap-3">
                        {/* Left side: back button + chapter text */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <button
                                onClick={() => setActiveChapter(null)}
                                className={`w-10 h-10 -ml-2 flex items-center justify-center rounded-[10px] active:scale-95 transition-all flex-shrink-0 ${isDark ? 'text-white' : 'text-slate-800'}`}
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="min-w-0 flex-1">
                                <p className={`text-[10px] font-black tracking-wider uppercase leading-none ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                                    {(() => {
                                        const firstQ = bookmarks.find(q => (q.chapterName || q.chapter || 'Unknown') === activeChapter);
                                        const subName = firstQ?.subject || firstQ?.subjectName || activeSubjectFilter || 'BOOKMARKS';
                                        return subName.toUpperCase();
                                    })()}
                                </p>
                                <h1 className={`text-[17px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {activeChapter}
                                </h1>
                            </div>
                        </div>

                        {/* Right side: Calendar toggle button */}
                        <button
                            onClick={() => setYearPickerOpen(o => !o)}
                            className={`w-9 h-9 flex items-center justify-center rounded-[10px] border active:scale-95 transition-all flex-shrink-0 ${
                                filterYear !== 'All'
                                    ? 'bg-amber-500 border-amber-500 text-white'
                                    : isDark
                                        ? 'border-[#2A3441] bg-[#161C26] text-white'
                                        : 'border-slate-200 bg-white text-slate-700'
                            }`}
                        >
                            <Calendar size={18} />
                        </button>
                    </div>

                    {/* All Questions / Topic Wise Toggle */}
                    <div className="px-4">
                        <div className={`flex p-1 rounded-xl ${isDark ? 'bg-[#161C26]' : 'bg-slate-100'}`}>
                            {['all', 'topic'].map(mode => {
                                const label = mode === 'all' ? 'All Questions' : 'Topic Wise';
                                const isActive = viewMode === mode;
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isActive
                                            ? (isDark ? 'bg-[#2563EB] text-white' : 'bg-white text-slate-900 shadow-sm')
                                            : (isDark ? 'text-slate-400' : 'text-slate-500')
                                            }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Horizontal scrollable year filters (toggled) */}
                    {yearPickerOpen && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-1 pb-1">
                            {YEAR_OPTIONS.map(y => {
                                const isSelected = filterYear === y;
                                return (
                                    <button
                                        key={y}
                                        onClick={() => setFilterYear(y)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap flex-shrink-0 ${isSelected
                                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                            : isDark
                                                ? 'border-[#2A3441] bg-transparent text-[#8492A6]'
                                                : 'border-transparent bg-slate-100 text-slate-500'
                                            }`}
                                    >
                                        {y}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className={`flex-1 overflow-y-auto no-scrollbar ${activeChapter ? 'px-0 py-0' : 'px-6 py-6'}`} style={{ paddingBottom: isApproved ? 32 : (PRIME_BANNER_H + 48) }}>
                <div className={activeChapter ? 'w-full' : 'max-w-md mx-auto'}>
                    {activeChapter ? (
                        // Render questions of this chapter directly
                        (() => {
                            const chapterQuestions = bookmarks.filter(q => {
                                const chapter = q.chapterName || q.chapter || 'Unknown';
                                if (chapter !== activeChapter) return false;
                                
                                // Subject filter check
                                if (activeSubjectFilter) {
                                    const subjectName = q.subject || q.subjectName || '';
                                    const subjectId = q.subjectId || '';
                                    const match = subjectName.toLowerCase() === activeSubjectFilter.toLowerCase() || subjectId === activeSubjectFilter;
                                    if (!match) return false;
                                }
                                
                                // Search check
                                if (searchBookmarks.trim()) {
                                    const query = searchBookmarks.toLowerCase();
                                    const text = (q.question || q.questionText || '').toLowerCase();
                                    if (!text.includes(query)) return false;
                                }
                                
                                // Year filter check
                                if (filterYear !== 'All') {
                                    const qYear = String(q.year || '');
                                    if (qYear !== filterYear) return false;
                                }
                                
                                return true;
                            });

                            if (chapterQuestions.length === 0) {
                                return (
                                    <div className="px-6 py-6">
                                        <div 
                                            style={{
                                                borderRadius: 16,
                                                border: theme === 'light' ? '1px solid #E2E8F0' : '1px solid #374151',
                                                backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B',
                                                textAlign: 'center', padding: '48px 16px', color: '#94A3B8', fontSize: 14, fontWeight: 650
                                            }}
                                        >
                                            No bookmarked questions found
                                        </div>
                                    </div>
                                );
                            }

                            if (viewMode === 'all') {
                                return (
                                    <div 
                                        style={{
                                            background: theme === 'light' ? '#fff' : '#111827',
                                            borderTop: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151'
                                        }}
                                    >
                                        {chapterQuestions.map((q, idx) => (
                                            <QuestionItem
                                                key={q._id}
                                                q={q}
                                                idx={idx}
                                                isOpen={openQuestionId === q._id}
                                                onToggle={() => setOpenQuestionId(openQuestionId === q._id ? null : q._id)}
                                                onReport={setReportTarget}
                                                isBookmarked={true}
                                                onToggleBookmark={handleToggleBookmark}
                                                isDone={doneQuestions.some(item => item?.questionId === q._id || item === q._id)}
                                                onToggleDone={handleToggleDone}
                                            />
                                        ))}
                                    </div>
                                );
                            } else {
                                // Topic Wise view: group the filtered questions by topic
                                const topicsObj = {};
                                chapterQuestions.forEach(q => {
                                    const topicName = q._topicName || q.topicName || q.topicId?.name || q.topic || 'General';
                                    if (!topicsObj[topicName]) topicsObj[topicName] = [];
                                    topicsObj[topicName].push(q);
                                });

                                const topicEntries = Object.entries(topicsObj);

                                return (
                                    <div style={{
                                        background: theme === 'light' ? '#fff' : '#111827',
                                        borderTop: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151'
                                    }}>
                                        {topicEntries.map(([topicName, qs], topicIdx) => {
                                            const isExpanded = expandedTopic === topicName;
                                            const dotColor = DOT_COLORS[topicIdx % DOT_COLORS.length];
                                            return (
                                                <div 
                                                    key={topicName}
                                                    style={{ borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151' }}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            setExpandedTopic(isExpanded ? null : topicName);
                                                            setTopicOpenQId(null);
                                                        }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: 12,
                                                            padding: '14px 16px', cursor: 'pointer',
                                                            background: isExpanded
                                                                ? (theme === 'light' ? '#FAFBFF' : '#1E293B')
                                                                : (theme === 'light' ? '#fff' : '#111827'),
                                                            transition: 'background 0.2s',
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                                                            background: dotColor,
                                                            boxShadow: `0 0 0 3px ${dotColor}28`,
                                                        }} />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{
                                                                fontSize: 13.5, fontWeight: 700,
                                                                color: theme === 'light' ? '#1E293B' : '#FFFFFF',
                                                                margin: 0
                                                            }}>{topicName}</p>
                                                            <p style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0 0', fontWeight: 600 }}>
                                                                {qs.length} question{qs.length !== 1 ? 's' : ''}
                                                                {filterYear !== 'All' ? ` · ${filterYear}` : ''}
                                                            </p>
                                                        </div>
                                                        <div style={{
                                                            width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                                                            background: isExpanded
                                                                ? (theme === 'light' ? '#EEF2FF' : '#312E81')
                                                                : (theme === 'light' ? '#F8FAFC' : '#1F2937'),
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: isExpanded ? '#4F46E5' : '#CBD5E1',
                                                            transition: 'all 0.2s',
                                                        }}>
                                                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                        </div>
                                                    </div>

                                                    {isExpanded && (
                                                        <div style={{ animation: 'fadeIn 0.2s ease' }}>
                                                            {qs.map((q, idx) => (
                                                                <QuestionItem
                                                                    key={q._id}
                                                                    q={q}
                                                                    idx={idx}
                                                                    isOpen={topicOpenQId === q._id}
                                                                    onToggle={() => setTopicOpenQId(topicOpenQId === q._id ? null : q._id)}
                                                                    onReport={setReportTarget}
                                                                    isBookmarked={true}
                                                                    onToggleBookmark={handleToggleBookmark}
                                                                    isDone={doneQuestions.some(item => item?.questionId === q._id || item === q._id)}
                                                                    onToggleDone={handleToggleDone}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            }
                        })()
                    ) : (
                        // Render chapter list
                        filteredBookmarks.length === 0 ? (
                            <div 
                                style={{ 
                                    borderRadius: 16,
                                    border: theme === 'light' ? '1px solid #E2E8F0' : '1px solid #374151',
                                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B',
                                    textAlign: 'center', padding: '48px 16px', color: '#94A3B8', fontSize: 14, fontWeight: 650 
                                }}
                            >
                                No bookmarked questions yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(
                                    filteredBookmarks.reduce((acc, q) => {
                                      const chapter = q.chapterName || q.chapter || 'Unknown';
                                      if (!acc[chapter]) acc[chapter] = [];
                                      acc[chapter].push(q);
                                      return acc;
                                    }, {})
                                  ).map(([chapter, questions]) => {
                                      const firstQ = questions[0];
                                      const subjectName = firstQ?.subject || firstQ?.subjectName || 'Subject';
                                      const totalQs = questions.length;
                                      const solvedQs = questions.filter(q => doneQuestions.some(item => item.questionId === q._id)).length;
                                      const pct = totalQs > 0 ? Math.round((solvedQs / totalQs) * 100) : 0;
                                      
                                      return (
                                          <div
                                              key={chapter}
                                              onClick={() => {
                                                  setActiveChapter(chapter);
                                                  setFilterYear('All');
                                                  setYearPickerOpen(false);
                                              }}
                                              className={`flex items-center px-4 py-4 rounded-[16px] cursor-pointer active:scale-[0.99] transition-all border ${
                                                  isDark ? 'bg-[#161C26] border-white/[0.05]' : 'bg-white border-slate-200/40 shadow-none'
                                              }`}
                                          >
                                              <div className="flex-1 min-w-0">
                                                  <p className={`text-[10px] font-black tracking-wider uppercase leading-none mb-1.5 ${
                                                      isDark ? 'text-[#8492A6]' : 'text-slate-400'
                                                  }`}>
                                                      {subjectName}
                                                  </p>
                                                  <h3 className={`text-[16px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                      {chapter}
                                                  </h3>
                                                  <p className={`text-[13px] font-medium mt-0.5 ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                                                      {solvedQs}/{totalQs} completed
                                                  </p>
                                                  {/* Progress bar */}
                                                  <div className={`mt-2 h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#2A3441]' : 'bg-slate-100'}`}>
                                                      <div
                                                          className="h-full rounded-full bg-[#2563EB] transition-all"
                                                          style={{ width: `${pct}%` }}
                                                      />
                                                  </div>
                                              </div>

                                              <ChevronRight size={20} className={`ml-3 flex-shrink-0 ${isDark ? 'text-[#2A3441]' : 'text-slate-300'}`} />
                                          </div>
                                      );
                                  })
                                }
                            </div>
                        )
                    )}
                    </div>
                </div>

            {/* ══════════ REPORT MODAL ══════════ */}
            {reportTarget && (
                <div
                    onClick={() => { setReportTarget(null); setSelectedReason(null); setReportDone(false); }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 480,
                            background: theme === 'light' ? '#fff' : '#1F2937', borderRadius: '24px 24px 0 0',
                            padding: '8px 0 40px',
                            animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
                        }}
                    >
                        <div style={{ width: 36, height: 4, borderRadius: 99, background: '#E2E8F0', margin: '8px auto 20px' }} />

                        {reportDone ? (
                            <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: '50%',
                                    background: '#F0FDF4', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px',
                                }}>
                                    <CheckCircle2 size={28} color="#16A34A" strokeWidth={1.8} />
                                </div>
                                <p style={{ fontSize: 16, fontWeight: 700, color: theme === 'light' ? '#0F172A' : '#FFFFFF', marginBottom: 6 }}>Report Submitted</p>
                                <p style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>Thanks for helping us improve!</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: '0 20px 16px', borderBottom: theme === 'light' ? '1px solid #F1F5F9' : '1px solid #374151' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <AlertTriangle size={16} color="#EF4444" />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 15, fontWeight: 700, color: theme === 'light' ? '#0F172A' : '#FFFFFF', margin: 0 }}>Report an Issue</p>
                                            <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontWeight: 500 }}>Select the issue you found</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '8px 16px' }}>
                                    {REPORT_REASONS.map(r => (
                                        <button
                                            key={r.key}
                                            onClick={() => setSelectedReason(r.key)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center',
                                                gap: 12, padding: '13px 12px', borderRadius: 12,
                                                border: 'none', cursor: 'pointer', marginBottom: 4,
                                                background: selectedReason === r.key
                                                    ? (theme === 'light' ? '#EEF2FF' : '#312E81')
                                                    : 'transparent',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{
                                                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                                border: selectedReason === r.key ? 'none' : '2px solid #E2E8F0',
                                                background: selectedReason === r.key ? '#4F46E5' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.15s',
                                            }}>
                                                {selectedReason === r.key && (
                                                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                                        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{
                                                fontSize: 13.5, fontWeight: selectedReason === r.key ? 600 : 500,
                                                color: selectedReason === r.key
                                                    ? '#4F46E5'
                                                    : (theme === 'light' ? '#374151' : '#E2E8F0'),
                                                transition: 'all 0.15s',
                                            }}>{r.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div style={{ padding: '4px 20px 0' }}>
                                    <button
                                        onClick={() => selectedReason && handleReport(selectedReason)}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: 14,
                                            border: 'none', fontSize: 14, fontWeight: 700,
                                            cursor: selectedReason ? 'pointer' : 'not-allowed',
                                            background: selectedReason ? '#4F46E5' : (theme === 'light' ? '#F1F5F9' : '#1F2937'),
                                            color: selectedReason ? '#fff' : '#CBD5E1',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Submit Report
                                    </button>
                                    <button
                                        onClick={() => { setReportTarget(null); setSelectedReason(null); }}
                                        style={{
                                            width: '100%', marginTop: 8, padding: '12px',
                                            background: 'none', border: 'none', fontSize: 13,
                                            color: '#94A3B8', cursor: 'pointer', fontWeight: 600,
                                        }}
                                    >Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Prime banner */}
            {!isApproved && (
                <div className="fixed left-0 right-0 z-[400]" style={{ bottom: '16px' }}>
                    <div className="bg-gradient-to-r from-[#7A41F7] to-[#6330E3] flex items-center justify-between px-5 py-3.5">
                        <div>
                            <p className="text-white font-bold text-[13px]">5 free questions available</p>
                            <p className="text-white/60 text-[11px]">Get unlimited access with Prime.</p>
                        </div>
                        <button className="bg-white text-[#7A41F7] font-bold text-[12px] px-4 py-2.5 rounded-xl flex-shrink-0">
                            Join Prime
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
