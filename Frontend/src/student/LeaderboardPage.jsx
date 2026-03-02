import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";

/* ── YouTube Style Loading Components ── */
const ShimmerCSS = () => (
    <style>{`
      @keyframes yt-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes yt-bar {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(-30%); }
        100% { transform: translateX(100%); }
      }
      .sk {
        background-image: linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%);
        background-size: 200% 100%;
        animation: yt-shimmer 1.5s infinite linear;
        border-radius: 0.75rem;
      }
    `}</style>
);

const Sk = ({ className = "" }) => <div className={`sk ${className}`} />;

const LeaderboardSkeleton = () => (
    <div className="min-h-screen bg-white flex flex-col">
        {/* YT Top Loading Bar */}
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] overflow-hidden">
            <div className="h-full bg-[#7A41F7] w-full origin-left animate-[yt-bar_2s_infinite_linear]" />
        </div>

        {/* Header Skeleton */}
        <div className="border-b border-slate-50 px-6 py-4 flex justify-center items-center">
            <div className="absolute left-5 w-9 h-9 sk rounded-full" />
            <div className="w-32 h-6 sk" />
        </div>

        {/* List Skeleton */}
        <div className="max-w-lg mx-auto w-full px-6 pt-6 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50">
                    <div className="flex items-center gap-4">
                        <Sk className="w-9 h-9 rounded-xl" /> {/* Rank */}
                        <Sk className="w-10 h-10 rounded-xl" /> {/* Avatar */}
                        <div className="space-y-2">
                            <Sk className="h-4 w-24" /> {/* Name */}
                        </div>
                    </div>
                    <Sk className="h-4 w-12" /> {/* Score */}
                </div>
            ))}
        </div>
    </div>
);

export default function LeaderboardPage() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${baseURL}/leaderboard/${testId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [testId, baseURL]);

    if (loading) return (
        <>
            <ShimmerCSS />
            <LeaderboardSkeleton />
        </>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-50 px-6 py-4 flex justify-center items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-5 p-2 hover:bg-slate-100 rounded-full transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-bold text-slate-900">Leaderboard</h2>
            </div>

            <div className="flex-1 max-w-lg mx-auto w-full px-6 pt-6 pb-20">
                {(() => {
                    const top10 = data.slice(0, 10);
                    const currentUser = data.find(u => u.current);
                    const isInTop10 = top10.some(u => u.current);

                    return (
                        <>
                            <div className="space-y-3">
                                {top10.map((user) => (
                                    <div
                                        key={user.rank}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all
                                        ${user.current
                                                ? "bg-[#7A41F7] text-white shadow-lg shadow-purple-100"
                                                : "bg-white border-slate-100"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm
                                            ${user.current
                                                    ? "bg-white text-[#7A41F7]"
                                                    : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {user.rank}
                                            </div>

                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg overflow-hidden border border-slate-200">
                                                {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
                                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user.avatar || "👨‍🎓"}</span>
                                                )}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-sm">{user.name}</p>
                                                {user.current && (
                                                    <span className="text-[9px] uppercase tracking-widest opacity-80 font-bold">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <Trophy size={14} className={user.current ? "text-amber-300" : "text-amber-500"} />
                                            {user.points}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!isInTop10 && currentUser && (
                                <>
                                    <div className="flex items-center justify-center my-6">
                                        <div className="h-px bg-slate-100 w-full" />
                                        <span className="px-3 text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                            YOUR RANK
                                        </span>
                                        <div className="h-px bg-slate-100 w-full" />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl border bg-[#7A41F7] text-white shadow-lg shadow-purple-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm bg-white text-[#7A41F7]">
                                                {currentUser.rank}
                                            </div>
                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg overflow-hidden border border-white/20">
                                                {currentUser.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/')) ? (
                                                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{currentUser.avatar || "👨‍🎓"}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{currentUser.name}</p>
                                                <span className="text-[9px] uppercase tracking-widest opacity-80 font-bold">You</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <Trophy size={14} className="text-amber-300" />
                                            {currentUser.points}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    );
                })()}
            </div>
        </div>
    );
}