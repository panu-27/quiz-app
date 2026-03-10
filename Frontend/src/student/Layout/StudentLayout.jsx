import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, BookOpen, BarChart2, User as UserIcon, Plus, Check } from "lucide-react";

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hideForPdf, setHideForPdf] = useState(false);

  const isTestPage = location.pathname.includes("/test/");
  const isAnalysisPage = location.pathname.includes("/analytics");
  const isQuizFlow = location.pathname.includes("/student/quiz");
  const isQuizTest = location.pathname === "/student/quiztest";

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

  const showNavbar = isTestPage || isAnalysisPage || hideForPdf || isQuizTest;

  // ── Quiz flow state lifted into layout so the + button can read it ──
  // The quiz page sets these on window.__quizNav so the layout can read them
  // without prop-drilling through the router
  const [quizCanAdvance, setQuizCanAdvance] = useState(false);
  const [quizOnAdvance, setQuizOnAdvance] = useState(null);
  const [quizStep, setQuizStep]   = useState(null); // 'subject' | 'chapters' | 'overview' | 'test' | null

  useEffect(() => {
    // Poll for quiz nav state set by StudentQuizFlow
    const id = setInterval(() => {
      const qn = window.__quizNav;
      if (qn) {
        setQuizCanAdvance(qn.canAdvance ?? false);
        setQuizOnAdvance(() => qn.onAdvance ?? null);
        setQuizStep(qn.step ?? null);
      } else {
        setQuizCanAdvance(false);
        setQuizOnAdvance(null);
        setQuizStep(null);
      }
    }, 60);
    return () => clearInterval(id);
  }, []);

  // Clean up when leaving quiz
  useEffect(() => {
    if (!isQuizFlow) {
      window.__quizNav = null;
      setQuizCanAdvance(false);
      setQuizOnAdvance(null);
      setQuizStep(null);
    }
  }, [isQuizFlow]);

  const handlePlusClick = () => {
    if (isQuizFlow && quizCanAdvance && quizOnAdvance) {
      quizOnAdvance();
    } else if (!isQuizFlow) {
      navigate('/student/quiz');
    }
  };

  // During quiz test step, hide the + button
  const hidePlusBtn = quizStep === 'test';

  // Determine icon: + or ✓
  const showCheck = isQuizFlow && quizCanAdvance && quizStep !== null && quizStep !== 'test';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFF]">
      <main className="bg-white flex-1 z-50 pb-0">
        <Outlet />
      </main>

      {!showNavbar && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[4000] animate-in slide-in-from-bottom duration-300">

          {/* ── Floating Action Button ── */}
          {!hidePlusBtn && (
            <button
              onClick={handlePlusClick}
              style={{
                background: showCheck ? '#10B981' : '#4F46E5',
                transition: 'background 0.3s cubic-bezier(.22,1,.36,1), transform 0.15s ease',
              }}
              className="absolute left-1/2 -translate-x-1/2 -top-5 w-12 h-12
                rounded-full flex items-center justify-center
                text-white shadow-lg active:scale-90 z-50 overflow-hidden"
            >
              {/* Icon morphs between + and ✓ */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: showCheck ? 'rotate(0deg) scale(1)' : 'rotate(0deg) scale(1)',
                  transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
                }}
              >
                {showCheck
                  ? <Check className="w-5 h-5 stroke-[3]" />
                  : <Plus  className="w-7 h-7 stroke-[3]" />
                }
              </span>

              {/* Ripple on state change */}
              {showCheck && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    animation: 'qfl-ripple 0.4s ease-out forwards',
                  }}
                />
              )}
            </button>
          )}

          {/* ── Bottom Bar with Notch ── */}
          <div className="relative">
            <svg
              viewBox="0 0 400 80"
              className="w-full h-[70px] drop-shadow-[0_-15px_30px_rgba(79,70,229,0.07)]"
              preserveAspectRatio="none"
              fill="white"
            >
              <path d="M0,20 C0,10 10,0 20,0 H140 C155,0 165,2 170,10 C175,25 180,35 200,35 C220,35 225,25 230,10 C235,2 245,0 260,0 H380 C390,0 400,10 400,20 V80 H0 Z" />
            </svg>

            <nav className="absolute inset-0 flex items-center justify-between px-10 pb-2">
              <NavLink to="/student" end className={({ isActive }) =>
                `p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                <Home className="w-6 h-6 fill-current" />
              </NavLink>

              <NavLink to="/student/library" className={({ isActive }) =>
                `p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </NavLink>

              {/* Notch spacer */}
              <div className="w-14" />

              <NavLink to="/student/personal" className={({ isActive }) =>
                `p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                <BarChart2 className="w-6 h-6 stroke-[2.5]" />
              </NavLink>

              <NavLink to="/student/profile" className={({ isActive }) =>
                `p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                <UserIcon className="w-6 h-6 stroke-[2.5]" />
              </NavLink>
            </nav>
          </div>
        </div>
      )}

      {/* Ripple keyframe */}
      <style>{`
        @keyframes qfl-ripple {
          0%   { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}