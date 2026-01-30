import { useAuth } from "../context/AuthContext";
import { 
  UserIcon, 
  HashtagIcon, 
  AcademicCapIcon, 
  BoltIcon, 
  TrophyIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";

export default function StudentProfile() {
  const { user } = useAuth();

  return (
    <div className=" font-sans">
      
      {/* 1. TOP NAVIGATION / INSTITUTE BRANDING */}
      <div className="bg-slate-900 px-6 pt-12 pb-16">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded">
            Student_ID
          </div>
          <p className="text-indigo-400 font-mono text-[10px] tracking-widest">
            1234ABC
          </p>
        </div>
        
        {/* COACHING NAME */}
        <h2 className="text-indigo-300 text-[11px] font-black uppercase tracking-[0.4em]">
          Target Coaching Classes
        </h2>
      </div>

      {/* 2. PROFILE HEADER (Grounded, No-Float) */}
      <div className="px-6 -mt-12">
        <div className="bg-white border-x border-t border-slate-100 p-6 rounded-t-[2rem]">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-indigo-500/20">
               <UserIcon className="w-10 h-10 text-slate-300" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {user?.name || "Student Name"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                  Verified Enrollment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INFORMATION GRID (Mobile First) */}
      <div className="px-6">
        <div className="border-x border-b border-slate-100 bg-white p-6 space-y-4 rounded-b-[2rem]">
          
          <div className="grid grid-cols-1 gap-3">
            <InfoTile 
              label="Email" 
              value={user?.email || "student@gmail.com"} 
              icon={<HashtagIcon className="w-4 h-4 text-indigo-500" />} 
            />
            <InfoTile 
              label="Batch Name" 
              value={user?.batchId || "MHT-CET"} 
              icon={<BoltIcon className="w-4 h-4 text-amber-500" />} 
            />
            <InfoTile 
              label="Course" 
              value="PCM/PCB/PCMB" 
              icon={<AcademicCapIcon className="w-4 h-4 text-purple-500" />} 
            />
          </div>

          {/* PERFORMANCE SNIPPET */}
          <div className="pt-6 border-t border-slate-50 flex gap-4">
             <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase">Avg Accuracy</p>
                <p className="text-lg font-black text-slate-800">88%</p>
             </div>
             <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase">Tests Taken</p>
                <p className="text-lg font-black text-slate-800">24</p>
             </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="px-10 mt-5">
        <div className="flex items-center gap-3 justify-center text-slate-300 mb-4">
          <div className="h-[1px] flex-1 bg-slate-100"></div>
          <TrophyIcon className="w-4 h-4" />
          <div className="h-[1px] flex-1 bg-slate-100"></div>
        </div>
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
          Profile Locked by Admin <br />
          Official Student Record of Target Coaching Classes , Manchar
        </p>
      </div>
    </div>
  );
}

/* --- REUSABLE TILE --- */
const InfoTile = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent active:border-indigo-100 transition-all">
    <div className="p-2.5 bg-white rounded-xl shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  </div>
);