import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import GetStarted from "./GetStarted";

export default function AuthPage() {
  const { login } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    instituteId: ""
  });

  useEffect(() => {
    if (!isLogin && institutes.length === 0) {
      api.get("/super/get-institutes")
        .then((res) => setInstitutes(res.data))
        .catch(() => setStatus({ type: "error", message: "Nexus Sync Failed." }));
    }
  }, [isLogin, institutes.length]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post("/auth/login", { email: formData.email, password: formData.password });
        login(res.data);
      } else {
        await api.post("/auth/register-student", formData);
        setStatus({ type: "pending", message: "ID Pending. Contact your admin." });
        setFormData({ name: "", email: "", password: "", instituteId: "" });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Connection lost.";
      setStatus({ type: errMsg.toLowerCase().includes("approved") ? "pending" : "error", message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  // --- GET STARTED (MOBILE-FIRST LANDING) ---
  // --- GET STARTED (MOBILE-FIRST LANDING) ---
if (!showForm) {
  return (
    <GetStarted 
      setIsLogin={setIsLogin} 
      setShowForm={setShowForm} 
    />
  );
}

  // --- SIGN IN / REGISTER FORM (MOBILE-FIRST) ---
return (
  <div className="relative min-h-[100dvh] flex flex-col font-sans selection:bg-blue-100">
    
    {/* Background - Matching the Landing Page for Continuity */}
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop" 
        alt="Classroom"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-white/90 backdrop-blur-md" />
    </div>

    {/* Header - Super Clean & Thin */}
    <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200/50 pt-[max(1rem,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
        <span className="text-sm font-medium">Back</span>
      </button>
      <span className="text-slate-900 font-black italic text-xl tracking-tighter">NEXUS</span>
      <div className="w-10" /> {/* Spacer for symmetry */}
    </header>

    <main className="relative z-10 flex-1 flex  px-6 py-12">
      <div className="w-full max-w-[400px]">
        
        {/* Form Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin ? "Enter your details to access your dashboard" : "Join our community of elite learners"}
          </p>
        </div>

        {/* Status Messages - Modern Toast Style */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            status.type === "error" 
              ? "bg-red-50 text-red-700 border-red-100" 
              : "bg-blue-50 text-blue-700 border-blue-100"
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
              <input
                name="name"
                required
                type="text"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-300"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-300"
              placeholder="name@institute.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-300"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">Institute</label>
              <div className="relative">
                <select
                  name="instituteId"
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none text-slate-900 transition-all"
                  value={formData.instituteId}
                  onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}
                >
                  <option value="">Select your campus</option>
                  {institutes.map((inst) => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-base shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 active:scale-[0.99] transition-all mt-4"
          >
            {loading ? "Authenticating..." : isLogin ? "Sign In" : "Register Now"}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setStatus({ type: "", message: "" }); }}
            className="text-slate-500 font-medium text-sm hover:text-blue-600 transition-colors"
          >
            {isLogin ? (
              <span>Don't have an account? <span className="text-blue-600 font-bold underline underline-offset-4">Join Nexus</span></span>
            ) : (
              <span>Already a member? <span className="text-blue-600 font-bold underline underline-offset-4">Log in</span></span>
            )}
          </button>
        </footer>
      </div>
    </main>
  </div>
);
}
