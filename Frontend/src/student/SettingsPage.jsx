import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, Check, Upload, User, Mail, AlertCircle, Eye, EyeOff, Lock, LogOut, Phone, MessageCircle, Star, Users, Shield, HelpCircle, FileText, Cookie, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_BAR_H = 43.7;

const DEFAULT_AVATAR = (seed = "student") =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2.5 px-5 py-3 rounded-sm shadow-xl text-sm font-semibold text-white pointer-events-none font-body
      ${type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}>
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

function HeaderActionBtn({ icon, label }) {
  return (
    <button className="flex flex-col items-center justify-center gap-1.5 w-[72px] h-[64px] rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white">
      {icon}
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function ListItem({ sectionTitle, icon, subtitle, title, onClick, isDark, danger }) {
  return (
    <div className="mb-3">
      {sectionTitle && (
        <h3 className={`text-[13px] font-bold mb-1.5 uppercase tracking-wide opacity-70 ${isDark ? 'text-white' : 'text-[#2D2A43]'}`}>{sectionTitle}</h3>
      )}
      <button
        onClick={onClick}
        disabled={!onClick}
        className={`w-full flex items-center gap-3 ${onClick ? 'active:opacity-70 cursor-pointer' : 'cursor-default'} transition-opacity`}
      >
        <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${danger ? 'bg-rose-50 text-rose-500' : (isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-[#F2F1FA] text-[#4B3BCC]')}`}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          {subtitle && <p className={`text-[11px] font-bold mb-0.5 ${danger ? 'text-rose-500' : (isDark ? 'text-slate-400' : 'text-[#8A889E]')}`}>{subtitle}</p>}
          <p className={`text-[14px] font-medium ${danger ? 'text-rose-600' : (isDark ? 'text-slate-200' : 'text-[#2D2A43]')}`}>{title}</p>
        </div>
      </button>
      <div className={`h-[1px] w-full mt-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateAvatar } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileRef = useRef();

  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [avatarSaving, setAvS] = useState(false);

  const [toast, setToast] = useState(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/student/profile");
        if (!cancelled) {
          setProfile(data);
          setAvatarUrl(data.profilePic || null);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getVal = (f) => profile?.[f] || user?.[f] || "N/A";
  const name = getVal("name");
  const email = getVal("email");

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const base = window.__API_URL__
      ? window.__API_URL__.replace(/\/api$/, '')
      : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '');
    return `${base}${url}`;
  };

  const resolved = resolveMediaUrl(avatarUrl || user?.profilePic) || DEFAULT_AVATAR(name);

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
      const res = await api.post("/student/updateavatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(preview);
      if (updateAvatar) updateAvatar(preview);
      setToast({ msg: "Photo updated!", type: "success" });
      setFile(null);
      setPreview(null);
    } catch {
      setToast({ msg: "Upload failed.", type: "error" });
    } finally {
      setAvS(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };
  const displayAvatar = preview || resolved;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#0A0F1A]' : 'bg-white'}`}>

      {/* Top Deep Blue Header Section */}
      <div className={`sticky top-0 z-40 ${isDark ? 'bg-[#0A0F1A]' : 'bg-white'}`}>
        <div className={`relative px-5 pt-12 pb-8 rounded-b-xl flex flex-col items-center shadow-md ${isDark ? 'bg-[#151B2B]' : 'bg-[#2E287C]'}`}>

          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 px-5 flex items-center gap-4" style={{ paddingTop: STATUS_BAR_H + 12 }}>
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-sm transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white text-[17px] font-bold">Settings</h1>
          </div>



          {/* Action Buttons Row */}
          <div className="flex gap-2 mt-16 -mb-4">
            <HeaderActionBtn icon={<Mail size={20} strokeWidth={1.5} />} label="Email" />
            <HeaderActionBtn icon={<Phone size={20} strokeWidth={1.5} />} label="Call" />
            <HeaderActionBtn icon={<MessageCircle size={20} strokeWidth={1.5} />} label="Whatsapp" />
            <HeaderActionBtn icon={<Star size={20} strokeWidth={1.5} />} label="Favorite" />
          </div>

        </div>
      </div>

      {/* Content List Area (Boxy layout) */}
      <div className="flex-1 px-5 pt-6 pb-16">

        <ListItem
          sectionTitle="Email"
          icon={<Mail size={22} strokeWidth={1.5} />}
          subtitle="Official"
          title={email}
          isDark={isDark}
        />

        <ListItem
          sectionTitle="Mobile number"
          icon={<Phone size={22} strokeWidth={1.5} />}
          title={user?.mobile || "(209) 555-0104"}
          isDark={isDark}
        />

        <ListItem
          sectionTitle="Batch"
          icon={<Users size={22} strokeWidth={1.5} />}
          title={profile?.batchId?.name || "Project Operation Team"}
          isDark={isDark}
        />

        <ListItem
          sectionTitle="Security"
          icon={<Shield size={22} strokeWidth={1.5} />}
          title="Change Password"
          onClick={() => navigate('/student/change-password')}
          isDark={isDark}
        />

        <ListItem
          sectionTitle="Help & Policies"
          icon={<HelpCircle size={22} strokeWidth={1.5} />}
          title="FAQs"
          onClick={() => navigate('/student/faqs')}
          isDark={isDark}
        />

        <ListItem
          icon={<FileText size={22} strokeWidth={1.5} />}
          title="Privacy Policy"
          onClick={() => { }}
          isDark={isDark}
        />

        <ListItem
          icon={<Cookie size={22} strokeWidth={1.5} />}
          title="Cookies Policy"
          onClick={() => { }}
          isDark={isDark}
        />

        <ListItem
          icon={<Receipt size={22} strokeWidth={1.5} />}
          title="Refund Policy"
          onClick={() => { }}
          isDark={isDark}
        />

        <ListItem
          sectionTitle="Account"
          icon={<AlertCircle size={22} strokeWidth={1.5} />}
          title="Delete Account"
          onClick={() => navigate('/student/delete-account')}
          isDark={isDark}
          danger
        />

        <ListItem
          icon={<LogOut size={22} strokeWidth={1.5} />}
          title="Sign Out"
          onClick={() => setShowLogoutModal(true)}
          isDark={isDark}
          danger
        />

      </div>

      {/* Logout Bottom Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowLogoutModal(false)} />
          <div className={`relative w-full max-w-md ${isDark ? 'bg-[#151E2E] border-t border-slate-800' : 'bg-white'} rounded-t-lg p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-2xl`}>
            <div className="text-left mb-6 mt-2">
              <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Log Out?</h3>
              <p className={`text-[15px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Are you sure you want to log out?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className={`flex-1 py-2.5 font-bold text-[15px] rounded-sm border ${isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} active:scale-[0.98] transition-all`}>
                No, Cancel
              </button>
              <button onClick={handleLogout} className="flex-1 py-2.5 bg-[#DE4242] hover:bg-[#c93b3b] text-white font-bold text-[15px] rounded-sm active:scale-[0.98] transition-all">
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
