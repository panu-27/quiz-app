import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Video } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const STATUS_BAR_H = 28.5;

export default function StudentDownloads() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';



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
            <div className="flex-1 px-5 pt-20 pb-20 flex flex-col items-center justify-center text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-[#161C26]' : 'bg-slate-100'}`}>
                    <Download size={36} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                </div>
                <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Coming Soon</h2>
                <p className={`text-[14px] max-w-[260px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    We're working hard to bring you offline downloads. Soon you'll be able to save study materials right to your device!
                </p>
            </div>
        </div>
    );
}
