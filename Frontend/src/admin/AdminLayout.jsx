import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, FileText, BarChart3, BookOpen, PenLine,
  FileUp, Database, RefreshCw, Eye, LogOut,
  Menu, X, ChevronDown,
} from "lucide-react";

/* ─── nav tree ──────────────────────────────────────────── */
const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    path: "/admin",
    exact: true,
  },
  {
    id: "tests-group",
    label: "Tests",
    icon: <FileText className="w-4 h-4" />,
    children: [
      { id: "see-tests",    label: "Test Results",      icon: <Eye className="w-3.5 h-3.5" />,       path: "/admin/tests"    },
      { id: "schedule",     label: "Schedule Test",     icon: <RefreshCw className="w-3.5 h-3.5" />, path: "/admin/schedule" },
    ],
  },
  {
    id: "create-group",
    label: "Create Test",
    icon: <PenLine className="w-4 h-4" />,
    children: [
      { id: "pdf",   label: "Upload PDF",     icon: <FileUp className="w-3.5 h-3.5" />,   path: "/admin/pdf"   },
      { id: "bank",  label: "Question Bank",  icon: <Database className="w-3.5 h-3.5" />, path: "/admin/bank"  },
      { id: "craft", label: "Craft Test",     icon: <PenLine className="w-3.5 h-3.5" />,  path: "/admin/craft", badge: "New" },
    ],
  },
  {
    id: "material",
    label: "Study Material",
    icon: <BookOpen className="w-4 h-4" />,
    path: "/admin/study-material",
  },
  {
    id: "performance",
    label: "Performance",
    icon: <BarChart3 className="w-4 h-4" />,
    path: "/admin/performance",
  },
  {
    id: "pyq",
    label: "PYQ Book",
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { id: "69a6be2794b749c00e88cd23", label: "Physics",     icon: <FileUp className="w-3.5 h-3.5" />,   path: "/admin/pyq/69a6be2794b749c00e88cd23", badge: "New" },
      { id: "69a6be2794b749c00e88cd24", label: "Chemistry",   icon: <Database className="w-3.5 h-3.5" />, path: "/admin/pyq/69a6be2794b749c00e88cd24", badge: "New" },
      { id: "69a6be2794b749c00e88cd25", label: "Mathematics", icon: <PenLine className="w-3.5 h-3.5" />,  path: "/admin/pyq/69a6be2794b749c00e88cd25", badge: "New" },
      { id: "69a6be2794b749c00e88cd26", label: "Biology",     icon: <FileUp className="w-3.5 h-3.5" />,   path: "/admin/pyq/69a6be2794b749c00e88cd26", badge: "New" },
    ],
  },
  {
    id: "Rankings",
    label: "Rankings",
    icon: <BarChart3 className="w-4 h-4" />,
    path: "/admin/rankings",
  },
];

/* ─── helpers ───────────────────────────────────────────── */
function isActive(item, pathname) {
  if (!item.path) return false;
  if (item.exact) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(item.path + "/");
}
function groupHasActive(group, pathname) {
  return group.children?.some(c => isActive(c, pathname));
}

/* ─── NavItem ───────────────────────────────────────────── */
function NavItem({ item, pathname, navigate, onClose }) {
  const active = isActive(item, pathname);
  return (
    <button
      onClick={() => { navigate(item.path); onClose?.(); }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
        ${active 
          ? 'bg-violet-50 text-violet-700 shadow-sm shadow-violet-100/50' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
    >
      <span className={`shrink-0 transition-colors ${active ? 'text-violet-600' : 'text-slate-400 group-hover:text-violet-500'}`}>
        {item.icon}
      </span>
      <span className="flex-1 text-left truncate tracking-tight">{item.label}</span>
      {item.badge && (
        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
      {active && (
        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0 animate-pulse" />
      )}
    </button>
  );
}

/* ─── NavGroup ──────────────────────────────────────────── */
function NavGroup({ item, pathname, navigate, onClose }) {
  const parentActive = groupHasActive(item, pathname);

  return (
    <div className="mb-1">
      <div className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-200
        ${parentActive ? 'text-violet-700 font-semibold' : 'text-slate-500 font-medium'}`}>
        <span className={`shrink-0 ${parentActive ? 'text-violet-600' : 'text-slate-400'}`}>
          {item.icon}
        </span>
        <span className="flex-1 truncate tracking-tight">{item.label}</span>
      </div>
      <div className="ml-5 mt-1 mb-2 pl-3 border-l-2 border-slate-100 flex flex-col gap-1">
        {item.children.map(child => (
          <NavItem key={child.id} item={child} pathname={pathname} navigate={navigate} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

/* ─── Sidebar ───────────────────────────────────────────── */
export function AdminSidebar({ onClose }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const pathname  = location.pathname;

  return (
    <aside className="w-[260px] min-w-[260px] h-full bg-white border-r border-slate-100 flex flex-col shrink-0 no-scrollbar overflow-y-auto z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-slate-100 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <img
            src="/icon-512.png"
            alt="Nexus"
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100 shadow-sm">
              Teacher
            </span>
            {onClose && (
              <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 overflow-y-auto">
        {NAV.map(item =>
          item.children
            ? <NavGroup key={item.id} item={item} pathname={pathname} navigate={navigate} onClose={onClose} />
            : <NavItem  key={item.id} item={item} pathname={pathname} navigate={navigate} onClose={onClose} />
        )}
      </nav>

      {/* ── User row ── */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md shadow-violet-200">
              {user?.name?.[0]?.toUpperCase() || "T"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-800 truncate tracking-tight">
                {user?.name || "Teacher User"}
              </div>
              <div className="text-[11px] text-violet-500 font-semibold truncate tracking-wide uppercase">Nexus Admin</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-slate-400 p-2.5 rounded-xl hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ─── PageHeader ────────────────────────────────────────── */
export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 shrink-0 sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="m-0 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="m-0 mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

/* ─── AdminLayout ───────────────────────────────────────── */
export default function AdminLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024); // Breakpoint for desktop
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans overflow-hidden text-slate-900">
      
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="h-screen sticky top-0 shrink-0 z-40">
          <AdminSidebar />
        </div>
      )}

      {/* Mobile backdrop */}
      {isMobile && (
        <div
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div 
          className={`fixed inset-y-0 left-0 z-[70] transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <AdminSidebar onClose={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile topbar */}
        {isMobile && (
          <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors bg-white shadow-sm"
            >
              <Menu size={20} />
            </button>
            <img src="/icon-192.png" alt="Nexus" className="h-8 w-auto object-contain" />
            <div className="w-10" /> {/* Balancer */}
          </div>
        )}

        {/* Content wrapper */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
}