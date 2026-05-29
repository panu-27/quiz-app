import os
import re

# First checkout the clean file to make sure it's fresh
os.system("git checkout -- ../Frontend/src/student/StudentProfile.jsx")

clean_file_path = r"c:\Users\Pranav\Desktop\QuizApp\frontend\src\student\StudentProfile.jsx"
with open(clean_file_path, "r", encoding="utf-8") as f:
    clean_lines = f.readlines()

# Clean lines 122 to 286 correspond to index 121 to 285.
clean_panels_block = "".join(clean_lines[121:286])

block_1_100 = """import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ArrowLeft, Settings, Star, Globe, MapPin,
  ShieldCheck, Zap, User, Flame, Calendar, Target,
  Lock, ChevronRight, Camera, Eye, EyeOff,
  Check, AlertCircle, Upload, X, LogOut,
  KeyRound, ChevronDown, ChevronUp, ChevronLeft,
  ShoppingBag, PlaySquare, Download, Bell, Users,
  HelpCircle, Activity, Medal, Award, GraduationCap,
  FlaskConical, BookOpen
} from "lucide-react";
import StudentHeader from "./StudentHeader";
import api from "../api/axios";

const STATUS_BAR_H = 43.7;

/* ────────────────────────────────
   HELPERS
──────────────────────────────── */
const DEFAULT_AVATAR = (seed = "student") =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const hasCustomAvatar = (url) => {
  if (!url) return false;
  if (url.includes("api.dicebear.com")) return false;
  return true;
};

const getGoalIcon = (goalName) => {
  const g = goalName?.toLowerCase() || '';
  if (g.includes('cet') || g.includes('jee') || g.includes('iit')) {
    return <FlaskConical className="text-emerald-500 w-8 h-8" />;
  }
  return <BookOpen className="text-purple-500 w-8 h-8" />;
};

/* ────────────────────────────────
   GLOBAL STYLES — Font: Sora (headings) + DM Sans (body)
──────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap');

    * { font-family: 'DM Sans', sans-serif; }

    .font-display  { font-family: 'Sora', sans-serif; }
    .font-body     { font-family: 'DM Sans', sans-serif; }

    @keyframes ytbar {
      0%   { width:0%;  margin-left:0%;   opacity:1; }
      50%  { width:75%; margin-left:10%; }
      90%  { width:15%; margin-left:90%;  opacity:1; }
      100% { width:0%;  margin-left:100%; opacity:0; }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0);    }
    }
    @keyframes slideDown {
      from { opacity:0; transform:translateY(-8px); max-height:0;   }
      to   { opacity:1; transform:translateY(0);    max-height:600px; }
    }
    .fade-up    { animation: fadeUp    0.36s ease both; }
    .slide-down { animation: slideDown 0.32s cubic-bezier(.22,1,.36,1) both; }
    .panel-open  { overflow:hidden; }
  `}</style>
);

/* ────────────────────────────────
   YT LOADING BAR
──────────────────────────────── */
function LoadingBar({ active }) {
  if (!active) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[300] h-[3px] overflow-hidden pointer-events-none">
      <div className="h-full bg-[#7A41F7] rounded-full" style={{ animation: "ytbar 1.8s ease-in-out infinite" }} />
    </div>
  );
}

/* ────────────────────────────────
   TOAST
──────────────────────────────── */
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2.5 px-5 py-3 rounded-sm shadow-xl text-sm font-semibold text-white fade-up pointer-events-none font-body
      ${type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}>
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

/* ────────────────────────────────
   LOCKED FIELD
──────────────────────────────── */
"""

step_794_components = """function LockedField({ label, value, icon, isDark }) {
  return (
    <div className={`border rounded-2xl px-4 py-3.5 flex items-center gap-3 ${isDark ? 'bg-[#000711] border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
      <span className={`${isDark ? 'text-slate-500' : 'text-slate-300'} shrink-0`}>{icon}</span>
      <div className="flex-1">
        <p className="text-[8px] text-slate-300 font-semibold uppercase tracking-widest leading-none mb-0.5 font-body">{label}</p>
        <p className={`text-sm font-bold font-body ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{value}</p>
      </div>
      <Lock size={13} className={`${isDark ? 'text-slate-600' : 'text-slate-200'} shrink-0`} />
    </div>
  );
}

/* ────────────────────────────────
   PASSWORD INPUT
   ──────────────────────────────── */
function PassInput({ label, value, onChange, show, onToggle, isDark }) {
  return (
    <div className={`border focus-within:border-[#7A41F7] rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-colors ${isDark ? 'bg-[#000711] border-slate-800/80' : 'bg-white border-slate-200'}`}>
      <Lock size={15} className={`${isDark ? 'text-slate-500' : 'text-slate-400'} shrink-0`} />
      <div className="flex-1">
        <p className="text-[8px] text-slate-300 font-semibold uppercase tracking-widest mb-0.5 font-body">{label}</p>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className={`w-full text-sm font-semibold placeholder:text-slate-300 bg-transparent outline-none font-body ${isDark ? 'text-white' : 'text-slate-800'}`}
        />
      </div>
      <button type="button" onClick={onToggle} className="text-slate-300 hover:text-slate-500 transition-colors">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
"""

