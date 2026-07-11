import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, ChevronDown } from "lucide-react";

export default function StudentHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [selectedGoal, setSelectedGoal] = useState(localStorage.getItem("selectedGoal") || "");

  const navItems = [
    { label: "Dashboard", path: "/student" },
    { label: "Library", path: "/student/library" },
    { label: "Analysis", path: "/student/personal" },
    { label: "Profile", path: "/student/profile" },
  ];

  

  return (
    <header
      className="
        h-14 sm:h-18
        bg-gray-50 dark:bg-[#0B121C] border-b border-slate-200 dark:border-slate-800
        flex items-center justify-between
        px-3 sm:px-10 md:px-4 lg:px-8 xl:px-24 2xl:px-48
        sticky top-0 z-40
      "
    >
      {/* ===== LEFT : LOGO ===== */}
      <a href="/student" className="flex items-center">
        {/* Desktop / Tablet */}
        <img
          src="./icon-512.png"
          alt="Nexus"
          className="hidden sm:block h-8 sm:h-12 md:h-14 w-auto object-contain"
        />

        {/* Mobile */}
        <img
          src="./icon-512.png"
          alt="Nexus"
          className="block sm:hidden h-12 w-auto object-contain"
        />
      </a>

      {/* ===== MOBILE RIGHT : PROFILE ONLY ===== */}
      <div className="flex sm:hidden items-center gap-3">


        {/* Student name */}
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-slate-800">
            {user?.name || "Student"}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">
            Student
          </span>
        </div>


        {/* Profile circle */}
        <button
          onClick={() => navigate("/student/profile")}
          className="
            w-9 h-9 rounded-full
            bg-slate-900 text-white
            flex items-center justify-center
            text-sm font-bold
            hover:bg-slate-800 transition-colors
            active:scale-95
          "
        >
          {user?.name?.charAt(0)?.toUpperCase() || "S"}
        </button>
        
      </div>

      {/* ===== DESKTOP / TABLET : NAV + LOGOUT ===== */}
      <div className="hidden sm:flex items-center gap-8 ml-auto">
        {/* GOAL SELECTOR */}
        <div className="relative">
          <button
            onClick={() => navigate('/student/goal-selection')}
            className="
              flex items-center gap-2
              text-xs sm:text-sm font-bold
              bg-white dark:bg-[#121A28] border border-slate-200 dark:border-slate-800
              px-3.5 py-2 rounded-xl
              text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-900 transition
              shadow-sm active:scale-95 duration-150
            "
          >
            <span className="text-purple-600 dark:text-purple-400 font-extrabold uppercase text-[10px] tracking-wider block sm:inline">Goal:</span>
            <span>{selectedGoal || "Select Goal"}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>

        {/* NAV LINKS */}
        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative
                  text-[13px] md:text-[14px] lg:text-[15px]
                  font-semibold tracking-wide
                  transition-all duration-200
                  ${isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                {item.label}

                {isActive && (
                  <span
                    className="
                      absolute -bottom-2 left-1/2 -translate-x-1/2
                      w-14 h-[2px]
                      bg-slate-900 dark:bg-white rounded-full
                    "
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="
            flex items-center gap-2
            text-sm font-medium
            bg-red-700 px-4 py-2.5 rounded-lg
            text-white hover:bg-red-800 transition
          "
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}