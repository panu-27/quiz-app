import React, { useState } from 'react';
import { Play, FileText, Timer, BookMarked, BarChart3, BookOpen, Info, Flag, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { useQuizNav } from './QuizAtoms';
import { fetchQuizQuestions } from './quizApi';

const TestOverview = ({
  subjectIds = [],
  chapterIds = [],
  yearRange = { min: 2004, max: 2025 },
  testType = 'pyq',
  totalTime = 90,
  subjectWiseCounts = {},
  onStart,
  onBack,
  subjectMap = {},
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDiff, setSelectedDiff] = useState('Medium');

  const totalQs = subjectIds.reduce((sum, id) => sum + (subjectWiseCounts[id] || 10), 0);

  const handleBeginTest = async () => {
    if (loading || !subjectIds.length) return;
    setLoading(true);
    setError(null);

    try {
      const questions = await fetchQuizQuestions({
        type: testType,
        subjectIds,
        chapterIds,
        difficulty: selectedDiff,
        yearRange,
        totalTime,
        subjectWiseCounts,
        limit: 10,
      });

      onStart(questions);
    } catch (err) {
      console.error('[TestOverview] Error:', err);
      setError(err.message || 'Failed to fetch questions. Please try again.');
      setLoading(false);
    }
  };

  useQuizNav('overview', !loading, handleBeginTest);

  const stats = [
    { icon: <FileText size={14} />, label: 'Questions', value: totalQs, color: '#4F46E5', bg: '#EEF2FF', iconBg: '#C7D2FE' },
    { icon: <Timer size={14} />, label: 'Duration', value: `${totalTime}m`, color: '#B45309', bg: '#FFFBEB', iconBg: '#FDE68A' },
    { icon: <BookMarked size={14} />, label: 'Chapters', value: chapterIds.length, color: '#047857', bg: '#ECFDF5', iconBg: '#A7F3D0' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }} className='h-[96vh]'>
      
{loading && (
  <div style={{
    position: 'fixed', 
    inset: 0, 
    zIndex: 1000,
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#ffffff', // Clean white background
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Subtle Gray Loader */}
      <Loader2 
        size={28} 
        strokeWidth={1.5} 
        style={{ 
          color: '#E2E8F0', // Very light slate
          animation: 'spin 1.5s linear infinite' 
        }} 
      />
      
      {/* Minimalist Text */}
      <p style={{ 
        fontSize: 13, 
        fontWeight: 600, 
        color: '#94A3B8', 
        letterSpacing: '0.02em',
        fontFamily: "inherit"
      }}>
        Preparing your test...
      </p>
    </div>

    <style>{`
      @keyframes spin { 
        from { transform: rotate(0deg); } 
        to { transform: rotate(360deg); } 
      }
    `}</style>
  </div>
)}

      {/* ── Heading Desktop ── */}
      <div className="hidden md:block" style={{ flexShrink: 0, marginBottom: 18 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Step 3 of 3</p>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>Test Overview</h2>
        <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>Finalize settings and begin your session</p>
      </div>

      {/* ── Heading Mobile ── */}
      <div className="mb-6 md:hidden" style={{ flexShrink: 0 }}>
        <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-1">Step 3 of 3</p>
        <h2 className="qf-display text-[24px] font-bold text-gray-900 tracking-tight">Test Overview</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="h-[75vh] no-scrollbar">
        <div style={{ paddingBottom: 16 }}>
          {/* Test Type Badge */}
          <div style={{ background: testType === 'pyq' ? '#F3E8FF' : '#EEF2FF', border: testType === 'pyq' ? '1.5px solid #E9D5FF' : '1.5px solid #C7D2FE', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: testType === 'pyq' ? '#7C3AED' : '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {testType === 'pyq' ? '📚 PYQ Test' : '🎯 Practice Test'}
            </span>
            {testType === 'pyq' && (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#7C3AED', background: 'rgba(124, 58, 237, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                {yearRange.min}–{yearRange.max}
              </span>
            )}
          </div>

          {/* Subject breakdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {subjectIds.map((id) => {
              const s = subjectMap[id] || {};
              return (
                <span key={id} style={{ background: s.bg || '#EEF2FF', color: s.accent || '#4F46E5', border: `1.5px solid ${s.border || '#C7D2FE'}`, fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                  <span>{s.emoji || '📚'}</span>
                  {s.name || 'Unknown'}
                  <span style={{ fontSize: 10, opacity: 0.7 }}>· {subjectWiseCounts[id] || 10}Q</span>
                </span>
              );
            })}
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} color="#DC2626" />
              <span style={{ fontSize: 12, color: '#991B1B', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: s.iconBg, color: s.color, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                <div>
                  <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: s.color, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginTop: 4, textTransform: 'uppercase' }}>{s.label}</p>
                </div>
              </div>
            ))}

            {/* Difficulty Dropdown */}
            <div style={{ background: '#F5F3FF', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', border: '1.5px solid #DDD6FE' }}>
              <select value={selectedDiff} onChange={(e) => setSelectedDiff(e.target.value)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <div style={{ background: '#DDD6FE', color: '#6D28D9', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={15} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: '#6D28D9', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{selectedDiff}</p>
                  <ChevronDown size={14} strokeWidth={3} color="#6D28D9" />
                </div>
                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', marginTop: 4 }}>Difficulty</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #F0F0F4', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#FAFAFA', borderBottom: '1.5px solid #F0F0F4' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>Final Guidelines</p>
            </div>
            <div>
              {[
                { icon: <BookOpen />, text: 'Navigate freely between questions.' },
                { icon: <Info />, text: 'Answers revealed after submission.' },
                { icon: <Flag />, text: 'Flag questions to revisit later.' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < 2 ? '1.5px solid #F8F8FA' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F5F7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {React.cloneElement(r.icon, { size: 14, strokeWidth: 2.5 })}
                  </div>
                  <p style={{ fontSize: 12, color: '#4B5563', fontWeight: 600 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="hidden md:block" style={{ paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
        <button className="qf-continue-btn" onClick={handleBeginTest} disabled={loading} style={{ height: 52, borderRadius: 14 }}>
          <Play size={16} strokeWidth={3} style={{ fill: 'white' }} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>Begin Session</span>
        </button>
      </div>

      <div className="md:hidden fixed bottom-6 left-5 right-5 z-50">
        <button className="qf-continue-btn" onClick={handleBeginTest} disabled={loading} style={{ borderRadius: 18 }}>
          <Play size={16} strokeWidth={3} style={{ fill: 'white' }} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>Begin Session</span>
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default TestOverview;