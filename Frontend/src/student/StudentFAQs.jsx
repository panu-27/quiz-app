import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const STATUS_BAR_H = 28.5;

export default function StudentFAQs() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [openIndex, setOpenIndex] = useState(null);

    const dummyData = [
        { question: 'How do I access my downloaded content?', answer: 'You can access all your downloaded content from the "Downloads" section in the profile page even when offline.' },
        { question: 'Can I change my registered email?', answer: 'Currently, you cannot change your email directly. Please contact support via the Help Center to request an email change.' },
        { question: 'What happens if my subscription expires?', answer: 'Once your subscription expires, you will lose access to premium content, but your progress and free content will remain safe.' },
        { question: 'How do I track my test progress?', answer: 'Go to the "Personal Analytics" page to see a detailed breakdown of your test scores, percentiles, and subject-wise performance.' },
    ];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

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
                            FAQs
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pt-2 pb-20 space-y-3">
                {dummyData.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} className={`rounded-[16px] border overflow-hidden ${isDark ? 'bg-[#161C26] border-[#2A3441]' : 'bg-white border-slate-200'}`}>
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                            >
                                <h3 className={`font-bold text-[14px] pr-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.question}</h3>
                                <div className={`shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </button>
                            {isOpen && (
                                <div className={`px-4 pb-4 text-[13px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
