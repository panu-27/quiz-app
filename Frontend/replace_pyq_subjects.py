import re

with open('src/student/PYQExplorer.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '    // ── SUBJECTS LIST VIEW ──────────────────────────────────────────────'
end_marker = '    // ── CHAPTER QUESTIONS VIEW ──────────────────────────────────────────'

si = content.find(start_marker)
ei = content.find(end_marker)

if si == -1 or ei == -1:
    print('ERROR: markers not found')
    exit(1)

new_block = r"""    // ── SUBJECTS / CHAPTERS LIST VIEW ───────────────────────────────────
    if (!activeChapter) {
        const goal = localStorage.getItem("selectedGoal") || "MHT CET";
        const subjects = [
            {
                id: '69a6be2794b749c00e88cd23',
                name: 'Physics',
                count: '6813 QS',
                iconBg: 'bg-[#F97316]',
                icon: <Atom size={20} className="text-white" />,
            },
            {
                id: '69a6be2794b749c00e88cd24',
                name: 'Chemistry',
                count: '4550 QS',
                iconBg: 'bg-[#10B981]',
                icon: <FlaskConical size={20} className="text-white" />,
            },
            {
                id: '69a6be2794b749c00e88cd25',
                name: 'Maths',
                count: '8936 QS',
                iconBg: 'bg-[#3B82F6]',
                icon: <MathIcon />,
            },
            {
                id: '69a6be2794b749c00e88cd26',
                name: 'Biology',
                count: '5796 QS',
                iconBg: 'bg-[#EC4899]',
                icon: <Dna size={20} className="text-white" />,
            },
        ];

        const isDark = theme === 'dark';

        // Counsellor popup shared helper
        const CounsellorPopup = () => showCounsellorPopup ? (
            <div
                className="fixed inset-0 z-[9999] flex items-end justify-center"
                onClick={() => setShowCounsellorPopup(false)}
            >
                <div className="absolute inset-0 bg-black/65" style={{ backdropFilter: 'blur(3px)' }} />
                <div
                    className="relative w-full max-w-md bg-[#111827] overflow-hidden"
                    style={{ borderRadius: '12px 12px 0 0' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-center pt-4 pb-3">
                        <div className="w-10 h-1 rounded-full bg-white/20" />
                    </div>
                    <div className="px-6 pt-8 pb-2">
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-white font-black leading-tight" style={{ fontSize: 19 }}>
                                    Need help with your subscription?
                                </h2>
                                <p className="text-white/55 text-[12px] mt-2 leading-relaxed">
                                    Talk to our experts who will guide you with all you need to crack it.
                                </p>
                            </div>
                            <div className="w-[68px] h-[68px] rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10 bg-[#1F2937]">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=counsellorF&backgroundColor=b6e3f4&clothingColor=3c4f5c" className="w-full h-full object-cover" alt="Expert" />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 pt-6 pb-3">
                        <a href="tel:+918585858585" className="w-full flex items-center justify-center gap-3 bg-white active:scale-95 transition-transform" style={{ borderRadius: 8, padding: '14px 24px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span className="font-bold text-[#111827]" style={{ fontSize: 15 }}>+91 8585858585</span>
                        </a>
                    </div>
                    <div className="px-6 pb-12">
                        <button onClick={() => setShowCounsellorPopup(false)} className="w-full flex items-center justify-center gap-1.5 py-4 text-white font-bold tracking-widest active:opacity-70 transition-opacity" style={{ fontSize: 11.5, letterSpacing: '0.08em' }}>
                            GET A CALL FROM US <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        ) : null;

        // ══════════════════════════════════════════════════════
        // CHAPTERS LIST VIEW (subject selected, no chapter yet)
        // ══════════════════════════════════════════════════════
        if (activeSubjectId) {
            const sub = subjects.find(s => s.id === activeSubjectId);
            const allChaps = chaptersMap[activeSubjectId] || [];

            const displayChaps = allChaps.filter((chap, idx) => {
                const matchesSearch = searchSubject === '' || chap.name.toLowerCase().includes(searchSubject.toLowerCase());
                if (!matchesSearch) return false;
                const { totalQs, solvedQs } = getChapterStats(chap, idx);
                if (chapterTab === 'completed') return solvedQs === totalQs;
                if (chapterTab === 'unattempted') return solvedQs < totalQs;
                return true;
            });

            return (
                <div
                    className={`fixed inset-0 z-[600] flex flex-col font-sans ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#F8FAFF] text-[#1E293B]'}`}
                >
                    {/* Sticky Header */}
                    <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`} style={{ paddingTop: STATUS_BAR_H + 8 }}>
                        <button
                            onClick={() => { setActiveSubjectId(null); setSearchSubject(''); }}
                            className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                            <ArrowLeft size={24} />
                        </button>

                        <div>
                            <h1 className={`text-[26px] font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {sub ? sub.name : 'Chapters'}
                            </h1>
                            <p className={`text-[14px] font-medium ${isDark ? 'text-[#8492A6]' : 'text-slate-500'}`}>
                                Select a chapter to explore PYQs
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} size={18} />
                            <input
                                type="text"
                                placeholder="Search chapters..."
                                value={searchSubject}
                                onChange={e => setSearchSubject(e.target.value)}
                                className={`w-full py-3.5 pl-12 pr-4 rounded-[24px] text-[15px] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                                    isDark
                                        ? 'border border-[#2A3441] text-white placeholder-[#8492A6]'
                                        : 'bg-white text-slate-800 placeholder-slate-400 shadow-none'
                                }`}
                            />
                        </div>

                        {/* Tab filter */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar -mt-1">
                            {['all', 'completed', 'unattempted'].map(tab => {
                                const label = tab === 'all' ? 'All' : tab === 'completed' ? 'Completed' : 'Unattempted';
                                const isActive = chapterTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setChapterTab(tab)}
                                        className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all whitespace-nowrap flex-shrink-0 ${
                                            isActive
                                                ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                                : isDark
                                                    ? 'border-[#2A3441] text-[#8492A6]'
                                                    : 'border-transparent bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chapters List */}
                    <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-3 no-scrollbar">
                        {chaptersLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-[76px] animate-pulse rounded-[16px] ${isDark ? 'bg-[#161C26]' : 'bg-slate-200'}`} />
                                ))}
                            </div>
                        ) : displayChaps.length === 0 ? (
                            <p className={`text-center mt-10 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>
                                No chapters found.
                            </p>
                        ) : (
                            displayChaps.map((chap) => {
                                const originalIdx = allChaps.findIndex(c => c._id === chap._id);
                                const { totalQs, solvedQs } = getChapterStats(chap, originalIdx);
                                const pct = totalQs > 0 ? Math.round((solvedQs / totalQs) * 100) : 0;
                                return (
                                    <div
                                        key={chap._id}
                                        onClick={() => enterChapter(chap, activeSubjectId)}
                                        className={`flex items-center px-4 py-4 rounded-[16px] cursor-pointer active:scale-[0.99] transition-all ${
                                            isDark ? 'bg-[#161C26]' : 'bg-white shadow-none'
                                        }`}
                                    >
                                        {/* Number badge */}
                                        <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 mr-4 text-[12px] font-black ${
                                            isDark ? 'bg-[#1F2937] text-[#64748B]' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {originalIdx + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-[16px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                {chap.name}
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
                        )}
                    </div>

                    <CounsellorPopup />
                </div>
            );
        }

        // ══════════════════════════════════════════════════════
        // SUBJECTS LIST (top level — CreatePractice Step 1 style)
        // ══════════════════════════════════════════════════════
        const filteredSubjects = subjects.filter(sub =>
            sub.name.toLowerCase().includes(searchSubject.toLowerCase())
        );

        return (
            <div
                className={`fixed inset-0 z-[600] flex flex-col font-sans ${isDark ? 'bg-[#0E131F] text-white' : 'bg-[#F8FAFF] text-[#1E293B]'}`}
            >
                {/* Sticky Header */}
                <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0E131F]' : 'bg-[#F8FAFF]'}`} style={{ paddingTop: STATUS_BAR_H + 8 }}>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/student')}
                            className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <button
                            onClick={() => setShowCounsellorPopup(true)}
                            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold active:scale-95 transition-all ${
                                isDark ? 'bg-[#121A28] border-[#1e293b] text-white/70' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                        >
                            <Phone size={12} /> Talk to counsellor
                        </button>
                    </div>

                    <div>
                        <h1 className={`text-[26px] font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>PYQ Explorer</h1>
                        <p className={`text-[14px] font-medium ${isDark ? 'text-[#8492A6]' : 'text-slate-500'}`}>Select a subject to explore past questions</p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchSubject}
                            onChange={e => setSearchSubject(e.target.value)}
                            className={`w-full py-3.5 pl-12 pr-4 rounded-[24px] text-[15px] focus:outline-none focus:border-[#3B82F6] transition-colors ${
                                isDark
                                    ? 'border border-[#2A3441] text-white placeholder-[#8492A6]'
                                    : 'bg-white text-slate-800 placeholder-slate-400 shadow-none'
                            }`}
                        />
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 pb-32 space-y-3 no-scrollbar">
                    {/* Bookmarks & Progress quick cards */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div
                            onClick={() => navigate('/student/pyq/bookmarks')}
                            className={`rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all border flex flex-col justify-between min-h-[80px] ${
                                isDark ? 'bg-[#1E1B4B]/30 border-[#312E81]/50 text-[#C7D2FE]' : 'bg-[#EEF2FF] border-[#C7D2FE] text-[#312E81]'
                            }`}
                        >
                            <div className={`p-2 rounded-xl w-fit ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-extrabold text-[13px] leading-tight mt-2">Bookmarks</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-60">{bookmarks.length} Saved</p>
                            </div>
                        </div>
                        <div
                            onClick={() => navigate('/student/pyq/progress')}
                            className={`rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all border flex flex-col justify-between min-h-[80px] ${
                                isDark ? 'bg-[#2C1605]/30 border-[#431407]/50 text-[#FFEDD5]' : 'bg-[#FFF7ED] border-[#FFEDD5] text-[#7C2D12]'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-2 rounded-xl ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                                    <BarChart2 size={16} />
                                </div>
                                <span className="bg-[#EF4444] text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
                            </div>
                            <div>
                                <p className="font-extrabold text-[13px] leading-tight mt-2">My Progress</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-60">View Stats</p>
                            </div>
                        </div>
                    </div>

                    {/* Subject cards — plain buttons like CreatePractice Step 1 */}
                    {filteredSubjects.length === 0 ? (
                        <p className={`text-center mt-10 ${isDark ? 'text-[#64748B]' : 'text-slate-400'}`}>No subjects found.</p>
                    ) : (
                        filteredSubjects.map(sub => {
                            const allChaps = chaptersMap[sub.id] || [];
                            return (
                                <div
                                    key={sub.id}
                                    onClick={() => { setActiveSubjectId(sub.id); setSearchSubject(''); setChapterTab('all'); }}
                                    className={`flex items-center px-4 py-4 rounded-[16px] cursor-pointer active:scale-[0.99] transition-all ${
                                        isDark ? 'bg-[#161C26]' : 'bg-white shadow-none'
                                    }`}
                                >
                                    {/* Colored icon box */}
                                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 ${sub.iconBg}`}>
                                        {sub.icon}
                                    </div>

                                    <div className="flex-1 ml-4">
                                        <h3 className={`text-[17px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{sub.name}</h3>
                                        <p className={`text-[13px] font-medium mt-0.5 ${isDark ? 'text-[#8492A6]' : 'text-slate-400'}`}>
                                            {chaptersLoading ? 'Loading...' : allChaps.length + ' chapters'} • {sub.count}
                                        </p>
                                    </div>

                                    <ChevronRight size={22} className={isDark ? 'text-[#2A3441]' : 'text-slate-300'} />
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Bottom Prime CTA (unapproved only) */}
                {!isApproved && (
                    <div className="fixed left-0 right-0 z-[400] bottom-4">
                        <div className="bg-gradient-to-r from-[#7A41F7] to-[#6330E3] flex items-center justify-between px-5 py-3.5">
                            <div>
                                <p className="text-white font-bold text-[13px]">5 free questions available</p>
                                <p className="text-white/60 text-[11px]">Get unlimited access with Prime.</p>
                            </div>
                            <button className="bg-white text-[#7A41F7] font-bold text-[12px] px-4 py-2.5 rounded-xl flex-shrink-0">Join Prime</button>
                        </div>
                    </div>
                )}

                <CounsellorPopup />
            </div>
        );
    }

"""

new_content = content[:si] + new_block + content[ei:]

with open('src/student/PYQExplorer.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done! New file size:', len(new_content))
