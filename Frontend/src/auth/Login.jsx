import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

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

  // --- GET STARTED SCREEN (PREMIUM BACKGROUND) ---
  if (!showForm) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-between p-8 overflow-hidden font-sans">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-blue-900/40 via-blue-900/20 to-blue-950/90" />

        <div className="relative z-20 mt-20 text-center space-y-2 animate-in fade-in slide-in-from-top-10 duration-1000">
          <h1 className="text-7xl font-black italic tracking-tighter text-white drop-shadow-2xl">
            NEXUS
          </h1>
          <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
          <p className="text-blue-50 text-lg font-light tracking-[0.2em] uppercase">
            Evolution of Learning
          </p>
        </div>
        
        <div className="relative z-20 w-full max-w-sm space-y-4 mb-12">
          <button 
            onClick={() => { setIsLogin(true); setShowForm(true); }}
            className="w-full py-5 bg-white text-blue-700 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95 hover:bg-blue-50"
          >
            Enter Portal
          </button>
          <button 
            onClick={() => { setIsLogin(false); setShowForm(true); }}
            className="w-full py-5 bg-white/10 border border-white/20 text-white rounded-2xl font-semibold backdrop-blur-xl transition-all active:scale-95 hover:bg-white/20"
          >
            Join Nexus
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN FORM UI (CLEAN & AESTHETIC) ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-0 md:p-6 selection:bg-blue-100">
      <div className="w-full h-full min-h-screen md:min-h-0 md:h-auto md:max-w-md bg-white md:rounded-[3rem] shadow-none md:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        <div className="px-8 pt-10 pb-6 flex items-center gap-4">
          <button 
            onClick={() => setShowForm(false)}
            className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            ←
          </button>
          <span className="text-blue-600 font-black italic text-2xl tracking-tighter">NEXUS</span>
        </div>

        <div className="px-8 pb-10 flex-1">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
              {isLogin ? "Sign In" : "Register"}
            </h2>
            <p className="text-slate-400 mt-3 font-medium text-lg">
              {isLogin ? "Connect to your dashboard." : "Create your student identity."}
            </p>
          </div>

          {status.message && (
            <div className={`mb-8 p-5 rounded-[1.5rem] flex items-center gap-4 animate-in slide-in-from-left-4 duration-300 ${
              status.type === "error" ? "bg-red-50 text-red-700 border border-red-100" : "bg-blue-50 text-blue-700 border border-blue-100"
            }`}>
              <div className={`w-3 h-3 rounded-full ${status.type === "error" ? "bg-red-500" : "bg-blue-500"}`} />
              <p className="text-sm font-bold">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                name="name"
                required
                className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-semibold text-slate-800 placeholder:text-slate-400"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            )}

            <input
              name="email"
              type="email"
              required
              className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-semibold text-slate-800 placeholder:text-slate-400"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <input
              name="password"
              type="password"
              required
              className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none font-semibold text-slate-800 placeholder:text-slate-400"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />

            {!isLogin && (
              <div className="relative">
                <select
                  name="instituteId"
                  required
                  className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 transition-all outline-none appearance-none font-semibold text-slate-500"
                  value={formData.instituteId}
                  onChange={(e) => setFormData({...formData, instituteId: e.target.value})}
                >
                  <option value="">Select Institute</option>
                  {institutes.map((inst) => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">↓</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-700 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? "INITIALIZING..." : isLogin ? "LOG IN" : "APPLY"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setStatus({type: "", message: ""}); }}
              className="text-slate-400 font-bold hover:text-blue-600 transition-colors text-sm uppercase tracking-tighter"
            >
              {isLogin ? "No account? Register" : "Have access? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}