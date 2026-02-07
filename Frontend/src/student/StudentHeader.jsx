import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function StudentHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/student" },
    { label: "Library", path: "/student/library" },
    { label: "Analysis", path: "/student/analysis" },
    { label: "Profile", path: "/student/profile" },
  ];

  return (
    <header
      className="
        h-14 sm:h-18
        bg-gray-50 border-b border-slate-200
        flex items-center justify-between
        px-3 sm:px-10 md:px-4 xl:px-48
        sticky top-0 z-40
      "
    >
      {/* ===== LEFT : LOGO ===== */}
      <a href="/student" className="flex items-center">
        {/* Desktop / Tablet */}
        <img
          src="/icon-512.png"
          alt="Nexus"
          className="hidden sm:block h-8 sm:h-12 md:h-14 w-auto object-contain"
        />

        {/* Mobile */}
        <img
          src="/icon-512.png"
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
        <div
          className="
            w-9 h-9 rounded-full
            bg-slate-900 text-white
            flex items-center justify-center
            text-sm font-bold
          "
        >
          {user?.name?.charAt(0)?.toUpperCase() || "S"}
        </div>
        
      </div>

      {/* ===== DESKTOP / TABLET : NAV + LOGOUT ===== */}
      <div className="hidden sm:flex items-center gap-8 ml-auto">
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
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                  }
                `}
              >
                {item.label}

                {isActive && (
                  <span
                    className="
                      absolute -bottom-2 left-1/2 -translate-x-1/2
                      w-14 h-[2px]
                      bg-slate-900 rounded-full
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
