import React from 'react';
import { LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function AdminHeader({ userName, onLogout }) {
  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
      <div className="sm:pl-6 flex items-center gap-2">
        <div className="rounded-xl flex items-center justify-center">
          <img
            src="/icon-192.png"
            alt="Dashboard Icon"
            className="w-12 h-12 object-contain"
          />
        </div>
        <div>
          <p className="text-[10px] font-black text-[#673ab7] uppercase tracking-widest leading-none mb-1">
            Nexus Admin
          </p>
          <h1 className="font-bold text-slate-800 text-sm leading-none">
            {userName} Dashboard
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase">System Active</span>
        </div>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}