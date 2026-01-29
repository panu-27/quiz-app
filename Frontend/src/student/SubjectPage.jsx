import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  LayoutGrid, 
  BarChart3, 
  Zap, 
  ScrollText 
} from "lucide-react";

export default function SubjectPage() {
  const { subjectName } = useParams();
  const navigate = useNavigate();
  const [grade, setGrade] = useState(null);

  // Helper to render consistent card style
  const MenuCard = ({ title, icon, color, desc, onClick }) => (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all cursor-pointer border border-zinc-50 group active:scale-95"
    >
      <div className={`w-20 h-20 mb-4 flex items-center justify-center rounded-[1.5rem] ${color} group-hover:scale-110 transition-transform`}>
        <span className="text-3xl">{icon}</span>
      </div>
      <h4 className="font-bold text-sm tracking-tight text-zinc-900">{title}</h4>
      {desc && <p className="text-[9px] text-zinc-400 uppercase mt-1.5 font-black tracking-[0.15em]">{desc}</p>}
    </div>
  );

  // Standard Selection (11th vs 12th)
  if (!grade) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] p-6 font-sans flex flex-col">
        <header className="flex items-center gap-4 mb-12 mt-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-2xl shadow-sm border border-zinc-100 active:bg-zinc-50">
            <ChevronLeft className="w-6 h-6 text-zinc-600" />
          </button>
          <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter italic">
            {subjectName}
          </h2>
        </header>

        <div className="flex-grow flex flex-col justify-start">
          <p className="text-zinc-400 font-bold mb-8 px-2 text-center uppercase text-xs tracking-widest">Select Academic Year</p>
          <div className="grid grid-cols-2 gap-5">
            <MenuCard 
              title="11th Std" 
              icon="🎒" 
              color="bg-indigo-50" 
              desc="Foundation"
              onClick={() => setGrade("11th")} 
            />
            <MenuCard 
              title="12th Std" 
              icon="🎓" 
              color="bg-indigo-50" 
              desc="Boards + CET"
              onClick={() => setGrade("12th")} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Subject Menu Grid
  return (
    <div className="min-h-screen bg-[#F8FAFF] pb-12 font-sans text-zinc-800">
      {/* Branded Header */}
      <div className="flex  px-6 pt-10  rounded-b-[3.5rem] relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 w-40 h-20 bg-indigo-900 rounded-full opacity-50 blur-3xl" />
        
        <button onClick={() => setGrade(null)} className="relative z-10 mb-8 p-2.5 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </button>
        <div className="relative z-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">{subjectName}</h1>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
              {grade}
            </span>
            <span className="text-zinc-400 font-bold text-[10px] tracking-widest uppercase italic">
              Target Manchar
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 mt-4">
        <h3 className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.25em] mb-8 px-4">Subject Resources</h3>
        
        <div className="grid grid-cols-2 gap-5">
          <MenuCard 
            title="Take a Quiz" 
            icon="✍️" 
            color="bg-green-50" 
            desc="Practice"
            onClick={() => navigate('/student/quizzes')}
          />
          <MenuCard 
            title="PDF Notes" 
            icon="📑" 
            color="bg-blue-50" 
            desc="Materials"
          />
          <MenuCard 
            title="Video Bank" 
            icon="📺" 
            color="bg-red-50" 
            desc="Lectures"
          />
          <MenuCard 
            title="Quick Revise" 
            icon="⚡" 
            color="bg-amber-50" 
            desc="Formulas"
          />
          <MenuCard 
            title="PYQ Bank" 
            icon="📜" 
            color="bg-indigo-50" 
            desc="Old Papers"
          />
          <MenuCard 
            title="Analysis" 
            icon="📊" 
            color="bg-purple-50" 
            desc="Performance"
          />
        </div>
      </div>
    </div>
  );
}