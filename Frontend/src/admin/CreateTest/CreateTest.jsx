import React, { useState } from 'react';
import MethodSelection from "./shared/MethodSelection";
import PDFFormView from "./PDFFormView";
import CustomFormView from "./CustomFormView";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AdminHeader from '../AdminHeader';
import { useAuth } from '../../context/AuthContext';

export default function CreateTest() {
  const { user, logout } = useAuth(); // Get auth data for the header
  const [mode, setMode] = useState(null); 

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#f0ebf8]">
        {/* Pass props so the header isn't empty */}
        <AdminHeader userName={user?.name} onLogout={logout} />
        <MethodSelection onSelect={(val) => setMode(val)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8] pb-20">
      {/* MAIN NAV HEADER */}
      <AdminHeader userName={user?.name} onLogout={logout} />
      
      
      {/* FORM CONTENT */}
      <div className="max-w-4xl mx-auto pt-6 px-4">
        {mode === 'pdf' ? <PDFFormView /> : <CustomFormView />}
      </div>
      
      <p className="text-center text-slate-400 text-[10px] font-medium mt-10 uppercase tracking-widest">
        Powered by AI Content Engine v2.0
      </p>
    </div>
  );
}