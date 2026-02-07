import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../api/axios";
import PublicHeader from "./PublicHeader";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";



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

            // Only success responses (2xx) come here
            login(res.data.data);

        } catch (err) {
            // 🔥 THIS IS THE KEY PART
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
        <div className="min-h-screen bg-white">

            {/* Header */}
            <PublicHeader />

            {/* Content */}
<div className="flex-1 px-4 sm:px-12 md:px-6 xl:px-52 pt-10 sm:pt-16">
                <div className="grid md:grid-cols-2 gap-16 items-start">
                <div className="max-w-md">

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Log in to continue to Nexus
                    </p>
                    {status.message && (
                        <div
                            className={`mt-4 rounded-xl px-4 py-3 text-sm ${status.type === "pending"
                                ? "bg-yellow-50 text-yellow-800"
                                : "bg-red-50 text-red-700"
                                }`}
                        >
                            {status.message}
                        </div>
                    )}


                    {/* Login form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">

                        <input
                            type="email"
                            required
                            placeholder="Email address"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl
                         text-sm text-slate-700 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-slate-200"
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    required
    placeholder="Password"
    className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl
      text-sm text-slate-700 placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-slate-200"
    onChange={(e) =>
      setFormData({ ...formData, password: e.target.value })
    }
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


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-slate-800 text-white
                         font-semibold text-sm
                         hover:bg-slate-900 transition
                         disabled:opacity-60"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>

                    </form>

                    {/* Footer text */}
                    <p className="mt-6 text-sm text-slate-600">
                        Don’t have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="inline font-semibold text-slate-800
               hover:underline hover:text-slate-900
               focus:outline-none focus:underline
               bg-transparent p-0 m-0"
                        >
                            Join for free
                        </button>
                    </p>
                    <p className="mt-4 text-xs text-slate-500">
                        Having trouble? Visit our{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/help")}
                            className="font-medium text-slate-700 hover:underline"
                        >
                            Help Center
                        </button>.
                    </p>
                    </div>
{/* RIGHT : Illustration (Tablet + Desktop) */}
<div className="hidden sm:flex justify-center items-center">
  <img
    src="/loginpagestudent.jpg"
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
        </div>
    );
}
