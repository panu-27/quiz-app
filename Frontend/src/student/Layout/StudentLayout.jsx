import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Home, PlayCircle, Book, ScrollText, Zap } from "lucide-react";
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
    '/student/updates',
    '/student/faqs',
    '/student/change-password',
    '/student/goal-selection'
  ].includes(location.pathname);

  const showNavbar = isTestPage || isAnalysisPage || hideForPdf || isQuizTest || isQuizPage || isPYQPage || isProfilePage || isFeedbackPage || isListedAttempts || isPdfPage || isSettingsPages;
  const showChrome = isMobile && !showNavbar;
  const isDashboard =
    location.pathname === "/student" ||
    location.pathname === "/student/" ||
    location.pathname === "/student/history" ||
    location.pathname === "/student/learning" ||
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

      <main
        className="bg-white flex-1 z-50 pb-0"
      >
        <Outlet />
      </main>

      {/* ── Bottom Navigation Bar ── */}
      {showChrome && (
        <div className={`fixed bottom-0 left-0 right-0 z-[4000] transition-colors duration-300 ${isDarkPage ? 'bg-[#0B121C]' : 'bg-white'
          }`}
          style={{
            borderTop: isDarkPage ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
          }}
        >
          {/* ── Non-Approved Plus Banner ── */}
          {user?.approved === false && (
            <div className="absolute bottom-full left-0 right-0 bg-gradient-to-r from-[#1EBA9B] to-[#25D3A4] text-white px-5 py-2.5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-bold text-[13px] leading-tight">Get access to all the batches</span>
                <span className="text-[13px] text-white/90 mt-0.5">Starts at ₹902/month</span>
              </div>
              <button
                onClick={() => window.open('https://en.wikipedia.org', '_blank')}
                className="bg-white text-[#1EBA9B] px-5 py-2 rounded-sm font-bold text-[13px] active:scale-95 transition-transform"
              >
                Join Plus
              </button>
            </div>
          )}

          <nav className="flex items-center justify-around px-1 pt-3 pb-6">

            {/* Home */}
            <NavTabBtn
              imgSrc="/bottom/home.svg"
              imgActiveSrc="/bottom/home-active.svg"
              label="Home"
              isActive={location.pathname === '/student' || location.pathname === '/student/'}
              isDark={isDarkPage}
              onClick={() => navigate('/student')}
              activeColor="#1EBA9B"
              activeFilter="brightness(0) saturate(100%) invert(65%) sepia(40%) saturate(600%) hue-rotate(120deg) brightness(95%)"
            />

            {/* Prime */}
            <NavTabBtn
              imgSrc="/bottom/prime.svg"
              imgActiveSrc="/bottom/prime-active.svg"
              label="Prime"
              isActive={location.pathname === '/student/prime'}
              isDark={isDarkPage}
              onClick={() => navigate('/student/prime')}
              activeColor="#A855F7"
              activeFilter="brightness(0) saturate(100%) invert(48%) sepia(80%) saturate(2000%) hue-rotate(258deg) brightness(110%)"
            />

            {/* QBank */}
            <NavTabBtn
              imgSrc="/bottom/qbank.svg"
              imgActiveSrc="/bottom/qbank-active.svg"
              label="QBank"
              isActive={location.pathname.startsWith('/student/qbank') || location.pathname.startsWith('/student/library') || location.pathname.startsWith('/student/pyq')}
              isDark={isDarkPage}
              onClick={() => navigate('/student/library')}
              activeColor="#6366F1"
              activeFilter="brightness(0) saturate(100%) invert(42%) sepia(70%) saturate(1500%) hue-rotate(222deg) brightness(105%)"
            />

            {/* Tests */}
            <NavTabBtn
              imgSrc="/bottom/tests.svg"
              imgActiveSrc="/bottom/tests-active.svg"
              label="Tests"
              isActive={location.pathname === '/student/history'}
              isDark={isDarkPage}
              onClick={() => navigate('/student/history')}
              activeColor="#3B82F6"
              activeFilter="brightness(0) saturate(100%) invert(44%) sepia(90%) saturate(1500%) hue-rotate(210deg) brightness(105%)"
            />

            {/* My Learning */}
            <NavTabBtn
              imgSrc="/bottom/learning.svg"
              imgActiveSrc="/bottom/learning-active.svg"
              label="My Learning"
              isActive={location.pathname === '/student/learning'}
              isDark={isDarkPage}
              onClick={() => navigate('/student/learning')}
              activeColor="#1EBA9B"
              activeFilter="brightness(0) saturate(100%) invert(65%) sepia(40%) saturate(600%) hue-rotate(120deg) brightness(95%)"
            />

          </nav>
        </div>
      )}

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

function NavTabBtn({ imgSrc, imgActiveSrc, label, isActive, isDark, onClick, activeColor, activeFilter }) {
  const src = isActive ? imgActiveSrc : imgSrc;
  // Active: per-tab color. Inactive: dimmed white (dark) or dimmed black (light)
  const imgFilter = isActive
    ? activeFilter
    : (isDark ? 'brightness(0) invert(1)' : 'none');

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 min-w-[56px] relative"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Icon image */}
      <div
        className="relative flex items-center justify-center w-12 h-8 transition-all duration-250"
      >
        <img
          src={src}
          alt={label}
          width={isActive ? 31 : 26}
          height={isActive ? 31 : 26}
          style={{
            filter: imgFilter,
            opacity: isActive ? 1 : (isDark ? 0.4 : 0.45),
            transition: 'opacity 0.2s ease, filter 0.2s ease, width 0.2s ease, height 0.2s ease',
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: isActive ? 700 : 500,
          color: isActive
            ? activeColor
            : (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)'),
          transition: 'color 0.2s ease',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </button>
  );
}

