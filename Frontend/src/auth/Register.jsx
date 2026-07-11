import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const STATUS_BAR_H = 28.5;

export default function Register() {
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        instituteId: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch institutes
    useEffect(() => {
        api
            .get("/super/get-institutes")
            .then((res) => {
                const fetchedInstitutes = res.data;
                setInstitutes(fetchedInstitutes);

                // Auto-select the non-GCC institute
                const targetInst = fetchedInstitutes.find(inst => !inst.name.toLowerCase().includes('gcc'));
                if (targetInst) {
                    setFormData(prev => ({ ...prev, instituteId: targetInst._id }));
                } else if (fetchedInstitutes.length > 0) {
                    setFormData(prev => ({ ...prev, instituteId: fetchedInstitutes[0]._id }));
                }
            })
            .catch(() =>
                setStatus({ type: "error", message: "Unable to load institutes" })
            );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setStatus({
                type: "error",
                message: "Passwords do not match",
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            await api.post("/auth/register-student", formData);
            setStatus({
                type: "success",
                message: "Registration submitted. Please wait for approval.",
            });
            setFormData({ name: "", email: "", password: "", confirmPassword: "", instituteId: "" });
        } catch (err) {
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Registration failed",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center">

            {/* Top Bar */}
            <div
                className="w-full flex items-center justify-between px-4 pb-2 "
                style={{ paddingTop: STATUS_BAR_H + 16 }}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 -mt-9 h-10 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
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
                    Create account
                </h1>
                <p className="mt-2 mb-8 text-[14px] text-center text-slate-600">
                    to continue to Target Classes
                </p>

                {status.message && (
                    <div
                        className={`mb-6 text-sm rounded-lg px-4 py-3 border ${status.type === "error"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-green-50 text-green-700 border-green-200"
                            }`}
                    >
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text"
                        required
                        placeholder="First and last name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-lg
                                   text-[14px] text-slate-900 placeholder:text-slate-500
                                   focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
                    />

                    <input
                        type="email"
                        required
                        placeholder="Email address"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-lg
                                   text-[14px] text-slate-900 placeholder:text-slate-500
                                   focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className="w-full px-4 py-3.5 pr-12 border border-slate-300 rounded-lg
                                       text-[14px] text-slate-900 placeholder:text-slate-500
                                       focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
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

                    <input
                        type="password"
                        required
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-lg
                                   text-[14px] text-slate-900 placeholder:text-slate-500
                                   focus:outline-none focus:border-[#1A66FF] focus:ring-1 focus:ring-[#1A66FF]"
                    />

                    {/* Hidden input to ensure instituteId is still submitted visually or structurally if needed, 
                        though it's in state already. We just remove the select UI. */}                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 mt-8 rounded-lg bg-[#1A66FF] text-white
                                   font-medium text-[16px]
                                   hover:bg-[#1556D6] transition
                                   disabled:opacity-60 active:scale-[0.98]"
                    >
                        {loading ? "Creating account..." : "Next"}
                    </button>

                </form>

                <p className="mt-6 text-center text-[15px] text-slate-600">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-[#1A66FF] font-medium hover:underline ml-1"
                    >
                        Sign in
                    </button>
                </p>

            </div>
        </div>
    );
}