fsv_top = """function FullSettingsView({ onBack, name, email, avatarUrl, onAvatarChange }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [avatarSaving, setAvS] = useState(false);
  const [showO, setShowO] = useState(false);
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [passSaving, setPasS] = useState(false);
  const [toast, setToast] = useState(null);
  const [passForm, setPassForm] = useState({ oldPassword: "", password: "", confirm: "" });

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const saveAvatar = async () => {
    if (!file) return;
    setAvS(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      await api.post("/student/updateavatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onAvatarChange(preview);
      setToast({ msg: "Photo updated!", type: "success" });
      setFile(null);
      setPreview(null);
    } catch {
      setToast({ msg: "Upload failed.", type: "error" });
    } finally {
      setAvS(false);
    }
  };

  const mismatch = passForm.password && passForm.confirm && passForm.password !== passForm.confirm;

  const savePassword = async () => {
    if (!passForm.oldPassword || !passForm.password || mismatch) return;
    setPasS(true);
    try {
      await api.put("/auth/update-password", {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.password,
      });
      setToast({ msg: "Password changed!", type: "success" });
      setPassForm({ oldPassword: "", password: "", confirm: "" });
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Failed.", type: "error" });
    } finally {
      setPasS(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };
  const displayAvatar = preview || avatarUrl;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#000711]' : 'bg-[#F6F8FC]'}`}>
      <div 
        className="sticky top-0 z-50"
        style={{
          background: isDark ? 'rgba(23, 31, 42, 0.93)' : 'rgba(255, 255, 255, 0.93)',
          backdropFilter: 'blur(16px)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9',
        }}
      >
        {/* Fake Top Status Bar */}
        <div style={{ height: STATUS_BAR_H }} className="w-full flex-shrink-0" />
        
        {/* Header Row */}
        <div className="px-5 py-4 flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-xl active:scale-95 transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <ArrowLeft size={18} className={isDark ? 'text-slate-200' : 'text-slate-700'} strokeWidth={3} />
          </button>
          <h1 className={`text-base font-bold uppercase tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-16">
        {/* Profile Photo Section */}
        <section className={`rounded-3xl p-5 shadow-sm border ${isDark ? 'bg-[#171F2A] border-slate-800/85' : 'bg-white border-slate-100'}`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-body">Profile Photo</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative shrink-0">
              <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shadow bg-slate-50 ${isDark ? 'border-slate-850' : 'border-slate-100'}`}>
                <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" onError={e => { e.target.src = DEFAULT_AVATAR(name); }} />
              </div>
              {preview && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800 font-display">{name}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-body">Tap below to change your photo</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-[#7A41F7] rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#7A41F7] transition-all font-body"
          >
            <Upload size={16} />
            {preview ? "Change selected photo" : "Upload new photo"}
          </button>
          {preview && (
            <div className="flex gap-3 mt-3">
              <button onClick={() => { setPreview(null); setFile(null); }} className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-xl font-body">Remove</button>
              <button onClick={saveAvatar} disabled={avatarSaving} className="flex-1 py-2.5 bg-[#7A41F7] text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 active:scale-95 transition-all font-body">
                {avatarSaving ? "Saving…" : "Save Photo"}
              </button>
            </div>
          )}
        </section>

        {/* Account Info Section */}
        <section className={`rounded-3xl p-5 shadow-sm border ${isDark ? 'bg-[#171F2A] border-slate-800/85' : 'bg-white border-slate-100'} space-y-3`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-body">Account Info</p>
          <LockedField label="Full Name (cannot be changed)" value={name} icon={<User size={15} />} isDark={isDark} />
          <LockedField label="Email (cannot be changed)" value={email} icon={<Globe size={15} />} isDark={isDark} />
        </section>

        {/* Change Password Section */}
        <section className={`rounded-3xl p-5 shadow-sm border ${isDark ? 'bg-[#171F2A] border-slate-800/85' : 'bg-white border-slate-100'}`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-body">Change Password</p>
          <div className={`border rounded-2xl px-4 py-3 flex items-start gap-2.5 mb-4 ${isDark ? 'bg-amber-950/20 border-amber-900/35 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>"""

block_450_1249_raw = """450:             <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
451:             <p className="text-[11px] font-semibold leading-snug font-body">Use at least 6 characters. You'll stay logged in after changing.</p>
452:           </div>
453:           <div className="space-y-3">
454:             <PassInput label="Current Password" value={passForm.oldPassword} onChange={v => setPassForm(f => ({ ...f, oldPassword: v }))} show={showO} onToggle={() => setShowO(!showO)} isDark={isDark} />
455:             <PassInput label="New Password" value={passForm.password} onChange={v => setPassForm(f => ({ ...f, password: v }))} show={showP} onToggle={() => setShowP(!showP)} isDark={isDark} />
456:             <PassInput label="Confirm Password" value={passForm.confirm} onChange={v => setPassForm(f => ({ ...f, confirm: v }))} show={showC} onToggle={() => setShowC(!showC)} isDark={isDark} />
457:             {mismatch && <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1.5 px-1 font-body"><AlertCircle size={11} /> Passwords don't match</p>}
458:           </div>
459:           <button
460:             onClick={savePassword}
461:             disabled={passSaving || !passForm.password || !passForm.oldPassword || !!mismatch}
462:             className="w-full mt-4 py-3.5 bg-transparent border border-[#7A41F7] hover:bg-[#7A41F7]/10 disabled:opacity-40 text-[#7A41F7] font-bold text-xs uppercase tracking-widest rounded-lg active:scale-[0.97] transition-all font-body"
463:           >
464:             {passSaving ? "Updating…" : "Update Password"}
465:           </button>
466:         </section>
467: 
468:         {/* Logout Section */}
469:         <section className={`rounded-lg p-5 shadow-sm border ${isDark ? 'bg-[#171F2A] border-slate-800/85' : 'bg-white border-slate-100'}`}>
470:           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-body">Account</p>
471:           <button
472:             onClick={handleLogout}
473:             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border bg-transparent transition-all active:scale-[0.98] ${isDark ? 'border-rose-900/40 hover:bg-rose-950/10' : 'border-rose-250 hover:bg-rose-50'}`}
474:           >
475:             <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${isDark ? 'bg-rose-900/40' : 'bg-rose-100'}`}><LogOut size={16} className="text-rose-500" /></div>
476:             <div className="text-left flex-1">
477:               <p className="text-xs font-bold text-rose-500 uppercase tracking-tight font-display">Sign Out</p>
478:               <p className="text-[9px] text-rose-400 font-semibold mt-0.5 font-body">See you soon!</p>
479:             </div>
480:             <ChevronRight size={14} className="text-rose-300" strokeWidth={3} />
481:           </button>
482:         </section>
483: 
484:         <p className="text-[9px] text-center text-slate-300 font-semibold uppercase tracking-widest font-body">app v2.4.1</p>
485:       </div>
486: 
487:       {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
488:     </div>
489:   );
490: }
491: 
492: function MobileSettingsPage({ onBack, name, email, avatarUrl, onAvatarChange }) {
493:   const { theme } = useTheme();
494:   const { user } = useAuth();
495:   const isDark = theme === "dark";
496:   const [showFullSettings, setShowFullSettings] = useState(false);
497:   const [isGoalExpanded, setIsGoalExpanded] = useState(false);
498:   const [selectedGoal, setSelectedGoal] = useState(localStorage.getItem("selectedGoal") || "IIT JEE");
499: 
500:   const selectGoal = (goal) => {
501:     localStorage.setItem("selectedGoal", goal);
502:     setSelectedGoal(goal);
503:     setIsGoalExpanded(false);
504:     window.location.reload();
505:   };
506: 
507:   // We can pass stats from the parent StudentProfile, but for now we'll just mock or use the defaults from localStorage/api if needed.
508:   // Actually, StudentProfile parent passes stats? Let's check: It didn't pass stats before, so we'll just use dummy/fallback or fetch if needed.
509: 
510:   if (showFullSettings) {
511:     return <FullSettingsView onBack={() => setShowFullSettings(false)} name={name} email={email} avatarUrl={avatarUrl} onAvatarChange={onAvatarChange} />;
512:   }
513: 
514:   return (
515:     <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#000711]' : 'bg-[#F4F7FC]'}`}>
516:       {/* Header */}
517:       <div
518:         className={`sticky top-0 z-50 transition-all duration-300 ${isDark
519:             ? 'bg-[#171F2A] rounded-b-lg'
520:             : 'bg-white border-b border-slate-200'
521:           }`}
522:       >
523:         {/* Fake Top Status Bar */}
524:         <div style={{ height: STATUS_BAR_H }} className="w-full flex-shrink-0" />
525: 
526:         {/* Header Row */}
527:         <div className="px-5 py-4 flex items-center gap-4">
528:           <button onClick={onBack} className={`p-0.5 bg-transparent border-none ${isDark ? 'text-slate-300' : 'text-slate-700'} active:scale-95 transition-all`}>
529:             <ChevronLeft size={20} />
530:           </button>
531:           <h1 className={`text-lg -ml-2 font-bold tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile & settings</h1>
532:         </div>
533: 
534:         {/* Goal Box - merged into header layout */}
535:         <div className="px-5 pb-5 pt-1 flex items-center justify-between">
536:           <button onClick={() => setIsGoalExpanded(!isGoalExpanded)} className="flex items-center gap-3 text-left focus:outline-none">
537:             <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-transparent">
538:               {getGoalIcon(selectedGoal)}
539:             </div>
540:             <div>
541:               <div className="flex items-center gap-1">
542:                 <h3 className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-slate-900'} font-display`}>{selectedGoal}</h3>
543:                 <ChevronDown size={14} className={`text-slate-450 mt-0.5 transition-transform duration-300 ${isGoalExpanded ? 'rotate-180' : ''}`} />
544:               </div>
545:               {user?.approved === false && (
546:                 <p className={`text-[12px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium mt-0.5`}>Free plan</p>
547:               )}
548:             </div>
549:           </button>
550:           <button onClick={() => setIsGoalExpanded(!isGoalExpanded)} className={`px-4 py-1.5 text-[12px] font-bold rounded-lg border bg-transparent ${isDark ? 'border-slate-800 text-white hover:bg-slate-800/45' : 'border-slate-300 text-slate-800 hover:bg-slate-105/55'} active:scale-95 transition-all`}>
551:             Manage
552:           </button>
553:         </div>
554: 
555:         {/* Expanded Goal Selection */}
556:         <div
557:           className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-0 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-100'
558:             } ${isGoalExpanded ? 'max-h-[200px] opacity-100 py-1' : 'max-h-0 opacity-0 pointer-events-none'}`}
559:         >
560:           {['Boards', 'MHT-CET'].map(goal => {
561:             const isSelected = selectedGoal === goal;
562:             return (
563:               <button
564:                 key={goal}
565:                 onClick={() => selectGoal(goal)}
566:                 className={`
567:                   w-full py-3 px-5 flex items-center justify-between transition-colors text-left
568:                   ${isDark ? 'hover:bg-slate-800/40 text-white' : 'hover:bg-slate-50 text-slate-800'}
569:                   ${isSelected ? 'font-bold' : 'font-semibold'}
570:                 `}
571:               >
572:                 <div className="flex items-center gap-3">
573:                   <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center transition-colors
574:                     ${isSelected
575:                       ? 'border-[#7A41F7]'
576:                       : (isDark ? 'border-slate-700' : 'border-slate-300')}
577:                   `}>
578:                     {isSelected && (
579:                       <div className="w-2 h-2 rounded-full bg-[#7A41F7]" />
580:                     )}
581:                   </div>
582:                   <span className="text-sm font-display">{goal}</span>
583:                 </div>
584:               </button>
585:             );
586:           })}
587:         </div>
588:       </div>
589: 
590:       <div className={`flex-1 overflow-y-auto px-2 py-3 space-y-2.5 ${isDark ? 'bg-[#000711]' : 'bg-[#F4F7FC]'}`}>
591: 
592:         {/* Store Box */}
593:         <div className={`rounded-lg p-3.5 flex items-center justify-between border ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'} shadow-sm`}>
594:           <div className="flex-1">
595:             <h3 className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-slate-900'} font-display mb-1`}>Unacademy Store</h3>
596:             <p className={`text-[12px] ${isDark ? 'text-slate-400' : 'text-slate-500'} leading-relaxed pr-4`}>Exclusive batches, Previous year question papers, Test series.</p>
597:           </div>
598:           <div className={`w-12 h-12 ${isDark ? 'bg-[#000711]/60' : 'bg-emerald-50'} rounded-sm flex items-center justify-center shrink-0`}>
599:             <ShoppingBag className="text-emerald-500" size={24} />
600:           </div>
601:         </div>
602: 
603:         {/* Profile Info Box */}
604:         <div className={`rounded-lg px-4 py-4.5 border ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
605:           <div className={`w-16 h-16 rounded-sm overflow-hidden border-2 border-emerald-500 shrink-0 relative flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
606:             {hasCustomAvatar(avatarUrl) ? (
607:               <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
608:             ) : (
609:               <GraduationCap className="text-emerald-500 w-10 h-10" />
610:             )}
611:             <div className="absolute -bottom-1 -right-1 bg-amber-400 w-5 h-5 rounded-md rotate-45 flex items-center justify-center border border-white">
612:               <div className="-rotate-45 w-2 h-2 rounded-full bg-white opacity-80" />
613:             </div>
614:           </div>
615:           <div>
616:             <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} font-display`}>{name}</h2>
617:             <p className="text-[13px] font-bold text-amber-500 mt-0.5">Beginner • 345</p>
618:             <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border ${isDark ? 'bg-[#000711] border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
619:               <Medal size={12} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
620:               <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Rank 2,16,845 in IIT JEE</span>
621:             </div>
622:           </div>
623:         </div>
624: 
625:         {/* My Library Section */}
626:         <div className={`rounded-lg px-4 py-4.5 border ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'} shadow-sm`}>
627:           <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} font-display mb-4`}>My library</h3>
628:           <div className="grid grid-cols-2 gap-2">
629:             {[
630:               { icon: <PlaySquare size={16} className="text-emerald-500" />, label: "Enrollments" },
631:               { icon: <Download size={16} className="text-purple-500" />, label: "Downloads" },
632:               { icon: <Bell size={16} className="text-emerald-500" />, label: "Updates" },
633:               { icon: <Users size={16} className="text-blue-500" />, label: "My educators" },
634:               { icon: <HelpCircle size={16} className="text-sky-500" />, label: "FAQs" },
635:               { icon: <Settings size={16} className="text-slate-400" />, label: "Settings", action: () => setShowFullSettings(true) }
636:             ].map((item, i) => (
637:               <button key={i} onClick={item.action} className={`flex items-center gap-2 px-2.5 py-3 rounded-lg border bg-transparent ${isDark ? 'border-slate-800/80 hover:bg-slate-800/20' : 'border-slate-200 hover:bg-slate-50/50'} active:scale-95 transition-all text-left`}>
638:                 {item.icon}
639:                 <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
640:               </button>
641:             ))}
642:           </div>
643:         </div>
644: 
645:         {/* Activity Section */}
646:         <div className={`rounded-lg px-4 py-4.5 border ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'} shadow-sm`}>
647:           <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'} font-display mb-1`}>Activity</h3>
648:           <p className={`text-[12px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium mb-4`}>Daily stats on how much you learn & practice</p>
649:           <div className={`flex items-center justify-center py-6 border-t border-dashed ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
650:             <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No activity yet. Start learning!</span>
651:           </div>
652:         </div>
653:       </div>
654:     </div>
655:   );
656: }
657: 
658: /* ════════════════════════════════════════════════════
659:    SKELETON BLOCKS
660: ════════════════════════════════════════════════════ */
661: function MobileSkeleton() {
662:   return (
663:     <div className="pt-20 px-5 animate-pulse space-y-4">
664:       <div className="flex flex-col items-center gap-3">
665:         <div className="w-40 h-6 bg-slate-100 rounded-full" />
666:         <div className="w-24 h-4 bg-slate-100 rounded-full" />
667:       </div>
668:       <div className="h-28 bg-slate-100 rounded-[2rem]" />
669:       <div className="grid grid-cols-2 gap-4">
670:         <div className="h-32 bg-slate-100 rounded-[2rem]" />
671:         <div className="h-32 bg-slate-100 rounded-[2rem]" />
672:       </div>
673:       <div className="space-y-3">
674:         {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-[2rem]" />)}
675:       </div>
676:     </div>
677:   );
678: }
679: 
680: function DesktopLeftSkeleton() {
681:   return (
682:     <div className="animate-pulse space-y-5 px-6 pt-4 pb-8">
683:       <div className="flex flex-col items-center gap-3">
684:         <div className="w-24 h-24 bg-white/20 rounded-full" />
685:         <div className="w-36 h-5 bg-white/20 rounded-full" />
686:         <div className="w-20 h-4 bg-white/20 rounded-full" />
687:       </div>
688:       <div className="h-20 bg-white/10 rounded-2xl" />
689:       <div className="grid grid-cols-2 gap-3">
690:         <div className="h-24 bg-white/10 rounded-[2rem]" />
691:         <div className="h-24 bg-white/10 rounded-[2rem]" />
692:       </div>
693:     </div>
694:   );
695: }
696: 
700: export default function StudentProfile() {
701:   const { user: authUser } = useAuth();
702:   const { theme } = useTheme();
703:   const isDark = theme === 'dark';
704:   const [profile, setProfile] = useState(null);
705:   const [loading, setLoading] = useState(true);
706:   const [avatarUrl, setAvatarUrl] = useState(null);
707:   const [mobileSettings, setMobileSettings] = useState(false);
708:   const [desktopPanel, setDesktopPanel] = useState(null);
709:   const [isGoalExpanded, setIsGoalExpanded] = useState(false);
710:   const [selectedGoal, setSelectedGoal] = useState(localStorage.getItem("selectedGoal") || "IIT JEE");
711:   const avatarRef = useRef(null);
712:   const passwordRef = useRef(null);
713: 
714:   const selectGoal = (goal) => {
715:     localStorage.setItem("selectedGoal", goal);
716:     setSelectedGoal(goal);
717:     setIsGoalExpanded(false);
718:     window.location.reload();
719:   };
720: 
721:   useEffect(() => {
722:     let cancelled = false;
723:     (async () => {
724:       setLoading(true);
725:       try {
726:         const { data } = await api.get("/student/profile");
727:         if (!cancelled) { setProfile(data); setAvatarUrl(data.profilePic || null); }
728:       } catch {
729:         if (!cancelled) setProfile(null);
730:       } finally {
731:         if (!cancelled) setLoading(false);
732:       }
733:     })();
734:     return () => { cancelled = true; };
735:   }, []);
736: 
737:   const getVal = (f) => profile?.[f] || authUser?.[f] || "N/A";
738:   const name = getVal("name");
739:   const resolveMediaUrl = (url) => {
740:     if (!url) return null;
741:     if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
742:     // In Electron, window.__API_URL__ is injected; strip /api suffix to get host
743:     const base = window.__API_URL__
744:       ? window.__API_URL__.replace(/\/api$/, '')
745:       : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
746:     return `${base}${url}`;
747:   };
748: 
749:   const resolved = resolveMediaUrl(avatarUrl || authUser?.profilePic) || DEFAULT_AVATAR(name);
750: 
751:   // ── Stats derived from profile.stats (already included in /student/profile response)
752:   const stats = profile?.stats || {};
753:   const instRank = stats.percentile || "N/A";
754:   const classRank = stats.classRank || "N/A";
755:   const stateRank = stats.stateRank || "N/A";
756:   const progress = stats.progress ?? 0;
757:   const accuracy = stats.accuracy ?? 0;
758: 
759:   const scrollWithOffset = (element, offset = 140) => {
760:     const y =
761:       element.getBoundingClientRect().top +
762:       window.pageYOffset -
763:       offset;
764: 
765:     window.scrollTo({
766:       top: y,
767:       behavior: "smooth"
768:     });
769:   };
770: 
771:   const togglePanel = (panel) => {
772:     const isClosing = desktopPanel === panel;
773:     const newPanel = isClosing ? null : panel;
774: 
775:     setDesktopPanel(newPanel);
776: 
777:     setTimeout(() => {
778: 
779:       // CASE 1: closing panel → scroll to top
780:       if (isClosing) {
781:         window.scrollTo({
782:           top: 0,
783:           behavior: "smooth"
784:         });
785:         return;
786:       }
787: 
788:       // CASE 2: opening avatar
789:       if (newPanel === "avatar" && avatarRef.current) {
790:         scrollWithOffset(avatarRef.current, 140);
791:       }
792: 
793:       // CASE 3: opening password
794:       if (newPanel === "password" && passwordRef.current) {
795:         scrollWithOffset(passwordRef.current, 140);
796:       }
797: 
800:     }, 120);
801:   };
802: 
803:   if (mobileSettings) {
804:     return (
805:       <>
806:         <GlobalStyles />
807:         <MobileSettingsPage
808:           onBack={() => setMobileSettings(false)}
809:           name={name}
810:           email={getVal("email")}
811:           avatarUrl={resolved}
812:           onAvatarChange={setAvatarUrl}
813: 
814:         />
815:       </>
816:     );
817:   }
818: 
819:   /* Academic detail cards config — same vibe as quiz cards */
820:   const mentors = profile?.batchId?.teachers || ["Dr. Aris", "Prof. K"];
821:   const academicCards = [
822:     {
823:       color: "bg-[#EBF3FF]",
824:       badge: "bg-[#D1E5FF]",
825:       label: "Institute",
826:       icon: <Globe size={18} className="text-[#2563EB]" />,
827:       value: profile?.instituteId?.name || "Name HQ",
828:       status: "Verified",
829:       statusColor: "text-[#2563EB]",
830:     },
831:     {
832:       color: "bg-[#FFF4EB]",
833:       badge: "bg-[#FFE9D6]",
834:       label: "Batch",
835:       icon: <Zap size={18} className="text-orange-500" />,
836:       value: profile?.batchId?.name || "Elite Batch",
837:       status: "Active",
838:       statusColor: "text-orange-500",
839:     },
840:   ];
841: 
842:   return (
843:     <>
844:       <GlobalStyles />
845:       <LoadingBar active={loading} />
846: 
847:       {/* ══════════════════════════════════════════
848:           DESKTOP  (lg+)
849:       ══════════════════════════════════════════ */}
850:       <div className="hidden lg:flex flex-col min-h-screen bg-[#F6F8FC]">
851:         <StudentHeader />
852: 
853:         <div className="flex-1 max-w-7xl mx-auto w-full px-8 xl:px-12 py-10 flex gap-8 items-start">
854: 
855:           {/* ── LEFT PURPLE CARD (sticky) ── */}
856:           <div className="w-[320px] xl:w-[360px] shrink-0 bg-[#7A41F7] rounded-lg flex flex-col relative overflow-hidden shadow-xl shadow-purple-200/40 self-start sticky top-[88px]">
857:             <div className="absolute left-[-50px] top-[-50px]  w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
858:             <div className="absolute right-[-60px] bottom-[-60px] w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
859:             <div className="absolute right-[5%] top-[45%] w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
860: 
861:             <div className="flex justify-between items-center px-6 pt-6 pb-2 relative z-10">
862:               <button onClick={() => window.history.back()} className="p-0.5 bg-transparent border-none text-white active:scale-95 transition-all">
863:                 <ArrowLeft size={16} strokeWidth={2.5} />
864:               </button>
865:               <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/40 font-body">Class ID</p>
866:               <button
867:                 onClick={() => togglePanel("avatar")}
868:                 className="p-2 bg-transparent border border-white/20 rounded-lg text-white hover:bg-white/10 active:scale-95 transition-all"
869:                 title="Change photo"
870:               >
871:                 <Camera size={16} strokeWidth={2.5} />
872:               </button>
873:             </div>
874: 
875:             {loading ? <DesktopLeftSkeleton /> : (
876:               <div className="flex flex-col items-center px-6 pt-4 pb-8 relative z-10 fade-up">
877:                 <div className="relative mb-4">
878:                   <div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 to-[#7A41F7] rounded-full blur-md opacity-30" />
879:                   <div className="relative w-24 h-24 bg-white rounded-full border-[5px] border-white shadow-xl overflow-hidden flex items-center justify-center">
880:                     {hasCustomAvatar(resolved) ? (
881:                       <img src={resolved} alt="Avatar" className="w-full h-full object-cover" onError={e => { e.target.src = DEFAULT_AVATAR(name); }} />
882:                     ) : (
883:                       <GraduationCap className="text-emerald-500 w-14 h-14" />
884:                     )}
885:                   </div>
886:                   <button
887:                     onClick={() => togglePanel("avatar")}
888:                     className="absolute -bottom-1 -right-1 bg-slate-900/90 text-amber-400 w-8 h-8 rounded-lg flex items-center justify-center shadow-xl border-2 border-white hover:bg-slate-800 transition-colors"
889:                   >
890:                     <Camera size={13} />
891:                   </button>
892:                 </div>
893: 
894:                 <h2 className="text-xl font-bold text-white uppercase italic tracking-tighter text-center leading-none mb-2 font-display">{name}</h2>
895: 
896:                 <div className="inline-flex items-center gap-1.5 px-5 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-400/30">
897:                   <ShieldCheck size={8} className="text-emerald-400 animate-pulse" />
898:                   <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-[0.2em] font-body">{profile?.studentId || "NX-8829"}</span>
899:                 </div>
900: 
901:                 <div className="w-full mt-6 bg-white/10 backdrop-blur-sm border border-white/10 rounded-sm p-4 flex justify-between items-center">
902:                   <StatItem icon={<Globe size={15} className="text-white/60" />} label="Predicted Percentile" value={`${instRank}`} />
903:                   <div className="w-[1px] h-7 bg-white/20" />
904:                   <StatItem icon={<MapPin size={15} className="text-white/60" />} label="Class" value={`${classRank}`} />
905:                   <div className="w-[1px] h-7 bg-white/20" />
906:                   <StatItem icon={<Star size={15} className="text-white/60" />} label="State Rank" value={`${stateRank}`} />
907:                 </div>
908: 
909:                 <div className="w-full mt-3 grid grid-cols-2 gap-3">
910:                   <MetricProgress label="Progress" value={progress} color="text-violet-200" bgColor="bg-white/10 border-white/10" icon={<Calendar size={13} />} desktop />
911:                   <MetricProgress label="Accuracy" value={accuracy} color="text-emerald-300" bgColor="bg-white/10 border-white/10" icon={<Target size={13} />} desktop />
912:                 </div>
913:               </div>
914:             )}
915:           </div>
916: 
917:           {/* ── RIGHT CONTENT ── */}
918:           <div className="flex-1 space-y-6 min-w-0">
919:             {loading ? (
920:               <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl" />)}</div>
921:             ) : (
922:               <div className="fade-up space-y-6">
923: 
924:                 {/* ── Academic Details — horizontal cards like quiz grid ── */}
925:                 <div>
926:                   {/* Main grid: 2 columns */}
927:                   <div className="grid grid-cols-2 gap-5 mb-5">
928: 
929:                     {/* LEFT SIDE — Institute and Batch stacked */}
930:                     <div className="flex flex-col gap-5">
931:                       {academicCards.slice(0, 2).map((card, index) => (
932:                         <div key={index} className={`${card.color} rounded-lg p-6`}>
933:                           <div className="flex gap-2 mb-5">
934:                             <div className={`${card.badge} px-3 py-1.5 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-slate-500/80 font-body`}>
935:                               {card.icon}{card.label}
936:                             </div>
937:                             <div className={`${card.badge} px-3 py-1.5 rounded-sm text-[11px] font-bold font-body ${card.statusColor}`}>
938:                               {card.status}
939:                             </div>
940:                           </div>
941: 
942:                           <h5 className="text-xl font-bold text-slate-900 tracking-tight leading-tight font-display">
943:                             {card.value}
944:                           </h5>
945:                         </div>
946:                       ))}
947:                     </div>
948: 
949:                     {/* RIGHT SIDE — Mentors card */}
950:                     <div className="bg-[#EBFDEB] rounded-lg p-6">
951:                       <div className="flex gap-2 mb-5">
952:                         <div className="bg-[#D6F7D6] px-3 py-1.5 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-slate-500/80 font-body">
953:                           <User size={15} className="text-emerald-600" />
954:                           Mentors
955:                         </div>
956: 
957:                         <div className="bg-[#D6F7D6] px-3 py-1.5 rounded-sm text-[11px] font-bold text-emerald-600 font-body">
958:                           Support Live
959:                         </div>
960:                       </div>
961: 
962:                       {/* Mentors in 2 columns */}
963:                       <div className="grid grid-cols-2 gap-2">
964:                         {mentors?.length > 0 ? (
965:                           mentors.map((m, i) => (
966:                             <div key={i} className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-sm">
967:                               <div className="w-6 h-6 rounded-sm bg-white flex items-center justify-center shrink-0 border border-emerald-100">
968:                                 <User size={12} className="text-emerald-600" />
969:                               </div>
970: 
971:                               <span className="text-[12px] font-semibold text-slate-700 font-body truncate">
972:                                 {m.name || m}
973:                               </span>
974:                             </div>
975:                           ))
976:                         ) : (
977:                           <span className="text-[12px] font-semibold text-slate-400 italic font-body col-span-2">
978:                             Unassigned
979:                           </span>
980:                         )}
981:                       </div>
982:                     </div>
983: 
984:                   </div>
985:                 </div>
986: 
987:                 <div className="h-px bg-slate-200" />
988: 
989:                 {/* ── Quick Actions ── */}
990:                 <div>
991:                   <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-5 font-display">__Quick Actions</h3>
992: 
993:                   <div>
994:                     <button
995:                       onClick={() => togglePanel("avatar")}
996:                       className="w-full bg-transparent border border-slate-200 rounded-sm p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
997:                     >
1000:                       <div className="w-11 h-11 bg-[#F3EBFF] rounded-sm flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
1001:                         <Camera size={20} className="text-[#7A41F7]" />
1002:                       </div>
1003:                       <div className="flex-1">
1004:                         <p className="text-xs font-bold text-slate-800 uppercase tracking-tight font-display">Change Avatar</p>
1005:                         <p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-body">Upload a new profile photo</p>
1006:                       </div>
1007:                       {desktopPanel === "avatar"
1008:                         ? <ChevronUp size={16} className="text-[#7A41F7]" strokeWidth={3} />
1009:                         : <ChevronDown size={16} className="text-slate-300" strokeWidth={3} />
1010:                       }
1011:                     </button>
1012:                     {desktopPanel === "avatar" && (
1013:                       <div ref={avatarRef}>
1014:                         <AvatarPanel
1015:                           name={name}
1016:                           avatarUrl={resolved}
1017:                           onAvatarChange={setAvatarUrl}
1018: 
1019:                           onClose={() => setDesktopPanel(null)}
1020:                         />
1021:                       </div>
1022:                     )}
1023:                   </div>
1024: 
1025:                   <div className="mt-4 mb-24">
1026:                     <button
1027:                       onClick={() => togglePanel("password")}
1028:                       className="w-full bg-transparent border border-slate-200 rounded-sm p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
1029:                     >
1030:                       <div className="w-11 h-11 bg-[#FFF4EB] rounded-sm flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
1031:                         <KeyRound size={20} className="text-amber-600" />
1032:                       </div>
1033:                       <div className="flex-1">
1034:                         <p className="text-xs font-bold text-slate-800 uppercase tracking-tight font-display">Change Password</p>
1035:                         <p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-body">Update your account credentials</p>
1036:                       </div>
1037:                       {desktopPanel === "password"
1038:                         ? <ChevronUp size={16} className="text-[#7A41F7]" strokeWidth={3} />
1039:                         : <ChevronDown size={16} className="text-slate-300" strokeWidth={3} />
1040:                       }
1041:                     </button>
1042:                     {desktopPanel === "password" && (
1043:                       <div ref={passwordRef}>
1044:                         <PasswordPanel
1045: 
1046:                           onClose={() => setDesktopPanel(null)}
1047:                         />
1048:                       </div>
1049:                     )}
1050:                   </div>
1051:                 </div>
1052:               </div>
1053:             )}
1054:           </div>
1055:         </div>
1056:       </div>
1057: 
1058:       {/* ══════════════════════════════════════════
1059:           MOBILE  (< lg) — Unacademy-style layout
1060:       ══════════════════════════════════════════ */}
1061:       <div className={`lg:hidden min-h-screen flex flex-col ${isDark ? 'bg-[#000711]' : 'bg-[#F4F7FC]'}`}>
1062: 
1063:         {/* Sticky Header containing Back button + Goal Info */}
1064:         <div
1065:           className={`sticky top-0 z-50 transition-all duration-300 ${isDark
1066:               ? 'bg-[#171F2A] rounded-b-lg'
1067:               : 'bg-white border-b border-slate-200'
1068:             }`}
1069:         >
1070:           {/* Fake Top Status Bar */}
1071:           <div style={{ height: STATUS_BAR_H }} className="w-full flex-shrink-0" />
1072: 
1073:           {/* Header Row */}
1074:           <div className="flex items-center gap-4 px-5 py-4">
1075:             <button onClick={() => window.history.back()} className={`p-0.5 bg-transparent border-none ${isDark ? 'text-slate-200' : 'text-slate-700'} active:scale-95 transition-all`}>
1076:               <ChevronLeft size={20} />
1077:             </button>
1078:             <h1 className={`text-[18px] font-bold tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile &amp; settings</h1>
1079:           </div>
1080: 
1081:           {/* Goal Box - merged into header layout */}
1082:           <div className="px-5 pb-5 pt-1 flex items-center justify-between">
1083:             <button onClick={() => setIsGoalExpanded(!isGoalExpanded)} className="flex items-center gap-3 text-left focus:outline-none">
1084:               <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-transparent">
1085:                 {getGoalIcon(selectedGoal)}
1086:               </div>
1087:               <div>
1088:                 <div className="flex items-center gap-1">
1089:                   <span className={`text-[16px] font-extrabold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
1090:                     {selectedGoal}
1091:                   </span>
1092:                   <ChevronDown size={14} className={`text-slate-440 mt-0.5 transition-transform duration-300 ${isGoalExpanded ? 'rotate-180' : ''}`} />
1093:                 </div>
1094:                 {authUser?.approved === false && (
1095:                   <p className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Free plan</p>
1096:                 )}
1097:               </div>
1098:             </button>
1099:             <button
1100:               onClick={() => setIsGoalExpanded(!isGoalExpanded)}
1101:               className={`px-4 py-2 text-[13px] font-bold rounded-lg border bg-transparent transition-all active:scale-95 ${isDark
1102:                   ? 'border-slate-800 text-white hover:bg-slate-850/45'
1103:                   : 'border-slate-300 text-slate-800 hover:bg-slate-105/55'
1104:                 }`}
1105:             >
1106:               Manage
1107:             </button>
1108:           </div>
1109: 
1110:           {/* Expanded Goal Selection */}
1111:           <div
1112:             className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-0 border-t ${isDark ? 'border-slate-800/60' : 'border-slate-100'
1113:               } ${isGoalExpanded ? 'max-h-[200px] opacity-100 py-1' : 'max-h-0 opacity-0 pointer-events-none'}`}
1114:           >
1115:             {['Boards', 'MHT-CET'].map(goal => {
1116:               const isSelected = selectedGoal === goal;
1117:               return (
1118:                 <button
1119:                   key={goal}
1120:                   onClick={() => selectGoal(goal)}
1121:                   className={`
1122:                     w-full py-3 px-5 flex items-center justify-between transition-colors text-left
1123:                     ${isDark ? 'hover:bg-slate-800/40 text-white' : 'hover:bg-slate-50 text-slate-800'}
1124:                     ${isSelected ? 'font-bold' : 'font-semibold'}
1125:                   `}
1126:                 >
1127:                   <div className="flex items-center gap-3">
1128:                     <div className={`w-4 h-4 rounded-full border-[2px] flex items-center justify-center transition-colors
1129:                       ${isSelected
1130:                         ? 'border-[#7A41F7]'
1131:                         : (isDark ? 'border-slate-700' : 'border-slate-300')}
1132:                     `}>
1133:                       {isSelected && (
1134:                         <div className="w-2 h-2 rounded-full bg-[#7A41F7]" />
1135:                       )}
1136:                     </div>
1137:                     <span className="text-sm font-display">{goal}</span>
1138:                   </div>
1139:                 </button>
1140:               );
1141:             })}
1142:           </div>
1143:         </div>
1144: 
1145:         {/* Scrollable Content */}
1146:         <div className={`flex-1 overflow-y-auto px-2 pt-3 pb-28 space-y-2.5 ${isDark ? 'bg-[#000711]' : 'bg-[#F4F7FC]'}`}>
1147:           {/* Store Card */}
1148:           <div className={`rounded-lg px-4 py-4.5 flex items-center justify-between border shadow-sm ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'}`}>
1149:             <div className="flex-1 pr-4">
1150:               <h3 className={`text-[16px] font-extrabold font-display mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Store</h3>
1151:               <p className={`text-[12px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Exclusive batches, Previous year question papers, Test series.</p>
1152:             </div>
1153:             <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ${isDark ? 'bg-[#000711]/60' : 'bg-teal-50'}`}>
1154:               <ShoppingBag size={24} className="text-teal-500" />
1155:             </div>
1156:           </div>
1157: 
1158:           {/* Profile Card */}
1159:           <div className={`rounded-lg px-4 py-4.5 flex items-center gap-4 border shadow-sm ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'}`}>
1160:             {/* Avatar with badge */}
1161:             <div className="relative shrink-0">
1162:               <div className={`w-[72px] h-[72px] rounded-sm overflow-hidden border-[2.5px] border-emerald-500 flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-700'}`}>
1163:                 {loading
1164:                   ? <div className="w-full h-full bg-slate-600 animate-pulse" />
1165:                   : hasCustomAvatar(resolved) ? (
1166:                     <img src={resolved} alt="Avatar" className="w-full h-full object-cover" onError={e => { e.target.src = DEFAULT_AVATAR(name); }} />
1167:                   ) : (
1168:                     <GraduationCap className="text-emerald-500 w-11 h-11" />
1169:                   )
1170:                 }
1171:               </div>
1172:               {/* Gold diamond badge */}
1173:               <div className={`absolute -bottom-1.5 -right-1.5 w-[22px] h-[22px] bg-amber-400 rounded-[5px] rotate-45 border-2 shadow-md flex items-center justify-center ${isDark ? 'border-[#171F2A]' : 'border-white'}`}>
1174:                 <div className="-rotate-45 w-2.5 h-2.5 bg-white/70 rounded-sm" />
1175:               </div>
1176:             </div>
1177:             <div className="flex-1 min-w-0">
1178:               <h2 className={`text-[18px] font-extrabold font-display leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</h2>
1179:               <p className="text-[13px] font-bold text-amber-500 mt-0.5">Beginner &bull; 345</p>
1180:               <div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border ${isDark ? 'bg-[#000711] border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
1181:                 <Medal size={11} className={isDark ? 'text-slate-400' : 'text-slate-550'} />
1182:                 <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Rank 2,16,845 in {localStorage.getItem('selectedGoal') || 'IIT JEE'}</span>
1183:               </div>
1184:             </div>
1185:           </div>
1186: 
1187:           {/* My Library */}
1188:           <div className={`rounded-lg px-4 py-4.5 border shadow-sm ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'}`}>
1189:             <h3 className={`text-[16px] font-extrabold font-display mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>My library</h3>
1190:             <div className="grid grid-cols-2 gap-2">
1191:               {[
1192:                 { icon: <PlaySquare size={18} className="text-emerald-500" />, label: 'Enrollments' },
1193:                 { icon: <Download size={18} className="text-purple-500" />, label: 'Downloads' },
1194:                 { icon: <Bell size={18} className="text-teal-500" />, label: 'Updates' },
1195:                 { icon: <Users size={18} className="text-blue-500" />, label: 'My educators' },
1196:                 { icon: <HelpCircle size={18} className="text-sky-500" />, label: 'FAQs' },
1197:                 { icon: <Settings size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />, label: 'Settings', action: () => setMobileSettings(true) },
1198:               ].map((item, i) => (
1199:                 <button
1200:                   key={i}
1201:                   onClick={item.action}
1202:                   className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border bg-transparent text-left active:scale-95 transition-all ${isDark ? 'border-slate-800/80 hover:bg-slate-800/20' : 'border-slate-200 hover:bg-slate-50/50'}`}
1203:                 >
1204:                   {item.icon}
1205:                   <span className={`text-[13px] font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
1206:                 </button>
1207:               ))}
1208:             </div>
1209:           </div>
1210: 
1211:           {/* Activity */}
1212:           <div className={`rounded-lg px-5 py-5 border shadow-sm ${isDark ? 'bg-[#171F2A] border-transparent' : 'bg-white border-slate-200'}`}>
1213:             <h3 className={`text-[16px] font-extrabold font-display mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Activity</h3>
1214:             <p className={`text-[12px] font-medium mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
1215:               Daily stats on how much you learn &amp; practice
1216:             </p>
1217:             <div className={`flex items-center justify-center py-8 border-t border-dashed ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
1218:               <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No activity yet — start learning!</span>
1219:             </div>
1220:           </div>
1221:         </div>
1222:       </div>"""

rest_of_file = """
/* ────────────────────────────────
   SHARED SUB-COMPONENTS
──────────────────────────────── */
const StatItem = ({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-1.5 relative z-10 hover:scale-105 transition-transform duration-300">
    <div className="flex flex-col items-center gap-1 opacity-80">
      <div className="mb-0.5">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] leading-none text-white/80 font-body">{label}</span>
    </div>
    <span className="text-xl font-bold tracking-tighter italic leading-none text-white font-display">{value}</span>
  </div>
);

const MetricProgress = ({ label, value, color, bgColor, icon, desktop = false }) => (
  <div className={`${bgColor} p-5 rounded-lg border flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-sm ${desktop ? "bg-white/10" : "bg-white/60"} shadow-inner ${color}`}>{icon}</div>
      <p className={`text-[10px] font-bold uppercase tracking-widest leading-none font-body ${desktop ? "text-white/60" : "text-slate-500"}`}>{label}</p>
    </div>
    <div className="flex items-end justify-between w-full">
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90 drop-shadow-sm">
          <circle cx="24" cy="24" r="20" stroke="rgba(0,0,0,0.05)" strokeWidth="5" fill="transparent" />
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="5" fill="transparent"
            strokeDasharray={126} strokeDashoffset={126 - (126 * value) / 100}
            strokeLinecap="round" className={`${color} transition-all duration-1000`} />
        </svg>
        <span className={`absolute text-[9px] font-bold ${color} font-body`}>{value}%</span>
      </div>
      <p className={`text-2xl font-bold italic tracking-tighter ${color} leading-none font-display`}>
        {value}<span className="text-[10px] not-italic opacity-50 ml-0.5">%</span>
      </p>
    </div>
  </div>
);

const InfoRow = ({ label, value, status, icon, theme, isMentorList, mentors }) => {
  const themes = {
    indigo: "bg-[#F3EBFF] text-[#7A41F7] border-[#E6D6FF]",
    amber: "bg-[#FFF4EB] text-orange-600 border-[#FFE9D6]",
    emerald: "bg-[#EBFDEB] text-emerald-600 border-[#D6F7D6]",
  };
  return (
    <div className="flex items-start justify-between bg-white p-4 py-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 shadow-inner group-hover:bg-white transition-colors mt-1">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-none mb-2.5 font-body">{label}</p>
          {isMentorList ? (
            <div className="flex flex-col gap-2">
              {mentors?.length > 0
                ? mentors.map((m, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100/50">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-100">
                      <User size={12} className="text-[#7A41F7]" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 uppercase italic tracking-tighter font-body">{m.name || m}</span>
                  </div>
                ))
                : <span className="text-[10px] font-semibold text-slate-400 italic px-1 font-body">Unassigned</span>
              }
            </div>
          ) : (
            <p className="text-[14px] font-bold text-slate-800 uppercase italic tracking-tighter leading-tight mt-1 font-display">{value}</p>
          )}
        </div>
      </div>
      {status && (
        <div className={`${themes[theme] || themes.indigo} px-3 py-1.5 rounded-xl text-[7px] font-bold uppercase tracking-tighter shrink-0 border ml-3 mt-1 font-body`}>{status}</div>
      )}
    </div>
  );
};
"""

# Strip the line numbers from block_450_1249_raw using a simple regex loop
block_450_1249_lines = block_450_1249_raw.splitlines()
block_450_1249_clean = []
for line in block_450_1249_lines:
    # Match lines starting with digits followed by colon and optional space
    m = re.match(r"^\d+:\s*(.*)", line)
    if m:
        block_450_1249_clean.append(m.group(1))
    else:
        block_450_1249_clean.append(line)

block_450_1249 = "\n".join(block_450_1249_clean)

# Now combine the parts
full_content = (
    block_1_100.strip() + "\n" +
    step_794_components.strip() + "\n" +
    clean_panels_block.strip() + "\n" +
    fsv_top.strip() + "\n" +
    block_450_1249.strip() + "\n" +
    rest_of_file.strip()
)

with open(clean_file_path, "w", encoding="utf-8") as f:
    f.write(full_content)

print("Reconstruction script completed successfully!")
