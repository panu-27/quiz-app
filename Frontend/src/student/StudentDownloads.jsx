import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Video } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const STATUS_BAR_H = 28.5;

export default function StudentDownloads() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const dummyData = [
        { id: 1, title: 'Physics Formula Sheet', type: 'pdf', size: '2.4 MB', date: 'Oct 24' },
        { id: 2, title: 'Chemistry Mechanics Notes', type: 'pdf', size: '5.1 MB', date: 'Oct 20' },
        { id: 3, title: 'JEE Advanced PYQs 2023', type: 'video', size: '124 MB', date: 'Oct 15' },
    ];

    return (
        <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-[#0A0F1A] text-white' : 'bg-white text-slate-900'}`}>
            {/* Sticky Header */}
            <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0A0F1A]' : 'bg-white'}`} style={{ paddingTop: STATUS_BAR_H + 8 }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className={`text-[17px] font-bold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Downloads
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pt-2 pb-20 space-y-3">
                {dummyData.map((item) => (
                    <div key={item.id} className={`p-4 rounded-[16px] border flex items-center justify-between gap-4 ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-200'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#2A3441]' : 'bg-slate-100'}`}>
                            {item.type === 'pdf' ? <FileText size={24} className="text-[#3B82F6]" /> : <Video size={24} className="text-[#EC4899]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-[15px] truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.title}</h3>
                            <p className={`text-[12px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.size} • {item.date}</p>
                        </div>
                        <button className={`p-2.5 rounded-xl border active:scale-95 transition-all ${isDark ? 'border-[#2A3441] text-white bg-[#2A3441]/50' : 'border-slate-200 text-slate-700 bg-slate-50'}`}>
                            <Download size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
