import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Search, ShoppingBag, Phone, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import StudentHeader from './StudentHeader';
import CounsellorModal from '../components/CounsellorModal';

const COURSES = [
  {
    id: 1,
    type: 'LIVE',
    badgeColor: '#22c55e',
    lang: 'हि',
    langFull: 'Hinglish',
    category: 'CRASH COURSE',
    categoryColor: '#7A41F7',
    title: 'Champs Crash Course for JEE Advanced 2026',
    started: 'Started on 10 Apr',
    meta: '65 live classes · 3 mock tests',
    price: '₹1,578',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80',
    bg: ['#FBBF24', '#F97316'],
    seeds: ['s1', 's2', 's3', 's4'],
    educator: { name: 'Arvind Kalia Sir', seed: 'arvind', rating: 4.8, students: '1.2L' },
  },
  {
    id: 2,
    type: 'RECORDED',
    badgeColor: '#64748b',
    lang: 'हि',
    langFull: 'Hinglish',
    category: 'PARTIAL SYLLABUS',
    categoryColor: '#06B6D4',
    title: 'Matrices and Determinants by Arvind Sir',
    started: null,
    meta: '14 recorded classes',
    price: '₹1',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
    bg: ['#0F172A', '#1E293B'],
    seeds: ['t1'],
    educator: { name: 'Arvind Sir', seed: 'arvind2', rating: 4.7, students: '85K' },
  },
  {
    id: 3,
    type: 'LIVE',
    badgeColor: '#22c55e',
    lang: 'EN',
    langFull: 'English',
    category: 'FULL SYLLABUS',
    categoryColor: '#F59E0B',
    title: 'IOQM 2026 Course By PJ Sir',
    started: 'Started on 13 Apr',
    meta: '60 live classes · 10 mock tests',
    price: '₹4,209',
    image: 'https://images.unsplash.com/photo-1453733190148-c44698c26578?auto=format&fit=crop&w=400&q=80',
    bg: ['#4C1D95', '#7C3AED'],
    seeds: ['u1'],
    educator: { name: 'PJ Sir', seed: 'pjsir', rating: 4.9, students: '2.1L' },
  },
  {
    id: 4,
    type: 'LIVE',
    badgeColor: '#22c55e',
    lang: 'हि',
    langFull: 'Hinglish',
    category: 'FULL SYLLABUS',
    categoryColor: '#F59E0B',
    title: 'NEET 2026 Complete Preparation Course',
    started: 'Starting on 1 Jun',
    meta: '120 live classes · 15 mock tests',
    price: '₹2,999',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=400&q=80',
    bg: ['#065F46', '#059669'],
    seeds: ['v1', 'v2'],
    educator: { name: 'Dr. Meena Rao', seed: 'meena', rating: 4.8, students: '3.4L' },
  },
  {
    id: 5,
    type: 'RECORDED',
    badgeColor: '#64748b',
    lang: 'EN',
    langFull: 'English',
    category: 'CRASH COURSE',
    categoryColor: '#7A41F7',
    title: 'MHT-CET 2026 Last 30 Days Crash Course',
    started: null,
    meta: '30 recorded classes · 5 mock tests',
    price: '₹499',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80',
    bg: ['#1E3A5F', '#2563EB'],
    seeds: ['w1'],
    educator: { name: 'Rahul Mehta Sir', seed: 'rahul', rating: 4.6, students: '62K' },
  },
];

const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Newest'];
const SYLLABUS_OPTIONS = ['All', 'Full Syllabus', 'Partial Syllabus', 'Crash Course'];
const STATUS_BAR_H = 28.5;

