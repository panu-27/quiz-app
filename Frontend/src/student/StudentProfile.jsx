import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Fingerprint, ArrowLeft, Loader2, 
  ShieldCheck, Cpu
} from "lucide-react";

export default function StudentProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const syncProfile = async () => {
      setLoading(true);
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
        console.error("Profile sync failed.");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    syncProfile();
  }, []);

  const getVal = (field) => profile?.[field] || authUser?.[field] || "XXXXXXXXXX";

  return (
    <div className="h-[88vh] flex flex-col bg-[#F9F9FB] font-sans text-slate-900 overflow-hidden">
      
      {/* 1. NAV */}
      <nav className="shrink-0 bg-white border-b border-slate-100 px-6 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="p-1 hover:bg-slate-900 rounded-lg transition-all border border-slate-100 hover:text-white"
            >
              <ArrowLeft size={14} />
            </button>
            <h1 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span className="text-indigo-600 italic">Nexus Identity</span>
              <span className="text-slate-300 font-medium">/</span>
              <span className="truncate">{getVal('name').split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg shadow-sm">
            <Fingerprint size={10} className="text-indigo-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-tighter">Verified</span>
          </div>
        </div>
      </nav>

      {/* 2. CONTENT */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          
          {/* Identity Header */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-200 shadow-sm">
                {loading ? <Loader2 size={32} className="animate-spin text-indigo-100" /> : <Cpu size={32} strokeWidth={1.5} />}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 w-6 h-6 rounded-full border-4 border-[#F9F9FB] flex items-center justify-center">
                 <ShieldCheck size={10} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-1">Authenticated User</p>
              <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">{getVal('name')}</h2>
            </div>
          </div>

          {/* Minimal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <MinimalTile label="System Email" value={getVal('email')} />
            
            <MinimalTile 
              label="Assigned Institute" 
              value={profile?.instituteId?.name || "Nexus Central"} 
            />

            <MinimalTile 
              label="Active Batch" 
              value={profile?.batchId?.name || "Unassigned"} 
            />
            
            <MinimalTile 
              label="Operational Mentors" 
              value={
                profile?.batchId?.teachers?.length > 0 
                  ? profile.batchId.teachers.map(t => t.name).join(", ") 
                  : "No Mentors Linked"
              } 
            />
          </div>

          {/* Footer Redaction Note */}
          <div className="mt-auto py-6 text-center">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                Nexus Security Protocol v2.0 // Connection Encrypted
             </p>
          </div>

        </div>
      </main>
    </div>
  );
}

const MinimalTile = ({ label, value }) => (
  <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col gap-1 transition-all hover:border-indigo-200 group">
    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">{label}</span>
    <span className="text-[11px] font-bold text-slate-900 truncate uppercase">{value}</span>
  </div>
);