/**
 * AdminLayout.jsx — Nexus Admin
 * Sidebar uses icon-512.png (has name) in sidebar logo, icon-192.png (icon only) on mobile topbar.
 * Electron-safe: no window.location hacks, uses react-router only.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, FileText, BarChart3, BookOpen, PenLine,
  FileUp, Database, RefreshCw, Eye, LogOut,
  Menu, X, ChevronDown,
} from "lucide-react";

/* ─── colour tokens ─────────────────────────────────────── */
const T = {
  bg:         "#f4f3fa",
  sidebar:    "#ffffff",
  border:     "#ede9f6",
  accent:     "#6d28d9",
  accentBg:   "#ede9fe",
  accentText: "#5b21b6",
  muted:      "#94a3b8",
  text:       "#0f172a",
  hover:      "#faf8ff",
};

/* ─── nav tree ──────────────────────────────────────────── */
const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={15} />,
    path: "/admin",
    exact: true,
  },
  {
    id: "tests-group",
    label: "Tests",
    icon: <FileText size={15} />,
    children: [
      { id: "see-tests",    label: "Test Results",      icon: <Eye size={13} />,       path: "/admin/tests"    },
      { id: "schedule",     label: "Schedule Test", icon: <RefreshCw size={13} />, path: "/admin/schedule" },
    ],
  },
  {
    id: "create-group",
    label: "Create Test",
    icon: <PenLine size={15} />,
    children: [
      { id: "pdf",   label: "Upload PDF",     icon: <FileUp size={13} />,   path: "/admin/pdf"   },
      { id: "bank",  label: "Question Bank",  icon: <Database size={13} />, path: "/admin/bank"  },
      { id: "craft", label: "Craft Test", icon: <PenLine size={13} />,  path: "/admin/craft", badge: "New" },
    ],
  },
  {
    id: "material",
    label: "Study Material",
    icon: <BookOpen size={15} />,
    path: "/admin/study-material",
  },
  {
    id: "performance",
    label: "Performance",
    icon: <BarChart3 size={15} />,
    path: "/admin/performance",
  },
    {
    id: "pyq",
    label: "PYQ Book",
    icon: <BookOpen size={15} />,
     children: [
      { id: "69a6be2794b749c00e88cd23",   label: "Physics",    icon: <FileUp size={13} />,   path: "/admin/pyq/69a6be2794b749c00e88cd23" , badge: "New"},
      { id: "69a6be2794b749c00e88cd24",  label: "Chemistry",  icon: <Database size={13} />, path: "/admin/pyq/69a6be2794b749c00e88cd24" , badge: "New"},
      { id: "69a6be2794b749c00e88cd25", label: "Mathematics", icon: <PenLine size={13} />,  path: "/admin/pyq/69a6be2794b749c00e88cd25", badge: "New" },
      { id: "69a6be2794b749c00e88cd26", label: "Biology", icon: <FileUp size={13} />,  path: "/admin/pyq/69a6be2794b749c00e88cd26", badge: "New" },
    ],
  },
  {
    id: "Rankings",
    label: "Rankings",
    icon: <BarChart3 size={15} />,
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
      style={{
        all: "unset",
        display: "flex", alignItems: "center", gap: 10,
        padding: "7px 11px", borderRadius: 9, cursor: "pointer",
        width: "100%", boxSizing: "border-box",
        background: active ? T.accentBg : "transparent",
        color: active ? T.accentText : "#64748b",
        fontWeight: active ? 700 : 500,
        fontSize: 13, transition: "background 0.12s, color 0.12s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.hover; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ color: active ? T.accent : "#c4b5fd", flexShrink: 0, lineHeight: 0 }}>{item.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.2 }}>{item.label}</span>
      {item.badge && (
        <span style={{
          fontSize: 8, fontWeight: 800, textTransform: "uppercase",
          background: "#ecfdf5", color: "#059669",
          border: "1px solid #a7f3d0", padding: "2px 6px", borderRadius: 99,
        }}>{item.badge}</span>
      )}
      {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.accent, flexShrink: 0 }} />}
    </button>
  );
}

