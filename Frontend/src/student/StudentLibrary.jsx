import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon, XMarkIcon,
  ArrowDownTrayIcon, ChevronRightIcon, Bars3BottomRightIcon,
  ArrowLeftIcon, InboxIcon, PlayIcon, BookOpenIcon,
  FunnelIcon, AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { Loader2, Film, FileText, Atom, FlaskConical, Calculator, Dna, BookOpen, ChevronRight } from 'lucide-react';
import StudentHeader from './StudentHeader';
import api from '../api/axios';
/* ══════════════════════════════════════════════
   SHIMMER — YouTube-style skeleton
══════════════════════════════════════════════ */
const ShimmerCSS = () => (
  <style>{`
    @keyframes yt-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .sk {
      background-image: linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%);
      background-size: 200% 100%;
      animation: yt-shimmer 1.5s infinite linear;
      border-radius: 0.75rem;
    }
    .sk-dark {
      background-image: linear-gradient(90deg, #1e1b4b 0%, #2e2b6b 50%, #1e1b4b 100%);
      background-size: 200% 100%;
      animation: yt-shimmer 1.5s infinite linear;
      border-radius: 0.75rem;
    }
  `}</style>
);

/* skeleton blocks */
const Sk = ({ className = '' }) => <div className={`sk ${className}`} />;

/* Desktop: resource card skeleton */
const ResourceCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
    <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Sk className="h-4 w-3/4" />
      <Sk className="h-3 w-1/3" />
    </div>
    <Sk className="w-8 h-8 rounded-full flex-shrink-0" />
  </div>
);

/* Desktop: video card skeleton */
const VideoCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
    <Sk className="w-full aspect-video rounded-none" />
    <div className="p-4 space-y-2">
      <Sk className="h-4 w-5/6" />
      <Sk className="h-3 w-1/2" />
      <Sk className="h-3 w-1/3" />
    </div>
  </div>
);

/* Mobile: resource row skeleton */
const MobileRowSkeleton = () => (
  <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
    <Sk className="w-12 h-12 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Sk className="h-4 w-2/3" />
      <Sk className="h-3 w-1/3" />
    </div>
    <Sk className="w-8 h-8 rounded-full flex-shrink-0" />
  </div>
);

