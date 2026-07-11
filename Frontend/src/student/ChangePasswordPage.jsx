import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_BAR_H = 28.5;

function PassInput({ label, value, onChange, show, onToggle, isDark }) {
    return (
        <div>
            <p className={`text-[13px] font-bold mb-1.5 ml-1 ${isDark ? 'text-slate-400' : 'text-[#8A889E]'}`}>{label}</p>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value} onChange={e => onChange(e.target.value)}
                    className={`w-full py-2.5 px-4 pr-12 rounded-md text-[15px] font-medium border focus:ring-2 outline-none transition-all ${isDark ? 'bg-[#151E2E] border-slate-700 text-white focus:border-[#4B3BCC] focus:ring-[#4B3BCC]/20' : 'bg-[#F9F9FB] border-slate-200 text-[#2D2A43] focus:border-[#4B3BCC] focus:ring-[#4B3BCC]/10'}`}
                />
                <button onClick={onToggle} className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
}

export default function ChangePasswordPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();

    const [passForm, setPassForm] = useState({ oldPassword: "", password: "", confirm: "" });
    const [showO, setShowO] = useState(false);
    const [showP, setShowP] = useState(false);
    const [showC, setShowC] = useState(false);
    const [passSaving, setPassSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const mismatch = passForm.password && passForm.confirm && passForm.password !== passForm.confirm;

    const savePassword = async () => {
        if (!passForm.oldPassword || !passForm.password || mismatch) return;
        try {
            setPassSaving(true);
            await api.put('/users/profile', { oldPassword: passForm.oldPassword, password: passForm.password });
            setToast({ msg: "Password updated successfully!", type: "success" });
            setTimeout(() => {
                setToast(null);
                setPassForm({ oldPassword: "", password: "", confirm: "" });
                navigate(-1);
            }, 2000);
        } catch (error) {
            setToast({ msg: error.response?.data?.message || "Failed to update password", type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setPassSaving(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#000711]' : 'bg-white'}`}>
            {/* Standard Header */}
            <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pt-4 ${isDark ? 'bg-[#000711] ' : 'bg-white '}`} style={{ paddingTop: STATUS_BAR_H + 12 }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-1 flex items-center justify-center transition-colors bg-transparent border-none ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={`text-[19px] font-medium leading-tight m-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Change Password
                    </h1>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-6 mt-2 pb-56 flex flex-col max-w-lg mx-auto w-full">
                <div className="flex-1 space-y-5">
                    <PassInput label="Current Password" value={passForm.oldPassword} onChange={v => setPassForm(f => ({ ...f, oldPassword: v }))} show={showO} onToggle={() => setShowO(!showO)} isDark={isDark} />
                    <PassInput label="New Password" value={passForm.password} onChange={v => setPassForm(f => ({ ...f, password: v }))} show={showP} onToggle={() => setShowP(!showP)} isDark={isDark} />
                    <PassInput label="Confirm New Password" value={passForm.confirm} onChange={v => setPassForm(f => ({ ...f, confirm: v }))} show={showC} onToggle={() => setShowC(!showC)} isDark={isDark} />

                    {mismatch && <p className="text-[13px] text-rose-500 font-bold mt-2 flex items-center gap-1.5"><AlertCircle size={14} /> Passwords do not match</p>}

                    <div className="pt-2">
                        <button className="text-[13px] font-bold text-[#4B3BCC] hover:text-[#3d2eb3] transition-colors">
                            Forgot your password?
                        </button>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Area */}
            <div className={`fixed bottom-0 left-0 right-0 p-5 z-50 `}>
                <div className="max-w-lg mx-auto flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        disabled={passSaving}
                        className={`flex-1 py-2.5 font-medium text-[15px] rounded-sm border transition-colors ${isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={savePassword}
                        disabled={passSaving || !passForm.password || !passForm.oldPassword || !!mismatch}
                        className={`flex-1 py-2.5 bg-[#4B3BCC] hover:bg-[#3d2eb3] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:opacity-50 text-white font-medium text-[15px] rounded-sm transition-colors`}
                    >
                        {passSaving ? "Updating..." : "Update Password"}
                    </button>
                </div>
            </div>

            {toast && (
                <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2.5 px-5 py-3 rounded-sm shadow-xl text-sm font-semibold text-white pointer-events-none font-body ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
