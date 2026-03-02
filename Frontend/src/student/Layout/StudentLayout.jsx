import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react"; // Added hooks
import { LayoutGrid, BookOpen, Library, Heart, User as UserIcon, Plus, Home, Search, BarChart2, Book } from "lucide-react";

const navItem =
  "p-2 rounded-2xl transition-colors flex items-center justify-center";

const active =
  "text-indigo-600 bg-indigo-50";

const inactive =
  "text-zinc-300 hover:text-indigo-400";

export default function StudentLayout() {
  const location = useLocation();
  const [hideForPdf, setHideForPdf] = useState(false); // Helper to track PDF state

  // 1. Logic: Check if the current URL contains "/test/" or "/analytics"
  const isTestPage = location.pathname.includes("/test/");
  const isAnalysisPage = location.pathname.includes("/analytics");

  // 2. Observer: Listen for the attribute change on document.body
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Check if our custom attribute exists
      setHideForPdf(document.body.hasAttribute('data-hide-nav'));
    });

    observer.observe(document.body, { attributes: true });
    
    return () => {
      observer.disconnect();
      document.body.removeAttribute('data-hide-nav'); // Cleanup on unmount
    };
  }, []);

  // 3. Keep your variable names: Logic updated to include hideForPdf
  // If ANY of these are true, showNavbar becomes true (which hides the bar in your JSX)
  const showNavbar = isTestPage || isAnalysisPage || hideForPdf;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFF]">
      {/* PAGE CONTENT */}
      <main className={`bg-white flex-1 z-50 pb-0`}>
        <Outlet />
      </main>

      {/* BOTTOM NAV - Only render if NOT showNavbar */}
      {(!showNavbar) && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[4000] animate-in slide-in-from-bottom duration-300">
          {/* 1. The Floating Plus Button */}
          <button
            className="absolute left-1/2 -translate-x-1/2 -top-5 w-12 h-12 
                 bg-[#7A41F7] rounded-full flex items-center justify-center 
                 text-white shadow-lg  
                 active:scale-90 transition-transform z-50"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>

          {/* 2. The Curved Bar with the Notch */}
          <div className="relative">
            <svg
              viewBox="0 0 400 80"
              className="w-full h-[70px] drop-shadow-[0_-15px_30px_rgba(122,65,247,0.06)]"
              preserveAspectRatio="none"
              fill="white"
            >
              <path
                d="M0,20 
       C0,10 10,0 20,0 
       H140 
       C155,0 165,2 170,10 
       C175,25 180,35 200,35 
       C220,35 225,25 230,10 
       C235,2 245,0 260,0 
       H380 
       C390,0 400,10 400,20 
       V80 H0 Z"
              />
            </svg>

            {/* 3. The Navigation Icons */}
            <nav className="absolute inset-0 flex items-center justify-between px-10 pb-2">
              <NavLink to="/student" end className={({ isActive }) => `p-2 ${isActive ? 'text-[#1E1E2D]' : 'text-slate-300'}`}>
                <Home className="w-6 h-6 fill-current" />
              </NavLink>

              <NavLink to="/student/library" className={({ isActive }) => `p-2 ${isActive ? 'text-[#1E1E2D]' : 'text-slate-300'}`}>
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </NavLink>

              {/* Empty space for the notch */}
              <div className="w-14" />

              <NavLink to="/student/personal" className={({ isActive }) => `p-2 ${isActive ? 'text-[#1E1E2D]' : 'text-slate-300'}`}>
                <BarChart2 className="w-6 h-6 stroke-[2.5]" />
              </NavLink>

              <NavLink to="/student/profile" className={({ isActive }) => `p-2 ${isActive ? 'text-[#1E1E2D]' : 'text-slate-300'}`}>
                <UserIcon className="w-6 h-6 stroke-[2.5]" />
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}