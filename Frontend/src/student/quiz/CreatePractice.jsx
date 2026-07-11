import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Check, ArrowLeft, Timer, ChevronRight, Minus } from 'lucide-react';
import { fetchSubjects, fetchChapters } from './quizApi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const STATUS_BAR_H = 28.5;

export default function CreatePractice({ onStartPractice, onBackToApp }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [chaptersMap, setChaptersMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);

  const [loading, setLoading] = useState(true);

  // --- Step 2 Settings ---
  const [difficulty, setDifficulty] = useState('Medium');
  const [subjectQuestions, setSubjectQuestions] = useState({});
  const [subjectTimes, setSubjectTimes] = useState({});
  const [subStep, setSubStep] = useState(0);

  // Sync selected subjects' settings
  const activeSubjects = subjects.filter(s => {
    const chaps = chaptersMap[s._id] || [];
    return chaps.some(c => selectedChapters.includes(c._id));
  });

  const isMathSelected = activeSubjects.some(s => s.name.toLowerCase().includes('math'));
  const isBioSelected = activeSubjects.some(s => s.name.toLowerCase().includes('biol') || s.name.toLowerCase().includes('bio'));

  useEffect(() => {
    setSubjectQuestions(prev => {
      const updated = { ...prev };
      let changed = false;
      activeSubjects.forEach(s => {
        if (updated[s._id] === undefined) {
          updated[s._id] = 25; // default to 25 questions
          changed = true;
        }
      });
      return changed ? updated : prev;
    });

    setSubjectTimes(prev => {
      const updated = { ...prev };
      let changed = false;
      activeSubjects.forEach(s => {
        if (updated[s._id] === undefined) {
          const isMathOrBio = s.name.toLowerCase().includes('math') || s.name.toLowerCase().includes('biol');
          updated[s._id] = isMathOrBio ? 45 : 30; // default time
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [selectedChapters, subjects, chaptersMap]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const subjectsData = await fetchSubjects();
        setSubjects(subjectsData);

        const cmap = {};
        await Promise.all(
          subjectsData.map(async (subj) => {
            const chaps = await fetchChapters(subj._id);
            cmap[subj._id] = chaps;
          })
        );
        setChaptersMap(cmap);

        // Auto-select Physics chapters by default
        const physics = subjectsData.find(s => s.name.toLowerCase().includes('physics'));
        if (physics && cmap[physics._id]?.length > 0) {
          const physicsChapIds = cmap[physics._id].map(c => c._id);
          setSelectedChapters(physicsChapIds);
          setSelectedSubjects([physics._id]);
        }
      } catch (err) {
        console.error("Error loading subjects/chapters:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chaptersMap[s._id] || []).some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isSubjectFullySelected = (subjId) => {
    const chaps = chaptersMap[subjId] || [];
    if (chaps.length === 0) return false;
    return chaps.every(c => selectedChapters.includes(c._id));
  };

  const isSubjectPartiallySelected = (subjId) => {
    const chaps = chaptersMap[subjId] || [];
    if (chaps.length === 0) return false;
    const count = chaps.filter(c => selectedChapters.includes(c._id)).length;
    return count > 0 && count < chaps.length;
  };

  const toggleSubject = (subjId) => {
    const chaps = chaptersMap[subjId] || [];
    const selectedCount = chaps.filter(c => selectedChapters.includes(c._id)).length;
    const hasAnySelected = selectedCount > 0;

    if (hasAnySelected) {
      // Prevent deselecting if this is the only subject with chapters selected
      const otherSubjectsHaveChapters = subjects.some(s => {
        if (s._id === subjId) return false;
        const otherChaps = chaptersMap[s._id] || [];
        return otherChaps.some(c => selectedChapters.includes(c._id));
      });
      if (!otherSubjectsHaveChapters) return; // block — must keep at least one

      setSelectedChapters(prev => prev.filter(cId => !chaps.some(c => c._id === cId)));
      setSelectedSubjects(prev => prev.filter(id => id !== subjId));
    } else {
      const chapIds = chaps.map(c => c._id);
      setSelectedChapters(prev => [...new Set([...prev, ...chapIds])]);
      if (!selectedSubjects.includes(subjId)) {
        setSelectedSubjects(prev => [...prev, subjId]);
      }
    }
  };

  const toggleChapter = (subjId, chapId) => {
    setSelectedChapters(prev => {
      const isSelected = prev.includes(chapId);
      if (isSelected) {
        // Prevent removing if this is the only selected chapter across all subjects
        if (prev.length === 1) return prev;
      }
      if (isSelected) return prev.filter(id => id !== chapId);
      return [...prev, chapId];
    });

    if (!selectedSubjects.includes(subjId)) {
      setSelectedSubjects(prev => [...prev, subjId]);
    }
  };

  const handleStart = () => {
    const subjectSettings = {};
    let computedTotalTime = 0;
    activeSubjects.forEach(s => {
      const qCount = subjectQuestions[s._id] || 25;
      const isMathOrBio = s.name.toLowerCase().includes('math') || s.name.toLowerCase().includes('biol');
      const sTime = subjectTimes[s._id] || (isMathOrBio ? 45 : 30);

      if (sTime === 'Unlimited') {
        computedTotalTime = 9999;
      } else if (computedTotalTime !== 9999) {
        computedTotalTime += Number(sTime);
      }

      subjectSettings[s._id] = {
        count: qCount,
        difficulty: difficulty === 'All' ? 'Medium' : difficulty
      };
    });

    onStartPractice({
      subjectIds: activeSubjects.map(s => s._id),
      chapterIds: selectedChapters,
      totalTime: computedTotalTime,
      difficulty,
      subjectSettings
    });
  };

  const handleNextOrStart = () => {
    if (subStep < activeSubjects.length) {
      setSubStep(subStep + 1);
    } else {
      handleStart();
    }
  };

  const ctaText = subStep < activeSubjects.length ? 'Next' : 'Start practice';

  // --- UI RENDERERS ---

  if (step === 2) {
    const currentSubject = subStep > 0 ? activeSubjects[subStep - 1] : null;

    return (
      <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#F8FAFF] text-[#1E293B]'}`}>
        {/* FIXED HEADER */}
        <div className={`sticky top-0 z-40  px-5 flex flex-col gap-2 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`} style={{ paddingTop: STATUS_BAR_H + 10 }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (subStep > 0) {
                  setSubStep(subStep - 1);
                } else {
                  setStep(1);
                }
              }}
              className={`w-10 h-10 -ml-2  flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-850'}`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-[21px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Create practice</h1>
          </div>
        </div>

        {/* Segmented Horizontal Step Progress Bar */}
        <div className={`px-5 pt-4 pb-2 flex gap-1.5 z-40 sticky top-[96px] ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`}>
          {Array.from({ length: 1 + activeSubjects.length }).map((_, idx) => {
            const isCompleted = idx < subStep;
            const isActive = idx === subStep;
            return (
              <div
                key={idx}
                className={`flex-1 h-1.5 rounded-full overflow-hidden relative ${isDark ? 'bg-[#2A3441]' : 'bg-slate-200'}`}
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: isActive || isCompleted ? '100%' : '0%'
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="h-full rounded-full bg-[#3B82F6]"
                />
              </div>
            );
          })}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 px-5 pt-6 space-y-8 pb-36 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={subStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="space-y-8"
            >
              {subStep === 0 ? (
                /* Difficulty Section */
                <div className={`rounded-[16px] p-5 space-y-4 ${isDark ? 'bg-[#161C26]' : 'bg-white'}`}>
                  <h3 className={`text-[17px] font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Difficulty of questions</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Easy', 'Medium', 'Hard'].map(level => {
                      const isSel = difficulty === level;
                      return (
                        <motion.button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          whileTap={{ scale: 0.97 }}
                          animate={{
                            borderColor: isSel ? '#3B82F6' : (isDark ? '#2A3441' : 'transparent'),
                            backgroundColor: isSel ? 'rgba(59,130,246,0.1)' : (isDark ? 'rgba(0,0,0,0)' : '#F1F5F9'),
                            color: isSel ? '#3B82F6' : (isDark ? '#E2E8F0' : '#475569')
                          }}
                          className="px-6 py-2.5 rounded-full border text-[14px] font-semibold transition-all cursor-pointer shadow-none"
                        >
                          {level}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Per-Subject Settings */
                <div className={`rounded-[16px] p-5 space-y-8 ${isDark ? 'bg-[#161C26]' : 'bg-white'}`}>
                  {/* Subject Heading inside content area only */}
                  <div>
                    <h3 className={`text-[17px] font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {currentSubject.name}
                    </h3>
                    <p className="text-[#8492A6]/60 text-[12px] font-medium">
                      {(chaptersMap[currentSubject._id] || []).filter(c => selectedChapters.includes(c._id)).length} chapters selected
                    </p>
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-4">
                    <h3 className={`text-[17px] font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Number of questions</h3>
                    <div className="flex flex-wrap gap-3">
                      {(() => {
                        const sName = currentSubject.name.toLowerCase();
                        const isBio = sName.includes('biol') || sName.includes('bio');
                        let qOptions = isBio ? [25, 50, 75, 100] : [15, 25, 40, 50];
                        if (activeSubjects.length === 1) {
                          qOptions = [...qOptions, 'Unlimited'];
                        }
                        const currentQ = subjectQuestions[currentSubject._id] || 25;
                        return qOptions.map(num => {
                          const isSel = currentQ === num;
                          return (
                            <motion.button
                              key={num}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                setSubjectQuestions(prev => ({
                                  ...prev,
                                  [currentSubject._id]: num
                                }));
                              }}
                              animate={{
                                borderColor: isSel ? '#3B82F6' : (isDark ? '#2A3441' : 'transparent'),
                                backgroundColor: isSel ? 'rgba(59,130,246,0.1)' : (isDark ? 'rgba(0,0,0,0)' : '#F1F5F9'),
                                color: isSel ? '#3B82F6' : (isDark ? '#E2E8F0' : '#475569')
                              }}
                              className="px-6 py-2.5 rounded-full border text-[14px] font-semibold transition-all cursor-pointer shadow-none"
                            >
                              {num}
                            </motion.button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div className="space-y-4">
                    <h3 className={`text-[17px] font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Time limit</h3>
                    <div className="flex flex-wrap gap-3">
                      {(() => {
                        const isMathOrBio = currentSubject.name.toLowerCase().includes('math') || currentSubject.name.toLowerCase().includes('biol');
                        let timeOptions = isMathOrBio ? [15, 30, 45, 60, 90] : [10, 20, 30, 45];
                        if (activeSubjects.length === 1) {
                          timeOptions = [...timeOptions, 'Unlimited'];
                        }
                        const currentTime = subjectTimes[currentSubject._id] || (isMathOrBio ? 45 : 30);
                        return timeOptions.map(t => {
                          const isSel = currentTime === t;
                          return (
                            <motion.button
                              key={t}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                setSubjectTimes(prev => ({
                                  ...prev,
                                  [currentSubject._id]: t
                                }));
                              }}
                              animate={{
                                borderColor: isSel ? '#3B82F6' : (isDark ? '#2A3441' : 'transparent'),
                                backgroundColor: isSel ? 'rgba(59,130,246,0.1)' : (isDark ? 'rgba(0,0,0,0)' : '#F1F5F9'),
                                color: isSel ? '#3B82F6' : (isDark ? '#E2E8F0' : '#475569')
                              }}
                              className="px-6 py-2.5 rounded-full border text-[14px] font-semibold transition-all cursor-pointer shadow-none"
                            >
                              {t === 'Unlimited' ? 'Unlimited' : `${t} min`}
                            </motion.button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flat Bottom Navigation Bar */}
        <div className={`fixed bottom-0 left-0 right-0 p-5 z-50 flex gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`}>
          <button
            onClick={() => {
              if (subStep > 0) {
                setSubStep(subStep - 1);
              } else {
                setStep(1);
              }
            }}
            className={`flex-1 py-3 border rounded-[12px] font-semibold text-[16px] transition-all active:scale-[0.98] ${isDark
              ? 'border-[#2A3441]  text-white hover:bg-white/5'
              : 'border-transparent bg-[#E2E8F0] text-[#475569] shadow-none hover:bg-slate-200'
              }`}
          >
            Prev
          </button>
          <button
            onClick={handleNextOrStart}
            className="flex-1 py-3 bg-[#2563EB] text-white rounded-[12px] font-semibold text-[16px] transition-all active:scale-[0.98] hover:bg-[#1D4ED8]"
          >
            {ctaText}
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 1: Selection ---
  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#F8FAFF] text-[#1E293B]'}`}>
      {/* FIXED HEADER */}
      <div className={`sticky top-0 z-40  px-5 flex flex-col gap-2 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`} style={{ paddingTop: STATUS_BAR_H + 10 }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToApp}
            className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={`text-[21px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Create practice</h1>
        </div>

        <div className="relative mt-2 mb-3">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} size={20} />
          <input
            type="text"
            placeholder="Search for a test"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-3.5 pl-12 pr-4 bg-transparent rounded-[24px] text-[15px] focus:outline-none focus:border-[#3B82F6] transition-colors ${isDark
              ? 'border border-[#2A3441] text-white placeholder-[#8492A6]'
              : 'bg-white text-slate-800 placeholder-slate-400 shadow-none'
              }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 space-y-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-[76px] animate-pulse rounded-[16px] ${isDark ? 'bg-[#161C26]' : 'bg-slate-200'}`} />
            ))}
          </div>
        ) : filteredSubjects.length === 0 ? (
          <p className={`text-center mt-10 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>No subjects or chapters found.</p>
        ) : (
          filteredSubjects.map(subj => {
            const chaps = chaptersMap[subj._id] || [];
            const selectedCount = chaps.filter(c => selectedChapters.includes(c._id)).length;
            const isFullySelected = chaps.length > 0 && selectedCount === chaps.length;
            const isPartiallySelected = selectedCount > 0 && selectedCount < chaps.length;

            const matchesSearchChapter = searchQuery !== '' && chaps.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
            const isExpanded = expandedSubject === subj._id || matchesSearchChapter;

            const displayChaps = chaps.filter(c =>
              searchQuery === '' || c.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const isMath = subj.name.toLowerCase().includes('math');
            const isBio = subj.name.toLowerCase().includes('biol') || subj.name.toLowerCase().includes('bio');
            const isDisabled = (isMath && isBioSelected) || (isBio && isMathSelected);

            return (
              <div
                key={subj._id}
                className={`rounded-[16px] overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#161C26]' : 'bg-white shadow-none border-0'
                  } ${isDisabled ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''
                  }`}
              >
                <div
                  className="flex items-center px-4 py-4 cursor-pointer"
                  onClick={() => setExpandedSubject(isExpanded ? null : subj._id)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSubject(subj._id); }}
                    className={`w-[22px] h-[22px] rounded-[6px] mr-4 flex-shrink-0 flex items-center justify-center transition-all ${isFullySelected || isPartiallySelected
                      ? 'bg-[#2563EB] border-[2px] border-[#2563EB]'
                      : (isDark ? 'border-[2px] border-[#8492A6] bg-transparent' : 'border-[2px] border-slate-300 bg-transparent')
                      }`}
                  >
                    {isFullySelected && <Check size={14} color="#fff" strokeWidth={3} />}
                    {!isFullySelected && isPartiallySelected && <Minus size={14} color="#fff" strokeWidth={3.5} />}
                  </button>

                  <div className="flex-1">
                    <h3 className={`text-[17px] font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{subj.name}</h3>
                    <p className={`text-[13px] font-medium mt-0.5 ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                      {chaps.length} chapters • {selectedCount}/{chaps.length} selected
                    </p>
                  </div>

                  <div className={`ml-3 ${isDark ? 'text-white' : 'text-slate-500'}`}>
                    {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </div>
                </div>

                {isExpanded && displayChaps.length > 0 && (
                  <div className={`pb-3 pl-4 border-t ${isDark ? 'border-slate-800/60' : 'border-transparent'}`}>
                    {displayChaps.map(chap => {
                      const isChapSel = selectedChapters.includes(chap._id);
                      return (
                        <div
                          key={chap._id}
                          onClick={() => toggleChapter(subj._id, chap._id)}
                          className="flex items-center px-4 py-3 cursor-pointer"
                        >
                          <button
                            className={`w-[22px] h-[22px] rounded-[6px] mr-4 flex-shrink-0 flex items-center justify-center transition-all ${isChapSel
                              ? 'bg-[#2563EB] border-[2px] border-[#2563EB]'
                              : (isDark ? 'border-[2px] border-[#8492A6] bg-transparent' : 'border-[2px] border-slate-300 bg-transparent')
                              }`}
                          >
                            {isChapSel && <Check size={14} color="#fff" strokeWidth={3} />}
                          </button>
                          <div className="flex-1 text-[16px] font-semibold leading-snug tracking-wide">
                            <span className={isDark ? 'text-white' : 'text-slate-700'}>{chap.name}</span>
                            <div className={`text-[13px] font-normal mt-0.5 tracking-normal ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                              0/{chap.topicCount || 10} completed
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className={`fixed bottom-0 left-0 right-0 p-5 z-50 flex flex-col items-center ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`}>
        {selectedChapters.length > 0 && (
          <p className="text-[#8492A6]/60 text-[12px] font-medium mb-3">
            {selectedChapters.length} chapter{selectedChapters.length !== 1 ? 's' : ''} selected
          </p>
        )}
        <button
          onClick={() => {
            setSubStep(0);
            setStep(2);
          }}
          className={`w-full py-3 rounded-[12px] font-semibold text-[16px] transition-all ${selectedChapters.length > 0
            ? 'bg-[#2563EB] text-white active:scale-[0.98]'
            : (isDark ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
