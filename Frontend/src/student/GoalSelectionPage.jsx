import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, ChevronRight, Search, Plus, Minus, ClipboardList, BookOpen, Calculator, FlaskConical, Goal, Lock } from 'lucide-react';
import StudentHeader from './StudentHeader';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUS_BAR_H = 28.5;

const CATEGORIES = [
    {
        id: 'boards',
        title: 'Maharashtra State Board',
        goals: [
            { id: 'HSC', title: 'HSC (Class 12)', icon: <BookOpen size={18} strokeWidth={2.5} /> },
            { id: 'SSC', title: 'SSC (Class 10)', icon: <BookOpen size={18} strokeWidth={2.5} /> }
        ]
    },
    {
        id: 'competitive',
        title: 'IITJEE, NEET UG and Foundation',
        goals: [
            { id: 'IIT JEE', title: 'IIT JEE', icon: <Calculator size={18} strokeWidth={2.5} />, locked: true },
            { id: 'MHT CET', title: 'MHT CET', icon: <ClipboardList size={18} strokeWidth={2.5} /> },
            { id: 'NEET', title: 'NEET UG', icon: <FlaskConical size={18} strokeWidth={2.5} />, locked: true },
        ]
    },
    {
        id: 'mh_school',
        title: 'Maharashtra Board (Class 8-12)',
        goals: [
            { id: 'MH Class 12', title: 'MH Class 12', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'MH Class 11', title: 'MH Class 11', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'MH Class 10', title: 'MH Class 10', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'MH Class 9', title: 'MH Class 9', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'MH Class 8', title: 'MH Class 8', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true }
        ]
    },
    {
        id: 'cbse_school',
        title: 'CBSE (Class 8-12)',
        goals: [
            { id: 'CBSE Class 12', title: 'CBSE Class 12', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'CBSE Class 11', title: 'CBSE Class 11', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'CBSE Class 10', title: 'CBSE Class 10', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'CBSE Class 9', title: 'CBSE Class 9', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'CBSE Class 8', title: 'CBSE Class 8', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true }
        ]
    },
    {
        id: 'icse_school',
        title: 'ICSE (Class 8-12)',
        goals: [
            { id: 'ICSE Class 12', title: 'ICSE Class 12', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'ICSE Class 11', title: 'ICSE Class 11', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'ICSE Class 10', title: 'ICSE Class 10', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'ICSE Class 9', title: 'ICSE Class 9', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true },
            { id: 'ICSE Class 8', title: 'ICSE Class 8', icon: <BookOpen size={18} strokeWidth={2.5} />, locked: true }
        ]
    }
];

export default function GoalSelectionPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState('boards');
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [activeClasses, setActiveClasses] = useState([]);

    // Ensure we start at top
    useEffect(() => {
        window.scrollTo(0, 0);
        if (user?.approved) {
            navigate('/student', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user) {
            api.get('/student/active-classes')
                .then(res => setActiveClasses(res.data))
                .catch(err => console.error("Failed to load active classes", err));
        }
    }, [user]);

    const handleGoalClick = (goal) => {
        setSelectedGoal(goal);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        if (selectedGoal?.locked) {
            // "Notify me" action, for now just close the modal
            setShowConfirm(false);
            return;
        }

        if (selectedGoal) {
            localStorage.setItem('selectedGoal', selectedGoal.id);
            if (user) {
                try {
                    await api.post("/student/change-class", { className: selectedGoal.id });
                } catch(err) {
                    console.error("Failed to update class in backend", err);
                }
            }
            setShowConfirm(false);
            // Full page navigation with cache-buster to avoid service worker
            // serving stale JS bundles that cause duplicate React instances
            setTimeout(() => {
                window.location.href = `${window.location.origin}${window.location.pathname}?_r=${Date.now()}#/student`;
            }, 150);
        }
    };

    const toggleCategory = (id) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const filteredCategories = CATEGORIES.map(cat => ({
        ...cat,
        goals: cat.goals.map(g => ({
            ...g,
            locked: activeClasses.includes(g.id) ? false : g.locked
        })).filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.goals.length > 0 || cat.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Matching screenshot colors closely
    const bgMain = isDark ? 'bg-[#0b1016]' : 'bg-[#F4F7FC]';
    const headerBlue = 'bg-[#2C81F6]'; // Requested vibrant blue
    const cardBg = isDark ? 'bg-[#1c212b]' : 'bg-white';
    const cardHover = isDark ? 'hover:bg-[#252b36]' : 'hover:bg-slate-50';

    return (
        <div className={`min-h-screen flex flex-col ${bgMain}`}>
            <div className="hidden lg:block">
                <StudentHeader />
            </div>

            {/* Main Content */}
            <div className="flex-1 relative pb-10">
                {/* BLUE HEADER BLOCK */}
                <div
                    className={`sticky top-0 z-50 ${headerBlue} rounded-b-xl pt-[50px] pb-6 px-5 text-center shadow-lg`}
                >
                    {/* SEARCH BAR inside header */}
                    <div className=" mt-2 relative rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-w-md mx-auto">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search size={20} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search what do you want to achieve"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full py-3 pl-12 pr-4 text-[15px] outline-none font-medium
                                bg-white text-slate-800 placeholder:text-slate-400
                            `}
                        />
                    </div>
                </div>

                {/* ACCORDION LIST */}
                <div className="mt-6 px-2 max-w-3xl mx-auto w-full flex flex-col gap-3">
                    {filteredCategories.map((category) => {
                        const isAlwaysOpen = category.id === 'boards' || category.id === 'competitive';
                        const isExpanded = isAlwaysOpen || expandedCategory === category.id;

                        return (
                            <div
                                key={category.id}
                                className={`rounded-xl overflow-hidden transition-all duration-300
                                    ${cardBg} ${isDark ? '' : 'border border-slate-200'}
                                `}
                            >
                                {/* Category Header */}
                                <button
                                    onClick={() => !isAlwaysOpen && toggleCategory(category.id)}
                                    className={`w-full px-5 py-5 flex items-center justify-between transition-colors ${!isAlwaysOpen ? cardHover : 'cursor-default'}`}
                                    disabled={isAlwaysOpen}
                                >
                                    <span className={`text-[13px] font-bold tracking-wide uppercase
                                        ${isDark ? 'text-slate-200' : 'text-slate-700'}
                                    `}>
                                        {category.title}
                                    </span>
                                    {!isAlwaysOpen && (
                                        <div className={`text-slate-300 ${isDark ? 'text-slate-100' : 'text-slate-500'}`}>
                                            {isExpanded ? <Minus size={20} strokeWidth={2.5} /> : <Plus size={20} strokeWidth={2.5} />}
                                        </div>
                                    )}
                                </button>

                                {/* Category Goals */}
                                <div
                                    className={`transition-all duration-300 ease-in-out
                                        ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                                    `}
                                >
                                    <div className="px-3 pb-3 flex flex-col gap-1">
                                        {category.goals.map((goal) => (
                                            <button
                                                key={goal.id}
                                                onClick={() => handleGoalClick(goal)}
                                                className={`w-full flex items-center justify-between py-4 px-3 rounded-xl transition-all active:scale-[0.98] ${cardHover}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex items-center justify-center shrink-0
                                                        ${isDark ? 'text-slate-300' : 'text-slate-500'}
                                                    `}>
                                                        {goal.icon}
                                                    </div>
                                                    <span className={`text-[13px] font-bold tracking-wide
                                                        ${isDark ? 'text-white' : 'text-slate-800'}
                                                    `}>
                                                        {goal.title}
                                                    </span>
                                                </div>
                                                {goal.locked ? (
                                                    <Lock size={18} strokeWidth={2.5} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                                ) : (
                                                    <ChevronRight size={20} strokeWidth={2.5} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredCategories.length === 0 && (
                        <div className={`text-center py-10 text-[15px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            No goals found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999]  flex items-end justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
                        onClick={() => setShowConfirm(false)}
                    />

                    <div
                        className={`relative w-full max-w-md ${isDark ? 'bg-[#171F2A] border-t border-slate-800' : 'bg-white'} rounded-t-lg p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-2xl`}
                    >
                        <div className="text-left mb-6 mt-2">
                            <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {selectedGoal?.locked ? 'Coming Soon' : 'Change Goal?'}
                            </h3>
                            <p className={`text-[15px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {selectedGoal?.locked
                                    ? <>{selectedGoal?.title} is not available yet. We will notify you.</>
                                    : <>Are you sure you want to change your goal to <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{selectedGoal?.title}</span>?</>
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className={`flex-1 py-2.5 font-bold text-[15px] rounded-sm border ${isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} active:scale-[0.98] transition-all`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 py-2.5 bg-[#2C81F6] hover:bg-[#1f66cc] text-white font-bold text-[15px] rounded-sm active:scale-[0.98] transition-all"
                            >
                                {selectedGoal?.locked ? 'Notify me' : 'Yes, Change'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
