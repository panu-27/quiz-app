import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Home, PlayCircle, Book, ScrollText, Zap, Bell } from "lucide-react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const STATUS_BAR_H = 28.5;

// ── Singleton: lives outside React, never cleaned up ──
let _statusBarInitialized = false;
let _currentShouldHide = false;

function initStatusBarListener() {
  if (_statusBarInitialized) return;
  if (!Capacitor.isNativePlatform()) return;
  _statusBarInitialized = true;

  App.addListener('resume', () => {
    if (_currentShouldHide) {
      StatusBar.hide().catch(() => { });
    } else {
      StatusBar.show().catch(() => { });
    }
  });
}

function applyStatusBar(shouldHide) {
  if (!Capacitor.isNativePlatform()) return;
  _currentShouldHide = shouldHide;
  if (shouldHide) {
    StatusBar.hide().catch(() => { });
  } else {
    StatusBar.show().catch(() => { });
  }
}

initStatusBarListener();

export default function StudentLayout() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const location = useLocation();
  const isDarkPage = isDark || location.pathname.startsWith('/student/qbank');
  const navigate = useNavigate();
  const [hideForPdf, setHideForPdf] = useState(false);

  // ── Mobile Detection Logic ──
  const [isMobile, setIsMobile] = useState(() =>
    window.innerWidth < 1024 &&
    window.matchMedia("(orientation: portrait)").matches
  );

  useEffect(() => {
    const update = () => {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      setIsMobile(window.innerWidth < 1024 && isPortrait);
    };
    window.addEventListener("resize", update);
    window.matchMedia("(orientation: portrait)").addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.matchMedia("(orientation: portrait)").removeEventListener("change", update);
    };
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = location.pathname === "/student/history" ? 104 : 20;
      setIsScrolled(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const isTestPage = location.pathname.includes("/test/");
  const isAnalysisPage = location.pathname.includes("/analytics");
  const isQuizTest = location.pathname === "/student/quiztest";
  const isQuizPage = location.pathname === "/student/quiz";
  const isPYQPage = location.pathname.startsWith('/student/pyq');
  const isProfilePage = location.pathname.startsWith('/student/profile');
  const isFeedbackPage = location.pathname === '/student/feedback';

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setHideForPdf(document.body.hasAttribute('data-hide-nav'));
    });
    observer.observe(document.body, { attributes: true });
    return () => {
      observer.disconnect();
      document.body.removeAttribute('data-hide-nav');
    };
  }, []);

  const isListedAttempts = location.pathname.startsWith('/student/listedattempts');
  const isPdfPage = location.pathname.startsWith('/student/pdf/');

  const isSettingsPages = [
    '/student/settings',
    '/student/delete-account',
    '/student/downloads',
    '/student/faqs',
    '/student/change-password',
    '/student/goal-selection',
    '/student/notices',
    '/student/privacy-policy',
    '/student/cookie-policy',
    '/student/refund-policy'
  ].includes(location.pathname);

  const showNavbar = isTestPage || isAnalysisPage || hideForPdf || isQuizTest || isQuizPage || isPYQPage || isProfilePage || isFeedbackPage || isListedAttempts || isPdfPage || isSettingsPages;
  const showChrome = isMobile && !showNavbar;
  const isDashboard =
    location.pathname === "/student" ||
    location.pathname === "/student/" ||
    location.pathname === "/student/history" ||
    location.pathname === "/student/notices" ||
    location.pathname === "/student/prime" ||
    location.pathname === "/student/library" ||
    location.pathname === "/student/quiz";

  // Status bar should only be hidden on test page and quiztest page
  const shouldHideStatusBar = isTestPage || isQuizTest || isPdfPage;

  // Handle status bar visibility based on route/mobile status
  useEffect(() => {
    applyStatusBar(!isMobile || shouldHideStatusBar);
  }, [isMobile, shouldHideStatusBar]);

  // Handle status bar icon/text style based on theme
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Light theme → dark icons (DARK style); Dark theme → light icons (LIGHT style)
    StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => { });
  }, [isDark]);

  // ── Android Back Button Handler ──
  // Capacitor passes { canGoBack } which reflects the WebView's actual history stack
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handlerRef = null;

    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        // Navigate back through React Router / WebView history
        window.history.back();
      } else {
        // No history left — exit the app
        App.exitApp();
      }
    }).then(h => { handlerRef = h; });

    return () => {
      handlerRef?.remove();
    };
  }, []);

  const selectedGoal = localStorage.getItem("selectedGoal");
  if (!selectedGoal && location.pathname !== "/student" && location.pathname !== "/student/" && location.pathname !== "/student/goal-selection") {
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFF]">

      <div className="flex flex-1 overflow-hidden relative">


        {/* ── Main Content Area ── */}
        <main className={`flex-1 bg-[#F8FAFF] dark:bg-[#0B121C] relative flex flex-col overflow-y-auto ${!showNavbar ? 'pb-20 lg:pb-0' : ''}`}>
          <Outlet />
        </main>

        {/* ── Bottom Navigation Bar (mobile/tablet only) ── */}
        {!showNavbar && (
          <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[4000] transition-colors duration-300 ${isDarkPage ? 'bg-[#0B121C]' : 'bg-white'}`}
            style={{ borderTop: isDarkPage ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)' }}
          >
            {user?.approved === false && (
              <div className="absolute bottom-full left-0 right-0 bg-gradient-to-r from-[#1EBA9B] to-[#25D3A4] text-white px-5 py-2.5 flex items-center justify-between shadow-[0_-4px_15px_rgba(30,186,155,0.2)]">
                <div className="flex flex-col">
                  <span className="font-bold text-[13px] leading-tight">Get access to all batches</span>
                  <span className="text-[13px] text-white/90 mt-0.5">Starts at ₹902/month</span>
                </div>
                <button
                  onClick={() => window.open('https://en.wikipedia.org', '_blank')}
                  className="bg-white text-[#1EBA9B] px-5 py-2 rounded-lg font-bold text-[13px] active:scale-95 transition-transform shadow-sm"
                >
                  Join Plus
                </button>
              </div>
            )}
            <nav className="flex items-center justify-around px-1 pt-3 pb-6">
              <NavTabBtn
                Icon={Home} label="Home"
                isActive={location.pathname === '/student' || location.pathname === '/student/'}
                isDark={isDarkPage} onClick={() => navigate('/student', { replace: true })} activeColor="#1EBA9B"
              />
              <NavTabBtn
                Icon={Zap} label="Prime"
                isActive={location.pathname === '/student/prime'}
                isDark={isDarkPage} onClick={() => navigate('/student/prime', { replace: true })} activeColor="#A855F7"
              />
              <NavTabBtn
                Icon={Book} label="QBank"
                isActive={location.pathname.startsWith('/student/qbank') || location.pathname.startsWith('/student/library') || location.pathname.startsWith('/student/pyq')}
                isDark={isDarkPage} onClick={() => navigate('/student/library', { replace: true })} activeColor="#6366F1"
              />
              <NavTabBtn
                Icon={ScrollText} label="Tests"
                isActive={location.pathname === '/student/history'}
                isDark={isDarkPage} onClick={() => navigate('/student/history', { replace: true })} activeColor="#3B82F6"
              />
              <NavTabBtn
                Icon={Bell} label="Updates"
                isActive={location.pathname === '/student/notices'}
                isDark={isDarkPage} onClick={() => navigate('/student/notices', { replace: true })} activeColor="#F59E0B"
              />
            </nav>
          </div>
        )}
      </div>

      <style>{`
        @keyframes qfl-ripple {
          0%   { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes tab-pop {
          0%   { transform: scale(0.85); }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .tab-active-pop {
          animation: tab-pop 0.25s cubic-bezier(.34,1.56,.64,1) forwards;
        }
      `}</style>
    </div>
  );
}

function NavTabBtn({ imgSrc, imgActiveSrc, Icon, label, isActive, isDark, onClick, activeColor, activeFilter }) {
  const src = isActive ? imgActiveSrc : imgSrc;
  const imgFilter = isActive
    ? activeFilter
    : (isDark ? 'brightness(0) invert(1)' : 'none');

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 min-w-[56px] relative"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="relative flex items-center justify-center w-12 h-8 transition-all duration-250">
        {Icon ? (
           <Icon size={isActive ? 24 : 22} color={isActive ? activeColor : (isDark ? '#fff' : '#000')} style={{ opacity: isActive ? 1 : 0.45, transition: 'all 0.2s ease' }} strokeWidth={isActive ? 2.5 : 2} />
        ) : (
          <img src={src} alt={label} width={isActive ? 31 : 26} height={isActive ? 31 : 26} style={{ filter: imgFilter, opacity: isActive ? 1 : (isDark ? 0.4 : 0.45), transition: 'opacity 0.2s ease, filter 0.2s ease, width 0.2s ease, height 0.2s ease' }} />
        )}
      </div>
      <span style={{ fontSize: '11px', fontWeight: isActive ? 700 : 500, color: isActive ? activeColor : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'), transition: 'color 0.2s ease', lineHeight: 1 }}>
        {label}
      </span>
    </button>
  );
}

function DesktopNavBtn({ Icon, label, isActive, onClick, activeColor }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
        isActive 
          ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
      }`}
    >
      {isActive && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${activeColor} rounded-r-full`} />
      )}
      <div className={`flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
      </div>
      <span className={`font-medium tracking-wide transition-all ${isActive ? 'font-semibold text-[15px]' : 'text-[15px]'}`}>
        {label}
      </span>
    </button>
  );
}

