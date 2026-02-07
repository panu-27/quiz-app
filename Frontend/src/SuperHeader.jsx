import React, { useState } from 'react';
import { 
  ArrowRightOnRectangleIcon, 
  Bars3Icon, 
  XMarkIcon, 
  HomeModernIcon, 
  FingerPrintIcon,
  PlusCircleIcon 
} from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';

const SuperHeader = ({ activeTab}) => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  const menuItems = [
    { name: 'Institutes', path: '/super/institutes', icon: HomeModernIcon, color: 'text-[#08BD80]' },
    { name: 'Admins', path: '/super/admins', icon: FingerPrintIcon, color: 'text-blue-500' },
  ];

  const actionItems = [
    { name: 'Add Institute', path: '/system/create-institute' },
    { name: 'Add Admin', path: '/system/create-admin' },
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      <nav className="h-14 sm:h-18 bg-gray-50 border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between px-3 sm:px-10 md:px-4 xl:px-48">
        {/* LOGO */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/super')}>
          <img src="/icon-512.png" alt="Logo" className="h-12 md:h-14 w-auto object-contain" />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* DESKTOP NAV (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-6 border-r pr-6 border-slate-100">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`text-[11px] cursor-pointer font-black uppercase tracking-widest transition
                  ${activeTab === item.name.toLowerCase() ? item.color : "text-slate-400"}`}
              >
                {item.name}
              </button>
            ))}

            {actionItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="text-[10px] cursor-pointer font-black uppercase text-slate-400 hover:text-slate-900 transition"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* LOGOUT (Desktop only) */}
          <button onClick={handleLogout} className="hidden md:flex items-center gap-2 cursor-pointer text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition">
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>

          {/* MOBILE BURGER BUTTON */}
          <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 active:scale-95 transition">
            <Bars3Icon className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </nav>

      {/* MOBILE SLIDER (Drawer) */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-visibility duration-300 ${isMobileOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileOpen ? "opacity-100" : "opacity-0"}`} 
          onClick={() => setIsMobileOpen(false)}
        />
        
        {/* Drawer Content */}
        <div className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 transform ${isMobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <img src="/icon-512.png" className="h-10 w-auto" alt="Logo" />
              <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-slate-50 rounded-full"><XMarkIcon className="w-6 h-6 text-slate-500" /></button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-2 flex-grow">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Management</p>
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.name.toLowerCase() ? "bg-slate-50 border-l-4 border-slate-900" : ""}`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.name.toLowerCase() ? item.color : "text-slate-400"}`} />
                  <span className={`text-xs font-black uppercase tracking-widest ${activeTab === item.name.toLowerCase() ? "text-slate-900" : "text-slate-500"}`}>{item.name}</span>
                </button>
              ))}

              <hr className="my-4 border-slate-50" />
              
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Quick Actions</p>
              {actionItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNav(item.path)}
                  className="flex items-center gap-4 p-4 text-slate-500 hover:text-slate-900 transition-all text-left"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Logout at bottom */}
            <button onClick={handleLogout} className="mt-auto flex items-center gap-4 p-4 bg-red-50 rounded-2xl text-red-600 transition-all active:scale-95">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Logout Session</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperHeader;