import { useTheme } from "../context/ThemeContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_BAR_H = 28.5;

export default function CookiePolicyPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#000711]' : 'bg-white'}`}>
            {/* Standard Header */}
            <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 pt-4 ${isDark ? 'bg-[#000711]' : 'bg-white'}`} style={{ paddingTop: STATUS_BAR_H + 12 }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-1 flex items-center justify-center transition-colors bg-transparent border-none ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={`text-[19px] font-medium leading-tight m-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Cookie Policy
                    </h1>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 flex flex-col max-w-lg mx-auto w-full">
                <div className="flex-1">
                    <p className={`text-[15px] leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        This Cookie Policy explains how and why cookies, web beacons, pixels, and other similar technologies may be stored on and accessed from your device when you use our platform.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>What are cookies?</h3>
                    <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Cookies are small text files stored by your web browser when you visit websites. They help us understand how you use our platform and help us improve your experience.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Types of cookies we use:</h3>
                    <ul className={`list-disc pl-5 mb-6 space-y-3 text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <li><strong>Essential cookies:</strong> Required for the basic functioning of the site, like keeping you securely logged in.</li>
                        <li><strong>Performance cookies:</strong> Used to track performance and engagement so we can optimize our service.</li>
                        <li><strong>Functional cookies:</strong> Let us remember choices you make, such as your preferred theme (Light/Dark mode) or language.</li>
                    </ul>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Managing Cookies</h3>
                    <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        You have the right to decide whether to accept or reject non-essential cookies. You can set or amend your web browser controls to accept or refuse cookies. However, disabling essential cookies may impact your ability to use parts of our site.
                    </p>
                </div>
            </div>
        </div>
    );
}
