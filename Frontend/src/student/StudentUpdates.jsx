import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Calendar, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const STATUS_BAR_H = 28.5;

export default function StudentUpdates() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const dummyData = [
        { id: 1, title: 'New Course Available', desc: 'JEE Mains Crash Course is now live!', date: 'Oct 25', unread: true },
        { id: 2, title: 'System Maintenance', desc: 'App will be down for 30 minutes tonight.', date: 'Oct 23', unread: false },
        { id: 3, title: 'Mock Test Results', desc: 'Your recent mock test results are out.', date: 'Oct 20', unread: false },
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
                            Updates
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pt-2 pb-20 space-y-3">
                {dummyData.map((item) => (
                    <div key={item.id} className={`p-4 rounded-[16px] border relative ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-200'} ${item.unread ? (isDark ? 'border-l-4 border-l-[#3B82F6]' : 'border-l-4 border-l-[#3B82F6]') : ''}`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-[#2A3441]' : 'bg-[#EEF2FF]'}`}>
                                <Bell size={18} className={isDark ? "text-slate-300" : "text-[#4F46E5]"} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-[15px] ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.title}</h3>
                                <p className={`text-[13px] leading-snug mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
                                <div className="flex items-center gap-1.5 mt-3">
                                    <Calendar size={12} className={isDark ? "text-slate-500" : "text-slate-400"} />
                                    <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