/* PDF Viewer — YT-style document page skeleton */
const PdfViewerSkeleton = () => (
  <div className="absolute inset-0 z-10 bg-slate-100 overflow-y-auto">
    {/* simulated document page */}
    <div className="max-w-2xl mx-auto py-10 px-8 space-y-8">

      {/* Page 1 */}
      <div className="bg-white rounded-xl shadow-sm p-8 space-y-5">
        {/* document title block */}
        <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
          <Sk className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Sk className="h-5 w-3/4" />
            <Sk className="h-3 w-1/2" />
          </div>
        </div>
        {/* heading */}
        <Sk className="h-5 w-2/3" />
        {/* paragraph lines */}
        <div className="space-y-2.5">
          <Sk className="h-3 w-full" />
          <Sk className="h-3 w-[95%]" />
          <Sk className="h-3 w-[88%]" />
          <Sk className="h-3 w-[92%]" />
          <Sk className="h-3 w-[70%]" />
        </div>
        {/* sub-heading */}
        <Sk className="h-4 w-1/3 mt-2" />
        <div className="space-y-2.5">
          <Sk className="h-3 w-full" />
          <Sk className="h-3 w-[97%]" />
          <Sk className="h-3 w-[85%]" />
          <Sk className="h-3 w-[90%]" />
        </div>
        {/* image/diagram placeholder */}
        <Sk className="w-full h-32 rounded-xl mt-2" />
        <div className="space-y-2.5">
          <Sk className="h-3 w-[78%]" />
          <Sk className="h-3 w-full" />
          <Sk className="h-3 w-[82%]" />
        </div>
      </div>

      {/* Page 2 partial */}
      <div className="bg-white rounded-xl shadow-sm p-8 space-y-5">
        <Sk className="h-5 w-1/2" />
        <div className="space-y-2.5">
          <Sk className="h-3 w-full" />
          <Sk className="h-3 w-[93%]" />
          <Sk className="h-3 w-[87%]" />
          <Sk className="h-3 w-[96%]" />
          <Sk className="h-3 w-[65%]" />
        </div>
        {/* table-like block */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mt-3">
          {[0, 1, 2, 3].map(r => (
            <div key={r} className={`flex gap-4 px-4 py-3 ${r % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
              <Sk className="h-3 w-1/4" />
              <Sk className="h-3 w-1/3" />
              <Sk className="h-3 w-1/5" />
            </div>
          ))}
        </div>
        <div className="space-y-2.5 mt-2">
          <Sk className="h-3 w-full" />
          <Sk className="h-3 w-[80%]" />
        </div>
      </div>

    </div>
  </div>
);

// ─── HOW TO FILL THIS IN ───────────────────────────────────────────────────
// 1. Go to YouTube, search each title below
// 2. Copy the video ID from the URL: youtube.com/watch?v=XXXXXXXXXXXX
// 3. Replace the youtubeId and update the thumbnail URL
// ──────────────────────────────────────────────────────────────────────────

const FALLBACK_VIDEOS = [
  // ── PHYSICS ─────────────────────────────────────
  {
    _id: "v1",
    title: "Electrostatics One Shot — MHT-CET 2025 | Full Chapter",
    subject: "Physics",
    duration: "52:18",
    youtubeId: "j8m63w99AwQ",
    thumbnail: "https://img.youtube.com/vi/j8m63w99AwQ/hqdefault.jpg",
    views: "1.2M",
    instructor: "Ankit Sir",
    searchQuery: "MHT CET electrostatics one shot physics",
  },
  {
    _id: "v2",
    title: "Rotational Dynamics One Shot — MHT-CET | Concepts + PYQs",
    subject: "Physics",
    duration: "48:44",
    youtubeId: "hF08xcWdu1A",
    thumbnail: "https://img.youtube.com/vi/hF08xcWdu1A/hqdefault.jpg",
    views: "980K",
    instructor: "Pradeep Giri",
    searchQuery: "MHT CET rotational dynamics one shot",
  },
  {
    _id: "v3",
    title: "Superposition of Waves — MHT-CET | Important Chapter",
    subject: "Physics",
    duration: "44:30",
    youtubeId: "OMZeREzmqPs",
    thumbnail: "https://img.youtube.com/vi/OMZeREzmqPs/hqdefault.jpg",
    views: "760K",
    instructor: "Ajju Sir",
    searchQuery: "MHT CET superposition of waves one shot",
  },
  {
    _id: "v4",
    title: "Wave Optics — MHT-CET | Complete Chapter",
    subject: "Physics",
    duration: "41:55",
    youtubeId: "XIXAIUgPGvc",
    thumbnail: "https://img.youtube.com/vi/XIXAIUgPGvc/hqdefault.jpg",
    views: "630K",
    instructor: "Tamanna Mam",
    searchQuery: "MHT CET wave optics one shot",
  },

  // ── CHEMISTRY ───────────────────────────────────
  {
    _id: "v7",
    title: "Chemical Bonding One Shot — MHT-CET | Full Chapter",
    subject: "Chemistry",
    duration: "50:02",
    youtubeId: "05Wkk17gxzI",
    thumbnail: "https://img.youtube.com/vi/05Wkk17gxzI/hqdefault.jpg",
    views: "890K",
    instructor: "Vedantu",
    searchQuery: "MHT CET chemical bonding one shot",
  },

  // ── MATHS ───────────────────────────────────────
  {
    _id: "v11",
    title: "Integration One Shot — MHT-CET | All Methods + PYQs",
    subject: "Maths",
    duration: "58:30",
    youtubeId: "2zEssFK1cKw",
    thumbnail: "https://img.youtube.com/vi/2zEssFK1cKw/hqdefault.jpg",
    views: "1.5M",
    instructor: "Govind Sir",
    searchQuery: "MHT CET integration one shot",
  },
  {
    _id: "v12",
    title: "Differential Equations — MHT-CET | Concepts + Shortcuts",
    subject: "Maths",
    duration: "45:12",
    youtubeId: "wmPrWeFzmwE",
    thumbnail: "https://img.youtube.com/vi/wmPrWeFzmwE/hqdefault.jpg",
    views: "820K",
    instructor: "Harsh Priyam",
    searchQuery: "MHT CET differential equations one shot",
  },
  {
    _id: "v13",
    title: "Probability — MHT-CET | Complete Chapter",
    subject: "Maths",
    duration: "40:08",
    youtubeId: "Tq7ZK9COp4Q",
    thumbnail: "https://img.youtube.com/vi/Tq7ZK9COp4Q/hqdefault.jpg",
    views: "710K",
    instructor: "Vedantu",
    searchQuery: "MHT CET probability one shot",
  }
];

const SUBJECT_COLORS = {
  Physics: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
  Chemistry: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  Maths: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-400' },
  Biology: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-400' },
};

const SUBJECT_ICONS = {
  Physics: <Atom size={14} />,
  Chemistry: <FlaskConical size={14} />,
  Maths: <Calculator size={14} />,
  Biology: <Dna size={14} />,
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function StudentLibrary() {
  const navigate = useNavigate();

  /* shared */
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  /* mobile-only */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openingFile, setOpeningFile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);

  /* desktop-only */
  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'videos'

  /* data */
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  const categories = ['All', 'Notes', 'PYQs', 'Formulas'];
  const subjects = ['All', 'Physics', 'Chemistry', 'Maths', 'Biology'];

  // Resolve file URLs — works in both Electron and web
  const resolveFileUrl = (fileUrl) => {
    const base = window.__API_URL__
      ? window.__API_URL__
      : (import.meta.env.VITE_API_BASE_URL || '');
    return `${base.replace(/\/$/, '')}${fileUrl}`;
  };

  /* fetch resources */
  useEffect(() => {
    const fetchVaultData = async () => {
      setResourcesLoading(true);
      try {
        const { data } = await api.get('/student/my-library');
        if (!data) { setResources([]); return; }
        setResources(Object.values(data).flat());
      } catch {
        setResources([]);
      } finally {
        setResourcesLoading(false);
      }
    };
    fetchVaultData();
  }, []);

  /* fetch videos */
useEffect(() => {
  const fetchVideos = async () => {
    setVideosLoading(true);

    try {
      const res = await fetch("https://pranavzinjad.in/student/my-videos");
      const data = await res.json();

      const list = data?.videos || data || [];
      setVideos(list.length ? list : FALLBACK_VIDEOS);

    } catch (err) {
      setVideos(FALLBACK_VIDEOS);
    } finally {
      setVideosLoading(false);
    }
  };

  fetchVideos();
}, []);

  /* file open/close (mobile) */
  const handleOpenFile = (item) => {
    setOpeningFile(item);
    setViewerReady(false);
    setIsDecrypting(true);
    document.body.setAttribute('data-hide-nav', 'true');
    setTimeout(() => { setIsDecrypting(false); setShowViewer(true); }, 1200);
  };
  const handleCloseViewer = () => {
    setShowViewer(false);
    setOpeningFile(null);
    setViewerReady(false);
    document.body.removeAttribute('data-hide-nav');
  };

  const handleDownload = async (e, fileUrl, filename) => {
    e.stopPropagation();
    try {
      const fullUrl = resolveFileUrl(fileUrl);
      const res = await api.get(fullUrl, { responseType: 'blob', baseURL: '' });
      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = blobUrl; link.download = filename || 'document.pdf';
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(resolveFileUrl(fileUrl), '_blank');
    }
  };

  /* filtered lists */
  const filteredResources = resources.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory;
    const matchSub = selectedSubject === 'All' || r.subject === selectedSubject;
    const matchSrch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSub && matchSrch;
  });

  const filteredVideos = videos.filter(v => {
    const matchSub = selectedSubject === 'All' || v.subject === selectedSubject;
    const matchSrch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchSrch;
  });

  const categoryIcons = {
    Notes: '/student/notes.svg', PYQs: '/student/pdf.svg',
    Formulas: '/student/formulas.svg', Default: '/student/notes.svg',
  };

  /* ══════════════════════════════════════════
     DESKTOP — Video Player Modal
  ══════════════════════════════════════════ */
  const VideoModal = () => (
    <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setActiveVideo(null)}>
      <div className="bg-[#0f0f0f] rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div>
            <p className="text-white font-bold text-sm truncate max-w-lg">{activeVideo?.title}</p>
            <p className="text-white/50 text-xs mt-0.5">{activeVideo?.subject} • {activeVideo?.instructor}</p>
          </div>
          <button onClick={() => setActiveVideo(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${activeVideo?.youtubeId}?autoplay=1`}
            title={activeVideo?.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <ShimmerCSS />

      {/* ───────────────────────────────────────
          DESKTOP LAYOUT
      ─────────────────────────────────────── */}
      <div className="hidden md:flex  flex-col min-h-screen">
        <StudentHeader />

        <div className="flex flex-1 max-w-7xl mx-auto w-full px-8 md:px-8 lg:px-12 2xl:px-20 py-8 gap-7">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="w-56 flex-shrink-0 flex flex-col gap-4">

            {/* Brand block */}
            <div className="bg-[#7A41F7] rounded-2xl p-5 text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -right-1 -top-4 w-12 h-12 bg-white/5 rounded-full" />
              <BookOpen size={22} className="mb-3 relative z-10 opacity-80" />
              <p className="font-black text-base relative z-10 leading-tight">Nexus<br />Library</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 relative z-10">Secure Repository</p>
            </div>

            {/* Tab switcher */}
            <div className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm">
              <button
                onClick={() => setActiveTab('resources')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'resources' ? 'bg-[#7A41F7] text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <FileText size={16} />
                Resources
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-1 ${activeTab === 'videos' ? 'bg-[#7A41F7] text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Film size={16} />
                Video Lectures
              </button>
            </div>

            {/* Subject filter */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject</p>
              <div className="space-y-1">
                {subjects.map(sub => {
                  const colors = SUBJECT_COLORS[sub];
                  const isActive = selectedSubject === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${isActive ? 'bg-[#F3EBFF] text-[#7A41F7]' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {sub !== 'All' && (
                        <span className={`${isActive ? 'text-[#7A41F7]' : 'text-slate-400'}`}>
                          {SUBJECT_ICONS[sub]}
                        </span>
                      )}
                      {sub === 'All' && <span className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-50" />}
                      {sub}
                      {isActive && <ChevronRight size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category filter (resources only) */}
            {activeTab === 'resources' && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</p>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeCategory === cat ? 'bg-[#F3EBFF] text-[#7A41F7]' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 flex flex-col min-w-0 gap-6">

            {/* Search + header bar */}
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/student')} className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-500 hover:text-[#7A41F7] hover:border-purple-200 transition-all shadow-sm flex-shrink-0">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder={activeTab === 'videos' ? 'Search video lectures…' : 'Search resources…'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:border-[#7A41F7] focus:ring-2 focus:ring-purple-100 shadow-sm transition-all outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* active filter pills */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedSubject !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#F3EBFF] text-[#7A41F7] text-xs font-bold px-3 py-1.5 rounded-full">
                    {selectedSubject}
                    <button onClick={() => setSelectedSubject('All')}><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {activeCategory !== 'All' && activeTab === 'resources' && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">
                    {activeCategory}
                    <button onClick={() => setActiveCategory('All')}><XMarkIcon className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            </div>

            {/* ── RESOURCES TAB ── */}
            {activeTab === 'resources' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Study Resources</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {resourcesLoading ? 'Loading…' : `${filteredResources.length} asset${filteredResources.length !== 1 ? 's' : ''} found`}
                    </p>
                  </div>
                </div>

                {resourcesLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Array(6).fill(0).map((_, i) => <ResourceCardSkeleton key={i} />)}
                  </div>
                ) : filteredResources.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredResources.map(item => {
                      const subColor = SUBJECT_COLORS[item.subject] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-300' };
                      return (
                        <div
                          key={item._id}
                          onClick={() => handleOpenFile(item)}
                          className="group bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all cursor-pointer active:scale-[0.98]"
                        >
                          <div className={`w-12 h-12 ${subColor.bg} rounded-xl flex items-center justify-center shrink-0 transition-colors`}>
                            <img
                              src={categoryIcons[item.category] || categoryIcons.Default}
                              alt={item.category}
                              className="w-7 h-7 object-contain"
                              onError={e => { e.target.src = categoryIcons.Default; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-bold text-slate-800 truncate">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-black ${subColor.text} uppercase tracking-tight`}>{item.subject}</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className="text-[10px] font-semibold text-slate-400 uppercase">{item.category}</span>
                              {item.fileSize && <>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] text-slate-400">{item.fileSize}</span>
                              </>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={e => handleDownload(e, item.fileUrl, item.title)}
                              className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 rounded-xl bg-[#F3EBFF] text-[#7A41F7] group-hover:bg-[#7A41F7] group-hover:text-white flex items-center justify-center transition-all">
                              <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <InboxIcon className="w-12 h-12 text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400">No resources found</p>
                    <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            )}

            {/* ── VIDEOS TAB ── */}
            {activeTab === 'videos' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Video Lectures</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {videosLoading ? 'Loading…' : `${filteredVideos.length} lecture${filteredVideos.length !== 1 ? 's' : ''} available`}
                    </p>
                  </div>
                </div>

                {videosLoading ? (
                  <div className="grid grid-cols-3 gap-5">
                    {Array(6).fill(0).map((_, i) => <VideoCardSkeleton key={i} />)}
                  </div>
                ) : filteredVideos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-5">
                    {filteredVideos.map(video => {
                      const subColor = SUBJECT_COLORS[video.subject] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-300' };
                      return (
                        <div
                          key={video._id}
                          onClick={() => setActiveVideo(video)}
                          className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50/60 transition-all cursor-pointer active:scale-[0.98]"
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={e => { e.target.src = `https://placehold.co/480x270/1e1b4b/white?text=${encodeURIComponent(video.subject)}`; }}
                            />
                            {/* play overlay */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                                <PlayIcon className="w-5 h-5 text-[#7A41F7] fill-[#7A41F7] translate-x-0.5" />
                              </div>
                            </div>
                            {/* duration badge */}
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {video.duration}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <h4 className="text-[14px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#7A41F7] transition-colors">
                              {video.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`inline-flex items-center gap-1.5 ${subColor.bg} ${subColor.text} text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tight`}>
                                <span className={`w-1.5 h-1.5 ${subColor.dot} rounded-full`} />
                                {video.subject}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">{video.views} views</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{video.instructor}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Film size={40} className="text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400">No videos found</p>
                    <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Video player modal */}
      {activeVideo && <VideoModal />}

      {/* Decrypting overlay — works for both mobile + desktop */}
      {isDecrypting && (
        <div className="fixed inset-0 z-[2000] bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-t-white/80 border-white/10 animate-spin" />
          </div>
          <p className="text-white text-xs font-black uppercase tracking-[0.2em] mb-1">Decrypting</p>
          <p className="text-white/40 text-[10px] font-medium">Securing your access…</p>
          <div className="mt-5 w-40 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white/60 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Desktop PDF Viewer Modal */}
      {showViewer && openingFile && (
        <div className="fixed inset-0 z-[3000] bg-white flex flex-col animate-in fade-in duration-200">
          {/* top bar */}
          <div className="h-14 border-b border-slate-200 flex items-center justify-between px-5 shrink-0 bg-white shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={handleCloseViewer} className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0">
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <div className="truncate">
                <h3 className="text-[14px] font-bold text-slate-900 truncate">{openingFile.title}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight mt-0.5">{openingFile.subject} · {openingFile.category} · {openingFile.fileSize}</p>
              </div>
            </div>
            <button
              onClick={e => handleDownload(e, openingFile.fileUrl, openingFile.title)}
              className="flex items-center gap-2 bg-[#7A41F7] hover:bg-[#6832E3] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-purple-200"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download
            </button>
          </div>
          {/* viewer body */}
          <div className="flex-1 bg-slate-100 relative overflow-hidden">
            {!viewerReady && <PdfViewerSkeleton />}
            {openingFile.fileUrl ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveFileUrl(openingFile.fileUrl))}&embedded=true`}
                className={`w-full h-full border-none transition-opacity duration-500 ${viewerReady ? 'opacity-100' : 'opacity-0'}`}
                title="Document Viewer"
                onLoad={() => setViewerReady(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                <div className="p-5 bg-slate-50 rounded-2xl mb-4"><InboxIcon className="w-10 h-10 text-slate-300" /></div>
                <p className="text-sm font-bold text-slate-700">Document not found</p>
                <p className="text-xs text-slate-400 mt-1">The file may have been moved or deleted.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────
          MOBILE LAYOUT  — completely untouched
          (original code preserved exactly)
      ─────────────────────────────────────── */}
      <div className="md:hidden min-h-[100vh] bg-[#7A41F7] flex flex-col font-sans relative">

        {/* MOBILE HEADER */}
        <nav className="shrink-0 pt-6 pb-14 px-6 mb-4 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
          </div>
          <div className="max-w-lg mx-auto flex justify-between items-center relative z-10">
            <div className='flex items-center justify-start gap-4'>
              <button onClick={() => navigate('/student')} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white backdrop-blur-md">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-black text-white tracking-tight">Nexus Library</h2>
                <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Secure Repository</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl transition-all backdrop-blur-md z-[1001] ${isSidebarOpen ? 'bg-white text-[#7A41F7] shadow-lg' : 'bg-white/20 text-white'}`}
            >
              {isSidebarOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3BottomRightIcon className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* MOBILE FLOATING DROPDOWN */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[1000] flex justify-end p-6 pointer-events-none">
            <div className="fixed inset-0 pointer-events-auto" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative mt-16 w-44 h-fit bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-slate-100 p-1.5 pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-200">
              <p className="px-3 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Filter Subject</p>
              <div className="space-y-0.5">
                {subjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => { setSelectedSubject(sub); setIsSidebarOpen(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${selectedSubject === sub ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MOBILE SHEET */}
        <div className="flex-1 bg-white rounded-t-[2.5rem] relative flex flex-col min-h-0  z-10">
          <main className="max-w-lg mx-auto w-full px-6 -mt-13 flex flex-col flex-1 min-h-0">

            {/* Mobile tab switcher */}
            <div className="flex gap-2 mb-4 mt-1 shrink-0">
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'resources' ? 'bg-white text-black shadow-md' : 'bg-slate-50 text-slate-400'}`}
              >
                Resources
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'videos' ? 'bg-white text-black shadow-md' : 'bg-slate-50 text-slate-400'}`}
              >
                Videos
              </button>
            </div>

            {/* SEARCH + CATEGORY */}
            <div className="space-y-4 shrink-0">
              <div className="relative group mb-4">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7A41F7] transition-colors w-4 h-4" />
                <input
                  type="text"
                  placeholder={activeTab === 'videos' ? 'Search video lectures…' : 'Search secure assets...'}
                  className="w-full bg-white border-2 border-slate-50 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold focus:border-[#7A41F7] shadow-lg shadow-purple-900/5 transition-all outline-none"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === 'resources' && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* MOBILE ASSET LIST */}
            <div className="flex-1 overflow-y-auto no-scrollbar  pt-4 pb-32 space-y-3">

              {/* Resources tab */}
              {activeTab === 'resources' && (
                resourcesLoading ? (
                  <>
                    <MobileRowSkeleton />
                    <MobileRowSkeleton />
                    <MobileRowSkeleton />
                    <MobileRowSkeleton />
                  </>
                ) : filteredResources.length > 0 ? (
                  filteredResources.map(item => (
                    <div
                      key={item._id}
                      onClick={() => handleOpenFile(item)}
                      className="group  border border-slate-100 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                        <img src={categoryIcons[item.category] || categoryIcons.Default} alt={item.category} className="w-7 h-7 object-contain" onError={e => { e.target.src = categoryIcons.Default; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-slate-800 truncate leading-tight">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">{item.subject}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{item.fileSize}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRightIcon className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <InboxIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No assets found</p>
                  </div>
                )
              )}

              {/* Videos tab — mobile */}
              {activeTab === 'videos' && (
                videosLoading ? (
                  <>
                    <MobileRowSkeleton />
                    <MobileRowSkeleton />
                    <MobileRowSkeleton />
                  </>
                ) : filteredVideos.length > 0 ? (
                  <div className="space-y-0 -mx-4">
                    {filteredVideos.map((video, idx) => {
                      const subColor = SUBJECT_COLORS[video.subject] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-300' };
                      return (
                        <div
                          key={video._id}
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                          className="flex gap-3 px-4 py-3 active:bg-slate-100 transition-colors cursor-pointer"
                          style={{ animationDelay: `${idx * 40}ms` }}
                        >
                          {/* Thumbnail — 16:9 YT ratio */}
                          <div className="relative flex-shrink-0 w-[160px] h-[90px] rounded-xl overflow-hidden bg-slate-900">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.src = `https://placehold.co/160x90/0f0f0f/white?text=▶`; }}
                            />
                            {/* Dark gradient bottom */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {/* Duration pill — bottom right exactly like YT */}
                            <span className="absolute bottom-1.5 right-1.5 bg-black/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-tight leading-none">
                              {video.duration}
                            </span>
                            {/* Play overlay on hover (desktop) */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity bg-black/20">
                              <div className="w-9 h-9 rounded-full bg-black/70 flex items-center justify-center">
                                <PlayIcon className="w-4 h-4 text-white fill-white ml-0.5" />
                              </div>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                            {/* Title — 2 lines max like YT */}
                            <h4 className="text-[13px] font-semibold text-[#0f0f0f] leading-[1.35] line-clamp-2 tracking-tight">
                              {video.title}
                            </h4>

                            {/* Channel / subject row */}
                            <div className="mt-1.5 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                {/* Subject dot-badge */}
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${subColor.text} uppercase tracking-wide`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${subColor.dot} inline-block`} />
                                  {video.subject}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <span>{video.views} views</span>
                                <span className="text-slate-300">•</span>
                                <span>HD</span>
                              </div>
                            </div>
                          </div>

                          {/* 3-dot menu icon (YT style) */}
                          <button
                            onClick={e => e.stopPropagation()}
                            className="flex-shrink-0 self-start mt-1 p-1 -mr-1 text-slate-400 active:text-slate-700 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <Film size={40} className="mb-4 opacity-30" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No videos found</p>
                  </div>
                )
              )}
            </div>
          </main>
        </div>

        {/* FULL SCREEN PDF VIEWER */}
        {showViewer && openingFile && (
          <div className="fixed inset-0 z-[3000] bg-white flex flex-col animate-in fade-in duration-200">
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={handleCloseViewer} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
                <div className="truncate">
                  <h3 className="text-[13px] font-bold text-slate-900 truncate">{openingFile.title}</h3>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{openingFile.subject} • {openingFile.fileSize}</p>
                </div>
              </div>
              <button onClick={e => handleDownload(e, openingFile.fileUrl, openingFile.title)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-800 transition-all active:scale-95">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              {!viewerReady && <PdfViewerSkeleton />}
              {openingFile.fileUrl ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolveFileUrl(openingFile.fileUrl))}&embedded=true`}
                  className={`w-full h-full border-none transition-opacity duration-300 ${viewerReady ? 'opacity-100' : 'opacity-0'}`}
                  title="Document Viewer"
                  onLoad={() => setViewerReady(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white">
                  <div className="p-4 bg-slate-50 rounded-full mb-3"><InboxIcon className="w-8 h-8 text-slate-300" /></div>
                  <p className="text-sm font-bold text-slate-900">Document not found</p>
                  <p className="text-xs text-slate-500 mt-1">The file may have been moved or deleted.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}