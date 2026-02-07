import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, Loader2, Settings, Star, Globe, MapPin,
  ShieldCheck, Zap, Award, BookOpen, User, Flame, Calendar, Target
} from "lucide-react";

export default function StudentProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const syncProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/student/profile`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setProfile(null);
      }
    };
    syncProfile();
  }, [baseURL]);

  const getVal = (field) => profile?.[field] || authUser?.[field] || "N/A";

  return (
    /* Background updated to Primary Purple #7A41F7 */
    <div className="min-h-screen flex flex-col bg-[#7A41F7] font-sans text-slate-900 selection:bg-indigo-100 overflow-x-hidden">

<nav className="p-4 flex justify-between items-center text-white sticky top-0 z-50 overflow-hidden">
  {/* Left Neural Rings - Centered Vertically */}
  <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
    <svg width="250" height="250" viewBox="0 0 150 150" fill="none">
      <circle cx="75" cy="75" r="60" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="40" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="20" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  </div>




  <button 
    onClick={() => window.history.back()} 
    className="relative z-10 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg active:scale-95 transition-transform"
  >
    <ArrowLeft size={18} strokeWidth={3} />
  </button>

  <h1 className="relative z-10 text-[8px] font-black uppercase tracking-[0.3em] opacity-60">
    Nexus Passport
  </h1>

  <button 
    className="relative z-10 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-lg active:scale-95 transition-transform"
  >
    <Settings size={18} strokeWidth={3} />
  </button>

  {/* Right Neural Rings - Centered Vertically */}
  <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
    <svg width="250" height="250" viewBox="0 0 150 150" fill="none">
      <circle cx="75" cy="75" r="60" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="40" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="20" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  </div>
</nav>

      {/* 2. CONTENT SHEET - Updated to Dashboard Background #F6F8FC */}
      <div className="relative flex-1 bg-[#F6F8FC] mt-16 rounded-t-[3rem] px-5 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        
        {/* Avatar Section */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="relative group">
            {/* Gradient updated to use Dashboard Purple */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-amber-400 to-[#7A41F7] rounded-full blur-md opacity-20" />
            <div className="relative w-28 h-28 bg-white rounded-full border-[6px] border-white shadow-xl overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getVal('name')}`}
                alt="Avatar"
                className="w-24 h-24 mx-auto mt-2"
              />
            </div>
            <div className="absolute -bottom-0 -right-0 bg-slate-900 text-amber-400 w-8 h-8 rounded-xl flex items-center justify-center shadow-xl border-2 border-white">
              <Flame size={14} fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="pt-20 text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">
            {getVal('name')}
          </h2>
          {/* Badge uses emerald theme from Dashboard UI */}
          <div className="inline-flex items-center gap-1.5 px-8 py-2 bg-emerald-500/5 backdrop-blur-sm rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
            <ShieldCheck size={9} className="text-emerald-500 animate-pulse" />
            <span className="text-[14px] font-black text-emerald-800 uppercase tracking-[0.2em] font-mono leading-none">
              {profile?.studentId || "NX-8829"}
            </span>
          </div>
        </div>

        {/* 3. CORE STATS - Background updated to #7A41F7 */}
        <div className="bg-[#7A41F7] rounded-[2.2rem] p-6 flex justify-between items-center text-white shadow-2xl shadow-purple-200 mb-8 relative overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-white/20 transition-colors duration-700" />
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
    <svg width="250" height="250" viewBox="0 0 150 150" fill="none">
      <circle cx="75" cy="75" r="60" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="40" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="20" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  </div>
    <div className="absolute right-[-90px] top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
    <svg width="250" height="250" viewBox="0 0 150 150" fill="none">
      <circle cx="75" cy="75" r="60" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="40" stroke="white" strokeWidth="2" />
      <circle cx="75" cy="75" r="20" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  </div>
          <StatItem 
            icon={<Globe size={18} className="text-white/70" />} 
            label="INSTITUTE" 
            value={`#${profile?.instRank || "1,438"}`} 
          />
          
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          
          <StatItem 
            icon={<MapPin size={18} className="text-white/70" />} 
            label="CLASS" 
            value={`#${profile?.classRank || "56"}`} 
          />
          
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          
          <StatItem 
            icon={<Star size={18} className="text-white/70" />} 
            label="STATE" 
            value={`#${profile?.worldRank || "12,940"}`} 
          />
        </div>

        {/* 4. PERFORMANCE TRACKERS - Colors matched to Dashboard Quiz Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8 px-2">
          <MetricProgress 
            label="Progress" 
            value="94" 
            color="text-[#7A41F7]" 
            bgColor="bg-[#F3EBFF]" /* Math Quiz Purple Theme */
            icon={<Calendar size={14} />} 
          />
          <MetricProgress 
            label="Accuracy" 
            value="78" 
            color="text-emerald-600" 
            bgColor="bg-[#EBFDEB]" /* Bio Quiz Green Theme */
            icon={<Target size={14} />} 
          />
        </div>

        {/* 5. ACADEMIC INFO */}
        <div className="space-y-4">
          <h4 className="text-[16px] font-bold text-slate-800 px-2">Academic Details</h4>
          
          <div className="grid gap-3">
            <InfoRow
              icon={<Globe className="text-[#7A41F7]" size={20} />}
              label="Institute"
              value={profile?.instituteId?.name || "Nexus HQ"}
              status="Verified"
              theme="indigo"
            />
            
            <InfoRow
              icon={<Zap className="text-amber-600" size={20} />}
              label="Batch"
              value={profile?.batchId?.name || "Elite"}
              status="Active"
              theme="amber"
            />

            <InfoRow
              icon={<User className="text-emerald-600" size={20} />}
              label="Assigned Mentors"
              isMentorList={true}
              mentors={profile?.batchId?.teachers || ["Dr. Aris", "Prof. K"]}
              status="Support Live"
              theme="emerald"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const StatItem = ({ icon, label, value }) => (
  <div className="flex flex-col items-center gap-1.5 relative z-10 transition-transform duration-300 hover:scale-105">
    <div className="flex flex-col items-center gap-1 opacity-80">
        <div className="mb-0.5">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-[0.1em] leading-none text-white/80">
          {label}
        </span>
    </div>
    <span className="text-xl font-black tracking-tighter italic leading-none text-white">
      {value}
    </span>
  </div>
);

const MetricProgress = ({ label, value, color, bgColor, icon }) => (
  <div className={`${bgColor} p-5 rounded-[2.2rem] border border-white flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-all`}>
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-xl bg-white/60 shadow-inner ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
        {label}
      </p>
    </div>

    <div className="flex items-end justify-between w-full">
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-sm">
          <circle cx="24" cy="24" r="20" stroke="rgba(0,0,0,0.05)" strokeWidth="5" fill="transparent" />
          <circle 
            cx="24" cy="24" r="20" 
            stroke="currentColor" 
            strokeWidth="5" 
            fill="transparent"
            strokeDasharray={126} 
            strokeDashoffset={126 - (126 * value) / 100}
            strokeLinecap="round" 
            className={`${color} transition-all duration-1000`} 
          />
        </svg>
        <span className={`absolute text-[9px] font-black ${color}`}>{value}%</span>
      </div>

      <div className="text-right">
        <p className={`text-2xl font-black italic tracking-tighter ${color} leading-none`}>
          {value}<span className="text-[10px] not-italic opacity-50 ml-0.5">%</span>
        </p>
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value, status, icon, theme, isMentorList, mentors }) => {
  const themes = {
    /* Color themes updated to match Dashboard secondary shades */
    indigo: "bg-[#F3EBFF] text-[#7A41F7] border-[#E6D6FF]",
    amber: "bg-[#FFF4EB] text-orange-600 border-[#FFE9D6]",
    emerald: "bg-[#EBFDEB] text-emerald-600 border-[#D6F7D6]",
  };

  return (
    <div className="flex items-start justify-between bg-white p-4 py-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0 shadow-inner group-hover:bg-white transition-colors mt-1">
          {icon}
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none mb-2.5">
            {label}
          </p>
          
          {isMentorList ? (
            <div className="flex flex-col gap-2">
              {mentors?.length > 0 ? (
                mentors.map((mentor, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100/50">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-100">
                       <User size={12} className="text-[#7A41F7]" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase italic tracking-tighter">
                      {mentor.name || mentor}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-[10px] font-black text-slate-400 italic px-1">Unassigned</span>
              )}
            </div>
          ) : (
            <p className="text-[14px] font-black text-slate-800 uppercase italic tracking-tighter leading-tight mt-1">
              {value}
            </p>
          )}
        </div>
      </div>

      {status && (
        <div className={`${themes[theme] || themes.indigo} px-3 py-1.5 rounded-xl text-[7px] font-black uppercase tracking-tighter shrink-0 border ml-3 mt-1`}>
          {status}
        </div>
      )}
    </div>
  );
};