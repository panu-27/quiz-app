import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import SuperHeader from "./SuperHeader";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Determine active tab based on URL path
  const activeTab = location.pathname.includes("admins") ? "admins" : "institutes";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24 md:pb-10">

      {/* 1. TOP NAVIGATION (Routing via navigate) */}
      <SuperHeader
        activeTab="none" // Neither tab is active on creation pages
        navigate={navigate}
        setShowMobileNav={() => { }} // or actual state if you want mobile menu here
      />

      {/* 2. SEARCH BAR (Shared across views) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-20 xl:px-48 2xl:px-24 mt-8">
        <div className="relative group w-full md:max-w-md">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input
            type="text"
            value={searchQuery}
            placeholder={`Search ${activeTab}...`}
            className="w-full px-12 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-50 transition-all shadow-sm"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. DYNAMIC CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-20 xl:px-48 2xl:px-24 mt-8">
        {/* We pass the searchQuery to the children via context or props */}
        <Outlet context={{ searchQuery }} />
      </main>

    </div>
  );
}