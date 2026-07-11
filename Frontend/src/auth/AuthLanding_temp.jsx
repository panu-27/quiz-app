import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Validation Schemas (Obfuscated keys to defeat browser autofill) ---
const loginSchema = z.object({
  reqMailAddress: z.string().email("Invalid email address"),
  reqSecretKey: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  reqFullName: z.string().min(2, "Name is required"),
  reqMailAddress: z.string().email("Invalid email address"),
  reqSecretKey: z.string().min(6, "Password must be at least 6 characters"),
  reqConfirmSecretKey: z.string().min(1, "Confirm password is required"),
  instituteId: z.string().min(1, "Please select an institute"),
}).refine((data) => data.reqSecretKey === data.reqConfirmSecretKey, {
  message: "Passwords do not match",
  path: ["reqConfirmSecretKey"],
});

export default function AuthLanding() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sheetState = searchParams.get("mode") || "initial"; // "initial", "login", "register"
  
  const handleOpen = (mode) => {
    navigate(`/?mode=${mode}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src="/auth-bg.png" alt="Background" className="w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      </div>

      {/* Initial Buttons (No Background, directly over image) */}
      {sheetState === "initial" && (
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-12 sm:max-w-md sm:mx-auto space-y-4">
          <button
            onClick={() => handleOpen("register")}
            className="w-full h-14 rounded-none border border-white/50 text-white font-semibold text-base backdrop-blur-sm hover:bg-white/10 transition"
          >
            Create Account
          </button>
          <button
            onClick={() => handleOpen("login")}
            className="w-full h-14 rounded-none bg-white text-slate-900 font-semibold text-base hover:bg-slate-100 transition"
          >
            Log In
          </button>
        </div>
      )}

      {/* Full Screen Forms */}
      {sheetState !== "initial" && (
        <div className="fixed inset-0 z-30 bg-white">
          <div className="h-full w-full max-w-md mx-auto px-6 pt-12 sm:pt-16 pb-12 overflow-y-auto">
            {sheetState === "login" && (
              <LoginView onBack={handleBack} loginFn={login} />
            )}
            {sheetState === "register" && (
              <RegisterView onBack={handleBack} loginFn={login} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Login View ---
function LoginView({ onBack, loginFn }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const payload = {
        email: data.reqMailAddress,
        password: data.reqSecretKey,
      };
      const res = await api.post("/auth/login", payload);
      loginFn(res.data.data);
    } catch (err) {
      if (err.response?.data) {
        setStatus({
          type: err.response.data.status === 403 ? "pending" : "error",
          message: err.response.data.message,
        });
      } else {
        setStatus({ type: "error", message: "Connection lost. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold text-slate-800 ml-2">Welcome Back</h2>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 text-sm ${status.type === "pending" ? "bg-yellow-50 text-yellow-800 border border-yellow-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <input
            {...register("reqMailAddress")}
            type="text"
            inputMode="email"
            placeholder="Email address"
            autoComplete="off"
            spellCheck="false"
            data-lpignore="true"
            className="w-full px-5 py-4 border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition bg-transparent"
          />
          {errors.reqMailAddress && <p className="text-red-500 text-xs mt-1 ml-1">{errors.reqMailAddress.message}</p>}
        </div>

        <div className="relative">
          <input
            {...register("reqSecretKey")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="new-password"
            spellCheck="false"
            data-lpignore="true"
            className="w-full px-5 py-4 pr-12 border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
          </button>
          {errors.reqSecretKey && <p className="text-red-500 text-xs mt-1 ml-1">{errors.reqSecretKey.message}</p>}
        </div>

        <button type="button" className="text-sm font-medium text-slate-600 hover:text-slate-900 mt-2 ml-1">
          Forgot Password?
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 mt-8 rounded-none bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 transition disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

function RegisterView({ onBack, loginFn }) {
  const [loading, setLoading] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const selectedInstituteId = watch("instituteId");
  const selectedInstituteName = institutes.find(i => i._id === selectedInstituteId)?.name || "";

  // Sync visible input value with actual selection whenever dropdown closes
  useEffect(() => {
    if (!showDropdown) {
      setInputValue(selectedInstituteName);
      setSearchQuery("");
    }
  }, [showDropdown, selectedInstituteName]);

  useEffect(() => {
    api.get("/super/get-institutes")
      .then((res) => setInstitutes(res.data))
      .catch(() => console.error("Failed to load institutes"));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const payload = {
        name: data.reqFullName,
        email: data.reqMailAddress,
        password: data.reqSecretKey,
        instituteId: data.instituteId,
      };
      await api.post("/auth/register-student", payload);
      
      // Auto-login immediately after registration
      const loginPayload = {
        email: data.reqMailAddress,
        password: data.reqSecretKey,
      };
      const res = await api.post("/auth/login", loginPayload);
      loginFn(res.data.data);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setSearchQuery(val);
    setShowDropdown(true);

    if (selectedInstituteId) {
      setValue("instituteId", "", { shouldValidate: true });
    }
  };

  const hiddenInstitutes = ["GCC"];

  const filteredInstitutes = institutes.filter(inst => {
    if (hiddenInstitutes.includes(inst.name)) return false;
    return inst.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 text-slate-500 transition">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold text-slate-800 ml-2">Create Account</h2>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 text-sm ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("reqFullName")}
            type="text"
            placeholder="Full name"
            autoComplete="off"
            spellCheck="false"
            data-lpignore="true"
            className="w-full px-5 py-4 border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition bg-transparent"
          />
          {errors.reqFullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.reqFullName.message}</p>}
        </div>

        <div>
          <input
            {...register("reqMailAddress")}
            type="text"
            inputMode="email"
            placeholder="Email address"
            autoComplete="off"
            spellCheck="false"
            data-lpignore="true"
            className="w-full px-5 py-4 border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition bg-transparent"
          />
          {errors.reqMailAddress && <p className="text-red-500 text-xs mt-1 ml-1">{errors.reqMailAddress.message}</p>}
        </div>

        <div className="relative">
          <input
            {...register("reqSecretKey")}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="new-password"
            spellCheck="false"
            data-lpignore="true"
            className="w-full px-5 py-4 pr-12 border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
          </button>
          {errors.reqSecretKey && <p className="text-red-500 text-xs mt-1 ml-1">{errors.reqSecretKey.message}</p>}
        </div>

        <div>
          <input
            {...register("reqConfirmSecretKey")}
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            autoComplete="new-password"
            spellCheck="false"
            data-lpignore="true"
            className="w-full px-5 py-4 border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition bg-transparent"
          />
          {errors.reqConfirmSecretKey && <p className="text-red-500 text-xs mt-1 ml-1">{errors.reqConfirmSecretKey.message}</p>}
        </div>

        {/* Custom ComboBox (Input + Dropdown) */}
        <div className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search or select institute..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                setShowDropdown(true);
                setSearchQuery("");
              }}
              autoComplete="off"
              spellCheck="false"
              data-lpignore="true"
              className="w-full px-5 py-4 pr-12 border border-slate-300 rounded-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 transition bg-transparent"
            />
            <button
              type="button"
              onClick={() => {
                 if (!showDropdown) setSearchQuery("");
                 setShowDropdown(!showDropdown);
              }}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <svg className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          
          {errors.instituteId && <p className="text-red-500 text-xs mt-1 ml-1">{errors.instituteId.message}</p>}

          {/* Transparent Overlay for click-outside */}
          {showDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
          )}

          {/* The Dropdown Menu */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-300 shadow-md rounded-none"
              >
                <div className="max-h-56 overflow-y-auto">
                  {filteredInstitutes.length === 0 ? (
                     <p className="text-slate-500 text-center py-6 text-sm">No institutes found</p>
                  ) : (
                     filteredInstitutes.map(inst => (
                       <button
                         key={inst._id}
                         type="button"
                         onMouseDown={(e) => {
                           // Use onMouseDown instead of onClick to prevent input blur from firing first
                           e.preventDefault();
                           setValue("instituteId", inst._id, { shouldValidate: true });
                           setShowDropdown(false);
                           setSearchQuery("");
                         }}
                         className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm text-slate-800 flex justify-between items-center"
                       >
                         <span className="truncate pr-4">{inst.name}</span>
                         {selectedInstituteId === inst._id && (
                            <svg className="w-4 h-4 text-slate-900 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                         )}
                       </button>
                     ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 mt-6 rounded-none bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 transition disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

