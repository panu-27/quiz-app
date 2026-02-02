import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutGrid, BookOpen, Heart, User as UserIcon } from "lucide-react";

const navItem =
  "p-2 rounded-2xl transition-colors flex items-center justify-center";

const active =
  "text-indigo-600 bg-indigo-50";

const inactive =
  "text-zinc-300 hover:text-indigo-400";

export default function StudentLayout() {
  const location = useLocation();
  
  // Logic: Check if the current URL contains "/test/"
  const isTestPage = location.pathname.includes("/test/");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFF]">
      {/* PAGE CONTENT - Remove padding-bottom if on test page */}
      <main className={`flex-1 z-50 ${isTestPage ? "pb-0" : "pb-24"}`}>
        <Outlet />
      </main>

      {/* BOTTOM NAV - Only render if NOT on test page */}
      {!isTestPage && (
        <nav className="fixed bottom-0 w-full bg-white shadow-2xl shadow-indigo-200 px-8 py-3 flex justify-between items-center border border-zinc-100/50 backdrop-blur-sm z-50">
          
          {/* DASHBOARD */}
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <LayoutGrid className="w-6 h-6" />
          </NavLink>

          {/* STUDY / LIBRARY */}
          <NavLink
            to="/student/library"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <BookOpen className="w-6 h-6" />
          </NavLink>

          {/* FAVORITES / PERSONAL ANALYTICS */}
          <NavLink
            to="/student/personal"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <Heart className="w-6 h-6" />
          </NavLink>

          {/* PROFILE */}
          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <UserIcon className="w-6 h-6" />
          </NavLink>

        </nav>
      )}
    </div>
  );
}