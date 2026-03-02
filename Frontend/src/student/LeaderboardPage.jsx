import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";

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

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-[#7A41F7]" size={30} />
            </div>
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
                            {/* Top 10 Rankings */}
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

                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                                                {user.avatar || "👨‍🎓"}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-sm">{user.name}</p>
                                                {user.current && (
                                                    <span className="text-[9px] uppercase tracking-widest opacity-80">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <Trophy size={14} />
                                            {user.points}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* If Current User NOT in Top 10 */}
                            {!isInTop10 && currentUser && (
                                <>
                                    <div className="flex items-center justify-center my-6">
                                        <div className="h-px bg-slate-200 w-full" />
                                        <span className="px-3 text-[10px] text-slate-400 font-bold">
                                            YOUR RANK
                                        </span>
                                        <div className="h-px bg-slate-200 w-full" />
                                    </div>

                                    <div
                                        className="flex items-center justify-between p-4 rounded-2xl border bg-[#7A41F7] text-white shadow-lg shadow-purple-100"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm bg-white text-[#7A41F7]">
                                                {currentUser.rank}
                                            </div>

                                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                                                {currentUser.avatar || "👨‍🎓"}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-sm">{currentUser.name}</p>
                                                <span className="text-[9px] uppercase tracking-widest opacity-80">
                                                    You
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 font-bold text-sm">
                                            <Trophy size={14} />
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