import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import DesktopHeader from "./DesktopHeader";

const STATUS_BAR_H = 28.5;

export default function LoginPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [status, setStatus] = useState({ type: "", message: "" });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const res = await api.post("/auth/login", formData);
            login(res.data.data);
        } catch (err) {
            if (err.response?.data) {
                const { status, message } = err.response.data;
                setStatus({
                    type: status === 403 ? "pending" : "error",
                    message,
                });
            } else {
                setStatus({
                    type: "error",
                    message: "Connection lost. Please try again.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden lg:flex flex-col min-h-screen bg-white">
                <DesktopHeader />

                {/* Two-column body */}
                <div className="flex flex-1 max-w-[1200px] mx-auto px-6 w-full">
                    {/* Left — form */}
                    <div className="w-1/2 flex items-center justify-center">
                        <div className="w-full max-w-md">
                            <h1 className="text-[28px] font-bold text-slate-900 mb-1">Sign in</h1>
                            <p className="text-[14px] text-slate-500 mb-8">to continue to Targate Coaching Classes</p>

                            {status.message && (
                                <div
                                    className={`mb-6 rounded-lg px-4 py-3 text-sm ${status.type === "pending"
                                        ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                        }`}
                                >
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Email or phone"
                                    className="w-full px-4 py-3.5 border border-slate-300 rounded-lg
                                               text-[14px] text-slate-900 placeholder:text-slate-500
                                               focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-3.5 pr-12 border border-slate-300 rounded-lg
                                                   text-[14px] text-slate-900 placeholder:text-slate-500
                                                   focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                                        ) : (
                                            <EyeSlashIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                                        )}
                                    </button>
                                </div>

                                <div className="flex justify-start mt-1 mb-8">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/help")}
                                        className="text-[#1A66FF] text-[14px] font-medium hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-lg bg-[#1A66FF] text-white
                                               font-semibold text-[15px]
                                               hover:bg-[#1556D6] transition
                                               disabled:opacity-60 active:scale-[0.98]"
                                >
                                    {loading ? "Signing in..." : "Sign in"}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-[14px] text-slate-600">
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="text-[#1A66FF] font-semibold hover:underline ml-1"
                                >
                                    Create account
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Right — illustration */}
                    <div className="w-1/2 flex items-center justify-center">
                        <img
                            src="./home-illustration.svg"
                            alt="Learning"
                            className="w-full max-w-[480px] object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* ── MOBILE LAYOUT ── */}
            <div className="min-h-screen bg-white flex flex-col items-center lg:hidden">

                {/* Top Bar */}
                <div
                    className="w-full flex items-center justify-between px-4 pb-2"
                    style={{ paddingTop: STATUS_BAR_H + 16 }}
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 -mt-9 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div className="flex-1 flex justify-center pr-10 pt-4">
                        <img
                            src="./logo.png"
                            alt="Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="w-full max-w-md px-6 pt-6 -mt-5">
                    <h1 className="text-[22px] font-medium text-center text-slate-900">
                        Sign in
                    </h1>
                    <p className="mt-2 mb-8 text-[14px] text-center text-slate-600">
                        to continue to Target Classes
                    </p>

                    {status.message && (
                        <div
                            className={`mb-6 rounded-lg px-4 py-3 text-sm ${status.type === "pending"
                                ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            required
                            placeholder="Email or phone"
                            className="w-full px-4 py-3.5 border border-slate-300 rounded-lg
                                       text-[14px] text-slate-900 placeholder:text-slate-500
                                       focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter your password"
                                className="w-full px-4 py-3.5 pr-12 border border-slate-300 rounded-lg
                                           text-[14px] text-slate-900 placeholder:text-slate-500
                                           focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                            >
                                {showPassword ? (
                                    <EyeIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                                ) : (
                                    <EyeSlashIcon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                                )}
                            </button>
                        </div>

                        <div className="flex justify-start mt-1 mb-8">
                            <button
                                type="button"
                                onClick={() => navigate("/help")}
                                className="text-[#1A66FF] text-[15px] font-medium hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-6 rounded-lg bg-[#1A66FF] text-white
                                       font-medium text-[16px]
                                       hover:bg-[#1556D6] transition
                                       disabled:opacity-60 active:scale-[0.98]"
                        >
                            {loading ? "Signing in..." : "Next"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-[15px] text-slate-600">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="text-[#1A66FF] font-medium hover:underline ml-1"
                        >
                            Create account
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
}