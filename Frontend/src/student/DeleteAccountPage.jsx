import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_BAR_H = 28.5;

export default function DeleteAccountPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#000711]' : 'bg-white'}`}>
            {/* Standard Header */}
            <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 pt-4 ${isDark ? 'bg-[#000711]' : 'bg-white'}`} style={{ paddingTop: STATUS_BAR_H + 12 }}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-1 flex items-center justify-center transition-colors bg-transparent border-none ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={`text-[19px] font-medium leading-tight m-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Delete Account
                    </h1>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-1 pb-56 flex flex-col max-w-lg mx-auto w-full">
                <div className="flex-1">


                    <p className={`text-[15px] leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        We're sorry to see you go. Deleting your account is a permanent action and cannot be reversed. Please carefully read the information below before proceeding.
                    </p>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Data Deletion and Loss of Access:</h3>

                    <ul className={`list-disc pl-5 mb-6 space-y-3 text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <li><strong>Personal Information:</strong> Your profile, email address, and personal settings will be permanently erased from our active databases.</li>
                        <li><strong>Learning Progress:</strong> All your test history, quiz scores, and detailed performance analytics will be deleted forever.</li>
                        <li><strong>Subscriptions:</strong> Any active subscriptions will be cancelled immediately. No refunds will be provided for any remaining time.</li>
                        <li><strong>Saved Content:</strong> You will lose access to all saved bookmarks, custom notes, and downloaded resources.</li>
                    </ul>

                    <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Important Details:</h3>

                    <ul className={`list-disc pl-5 mb-8 space-y-2 text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <li>You will immediately lose access to the platform upon confirmation.</li>
                        <li>It may take up to 30 days to completely purge your data from our backup systems.</li>
                    </ul>

                    <div className="mb-8 space-y-4">
                        <div className="flex gap-2.5 text-rose-500 font-medium">
                            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-[14px] leading-relaxed">
                                If you are experiencing issues with your account, please consider contacting support before choosing to delete it. Once deleted, we cannot recover your data under any circumstances.
                            </p>
                        </div>
                        <p className={`text-[14px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Additionally, if you have any pending payments or ongoing disputes, your account data may be temporarily retained for legal and compliance reasons before being fully wiped.
                        </p>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Area */}
            <div className={`fixed bottom-0 left-0 right-0 p-5 border-t z-50 ${isDark ? 'bg-[#000711] border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="max-w-lg mx-auto">
                    <label className="flex items-start gap-3 mb-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            className={`mt-1 w-4 h-4 rounded border-slate-300 text-[#DE4242] focus:ring-[#DE4242] ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white'}`}
                        />
                        <span className={`text-[14px] leading-snug ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            I have read the full document and understand that this action is permanent.
                        </span>
                    </label>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={!isChecked || isDeleting}
                            className={`w-full py-2.5 bg-[#DE4242] hover:bg-[#c93b3b] disabled:opacity-50 text-white font-medium text-[15px] rounded-sm transition-colors`}
                        >
                            {isDeleting ? "Processing..." : "Delete Account"}
                        </button>
                    </div>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2.5 px-5 py-3 rounded-sm shadow-xl text-sm font-semibold text-white pointer-events-none font-body bg-emerald-500">
                    {toast.msg}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowConfirmModal(false)} />
                    <div className={`relative w-full max-w-md ${isDark ? 'bg-[#151E2E] border-t border-slate-800' : 'bg-white'} rounded-t-lg p-6 pb-10 animate-in slide-in-from-bottom-full duration-300 shadow-2xl`}>
                        <div className="text-left mb-6 mt-2">
                            <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete Account?</h3>
                            <p className={`text-[15px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Are you sure you want to permanently delete your account?</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmModal(false)} className={`flex-1 py-2.5 font-bold text-[15px] rounded-sm border ${isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} active:scale-[0.98] transition-all`}>
                                No, Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsDeleting(true);
                                    setShowConfirmModal(false);
                                    setToast({ msg: "Account deletion requested.", type: "success" });
                                    setTimeout(handleLogout, 2000);
                                }}
                                className="flex-1 py-2.5 bg-[#DE4242] hover:bg-[#c93b3b] text-white font-bold text-[15px] rounded-sm active:scale-[0.98] transition-all"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
