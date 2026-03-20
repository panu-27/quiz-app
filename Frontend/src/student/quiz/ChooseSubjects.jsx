import { useState, useEffect } from 'react';
import { Check, X, ChevronRight, Clock, ListOrdered, ArrowLeft, CalendarDays } from 'lucide-react';
import { fetchSubjects } from './quizApi';
import { useQuizNav } from './QuizAtoms';

const SUBJECT_CONFIG = {
    Physics: { emoji: '⚛️', accent: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
    Chemistry: { emoji: '🧪', accent: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
    Biology: { emoji: '🔬', accent: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
    Mathematics: { emoji: '📐', accent: '#9333EA', bg: '#FDF4FF', border: '#E9D5FF' },
};

const ChooseSubjects = ({ onConfirm }) => {
    const [subjects, setSubjects] = useState([]);
    const [picked, setPicked] = useState([]);
    const [view, setView] = useState('grid');
    const [totalTime, setTotalTime] = useState(90);
    const [subjectCounts, setSubjectCounts] = useState({});
    const [yearRange, setYearRange] = useState({ min: 2004, max: 2025 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const subjectsData = await fetchSubjects();
                const enriched = subjectsData.map(s => ({
                    ...s,
                    ...(SUBJECT_CONFIG[s.name] || { emoji: '📚', accent: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' }),
                }));
                setSubjects(enriched);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggle = (id) => {
        setPicked(p => {
            if (p.includes(id)) return p.filter(x => x !== id);
            const isMath = subjects.find(s => s._id === id)?.name?.toLowerCase().includes('math');
            const isBio = subjects.find(s => s._id === id)?.name?.toLowerCase().includes('biol');
            if (isMath) return [...p.filter(x => !subjects.find(s => s._id === x)?.name?.toLowerCase().includes('biol')), id];
            if (isBio) return [...p.filter(x => !subjects.find(s => s._id === x)?.name?.toLowerCase().includes('math')), id];
            return [...p, id];
        });
    };

    const enterSettings = () => {
        const initialCounts = {};
        picked.forEach(id => { initialCounts[id] = 50; });
        setSubjectCounts(initialCounts);
        setView('settings');
    };

    const handleFinalConfirm = () => {
        onConfirm({
            subjectIds: picked,
            yearRange,
            totalTime,
            subjectWiseCounts: subjectCounts,
            subjectObjects: subjects.filter(s => picked.includes(s._id)),
        });
    };

    useQuizNav('subject', picked.length > 0, view === 'grid' ? enterSettings : handleFinalConfirm);

    // Skeleton Component
    const SkeletonCard = () => (
        <div className="rounded-[24px] border-2 border-[#F3F4F6] bg-white p-5 flex flex-col min-h-[145px] animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-[14px] bg-gray-100" />
                <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-gray-100" />
            </div>
            <div className="mt-auto">
                <div className="h-5 w-24 bg-gray-100 rounded-md mb-2" />
                <div className="h-3 w-16 bg-gray-50 rounded-md" />
            </div>
        </div>
    );

    if (view === 'settings') {
        return (
            <div className="flex flex-col h-full qf-slide-right px-1">
                <button onClick={() => setView('grid')} className="flex items-center gap-2 text-indigo-500 font-bold mb-4">
                    <ArrowLeft size={18} /> Change Subjects
                </button>
                <h2 className="qf-display text-2xl font-black text-gray-900 mb-1">Final Settings</h2>
                <p className="text-gray-400 text-sm mb-6">Set time and question limits</p>
                <div className="space-y-6 overflow-y-auto no-scrollbar flex-1 pb-24">
                    {/* Settings Content... */}
                    <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                            <Clock size={16} /> Total Test Duration
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[30, 60, 90, 180].map(t => (
                                <button key={t} onClick={() => setTotalTime(t)}
                                    className={`py-2.5 rounded-xl font-bold text-xs transition-all ${totalTime === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}>
                                    {t}m
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1 text-orange-500 font-bold text-xs uppercase tracking-wider">
                            <ListOrdered size={16} /> Question Distribution
                        </div>
                        {picked.map(id => {
                            const subj = subjects.find(s => s._id === id);
                            const isBiology = subj?.name?.toLowerCase().includes('biol');
                            const options = isBiology ? [25, 50, 100] : [15, 25, 50];
                            return (
                                <div key={id} className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg">{subj?.emoji}</span>
                                        <span className="font-bold text-sm text-gray-800">{subj?.name}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {options.map(val => (
                                            <button key={val} onClick={() => setSubjectCounts(prev => ({ ...prev, [id]: val }))}
                                                className={`flex-1 min-w-[60px] py-2 rounded-xl font-bold text-xs transition-all ${subjectCounts[id] === val ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                                                {val} Qs
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Desktop CTA */}
                <div className="hidden sm:block pt-4 pb-6">
                    <button className="qf-continue-btn" onClick={handleFinalConfirm}>
                        Begin Test <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* ── STICKY HEADER AREA ── */}
            <div className="sticky top-0 z-20 bg-white pb-4">
                <div className="mb-5">
                    <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-1">Step 1 of 3</p>
                    <h2 className="qf-display text-[22px] font-bold text-gray-900 tracking-tight">Choose Subjects</h2>
                </div>

                {/* 📅 YEAR RANGE SELECTOR (Tucks at top) */}
                <div style={{ background: '#F5F3FF', borderRadius: '24px', border: '2px solid #DDD6FE', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <CalendarDays size={18} className="text-indigo-600" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            PYQ Year Range (2004-2025)
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <select
                            value={yearRange.min}
                            disabled={loading}
                            onChange={(e) => {
                                const newMin = parseInt(e.target.value);
                                setYearRange({ min: newMin, max: Math.max(newMin, yearRange.max) });
                            }}
                            className="flex-1 bg-white border-[1.5px] border-gray-200 rounded-[12px] p-3 text-base font-bold text-center outline-none text-[#1E293B]"
                        >
                            {Array.from({ length: 2025 - 2004 + 1 }, (_, i) => 2004 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <div style={{ fontWeight: 800, color: '#DDD6FE' }}>—</div>
                        <select
                            value={yearRange.max}
                            disabled={loading}
                            onChange={(e) => setYearRange({ ...yearRange, max: parseInt(e.target.value) })}
                            className="flex-1 bg-white border-[1.5px] border-gray-200 rounded-[12px] p-3 text-base font-bold text-center outline-none text-[#1E293B]"
                        >
                            {Array.from({ length: 2025 - 2004 + 1 }, (_, i) => 2004 + i)
                                .filter(year => year >= yearRange.min)
                                .map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
            </div>

            {/* ── SCROLLABLE GRID ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {loading ? (
                        [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        subjects.map((subj, i) => {
                            const isSel = picked.includes(subj._id);
                            const subjName = subj.name?.toLowerCase() || '';
                            const hasMath = picked.some(id => subjects.find(x => x._id === id)?.name?.toLowerCase().includes('math'));
                            const hasBio = picked.some(id => subjects.find(x => x._id === id)?.name?.toLowerCase().includes('biol'));
                            const isExcluded = (hasMath && subjName.includes('biol')) || (hasBio && subjName.includes('math'));

                            if (isExcluded) return (
                                <div key={subj._id} className="rounded-[24px] border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center p-4 opacity-40 min-h-[145px]">
                                    <X size={18} className="text-gray-300 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-400 text-center uppercase leading-tight">{subj.name}<br />Excluded</p>
                                </div>
                            );

                            return (
                                <button key={subj._id} onClick={() => toggle(subj._id)}
                                    style={{ 
                                        background: isSel ? subj.accent : '#FFF', 
                                        border: isSel ? `2px solid ${subj.accent}` : `2px solid ${subj.bg}`,
                                        animationDelay: `${i * 50}ms` 
                                    }}
                                    className={`qf-slide-up relative rounded-[24px] p-5 text-left flex flex-col min-h-[145px] transition-all active:scale-95 duration-200 ${isSel ? 'translate-y-[-2px] shadow-lg' : 'shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center text-2xl`} style={{ background: isSel ? 'rgba(255,255,255,0.2)' : subj.bg }}>{subj.emoji}</div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSel ? 'bg-white/30 scale-110' : 'border-2 border-dashed opacity-20'}`} style={{ borderColor: isSel ? 'transparent' : subj.accent }}>
                                            <Check size={12} color={isSel ? '#fff' : subj.accent} strokeWidth={4} />
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <h5 className={`text-[17px] font-extrabold leading-tight mb-1 ${isSel ? 'text-white' : 'text-gray-900'}`}>{subj.name}</h5>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSel ? 'text-white/80' : 'text-gray-400'}`}>{subj.chapters} chapters</span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── FLOATING CTA ── */}
            {picked.length > 0 && (
                <div className="fixed bottom-8 left-5 right-5 z-30 sm:static sm:mt-4">
                    <button className="qf-continue-btn w-full" onClick={enterSettings} style={{ borderRadius: '18px' }}>
                        Next <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChooseSubjects;