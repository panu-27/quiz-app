import { useEffect, useRef, useState } from "react";
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
function LockedField({ label, value, icon, isDark }) {
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
function AvatarPanel({ name, avatarUrl, onAvatarChange, onClose }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      await api.post("/student/updateavatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onAvatarChange(preview);
      setToast({ msg: "Photo updated!", type: "success" });
      setTimeout(onClose, 1400);
    } catch {
      setToast({ msg: "Upload failed. Try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="slide-down panel-open bg-white border border-slate-100 rounded-3xl p-6 shadow-md mt-2">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-body">Change Profile Photo</p>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"><X size={14} className="text-slate-400" /></button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />

      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-md bg-slate-50">
            <img
              src={preview || avatarUrl}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={e => { e.target.src = DEFAULT_AVATAR(name); }}
            />
          </div>
          {preview && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
              <Check size={10} className="text-white" />
            </div>
          )}
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#7A41F7] rounded-2xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:bg-indigo-50/30 group"
        >
          <Upload size={20} className="text-slate-300 group-hover:text-[#7A41F7] transition-colors" />
          <p className="text-xs font-semibold text-slate-500 group-hover:text-[#7A41F7] transition-colors font-body">
            {preview ? "Click to change" : "Click to upload photo"}
          </p>
          <p className="text-[10px] text-slate-300 font-body">JPG, PNG, WEBP — max 5 MB</p>
        </div>
      </div>

      {preview && (
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => { setPreview(null); setFile(null); }}
            className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors font-body"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#7A41F7] hover:bg-[#6832E3] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.97] font-body"
          >
            {saving ? "Saving…" : "Save Photo"}
          </button>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

/* ── Fixed Password panel (Desktop) ── */
function PasswordPanel({ onClose }) {
  // Added oldPassword to state
  const [form, setForm] = useState({ oldPassword: "", password: "", confirm: "" });
  const [showO, setShowO] = useState(false);
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const mismatch = form.password && form.confirm && form.password !== form.confirm;

  const save = async () => {
    if (!form.oldPassword || !form.password || mismatch) return;
    if (form.password.length < 6) {
      setToast({ msg: "Min 6 characters required.", type: "error" });
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/update-password", {
        oldPassword: form.oldPassword,
        newPassword: form.password,
      });
      setToast({ msg: "Password changed!", type: "success" });
      setForm({ oldPassword: "", password: "", confirm: "" });
      setTimeout(onClose, 1400);
    } catch (err) {
      setToast({ msg: err.response?.data?.message || "Failed. Try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="slide-down panel-open bg-white border border-slate-100 rounded-3xl p-6 shadow-md mt-2">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-body">Change Password</p>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"><X size={14} className="text-slate-400" /></button>
      </div>

      <div className="space-y-3">
        <PassInput label="Current Password" value={form.oldPassword} onChange={v => setForm(f => ({ ...f, oldPassword: v }))} show={showO} onToggle={() => setShowO(!showO)} />
        <PassInput label="New Password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} show={showP} onToggle={() => setShowP(!showP)} />
        <PassInput label="Confirm New Password" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} show={showC} onToggle={() => setShowC(!showC)} />

        {mismatch && (
          <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1.5 px-1 font-body">
            <AlertCircle size={11} /> Passwords don't match
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors font-body">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !form.password || !form.oldPassword || !!mismatch}
            className="flex-1 py-2.5 bg-[#7A41F7] hover:bg-[#6832E3] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.97] font-body"
          >
            {saving ? "Saving…" : "Update Password"}
          </button>
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
function FullSettingsView({ onBack, name, email, avatarUrl, onAvatarChange }) {
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
          paddingTop: STATUS_BAR_H
        }}
      >
        
        {/* Header Row */}
        <div className="px-5 py-4 flex items-center gap-4">
          <button onClick={onBack} className={`p-0.5 bg-transparent border-none ${isDark ? 'text-slate-300' : 'text-slate-700'} active:scale-95 transition-all`}>
            <ChevronLeft size={16} />
          </button>
          <h1 className={`text-base -ml-2 font-bold uppercase tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-16">
        {/* Profile Photo Section */}
        <section className={`rounded-3xl p-5 shadow-sm border ${isDark ? 'bg-[#171F2A] border-slate-800/85' : 'bg-white border-slate-100'}`}>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-body">Profile Photo</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative shrink-0">
              <div className={`w-20 h-20 rounded-full overflow-hidden border-2 shadow bg-slate-50 ${isDark ? 'border-slate-850' : 'border-slate-100'}`}>
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
          <div className={`border rounded-2xl px-4 py-3 flex items-start gap-2.5 mb-4 ${isDark ? 'bg-amber-950/20 border-amber-900/35 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
<AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
<p className="text-[11px] font-semibold leading-snug font-body">Use at least 6 characters. You'll stay logged in after changing.</p>
</div>
<div className="space-y-3">
<PassInput label="Current Password" value={passForm.oldPassword} onChange={v => setPassForm(f => ({ ...f, oldPassword: v }))} show={showO} onToggle={() => setShowO(!showO)} isDark={isDark} />
<PassInput label="New Password" value={passForm.password} onChange={v => setPassForm(f => ({ ...f, password: v }))} show={showP} onToggle={() => setShowP(!showP)} isDark={isDark} />
<PassInput label="Confirm Password" value={passForm.confirm} onChange={v => setPassForm(f => ({ ...f, confirm: v }))} show={showC} onToggle={() => setShowC(!showC)} isDark={isDark} />
{mismatch && <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1.5 px-1 font-body"><AlertCircle size={11} /> Passwords don't match</p>}
</div>
<button
onClick={savePassword}
disabled={passSaving || !passForm.password || !passForm.oldPassword || !!mismatch}
className="w-full mt-4 py-3.5 bg-transparent border border-[#7A41F7] hover:bg-[#7A41F7]/10 disabled:opacity-40 text-[#7A41F7] font-bold text-xs uppercase tracking-widest rounded-lg active:scale-[0.97] transition-all font-body"
>
{passSaving ? "Updating…" : "Update Password"}
</button>
</section>

{/* Logout Section */}
<section className={`rounded-lg p-5 shadow-sm border ${isDark ? 'bg-[#171F2A] border-slate-800/85' : 'bg-white border-slate-100'}`}>
<p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-body">Account</p>
<button
onClick={handleLogout}
className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border bg-transparent transition-all active:scale-[0.98] ${isDark ? 'border-rose-900/40 hover:bg-rose-950/10' : 'border-rose-250 hover:bg-rose-50'}`}
>
<div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${isDark ? 'bg-rose-900/40' : 'bg-rose-100'}`}><LogOut size={16} className="text-rose-500" /></div>
<div className="text-left flex-1">
<p className="text-xs font-bold text-rose-500 uppercase tracking-tight font-display">Sign Out</p>
<p className="text-[9px] text-rose-400 font-semibold mt-0.5 font-body">See you soon!</p>
</div>
<ChevronRight size={14} className="text-rose-300" strokeWidth={3} />
</button>
</section>

<p className="text-[9px] text-center text-slate-300 font-semibold uppercase tracking-widest font-body">app v2.4.1</p>
</div>

{toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
</div>
);
}

function MobileSettingsPage({ onBack, name, email, avatarUrl, onAvatarChange }) {
const { theme } = useTheme();
const { user } = useAuth();
const isDark = theme === "dark";
const [showFullSettings, setShowFullSettings] = useState(false);
const [isGoalExpanded, setIsGoalExpanded] = useState(false);
const [selectedGoal, setSelectedGoal] = useState(localStorage.getItem("selectedGoal") || "IIT JEE");

const selectGoal = (goal) => {
localStorage.setItem("selectedGoal", goal);
setSelectedGoal(goal);
setIsGoalExpanded(false);
window.location.reload();
};

// We can pass stats from the parent StudentProfile, but for now we'll just mock or use the defaults from localStorage/api if needed.
// Actually, StudentProfile parent passes stats? Let's check: It didn't pass stats before, so we'll just use dummy/fallback or fetch if needed.

if (showFullSettings) {
return <FullSettingsView onBack={() => setShowFullSettings(false)} name={name} email={email} avatarUrl={avatarUrl} onAvatarChange={onAvatarChange} />;
}

return (
<div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0A0F1A]' : 'bg-[#F4F7FC]'}`}>
{/* Header */}
<div
className={`sticky top-0 z-50 transition-all duration-300 ${isDark ? 'bg-[#0A0F1A]' : 'bg-white border-b border-slate-200'}`}
style={{ paddingTop: STATUS_BAR_H }}
>
{/* Header Row */}
<div className="flex items-center gap-4 px-5 py-4">
<button onClick={onBack} className={`p-0.5 bg-transparent border-none ${isDark ? 'text-slate-200' : 'text-slate-700'} active:scale-95 transition-all`}>
<ChevronLeft size={20} />
</button>
<h1 className={`text-[19px] font-bold tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile &amp; settings</h1>
</div>
</div>

<div className={`flex-1 overflow-y-auto px-4 pt-2 pb-28 space-y-3 ${isDark ? 'bg-[#0A0F1A]' : 'bg-[#F4F7FC]'}`}>

{/* Goal Box as a separate card */}
<div className={`rounded-xl px-5 py-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<button onClick={() => setIsGoalExpanded(!isGoalExpanded)} className="flex items-center gap-3 text-left focus:outline-none flex-1">
<div className="w-10 h-10 flex items-center justify-center shrink-0 bg-transparent scale-100 origin-center">
{getGoalIcon(selectedGoal)}
</div>
<div>
<div className="flex items-center gap-1.5">
<span className={`text-[15px] font-semibold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
{selectedGoal}
</span>
<ChevronDown size={14} className={`text-slate-400 mt-0.5 transition-transform duration-300 ${isGoalExpanded ? 'rotate-180' : ''}`} />
</div>
{user?.approved === false && (
<p className={`text-[12px] font-medium leading-none mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Free plan</p>
)}
</div>
</button>
<button
onClick={() => setIsGoalExpanded(!isGoalExpanded)}
className={`px-4 py-1.5 text-[12px] font-bold rounded-lg border bg-transparent transition-all active:scale-95 ${isDark
? 'border-[#2A3649] text-white hover:bg-slate-800'
: 'border-slate-300 text-slate-800 hover:bg-slate-50'
}`}
>
Manage
</button>
</div>

{/* Expanded Goal Selection */}
<div
className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-0 rounded-xl ${
isGoalExpanded ? 'max-h-[200px] opacity-100 py-1 mb-3 bg-[#151E2E]' : 'max-h-0 opacity-0 pointer-events-none'
}`}
>
{['Boards', 'MHT-CET']
.filter(goal => goal.toLowerCase() !== selectedGoal.toLowerCase())
.map(goal => (
<button
key={goal}
onClick={() => selectGoal(goal)}
className={`
w-full py-2.5 px-5 flex items-center gap-3 transition-colors text-left
${isDark ? 'hover:bg-slate-800/40 text-white' : 'hover:bg-slate-50 text-slate-800'}
`}
>
<div className="w-8 h-8 flex items-center justify-center shrink-0 bg-transparent scale-75 origin-center">
{getGoalIcon(goal)}
</div>
<div>
<span className={`text-[14px] font-semibold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>{goal}</span>
</div>
</button>
))
}
</div>

{/* Store Box */}
<div className={`rounded-xl px-5 py-5 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<div className="flex-1 pr-4">
<h3 className={`text-[16px] font-bold font-display mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Target Coaching Classes Store</h3>
<p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Exclusive batches, Previous year question papers, Test series.</p>
</div>
<div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
<ShoppingBag size={32} className="text-[#00E2B8] fill-[#00E2B8]/20" strokeWidth={1.5} />
</div>
</div>

{/* Profile Info Box */}
<div className={`rounded-xl px-5 py-5 flex flex-col gap-4 shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<div className="flex items-center gap-4">
{/* Avatar with badge */}
<div className="relative shrink-0">
<div className={`w-[72px] h-[72px] rounded-full overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-700'}`}>
{hasCustomAvatar(avatarUrl) ? (
<img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
) : (
<GraduationCap className="text-emerald-500 w-11 h-11" />
)}
</div>
{/* Gold diamond badge */}
<div className={`absolute -bottom-1 -right-1 w-[26px] h-[26px] bg-[#FBBF24] rounded-[6px] rotate-45 flex items-center justify-center ${isDark ? 'border-2 border-[#151E2E]' : 'border-2 border-white'}`}>
<div className="-rotate-45 w-3 h-3 bg-white/80 rounded-[3px]" />
</div>
</div>
<div className="flex-1 min-w-0">
<h2 className={`text-[19px] font-bold font-display leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</h2>
<p className="text-[14px] font-semibold text-[#EAB308] mt-0.5">Beginner • 345</p>
<div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isDark ? 'border-[#334155] bg-transparent' : 'border-slate-200 bg-slate-50'}`}>
<Medal size={13} className={isDark ? 'text-slate-400' : 'text-slate-550'} />
<span className={`text-[12px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Rank 2,16,845 in {localStorage.getItem('selectedGoal') || 'IIT JEE'}</span>
</div>
</div>
</div>
</div>

{/* My Library Section */}
<div className={`rounded-xl px-5 py-5 shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<h3 className={`text-[17px] font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>My library</h3>
<div className="grid grid-cols-2 gap-3">
{[
{ icon: <PlaySquare size={18} className="text-[#00E2B8]" />, label: "Enrollments" },
{ icon: <Download size={18} className="text-[#A855F7]" />, label: "Downloads" },
{ icon: <Bell size={18} className="text-[#00E2B8]" />, label: "Updates" },
{ icon: <Users size={18} className="text-[#3B82F6]" />, label: "My educators" },
{ icon: <HelpCircle size={18} className="text-[#3B82F6]" />, label: "FAQs" },
{ icon: <Settings size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />, label: "Settings", action: () => setShowFullSettings(true) }
].map((item, i) => (
<button key={i} onClick={item.action} className={`flex items-center gap-3 px-4 py-4 rounded-xl border bg-transparent text-left active:scale-95 transition-all ${isDark ? 'border-[#2A3649] hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50'}`}>
{item.icon}
<span className={`text-[14px] font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
</button>
))}
</div>
</div>

{/* Activity Section */}
<div className={`rounded-xl px-5 py-5 shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<h3 className={`text-[17px] font-bold font-display mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Activity</h3>
<p className={`text-[13px] font-medium mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Daily stats on how much you learn & practice</p>
<div className={`flex items-center justify-center py-8 border-t ${isDark ? 'border-[#2A3649]' : 'border-slate-200'}`}>
<span className={`text-[13px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No activity yet — start learning!</span>
</div>
</div>
</div>
</div>
);
}

/* ════════════════════════════════════════════════════
SKELETON BLOCKS
════════════════════════════════════════════════════ */
function MobileSkeleton() {
return (
<div className="pt-20 px-5 animate-pulse space-y-4">
<div className="flex flex-col items-center gap-3">
<div className="w-40 h-6 bg-slate-100 rounded-full" />
<div className="w-24 h-4 bg-slate-100 rounded-full" />
</div>
<div className="h-28 bg-slate-100 rounded-[2rem]" />
<div className="grid grid-cols-2 gap-4">
<div className="h-32 bg-slate-100 rounded-[2rem]" />
<div className="h-32 bg-slate-100 rounded-[2rem]" />
</div>
<div className="space-y-3">
{[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-[2rem]" />)}
</div>
</div>
);
}

function DesktopLeftSkeleton() {
return (
<div className="animate-pulse space-y-5 px-6 pt-4 pb-8">
<div className="flex flex-col items-center gap-3">
<div className="w-24 h-24 bg-white/20 rounded-full" />
<div className="w-36 h-5 bg-white/20 rounded-full" />
<div className="w-20 h-4 bg-white/20 rounded-full" />
</div>
<div className="h-20 bg-white/10 rounded-2xl" />
<div className="grid grid-cols-2 gap-3">
<div className="h-24 bg-white/10 rounded-[2rem]" />
<div className="h-24 bg-white/10 rounded-[2rem]" />
</div>
</div>
);
}

export default function StudentProfile() {
const { user: authUser } = useAuth();
const { theme } = useTheme();
const isDark = theme === 'dark';
const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
const [avatarUrl, setAvatarUrl] = useState(null);
const [mobileSettings, setMobileSettings] = useState(false);
const [desktopPanel, setDesktopPanel] = useState(null);
const [isGoalExpanded, setIsGoalExpanded] = useState(false);
const [selectedGoal, setSelectedGoal] = useState(localStorage.getItem("selectedGoal") || "IIT JEE");
const avatarRef = useRef(null);
const passwordRef = useRef(null);

const selectGoal = (goal) => {
localStorage.setItem("selectedGoal", goal);
setSelectedGoal(goal);
setIsGoalExpanded(false);
window.location.reload();
};

useEffect(() => {
let cancelled = false;
(async () => {
setLoading(true);
try {
const { data } = await api.get("/student/profile");
if (!cancelled) { setProfile(data); setAvatarUrl(data.profilePic || null); }
} catch {
if (!cancelled) setProfile(null);
} finally {
if (!cancelled) setLoading(false);
}
})();
return () => { cancelled = true; };
}, []);

const getVal = (f) => profile?.[f] || authUser?.[f] || "N/A";
const name = getVal("name");
const resolveMediaUrl = (url) => {
if (!url) return null;
if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
// In Electron, window.__API_URL__ is injected; strip /api suffix to get host
const base = window.__API_URL__
? window.__API_URL__.replace(/\/api$/, '')
: (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
return `${base}${url}`;
};

const resolved = resolveMediaUrl(avatarUrl || authUser?.profilePic) || DEFAULT_AVATAR(name);

// ── Stats derived from profile.stats (already included in /student/profile response)
const stats = profile?.stats || {};
const instRank = stats.percentile || "N/A";
const classRank = stats.classRank || "N/A";
const stateRank = stats.stateRank || "N/A";
const progress = stats.progress ?? 0;
const accuracy = stats.accuracy ?? 0;

const scrollWithOffset = (element, offset = 140) => {
const y =
element.getBoundingClientRect().top +
window.pageYOffset -
offset;

window.scrollTo({
top: y,
behavior: "smooth"
});
};

const togglePanel = (panel) => {
const isClosing = desktopPanel === panel;
const newPanel = isClosing ? null : panel;

setDesktopPanel(newPanel);

setTimeout(() => {

// CASE 1: closing panel → scroll to top
if (isClosing) {
window.scrollTo({
top: 0,
behavior: "smooth"
});
return;
}

// CASE 2: opening avatar
if (newPanel === "avatar" && avatarRef.current) {
scrollWithOffset(avatarRef.current, 140);
}

// CASE 3: opening password
if (newPanel === "password" && passwordRef.current) {
scrollWithOffset(passwordRef.current, 140);
}

}, 120);
};

if (mobileSettings) {
return (
<>
<GlobalStyles />
<MobileSettingsPage
onBack={() => setMobileSettings(false)}
name={name}
email={getVal("email")}
avatarUrl={resolved}
onAvatarChange={setAvatarUrl}

/>
</>
);
}

/* Academic detail cards config — same vibe as quiz cards */
const mentors = profile?.batchId?.teachers || ["Dr. Aris", "Prof. K"];
const academicCards = [
{
color: "bg-[#EBF3FF]",
badge: "bg-[#D1E5FF]",
label: "Institute",
icon: <Globe size={18} className="text-[#2563EB]" />,
value: profile?.instituteId?.name || "Name HQ",
status: "Verified",
statusColor: "text-[#2563EB]",
},
{
color: "bg-[#FFF4EB]",
badge: "bg-[#FFE9D6]",
label: "Batch",
icon: <Zap size={18} className="text-orange-500" />,
value: profile?.batchId?.name || "Elite Batch",
status: "Active",
statusColor: "text-orange-500",
},
];

return (
<>
<GlobalStyles />
<LoadingBar active={loading} />

{/* ══════════════════════════════════════════
DESKTOP  (lg+)
══════════════════════════════════════════ */}
<div className="hidden lg:flex flex-col min-h-screen bg-[#F6F8FC]">
<StudentHeader />

<div className="flex-1 max-w-7xl mx-auto w-full px-8 xl:px-12 py-10 flex gap-8 items-start">

{/* ── LEFT PURPLE CARD (sticky) ── */}
<div className="w-[320px] xl:w-[360px] shrink-0 bg-[#7A41F7] rounded-lg flex flex-col relative overflow-hidden shadow-xl shadow-purple-200/40 self-start sticky top-[88px]">
<div className="absolute left-[-50px] top-[-50px]  w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
<div className="absolute right-[-60px] bottom-[-60px] w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
<div className="absolute right-[5%] top-[45%] w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

<div className="flex justify-between items-center px-6 pt-6 pb-2 relative z-10">
<button onClick={() => window.history.back()} className="p-0.5 bg-transparent border-none text-white active:scale-95 transition-all">
<ArrowLeft size={16} strokeWidth={2.5} />
</button>
<p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/40 font-body">Class ID</p>
<button
onClick={() => togglePanel("avatar")}
className="p-2 bg-transparent border border-white/20 rounded-lg text-white hover:bg-white/10 active:scale-95 transition-all"
title="Change photo"
>
<Camera size={16} strokeWidth={2.5} />
</button>
</div>

{loading ? <DesktopLeftSkeleton /> : (
<div className="flex flex-col items-center px-6 pt-4 pb-8 relative z-10 fade-up">
<div className="relative mb-4">
<div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 to-[#7A41F7] rounded-full blur-md opacity-30" />
<div className="relative w-24 h-24 bg-white rounded-full border-[5px] border-white shadow-xl overflow-hidden flex items-center justify-center">
{hasCustomAvatar(resolved) ? (
<img src={resolved} alt="Avatar" className="w-full h-full object-cover" onError={e => { e.target.src = DEFAULT_AVATAR(name); }} />
) : (
<GraduationCap className="text-emerald-500 w-14 h-14" />
)}
</div>
<button
onClick={() => togglePanel("avatar")}
className="absolute -bottom-1 -right-1 bg-slate-900/90 text-amber-400 w-8 h-8 rounded-lg flex items-center justify-center shadow-xl border-2 border-white hover:bg-slate-800 transition-colors"
>
<Camera size={13} />
</button>
</div>

<h2 className="text-xl font-bold text-white uppercase italic tracking-tighter text-center leading-none mb-2 font-display">{name}</h2>

<div className="inline-flex items-center gap-1.5 px-5 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-400/30">
<ShieldCheck size={8} className="text-emerald-400 animate-pulse" />
<span className="text-[11px] font-bold text-emerald-300 uppercase tracking-[0.2em] font-body">{profile?.studentId || "NX-8829"}</span>
</div>

<div className="w-full mt-6 bg-white/10 backdrop-blur-sm border border-white/10 rounded-sm p-4 flex justify-between items-center">
<StatItem icon={<Globe size={15} className="text-white/60" />} label="Predicted Percentile" value={`${instRank}`} />
<div className="w-[1px] h-7 bg-white/20" />
<StatItem icon={<MapPin size={15} className="text-white/60" />} label="Class" value={`${classRank}`} />
<div className="w-[1px] h-7 bg-white/20" />
<StatItem icon={<Star size={15} className="text-white/60" />} label="State Rank" value={`${stateRank}`} />
</div>

<div className="w-full mt-3 grid grid-cols-2 gap-3">
<MetricProgress label="Progress" value={progress} color="text-violet-200" bgColor="bg-white/10 border-white/10" icon={<Calendar size={13} />} desktop />
<MetricProgress label="Accuracy" value={accuracy} color="text-emerald-300" bgColor="bg-white/10 border-white/10" icon={<Target size={13} />} desktop />
</div>
</div>
)}
</div>

{/* ── RIGHT CONTENT ── */}
<div className="flex-1 space-y-6 min-w-0">
{loading ? (
<div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-3xl" />)}</div>
) : (
<div className="fade-up space-y-6">

{/* ── Academic Details — horizontal cards like quiz grid ── */}
<div>
{/* Main grid: 2 columns */}
<div className="grid grid-cols-2 gap-5 mb-5">

{/* LEFT SIDE — Institute and Batch stacked */}
<div className="flex flex-col gap-5">
{academicCards.slice(0, 2).map((card, index) => (
<div key={index} className={`${card.color} rounded-lg p-6`}>
<div className="flex gap-2 mb-5">
<div className={`${card.badge} px-3 py-1.5 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-slate-500/80 font-body`}>
{card.icon}{card.label}
</div>
<div className={`${card.badge} px-3 py-1.5 rounded-sm text-[11px] font-bold font-body ${card.statusColor}`}>
{card.status}
</div>
</div>

<h5 className="text-xl font-bold text-slate-900 tracking-tight leading-tight font-display">
{card.value}
</h5>
</div>
))}
</div>

{/* RIGHT SIDE — Mentors card */}
<div className="bg-[#EBFDEB] rounded-lg p-6">
<div className="flex gap-2 mb-5">
<div className="bg-[#D6F7D6] px-3 py-1.5 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-slate-500/80 font-body">
<User size={15} className="text-emerald-600" />
Mentors
</div>

<div className="bg-[#D6F7D6] px-3 py-1.5 rounded-sm text-[11px] font-bold text-emerald-600 font-body">
Support Live
</div>
</div>

{/* Mentors in 2 columns */}
<div className="grid grid-cols-2 gap-2">
{mentors?.length > 0 ? (
mentors.map((m, i) => (
<div key={i} className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-sm">
<div className="w-6 h-6 rounded-sm bg-white flex items-center justify-center shrink-0 border border-emerald-100">
<User size={12} className="text-emerald-600" />
</div>

<span className="text-[12px] font-semibold text-slate-700 font-body truncate">
{m.name || m}
</span>
</div>
))
) : (
<span className="text-[12px] font-semibold text-slate-400 italic font-body col-span-2">
Unassigned
</span>
)}
</div>
</div>

</div>
</div>

<div className="h-px bg-slate-200" />

{/* ── Quick Actions ── */}
<div>
<h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-5 font-display">__Quick Actions</h3>

<div>
<button
onClick={() => togglePanel("avatar")}
className="w-full bg-transparent border border-slate-200 rounded-sm p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
>
<div className="w-11 h-11 bg-[#F3EBFF] rounded-sm flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
<Camera size={20} className="text-[#7A41F7]" />
</div>
<div className="flex-1">
<p className="text-xs font-bold text-slate-800 uppercase tracking-tight font-display">Change Avatar</p>
<p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-body">Upload a new profile photo</p>
</div>
{desktopPanel === "avatar"
? <ChevronUp size={16} className="text-[#7A41F7]" strokeWidth={3} />
: <ChevronDown size={16} className="text-slate-300" strokeWidth={3} />
}
</button>
{desktopPanel === "avatar" && (
<div ref={avatarRef}>
<AvatarPanel
name={name}
avatarUrl={resolved}
onAvatarChange={setAvatarUrl}

onClose={() => setDesktopPanel(null)}
/>
</div>
)}
</div>

<div className="mt-4 mb-24">
<button
onClick={() => togglePanel("password")}
className="w-full bg-transparent border border-slate-200 rounded-sm p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
>
<div className="w-11 h-11 bg-[#FFF4EB] rounded-sm flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
<KeyRound size={20} className="text-amber-600" />
</div>
<div className="flex-1">
<p className="text-xs font-bold text-slate-800 uppercase tracking-tight font-display">Change Password</p>
<p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-body">Update your account credentials</p>
</div>
{desktopPanel === "password"
? <ChevronUp size={16} className="text-[#7A41F7]" strokeWidth={3} />
: <ChevronDown size={16} className="text-slate-300" strokeWidth={3} />
}
</button>
{desktopPanel === "password" && (
<div ref={passwordRef}>
<PasswordPanel

onClose={() => setDesktopPanel(null)}
/>
</div>
)}
</div>
</div>
</div>
)}
</div>
</div>
</div>

{/* ══════════════════════════════════════════
MOBILE  (< lg) — Unacademy-style layout
══════════════════════════════════════════ */}
<div className={`lg:hidden min-h-screen flex flex-col ${isDark ? 'bg-[#0A0F1A]' : 'bg-[#F4F7FC]'}`}>

{/* Sticky Header containing Back button + Profile & settings */}
<div
className={`sticky top-0 z-50 transition-all duration-300 ${isDark ? 'bg-[#0A0F1A]' : 'bg-white border-b border-slate-200'}`}
style={{ paddingTop: STATUS_BAR_H }}
>
{/* Header Row */}
<div className="flex items-center gap-4 px-5 py-4">
<button onClick={() => window.history.back()} className={`p-0.5 bg-transparent border-none ${isDark ? 'text-slate-200' : 'text-slate-700'} active:scale-95 transition-all`}>
<ChevronLeft size={20} />
</button>
<h1 className={`text-[19px] font-bold tracking-tight font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile &amp; settings</h1>
</div>
</div>

{/* Scrollable Content */}
<div className={`flex-1 overflow-y-auto px-4 pt-2 pb-28 space-y-3 ${isDark ? 'bg-[#0A0F1A]' : 'bg-[#F4F7FC]'}`}>

{/* Goal Box as a separate card */}
<div className={`rounded-xl px-5 py-4 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<button onClick={() => setIsGoalExpanded(!isGoalExpanded)} className="flex items-center gap-3 text-left focus:outline-none flex-1">
<div className="w-10 h-10 flex items-center justify-center shrink-0 bg-transparent scale-100 origin-center">
{getGoalIcon(selectedGoal)}
</div>
<div>
<div className="flex items-center gap-1.5">
<span className={`text-[15px] font-semibold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>
{selectedGoal}
</span>
<ChevronDown size={14} className={`text-slate-400 mt-0.5 transition-transform duration-300 ${isGoalExpanded ? 'rotate-180' : ''}`} />
</div>
{authUser?.approved === false && (
<p className={`text-[12px] font-medium leading-none mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Free plan</p>
)}
</div>
</button>
<button
onClick={() => setIsGoalExpanded(!isGoalExpanded)}
className={`px-4 py-1.5 text-[12px] font-bold rounded-lg border bg-transparent transition-all active:scale-95 ${isDark
? 'border-[#2A3649] text-white hover:bg-slate-800'
: 'border-slate-300 text-slate-800 hover:bg-slate-50'
}`}
>
Manage
</button>
</div>

{/* Expanded Goal Selection */}
<div
className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-0 rounded-xl ${
isGoalExpanded ? 'max-h-[200px] opacity-100 py-1 mb-3 bg-[#151E2E]' : 'max-h-0 opacity-0 pointer-events-none'
}`}
>
{['Boards', 'MHT-CET']
.filter(goal => goal.toLowerCase() !== selectedGoal.toLowerCase())
.map(goal => (
<button
key={goal}
onClick={() => selectGoal(goal)}
className={`
w-full py-2.5 px-5 flex items-center gap-3 transition-colors text-left
${isDark ? 'hover:bg-slate-800/40 text-white' : 'hover:bg-slate-50 text-slate-800'}
`}
>
<div className="w-8 h-8 flex items-center justify-center shrink-0 bg-transparent scale-75 origin-center">
{getGoalIcon(goal)}
</div>
<div>
<span className={`text-[14px] font-semibold font-display ${isDark ? 'text-white' : 'text-slate-900'}`}>{goal}</span>
</div>
</button>
))
}
</div>

{/* Store Card */}
<div className={`rounded-xl px-5 py-5 flex items-center justify-between shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<div className="flex-1 pr-4">
<h3 className={`text-[16px] font-bold font-display mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Target Coaching Classes Store</h3>
<p className={`text-[13px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Exclusive batches, Previous year question papers, Test series.</p>
</div>
<div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}>
<ShoppingBag size={32} className="text-[#00E2B8] fill-[#00E2B8]/20" strokeWidth={1.5} />
</div>
</div>

{/* Profile Card */}
<div className={`rounded-xl px-5 py-5 flex flex-col gap-4 shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<div className="flex items-center gap-4">
{/* Avatar with badge */}
<div className="relative shrink-0">
<div className={`w-[72px] h-[72px] rounded-full overflow-hidden flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-700'}`}>
{loading
? <div className="w-full h-full bg-slate-600 animate-pulse" />
: hasCustomAvatar(resolved) ? (
<img src={resolved} alt="Avatar" className="w-full h-full object-cover" onError={e => { e.target.src = DEFAULT_AVATAR(name); }} />
) : (
<GraduationCap className="text-emerald-500 w-11 h-11" />
)
}
</div>
{/* Gold diamond badge */}
<div className={`absolute -bottom-1 -right-1 w-[26px] h-[26px] bg-[#FBBF24] rounded-[6px] rotate-45 flex items-center justify-center ${isDark ? 'border-2 border-[#151E2E]' : 'border-2 border-white'}`}>
<div className="-rotate-45 w-3 h-3 bg-white/80 rounded-[3px]" />
</div>
</div>
<div className="flex-1 min-w-0">
<h2 className={`text-[19px] font-bold font-display leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</h2>
<p className="text-[14px] font-semibold text-[#EAB308] mt-0.5">Beginner &bull; 345</p>
<div className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isDark ? 'border-[#334155] bg-transparent' : 'border-slate-200 bg-slate-50'}`}>
<Medal size={13} className={isDark ? 'text-slate-400' : 'text-slate-550'} />
<span className={`text-[12px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Rank 2,16,845 in {localStorage.getItem('selectedGoal') || 'IIT JEE'}</span>
</div>
</div>
</div>
</div>

{/* My Library */}
<div className={`rounded-xl px-5 py-5 shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<h3 className={`text-[17px] font-bold font-display mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>My library</h3>
<div className="grid grid-cols-2 gap-3">
{[
{ icon: <PlaySquare size={18} className="text-[#00E2B8]" />, label: 'Enrollments' },
{ icon: <Download size={18} className="text-[#A855F7]" />, label: 'Downloads' },
{ icon: <Bell size={18} className="text-[#00E2B8]" />, label: 'Updates' },
{ icon: <Users size={18} className="text-[#3B82F6]" />, label: 'My educators' },
{ icon: <HelpCircle size={18} className="text-[#3B82F6]" />, label: 'FAQs' },
{ icon: <Settings size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />, label: 'Settings', action: () => setMobileSettings(true) },
].map((item, i) => (
<button
key={i}
onClick={item.action}
className={`flex items-center gap-3 px-4 py-4 rounded-xl border bg-transparent text-left active:scale-95 transition-all ${isDark ? 'border-[#2A3649] hover:bg-slate-800/40' : 'border-slate-200 hover:bg-slate-50'}`}
>
{item.icon}
<span className={`text-[14px] font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
</button>
))}
</div>
</div>

{/* Activity */}
<div className={`rounded-xl px-5 py-5 shadow-sm ${isDark ? 'bg-[#151E2E]' : 'bg-white border border-slate-200'}`}>
<h3 className={`text-[17px] font-bold font-display mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Activity</h3>
<p className={`text-[13px] font-medium mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
Daily stats on how much you learn &amp; practice
</p>
<div className={`flex items-center justify-center py-8 border-t ${isDark ? 'border-[#2A3649]' : 'border-slate-200'}`}>
<span className={`text-[13px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No activity yet — start learning!</span>
</div>
</div>
</div>
</div>

    </>
  );
}
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