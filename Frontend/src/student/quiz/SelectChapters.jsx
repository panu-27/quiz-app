import { useState, useEffect } from 'react';
import { Search, ChevronRight, AlertCircle } from 'lucide-react';
import { fetchChapters } from './quizApi';
import { Checkbox, useQuizNav } from './QuizAtoms';

const SelectChapters = ({
  subjectIds = [],
  selChapters = [],
  onToggleChapter,
  onSelectAllChapters,
  onContinue,
  onBack,
  subjectMap = {},
}) => {
  const [q, setQ] = useState('');
  const [activeSubj, setActiveSubj] = useState(subjectIds[0]);
  const [chapters, setChapters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeSubj) {
      setError('No subject selected. Please go back and select a subject.');
      return;
    }

    if (chapters[activeSubj]) {
      setLoading(false);
      return;
    }

    const loadChapters = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchChapters(activeSubj);
        setChapters((prev) => ({ ...prev, [activeSubj]: data }));
      } catch (err) {
        console.error('[SelectChapters] Error loading chapters:', err);
        setError(err.message || 'Failed to load chapters');
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [activeSubj]);

  const isSubjectEmpty = (sid) => {
    const chapsInSubj = chapters[sid] || [];
    return !chapsInSubj.some((c) => selChapters.includes(c._id));
  };

  const emptySubjects = subjectIds.filter((sid) => isSubjectEmpty(sid));
  const canAdvance = selChapters.length > 0 && emptySubjects.length === 0;

  useQuizNav('chapters', canAdvance, onContinue);

  const currentChapters = (chapters[activeSubj] || []).filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  const allChapsSelected =
    (chapters[activeSubj] || []).length > 0 &&
    (chapters[activeSubj] || []).every((c) => selChapters.includes(c._id));

  // --- YT STYLE SKELETON COMPONENT ---
  const SkeletonItem = () => (
    <div style={{ padding: '11px 13px', border: '1.5px solid #F0F0F2', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 10, background: '#fff' }}>
      <div className="animate-pulse" style={{ width: 18, height: 18, borderRadius: 4, background: '#F3F4F6' }} />
      <div className="animate-pulse" style={{ width: 26, height: 26, borderRadius: 7, background: '#F3F4F6' }} />
      <div style={{ flex: 1 }}>
        <div className="animate-pulse" style={{ height: 12, width: '60%', background: '#F3F4F6', borderRadius: 4, marginBottom: 6 }} />
        <div className="animate-pulse" style={{ height: 10, width: '30%', background: '#F3F4F6', borderRadius: 4 }} />
      </div>
    </div>
  );

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ background: '#FEE2E2', borderRadius: 12, padding: '14px 16px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={18} color="#DC2626" />
          <span style={{ color: '#991B1B', fontSize: 13, fontWeight: 600 }}>Error: {error}</span>
        </div>
      </div>
    );
  }

  const handleSelectAll = () => {
    onSelectAllChapters(activeSubj, chapters[activeSubj] || []);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }} className='h-[96vh]'>
      
      

      {/* ── HEADER (Keep consistent to prevent jump) ── */}
      <div style={{ flexShrink: 0 }}>
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-1">Step 2 of 3</p>
          <h2 className="qf-display text-[22px] font-bold text-gray-900 tracking-tight">Select Chapters</h2>
          {emptySubjects.length > 0 && !loading && (
            <p className="text-[11px] text-red-500 font-bold mt-1 animate-pulse">Select chapters for all subjects</p>
          )}
        </div>

        {subjectIds.length > 1 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, flexShrink: 0 }} className="no-scrollbar">
            {subjectIds.map((sid) => {
              const info = subjectMap[sid] || {};
              const cnt = (chapters[sid] || []).filter((c) => selChapters.includes(c._id)).length;
              const isAct = activeSubj === sid;
              return (
                <button key={sid} onClick={() => setActiveSubj(sid)}
                  style={{ background: isAct ? (info.accent || '#4F46E5') : '#F3F4F6', color: isAct ? '#fff' : '#6B7280', flexShrink: 0, padding: '8px 14px', borderRadius: 11, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', border: 'none' }}>
                  <span>{info.emoji || '📚'}</span>
                  <span>{info.name || 'Unknown'}</span>
                  {cnt > 0 && <span style={{ background: 'rgba(255,255,255,.25)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100 }}>{cnt}</span>}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#C4C4C4', width: 14, height: 14 }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chapters…"
              style={{ width: '100%', background: '#F5F6F8', border: 'none', borderRadius: 11, padding: '10px 12px 10px 34px', fontSize: 13 }}
            />
          </div>
          <button onClick={handleSelectAll} disabled={loading}
            style={{ background: allChapsSelected ? '#EEF2FF' : '#F3F4F6', color: allChapsSelected ? '#4F46E5' : '#6B7280', borderRadius: 11, padding: '0 16px', fontSize: 12, fontWeight: 800, border: 'none' }}>
            {allChapsSelected ? '✓ All' : 'All'}
          </button>
        </div>
      </div>

      {/* ── CHAPTER LIST / SKELETON ── */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar pb-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingBottom: 80 }}>
          {loading ? (
            // Show 6 skeleton items while loading
            Array(6).fill(0).map((_, i) => <SkeletonItem key={i} />)
          ) : (
            currentChapters.map((chap, i) => {
              const sel = selChapters.includes(chap._id);
              return (
                <div key={chap._id} className="qf-anim"
                  style={{ animationDelay: `${i * 30}ms`, border: `1.5px solid ${sel ? '#A5B4FC' : '#F0F0F2'}`, background: sel ? '#FAFAFE' : '#fff', borderRadius: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', cursor: 'pointer' }}
                    onClick={() => onToggleChapter(chap._id)}>
                    <Checkbox checked={sel} onChange={() => onToggleChapter(chap._id)} />
                    <div style={{ background: sel ? '#4F46E5' : '#F0F0F2', color: sel ? '#fff' : '#ADADAD', width: 26, height: 26, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: sel ? '#312E81' : '#1F2937' }}>{chap.name}</p>
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{chap.topicCount} topics</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!loading && currentChapters.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>No chapters found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      {canAdvance && (
        <div className="hidden sm:block z-20 sm:z-10 fixed bottom-6 left-5 right-5 z-50">
          <button className="qf-continue-btn w-full" style={{ borderRadius: 18 }} onClick={onContinue}>
            Review Overview <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {canAdvance && (
        <div className="sm:hidden fixed z-10 sm:z-20  bottom-7 left-5 right-5 z-50">
          <button className="qf-continue-btn w-full" style={{ borderRadius: 18 }} onClick={onContinue}>
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      )}
      {/* Add this CSS to your global stylesheet for the YT bar effect */}
      <style>{`
        @keyframes yt-loader {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .yt-loader-bar {
          animation: yt-loader 2s infinite linear;
          transform-origin: left;
        }
      `}</style>
    </div>
  );
};

export default SelectChapters;