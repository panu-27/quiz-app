import { useTheme } from "../context/ThemeContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const STATUS_BAR_H = 28.5;

export default function PrivacyPolicyPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        const parent = location.state?.from || '/student/settings';
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(parent, { replace: true });
        }
        return true;
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#000711]' : 'bg-white'}`}>
            {/* Standard Header (Fixed on scroll) */}
            <div className={`fixed top-0 left-0 right-0 z-40 px-5 pb-3.5 border-b shadow-sm ${isDark ? 'bg-[#000711]/95 backdrop-blur-md border-slate-800/80' : 'bg-white/95 backdrop-blur-md border-slate-200/80'}`} style={{ paddingTop: STATUS_BAR_H + 10 }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className={`p-1 flex items-center justify-center transition-colors bg-transparent border-none ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={`text-[19px] font-medium leading-tight m-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Privacy Policy
                    </h1>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pb-20 flex flex-col max-w-lg mx-auto w-full" style={{ paddingTop: STATUS_BAR_H + 58 }}>
                <div className="flex-1">
                    <p className={`text-[15px] leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Your privacy is critically important to us. We have fundamental principles that govern how we collect, use, and protect your data.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>1. Information We Collect</h3>
                    <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        We only collect information about you if we have a reason to do so—for example, to provide our Services, to communicate with you, or to make our Services better.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>2. How We Use Information</h3>
                    <ul className={`list-disc pl-5 mb-6 space-y-3 text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <li>To provide, update, maintain, and protect our Services.</li>
                        <li>To respond to your comments, questions, and requests.</li>
                        <li>To analyze trends and optimize the user experience.</li>
                    </ul>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>3. Sharing Information</h3>
                    <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        We do not sell our users' private personal information. We only share information with third-party service providers who assist us in operating our platform, provided they agree to adhere to strict privacy agreements.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>4. Security</h3>
                    <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        While no online service is 100% secure, we work very hard to protect information about you against unauthorized access, use, alteration, or destruction, and take reasonable measures to do so.
                    </p>
                </div>
            </div>
        </div>
    );
}