export default function StudentStore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [sort, setSort] = useState('Relevance');
  const [syllabus, setSyllabus] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Counsellor Modal
  const [showCounsellorModal, setShowCounsellorModal] = useState(false);

  useEffect(() => {
    if (showCounsellorModal) {
      document.body.setAttribute('data-hide-nav', 'true');
    } else {
      document.body.removeAttribute('data-hide-nav');
    }
    return () => {
      document.body.removeAttribute('data-hide-nav');
    };
  }, [showCounsellorModal]);

  const resolveMediaUrl = url => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = window.__API_URL__ ? window.__API_URL__.replace(/\/api$/, '') : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    return `${base}${url}`;
  };

  const goal = localStorage.getItem('selectedGoal') || 'JEE';

  const filtered = COURSES.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchSyl = syllabus === 'All' || c.category.toLowerCase().includes(syllabus.toLowerCase().replace(' syllabus', ''));
    const matchType = typeFilter === 'All' || c.type === typeFilter;
    return matchSearch && matchSyl && matchType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Price: Low to High') {
      const priceA = parseInt(a.price.replace(/[^\d]/g, '')) || 0;
      const priceB = parseInt(b.price.replace(/[^\d]/g, '')) || 0;
      return priceA - priceB;
    }
    if (sort === 'Price: High to Low') {
      const priceA = parseInt(a.price.replace(/[^\d]/g, '')) || 0;
      const priceB = parseInt(b.price.replace(/[^\d]/g, '')) || 0;
      return priceB - priceA;
    }
    if (sort === 'Newest') {
      return b.id - a.id;
    }
    return 0;
  });

  return (
    <div
      className="min-h-screen text-slate-900 dark:text-white transition-colors duration-300"
      style={{ background: isDark ? '#2A2B2D' : '#F1F5F9' }}
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:flex flex-col min-h-screen">
        <StudentHeader />

        <div className="max-w-7xl mx-auto w-full px-8 lg:px-12 2xl:px-20 py-8 flex gap-8 flex-1">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 flex flex-col gap-5">
            {/* Store Info Banner */}
            <div className="rounded-3xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#7A41F7,#25D3A4)' }}>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
              <ShoppingBag size={24} className="mb-3 relative z-10 opacity-90" />
              <p className="font-black text-xl relative z-10 leading-tight">{goal} Store</p>
              <p className="text-[10px] text-white/80 uppercase tracking-widest mt-1.5 relative z-10 font-bold">Premium Batches</p>
            </div>

            {/* Filter Controls Box */}
            <div className="bg-white dark:bg-[#121A28] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 space-y-6">
              {/* Type Filter */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Course Type</p>
                <div className="space-y-1.5">
                  {['All', 'LIVE', 'RECORDED'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${typeFilter === t
                        ? 'bg-purple-50 dark:bg-purple-950/20 text-[#7A41F7] dark:text-[#9B6AF9]'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Syllabus Filter */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Syllabus</p>
                <div className="space-y-1.5">
                  {SYLLABUS_OPTIONS.map(o => (
                    <button
                      key={o}
                      onClick={() => setSyllabus(o)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${syllabus === o
                        ? 'bg-purple-50 dark:bg-purple-950/20 text-[#7A41F7] dark:text-[#9B6AF9]'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Area */}
          <div className="flex-1 flex flex-col min-w-0 gap-6">
            {/* Top Toolbar */}
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7A41F7] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search for courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#121A28] border border-slate-200 dark:border-slate-800/85 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold placeholder:text-slate-450 text-slate-800 dark:text-white focus:border-[#7A41F7] focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-950/20 transition-all outline-none"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="bg-white dark:bg-[#121A28] border border-slate-200 dark:border-slate-800 rounded-full px-5 py-3 text-xs font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Sort by: {sort} <ChevronDown size={14} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-[#121A28] border border-slate-150 dark:border-slate-800 rounded-2xl z-20 py-2 w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                    {SORT_OPTIONS.map(o => (
                      <button
                        key={o}
                        onClick={() => { setSort(o); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${sort === o ? 'text-[#7A41F7] dark:text-[#9B6AF9] bg-purple-50/50 dark:bg-purple-950/20' : 'text-slate-650 dark:text-slate-400'
                          }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses list */}
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#121A28] rounded-3xl border border-slate-100 dark:border-slate-800">
                <span className="text-5xl mb-4">🔍</span>
                <p className="font-bold text-slate-500 text-[15px]">No courses match your filters</p>
                <button
                  onClick={() => { setSearch(''); setSyllabus('All'); setTypeFilter('All'); setSort('Relevance'); }}
                  className="mt-4 text-sm font-bold text-[#7A41F7] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {sorted.reduce((acc, course, index) => {
                  acc.push(
                    <button
                      key={course.id}
                      onClick={() => window.open('https://en.wikipedia.org', '_blank')}
                      className="w-full text-left active:scale-[0.98] transition-transform bg-white dark:bg-[#121A28] rounded-none border border-slate-100 dark:border-slate-800/80 hover:border-purple-100 dark:hover:border-purple-900/40 p-3 flex gap-4 h-[236px] items-center"
                    >
                      {/* Visual Card Image (scaled up from 150x212 to 180x250, card height to 276px) */}
                      <div
                        className="relative w-[180px] h-[250px] flex items-center justify-center overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900"
                        style={{ borderRadius: 8 }}
                      >
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        {/* LIVE badge */}
                        <span
                          className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-none font-black text-white text-[9px] tracking-wider"
                          style={{ background: course.badgeColor }}
                        >
                          {course.type}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="flex-1 flex flex-col justify-center h-[250px] min-w-0 gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-[#2D2F34] text-white text-[10px] font-bold inline-flex items-center justify-center">
                              {course.lang === 'हि' ? 'हिn' : course.lang}
                            </span>
                            <span className="font-extrabold tracking-wider text-[11px] uppercase text-[#3B82F6] dark:text-[#60A5FA]">
                              {course.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-[16px] text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {course.title}
                          </h3>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
                          {course.started && (
                            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                              {course.started}
                            </p>
                          )}
                          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                            {course.meta}
                          </p>
                          <p className="mt-1 font-black text-xl text-slate-950 dark:text-white">
                            {course.price}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                  if ((index + 1) % 3 === 0) {
                    acc.push(
                      <DesktopPromoBanner key={`promo-${index}`} />
                    );
                  }
                  return acc;
                }, [])}
              </div>
            )}


          </div>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Sticky Header with increased height */}
        <div
          className="sticky top-0 z-[300] pb-6 transition-all duration-300 border-b relative overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(57, 77, 102, 0.15), transparent 60%), linear-gradient(135deg, #394D66 0%, #2E3E55 40%, #253D63 75%, #21457C 100%)',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {/* Blueprint Grid Overlay on the right */}
          <div
            className="absolute top-0 right-0 bottom-0 w-2/5 opacity-20 pointer-events-none z-0"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              maskImage: 'linear-gradient(to left, white, transparent)',
              WebkitMaskImage: 'linear-gradient(to left, white, transparent)'
            }}
          />

          {/* Header Row (increased padding top for more height) */}
          <div 
            className="flex items-center justify-between px-4 pb-2 relative z-10"
            style={{ paddingTop: STATUS_BAR_H + 20 }}
          >
            <span className="text-[22px] font-black tracking-tight text-white">
              {goal === 'JEE' ? 'IIT JEE Store' : `${goal} Store`}
            </span>
          </div>

          {/* Dynamic Filter Chips Row */}
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1 pl-4 pr-4 relative z-10">
            {/* Sort */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => { setSortOpen(o => !o); setSyllabusOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-slate-700 text-[12px] font-bold border border-slate-200 active:scale-95 transition-transform"
              >
                Sort by: {sort} <ChevronDown size={13} className="text-slate-500" />
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#1F2937] rounded-xl overflow-hidden border border-white/10 min-w-[180px]">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o}
                      onClick={() => { setSort(o); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold transition-colors ${sort === o ? 'text-[#25D3A4] bg-white/5' : 'text-white/70 hover:bg-white/5'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Syllabus */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => { setSyllabusOpen(o => !o); setSortOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-slate-700 text-[12px] font-bold border border-slate-200 active:scale-95 transition-transform"
              >
                {syllabus === 'All' ? 'Syllabus' : syllabus} <ChevronDown size={13} className="text-slate-500" />
              </button>
              {syllabusOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#1F2937] rounded-xl overflow-hidden border border-white/10 min-w-[160px]">
                  {SYLLABUS_OPTIONS.map(o => (
                    <button
                      key={o}
                      onClick={() => { setSyllabus(o); setSyllabusOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] font-semibold transition-colors ${syllabus === o ? 'text-[#25D3A4] bg-white/5' : 'text-white/70 hover:bg-white/5'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type Filters */}
            {['All', 'LIVE', 'RECORDED'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-bold border active:scale-95 transition-all"
                style={{
                  background: typeFilter === t ? 'rgba(37,211,164,0.15)' : '#FFFFFF',
                  borderColor: typeFilter === t ? '#25D3A4' : '#E2E8F0',
                  color: typeFilter === t ? '#1E8267' : '#334155',
                }}
              >
                {t === 'All' ? 'Class: All' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Course Cards Container */}
        <div
          className="px-4 py-6 space-y-4 flex-1 pb-24"
          onClick={() => { setSortOpen(false); setSyllabusOpen(false); }}
        >
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-5xl mb-3">🔍</span>
              <p className="font-bold text-slate-500">No courses found</p>
            </div>
          ) : (
            sorted.reduce((acc, course, index) => {
              acc.push(
                <button
                  key={course.id}
                  onClick={() => window.open('https://en.wikipedia.org', '_blank')}
                  className="w-full text-left active:scale-[0.98] transition-transform block"
                >
                  <div
                    className="flex gap-5 items-center"
                    style={{
                      background: 'transparent',
                      borderRadius: 0,
                    }}
                  >
                    {/* Left Thumbnail Poster scaled up from 120x180 to 145x215 */}
                    <div
                      className="relative flex-shrink-0 w-[145px] h-[215px] flex items-center justify-center overflow-visible bg-slate-100 dark:bg-slate-900"
                      style={{ borderRadius: 8 }}
                    >
                      <div className="w-full h-full overflow-hidden" style={{ borderRadius: 8 }}>
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* LIVE/RECORDED Badge */}
                      <div
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-none font-black text-white"
                        style={{ background: course.badgeColor, fontSize: 9, letterSpacing: '0.05em' }}
                      >
                        {course.type}
                      </div>
                      {/* Educator Avatar overlaid at bottom */}
                      {course.educator && (
                        <div
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.educator.seed}&backgroundColor=b6e3f4,c0aede&clothingColor=3c4f5c`}
                            alt={course.educator.name}
                            className="w-9 h-9 rounded-full border-2 object-cover"
                            style={{
                              borderColor: isDark ? '#2A2B2D' : '#F1F5F9',
                              background: '#1E293B',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right Content scaled to 215px height */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center h-[215px] py-1 gap-2.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#2D2F34] text-white text-[10px] font-bold inline-flex items-center justify-center">
                            {course.lang === 'हि' ? 'हिn' : course.lang}
                          </span>
                          <span className="font-extrabold tracking-wide uppercase text-[10px] text-[#3B82F6] dark:text-[#60A5FA]">
                            {course.category}
                          </span>
                        </div>

                        <p
                          className="font-bold leading-snug line-clamp-2 text-[15px]"
                          style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
                        >
                          {course.title}
                        </p>

                        {/* Educator name + rating */}
                        {course.educator && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                              {course.educator.name}
                            </span>
                            <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-0.5">
                              ★ {course.educator.rating}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              · {course.educator.students}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-150 dark:border-slate-800/40 space-y-0.5">
                        {course.started && (
                          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                            {course.started}
                          </p>
                        )}
                        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                          {course.meta}
                        </p>

                        <p className="mt-2 font-black text-lg text-slate-950 dark:text-white">
                          {course.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
              if ((index + 1) % 3 === 0 && user?.approved === false) {
                acc.push(
                  <MobilePromoBlock key={`promo-${index}`} isDark={isDark} />
                );
              }
              return acc;
            }, [])
          )}



          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* Counsellor Bottom Sheet Modal */}
      <CounsellorModal
        isOpen={showCounsellorModal}
        onClose={() => setShowCounsellorModal(false)}
        title="Need help with your subscription?"
      />
    </div>
  );
}

const MobilePromoBlock = ({ isDark }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full p-0 py-4 space-y-4 border-t border-b border-slate-200 dark:border-white/[0.07]">
      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
        <span className="text-[#25D3A4]">Unlimited access</span> to the best batches & educators
      </h3>

      {/* Features List */}
      <div className="space-y-2.5">
        {[
          "Thousands of live and recorded classes",
          "20,000+ Test & Practice questions",
          "Learn from India's top educators",
          "Notes, Doubts and many more premium features"
        ].map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-200 text-[12.5px]">
            <svg className="w-4 h-4 text-[#25D3A4] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 10l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Illustration */}
      <div className="flex justify-center items-center my-2">
        <svg className="w-full max-w-[240px] h-28" viewBox="0 0 240 112" fill="none">
          {/* Floating paper card background */}
          <rect x="20" y="8" width="140" height="96" rx="6" fill="#1D2A26" stroke="#25D3A4" strokeWidth="1" strokeDasharray="3 3" fillOpacity="0.2" />
          
          {/* Smartphone body */}
          <rect x="95" y="16" width="70" height="88" rx="8" fill="#111827" stroke="#374151" strokeWidth="2" />
          <rect x="99" y="20" width="62" height="80" rx="4" fill="#1F2937" />
          
          {/* Profile avatars */}
          <g transform="translate(50, 25)">
            <circle cx="12" cy="12" r="9" fill="#25D3A4" />
            <circle cx="32" cy="12" r="9" fill="#3B82F6" />
          </g>
          
          {/* Plus badge on screen */}
          <circle cx="130" cy="65" r="10" fill="#2563EB" />
          <path d="M127,65 L133,65 M130,62 L130,68" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* CTA Button & Price info */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => navigate('/student/subscription')}
          className="w-full bg-[#25D3A4] hover:bg-[#1EBA9B] text-slate-900 font-bold py-3.5 px-4 rounded-lg text-center text-[13.5px] transition-colors"
        >
          View subscription plans
        </button>
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-bold">
          Starts from ₹0/month
        </p>
      </div>
    </div>
  );
}


const DesktopPromoBanner = () => {
  const navigate = useNavigate();
  return (
    <div className="col-span-full rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121A28] flex items-center gap-8 px-8 py-6">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-[#25D3A4] uppercase tracking-widest mb-1">Premium Access</p>
        <h3 className="font-black text-[18px] text-slate-900 dark:text-white leading-tight mb-1">
          Unlock <span className="text-[#7A41F7]">unlimited</span> courses &amp; educators
        </h3>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium">
          Live classes · Mock tests · Notes · Doubts — all in one place
        </p>
      </div>
      <button
        onClick={() => navigate('/student/subscription')}
        className="flex-shrink-0 bg-[#7A41F7] hover:bg-[#6930e0] text-white font-bold px-6 py-3 rounded-2xl text-[13px] transition-colors active:scale-95"
      >
        View Plans
      </button>
    </div>
  );
};
