import { useTheme } from "../context/ThemeContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_BAR_H = 28.5;

export default function RefundPolicyPage() {
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
                        Refund Policy
                    </h1>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-20 flex flex-col max-w-lg mx-auto w-full">
                <div className="flex-1">
                    <p className={`text-[15px] leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        This application is provided exclusively for students enrolled in our full-time coaching programs.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Course Enrollments & Refunds</h3>
                    <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Access to this app is tied directly to your enrollment in our physical or live coaching classes. All payments, subscriptions, and refund requests are processed at the administrative level of the coaching institute.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>How to Request a Refund</h3>
                    <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Since there are no direct in-app purchases, any cancellation or refund regarding your coaching fees must be discussed with the center coordinator or administration desk at your local branch.
                    </p>
                    <ul className={`list-disc pl-5 mb-6 space-y-3 text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <li>Please contact the coaching staff at your branch directly.</li>
                        <li>Refund eligibility is governed by the terms agreed upon during your offline or direct admission.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
