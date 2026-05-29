import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Search, ShoppingBag, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STATUS_BAR_H = 43.5;

/* ── Fonts & Animations (matching TestHistory) ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap');
    * { font-family: 'DM Sans', sans-serif; }
    .font-display { font-family: 'Sora', sans-serif; }
  `}</style>
);

export default function MyLearning() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', 'Ongoing', 'Completed'];

  // Enrolled courses — swap with real API data when available
  const enrolledCourses = [];

  const filteredCourses = enrolledCourses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <GlobalStyles />
      <div className={`min-h-screen pb-28 transition-colors duration-300 ${isDark ? 'dark bg-[#0B101A] text-white' : 'bg-[#F4F7FC] text-slate-900'}`}>

        {/* ══ MOBILE LAYOUT ══ */}
        <div className="md:hidden relative">

          {/* Top Header Background — matching TestHistory deep blue */}
          <div className="absolute top-0 left-0 right-0 h-[230px] bg-gradient-to-br from-[#0E2E5D] to-[#041A3A] dark:from-[#0B121C] dark:to-[#040810] rounded-b-lg overflow-hidden pointer-events-none z-0 transition-colors duration-300">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
          </div>

          {/* Header Row */}
          <div className="relative z-10 px-4 flex flex-col gap-3" style={{ paddingTop: STATUS_BAR_H + 16 }}>
            <div className="flex items-center justify-between pb-1">
              <span className="text-[20px] font-black tracking-tight text-white font-display">
                My Learning
              </span>
            </div>

            {/* Search bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10" size={17} />
              <input
                type="text"
                placeholder="Search my courses"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-semibold outline-none bg-white/10 text-white placeholder-white/50 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-1 pb-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                    activeFilter === f 
                      ? 'bg-white text-slate-900 border-white shadow-sm'
                      : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/20'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <main className="px-4 mt-6 relative z-10 space-y-4">

            {filteredCourses.length > 0 ? (
              /* ── Course cards ── */
              <div className="space-y-3">
                {filteredCourses.map(course => (
                  <div
                    key={course._id}
                    className="relative overflow-hidden bg-white dark:bg-[#111827] rounded-[20px] border border-slate-200 dark:border-white/[0.06] shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition-all duration-300 active:scale-[0.99]"
                  >
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#25D3A4]/15 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={22} className="text-[#25D3A4]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
                          {course.title}
                        </h4>
                        <p className="text-[12px] text-slate-500 dark:text-white/55 mt-0.5 font-medium">
                          {course.educator}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-[11px] font-bold text-slate-500 dark:text-white/50">
                            <Clock size={11} /> {course.lessonsCount} lessons
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 dark:text-slate-700 mt-1 flex-shrink-0" />
                    </div>
                  </div>
                ))}

                {/* Explore Store — small, at bottom when courses exist */}
                <div className="flex justify-center pt-2 pb-2">
                  <button
                    onClick={() => navigate('/student/store')}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#25D3A4]/15 border border-[#25D3A4]/30 active:scale-95 transition-all"
                  >
                    <ShoppingBag size={13} className="text-[#1EBA9B]" />
                    <span className="text-[#1EBA9B] font-bold text-[12px]">Explore Store</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ── Professional Empty State ── */
              <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 'calc(100vh - 380px)' }}>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 blur-2xl rounded-full" />
                  <div className="w-24 h-24 bg-gradient-to-br from-white to-slate-50 dark:from-[#1E293B] dark:to-[#0F172A] rounded-[24px] flex items-center justify-center relative z-10 border border-slate-200 dark:border-white/5 shadow-xl">
                    <BookOpen size={40} className="text-slate-300 dark:text-slate-500" />
                    <div className="absolute -bottom-2 -right-2 bg-[#2563EB] w-9 h-9 rounded-full flex items-center justify-center border-4 border-[#F4F7FC] dark:border-[#0B101A] shadow-md">
                      <Search size={14} className="text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-[19px] font-bold text-slate-900 dark:text-white mb-2 font-display">No courses yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium max-w-[260px] mb-8 leading-relaxed">
                  You haven't enrolled in any courses. Explore the store to find your next learning journey.
                </p>
                
                <button
                  onClick={() => navigate('/student/store')}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#2563EB] text-white font-bold text-[14px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <ShoppingBag size={16} />
                  Explore Store
                </button>
              </div>
            )}
          </main>
        </div>

        {/* ══ DESKTOP LAYOUT ══ */}
        <div className="hidden md:flex flex-col min-h-screen">
          <div className="max-w-4xl mx-auto w-full px-8 py-10 flex-1 flex flex-col gap-6">

            <div className="flex items-center gap-3">
              <PlayCircle className="text-[#25D3A4] w-7 h-7" />
              <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">My Learning</h1>
            </div>

            {filteredCourses.length > 0 ? (
              <div className="space-y-4">
                {filteredCourses.map(course => (
                  <div key={course._id} className="bg-white dark:bg-[#121A28] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-[#25D3A4]/15 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={26} className="text-[#25D3A4]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[17px] font-extrabold text-slate-900 dark:text-white">{course.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">{course.educator}</p>
                    </div>
                    <ChevronRight className="text-slate-300 dark:text-slate-700" size={20} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 text-center w-full">
                <PlayCircle size={48} className="text-slate-400/80 mb-4" />
                <p className="text-slate-400 text-sm font-bold">No enrolled courses</p>
                <p className="text-slate-500 text-[12px] mt-1">
                  You haven't enrolled in any courses yet
                </p>
              </div>
            )}

            {/* Always shown at bottom */}
            <button
              onClick={() => navigate('/student/store')}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#25D3A4] hover:bg-[#1EBA9B] text-slate-900 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 transition-all w-fit mx-auto"
            >
              <ShoppingBag size={16} />
              Explore Store
            </button>

          </div>
        </div>

      </div>
    </>
  );
}
