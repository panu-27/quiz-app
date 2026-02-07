import { useState, useEffect } from "react";
import api from "../api/axios";
import PublicHeader from "./PublicHeader";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";


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
            .then((res) => setInstitutes(res.data))
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
            setFormData({ name: "", email: "", password: "", instituteId: "" });
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
        <div className="min-h-screen flex flex-col bg-white">

            {/* Header */}
            <PublicHeader />

            {/* Content */}

            <div className="flex-1 px-4 sm:px-12 md:px-6 xl:px-52 pt-10 sm:pt-16">
                <div className="grid md:grid-cols-2 gap-16 items-start">

                    <div className="max-w-md">

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                            Create your account
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            Join Nexus and start your preparation journey
                        </p>

                        {/* Status message */}
                        {status.message && (
                            <div
                                className={`mt-4 text-sm rounded-xl px-4 py-3 ${status.type === "error"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-green-50 text-green-700"
                                    }`}
                            >
                                {status.message}
                            </div>
                        )}

                        {/* Register form */}
                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">

                            <input
                                type="text"
                                required
                                placeholder="Full name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl
                         text-sm placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-slate-200"
                            />

                            <input
                                type="email"
                                required
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl
                         text-sm placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl
      text-sm placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                                >
                                    {showPassword ? (
                                        <EyeIcon className="w-5 h-5" />

                                    ) : (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={(e) =>
                                        setFormData({ ...formData, confirmPassword: e.target.value })
                                    }
                                    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl
      text-sm placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-slate-200"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                                >
                                    {showConfirmPassword ? (
                                        <EyeIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>


                            <select
                                required
                                value={formData.instituteId}
                                onChange={(e) =>
                                    setFormData({ ...formData, instituteId: e.target.value })
                                }
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl
                         text-sm text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-slate-200"
                            >
                                <option value="">Select your institute</option>
                                {institutes.map((inst) => (
                                    <option key={inst._id} value={inst._id}>
                                        {inst.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-slate-800 text-white
                         font-semibold text-sm
                         hover:bg-slate-900 transition
                         disabled:opacity-60"
                            >
                                {loading ? "Creating account..." : "Join for free"}
                            </button>

                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-sm text-slate-600">
                            Already have account ?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="inline font-semibold text-slate-800
               hover:underline hover:text-slate-900
               focus:outline-none focus:underline
               bg-transparent p-0 m-0"
                            >
                                Log In
                            </button>
                        </p>
                    </div>

                    {/* RIGHT : Illustration (Tablet + Desktop) */}
                    <div className="hidden sm:flex justify-center items-center">
                        <img
                            src="/loginpagestudent.svg"
                            alt="Students learning"
                            className="
      w-[260px]
      md:w-[360px]
      lg:w-[420px]
      xl:w-[500px]
      object-contain
    "
                            loading="lazy"
                            decoding="async"
                        />
                    </div>


                </div>

            </div>
            <p className="mb-4 px-2 sm:px-12 md:px-6 xl:px-52  text-xs text-slate-500 leading-relaxed">
                By signing up, you agree to our{" "}
                <a
                    href="/terms"
                    className="font-medium text-slate-700 hover:underline"
                >
                    Terms & Conditions
                </a>{" "}
                and our{" "}
                <a
                    href="/privacy"
                    className="font-medium text-slate-700 hover:underline"
                >
                    Privacy Policy
                </a>.
            </p>
        </div>
    );
}
