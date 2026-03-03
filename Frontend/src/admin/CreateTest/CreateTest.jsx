import React, { useState } from 'react';
import MethodSelection from "./shared/MethodSelection";
import PDFFormView from "./PDFFormView";
import CustomFormView from "./CustomFormView";
import CraftTest from "./CraftTest";
import ScheduleTests from "./ScheduleTests";
import AdminHeader from '../AdminHeader';
import { useAuth } from '../../context/AuthContext';

export default function CreateTest() {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState(null);

  if (!mode) {
    return (
      <div className="min-h-screen bg-[#f0ebf8]">
        <AdminHeader userName={user?.name} onLogout={logout} />
        <MethodSelection onSelect={(val) => setMode(val)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8]">
      <AdminHeader userName={user?.name} onLogout={logout} />
      <div className="w-full mx-auto">
        {mode === 'pdf'      && <PDFFormView />}
        {mode === 'dynamic'  && <CustomFormView />}
        {mode === 'craft'    && <CraftTest />}
        {mode === 'schedule' && <ScheduleTests />}
      </div>
    </div>
  );
}