/* ─── NavGroup — always expanded, no toggle ────────────── */
function NavGroup({ item, pathname, navigate, onClose }) {
  const parentActive = groupHasActive(item, pathname);

  return (
    <div>
      {/* group label — not clickable, just a label */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "7px 11px",
        width: "100%", boxSizing: "border-box",
        color: parentActive ? T.accentText : "#64748b",
        fontWeight: parentActive ? 700 : 500,
        fontSize: 13,
      }}>
        <span style={{ color: parentActive ? T.accent : "#c4b5fd", flexShrink: 0, lineHeight: 0 }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
      </div>

      {/* children — always visible */}
      <div style={{
        marginLeft: 20, marginTop: 2, marginBottom: 4,
        paddingLeft: 12, borderLeft: "2px solid #ede9fe",
        display: "flex", flexDirection: "column", gap: 1,
      }}>
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
    <aside style={{
      width: 236, minWidth: 236, height: "100%",
      background: T.sidebar,
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      overflowY: "auto", flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }} className="no-scrollbar">

      {/* ── Logo ── */}
      <div style={{
        padding: "16px 18px 14px",
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img
            src="/icon-512.png"
            alt="Nexus"
            style={{ height: 38, width: "auto", objectFit: "contain" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: "#a78bfa",
              textTransform: "uppercase", letterSpacing: "0.1em",
              background: "#f5f3ff", padding: "2px 7px", borderRadius: 99,
              border: "1px solid #ddd6fe",
            }}>Teacher</span>
            {onClose && (
              <button onClick={onClose} style={{ all: "unset", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 6, lineHeight: 0 }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(item =>
          item.children
            ? <NavGroup  key={item.id} item={item} pathname={pathname} navigate={navigate} onClose={onClose} />
            : <NavItem   key={item.id} item={item} pathname={pathname} navigate={navigate} onClose={onClose} />
        )}
      </nav>

      {/* ── User row ── */}
      <div style={{
        padding: "12px 14px",
        borderTop: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0,
            boxShadow: "0 2px 8px rgba(124,58,237,0.3)",
          }}>
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name || "Admin"}
            </div>
            <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 500 }}>Teacher</div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{ all: "unset", cursor: "pointer", color: "#d1d5db", padding: 6, borderRadius: 7, lineHeight: 0, border: "1px solid #f3f4f6", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.background = "#fff1f2"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#d1d5db"; e.currentTarget.style.borderColor = "#f3f4f6"; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}

/* ─── PageHeader ────────────────────────────────────────── */
export function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{
      background: "#fff", borderBottom: `1px solid ${T.border}`,
      padding: "12px 24px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 10,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: "-0.4px" }}>{title}</h1>
        {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12, color: T.muted, fontWeight: 500 }}>{subtitle}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

/* ─── AdminLayout ───────────────────────────────────────── */
export default function AdminLayout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div style={{
      display: "flex", height: "100vh", background: T.bg,
      fontFamily: "'DM Sans', sans-serif", overflow: "hidden",
    }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={{ height: "100vh", position: "sticky", top: 0, flexShrink: 0 }} >
          <AdminSidebar />
        </div>
      )}

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99, backdropFilter: "blur(3px)" }}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "6px 0 28px rgba(0,0,0,0.14)",
        }}>
          <AdminSidebar onClose={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Mobile topbar */}
        {isMobile && (
          <div style={{
            background: "#fff", borderBottom: `1px solid ${T.border}`,
            padding: "10px 16px", display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
          }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ all: "unset", cursor: "pointer", padding: 7, borderRadius: 8, border: "1px solid #e5e7eb", color: "#64748b", lineHeight: 0 }}
            >
              <Menu size={18} />
            </button>
            <img src="/icon-192.png" alt="Nexus" style={{ height: 32, width: "auto", objectFit: "contain" }} />
            <div style={{ width: 36 }} />
          </div>
        )}

        {children}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd6fe; border-radius: 99px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .page-enter { animation: fadeIn 0.18s ease; }
      `}</style>
    </div>
  );
}